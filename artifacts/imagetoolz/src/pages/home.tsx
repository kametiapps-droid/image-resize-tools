import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { useListTools } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Maximize2, Archive, Repeat, Crop, Type, RotateCw, FileText, Pipette, ShieldOff, CheckCircle2,
  Zap, Lock, Star, ArrowRight, Upload, Settings2, Download, ChevronRight,
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

const STATIC_TOOLS = [
  { id: "1", slug: "image-resizer",    name: "Image Resizer",       description: "Resize to exact pixels or social media presets. Quality control, format picker, ratio lock." },
  { id: "2", slug: "image-compressor", name: "Image Compressor",    description: "Reduce file size by up to 80% without visible quality loss. Perfect for web and email." },
  { id: "3", slug: "image-converter",  name: "Image Converter",     description: "Convert between JPEG, PNG, WEBP, and GIF instantly in your browser." },
  { id: "4", slug: "image-cropper",    name: "Image Cropper",       description: "Drag-and-drop visual crop with rule-of-thirds guides and aspect ratio presets." },
  { id: "5", slug: "watermark",        name: "Add Watermark",       description: "Add custom text watermarks. Control position, size, opacity, and color." },
  { id: "6", slug: "image-rotator",    name: "Rotate & Flip",       description: "Rotate to any angle, flip horizontal or vertical with live canvas preview." },
  { id: "7", slug: "image-to-pdf",     name: "Image to PDF",        description: "Combine up to 20 images into one PDF. Choose page size and orientation." },
  { id: "8", slug: "color-picker",     name: "Color Picker",        description: "Click anywhere on an image to extract HEX, RGB, and HSL color values." },
  { id: "9", slug: "metadata-remover", name: "Remove Metadata",     description: "Strip GPS location, camera data, and all EXIF metadata before sharing." },
];

type Tool = { id: string | number; slug: string; name: string; description: string };

const features = [
  "100% free — no account needed",
  "All processing runs in your browser",
  "Images never leave your device",
  "No file size limits",
  "Works on any device",
];

const whyItems = [
  {
    Icon: Lock,
    title: "Private by Design",
    desc: "Every tool processes images locally in your browser using the Canvas API. Your photos never touch a server — guaranteed.",
  },
  {
    Icon: Zap,
    title: "Instant Results",
    desc: "No queue, no wait. Processing is instant because it happens directly on your device with your CPU.",
  },
  {
    Icon: CheckCircle2,
    title: "Always 100% Free",
    desc: "No subscriptions, no watermarks, no file limits, no account. Just open a tool and use it.",
  },
];

export default function Home() {
  const { data: apiTools, isLoading } = useListTools();
  const tools: Tool[] = (apiTools as Tool[] | undefined) ?? (isLoading ? [] : STATIC_TOOLS);

  return (
    <>
      <Helmet>
        <title>Free Online Image Tools — Resize, Compress, Convert | CropImages</title>
        <meta name="description" content="9 free browser-based image tools: resize, compress, convert, crop, watermark, rotate, image to PDF, color picker, and metadata remover. No upload. No signup. Instant results." />
      </Helmet>
      <Layout>
        {/* ── Hero ── */}
        <section
          className="relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #14532d 0%, #166534 50%, #16a34a 100%)" }}
        >
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -bottom-14 -left-14 w-56 h-56 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute top-1/2 right-1/3 w-28 h-28 rounded-full bg-green-300/10 pointer-events-none" />

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/90 text-sm font-medium mb-6">
              <Star className="w-3.5 h-3.5 text-yellow-300" />
              9 free image tools — no signup required
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight mb-5">
              Free Online
              <span className="block text-green-300">Image Tools</span>
            </h1>
            <p className="text-lg sm:text-xl text-green-100 max-w-2xl mx-auto leading-relaxed mb-8">
              Resize, compress, convert, crop, watermark, and more — all directly in your browser.
              <strong className="text-white"> No uploads. No sign-up. Completely free.</strong>
            </p>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-8">
              {features.map((f) => (
                <span key={f} className="flex items-center gap-1.5 text-green-100 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-300 shrink-0" />
                  {f}
                </span>
              ))}
            </div>
            <Link href="/tools/image-resizer"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-green-800 bg-white hover:bg-green-50 transition-all active:scale-95 shadow-lg"
              style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
              Start with Image Resizer
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* ── Tools Grid ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Tools</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Choose a tool to get started — no login needed, instant results.</p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array(9).fill(0).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tools.map((tool: Tool) => {
                const Icon = iconMap[tool.slug] ?? Maximize2;
                const isPopular = tool.slug === "image-resizer";
                return (
                  <Link
                    key={tool.id}
                    href={tool.slug === "image-resizer" ? "/" : `/tools/${tool.slug}`}
                    data-testid={`card-tool-${tool.id}`}
                    className="group relative flex items-start gap-4 p-5 rounded-xl border-2 bg-white dark:bg-gray-900 transition-all hover:shadow-lg"
                    style={{
                      borderColor: isPopular ? "#16a34a" : undefined,
                    }}
                  >
                    {isPopular && (
                      <span className="absolute -top-2.5 left-4 px-2.5 py-0.5 rounded-full text-xs font-bold text-white"
                        style={{ background: "linear-gradient(90deg, #15803d, #22c55e)" }}>
                        Most Popular
                      </span>
                    )}
                    <div
                      className="shrink-0 w-11 h-11 rounded-lg flex items-center justify-center transition-all group-hover:scale-110"
                      style={{
                        background: isPopular ? "linear-gradient(135deg, #dcfce7, #bbf7d0)" : "#f0fdf4",
                        color: "#16a34a",
                      }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors flex items-center gap-1.5">
                        {tool.name}
                        <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1 group-hover:translate-x-0 transform" />
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">{tool.description}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* ── How It Works ── */}
        <section className="border-t border-gray-200 dark:border-gray-800 py-14 px-4 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">How It Works</h2>
            <p className="text-center text-gray-500 dark:text-gray-400 mb-10">Resize any image in 3 simple steps — takes under 10 seconds.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 relative">
              {[
                {
                  Icon: Upload,
                  step: "1",
                  title: "Upload Your Image",
                  desc: "Drag & drop or click to select any JPEG, PNG, WEBP, or GIF from your device.",
                  color: "#16a34a",
                  bg: "#dcfce7",
                },
                {
                  Icon: Settings2,
                  step: "2",
                  title: "Choose Size or Preset",
                  desc: "Pick from 25+ social media presets or enter a custom width & height. Lock aspect ratio if needed.",
                  color: "#0ea5e9",
                  bg: "#e0f2fe",
                },
                {
                  Icon: Download,
                  step: "3",
                  title: "Download Instantly",
                  desc: "Click Process — your resized image is ready in milliseconds. Download in JPEG, PNG, or WEBP.",
                  color: "#8b5cf6",
                  bg: "#ede9fe",
                },
              ].map((item, i) => (
                <div key={item.step} className="relative flex flex-col items-center text-center px-6 py-8">
                  {i < 2 && (
                    <div className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 w-8 h-8 rounded-full bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 items-center justify-center">
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                  <div className="relative mb-4">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm"
                      style={{ background: item.bg }}>
                      <item.Icon className="w-7 h-7" style={{ color: item.color }} />
                    </div>
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full text-white text-xs font-black flex items-center justify-center shadow"
                      style={{ background: item.color }}>
                      {item.step}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1.5">{item.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/tools/image-resizer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 active:scale-95"
                style={{ background: "linear-gradient(135deg, #15803d, #16a34a)" }}>
                Try the Image Resizer
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Resize for Any Platform ── */}
        <section className="border-t border-gray-200 dark:border-gray-800 py-14 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Resize for Any Platform</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">25+ presets built-in — click any to start resizing immediately.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                { name: "Instagram Post",   w: 1080, h: 1080, category: "Social",  gradient: "linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)" },
                { name: "Instagram Story",  w: 1080, h: 1920, category: "Social",  gradient: "linear-gradient(135deg, #f09433 0%, #bc1888 100%)" },
                { name: "Instagram Reel",   w: 1080, h: 1920, category: "Social",  gradient: "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)" },
                { name: "Facebook Cover",   w: 1200, h: 630,  category: "Social",  gradient: "linear-gradient(135deg, #1877f2, #0d6efd)" },
                { name: "Twitter/X Post",   w: 1600, h: 900,  category: "Social",  gradient: "linear-gradient(135deg, #0f0f0f, #3a3a3a)" },
                { name: "Twitter/X Banner", w: 1500, h: 500,  category: "Social",  gradient: "linear-gradient(135deg, #14171a, #657786)" },
                { name: "YouTube Thumbnail",w: 1280, h: 720,  category: "Video",   gradient: "linear-gradient(135deg, #ff0000, #cc0000)" },
                { name: "WhatsApp DP",      w: 512,  h: 512,  category: "Social",  gradient: "linear-gradient(135deg, #25d366, #128c7e)" },
                { name: "LinkedIn Post",    w: 1200, h: 627,  category: "Social",  gradient: "linear-gradient(135deg, #0a66c2, #0077b5)" },
                { name: "LinkedIn Banner",  w: 1584, h: 396,  category: "Social",  gradient: "linear-gradient(135deg, #0a66c2, #004182)" },
                { name: "Pinterest Pin",    w: 1000, h: 1500, category: "Social",  gradient: "linear-gradient(135deg, #e60023, #ad081b)" },
                { name: "Website Banner",   w: 1920, h: 600,  category: "Web",     gradient: "linear-gradient(135deg, #667eea, #764ba2)" },
              ].map((preset) => {
                const aspectRatio = preset.w / preset.h;
                const maxW = 160;
                const maxH = 90;
                let boxW: number, boxH: number;
                if (aspectRatio >= 1) {
                  boxW = maxW;
                  boxH = Math.round(maxW / aspectRatio);
                } else {
                  boxH = maxH;
                  boxW = Math.round(maxH * aspectRatio);
                }
                boxH = Math.max(boxH, 32);
                boxW = Math.max(boxW, 32);
                return (
                  <Link
                    key={preset.name}
                    href="/tools/image-resizer"
                    className="group flex flex-col items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-green-400 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-center w-full h-24 bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden">
                      <div
                        className="rounded-md shadow-sm transition-transform group-hover:scale-105"
                        style={{
                          width: boxW,
                          height: boxH,
                          background: preset.gradient,
                          minWidth: 28,
                          minHeight: 28,
                        }}
                      />
                    </div>
                    <div className="text-center w-full">
                      <div className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors leading-tight">
                        {preset.name}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 font-mono">
                        {preset.w} × {preset.h} px
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="mt-8 p-5 rounded-2xl border border-green-200 dark:border-green-900 flex flex-col sm:flex-row items-center justify-between gap-4"
              style={{ background: "linear-gradient(135deg, #f0fdf4, #dcfce7)" }}>
              <div>
                <p className="font-bold text-gray-900 text-base">Need a custom size?</p>
                <p className="text-sm text-gray-600 mt-0.5">Enter exact pixel dimensions — width, height, quality, and output format.</p>
              </div>
              <Link href="/tools/image-resizer"
                className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white transition-all hover:opacity-90 text-sm"
                style={{ background: "linear-gradient(135deg, #15803d, #16a34a)" }}>
                Custom Resize
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Why CropImages ── */}
        <section className="border-t border-gray-200 dark:border-gray-700 py-14 px-4"
          style={{ background: "linear-gradient(to bottom, #f0fdf4, white)" }}>
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-3">Why CropImages?</h2>
            <p className="text-center text-gray-500 dark:text-gray-400 mb-10 max-w-xl mx-auto">
              Built for speed, privacy, and simplicity. No bloat, no paywalls, no nonsense.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {whyItems.map(({ Icon, title, desc }) => (
                <div key={title} className="text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
                    style={{ background: "linear-gradient(135deg, #dcfce7, #bbf7d0)" }}>
                    <Icon className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">{title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SEO Article ── */}
        <section className="border-t border-gray-200 dark:border-gray-700 py-14 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Free Online Image Tools — Complete Guide</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <article>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">What Is CropImages?</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  CropImages is a free suite of 9 browser-based image editing tools that run entirely on your device. Unlike traditional image editors that upload your photos to a remote server, CropImages processes everything locally using the HTML5 Canvas API and modern browser technology. This means your images are never uploaded, your privacy is always protected, and results are instant.
                </p>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mt-3">
                  Whether you need to resize an image for Instagram, compress a photo for email, remove GPS metadata before sharing, or convert between JPEG and WEBP — CropImages has a dedicated tool for each task with a clean, step-by-step workflow.
                </p>
              </article>
              <article>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">All 9 Free Image Tools</h3>
                <ul className="space-y-2.5">
                  {[
                    { name: "Image Resizer", desc: "Resize images with 25+ social media presets, quality slider, format picker" },
                    { name: "Image Compressor", desc: "Reduce file size by up to 80% without visible quality loss" },
                    { name: "Image Converter", desc: "Convert between JPEG, PNG, WEBP, and GIF" },
                    { name: "Image Cropper", desc: "Visual drag-and-drop crop with aspect ratio presets" },
                    { name: "Watermark Tool", desc: "Add text watermarks with custom position, size, and opacity" },
                    { name: "Rotate & Flip", desc: "Rotate to any angle, flip horizontally or vertically" },
                    { name: "Image to PDF", desc: "Combine multiple images into a PDF document" },
                    { name: "Color Picker", desc: "Extract HEX, RGB, and HSL colors from any image" },
                    { name: "Metadata Remover", desc: "Strip GPS location and EXIF data for privacy" },
                  ].map((t) => (
                    <li key={t.name} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        <strong className="text-gray-800 dark:text-gray-100">{t.name}</strong> — {t.desc}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            </div>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { q: "Is CropImages really free?", a: "Yes — 100% free, forever. No account, no payment, no watermarks on your output." },
                { q: "Are my images uploaded to a server?", a: "No. All processing happens in your browser using the Canvas API. Your files never leave your device." },
                { q: "What image formats are supported?", a: "JPEG, PNG, WEBP, and GIF are supported across all tools. The PDF tool also accepts all of these." },
                { q: "Is there a file size limit?", a: "No enforced limit — your browser's available memory is the only constraint. Most images work perfectly." },
              ].map((faq) => (
                <div key={faq.q} className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm mb-1.5">{faq.q}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
}
