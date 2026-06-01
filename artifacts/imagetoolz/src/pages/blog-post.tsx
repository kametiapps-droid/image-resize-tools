import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/layout";
import { Link, useParams } from "wouter";
import { getBlogArticle, blogArticles } from "@/data/blog-articles";
import { Clock, ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import NotFound from "@/pages/not-found";

const DOMAIN = "imageresize.app";

export default function BlogPost() {
  const params = useParams<{ slug: string }>();
  const article = getBlogArticle(params.slug);

  if (!article) return <NotFound />;

  const currentIndex = blogArticles.findIndex((a) => a.slug === article.slug);
  const prev = currentIndex > 0 ? blogArticles[currentIndex - 1] : null;
  const next = currentIndex < blogArticles.length - 1 ? blogArticles[currentIndex + 1] : null;

  return (
    <>
      <Helmet>
        <title>{article.title} | Image Resize Blog</title>
        <meta name="description" content={article.description} />
        <link rel="canonical" href={`https://${DOMAIN}/blog/${article.slug}`} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.description} />
        <meta property="og:url" content={`https://${DOMAIN}/blog/${article.slug}`} />
        <meta property="og:type" content="article" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": article.title,
          "description": article.description,
          "datePublished": article.date,
          "dateModified": article.date,
          "author": { "@type": "Organization", "name": "Image Resize" },
          "publisher": { "@type": "Organization", "name": "Image Resize", "url": `https://${DOMAIN}` },
          "url": `https://${DOMAIN}/blog/${article.slug}`,
          "mainEntityOfPage": `https://${DOMAIN}/blog/${article.slug}`
        })}</script>
      </Helmet>
      <Layout>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">

          <Link href="/blog">
            <span className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors mb-8 cursor-pointer">
              <ArrowLeft className="w-4 h-4" /> Back to Blog
            </span>
          </Link>

          <header className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400">
                {article.category}
              </span>
              <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                <Clock className="w-3 h-3" /> {article.readTime}
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-snug mb-4">
              {article.title}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed">
              {article.description}
            </p>
            <div className="mt-4 text-sm text-gray-400 dark:text-gray-500">
              Published {new Date(article.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} &nbsp;·&nbsp; Image Resize Blog
            </div>
          </header>

          <article className="space-y-5 text-[15px] leading-relaxed text-gray-700 dark:text-gray-300">
            {article.body.map((para, i) => (
              <p key={i} dangerouslySetInnerHTML={{ __html: para }} />
            ))}
          </article>

          <div className="mt-12 p-6 rounded-2xl bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">Try the {article.tool}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Use our free, browser-based tool — no uploads, no sign-up, instant results.
            </p>
            <Link href={article.toolPath}>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors cursor-pointer">
                Open {article.tool} <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </div>

          {(prev || next) && (
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {prev && (
                <Link href={`/blog/${prev.slug}`}>
                  <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-green-200 dark:hover:border-green-800 transition-all cursor-pointer">
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-1 flex items-center gap-1"><ArrowLeft className="w-3 h-3" /> Previous</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white leading-snug">{prev.title}</p>
                  </div>
                </Link>
              )}
              {next && (
                <Link href={`/blog/${next.slug}`}>
                  <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-green-200 dark:hover:border-green-800 transition-all cursor-pointer sm:text-right">
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-1 flex items-center gap-1 sm:justify-end">Next <ArrowRight className="w-3 h-3" /></p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white leading-snug">{next.title}</p>
                  </div>
                </Link>
              )}
            </div>
          )}

        </div>
      </Layout>
    </>
  );
}
