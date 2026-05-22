import { Layout } from "@/components/layout";

export function ToolLayout({
  title,
  description,
  children,
}: {
  toolId?: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Layout>
      <div className="bg-gradient-to-b from-blue-50 to-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
          <p className="mt-2 text-muted-foreground max-w-2xl">{description}</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </div>
    </Layout>
  );
}
