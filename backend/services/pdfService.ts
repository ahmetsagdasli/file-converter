import { PDFDocument, degrees } from 'pdf-lib';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

export class PDFService {
  private tempDir = path.join(process.cwd(), 'temp');

  constructor() {
    this.ensureTempDir();
  }

  private async ensureTempDir() {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
      await fs.mkdir(path.join(this.tempDir, 'uploads'), { recursive: true });
    } catch (error) {
      console.error('Failed to create temp directory:', error);
    }
  }

  async mergePDFs(filePaths: string[], pageRanges?: Record<string, string>): Promise<string> {
    const mergedPdf = await PDFDocument.create();
    
    for (let i = 0; i < filePaths.length; i++) {
      const filePath = filePaths[i];
      const pdfBytes = await fs.readFile(filePath);
      const pdf = await PDFDocument.load(pdfBytes);
      
      let pagesToCopy: number[] = [];
      const pageRange = pageRanges?.[i.toString()];
      
      if (pageRange) {
        pagesToCopy = this.parsePageRange(pageRange, pdf.getPageCount());
      } else {
        pagesToCopy = Array.from({ length: pdf.getPageCount() }, (_, idx) => idx);
      }
      
      const copiedPages = await mergedPdf.copyPages(pdf, pagesToCopy);
      copiedPages.forEach(page => mergedPdf.addPage(page));
    }
    
    const outputPath = path.join(this.tempDir, `merged_${randomUUID()}.pdf`);
    const pdfBytes = await mergedPdf.save();
    await fs.writeFile(outputPath, pdfBytes);
    
    return outputPath;
  }

  async splitPDF(filePath: string, ranges: string): Promise<string[]> {
    const pdfBytes = await fs.readFile(filePath);
    const pdf = await PDFDocument.load(pdfBytes);
    const totalPages = pdf.getPageCount();
    
    const rangeGroups = this.parseRangeGroups(ranges, totalPages);
    const outputPaths: string[] = [];
    
    for (let i = 0; i < rangeGroups.length; i++) {
      const newPdf = await PDFDocument.create();
      const pagesToCopy = rangeGroups[i];
      
      const copiedPages = await newPdf.copyPages(pdf, pagesToCopy);
      copiedPages.forEach(page => newPdf.addPage(page));
      
      const outputPath = path.join(this.tempDir, `split_${i + 1}_${randomUUID()}.pdf`);
      const newPdfBytes = await newPdf.save();
      await fs.writeFile(outputPath, newPdfBytes);
      outputPaths.push(outputPath);
    }
    
    return outputPaths;
  }

  async compressPDF(filePath: string, level: 'balanced' | 'strong'): Promise<string> {
    const pdfBytes = await fs.readFile(filePath);
    const pdf = await PDFDocument.load(pdfBytes);
    
    // Note: pdf-lib doesn't have built-in compression
    // In a production environment, you'd use Ghostscript or similar
    // For now, we'll save with basic optimization
    const optimized = await pdf.save({
      useObjectStreams: level === 'strong',
      addDefaultPage: false,
    });
    
    const outputPath = path.join(this.tempDir, `compressed_${randomUUID()}.pdf`);
    await fs.writeFile(outputPath, optimized);
    
    return outputPath;
  }

  async imagesToPDF(imagePaths: string[]): Promise<string> {
    const pdf = await PDFDocument.create();
    
    for (const imagePath of imagePaths) {
      const imageBuffer = await fs.readFile(imagePath);
      const ext = path.extname(imagePath).toLowerCase();
      
      let image;
      if (ext === '.png') {
        image = await pdf.embedPng(imageBuffer);
      } else if (ext === '.jpg' || ext === '.jpeg') {
        image = await pdf.embedJpg(imageBuffer);
      } else {
        throw new Error(`Unsupported image format: ${ext}`);
      }
      
      const page = pdf.addPage([image.width, image.height]);
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height,
      });
    }
    
    const outputPath = path.join(this.tempDir, `images_to_pdf_${randomUUID()}.pdf`);
    const pdfBytes = await pdf.save();
    await fs.writeFile(outputPath, pdfBytes);
    
    return outputPath;
  }

  async pdfToImages(filePath: string, dpi: number = 150, format: 'png' | 'jpg' = 'png'): Promise<string[]> {
    const pdfBytes = await fs.readFile(filePath);
    const pdf = await PDFDocument.load(pdfBytes);
    const pageCount = pdf.getPageCount();
    const outputPaths: string[] = [];
    
    // Note: This is a simplified implementation
    // In production, you'd use pdf2pic, pdf-poppler, or similar library
    // For demo purposes, we'll create placeholder image files
    for (let i = 0; i < pageCount; i++) {
      const singlePagePdf = await PDFDocument.create();
      const [copiedPage] = await singlePagePdf.copyPages(pdf, [i]);
      singlePagePdf.addPage(copiedPage);
      
      // Create a placeholder image using Sharp
      // In a real implementation, you'd render the PDF page to an image
      const outputPath = path.join(this.tempDir, `page_${i + 1}_${randomUUID()}.${format}`);
      
      // Create a simple placeholder image with page number
      const width = Math.floor(595 * dpi / 72); // A4 width at given DPI
      const height = Math.floor(842 * dpi / 72); // A4 height at given DPI
      
      const image = sharp({
        create: {
          width,
          height,
          channels: format === 'png' ? 4 : 3,
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        }
      });
      
      if (format === 'png') {
        await image.png().toFile(outputPath);
      } else {
        await image.jpeg({ quality: 90 }).toFile(outputPath);
      }
      
      outputPaths.push(outputPath);
    }
    
    return outputPaths;
  }

  async reorderPages(filePath: string, newOrder: number[], rotations?: Record<number, number>, deletions?: number[]): Promise<string> {
    const pdfBytes = await fs.readFile(filePath);
    const pdf = await PDFDocument.load(pdfBytes);
    const newPdf = await PDFDocument.create();
    
    const pagesToKeep = newOrder.filter(pageIdx => !deletions?.includes(pageIdx));
    const copiedPages = await newPdf.copyPages(pdf, pagesToKeep);
    
    copiedPages.forEach((page, idx) => {
      const originalPageIdx = pagesToKeep[idx];
      const rotation = rotations?.[originalPageIdx] || 0;
      
      if (rotation !== 0) {
        page.setRotation(degrees(rotation));
      }
      
      newPdf.addPage(page);
    });
    
    const outputPath = path.join(this.tempDir, `reordered_${randomUUID()}.pdf`);
    const reorderedBytes = await newPdf.save();
    await fs.writeFile(outputPath, reorderedBytes);
    
    return outputPath;
  }

  async cleanupFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Error cleaning up file:', error);
    }
  }

  private parsePageRange(range: string, totalPages: number): number[] {
    const pages: number[] = [];
    const parts = range.split(',');
    
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.includes('-')) {
        const [start, end] = trimmed.split('-').map(s => s.trim());
        const startPage = start ? parseInt(start) - 1 : 0;
        const endPage = end ? parseInt(end) - 1 : totalPages - 1;
        
        for (let i = startPage; i <= Math.min(endPage, totalPages - 1); i++) {
          if (i >= 0) pages.push(i);
        }
      } else if (trimmed) {
        const page = parseInt(trimmed) - 1;
        if (page >= 0 && page < totalPages) {
          pages.push(page);
        }
      }
    }
    
    return pages;
  }

  private parseRangeGroups(ranges: string, totalPages: number): number[][] {
    const groups: number[][] = [];
    const parts = ranges.split(';');
    
    for (const part of parts) {
      if (part.trim()) {
        groups.push(this.parsePageRange(part.trim(), totalPages));
      }
    }
    
    return groups;
  }
}
