import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import ImageResizer from "@/pages/image-resizer";
import ImageCompressor from "@/pages/image-compressor";
import ImageConverter from "@/pages/image-converter";
import ImageCropper from "@/pages/image-cropper";
import ImageToPdf from "@/pages/image-to-pdf";
import Watermark from "@/pages/watermark";
import ImageRotator from "@/pages/image-rotator";
import ColorPicker from "@/pages/color-picker";
import MetadataRemover from "@/pages/metadata-remover";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import About from "@/pages/about";
import Contact from "@/pages/contact";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/tools/image-resizer" component={ImageResizer} />
      <Route path="/tools/image-compressor" component={ImageCompressor} />
      <Route path="/tools/image-converter" component={ImageConverter} />
      <Route path="/tools/image-cropper" component={ImageCropper} />
      <Route path="/tools/image-to-pdf" component={ImageToPdf} />
      <Route path="/tools/watermark" component={Watermark} />
      <Route path="/tools/image-rotator" component={ImageRotator} />
      <Route path="/tools/color-picker" component={ColorPicker} />
      <Route path="/tools/metadata-remover" component={MetadataRemover} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
