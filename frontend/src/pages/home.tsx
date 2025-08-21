import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  ArrowRight,
  Github,
  Linkedin,
  User,
  CheckCircle,
  Star,
  Sparkles
} from "lucide-react";

const tools = [
  {
    id: 'merge',
    path: '/merge',
    icon: FileText,
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    title: 'Merge PDFs',
    description: 'Combine multiple PDF files into a single document with custom ordering and page selection.',
    category: 'PDF Tools'
  },
  {
    id: 'split',
    path: '/split',
    icon: Scissors,
    color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    title: 'Split PDF',
    description: 'Extract specific pages or ranges from your PDF documents with precision.',
    category: 'PDF Tools'
  },
  {
    id: 'compress',
    path: '/compress',
    icon: Archive,
    color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
    title: 'Compress PDF',
    description: 'Reduce PDF file size while maintaining quality with smart compression.',
    category: 'PDF Tools'
  },
  {
    id: 'image-to-pdf',
    path: '/image-to-pdf',
    icon: Image,
    color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    title: 'Images to PDF',
    description: 'Convert PNG, JPG images into a single PDF with custom layout options.',
    category: 'PDF Tools'
  },
  {
    id: 'pdf-to-image',
    path: '/pdf-to-image',
    icon: Images,
    color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
    title: 'PDF to Images',
    description: 'Extract pages from PDF as high-quality PNG or JPG images.',
    category: 'PDF Tools'
  },
  {
    id: 'reorder',
    path: '/reorder',
    icon: RotateCw,
    color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
    title: 'Reorder Pages',
    description: 'Reorganize, rotate, or delete pages with intuitive drag-and-drop interface.',
    category: 'PDF Tools'
  },
  {
    id: 'word-excel',
    path: '/word-excel',
    icon: FileSpreadsheet,
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    title: 'Word ↔ Excel',
    description: 'Convert between Word documents and Excel spreadsheets seamlessly.',
    category: 'Document Tools'
  },
  {
    id: 'doc-convert',
    path: '/doc-convert',
    icon: FileEdit,
    color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400',
    title: 'Document to PDF',
    description: 'Convert Word documents to PDF format while maintaining formatting.',
    category: 'Document Tools'
  },
  {
    id: 'excel-csv',
    path: '/excel-csv',
    icon: RefreshCw,
    color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
    title: 'Excel ↔ CSV',
    description: 'Convert between Excel spreadsheets and CSV files for data interchange.',
    category: 'Document Tools'
  }
];

const features = [
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Your files are automatically deleted after processing. No storage, no tracking, complete privacy guaranteed.'
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Powerful server infrastructure ensures quick processing even for large files and batch operations.'
  },
  {
    icon: Award,
    title: 'Professional Quality',
    description: 'Industry-standard processing tools ensure your documents maintain the highest quality standards.'
  }
];

export default function Home() {
  const pdfTools = tools.filter(tool => tool.category === 'PDF Tools');
  const documentTools = tools.filter(tool => tool.category === 'Document Tools');

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <FileText className="h-7 w-7 text-white" />
            </div>
            <Badge variant="secondary" className="px-3 py-1 text-sm font-medium">
              <Sparkles className="w-3 h-3 mr-1" />
              Professional Tools
            </Badge>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            File Converter
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto leading-relaxed">
            Professional document processing tools for modern workflows. 
            <span className="block mt-2">
              Merge, split, compress, and convert your files with enterprise-grade quality and security.
            </span>
          </p>

          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mb-8">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>100% Secure</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>No Registration</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Fast Processing</span>
            </div>
          </div>
        </div>

        {/* PDF Tools Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-3xl font-bold text-foreground">PDF Tools</h2>
            <Badge variant="outline" className="ml-2">
              6 Tools
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pdfTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link key={tool.id} href={tool.path}>
                  <Card className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border-2 hover:border-primary/20">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${tool.color} group-hover:scale-110 transition-transform`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                            {tool.title}
                          </h3>
                          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                            {tool.description}
                          </p>
                          <div className="flex items-center text-primary text-sm font-medium group-hover:gap-2 transition-all">
                            Get Started
                            <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Document Tools Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <FileSpreadsheet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-3xl font-bold text-foreground">Document Tools</h2>
            <Badge variant="outline" className="ml-2">
              3 Tools
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documentTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link key={tool.id} href={tool.path}>
                  <Card className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border-2 hover:border-primary/20">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${tool.color} group-hover:scale-110 transition-transform`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                            {tool.title}
                          </h3>
                          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                            {tool.description}
                          </p>
                          <div className="flex items-center text-primary text-sm font-medium group-hover:gap-2 transition-all">
                            Get Started
                            <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Why Choose File Converter?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built with enterprise-grade security and performance in mind, 
              our tools deliver professional results every time.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Developer Attribution */}
        <section className="border-t border-border pt-12">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 bg-muted/50 rounded-full px-6 py-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-foreground">Developed by Ahmet Sağdaşlı</div>
                <div className="text-sm text-muted-foreground">Full Stack Developer</div>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-4">
              <a
                href="https://github.com/ahmetsagdasli"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="h-5 w-5" />
                <span className="font-medium">GitHub</span>
              </a>
              <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
              <a
                href="https://www.linkedin.com/in/ahmet-sagdasli/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Linkedin className="h-5 w-5" />
                <span className="font-medium">LinkedIn</span>
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}