import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { Link } from "wouter";
import { 
  FileText, 
  Scissors, 
  Archive, 
  Image, 
  Images, 
  RotateCw,
  FileSpreadsheet,
  FileEdit,
  RefreshCw,
  Shield,
  Zap,
  Award,
  ArrowRight
} from "lucide-react";

const tools = [
  {
    id: 'merge',
    path: '/merge',
    icon: FileText,
    color: 'bg-primary-100 text-primary-600',
    titleKey: 'tools.merge.title',
    descriptionKey: 'tools.merge.description'
  },
  {
    id: 'split',
    path: '/split',
    icon: Scissors,
    color: 'bg-accent-100 text-accent-600',
    titleKey: 'tools.split.title',
    descriptionKey: 'tools.split.description'
  },
  {
    id: 'compress',
    path: '/compress',
    icon: Archive,
    color: 'bg-green-100 text-green-600',
    titleKey: 'tools.compress.title',
    descriptionKey: 'tools.compress.description'
  },
  {
    id: 'image-to-pdf',
    path: '/image-to-pdf',
    icon: Image,
    color: 'bg-purple-100 text-purple-600',
    titleKey: 'tools.imageToPdf.title',
    descriptionKey: 'tools.imageToPdf.description'
  },
  {
    id: 'pdf-to-image',
    path: '/pdf-to-image',
    icon: Images,
    color: 'bg-orange-100 text-orange-600',
    titleKey: 'tools.pdfToImage.title',
    descriptionKey: 'tools.pdfToImage.description'
  },
  {
    id: 'reorder',
    path: '/reorder',
    icon: RotateCw,
    color: 'bg-indigo-100 text-indigo-600',
    titleKey: 'tools.reorder.title',
    descriptionKey: 'tools.reorder.description'
  },
  {
    id: 'word-excel',
    path: '/word-excel',
    icon: FileSpreadsheet,
    color: 'bg-blue-100 text-blue-600',
    titleKey: 'tools.wordExcel.title',
    descriptionKey: 'tools.wordExcel.description'
  },
  {
    id: 'doc-convert',
    path: '/doc-convert',
    icon: FileEdit,
    color: 'bg-teal-100 text-teal-600',
    titleKey: 'tools.docConvert.title',
    descriptionKey: 'tools.docConvert.description'
  },
  {
    id: 'excel-csv',
    path: '/excel-csv',
    icon: RefreshCw,
    color: 'bg-pink-100 text-pink-600',
    titleKey: 'tools.excelCsv.title',
    descriptionKey: 'tools.excelCsv.description'
  }
];

const features = [
  {
    icon: Shield,
    color: 'bg-primary-100 text-primary-600',
    titleKey: 'features.security.title',
    descriptionKey: 'features.security.description'
  },
  {
    icon: Zap,
    color: 'bg-accent-100 text-accent-600',
    titleKey: 'features.speed.title',
    descriptionKey: 'features.speed.description'
  },
  {
    icon: Award,
    color: 'bg-green-100 text-green-600',
    titleKey: 'features.quality.title',
    descriptionKey: 'features.quality.description'
  }
];

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4" data-testid="hero-title">
            {t('home.title')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="hero-subtitle">
            {t('home.subtitle')}
          </p>
        </div>

        {/* Tool Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12" data-testid="tool-grid">
          {tools.map((tool) => {
            const IconComponent = tool.icon;
            return (
              <Link key={tool.id} href={tool.path}>
                <Card className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group" data-testid={`tool-card-${tool.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${tool.color}`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {t(tool.titleKey)}
                      </h3>
                    </div>
                    
                    <p className="text-muted-foreground text-sm mb-4">
                      {t(tool.descriptionKey)}
                    </p>
                    
                    <div className="flex items-center text-primary text-sm font-medium group-hover:translate-x-1 transition-transform">
                      <span>{t('actions.startMerging')}</span>
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Features Section */}
        <Card className="p-8 mb-12">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8" data-testid="features-title">
            {t('features.title')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="text-center" data-testid={`feature-${index}`}>
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${feature.color}`}>
                    <IconComponent className="h-8 w-8" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {t(feature.titleKey)}
                  </h3>
                  
                  <p className="text-muted-foreground text-sm">
                    {t(feature.descriptionKey)}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-muted-foreground text-sm">
              © 2024 DocCraft. All rights reserved. Files are automatically deleted after processing for your privacy.
            </p>
            <div className="flex justify-center space-x-6 mt-4">
              <Button variant="link" className="text-muted-foreground hover:text-foreground text-sm p-0">
                Privacy Policy
              </Button>
              <Button variant="link" className="text-muted-foreground hover:text-foreground text-sm p-0">
                Terms of Service
              </Button>
              <Button variant="link" className="text-muted-foreground hover:text-foreground text-sm p-0">
                Support
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
