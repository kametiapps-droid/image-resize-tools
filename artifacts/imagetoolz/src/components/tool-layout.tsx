import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useGetTool } from "@workspace/api-client-react";

export function ToolLayout({ 
  toolId, 
  title, 
  description, 
  children 
}: { 
  toolId?: string; 
  title: string; 
  description: string; 
  children: React.ReactNode 
}) {
  return (
    <Layout>
      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tools
          </Link>
          <h1 className="text-3xl font-bold tracking-tight mb-2">{title}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">{description}</p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </div>
    </Layout>
  );
}
