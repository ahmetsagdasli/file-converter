import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadArea } from "@/components/ui/upload-area";
import { FileList } from "@/components/ui/file-list";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ResultCard } from "@/components/ui/result-card";
import { useTranslation } from "@/lib/i18n";
import { api } from "@/lib/api";
import { Link } from "wouter";
import { ArrowLeft, FileText, ArrowRight, PlayIcon, RotateCcw, Loader2, CheckCircle, X } from "lucide-react";
import type { UploadedFile, ProcessedFile, ProcessingStatus } from "@/types";

const steps = [1, 2, 3];

export default function Merge() {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [filename, setFilename] = useState("merged_document.pdf");
  const [pageRanges, setPageRanges] = useState<Record<string, string>>({});
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({
    status: 'idle',
    progress: 0,
    message: ''
  });
  const [result, setResult] = useState<ProcessedFile | null>(null);

  const mergeMutation = useMutation({
    mutationFn: api.mergePDFs,
    onMutate: () => {
      setProcessingStatus({
        status: 'processing',
        progress: 0,
        message: 'Starting merge...'
      });
    },
    onSuccess: (data) => {
      setProcessingStatus({
        status: 'completed',
        progress: 100,
        message: 'Merge completed!'
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
  };

  const handleRemoveFile = (id: string) => {
    setFiles(files.filter(f => f.id !== id));
  };

  const handleReorderFiles = (reorderedFiles: UploadedFile[]) => {
    setFiles(reorderedFiles);
  };

  const handlePageRangeChange = (fileIndex: string, range: string) => {
    setPageRanges(prev => ({
      ...prev,
      [fileIndex]: range
    }));
  };

  const handleStartProcessing = () => {
    mergeMutation.mutate({
      files,
      filename,
      pageRanges: Object.keys(pageRanges).length > 0 ? pageRanges : undefined
    });
  };

  const handleDownload = (url: string) => {
    window.open(url, '_blank');
  };

  const handleStartNew = () => {
    setCurrentStep(1);
    setFiles([]);
    setFilename("merged_document.pdf");
    setPageRanges({});
    setProcessingStatus({ status: 'idle', progress: 0, message: '' });
    setResult(null);
  };

  const canContinueStep1 = files.length >= 2;
  const canContinueStep2 = filename.trim().length > 0;

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
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="tool-title">
            {t('tools.merge.title')}
          </h1>
          <p className="text-muted-foreground" data-testid="tool-description">
            {t('tools.merge.description')}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8" data-testid="step-indicator">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => (
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
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 transition-colors ${currentStep > step ? 'bg-green-500' : 'bg-muted'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Labels */}
        <div className="flex justify-between text-center mb-12 max-w-md mx-auto">
          <div className="text-sm">
            <div className={`font-medium ${currentStep === 1 ? 'text-primary' : currentStep > 1 ? 'text-green-600' : 'text-muted-foreground'}`}>
              {t('steps.upload')}
            </div>
            <div className="text-muted-foreground">Select files</div>
          </div>
          <div className="text-sm">
            <div className={`font-medium ${currentStep === 2 ? 'text-primary' : currentStep > 2 ? 'text-green-600' : 'text-muted-foreground'}`}>
              {t('steps.configure')}
            </div>
            <div className="text-muted-foreground">Set options</div>
          </div>
          <div className="text-sm">
            <div className={`font-medium ${currentStep === 3 ? 'text-primary' : 'text-muted-foreground'}`}>
              {t('steps.process')}
            </div>
            <div className="text-muted-foreground">Download result</div>
          </div>
        </div>

        {/* Step 1: Upload Files */}
        {currentStep === 1 && (
          <Card data-testid="step1">
            <CardContent className="p-8">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                Step 1: Upload PDF Files
              </h2>
              
              <UploadArea
                onFilesUploaded={handleFilesUploaded}
                acceptedTypes={['.pdf']}
                maxFiles={10}
                maxFileSize={25 * 1024 * 1024} // 25MB
                className="mb-6"
              />

              <FileList
                files={files}
                onRemoveFile={handleRemoveFile}
                onReorderFiles={handleReorderFiles}
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

        {/* Step 2: Configure Options */}
        {currentStep === 2 && (
          <Card data-testid="step2">
            <CardContent className="p-8">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                Step 2: Configure Merge Options
              </h2>
              
              <div className="space-y-6">
                {/* File Order */}
                <div>
                  <Label className="text-sm font-medium text-foreground mb-3 block">
                    File Order
                  </Label>
                  <div className="text-sm text-muted-foreground mb-4">
                    Drag files to reorder them in the final merged document
                  </div>
                  <FileList
                    files={files}
                    onRemoveFile={handleRemoveFile}
                    onReorderFiles={handleReorderFiles}
                    showReorder={true}
                  />
                </div>

                {/* Page Range Options */}
                <div>
                  <Label className="text-sm font-medium text-foreground mb-3 block">
                    Page Ranges (Optional)
                  </Label>
                  <div className="text-sm text-muted-foreground mb-4">
                    Specify which pages to include from each file. Leave empty to include all pages.
                  </div>
                  
                  <div className="space-y-3">
                    {files.map((file, index) => (
                      <div key={file.id} className="flex items-center space-x-4">
                        <div className="flex-shrink-0 w-32">
                          <span className="text-sm font-medium text-foreground truncate block">
                            {file.name}
                          </span>
                        </div>
                        <Input
                          placeholder="e.g., 1-3,5,7-"
                          value={pageRanges[index.toString()] || ''}
                          onChange={(e) => handlePageRangeChange(index.toString(), e.target.value)}
                          className="flex-1"
                          data-testid={`page-range-${index}`}
                        />
                      </div>
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
                      {t('processing.title')}
                    </h3>
                    <p className="text-muted-foreground">
                      {t('processing.description')}
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
                      {t('processing.completed')}
                    </h3>
                    <p className="text-muted-foreground">
                      {t('processing.ready')}
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
