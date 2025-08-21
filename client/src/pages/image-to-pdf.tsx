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
import { ArrowLeft, Image, ArrowRight, PlayIcon, RotateCcw, Loader2, CheckCircle, X } from "lucide-react";
import type { UploadedFile, ProcessedFile, ProcessingStatus } from "@/types";

export default function ImageToPdf() {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [filename, setFilename] = useState("images_to_pdf.pdf");
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({
    status: 'idle',
    progress: 0,
    message: ''
  });
  const [result, setResult] = useState<ProcessedFile | null>(null);

  const imageToPdfMutation = useMutation({
    mutationFn: api.imagesToPDF,
    onMutate: () => {
      setProcessingStatus({
        status: 'processing',
        progress: 0,
        message: 'Converting images to PDF...'
      });
    },
    onSuccess: (data) => {
      setProcessingStatus({
        status: 'completed',
        progress: 100,
        message: 'Conversion completed!'
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

  const handleStartProcessing = () => {
    imageToPdfMutation.mutate({
      files,
      filename
    });
  };

  const handleDownload = (url: string) => {
    window.open(url, '_blank');
  };

  const handleStartNew = () => {
    setCurrentStep(1);
    setFiles([]);
    setFilename("images_to_pdf.pdf");
    setProcessingStatus({ status: 'idle', progress: 0, message: '' });
    setResult(null);
  };

  const canContinueStep1 = files.length >= 1;
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
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Image className="h-8 w-8 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="tool-title">
            {t('tools.imageToPdf.title')}
          </h1>
          <p className="text-muted-foreground" data-testid="tool-description">
            {t('tools.imageToPdf.description')}
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

        {/* Step 1: Upload Images */}
        {currentStep === 1 && (
          <Card data-testid="step1">
            <CardContent className="p-8">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                Step 1: Upload Image Files
              </h2>
              
              <UploadArea
                onFilesUploaded={handleFilesUploaded}
                acceptedTypes={['.png', '.jpg', '.jpeg']}
                maxFiles={10}
                maxFileSize={25 * 1024 * 1024}
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
                Step 2: Configure PDF Options
              </h2>
              
              <div className="space-y-6">
                {/* Image Order */}
                <div>
                  <Label className="text-sm font-medium text-foreground mb-3 block">
                    Image Order
                  </Label>
                  <div className="text-sm text-muted-foreground mb-4">
                    Drag images to reorder them in the final PDF document
                  </div>
                  <FileList
                    files={files}
                    onRemoveFile={handleRemoveFile}
                    onReorderFiles={handleReorderFiles}
                    showReorder={true}
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
                      Converting images to PDF...
                    </h3>
                    <p className="text-muted-foreground">
                      Creating PDF document from your images
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
                      Conversion Completed!
                    </h3>
                    <p className="text-muted-foreground">
                      Your images have been converted to PDF
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
