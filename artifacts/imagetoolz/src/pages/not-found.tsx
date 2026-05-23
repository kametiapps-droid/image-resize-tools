import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/layout";
import { Home, Maximize2, Archive, Repeat, Crop, ArrowRight, Search } from "lucide-react";

const quickLinks = [
  { name: "Image Resizer",    href: "/",                         icon: Maximize2  },
  { name: "Image Compressor", href: "/tools/image-compressor",   icon: Archive    },
  { name: "Image Converter",  href: "/tools/image-converter",    icon: Repeat     },
  { name: "Image Cropper",    href: "/tools/image-cropper",      icon: Crop       },
];

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>404 — Page Not Found | CropImages</title>
        <meta name="description" content="This page doesn't exist. Head back to CropImages and use our free online image tools — resize, compress, convert, crop and more." />
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <Layout>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
          {/* 404 number */}
          <div className="relative inline-block mb-6">
            <span
              className="block text-[120px] sm:text-[160px] font-black leading-none select-none"
              style={{
                background: "linear-gradient(135deg, #14532d, #16a34a, #4ade80)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              404
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Page Not Found
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg max-w-md mx-auto mb-8 leading-relaxed">
            The page you're looking for doesn't exist or may have moved. Try one of our free image tools below.
          </p>

          {/* Primary CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 active:scale-95"
              style={{ background: "linear-gradient(135deg, #15803d, #16a34a)" }}
            >
              <Home className="w-4 h-4" />
              Go to Image Resizer
            </Link>
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
            >
              <Search className="w-4 h-4" />
              Browse All Tools
            </Link>
          </div>

          {/* Quick links */}
          <div className="border-t border-gray-200 dark:border-gray-800 pt-10">
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-5">
              Popular Tools
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="group flex flex-col items-center gap-2.5 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-green-400 dark:hover:border-green-500 hover:shadow-md transition-all"
                  >
                    <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-950/40 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5 text-green-600 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors text-center leading-tight">
                      {link.name}
                    </span>
                    <ArrowRight className="w-3 h-3 text-gray-300 dark:text-gray-600 group-hover:text-green-500 transition-colors" />
                  </Link>
                );
              })}
            </div>
          </div>

          <p className="mt-10 text-xs text-gray-400 dark:text-gray-500">
            Need help?{" "}
            <a href="mailto:iftechstudio@gmail.com" className="text-green-600 dark:text-green-400 hover:underline font-medium">
              iftechstudio@gmail.com
            </a>
          </p>
        </div>
      </Layout>
    </>
  );
}
