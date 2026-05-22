import { Link } from "wouter";
import { useListTools, useGetStats, useGetPopularTools } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Shrink, Scissors, ArrowRightLeft, Image as ImageIcon, Type, RotateCw, FileBox, Pipette, Ghost } from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  'image-compressor': Shrink,
  'image-resizer': ImageIcon,
  'image-cropper': Scissors,
  'image-converter': ArrowRightLeft,
  'watermark': Type,
  'image-rotator': RotateCw,
  'image-to-pdf': FileBox,
  'color-picker': Pipette,
  'metadata-remover': Ghost,
};

export default function Home() {
  const { data: tools, isLoading: isLoadingTools } = useListTools();
  const { data: stats, isLoading: isLoadingStats } = useGetStats();
  const { data: popularTools, isLoading: isLoadingPopular } = useGetPopularTools();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 space-y-16">
        <section className="text-center space-y-6 max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold tracking-tight text-foreground">
            Precision Image Tools.<br />
            <span className="text-primary">Instant & Private.</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            A suite of powerful image utilities that run entirely in your browser. Fast, secure, and ready when you need them.
          </p>
        </section>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-center">
          {isLoadingStats ? (
            Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
          ) : (
            <>
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-primary">{stats?.totalProcessed?.toLocaleString() || "0"}</div>
                  <div className="text-sm font-medium text-muted-foreground mt-1">Images Processed</div>
                </CardContent>
              </Card>
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-primary">{stats?.uniqueUsersToday?.toLocaleString() || "0"}</div>
                  <div className="text-sm font-medium text-muted-foreground mt-1">Users Today</div>
                </CardContent>
              </Card>
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-primary">{stats?.totalTools || "0"}</div>
                  <div className="text-sm font-medium text-muted-foreground mt-1">Available Tools</div>
                </CardContent>
              </Card>
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-primary">{stats?.topCategoryName || "-"}</div>
                  <div className="text-sm font-medium text-muted-foreground mt-1">Top Category</div>
                </CardContent>
              </Card>
            </>
          )}
        </section>

        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">All Tools</h2>
            <p className="text-muted-foreground">Everything you need to modify, convert, and inspect images.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoadingTools ? (
              Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-48 w-full" />)
            ) : tools?.map((tool) => {
              const Icon = iconMap[tool.slug] || ImageIcon;
              return (
                <Link key={tool.id} href={`/tools/${tool.slug}`} className="block group">
                  <Card className="h-full hover-elevate transition-all border-border hover:border-primary/50 bg-card">
                    <CardHeader>
                      <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Icon className="w-6 h-6" />
                      </div>
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">{tool.name}</CardTitle>
                      <CardDescription className="text-base">{tool.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </Layout>
  );
}