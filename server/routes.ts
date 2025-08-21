import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { PDFService } from "./services/pdfService";
import { DocumentService } from "./services/documentService";
import { z } from "zod";
import {
  mergeSchema,
  splitSchema,
  compressSchema,
  imageToPdfSchema,
  pdfToImageSchema,
  reorderSchema,
  wordToExcelSchema,
  excelToWordSchema,
  docToPdfSchema,
  excelToCsvSchema,
  csvToExcelSchema,
} from "@shared/schema";
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import archiver from 'archiver';

// Configure multer for file uploads
const upload = multer({ 
  dest: 'temp/uploads/',
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB
    files: 10
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.png', '.jpg', '.jpeg', '.doc', '.docx', '.xls', '.xlsx', '.csv'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});

const pdfService = new PDFService();
const documentService = new DocumentService();

export async function registerRoutes(app: Express): Promise<Server> {
  // Rate limiting middleware (simplified)
  const requestCounts = new Map<string, { count: number; resetTime: number }>();
  const RATE_LIMIT = 60; // requests per minute
  const BURST_LIMIT = 120;

  app.use((req, res, next) => {
    const ip = req.ip || 'unknown';
    const now = Date.now();
    const minute = Math.floor(now / 60000);
    
    const current = requestCounts.get(ip) || { count: 0, resetTime: minute };
    
    if (current.resetTime < minute) {
      current.count = 0;
      current.resetTime = minute;
    }
    
    current.count++;
    requestCounts.set(ip, current);
    
    if (current.count > BURST_LIMIT) {
      return res.status(429).json({ error: 'Too many requests' });
    }
    
    next();
  });

  // File upload endpoint
  app.post("/api/upload", upload.array('files', 10), async (req, res) => {
    try {
      if (!req.files || !Array.isArray(req.files)) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      const uploadedFiles = req.files.map(file => ({
        id: file.filename,
        name: file.originalname,
        size: file.size,
        type: file.mimetype,
        path: file.path
      }));

      res.json({ files: uploadedFiles });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Failed to upload files" });
    }
  });

  // PDF Merge endpoint
  app.post("/api/merge", async (req, res) => {
    try {
      const validatedData = mergeSchema.parse(req.body);
      
      // Map file IDs to actual file paths
      const filePaths = validatedData.files.map(fileId => 
        path.join(process.cwd(), 'temp/uploads', fileId)
      );
      
      // Verify all files exist
      for (const filePath of filePaths) {
        try {
          await fs.access(filePath);
        } catch {
          return res.status(400).json({ error: `File not found: ${path.basename(filePath)}` });
        }
      }
      
      // Merge PDFs
      const outputPath = await pdfService.mergePDFs(filePaths, validatedData.pageRanges);
      const stats = await fs.stat(outputPath);
      const filename = validatedData.filename || 'merged_document.pdf';
      
      const processedFile = await storage.createProcessedFile({
        originalName: filename,
        processedName: filename,
        fileSize: stats.size,
        operation: 'merge',
        status: 'completed',
        downloadUrl: `/api/download/${path.basename(outputPath)}`,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        metadata: { inputFiles: validatedData.files.length },
      });

      // Clean up input files
      for (const filePath of filePaths) {
        await pdfService.cleanupFile(filePath);
      }
      
      res.json({
        id: processedFile.id,
        filename: processedFile.processedName,
        size: processedFile.fileSize,
        downloadUrl: processedFile.downloadUrl,
        expiresAt: processedFile.expiresAt,
      });
      
    } catch (error) {
      console.error("Merge error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to merge PDFs" });
    }
  });

  // PDF Split endpoint
  app.post("/api/split", async (req, res) => {
    try {
      const validatedData = splitSchema.parse(req.body);
      
      const inputPath = path.join(process.cwd(), 'temp/uploads', validatedData.file);
      
      // Verify file exists
      try {
        await fs.access(inputPath);
      } catch {
        return res.status(400).json({ error: "Input file not found" });
      }
      
      const outputPaths = await pdfService.splitPDF(inputPath, validatedData.ranges);
      
      // Create ZIP file with all split PDFs
      const zipPath = `temp/split_${Date.now()}.zip`;
      const output = require('fs').createWriteStream(zipPath);
      const archive = archiver('zip');
      
      await new Promise<void>((resolve, reject) => {
        output.on('close', resolve);
        output.on('error', reject);
        archive.on('error', reject);
        
        archive.pipe(output);
        for (let i = 0; i < outputPaths.length; i++) {
          archive.file(outputPaths[i], { name: `split_${i + 1}.pdf` });
        }
        archive.finalize();
      });
      
      const stats = await fs.stat(zipPath);
      const processedFile = await storage.createProcessedFile({
        originalName: path.basename(validatedData.file),
        processedName: validatedData.filename || 'split_documents.zip',
        fileSize: stats.size,
        operation: 'split',
        status: 'completed',
        downloadUrl: `/api/download/${path.basename(zipPath)}`,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        metadata: { ranges: validatedData.ranges },
      });
      
      res.json({
        id: processedFile.id,
        filename: processedFile.processedName,
        size: processedFile.fileSize,
        downloadUrl: processedFile.downloadUrl,
        expiresAt: processedFile.expiresAt,
      });
      
      // Clean up
      await pdfService.cleanupFile(inputPath);
      for (const outputPath of outputPaths) {
        await pdfService.cleanupFile(outputPath);
      }
      
    } catch (error) {
      console.error("Split error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to split PDF" });
    }
  });

  // PDF Compress endpoint
  app.post("/api/compress", async (req, res) => {
    try {
      const validatedData = compressSchema.parse(req.body);
      
      const inputPath = path.join(process.cwd(), 'temp/uploads', validatedData.file);
      
      try {
        await fs.access(inputPath);
      } catch {
        return res.status(400).json({ error: "Input file not found" });
      }
      
      const outputPath = await pdfService.compressPDF(inputPath, validatedData.level);
      const stats = await fs.stat(outputPath);
      
      const processedFile = await storage.createProcessedFile({
        originalName: path.basename(validatedData.file),
        processedName: validatedData.filename || 'compressed_document.pdf',
        fileSize: stats.size,
        operation: 'compress',
        status: 'completed',
        downloadUrl: `/api/download/${path.basename(outputPath)}`,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        metadata: { level: validatedData.level },
      });
      
      res.json({
        id: processedFile.id,
        filename: processedFile.processedName,
        size: processedFile.fileSize,
        downloadUrl: processedFile.downloadUrl,
        expiresAt: processedFile.expiresAt,
      });
      
      await pdfService.cleanupFile(inputPath);
      
    } catch (error) {
      console.error("Compress error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to compress PDF" });
    }
  });

  // Image to PDF endpoint
  app.post("/api/image-to-pdf", async (req, res) => {
    try {
      const validatedData = imageToPdfSchema.parse(req.body);
      
      const filePaths = validatedData.files.map(fileId => 
        path.join(process.cwd(), 'temp/uploads', fileId)
      );
      
      // Verify all files exist
      for (const filePath of filePaths) {
        try {
          await fs.access(filePath);
        } catch {
          return res.status(400).json({ error: `File not found: ${path.basename(filePath)}` });
        }
      }
      
      const outputPath = await pdfService.imagesToPDF(filePaths);
      const stats = await fs.stat(outputPath);
      
      const processedFile = await storage.createProcessedFile({
        originalName: 'images',
        processedName: validatedData.filename || 'images_to_pdf.pdf',
        fileSize: stats.size,
        operation: 'image-to-pdf',
        status: 'completed',
        downloadUrl: `/api/download/${path.basename(outputPath)}`,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        metadata: { inputImages: validatedData.files.length },
      });
      
      res.json({
        id: processedFile.id,
        filename: processedFile.processedName,
        size: processedFile.fileSize,
        downloadUrl: processedFile.downloadUrl,
        expiresAt: processedFile.expiresAt,
      });
      
      for (const filePath of filePaths) {
        await pdfService.cleanupFile(filePath);
      }
      
    } catch (error) {
      console.error("Image to PDF error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to convert images to PDF" });
    }
  });

  // PDF to Image endpoint
  app.post("/api/pdf-to-image", async (req, res) => {
    try {
      const validatedData = pdfToImageSchema.parse(req.body);
      
      const inputPath = path.join(process.cwd(), 'temp/uploads', validatedData.file);
      
      try {
        await fs.access(inputPath);
      } catch {
        return res.status(400).json({ error: "Input file not found" });
      }
      
      const outputPaths = await pdfService.pdfToImages(inputPath, validatedData.dpi, validatedData.format);
      
      // Create ZIP file
      const zipPath = `temp/pdf_to_images_${Date.now()}.zip`;
      const output = require('fs').createWriteStream(zipPath);
      const archive = archiver('zip');
      
      await new Promise<void>((resolve, reject) => {
        output.on('close', resolve);
        output.on('error', reject);
        archive.on('error', reject);
        
        archive.pipe(output);
        for (let i = 0; i < outputPaths.length; i++) {
          archive.file(outputPaths[i], { name: `page_${i + 1}.${validatedData.format}` });
        }
        archive.finalize();
      });
      
      const stats = await fs.stat(zipPath);
      const processedFile = await storage.createProcessedFile({
        originalName: path.basename(validatedData.file),
        processedName: `images.zip`,
        fileSize: stats.size,
        operation: 'pdf-to-image',
        status: 'completed',
        downloadUrl: `/api/download/${path.basename(zipPath)}`,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        metadata: { dpi: validatedData.dpi, format: validatedData.format },
      });
      
      res.json({
        id: processedFile.id,
        filename: processedFile.processedName,
        size: processedFile.fileSize,
        downloadUrl: processedFile.downloadUrl,
        expiresAt: processedFile.expiresAt,
      });
      
      await pdfService.cleanupFile(inputPath);
      for (const outputPath of outputPaths) {
        await pdfService.cleanupFile(outputPath);
      }
      
    } catch (error) {
      console.error("PDF to image error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to convert PDF to images" });
    }
  });

  // Reorder Pages endpoint
  app.post("/api/reorder", async (req, res) => {
    try {
      const validatedData = reorderSchema.parse(req.body);
      
      const inputPath = path.join(process.cwd(), 'temp/uploads', validatedData.file);
      
      try {
        await fs.access(inputPath);
      } catch {
        return res.status(400).json({ error: "Input file not found" });
      }
      
      const outputPath = await pdfService.reorderPages(
        inputPath,
        validatedData.newOrder,
        validatedData.rotations,
        validatedData.deletions
      );
      
      const stats = await fs.stat(outputPath);
      
      const processedFile = await storage.createProcessedFile({
        originalName: path.basename(validatedData.file),
        processedName: validatedData.filename || 'reordered_document.pdf',
        fileSize: stats.size,
        operation: 'reorder',
        status: 'completed',
        downloadUrl: `/api/download/${path.basename(outputPath)}`,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        metadata: { 
          newOrder: validatedData.newOrder,
          rotations: validatedData.rotations,
          deletions: validatedData.deletions
        },
      });
      
      res.json({
        id: processedFile.id,
        filename: processedFile.processedName,
        size: processedFile.fileSize,
        downloadUrl: processedFile.downloadUrl,
        expiresAt: processedFile.expiresAt,
      });
      
      await pdfService.cleanupFile(inputPath);
      
    } catch (error) {
      console.error("Reorder error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to reorder PDF pages" });
    }
  });

  // Download processed file endpoint
  app.get("/api/download/:filename", async (req, res) => {
    try {
      const filename = req.params.filename;
      const filePath = path.join(process.cwd(), 'temp', filename);
      
      try {
        await fs.access(filePath);
      } catch {
        return res.status(404).json({ error: "File not found or expired" });
      }
      
      const stats = await fs.stat(filePath);
      
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Length', stats.size);
      
      const fileStream = require('fs').createReadStream(filePath);
      fileStream.pipe(res);
      
      // Clean up file after download (with delay to ensure completion)
      setTimeout(async () => {
        try {
          await pdfService.cleanupFile(filePath);
        } catch (error) {
          console.error('Error cleaning up downloaded file:', error);
        }
      }, 5000);
      
    } catch (error) {
      console.error("Download error:", error);
      res.status(500).json({ error: "Failed to download file" });
    }
  });

  // Word to Excel conversion endpoint
  app.post("/api/word-to-excel", async (req, res) => {
    try {
      const validatedData = wordToExcelSchema.parse(req.body);
      
      const inputPath = path.join(process.cwd(), 'temp/uploads', validatedData.file);
      
      try {
        await fs.access(inputPath);
      } catch {
        return res.status(400).json({ error: "Input file not found" });
      }
      
      const outputPath = await documentService.convertWordToExcel(inputPath);
      const stats = await fs.stat(outputPath);
      
      const processedFile = await storage.createProcessedFile({
        originalName: path.basename(validatedData.file),
        processedName: validatedData.filename || 'converted_document.xlsx',
        fileSize: stats.size,
        operation: 'word-to-excel',
        status: 'completed',
        downloadUrl: `/api/download/${path.basename(outputPath)}`,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        metadata: { conversionType: 'word-to-excel' },
      });
      
      res.json({
        id: processedFile.id,
        filename: processedFile.processedName,
        size: processedFile.fileSize,
        downloadUrl: processedFile.downloadUrl,
        expiresAt: processedFile.expiresAt,
      });
      
      await documentService.cleanupFile(inputPath);
      
    } catch (error) {
      console.error("Word to Excel error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to convert Word to Excel" });
    }
  });

  // Excel to Word conversion endpoint
  app.post("/api/excel-to-word", async (req, res) => {
    try {
      const validatedData = excelToWordSchema.parse(req.body);
      
      const inputPath = path.join(process.cwd(), 'temp/uploads', validatedData.file);
      
      try {
        await fs.access(inputPath);
      } catch {
        return res.status(400).json({ error: "Input file not found" });
      }
      
      const outputPath = await documentService.convertExcelToWord(inputPath);
      const stats = await fs.stat(outputPath);
      
      const processedFile = await storage.createProcessedFile({
        originalName: path.basename(validatedData.file),
        processedName: validatedData.filename || 'converted_document.html',
        fileSize: stats.size,
        operation: 'excel-to-word',
        status: 'completed',
        downloadUrl: `/api/download/${path.basename(outputPath)}`,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        metadata: { conversionType: 'excel-to-word' },
      });
      
      res.json({
        id: processedFile.id,
        filename: processedFile.processedName,
        size: processedFile.fileSize,
        downloadUrl: processedFile.downloadUrl,
        expiresAt: processedFile.expiresAt,
      });
      
      await documentService.cleanupFile(inputPath);
      
    } catch (error) {
      console.error("Excel to Word error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to convert Excel to Word" });
    }
  });

  // Document to PDF conversion endpoint
  app.post("/api/doc-to-pdf", async (req, res) => {
    try {
      const validatedData = docToPdfSchema.parse(req.body);
      
      const inputPath = path.join(process.cwd(), 'temp/uploads', validatedData.file);
      
      try {
        await fs.access(inputPath);
      } catch {
        return res.status(400).json({ error: "Input file not found" });
      }
      
      const outputPath = await documentService.convertDocToPdf(inputPath);
      const stats = await fs.stat(outputPath);
      
      const processedFile = await storage.createProcessedFile({
        originalName: path.basename(validatedData.file),
        processedName: validatedData.filename || 'converted_document.html',
        fileSize: stats.size,
        operation: 'doc-to-pdf',
        status: 'completed',
        downloadUrl: `/api/download/${path.basename(outputPath)}`,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        metadata: { conversionType: 'doc-to-pdf' },
      });
      
      res.json({
        id: processedFile.id,
        filename: processedFile.processedName,
        size: processedFile.fileSize,
        downloadUrl: processedFile.downloadUrl,
        expiresAt: processedFile.expiresAt,
      });
      
      await documentService.cleanupFile(inputPath);
      
    } catch (error) {
      console.error("Document to PDF error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to convert document to PDF" });
    }
  });

  // Excel to CSV conversion endpoint
  app.post("/api/excel-to-csv", async (req, res) => {
    try {
      const validatedData = excelToCsvSchema.parse(req.body);
      
      const inputPath = path.join(process.cwd(), 'temp/uploads', validatedData.file);
      
      try {
        await fs.access(inputPath);
      } catch {
        return res.status(400).json({ error: "Input file not found" });
      }
      
      const outputPath = await documentService.convertExcelToCsv(inputPath);
      const stats = await fs.stat(outputPath);
      
      const processedFile = await storage.createProcessedFile({
        originalName: path.basename(validatedData.file),
        processedName: validatedData.filename || 'converted_data.csv',
        fileSize: stats.size,
        operation: 'excel-to-csv',
        status: 'completed',
        downloadUrl: `/api/download/${path.basename(outputPath)}`,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        metadata: { conversionType: 'excel-to-csv' },
      });
      
      res.json({
        id: processedFile.id,
        filename: processedFile.processedName,
        size: processedFile.fileSize,
        downloadUrl: processedFile.downloadUrl,
        expiresAt: processedFile.expiresAt,
      });
      
      await documentService.cleanupFile(inputPath);
      
    } catch (error) {
      console.error("Excel to CSV error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to convert Excel to CSV" });
    }
  });

  // CSV to Excel conversion endpoint
  app.post("/api/csv-to-excel", async (req, res) => {
    try {
      const validatedData = csvToExcelSchema.parse(req.body);
      
      const inputPath = path.join(process.cwd(), 'temp/uploads', validatedData.file);
      
      try {
        await fs.access(inputPath);
      } catch {
        return res.status(400).json({ error: "Input file not found" });
      }
      
      const outputPath = await documentService.convertCsvToExcel(inputPath);
      const stats = await fs.stat(outputPath);
      
      const processedFile = await storage.createProcessedFile({
        originalName: path.basename(validatedData.file),
        processedName: validatedData.filename || 'converted_data.xlsx',
        fileSize: stats.size,
        operation: 'csv-to-excel',
        status: 'completed',
        downloadUrl: `/api/download/${path.basename(outputPath)}`,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        metadata: { conversionType: 'csv-to-excel' },
      });
      
      res.json({
        id: processedFile.id,
        filename: processedFile.processedName,
        size: processedFile.fileSize,
        downloadUrl: processedFile.downloadUrl,
        expiresAt: processedFile.expiresAt,
      });
      
      await documentService.cleanupFile(inputPath);
      
    } catch (error) {
      console.error("CSV to Excel error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to convert CSV to Excel" });
    }
  });

  // Cleanup job endpoint (called by background worker)
  app.post("/api/cleanup", async (req, res) => {
    try {
      const expiredFiles = await storage.getExpiredFiles();
      let cleanedCount = 0;
      
      for (const file of expiredFiles) {
        await storage.deleteProcessedFile(file.id);
        // Also clean up the actual file if it exists
        if (file.downloadUrl) {
          const filename = path.basename(file.downloadUrl);
          const filePath = path.join(process.cwd(), 'temp', filename);
          try {
            await pdfService.cleanupFile(filePath);
          } catch {
            // File might already be deleted, ignore error
          }
        }
        cleanedCount++;
      }
      
      res.json({ cleaned: cleanedCount });
    } catch (error) {
      console.error("Cleanup error:", error);
      res.status(500).json({ error: "Cleanup failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
