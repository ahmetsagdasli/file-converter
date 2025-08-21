import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, FileText, Clock } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import type { ProcessedFile } from "@/types";

interface ResultCardProps {
  result: ProcessedFile;
  onDownload: (url: string) => void;
}

export function ResultCard({ result, onDownload }: ResultCardProps) {
  const { t } = useTranslation();

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTimeUntilExpiry = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    return minutes > 0 ? `${minutes} minutes` : 'Expired';
  };

  return (
    <Card className="bg-green-50 border-green-200" data-testid="result-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1 min-w-0">
            <Download className="h-6 w-6 text-green-600 mr-4 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-foreground truncate" data-testid="result-filename">
                {result.filename}
              </h4>
              <div className="flex items-center text-sm text-muted-foreground space-x-4">
                <span data-testid="result-size">{formatFileSize(result.size)}</span>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span data-testid="result-expiry">
                    Expires in {getTimeUntilExpiry(result.expiresAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <Button
            onClick={() => onDownload(result.downloadUrl)}
            className="bg-green-600 hover:bg-green-700 text-white"
            data-testid="download-button"
          >
            <Download className="h-4 w-4 mr-2" />
            {t('actions.download')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
