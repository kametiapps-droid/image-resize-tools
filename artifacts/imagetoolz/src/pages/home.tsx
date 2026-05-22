import { Link } from "wouter";
import { useListTools } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Maximize2, Archive, Repeat, Crop, Type, RotateCw, FileText, Pipette, ShieldOff, CheckCircle2
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  "image-resizer":    Maximize2,
  "image-compressor": Archive,
  "image-converter":  Repeat,
  "image-cropper":    Crop,
  "watermark":        Type,
  "image-rotator":    RotateCw,
  "image-to-pdf":     FileText,
  "color-picker":     Pipette,
  "metadata-remover": ShieldOff,
};

const features = [
  "100% free, no account required",
  "All processing runs in your browser",
  "Your images never leave your device",
  "No file size limits",
  "Fast and high quality output",
  "Works on any device",
];

export default function Home() {
  const { data: tools, isLoading } = useListTools();

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-white border-b border-border py-16 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-5">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground leading-tight tracking-tight">
            Free Online Image Tools
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Resize, compress, convert, crop, and more — all directly in your browser. No uploads. No sign-up. Completely free.
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 pt-2">
            {features.map((f) => (
              <span key={f} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                {f}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Tools grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">All Tools</h2>
          <p className="text-muted-foreground mt-1">Choose a tool to get started — no login needed.</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(9).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools?.map((tool) => {
              const Icon = iconMap[tool.slug] ?? Maximize2;
              return (
                <Link
                  key={tool.id}
                  href={`/tools/${tool.slug}`}
                  data-testid={`card-tool-${tool.id}`}
                  className="group flex items-start gap-4 p-5 rounded-xl border border-border bg-white hover:border-primary hover:shadow-md transition-all"
                >
                  <div className="shrink-0 w-11 h-11 rounded-lg bg-blue-50 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {tool.name}
                    </div>
                    <div className="text-sm text-muted-foreground mt-0.5 leading-snug">
                      {tool.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Why use section */}
      <section className="border-t border-border bg-blue-50/50 py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-foreground mb-10">Why ImageToolz?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <ShieldOff className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-foreground">Private by Design</h3>
              <p className="text-sm text-muted-foreground">Every tool runs entirely in your browser. Your images are processed locally and never sent to any server.</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-foreground">Always Free</h3>
              <p className="text-sm text-muted-foreground">No subscriptions, no file limits, no watermarks. Just open the tool and use it.</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <Maximize2 className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-foreground">High Quality Output</h3>
              <p className="text-sm text-muted-foreground">Built with the Canvas API and best-in-class libraries for pixel-perfect, lossless results.</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
