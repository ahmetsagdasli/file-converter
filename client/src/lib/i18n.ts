// Simplified English-only translations for File Converter
const translations = {
  // Header
  'header.title': 'File Converter',
  
  // Actions
  'actions.backToHome': 'Back to Home',
  'actions.download': 'Download',
  'actions.startMerging': 'Start Merging',
  'actions.uploadFiles': 'Upload Files',
  'actions.processing': 'Processing...',
  'actions.completed': 'Completed',
  'actions.failed': 'Failed',
  
  // Common
  'common.or': 'or',
  'common.and': 'and',
  'common.cancel': 'Cancel',
  'common.continue': 'Continue',
  'common.back': 'Back',
  'common.next': 'Next',
  'common.finish': 'Finish',
  'common.loading': 'Loading...',
  'common.error': 'Error',
  'common.success': 'Success',
  
  // Steps
  'steps.upload': 'Upload',
  'steps.configure': 'Configure', 
  'steps.process': 'Process',
  
  // File operations
  'files.selectFiles': 'Select files',
  'files.dragDrop': 'Drag and drop files here',
  'files.maxSize': 'Maximum file size',
  'files.supportedFormats': 'Supported formats',
  'files.processing': 'Processing files...',
  'files.completed': 'Files processed successfully',
  'files.failed': 'Processing failed',
};

// Simple useTranslation hook for English-only
export function useTranslation() {
  return {
    t: (key: string): string => {
      return translations[key as keyof typeof translations] || key;
    }
  };
}