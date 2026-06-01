import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/layout";
import { Shield, Lock, Eye, Server, UserX, Mail } from "lucide-react";

const SITE   = "Image Resize";
const DOMAIN = "imageresize.app";
const EMAIL  = "iftechstudio@gmail.com";
const AUTHOR = "If Tech Studio";

export default function Privacy() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy — Image Resize | If Tech Studio</title>
        <meta name="description" content="Image Resize Privacy Policy — your images are never uploaded to any server. All processing happens locally in your browser. No personal data collected. Read our full policy." />
        <link rel="canonical" href="https://imageresize.app/privacy" />
        <meta property="og:title" content="Privacy Policy — Image Resize" />
        <meta property="og:description" content="Your images never leave your device. Image Resize processes everything locally in your browser. Read our full privacy policy." />
        <meta property="og:url" content="https://imageresize.app/privacy" />
      </Helmet>
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Privacy Policy</h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Last updated: May 23, 2026 &nbsp;·&nbsp; <span className="font-medium">{AUTHOR}</span></p>
            <p className="mt-4 text-gray-600 dark:text-gray-300 text-base leading-relaxed">
              At {SITE} ({DOMAIN}), your privacy is our top priority. This Privacy Policy explains how we collect, use, and protect your information when you use our free online image processing tools.
            </p>
          </div>

          <div className="space-y-10 text-gray-700 dark:text-gray-300">

            <section>
              <div className="flex items-center gap-2 mb-3">
                <Lock className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">1. Your Images Stay on Your Device</h2>
              </div>
              <p className="leading-relaxed">
                All image processing on {SITE} is performed <strong>entirely within your web browser</strong> using the HTML5 Canvas API and client-side JavaScript libraries. When you use any of our tools — Image Resizer, Compressor, Converter, Cropper, Watermark, Rotator, Color Picker, Image to PDF, or Metadata Remover — <strong>your image files are never transmitted to our servers</strong> or any third-party server.
              </p>
              <p className="mt-3 leading-relaxed">
                Your images are loaded directly into your browser's memory, processed locally, and the result is downloaded directly to your device. Once you close or refresh the browser tab, all data is gone. We have no technical ability to access, view, or store your images.
              </p>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">2. Information We Collect</h2>
              </div>
              <p className="leading-relaxed mb-3">
                While we do not collect your images, we collect limited, non-personal technical data to improve our service:
              </p>
              <ul className="space-y-2 list-none">
                {[
                  "Tool usage statistics (e.g., which tool was used, approximate file size in KB, file type such as JPEG or PNG). No file content is included.",
                  "Standard web server logs, including your anonymized IP address, browser type, and referring URL. These logs are automatically deleted after 30 days.",
                  "Anonymous aggregate analytics to understand which tools are most popular and how we can improve the service.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-3">
                <Server className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">3. Cookies and Third-Party Services</h2>
              </div>
              <p className="leading-relaxed mb-3">
                {SITE} may use the following third-party services which may set cookies or collect data according to their own privacy policies:
              </p>
              <ul className="space-y-2 list-none">
                {[
                  "Google AdSense: We display advertisements served by Google AdSense to keep the service free. Google may use cookies to serve ads based on your prior visits to our site or other sites. You can opt out of personalized advertising at Google's Ads Settings.",
                  "Google Analytics (if enabled): Helps us understand aggregate usage patterns. Data is anonymized and no personal identification is possible.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                You can control cookie preferences through your browser settings. Disabling cookies may affect some functionality.
              </p>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-3">
                <UserX className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">4. Children's Privacy</h2>
              </div>
              <p className="leading-relaxed">
                {SITE} is not directed to children under the age of 13. We do not knowingly collect any personal information from children. If you believe a child has provided personal information through our site, please contact us immediately at <a href={`mailto:${EMAIL}`} className="text-green-600 dark:text-green-400 hover:underline">{EMAIL}</a> so we can remove it.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">5. Data Retention</h2>
              <p className="leading-relaxed">
                Since we do not store your images, there is no image data to retain or delete. The limited, non-personal usage statistics we collect (tool name, file type, file size) are retained in aggregate for up to 12 months to analyze trends and improve the service. They contain no personally identifiable information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">6. Security</h2>
              <p className="leading-relaxed">
                We implement appropriate technical and organizational measures to protect the limited data we collect. Since your images are processed locally and never transmitted, the risk of unauthorized access to your image data is eliminated by design.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">7. Changes to This Policy</h2>
              <p className="leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of significant changes by updating the "Last updated" date at the top of this page. We encourage you to review this page periodically.
              </p>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-3">
                <Mail className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">8. Contact Us</h2>
              </div>
              <p className="leading-relaxed">
                If you have any questions, concerns, or requests regarding this Privacy Policy or your data, please contact us at:
              </p>
              <div className="mt-4 p-5 bg-green-50 dark:bg-green-950/30 rounded-xl border border-green-100 dark:border-green-900">
                <p className="font-semibold text-gray-900 dark:text-white">{AUTHOR}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{SITE} · {DOMAIN}</p>
                <a href={`mailto:${EMAIL}`} className="inline-block mt-2 text-green-600 dark:text-green-400 font-medium hover:underline">{EMAIL}</a>
              </div>
            </section>

          </div>
        </div>
      </Layout>
    </>
  );
}
