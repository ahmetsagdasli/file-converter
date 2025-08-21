import { apiRequest } from "./queryClient";
import type {
  MergeOptions,
  SplitOptions,
  CompressOptions,
  ImageToPdfOptions,
  PdfToImageOptions,
  ReorderOptions,
  ProcessedFile,
} from "../types";

export const api = {
  // Upload files
  uploadFiles: async (files: File[]): Promise<{ files: any[] }> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return response.json();
  },

  // PDF operations
  mergePDFs: async (options: MergeOptions): Promise<ProcessedFile> => {
    const response = await apiRequest("POST", "/api/merge", {
      files: options.files.map(f => f.id), // Use file IDs instead of URLs
      filename: options.filename,
      pageRanges: options.pageRanges,
    });
    return response.json();
  },

  splitPDF: async (options: SplitOptions): Promise<ProcessedFile> => {
    const response = await apiRequest("POST", "/api/split", {
      file: options.file.id, // Use file ID instead of URL
      ranges: options.ranges,
      filename: options.filename,
    });
    return response.json();
  },

  compressPDF: async (options: CompressOptions): Promise<ProcessedFile> => {
    const response = await apiRequest("POST", "/api/compress", {
      file: options.file.id, // Use file ID instead of URL
      level: options.level,
      filename: options.filename,
    });
    return response.json();
  },

  imagesToPDF: async (options: ImageToPdfOptions): Promise<ProcessedFile> => {
    const response = await apiRequest("POST", "/api/image-to-pdf", {
      files: options.files.map(f => f.id), // Use file IDs instead of URLs
      filename: options.filename,
    });
    return response.json();
  },

  pdfToImages: async (options: PdfToImageOptions): Promise<ProcessedFile> => {
    const response = await apiRequest("POST", "/api/pdf-to-image", {
      file: options.file.id, // Use file ID instead of URL
      dpi: options.dpi,
      format: options.format,
    });
    return response.json();
  },

  reorderPages: async (options: ReorderOptions): Promise<ProcessedFile> => {
    const response = await apiRequest("POST", "/api/reorder", {
      file: options.file.id, // Use file ID instead of URL
      newOrder: options.newOrder,
      rotations: options.rotations,
      deletions: options.deletions,
      filename: options.filename,
    });
    return response.json();
  },
};
