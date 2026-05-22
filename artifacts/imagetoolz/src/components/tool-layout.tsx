import { Layout } from "@/components/layout";

export function ToolLayout({
  title,
  description,
  badge,
  children,
}: {
  toolId?: string;
  title: string;
  description: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <Layout>
      {/* ── Green hero ── */}
      <div
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #14532d 0%, #166534 40%, #16a34a 100%)",
        }}
      >
        {/* Decorative shapes */}
        <div className="absolute -top-14 -right-14 w-56 h-56 rounded-full bg-white/5" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/5" />
        <div className="absolute top-1/2 right-1/4 w-20 h-20 rounded-full bg-green-300/10" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-9">
          {badge && (
            <span className="inline-block mb-3 px-2.5 py-0.5 rounded-full bg-white/15 text-white/90 text-xs font-medium border border-white/20">
              {badge}
            </span>
          )}
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">{title}</h1>
          <p className="mt-2 text-green-100 text-base sm:text-lg max-w-2xl">{description}</p>
          <div className="flex flex-wrap gap-4 mt-5">
            {["Free", "No uploads", "Instant results"].map((tag) => (
              <span key={tag} className="flex items-center gap-1.5 text-green-100 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-green-300 inline-block" />
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </div>
    </Layout>
  );
}
