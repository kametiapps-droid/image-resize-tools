import { Link } from "wouter";
import { LayoutDashboard, Scissors, ArrowRightLeft, Shrink, Image as ImageIcon, Type, RotateCw, FileBox, Pipette, Ghost } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl tracking-tight text-primary flex items-center gap-2">
            <ImageIcon className="w-6 h-6" />
            ImageToolz
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">Tools</Link>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">About</a>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <div className="container mx-auto">
          <p>© {new Date().getFullYear()} ImageToolz. All processing happens locally in your browser.</p>
        </div>
      </footer>
    </div>
  );
}
