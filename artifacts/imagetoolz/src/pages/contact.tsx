import { Layout } from "@/components/layout";
import { Mail, MessageCircle, Bug, Lightbulb, Clock } from "lucide-react";

const topics = [
  {
    icon: Bug,
    title: "Report a Bug",
    desc: "Found something that doesn't work correctly? Let us know so we can fix it quickly.",
    email: "bugs@imagetoolz.app",
  },
  {
    icon: Lightbulb,
    title: "Feature Request",
    desc: "Have an idea for a new tool or improvement? We'd love to hear your suggestions.",
    email: "ideas@imagetoolz.app",
  },
  {
    icon: MessageCircle,
    title: "General Inquiry",
    desc: "Any other questions, feedback, or partnership inquiries.",
    email: "hello@imagetoolz.app",
  },
  {
    icon: Mail,
    title: "Privacy or Legal",
    desc: "Privacy concerns, DMCA requests, or legal inquiries.",
    email: "legal@imagetoolz.app",
  },
];

export default function Contact() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 mb-5">
            <Mail className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Contact Us</h1>
          <p className="mt-3 text-gray-500 max-w-lg mx-auto text-base leading-relaxed">
            We're a small team dedicated to keeping ImageToolz fast, free, and private. We read every message and typically respond within 1–2 business days.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
          {topics.map((t) => {
            const Icon = t.icon;
            return (
              <div key={t.title} className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-blue-600" />
                  </div>
                  <h2 className="font-semibold text-gray-900">{t.title}</h2>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed mb-3">{t.desc}</p>
                <a
                  href={`mailto:${t.email}`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  {t.email}
                </a>
              </div>
            );
          })}
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Response Time</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                We typically respond to all inquiries within <strong>1–2 business days</strong>. For urgent bug reports affecting core tool functionality, we aim to respond within 24 hours. Please include as much detail as possible — such as which tool you were using, your browser and operating system, and what you expected to happen vs. what actually occurred.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            ImageToolz is a free service. We appreciate your patience and feedback — it directly shapes the tools we build.
          </p>
        </div>
      </div>
    </Layout>
  );
}
