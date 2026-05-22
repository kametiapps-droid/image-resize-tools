import { Layout } from "@/components/layout";
import { usePageTitle } from "@/hooks/use-page-title";
import { FileText, AlertTriangle, Scale, Globe, Ban } from "lucide-react";

const SITE = "CropImages";
const DOMAIN = "cropimages.store";
const EMAIL = "iftechstudio@gmail.com";
const AUTHOR = "If Tech Studio Team";

export default function Terms() {
  usePageTitle("Terms of Service");
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Terms of Service</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Last updated: May 22, 2026 &nbsp;·&nbsp; <span className="font-medium">{AUTHOR}</span></p>
          <p className="mt-4 text-gray-600 dark:text-gray-300 text-base leading-relaxed">
            Please read these Terms of Service carefully before using {SITE} ({DOMAIN}). By accessing or using our service, you agree to be bound by these terms.
          </p>
        </div>

        <div className="space-y-10 text-gray-700 dark:text-gray-300">

          <section>
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">1. Acceptance of Terms</h2>
            </div>
            <p className="leading-relaxed">
              By using {SITE} ("the Service"), you agree to these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use the Service. These terms apply to all users of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">2. Description of Service</h2>
            <p className="leading-relaxed">
              {SITE} provides free, browser-based image processing tools including image resizing, compression, format conversion, cropping, watermarking, rotation, color picking, PDF conversion, and metadata removal. All processing occurs locally in your browser — no images are uploaded to our servers.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <Ban className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">3. Acceptable Use</h2>
            </div>
            <p className="leading-relaxed mb-3">You agree to use the Service only for lawful purposes. You may not use {SITE} to:</p>
            <ul className="space-y-2 list-none">
              {[
                "Process, create, or distribute any content that is illegal, harmful, defamatory, obscene, or infringing on intellectual property rights.",
                "Attempt to reverse engineer, hack, or interfere with the Service or its underlying infrastructure.",
                "Use automated scripts, bots, or tools to make excessive requests to our servers beyond what is technically necessary for the tool to function.",
                "Misrepresent the origin of images you process or violate the copyright or privacy rights of others.",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">4. Intellectual Property</h2>
            <p className="leading-relaxed">
              You retain all ownership rights to the images you process using {SITE}. We do not claim any ownership or rights to your content. The {SITE} website, its design, code, and branding are owned by {AUTHOR} and may not be reproduced without permission.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">5. Disclaimer of Warranties</h2>
            </div>
            <p className="leading-relaxed">
              The Service is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not guarantee that the Service will be uninterrupted, error-free, or free of viruses or other harmful components. We make no warranty regarding the accuracy, reliability, or quality of the output produced by our tools.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <Scale className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">6. Limitation of Liability</h2>
            </div>
            <p className="leading-relaxed">
              To the maximum extent permitted by law, {AUTHOR} and {SITE} shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of data, revenue, or profits arising from your use of the Service, even if we have been advised of the possibility of such damages.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">7. Third-Party Advertising</h2>
            <p className="leading-relaxed">
              {SITE} displays advertisements provided by Google AdSense and potentially other third-party ad networks to fund the free service. We are not responsible for the content of these advertisements. By using our Service, you consent to the display of such advertisements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">8. Service Availability</h2>
            <p className="leading-relaxed">
              We reserve the right to modify, suspend, or discontinue the Service at any time without prior notice. We will not be liable to you or any third party for any such modification, suspension, or discontinuation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">9. Changes to Terms</h2>
            <p className="leading-relaxed">
              We reserve the right to update these Terms of Service at any time. Changes will be posted on this page with an updated "Last updated" date. Continued use of the Service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">10. Contact</h2>
            <p className="leading-relaxed">
              If you have any questions about these Terms of Service, please contact us:
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
  );
}
