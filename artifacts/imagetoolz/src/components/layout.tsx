import { Link, useLocation } from "wouter";
import {
  Maximize2, Archive, Repeat, Crop, Type, RotateCw,
  FileText, Pipette, ShieldOff, Layers, Home
} from "lucide-react";

const tools = [
  { slug: "image-resizer",    name: "Resize",          icon: Maximize2  },
  { slug: "image-compressor", name: "Compress",        icon: Archive    },
  { slug: "image-converter",  name: "Convert",         icon: Repeat     },
  { slug: "image-cropper",    name: "Crop",            icon: Crop       },
  { slug: "watermark",        name: "Watermark",       icon: Type       },
  { slug: "image-rotator",    name: "Rotate & Flip",   icon: RotateCw   },
  { slug: "image-to-pdf",     name: "Image to PDF",    icon: FileText   },
  { slug: "color-picker",     name: "Color Picker",    icon: Pipette    },
  { slug: "metadata-remover", name: "Remove Metadata", icon: ShieldOff  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const isToolActive = (slug: string) => location === `/tools/${slug}`;
  const isHome = location === "/";

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
          <nav className="hidden sm:flex items-center gap-1 text-sm">
            <Link href="/about" className="px-3 py-1.5 rounded-md text-gray-500 font-medium hover:text-gray-800 hover:bg-gray-100 transition-colors">About</Link>
            <Link href="/contact" className="px-3 py-1.5 rounded-md text-gray-500 font-medium hover:text-gray-800 hover:bg-gray-100 transition-colors">Contact</Link>
            <span className="w-1 h-1 rounded-full bg-gray-300 mx-1" />
            <span className="px-3 py-1.5 text-gray-400 font-medium text-xs">Free &amp; Private</span>
          </nav>
        </div>

        {/* ── Tool tabs ── */}
        <div className="bg-gray-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex overflow-x-auto gap-0.5 py-1.5" style={{ scrollbarWidth: "none" }}>
              {/* Home tab */}
              <Link
                href="/"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md text-[13px] font-medium whitespace-nowrap transition-all shrink-0 ${
                  isHome
                    ? "bg-white text-blue-600 shadow-sm border border-gray-200"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-sm hover:border hover:border-gray-200"
                }`}
              >
                <Home className={`w-3.5 h-3.5 ${isHome ? "text-blue-600" : "text-gray-400"}`} />
                All Tools
              </Link>

              {/* Separator */}
              <span className="w-px bg-gray-200 mx-1 self-stretch my-1.5" />

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="sm:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Layers className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold text-gray-900">ImageToolz</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed max-w-xs">
                Free, browser-based image tools. All processing happens locally on your device — your images never leave your browser.
              </p>
            </div>

            {/* Tools */}
            <div>
              <p className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">Tools</p>
              <ul className="space-y-2">
                {tools.slice(0, 5).map((t) => (
                  <li key={t.slug}>
                    <Link href={`/tools/${t.slug}`} className="text-xs text-gray-500 hover:text-blue-600 transition-colors">{t.name}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <p className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">Company</p>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-xs text-gray-500 hover:text-blue-600 transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="text-xs text-gray-500 hover:text-blue-600 transition-colors">Contact</Link></li>
                <li><Link href="/privacy" className="text-xs text-gray-500 hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-xs text-gray-500 hover:text-blue-600 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} ImageToolz. Free forever.</p>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="text-xs text-gray-400 hover:text-blue-600 transition-colors">Privacy</Link>
              <Link href="/terms" className="text-xs text-gray-400 hover:text-blue-600 transition-colors">Terms</Link>
              <Link href="/contact" className="text-xs text-gray-400 hover:text-blue-600 transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
