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
      {/* Rich blue hero */}
      <div
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%)",
        }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-10 bg-white" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-10 bg-white" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-9">
          {badge && (
            <span className="inline-block mb-3 px-2.5 py-0.5 rounded-full bg-white/20 text-white/90 text-xs font-medium border border-white/20">
              {badge}
            </span>
          )}
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">{title}</h1>
          <p className="mt-2 text-blue-100 text-base sm:text-lg max-w-2xl">{description}</p>
          <div className="flex flex-wrap gap-4 mt-5">
            {["Free", "No uploads", "Instant results"].map((tag) => (
              <span key={tag} className="flex items-center gap-1.5 text-blue-100 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-300 inline-block" />
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
