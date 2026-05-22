import { Layout } from "@/components/layout";
import {
  Layers, Shield, Zap, Heart, Globe, Code2,
  Maximize2, Archive, Repeat, Crop, Type, RotateCw, FileText, Pipette, ShieldOff
} from "lucide-react";
import { Link } from "wouter";

const tools = [
  { name: "Image Resizer", slug: "image-resizer", icon: Maximize2, desc: "Resize images to any dimension while preserving quality." },
  { name: "Image Compressor", slug: "image-compressor", icon: Archive, desc: "Reduce file size without visible quality loss." },
  { name: "Image Converter", slug: "image-converter", icon: Repeat, desc: "Convert between JPEG, PNG, WEBP, and GIF." },
  { name: "Image Cropper", slug: "image-cropper", icon: Crop, desc: "Crop images visually with a draggable crop box." },
  { name: "Watermark Tool", slug: "watermark", icon: Type, desc: "Add custom text watermarks to protect your images." },
  { name: "Rotate & Flip", slug: "image-rotator", icon: RotateCw, desc: "Rotate images by any angle and flip horizontally or vertically." },
  { name: "Image to PDF", slug: "image-to-pdf", icon: FileText, desc: "Combine multiple images into a single PDF document." },
  { name: "Color Picker", slug: "color-picker", icon: Pipette, desc: "Extract precise HEX, RGB, and HSL color values from images." },
  { name: "Metadata Remover", slug: "metadata-remover", icon: ShieldOff, desc: "Strip EXIF data including GPS location from images." },
];

const values = [
  {
    icon: Shield,
    title: "Privacy First",
    desc: "We built ImageToolz on a fundamental principle: your images should never leave your device. Every single tool runs entirely in your browser using the Web Canvas API.",
  },
  {
    icon: Zap,
    title: "Speed & Simplicity",
    desc: "No account creation, no waiting for uploads, no hidden fees. Open a tool, drag your image in, get your result. That's it.",
  },
  {
    icon: Heart,
    title: "Always Free",
    desc: "ImageToolz is and always will be free. We sustain the service through tasteful, non-intrusive advertising. No paywalls, no watermarks on your output.",
  },
  {
    icon: Globe,
    title: "Works Everywhere",
    desc: "Built with modern web standards, ImageToolz works on any device and any modern browser — desktop, tablet, or mobile.",
  },
];

export default function About() {
  return (
    <Layout>
      {/* Hero */}
      <section
        className="relative overflow-hidden py-20 px-4"
        style={{ background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%)" }}
      >
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-white/10" />
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
              <Layers className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">About ImageToolz</h1>
          <p className="mt-4 text-blue-100 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            A free, private, browser-based image toolkit built for everyone — designers, developers, photographers, and everyday users.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 space-y-16">

        {/* Our Mission */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <div className="prose prose-gray max-w-none text-gray-600 space-y-4 text-base leading-relaxed">
            <p>
              ImageToolz was created with a simple mission: to give everyone access to powerful image processing tools without the barriers of subscriptions, account registration, or privacy concerns.
            </p>
            <p>
              The web is full of image tools that require you to upload your photos to a remote server, create an account, and often pay for basic features. We believed there was a better way. With modern browser capabilities like the HTML5 Canvas API, Web Workers, and powerful JavaScript libraries, it's possible to do sophisticated image processing entirely on the user's device.
            </p>
            <p>
              The result is ImageToolz — a suite of 9 professional-grade tools that are completely free, require no sign-up, and never send your images anywhere. Your photos stay on your device. Always.
            </p>
          </div>
        </section>

        {/* Values */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Our Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <div className="w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{v.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* How it works */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How It Works</h2>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
            <div className="flex items-start gap-3 mb-3">
              <Code2 className="w-5 h-5 text-blue-600 mt-0.5" />
              <h3 className="font-semibold text-gray-900">Entirely Client-Side Processing</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mb-3">
              Every tool on ImageToolz uses browser-native APIs. When you select an image, it's loaded directly into your browser's memory using JavaScript's FileReader API. Processing happens using the HTML5 Canvas API, which lets us draw, transform, compress, and export images without any server involvement.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed">
              Libraries like <strong>browser-image-compression</strong> handle advanced compression, <strong>jsPDF</strong> handles PDF generation, and the native Canvas API handles resizing, cropping, rotation, watermarking, and color extraction. The result is fast, private, and completely free.
            </p>
          </div>
        </section>

        {/* Tools */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">All 9 Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map((t) => {
              const Icon = t.icon;
              return (
                <Link
                  key={t.slug}
                  href={`/tools/${t.slug}`}
                  className="group flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all"
                >
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{t.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5 leading-snug">{t.desc}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

      </div>
    </Layout>
  );
}
