import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UploadArea } from "@/components/ui/upload-area";
import { FileList } from "@/components/ui/file-list";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ResultCard } from "@/components/ui/result-card";
import { useTranslation } from "@/lib/i18n";
import { api } from "@/lib/api";
import { Link } from "wouter";
import { ArrowLeft, Scissors, ArrowRight, PlayIcon, RotateCcw, Loader2, CheckCircle, X } from "lucide-react";
import type { UploadedFile, ProcessedFile, ProcessingStatus } from "@/types";

export default function Split() {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [ranges, setRanges] = useState("");
  const [filename, setFilename] = useState("split_documents.zip");
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({
    status: 'idle',
    progress: 0,
    message: ''
  });
  const [result, setResult] = useState<ProcessedFile | null>(null);

  const splitMutation = useMutation({
    mutationFn: api.splitPDF,
    onMutate: () => {
      setProcessingStatus({
        status: 'processing',
        progress: 0,
        message: 'Starting split...'
      });
    },
    onSuccess: (data) => {
      setProcessingStatus({
        status: 'completed',
        progress: 100,
        message: 'Split completed!'
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
    setFiles([]);
  };

  const handleStartProcessing = () => {
    if (files.length > 0) {
      splitMutation.mutate({
        file: files[0],
        ranges,
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
    setRanges("");
    setFilename("split_documents.zip");
    setProcessingStatus({ status: 'idle', progress: 0, message: '' });
    setResult(null);
  };

  const canContinueStep1 = files.length === 1;
  const canContinueStep2 = ranges.trim().length > 0 && filename.trim().length > 0;

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
          <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Scissors className="h-8 w-8 text-accent-600" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="tool-title">
            {t('tools.split.title')}
          </h1>
          <p className="text-muted-foreground" data-testid="tool-description">
            {t('tools.split.description')}
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

        {/* Step 2: Configure Split Options */}
        {currentStep === 2 && (
          <Card data-testid="step2">
            <CardContent className="p-8">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                Step 2: Configure Split Options
              </h2>
              
              <div className="space-y-6">
                {/* Page Ranges */}
                <div>
                  <Label htmlFor="ranges" className="text-sm font-medium text-foreground mb-3 block">
                    Page Ranges
                  </Label>
                  <div className="text-sm text-muted-foreground mb-4">
                    Specify page ranges to split. Use semicolons to separate multiple split points.<br/>
                    Examples: "1-3;4-6;7-" or "1,3,5;2,4,6" or "1-5;6-10;11-"
                  </div>
                  <Textarea
                    id="ranges"
                    placeholder="e.g., 1-3;4-6;7-"
                    value={ranges}
                    onChange={(e) => setRanges(e.target.value)}
                    className="w-full"
                    rows={3}
                    data-testid="page-ranges"
                  />
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

                {/* File Preview */}
                {files.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-foreground mb-3 block">
                      File to Split
                    </Label>
                    <FileList
                      files={files}
                      onRemoveFile={handleRemoveFile}
                      showReorder={false}
                    />
                  </div>
                )}
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
                      Processing your PDF...
                    </h3>
                    <p className="text-muted-foreground">
                      Splitting document into multiple files
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
                      Split Completed!
                    </h3>
                    <p className="text-muted-foreground">
                      Your PDF has been split and packaged into a ZIP file
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
