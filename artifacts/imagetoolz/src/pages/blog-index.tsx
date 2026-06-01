import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { blogArticles } from "@/data/blog-articles";
import { Clock, ArrowRight, BookOpen } from "lucide-react";

const DOMAIN = "imageresize.app";

const categoryColors: Record<string, string> = {
  "Image Editing": "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400",
  "Optimization": "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400",
  "Image Formats": "bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400",
  "Social Media": "bg-pink-50 dark:bg-pink-950/30 text-pink-700 dark:text-pink-400",
  "Copyright Protection": "bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400",
  "File Conversion": "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400",
  "Design Tools": "bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-400",
  "Privacy & Security": "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400",
};

export default function BlogIndex() {
  return (
    <>
      <Helmet>
        <title>Image Editing Blog — Tips, Guides & Tutorials | Image Resize</title>
        <meta name="description" content="Free guides on image resizing, compression, conversion, watermarking, and more. Learn how to optimize images for social media, web, and print — with expert tips and tutorials." />
        <link rel="canonical" href={`https://${DOMAIN}/blog`} />
        <meta property="og:title" content="Image Editing Blog — Image Resize" />
        <meta property="og:description" content="Expert guides on image resizing, compression, format conversion, watermarking, and privacy. Free tutorials for creators, designers, and developers." />
        <meta property="og:url" content={`https://${DOMAIN}/blog`} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Blog",
          "name": "Image Resize Blog",
          "url": `https://${DOMAIN}/blog`,
          "description": "Expert guides on image editing, optimization, and privacy",
          "publisher": { "@type": "Organization", "name": "Image Resize", "url": `https://${DOMAIN}` }
        })}</script>
      </Helmet>
      <Layout>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14">

          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 text-xs font-semibold uppercase tracking-widest mb-4">
              <BookOpen className="w-3.5 h-3.5" />
              Image Editing Blog
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">Tips, Guides & Tutorials</h1>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-base">
              In-depth guides on image resizing, compression, conversion, watermarking, privacy, and more — written for creators, designers, and developers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogArticles.map((article) => (
              <Link key={article.slug} href={`/blog/${article.slug}`}>
                <article className="group h-full flex flex-col bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 hover:border-green-200 dark:hover:border-green-800 hover:shadow-md transition-all cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColors[article.category] ?? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"}`}>
                      {article.category}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                      <Clock className="w-3 h-3" />
                      {article.readTime}
                    </div>
                  </div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white leading-snug mb-3 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors flex-1">
                    {article.title}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4 line-clamp-3">
                    {article.description}
                  </p>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(article.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400 group-hover:gap-2 transition-all">
                      Read article <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>

        </div>
      </Layout>
    </>
  );
}
