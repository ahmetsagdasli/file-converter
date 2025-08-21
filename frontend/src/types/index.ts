export interface ToolConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  path: string;
}

export interface ProcessedFile {
  id: string;
  filename: string;
  size: number;
  downloadUrl: string;
  expiresAt: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export interface ProcessingStatus {
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  message: string;
}

export interface MergeOptions {
  files: UploadedFile[];
  filename?: string;
  pageRanges?: Record<string, string>;
}

export interface SplitOptions {
  file: UploadedFile;
  ranges: string;
  filename?: string;
}

export interface CompressOptions {
  file: UploadedFile;
  level: 'balanced' | 'strong';
  filename?: string;
}

export interface ImageToPdfOptions {
  files: UploadedFile[];
  filename?: string;
}

export interface PdfToImageOptions {
  file: UploadedFile;
  dpi: number;
  format: 'png' | 'jpg';
}

export interface ReorderOptions {
  file: UploadedFile;
  newOrder: number[];
  rotations?: Record<number, number>;
  deletions?: number[];
  filename?: string;
}

export interface WordToExcelOptions {
  file: string;
  filename?: string;
}

export interface ExcelToWordOptions {
  file: string;
  filename?: string;
}

export interface DocToPdfOptions {
  file: string;
  filename?: string;
}

export interface ExcelToCsvOptions {
  file: string;
  filename?: string;
}

export interface CsvToExcelOptions {
  file: string;
  filename?: string;
}
