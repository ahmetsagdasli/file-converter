import XLSX from 'xlsx';
import mammoth from 'mammoth';
import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { stringify } from 'csv-stringify/sync';
import { parse } from 'csv-parse/sync';

export class DocumentService {
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

  async convertWordToExcel(filePath: string): Promise<string> {
    try {
      // Read the Word document
      const buffer = await fs.readFile(filePath);
      const result = await mammoth.extractRawText({ buffer });
      
      // Create a new Excel workbook
      const workbook = XLSX.utils.book_new();
      
      // Split text into lines and create worksheet data
      const lines = result.value.split('\n').filter(line => line.trim());
      const data = lines.map(line => [line]);
      
      // Add header
      data.unshift(['Content']);
      
      const worksheet = XLSX.utils.aoa_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Document Content');
      
      // Save as Excel file
      const outputPath = path.join(this.tempDir, `word_to_excel_${randomUUID()}.xlsx`);
      XLSX.writeFile(workbook, outputPath);
      
      return outputPath;
    } catch (error) {
      throw new Error(`Word to Excel conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async convertExcelToWord(filePath: string): Promise<string> {
    try {
      // Read Excel file
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      // Create simple HTML content from Excel data
      let htmlContent = '<html><body>';
      htmlContent += '<h1>Excel Data</h1>';
      htmlContent += '<table border="1" style="border-collapse: collapse; width: 100%;">';
      
      for (const row of jsonData as any[][]) {
        htmlContent += '<tr>';
        for (const cell of row) {
          htmlContent += `<td style="padding: 8px;">${cell || ''}</td>`;
        }
        htmlContent += '</tr>';
      }
      
      htmlContent += '</table></body></html>';
      
      // Save as HTML file (simple format that can be opened by Word)
      const outputPath = path.join(this.tempDir, `excel_to_word_${randomUUID()}.html`);
      await fs.writeFile(outputPath, htmlContent);
      
      return outputPath;
    } catch (error) {
      throw new Error(`Excel to Word conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async convertDocToPdf(filePath: string): Promise<string> {
    try {
      // Read the Word document
      const buffer = await fs.readFile(filePath);
      const result = await mammoth.extractRawText({ buffer });
      
      // Create simple HTML content
      const htmlContent = `
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
              p { margin-bottom: 16px; }
            </style>
          </head>
          <body>
            <div>${result.value.split('\n').map(line => `<p>${line}</p>`).join('')}</div>
          </body>
        </html>
      `;
      
      // For now, save as HTML (in production, you'd use a library like puppeteer to convert to PDF)
      const outputPath = path.join(this.tempDir, `doc_to_pdf_${randomUUID()}.html`);
      await fs.writeFile(outputPath, htmlContent);
      
      return outputPath;
    } catch (error) {
      throw new Error(`Document to PDF conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async convertExcelToCsv(filePath: string): Promise<string> {
    try {
      // Read Excel file
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON array
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      // Convert to CSV
      const csvContent = stringify(jsonData);
      
      // Save as CSV file
      const outputPath = path.join(this.tempDir, `excel_to_csv_${randomUUID()}.csv`);
      await fs.writeFile(outputPath, csvContent);
      
      return outputPath;
    } catch (error) {
      throw new Error(`Excel to CSV conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async convertCsvToExcel(filePath: string): Promise<string> {
    try {
      // Read CSV file
      const csvContent = await fs.readFile(filePath, 'utf8');
      
      // Parse CSV
      const records = parse(csvContent);
      
      // Create Excel workbook
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(records);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
      
      // Save as Excel file
      const outputPath = path.join(this.tempDir, `csv_to_excel_${randomUUID()}.xlsx`);
      XLSX.writeFile(workbook, outputPath);
      
      return outputPath;
    } catch (error) {
      throw new Error(`CSV to Excel conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async cleanupFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Error cleaning up file:', error);
    }
  }
}