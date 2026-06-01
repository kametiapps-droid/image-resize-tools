import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/layout";
import { Mail, MessageCircle, Bug, Lightbulb, Clock, MapPin } from "lucide-react";

const EMAIL  = "iftechstudio@gmail.com";
const AUTHOR = "If Tech Studio";
const SITE   = "Image Resize";
const DOMAIN = "imageresize.app";

const topics = [
  { icon: Bug,           title: "Report a Bug",       desc: "Found something that doesn't work correctly? Include your browser name, operating system, and what happened." },
  { icon: Lightbulb,     title: "Feature Request",    desc: "Have an idea for a new tool or an improvement to an existing one? We'd love to hear your suggestions." },
  { icon: MessageCircle, title: "General Inquiry",    desc: "Any other questions, feedback, business inquiries, or partnerships." },
  { icon: Mail,          title: "Privacy or Legal",   desc: "Privacy concerns, DMCA requests, data deletion requests, or any legal matters." },
];

export default function Contact() {
  return (
    <>
      <Helmet>
        <title>Contact Us — Image Resize | If Tech Studio</title>
        <meta name="description" content="Contact If Tech Studio — the team behind Image Resize. Report bugs, suggest features, or send general inquiries to iftechstudio@gmail.com. We respond within 1–2 business days." />
        <link rel="canonical" href="https://imageresize.app/contact" />
        <meta property="og:title" content="Contact Image Resize — If Tech Studio" />
        <meta property="og:description" content="Get in touch with the Image Resize team at iftechstudio@gmail.com. We respond to all messages within 1–2 business days." />
        <meta property="og:url" content="https://imageresize.app/contact" />
      </Helmet>
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5"
              style={{ background: "linear-gradient(135deg, #14532d, #22c55e)" }}>
              <Mail className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Contact Us</h1>
            <p className="mt-3 text-gray-500 dark:text-gray-400 max-w-lg mx-auto text-base leading-relaxed">
              We're <strong className="text-gray-700 dark:text-gray-200">{AUTHOR}</strong> — the team behind {SITE}. We read every message and typically respond within 1–2 business days.
            </p>
          </div>

          {/* Main email CTA */}
          <div className="mb-8 p-6 rounded-2xl text-center"
            style={{ background: "linear-gradient(135deg, #14532d, #16a34a)" }}>
            <p className="text-green-100 text-sm mb-2">All inquiries welcome at</p>
            <a href={`mailto:${EMAIL}`}
              className="text-2xl font-bold text-white hover:text-green-200 transition-colors">
              {EMAIL}
            </a>
            <p className="text-green-200 text-xs mt-2">{AUTHOR} · {DOMAIN}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
            {topics.map((t) => {
              const Icon = t.icon;
              return (
                <div key={t.title} className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-green-300 dark:hover:border-green-700 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-green-50 dark:bg-green-950/40 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="font-semibold text-gray-900 dark:text-white">{t.title}</h2>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-3">{t.desc}</p>
                  <a href={`mailto:${EMAIL}`} className="text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors hover:underline">
                    {EMAIL}
                  </a>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Response Time</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    We typically respond within <strong>1–2 business days</strong>. For urgent bug reports, we aim for 24 hours. Please include as much detail as possible about your issue.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">About the Team</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    <strong>{AUTHOR}</strong> — independent developers passionate about building free, privacy-respecting tools for everyone.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {SITE} is a free service by {AUTHOR}. We appreciate your feedback — it directly shapes the tools we build.
            </p>
          </div>
        </div>
      </Layout>
    </>
  );
}
