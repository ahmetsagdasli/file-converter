import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Merge from "@/pages/merge";
import Split from "@/pages/split";
import Compress from "@/pages/compress";
import ImageToPdf from "@/pages/image-to-pdf";
import PdfToImage from "@/pages/pdf-to-image";
import Reorder from "@/pages/reorder";
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
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
