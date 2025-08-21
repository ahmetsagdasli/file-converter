import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n";
import { CloudUpload } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UploadedFile } from "@/types";

interface UploadAreaProps {
  onFilesUploaded: (files: UploadedFile[]) => void;
  acceptedTypes: string[];
  maxFiles: number;
  maxFileSize: number;
  className?: string;
}

export function UploadArea({
  onFilesUploaded,
  acceptedTypes,
  maxFiles,
  maxFileSize,
  className
}: UploadAreaProps) {
  const { t } = useTranslation();
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      }
      return file.type.includes(type);
    })) {
      return `File type not supported. Accepted types: ${acceptedTypes.join(', ')}`;
    }
    if (file.size > maxFileSize) {
      return `File size too large. Maximum size: ${formatFileSize(maxFileSize)}`;
    }
    return null;
  };

  const handleFiles = useCallback(async (fileList: FileList) => {
    const files = Array.from(fileList);
    
    if (files.length > maxFiles) {
      alert(`Too many files selected. Maximum: ${maxFiles}`);
      return;
    }

    const validFiles: File[] = [];
    for (const file of files) {
      const error = validateFile(file);
      if (error) {
        alert(error);
        return;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      validFiles.forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      const uploadedFiles: UploadedFile[] = result.files.map((file: any) => ({
        id: file.id,
        name: file.name,
        size: file.size,
        type: file.type,
        url: file.id, // Use file ID as identifier for backend processing
      }));

      onFilesUploaded(uploadedFiles);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload files. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [acceptedTypes, maxFiles, maxFileSize, onFilesUploaded]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
      e.target.value = '';
    }
  }, [handleFiles]);

  return (
    <Card className={className}>
      <CardContent className="p-8">
        <div
          className={cn(
            "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer",
            isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25",
            isUploading && "pointer-events-none opacity-50"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          data-testid="upload-zone"
        >
          <input
            type="file"
            multiple={maxFiles > 1}
            accept={acceptedTypes.join(',')}
            onChange={handleFileInput}
            className="hidden"
            id="file-upload"
            data-testid="file-input"
          />
          
          <CloudUpload className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          
          <h3 className="text-lg font-medium text-foreground mb-2">
            {t('upload.dropFiles')}
          </h3>
          
          <p className="text-muted-foreground mb-4">
            {t('upload.limits')}
          </p>
          
          <Button
            onClick={() => document.getElementById('file-upload')?.click()}
            disabled={isUploading}
            data-testid="select-files-button"
          >
            {isUploading ? 'Uploading...' : t('upload.selectFiles')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
