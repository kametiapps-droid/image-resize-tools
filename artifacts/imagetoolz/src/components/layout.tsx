import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import {
  Maximize2, Archive, Repeat, Crop, Type, RotateCw,
  FileText, Pipette, ShieldOff, Layers, Menu, X,
  Sun, Moon, ChevronRight, Mail
} from "lucide-react";

const SITE_NAME = "CropImages";
const CONTACT_EMAIL = "iftechstudio@gmail.com";
const AUTHOR = "If Tech Studio Team";
const DOMAIN = "https://cropimages.store";

const tools = [
  { slug: "image-resizer",    name: "Image Resizer",     icon: Maximize2,  desc: "Resize to any dimension" },
  { slug: "image-compressor", name: "Image Compressor",  icon: Archive,    desc: "Reduce file size" },
  { slug: "image-converter",  name: "Image Converter",   icon: Repeat,     desc: "Convert between formats" },
  { slug: "image-cropper",    name: "Image Cropper",     icon: Crop,       desc: "Crop and trim images" },
  { slug: "watermark",        name: "Add Watermark",     icon: Type,       desc: "Protect with watermarks" },
  { slug: "image-rotator",    name: "Rotate & Flip",     icon: RotateCw,   desc: "Rotate and flip images" },
  { slug: "image-to-pdf",     name: "Image to PDF",      icon: FileText,   desc: "Combine into PDF" },
  { slug: "color-picker",     name: "Color Picker",      icon: Pipette,    desc: "Extract color values" },
  { slug: "metadata-remover", name: "Remove Metadata",   icon: ShieldOff,  desc: "Strip EXIF data" },
];

function useDarkMode() {
  const [dark, setDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem("theme");
    if (stored) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return [dark, setDark] as const;
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useDarkMode();
  const menuRef = useRef<HTMLDivElement>(null);

  const isActive = (slug: string) =>
    location === `/tools/${slug}` || (slug === "image-resizer" && location === "/");

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  useEffect(() => { setMenuOpen(false); }, [location]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">

      {/* ── Header ── */}
      <header className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50"
        style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[60px] flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105"
              style={{ background: "linear-gradient(135deg, #14532d, #22c55e)" }}>
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[17px] text-gray-900 dark:text-white tracking-tight">
              Crop<span className="text-green-600 dark:text-green-400">Images</span>
            </span>
          </Link>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Nav links desktop */}
            <nav className="hidden md:flex items-center gap-1 text-sm mr-2">
              <Link href="/about" className="px-3 py-1.5 rounded-md text-gray-500 dark:text-gray-400 font-medium hover:text-green-700 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/40 transition-colors">About</Link>
              <Link href="/contact" className="px-3 py-1.5 rounded-md text-gray-500 dark:text-gray-400 font-medium hover:text-green-700 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/40 transition-colors">Contact</Link>
            </nav>

            {/* Dark / light toggle */}
            <button
              onClick={() => setDark(!dark)}
              aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
              title={dark ? "Light mode" : "Dark mode"}
              className="w-9 h-9 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-green-50 dark:hover:bg-green-950/40 hover:text-green-700 dark:hover:text-green-400 hover:border-green-300 dark:hover:border-green-700 transition-all"
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Hamburger */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                aria-label="Open tools menu"
                aria-expanded={menuOpen}
                className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-all ${
                  menuOpen
                    ? "bg-green-600 border-green-600 text-white shadow-md"
                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-950/40 hover:text-green-700 dark:hover:text-green-400 hover:border-green-300 dark:hover:border-green-700"
                }`}
              >
                {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>

              {/* Dropdown */}
              {menuOpen && (
                <div className="absolute right-0 top-[calc(100%+10px)] w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden z-50"
                  style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}>

                  <div className="px-4 pt-4 pb-2 border-b border-gray-100 dark:border-gray-800">
                    <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">All 9 Tools — Free</p>
                  </div>

                  <div className="py-1.5">
                    {tools.map((tool) => {
                      const Icon = tool.icon;
                      const active = isActive(tool.slug);
                      return (
                        <Link
                          key={tool.slug}
                          href={`/tools/${tool.slug}`}
                          className={`flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl transition-all group ${
                            active
                              ? "bg-green-50 dark:bg-green-950/50"
                              : "hover:bg-gray-50 dark:hover:bg-gray-800"
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                            active
                              ? "bg-green-600 text-white"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:bg-green-100 dark:group-hover:bg-green-950/40 group-hover:text-green-600 dark:group-hover:text-green-400"
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium leading-tight ${active ? "text-green-700 dark:text-green-400" : "text-gray-900 dark:text-gray-100"}`}>{tool.name}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{tool.desc}</p>
                          </div>
                          {active
                            ? <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                            : <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 group-hover:text-green-500 shrink-0 transition-colors" />
                          }
                        </Link>
                      );
                    })}
                  </div>

                  <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Link href="/about" className="text-xs text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors font-medium">About</Link>
                      <Link href="/contact" className="text-xs text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors font-medium">Contact</Link>
                      <Link href="/privacy" className="text-xs text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors font-medium">Privacy</Link>
                    </div>
                    <span className="text-[10px] text-gray-300 dark:text-gray-600">by {AUTHOR}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Tool quick-tab bar (shown on tool pages) ── */}
        {tools.some((t) => isActive(t.slug)) && (
          <div className="border-t border-gray-100 dark:border-gray-800 bg-green-50/40 dark:bg-green-950/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex overflow-x-auto gap-0.5 py-1.5 no-scrollbar" style={{ scrollbarWidth: "none" }}>
                {tools.map((tool) => {
                  const active = isActive(tool.slug);
                  const Icon = tool.icon;
                  return (
                    <Link
                      key={tool.slug}
                      href={`/tools/${tool.slug}`}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium whitespace-nowrap transition-all shrink-0 ${
                        active
                          ? "bg-green-600 text-white shadow-sm"
                          : "text-gray-500 dark:text-gray-400 hover:text-green-700 dark:hover:text-green-400 hover:bg-green-100 dark:hover:bg-green-950/40"
                      }`}
                    >
                      <Icon className="w-3 h-3 shrink-0" />
                      {tool.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* ── Footer ── */}
      <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">

            {/* Brand */}
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #14532d, #22c55e)" }}>
                  <Layers className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold text-gray-900 dark:text-white">
                  Crop<span className="text-green-600 dark:text-green-400">Images</span>
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-3">
                Free browser-based image tools. All processing is local — your images never leave your device.
              </p>
              <a href={`mailto:${CONTACT_EMAIL}`}
                className="inline-flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors font-medium">
                <Mail className="w-3 h-3" />
                {CONTACT_EMAIL}
              </a>
            </div>

            {/* Tools col 1 */}
            <div>
              <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-3">Image Tools</p>
              <ul className="space-y-2">
                {tools.slice(0, 5).map((t) => (
                  <li key={t.slug}>
                    <Link href={`/tools/${t.slug}`} className="text-xs text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                      {t.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tools col 2 */}
            <div>
              <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-3">More Tools</p>
              <ul className="space-y-2">
                {tools.slice(5).map((t) => (
                  <li key={t.slug}>
                    <Link href={`/tools/${t.slug}`} className="text-xs text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                      {t.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-3">Company</p>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-xs text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="text-xs text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">Contact</Link></li>
                <li><Link href="/privacy" className="text-xs text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-xs text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              &copy; {new Date().getFullYear()} <span className="font-medium text-gray-500 dark:text-gray-400">{AUTHOR}</span>. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="text-xs text-green-600 dark:text-green-500 font-medium">Free &amp; Private</span>
              <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
              <span className="text-xs text-gray-400 dark:text-gray-500">No signup</span>
              <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
              <a href={DOMAIN} className="text-xs text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 transition-colors">cropimages.store</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
