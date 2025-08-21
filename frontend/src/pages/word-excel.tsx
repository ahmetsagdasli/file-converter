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
import { ArrowLeft, FileSpreadsheet, ArrowRight, Loader2, CheckCircle, X } from "lucide-react";
import type { UploadedFile, ProcessedFile, ProcessingStatus } from "@/types";

const steps = [1, 2, 3];

export default function WordExcel() {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [filename, setFilename] = useState("");
  const [conversionType, setConversionType] = useState<'word-to-excel' | 'excel-to-word'>('word-to-excel');
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({
    status: 'idle',
    progress: 0,
    message: ''
  });
  const [result, setResult] = useState<ProcessedFile | null>(null);

  const convertMutation = useMutation({
    mutationFn: (data: any) => {
      if (conversionType === 'word-to-excel') {
        return api.convertWordToExcel(data);
      } else {
        return api.convertExcelToWord(data);
      }
    },
    onMutate: () => {
      setProcessingStatus({
        status: 'processing',
        progress: 0,
        message: 'Starting conversion...'
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
        message: error instanceof Error ? error.message : 'Conversion failed'
      });
    }
  });

  const handleFilesUploaded = (uploadedFiles: UploadedFile[]) => {
    setFiles(uploadedFiles);
    if (uploadedFiles.length > 0 && !filename) {
      const originalName = uploadedFiles[0].name.split('.')[0];
      const extension = conversionType === 'word-to-excel' ? '.xlsx' : '.docx';
      setFilename(`${originalName}_converted${extension}`);
    }
  };

  const handleStartProcessing = async () => {
    if (files.length === 0) return;
    
    const requestData = {
      file: files[0].id,
      filename
    };
    
    convertMutation.mutate(requestData);
  };

  const handleStartNew = () => {
    setFiles([]);
    setFilename("");
    setResult(null);
    setCurrentStep(1);
    setProcessingStatus({ status: 'idle', progress: 0, message: '' });
  };

  const handleDownload = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'converted_file';
    link.click();
  };

  const canProceedToStep2 = files.length > 0;
  const canProceedToStep3 = filename.trim() !== '';

  const acceptedTypes = conversionType === 'word-to-excel' 
    ? '.doc,.docx' 
    : '.xls,.xlsx';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm" data-testid="back-home">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('actions.backToHome')}
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileSpreadsheet className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground" data-testid="page-title">
                Word ↔ Excel Converter
              </h1>
              <p className="text-muted-foreground">
                Convert between Word documents and Excel spreadsheets
              </p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step) => (
            <div
              key={step}
              className={`flex items-center ${step < steps.length ? 'flex-1' : ''}`}
              data-testid={`step-${step}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                  ${currentStep === step
                    ? 'bg-primary text-primary-foreground'
                    : currentStep > step
                    ? 'bg-green-500 text-white'
                    : 'bg-muted text-muted-foreground'
                  }`}
              >
                {currentStep > step ? '✓' : step}
              </div>
              {step < steps.length && (
                <div
                  className={`flex-1 h-0.5 mx-4
                    ${currentStep > step ? 'bg-green-500' : 'bg-muted'}
                  `}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        {currentStep === 1 && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4" data-testid="step1-title">
                Upload Your File
              </h2>

              {/* Conversion Type Selector */}
              <div className="mb-6">
                <Label className="text-base font-medium">Conversion Type</Label>
                <div className="flex gap-4 mt-2">
                  <Button
                    variant={conversionType === 'word-to-excel' ? 'default' : 'outline'}
                    onClick={() => {
                      setConversionType('word-to-excel');
                      setFiles([]);
                      setFilename("");
                    }}
                    data-testid="word-to-excel-btn"
                  >
                    Word → Excel
                  </Button>
                  <Button
                    variant={conversionType === 'excel-to-word' ? 'default' : 'outline'}
                    onClick={() => {
                      setConversionType('excel-to-word');
                      setFiles([]);
                      setFilename("");
                    }}
                    data-testid="excel-to-word-btn"
                  >
                    Excel → Word
                  </Button>
                </div>
              </div>
              
              <UploadArea
                onFilesUploaded={handleFilesUploaded}
                acceptedTypes={acceptedTypes.split(',')}
                maxFiles={1}
                maxFileSize={25 * 1024 * 1024}
                data-testid="file-upload"
              />
              
              {files.length > 0 && (
                <div className="mt-4">
                  <FileList files={files} onRemoveFile={(id) => 
                    setFiles(files.filter(f => f.id !== id))
                  } />
                </div>
              )}
              
              <div className="flex justify-between mt-6">
                <div />
                <Button
                  onClick={() => setCurrentStep(2)}
                  disabled={!canProceedToStep2}
                  data-testid="next-step2"
                >
                  Configure Settings
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 2 && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4" data-testid="step2-title">
                Configure Settings
              </h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="filename" className="text-base font-medium">
                    Output Filename
                  </Label>
                  <Input
                    id="filename"
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                    placeholder={`converted_file${conversionType === 'word-to-excel' ? '.xlsx' : '.docx'}`}
                    className="mt-1"
                    data-testid="filename-input"
                  />
                </div>
              </div>
              
              <div className="flex justify-between mt-6">
                <Button
                  variant="ghost"
                  onClick={() => setCurrentStep(1)}
                  data-testid="back-step1"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Upload
                </Button>
                <Button
                  onClick={() => setCurrentStep(3)}
                  disabled={!canProceedToStep3}
                  data-testid="next-step3"
                >
                  Start Conversion
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 3 && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-6" data-testid="step3-title">
                Processing & Download
              </h2>
              
              {/* Processing Status */}
              <div className="text-center py-8">
                {processingStatus.status === 'processing' ? (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                      <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Converting File...
                    </h3>
                    <p className="text-muted-foreground">
                      Please wait while we convert your file
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
                      Your file has been successfully converted
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                      <X className="h-8 w-8 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Conversion Failed
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
                  {processingStatus.status === 'idle' ? 'Start Conversion' : 'Convert Another'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}