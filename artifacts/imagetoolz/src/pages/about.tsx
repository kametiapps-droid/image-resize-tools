import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/layout";
import {
  Layers, Shield, Zap, Heart, Globe, Code2,
  Maximize2, Archive, Repeat, Crop, Type, RotateCw, FileText, Pipette, ShieldOff, Mail
} from "lucide-react";
import { Link } from "wouter";

const SITE   = "CropImages";
const DOMAIN = "cropimages.store";
const EMAIL  = "iftechstudio@gmail.com";
const AUTHOR = "If Tech Studio";

const tools = [
  { name: "Image Resizer",    slug: "image-resizer",    icon: Maximize2,  desc: "Resize images to any dimension while preserving quality." },
  { name: "Image Compressor", slug: "image-compressor", icon: Archive,    desc: "Reduce file size without visible quality loss." },
  { name: "Image Converter",  slug: "image-converter",  icon: Repeat,     desc: "Convert between JPEG, PNG, WEBP, and GIF." },
  { name: "Image Cropper",    slug: "image-cropper",    icon: Crop,       desc: "Crop images visually with a draggable crop box." },
  { name: "Watermark Tool",   slug: "watermark",        icon: Type,       desc: "Add custom text watermarks to protect your images." },
  { name: "Rotate & Flip",    slug: "image-rotator",    icon: RotateCw,   desc: "Rotate images by any angle and flip horizontally or vertically." },
  { name: "Image to PDF",     slug: "image-to-pdf",     icon: FileText,   desc: "Combine multiple images into a single PDF document." },
  { name: "Color Picker",     slug: "color-picker",     icon: Pipette,    desc: "Extract precise HEX, RGB, and HSL color values from images." },
  { name: "Metadata Remover", slug: "metadata-remover", icon: ShieldOff,  desc: "Strip EXIF data including GPS location from images." },
];

const values = [
  { icon: Shield, title: "Privacy First",      desc: "Your images never leave your device. Every tool runs entirely in your browser using the HTML5 Canvas API — zero server uploads." },
  { icon: Zap,    title: "Speed & Simplicity", desc: "No account creation, no waiting for uploads, no hidden fees. Open a tool, drop your image, get your result. That's it." },
  { icon: Heart,  title: "Always Free",        desc: "CropImages is and always will be free. We sustain the service through tasteful, non-intrusive advertising. No paywalls, no watermarks on output." },
  { icon: Globe,  title: "Works Everywhere",   desc: "Built with modern web standards, CropImages works on any device and any modern browser — desktop, tablet, or mobile." },
];

export default function About() {
  return (
    <>
      <Helmet>
        <title>About CropImages — Free Browser-Based Image Tools | If Tech Studio</title>
        <meta name="description" content="Learn about CropImages — 9 free browser-based image tools built by If Tech Studio. Resize, compress, convert, crop, watermark images 100% privately in your browser." />
        <link rel="canonical" href="https://cropimages.store/about" />
        <meta property="og:title" content="About CropImages — Free Image Tools by If Tech Studio" />
        <meta property="og:description" content="CropImages is a free suite of 9 image processing tools that run entirely in your browser. No uploads, no account, always free." />
        <meta property="og:url" content="https://cropimages.store/about" />
      </Helmet>
      <Layout>
        {/* Hero */}
        <section
          className="relative overflow-hidden py-20 px-4"
          style={{ background: "linear-gradient(135deg, #14532d 0%, #166534 40%, #16a34a 100%)" }}
        >
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
          <div className="relative max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <Layers className="w-7 h-7 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">About {SITE}</h1>
            <p className="mt-4 text-green-100 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
              A free, private, browser-based image toolkit built by <strong className="text-white">{AUTHOR}</strong>.
            </p>
            <a href={`mailto:${EMAIL}`} className="inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-lg bg-white/15 border border-white/20 text-white text-sm font-medium hover:bg-white/25 transition-colors">
              <Mail className="w-4 h-4" />
              {EMAIL}
            </a>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 space-y-16">

          {/* Mission */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h2>
            <div className="text-gray-600 dark:text-gray-300 space-y-4 text-base leading-relaxed">
              <p>{SITE} was created with a simple mission: to give everyone access to powerful image processing tools without the barriers of subscriptions, account registration, or privacy concerns.</p>
              <p>The web is full of image tools that require you to upload your photos to a remote server, create an account, and often pay for basic features. We believed there was a better way. With modern browser capabilities like the HTML5 Canvas API, Web Workers, and powerful JavaScript libraries, it's possible to do sophisticated image processing entirely on the user's device.</p>
              <p>The result is {SITE} — a suite of 9 professional-grade tools that are completely free, require no sign-up, and never send your images anywhere. Your photos stay on your device. Always.</p>
            </div>
          </section>

          {/* Values */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Our Values</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {values.map((v) => {
                const Icon = v.icon;
                return (
                  <div key={v.title} className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-11 h-11 rounded-lg bg-green-50 dark:bg-green-950/40 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{v.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{v.desc}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* How it works */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How It Works</h2>
            <div className="bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900 rounded-xl p-6">
              <div className="flex items-start gap-3 mb-3">
                <Code2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Entirely Client-Side Processing</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-3">
                Every tool on {SITE} uses browser-native APIs. When you select an image, it's loaded directly into your browser's memory using JavaScript's FileReader API. Processing happens using the HTML5 Canvas API, which lets us draw, transform, compress, and export images without any server involvement.
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                Libraries like <strong>browser-image-compression</strong> handle advanced compression, <strong>jsPDF</strong> handles PDF generation, and the native Canvas API handles resizing, cropping, rotation, watermarking, and color extraction. The result is fast, private, and completely free.
              </p>
            </div>
          </section>

          {/* Tools */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">All 9 Free Tools</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tools.map((t) => {
                const Icon = t.icon;
                const href = t.slug === "image-resizer" ? "/" : `/tools/${t.slug}`;
                return (
                  <Link
                    key={t.slug}
                    href={href}
                    className="group flex items-start gap-3 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-green-400 dark:hover:border-green-600 hover:shadow-md transition-all"
                  >
                    <div className="w-9 h-9 rounded-lg bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0 group-hover:bg-green-600 group-hover:text-white transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">{t.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">{t.desc}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* The team */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">The Team</h2>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: "linear-gradient(135deg, #14532d, #22c55e)" }}>
                  <Layers className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-lg">{AUTHOR}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{DOMAIN}</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
                We are {AUTHOR} — independent developers passionate about building free, privacy-respecting tools for everyone on the web. We believe great software shouldn't cost money or compromise your privacy.
              </p>
              <a href={`mailto:${EMAIL}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors">
                <Mail className="w-4 h-4" />
                {EMAIL}
              </a>
            </div>
          </section>

        </div>
      </Layout>
    </>
  );
}
