import { CheckCircle2 } from "lucide-react";

export interface ToolArticleStep {
  title: string;
  description: string;
}

export interface ToolArticleFaq {
  question: string;
  answer: string;
}

export interface ToolArticleProps {
  heading: string;
  subheading?: string;
  body?: string[];
  steps: ToolArticleStep[];
  tips: string[];
  faqs: ToolArticleFaq[];
  children?: React.ReactNode;
}

export function ToolArticle({ heading, subheading, body, steps, tips, faqs, children }: ToolArticleProps) {
  return (
    <section className="mt-16 border-t border-gray-100 dark:border-gray-800 pt-12">
      <div className="max-w-4xl mx-auto space-y-12">

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{heading}</h2>
          {subheading && <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto">{subheading}</p>}
        </div>

        {body && body.length > 0 && (
          <div className="prose prose-gray dark:prose-invert max-w-none space-y-4">
            {body.map((para, i) => (
              <p key={i} className="text-gray-600 dark:text-gray-300 leading-relaxed text-[15px]"
                dangerouslySetInnerHTML={{ __html: para }} />
            ))}
          </div>
        )}

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-green-600 dark:text-green-500 mb-6">How it works</h3>
          <ol className="space-y-5">
            {steps.map((step, i) => (
              <li key={i} className="flex gap-4 items-start">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{step.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {children && <div>{children}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-green-100 dark:border-green-900/50 bg-green-50/50 dark:bg-green-950/20 p-6">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-green-600 dark:text-green-500 mb-4">Pro Tips</h3>
            <ul className="space-y-3">
              {tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-5">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">FAQ</h3>
            {faqs.map((faq, i) => (
              <div key={i} className="space-y-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{faq.question}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
