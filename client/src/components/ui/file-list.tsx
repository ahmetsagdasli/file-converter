import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, GripVertical, FileText } from "lucide-react";
import type { UploadedFile } from "@/types";

interface FileListProps {
  files: UploadedFile[];
  onRemoveFile: (id: string) => void;
  onReorderFiles?: (files: UploadedFile[]) => void;
  showReorder?: boolean;
}

export function FileList({ files, onRemoveFile, onReorderFiles, showReorder = false }: FileListProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (files.length === 0) return null;

  return (
    <div className="space-y-3" data-testid="file-list">
      {files.map((file, index) => (
        <Card key={file.id} className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center flex-1 min-w-0">
                {showReorder && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mr-3 cursor-grab active:cursor-grabbing"
                    data-testid={`reorder-file-${index}`}
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                  </Button>
                )}
                
                <FileText className="h-5 w-5 text-destructive mr-3 flex-shrink-0" />
                
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-foreground truncate" data-testid={`file-name-${index}`}>
                    {file.name}
                  </div>
                  <div className="text-sm text-muted-foreground" data-testid={`file-size-${index}`}>
                    {formatFileSize(file.size)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {showReorder && (
                  <div className="text-sm text-muted-foreground">
                    {index === 0 ? 'First' : index === files.length - 1 ? 'Last' : `Position ${index + 1}`}
                  </div>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveFile(file.id)}
                  className="text-destructive hover:text-destructive"
                  data-testid={`remove-file-${index}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
