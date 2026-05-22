import { Link, useLocation } from "wouter";
import {
  Maximize2, Archive, Repeat, Crop, Type, RotateCw, FileText, Pipette, ShieldOff, Image as ImageIcon
} from "lucide-react";

const tools = [
  { slug: "image-resizer",    name: "Resize",          icon: Maximize2   },
  { slug: "image-compressor", name: "Compress",        icon: Archive     },
  { slug: "image-converter",  name: "Convert",         icon: Repeat      },
  { slug: "image-cropper",    name: "Crop",            icon: Crop        },
  { slug: "watermark",        name: "Watermark",       icon: Type        },
  { slug: "image-rotator",    name: "Rotate & Flip",   icon: RotateCw    },
  { slug: "image-to-pdf",     name: "Image to PDF",    icon: FileText    },
  { slug: "color-picker",     name: "Color Picker",    icon: Pipette     },
  { slug: "metadata-remover", name: "Remove Metadata", icon: ShieldOff   },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-white text-foreground">
      {/* Top bar */}
      <header className="border-b border-border bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary shrink-0">
            <ImageIcon className="w-5 h-5" />
            <span>ImageToolz</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          </nav>
        </div>

        {/* Tool navigation tabs */}
        <div className="border-t border-border bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex overflow-x-auto scrollbar-hide gap-0 -mb-px">
              {tools.map((tool) => {
                const isActive = location === `/tools/${tool.slug}`;
                const Icon = tool.icon;
                return (
                  <Link
                    key={tool.slug}
                    href={`/tools/${tool.slug}`}
                    data-testid={`nav-tool-${tool.slug}`}
                    className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors shrink-0 ${
                      isActive
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tool.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t border-border bg-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-primary font-semibold">
              <ImageIcon className="w-4 h-4" />
              ImageToolz
            </div>
            <p className="text-sm text-muted-foreground text-center">
              All processing happens entirely in your browser. Your images are never uploaded to any server.
            </p>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} ImageToolz
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
