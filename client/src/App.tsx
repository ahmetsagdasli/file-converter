import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import Home from "@/pages/home";
import Merge from "@/pages/merge";
import Split from "@/pages/split";
import Compress from "@/pages/compress";
import ImageToPdf from "@/pages/image-to-pdf";
import PdfToImage from "@/pages/pdf-to-image";
import Reorder from "@/pages/reorder";
import WordExcel from "@/pages/word-excel";
import DocConvert from "@/pages/doc-convert";
import ExcelCsv from "@/pages/excel-csv";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/merge" component={Merge} />
      <Route path="/split" component={Split} />
      <Route path="/compress" component={Compress} />
      <Route path="/image-to-pdf" component={ImageToPdf} />
      <Route path="/pdf-to-image" component={PdfToImage} />
      <Route path="/reorder" component={Reorder} />
      <Route path="/word-excel" component={WordExcel} />
      <Route path="/doc-convert" component={DocConvert} />
      <Route path="/excel-csv" component={ExcelCsv} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="file-converter-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="min-h-screen bg-background">
            <Sidebar />
            <div className="lg:pl-80">
              <Header />
              <main>
                <Router />
              </main>
            </div>
          </div>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
