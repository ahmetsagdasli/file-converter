import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadArea } from "@/components/ui/upload-area";
import { FileList } from "@/components/ui/file-list";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ResultCard } from "@/components/ui/result-card";
import { useTranslation } from "@/lib/i18n";
import { api } from "@/lib/api";
import { Link } from "wouter";
import { ArrowLeft, RotateCw, ArrowRight, PlayIcon, RotateCcw, Loader2, CheckCircle, X, GripVertical, Trash2 } from "lucide-react";
import type { UploadedFile, ProcessedFile, ProcessingStatus } from "@/types";

interface PageItem {
  index: number;
  rotation: number;
  deleted: boolean;
}

export default function Reorder() {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [filename, setFilename] = useState("reordered_document.pdf");
  const [pages, setPages] = useState<PageItem[]>([]);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({
    status: 'idle',
    progress: 0,
    message: ''
  });
  const [result, setResult] = useState<ProcessedFile | null>(null);

  const reorderMutation = useMutation({
    mutationFn: api.reorderPages,
    onMutate: () => {
      setProcessingStatus({
        status: 'processing',
        progress: 0,
        message: 'Reordering pages...'
      });
    },
    onSuccess: (data) => {
      setProcessingStatus({
        status: 'completed',
        progress: 100,
        message: 'Reordering completed!'
      });
      setResult(data);
    },
    onError: (error) => {
      setProcessingStatus({
        status: 'error',
        progress: 0,
        message: `Error: ${error.message}`
      });
    }
  });

  const handleFilesUploaded = (uploadedFiles: UploadedFile[]) => {
    setFiles(uploadedFiles);
    // Initialize pages array (simulate 10 pages for demo)
    const initialPages: PageItem[] = Array.from({ length: 10 }, (_, index) => ({
      index,
      rotation: 0,
      deleted: false
    }));
    setPages(initialPages);
  };

  const handleRemoveFile = (id: string) => {
    setFiles([]);
    setPages([]);
  };

  const handlePageRotation = (pageIndex: number, rotation: number) => {
    setPages(prev => prev.map(page => 
      page.index === pageIndex 
        ? { ...page, rotation }
        : page
    ));
  };

  const handlePageDeletion = (pageIndex: number, deleted: boolean) => {
    setPages(prev => prev.map(page => 
      page.index === pageIndex 
        ? { ...page, deleted }
        : page
    ));
  };

  const handleStartProcessing = () => {
    if (files.length > 0) {
      const newOrder = pages.filter(p => !p.deleted).map(p => p.index);
      const rotations: Record<number, number> = {};
      const deletions: number[] = [];

      pages.forEach(page => {
        if (page.rotation !== 0) {
          rotations[page.index] = page.rotation;
        }
        if (page.deleted) {
          deletions.push(page.index);
        }
      });

      reorderMutation.mutate({
        file: files[0],
        newOrder,
        rotations: Object.keys(rotations).length > 0 ? rotations : undefined,
        deletions: deletions.length > 0 ? deletions : undefined,
        filename
      });
    }
  };

  const handleDownload = (url: string) => {
    window.open(url, '_blank');
  };

  const handleStartNew = () => {
    setCurrentStep(1);
    setFiles([]);
    setFilename("reordered_document.pdf");
    setPages([]);
    setProcessingStatus({ status: 'idle', progress: 0, message: '' });
    setResult(null);
  };

  const canContinueStep1 = files.length === 1;
  const canContinueStep2 = filename.trim().length > 0 && pages.some(p => !p.deleted);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="flex items-center mb-8">
          <Link href="/">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground" data-testid="back-button">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('actions.backToTools')}
            </Button>
          </Link>
        </div>

        {/* Tool Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <RotateCw className="h-8 w-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="tool-title">
            {t('tools.reorder.title')}
          </h1>
          <p className="text-muted-foreground" data-testid="tool-description">
            {t('tools.reorder.description')}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8" data-testid="step-indicator">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step, index) => (
              <div key={step} className="flex items-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    currentStep === step 
                      ? 'bg-primary text-primary-foreground' 
                      : currentStep > step 
                        ? 'bg-green-500 text-white'
                        : 'bg-muted text-muted-foreground'
                  }`}
                  data-testid={`step-${step}`}
                >
                  {currentStep > step ? <CheckCircle className="h-5 w-5" /> : step}
                </div>
                {index < 2 && (
                  <div className={`w-16 h-1 transition-colors ${currentStep > step ? 'bg-green-500' : 'bg-muted'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Upload File */}
        {currentStep === 1 && (
          <Card data-testid="step1">
            <CardContent className="p-8">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                Step 1: Upload PDF File
              </h2>
              
              <UploadArea
                onFilesUploaded={handleFilesUploaded}
                acceptedTypes={['.pdf']}
                maxFiles={1}
                maxFileSize={25 * 1024 * 1024}
                className="mb-6"
              />

              <FileList
                files={files}
                onRemoveFile={handleRemoveFile}
                showReorder={false}
              />

              {files.length > 0 && (
                <div className="flex justify-end mt-6">
                  <Button
                    onClick={() => setCurrentStep(2)}
                    disabled={!canContinueStep1}
                    data-testid="continue-step1"
                  >
                    {t('actions.continue')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 2: Configure Page Operations */}
        {currentStep === 2 && (
          <Card data-testid="step2">
            <CardContent className="p-8">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                Step 2: Reorder and Edit Pages
              </h2>
              
              <div className="space-y-6">
                {/* Page Editor */}
                <div>
                  <Label className="text-sm font-medium text-foreground mb-4 block">
                    Page Operations
                  </Label>
                  <div className="text-sm text-muted-foreground mb-4">
                    Drag pages to reorder, rotate, or delete them as needed.
                  </div>
                  
                  <div className="space-y-3 max-h-96 overflow-y-auto" data-testid="page-editor">
                    {pages.map((page) => (
                      <Card key={page.index} className={`${page.deleted ? 'opacity-50 bg-red-50' : 'bg-muted/50'}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center flex-1 min-w-0">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="mr-3 cursor-grab active:cursor-grabbing"
                                data-testid={`reorder-page-${page.index}`}
                              >
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                              </Button>
                              
                              <div className="w-12 h-16 bg-white border rounded flex items-center justify-center mr-4">
                                <span className="text-xs font-medium text-muted-foreground">
                                  Page {page.index + 1}
                                </span>
                              </div>
                              
                              <div className="min-w-0 flex-1">
                                <div className="font-medium text-foreground">
                                  Page {page.index + 1}
                                  {page.rotation !== 0 && ` (${page.rotation}°)`}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {page.deleted ? 'Marked for deletion' : 'Will be included'}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {/* Rotation Control */}
                              <Select
                                value={page.rotation.toString()}
                                onValueChange={(value) => handlePageRotation(page.index, parseInt(value))}
                                disabled={page.deleted}
                              >
                                <SelectTrigger className="w-20" data-testid={`rotation-${page.index}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="0">0°</SelectItem>
                                  <SelectItem value="90">90°</SelectItem>
                                  <SelectItem value="180">180°</SelectItem>
                                  <SelectItem value="270">270°</SelectItem>
                                </SelectContent>
                              </Select>

                              {/* Delete Control */}
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  checked={page.deleted}
                                  onCheckedChange={(checked) => handlePageDeletion(page.index, checked as boolean)}
                                  data-testid={`delete-page-${page.index}`}
                                />
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Output Options */}
                <div>
                  <Label htmlFor="filename" className="text-sm font-medium text-foreground mb-3 block">
                    Output Filename
                  </Label>
                  <Input
                    id="filename"
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                    className="w-full"
                    data-testid="output-filename"
                  />
                </div>

                {/* Summary */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="text-sm">
                    <div className="font-medium text-foreground mb-2">Summary:</div>
                    <div className="text-muted-foreground space-y-1">
                      <div>• Total pages: {pages.length}</div>
                      <div>• Pages to keep: {pages.filter(p => !p.deleted).length}</div>
                      <div>• Pages to delete: {pages.filter(p => p.deleted).length}</div>
                      <div>• Pages with rotation: {pages.filter(p => p.rotation !== 0 && !p.deleted).length}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <Button
                  variant="ghost"
                  onClick={() => setCurrentStep(1)}
                  data-testid="back-step2"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Upload
                </Button>
                <Button
                  onClick={() => setCurrentStep(3)}
                  disabled={!canContinueStep2}
                  data-testid="start-processing"
                >
                  {t('actions.startProcessing')}
                  <PlayIcon className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Processing & Results */}
        {currentStep === 3 && (
          <Card data-testid="step3">
            <CardContent className="p-8">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                Step 3: Processing & Download
              </h2>
              
              {/* Processing Status */}
              <div className="text-center mb-8" data-testid="processing-status">
                {processingStatus.status === 'idle' || processingStatus.status === 'processing' ? (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                      <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Reordering pages...
                    </h3>
                    <p className="text-muted-foreground">
                      Applying page operations to your PDF
                    </p>
                    
                    <ProgressBar
                      value={processingStatus.progress}
                      text={processingStatus.message}
                      className="max-w-md mx-auto"
                    />
                  </div>
                ) : processingStatus.status === 'completed' ? (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Reordering Completed!
                    </h3>
                    <p className="text-muted-foreground">
                      Your PDF has been reordered with all applied changes
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                      <X className="h-8 w-8 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Processing Failed
                    </h3>
                    <p className="text-red-600">
                      {processingStatus.message}
                    </p>
                  </div>
                )}
              </div>

              {/* Download Section */}
              {result && processingStatus.status === 'completed' && (
                <div className="mb-6">
                  <ResultCard result={result} onDownload={handleDownload} />
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between">
                <Button
                  variant="ghost"
                  onClick={() => setCurrentStep(2)}
                  disabled={processingStatus.status === 'processing'}
                  data-testid="back-step3"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Configure
                </Button>
                <Button
                  onClick={processingStatus.status === 'idle' ? handleStartProcessing : handleStartNew}
                  disabled={processingStatus.status === 'processing'}
                  data-testid="process-another"
                >
                  {processingStatus.status === 'idle' ? (
                    <>
                      {t('actions.startProcessing')}
                      <PlayIcon className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Process Another File
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
