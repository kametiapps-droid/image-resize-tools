import { lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

const Home = lazy(() => import("@/pages/home"));
const ImageResizer = lazy(() => import("@/pages/image-resizer"));
const ImageCompressor = lazy(() => import("@/pages/image-compressor"));
const ImageConverter = lazy(() => import("@/pages/image-converter"));
const ImageCropper = lazy(() => import("@/pages/image-cropper"));
const ImageToPdf = lazy(() => import("@/pages/image-to-pdf"));
const Watermark = lazy(() => import("@/pages/watermark"));
const ImageRotator = lazy(() => import("@/pages/image-rotator"));
const ColorPicker = lazy(() => import("@/pages/color-picker"));
const MetadataRemover = lazy(() => import("@/pages/metadata-remover"));
const Privacy = lazy(() => import("@/pages/privacy"));
const Terms = lazy(() => import("@/pages/terms"));
const About = lazy(() => import("@/pages/about"));
const Contact = lazy(() => import("@/pages/contact"));
const BlogIndex = lazy(() => import("@/pages/blog-index"));
const BlogPost = lazy(() => import("@/pages/blog-post"));
const NotFound = lazy(() => import("@/pages/not-found"));

const queryClient = new QueryClient();

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="w-8 h-8 rounded-full border-2 border-green-600 border-t-transparent animate-spin" />
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={ImageResizer} />
        <Route path="/tools" component={Home} />
        <Route path="/tools/image-resizer" component={ImageResizer} />
        <Route path="/tools/image-compressor" component={ImageCompressor} />
        <Route path="/tools/image-converter" component={ImageConverter} />
        <Route path="/tools/image-cropper" component={ImageCropper} />
        <Route path="/tools/image-to-pdf" component={ImageToPdf} />
        <Route path="/tools/watermark" component={Watermark} />
        <Route path="/tools/image-rotator" component={ImageRotator} />
        <Route path="/tools/color-picker" component={ColorPicker} />
        <Route path="/tools/metadata-remover" component={MetadataRemover} />
        <Route path="/blog" component={BlogIndex} />
        <Route path="/blog/:slug" component={BlogPost} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/terms" component={Terms} />
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
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
