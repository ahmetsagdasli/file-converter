import { useState, useEffect } from 'react';

interface Translations {
  [key: string]: {
    en: string;
    tr: string;
  };
}

const translations: Translations = {
  // Header
  'header.title': {
    en: 'DocCraft',
    tr: 'DocCraft'
  },
  
  // Home page
  'home.title': {
    en: 'Professional PDF Tools',
    tr: 'Profesyonel PDF Araçları'
  },
  'home.subtitle': {
    en: 'Powerful, secure, and easy-to-use PDF processing tools. Merge, split, compress, and convert your documents with professional-grade quality.',
    tr: 'Güçlü, güvenli ve kullanımı kolay PDF işleme araçları. Belgelerinizi profesyonel kalitede birleştirin, bölün, sıkıştırın ve dönüştürün.'
  },
  
  // Tools
  'tools.merge.title': {
    en: 'Merge PDFs',
    tr: 'PDF Birleştir'
  },
  'tools.merge.description': {
    en: 'Combine multiple PDF files into a single document with custom ordering and page range selection.',
    tr: 'Birden fazla PDF dosyasını özel sıralama ve sayfa aralığı seçimi ile tek bir belgede birleştirin.'
  },
  'tools.split.title': {
    en: 'Split PDF',
    tr: 'PDF Böl'
  },
  'tools.split.description': {
    en: 'Extract specific pages or ranges from your PDF documents. Support for complex range patterns.',
    tr: 'PDF belgelerinizden belirli sayfalar veya aralıklar çıkarın. Karmaşık aralık desenlerini destekler.'
  },
  'tools.compress.title': {
    en: 'Compress PDF',
    tr: 'PDF Sıkıştır'
  },
  'tools.compress.description': {
    en: 'Reduce PDF file size while maintaining quality. Choose between balanced and strong compression.',
    tr: 'Kaliteyi koruyarak PDF dosya boyutunu azaltın. Dengeli ve güçlü sıkıştırma arasında seçim yapın.'
  },
  'tools.imageToPdf.title': {
    en: 'Images to PDF',
    tr: 'Resimden PDF'
  },
  'tools.imageToPdf.description': {
    en: 'Convert PNG and JPG images into a single PDF document with custom ordering and layout options.',
    tr: 'PNG ve JPG resimlerini özel sıralama ve düzen seçenekleri ile tek bir PDF belgesine dönüştürün.'
  },
  'tools.pdfToImage.title': {
    en: 'PDF to Images',
    tr: 'PDF\'den Resim'
  },
  'tools.pdfToImage.description': {
    en: 'Extract pages from PDF as high-quality PNG or JPG images with custom DPI settings.',
    tr: 'PDF sayfalarını özel DPI ayarları ile yüksek kaliteli PNG veya JPG resimleri olarak çıkarın.'
  },
  'tools.reorder.title': {
    en: 'Reorder Pages',
    tr: 'Sayfa Sırala'
  },
  'tools.reorder.description': {
    en: 'Reorder, rotate, or delete pages from your PDF documents with an intuitive drag-and-drop interface.',
    tr: 'PDF belgelerinizdeki sayfaları sezgisel sürükle-bırak arayüzü ile yeniden sıralayın, döndürün veya silin.'
  },
  'tools.wordExcel.title': {
    en: 'Word ↔ Excel',
    tr: 'Word ↔ Excel'
  },
  'tools.wordExcel.description': {
    en: 'Convert between Word documents and Excel spreadsheets with preserved formatting and data structure.',
    tr: 'Word belgeleri ve Excel elektronik tablolarını biçimlendirme ve veri yapısını koruyarak dönüştürün.'
  },
  'tools.docConvert.title': {
    en: 'Document to PDF',
    tr: 'Belgeyi PDF\'e'
  },
  'tools.docConvert.description': {
    en: 'Convert Word documents to PDF format while maintaining layout and formatting integrity.',
    tr: 'Word belgelerini düzen ve biçimlendirme bütünlüğünü koruyarak PDF formatına dönüştürün.'
  },
  'tools.excelCsv.title': {
    en: 'Excel ↔ CSV',
    tr: 'Excel ↔ CSV'
  },
  'tools.excelCsv.description': {
    en: 'Convert between Excel spreadsheets and CSV files for data interchange and compatibility.',
    tr: 'Veri alışverişi ve uyumluluk için Excel elektronik tabloları ve CSV dosyalarını dönüştürün.'
  },
  
  // Features
  'features.title': {
    en: 'Why Choose DocCraft?',
    tr: 'Neden DocCraft?'
  },
  'features.security.title': {
    en: 'Secure & Private',
    tr: 'Güvenli ve Özel'
  },
  'features.security.description': {
    en: 'Your files are automatically deleted after processing. No storage, no tracking, complete privacy.',
    tr: 'Dosyalarınız işlendikten sonra otomatik olarak silinir. Depolama yok, izleme yok, tam gizlilik.'
  },
  'features.speed.title': {
    en: 'Fast Processing',
    tr: 'Hızlı İşleme'
  },
  'features.speed.description': {
    en: 'Powerful server infrastructure ensures quick processing even for large files and batch operations.',
    tr: 'Güçlü sunucu altyapısı, büyük dosyalar ve toplu işlemler için bile hızlı işleme sağlar.'
  },
  'features.quality.title': {
    en: 'Professional Quality',
    tr: 'Profesyonel Kalite'
  },
  'features.quality.description': {
    en: 'Industry-standard processing tools ensure your documents maintain the highest quality standards.',
    tr: 'Endüstri standartı işleme araçları, belgelerinizin en yüksek kalite standartlarını korumasını sağlar.'
  },
  
  // Steps
  'steps.upload': {
    en: 'Upload',
    tr: 'Yükle'
  },
  'steps.configure': {
    en: 'Configure',
    tr: 'Yapılandır'
  },
  'steps.process': {
    en: 'Process',
    tr: 'İşle'
  },
  
  // Actions
  'actions.startMerging': {
    en: 'Start merging',
    tr: 'Birleştirmeye başla'
  },
  'actions.backToTools': {
    en: 'Back to tools',
    tr: 'Araçlara dön'
  },
  'actions.continue': {
    en: 'Continue to Configure',
    tr: 'Yapılandırmaya Devam Et'
  },
  'actions.startProcessing': {
    en: 'Start Processing',
    tr: 'İşlemeye Başla'
  },
  'actions.download': {
    en: 'Download',
    tr: 'İndir'
  },
  
  // Upload
  'upload.dropFiles': {
    en: 'Drop PDF files here or click to browse',
    tr: 'PDF dosyalarını buraya sürükleyin veya göz atmak için tıklayın'
  },
  'upload.limits': {
    en: 'Support for multiple files • Max 25MB per file • Up to 10 files',
    tr: 'Çoklu dosya desteği • Dosya başına maksimum 25MB • 10 dosyaya kadar'
  },
  'upload.selectFiles': {
    en: 'Select Files',
    tr: 'Dosya Seç'
  },
  
  // Processing
  'processing.title': {
    en: 'Processing your files...',
    tr: 'Dosyalarınız işleniyor...'
  },
  'processing.description': {
    en: 'This may take a few moments depending on file size',
    tr: 'Dosya boyutuna bağlı olarak bu işlem birkaç dakika sürebilir'
  },
  'processing.completed': {
    en: 'Processing Complete!',
    tr: 'İşleme Tamamlandı!'
  },
  'processing.ready': {
    en: 'Your merged PDF is ready for download',
    tr: 'Birleştirilmiş PDF dosyanız indirmeye hazır'
  },
};

type Language = 'en' | 'tr';

export function useTranslation() {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('doccraft-language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('doccraft-language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return { t, language, setLanguage };
}
