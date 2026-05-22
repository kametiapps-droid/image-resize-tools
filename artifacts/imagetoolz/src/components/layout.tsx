import { Link, useLocation } from "wouter";
import {
  Maximize2, Archive, Repeat, Crop, Type, RotateCw,
  FileText, Pipette, ShieldOff, Layers
} from "lucide-react";

const tools = [
  { slug: "image-resizer",    name: "Resize",           icon: Maximize2  },
  { slug: "image-compressor", name: "Compress",         icon: Archive    },
  { slug: "image-converter",  name: "Convert",          icon: Repeat     },
  { slug: "image-cropper",    name: "Crop",             icon: Crop       },
  { slug: "watermark",        name: "Watermark",        icon: Type       },
  { slug: "image-rotator",    name: "Rotate & Flip",    icon: RotateCw   },
  { slug: "image-to-pdf",     name: "Image to PDF",     icon: FileText   },
  { slug: "color-picker",     name: "Color Picker",     icon: Pipette    },
  { slug: "metadata-remover", name: "Remove Metadata",  icon: ShieldOff  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const isToolActive = (slug: string) =>
    location === `/tools/${slug}` || (slug === "image-resizer" && location === "/");

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f8fafc" }}>

      {/* ── Main header ── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[58px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[17px] text-gray-900 tracking-tight">ImageToolz</span>
          </Link>
          <div className="hidden sm:flex items-center gap-1 text-sm">
            <span className="px-3 py-1.5 rounded-md text-gray-500 font-medium">Free &amp; Private</span>
            <span className="w-1 h-1 rounded-full bg-gray-300 mx-1" />
            <span className="px-3 py-1.5 rounded-md text-gray-500 font-medium">No sign-up needed</span>
          </div>
        </div>

        {/* ── Tool tabs ── */}
        <div className="bg-gray-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex overflow-x-auto gap-0.5 py-1.5" style={{ scrollbarWidth: "none" }}>
              {tools.map((tool) => {
                const active = isToolActive(tool.slug);
                const Icon = tool.icon;
                return (
                  <Link
                    key={tool.slug}
                    href={`/tools/${tool.slug}`}
                    data-testid={`nav-tool-${tool.slug}`}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md text-[13px] font-medium whitespace-nowrap transition-all shrink-0 ${
                      active
                        ? "bg-white text-blue-600 shadow-sm border border-gray-200"
                        : "text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-sm hover:border hover:border-gray-200"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${active ? "text-blue-600" : "text-gray-400"}`} />
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

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center">
                <Layers className="w-3 h-3 text-white" />
              </div>
              <span className="font-semibold text-gray-800 text-sm">ImageToolz</span>
            </div>
            <p className="text-xs text-gray-400 text-center">
              All image processing happens entirely in your browser. Your images are never uploaded to any server.
            </p>
            <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} ImageToolz. Free forever.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
