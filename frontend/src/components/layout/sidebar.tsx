import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Link, useLocation } from "wouter";
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
  Menu,
  X,
  Github,
  Linkedin,
  User,
  Home
} from "lucide-react";
import { cn } from "@/lib/utils";

const tools = [
  {
    id: 'merge',
    path: '/merge',
    icon: FileText,
    title: 'Merge PDFs',
    description: 'Combine multiple PDFs'
  },
  {
    id: 'split',
    path: '/split',
    icon: Scissors,
    title: 'Split PDF',
    description: 'Extract pages from PDF'
  },
  {
    id: 'compress',
    path: '/compress',
    icon: Archive,
    title: 'Compress PDF',
    description: 'Reduce file size'
  },
  {
    id: 'image-to-pdf',
    path: '/image-to-pdf',
    icon: Image,
    title: 'Images to PDF',
    description: 'Convert images to PDF'
  },
  {
    id: 'pdf-to-image',
    path: '/pdf-to-image',
    icon: Images,
    title: 'PDF to Images',
    description: 'Extract images from PDF'
  },
  {
    id: 'reorder',
    path: '/reorder',
    icon: RotateCw,
    title: 'Reorder Pages',
    description: 'Reorganize PDF pages'
  },
  {
    id: 'word-excel',
    path: '/word-excel',
    icon: FileSpreadsheet,
    title: 'Word ↔ Excel',
    description: 'Convert Word and Excel'
  },
  {
    id: 'doc-convert',
    path: '/doc-convert',
    icon: FileEdit,
    title: 'Document to PDF',
    description: 'Convert docs to PDF'
  },
  {
    id: 'excel-csv',
    path: '/excel-csv',
    icon: RefreshCw,
    title: 'Excel ↔ CSV',
    description: 'Convert Excel and CSV'
  }
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo and Title */}
      <div className="p-6 border-b border-border">
        <Link href="/">
          <div className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">File Converter</h1>
              <p className="text-xs text-muted-foreground">Professional Tools</p>
            </div>
          </div>
        </Link>
      </div>

      <ScrollArea className="flex-1 px-4 py-4">
        {/* Home */}
        <div className="mb-6">
          <Link href="/">
            <Button
              variant={location === "/" ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 h-12 mb-2",
                location === "/" && "bg-secondary"
              )}
              data-testid="nav-home"
            >
              <Home className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Home</div>
                <div className="text-xs text-muted-foreground">All tools</div>
              </div>
            </Button>
          </Link>
        </div>

        <Separator className="mb-4" />

        {/* PDF Tools */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-2">PDF Tools</h3>
          <div className="space-y-1">
            {tools.slice(0, 6).map((tool) => {
              const Icon = tool.icon;
              const isActive = location === tool.path;
              
              return (
                <Link key={tool.id} href={tool.path}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 h-12",
                      isActive && "bg-secondary"
                    )}
                    data-testid={`nav-${tool.id}`}
                  >
                    <Icon className="h-4 w-4" />
                    <div className="text-left">
                      <div className="text-sm font-medium">{tool.title}</div>
                      <div className="text-xs text-muted-foreground">{tool.description}</div>
                    </div>
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>

        <Separator className="mb-4" />

        {/* Document Tools */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-2">Document Tools</h3>
          <div className="space-y-1">
            {tools.slice(6).map((tool) => {
              const Icon = tool.icon;
              const isActive = location === tool.path;
              
              return (
                <Link key={tool.id} href={tool.path}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 h-12",
                      isActive && "bg-secondary"
                    )}
                    data-testid={`nav-${tool.id}`}
                  >
                    <Icon className="h-4 w-4" />
                    <div className="text-left">
                      <div className="text-sm font-medium">{tool.title}</div>
                      <div className="text-xs text-muted-foreground">{tool.description}</div>
                    </div>
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </ScrollArea>

      {/* Developer Attribution */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-medium">Ahmet Sağdaşlı</div>
            <div className="text-xs text-muted-foreground">Developer</div>
          </div>
        </div>
        <div className="flex gap-2">
          <a
            href="https://github.com/ahmetsagdasli"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button variant="outline" size="sm" className="w-full gap-2">
              <Github className="h-4 w-4" />
              GitHub
            </Button>
          </a>
          <a
            href="https://www.linkedin.com/in/ahmet-sagdasli/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button variant="outline" size="sm" className="w-full gap-2">
              <Linkedin className="h-4 w-4" />
              LinkedIn
            </Button>
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={toggleSidebar}
        data-testid="mobile-sidebar-toggle"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-80 bg-background border-r border-border transform transition-transform duration-200 ease-in-out lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </div>

      {/* Desktop Sidebar */}
      <div className={cn("hidden lg:block lg:w-80 lg:border-r lg:border-border", className)}>
        <div className="fixed inset-y-0 left-0 w-80 bg-background">
          <SidebarContent />
        </div>
      </div>
    </>
  );
}