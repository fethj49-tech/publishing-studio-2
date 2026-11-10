import { BookOpen, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function SiteHeader() {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-3 md:px-8">
        <Link to="/" className="flex min-h-11 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary"><BookOpen size={20} /></span>
          <span><span className="block font-serif text-lg font-semibold leading-tight">Seven Feathers</span><span className="block text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Publishing Studio</span></span>
        </Link>
        <nav aria-label="Main navigation" className="flex items-center gap-2 sm:gap-4">
          <Link to="/" className="hidden min-h-11 items-center px-3 text-sm text-muted-foreground transition-colors hover:text-foreground sm:flex">Stories</Link>
          <Button asChild variant="outline" className="min-h-11 rounded-xl"><Link to="/studio">Studio</Link></Button>
          <Button variant="ghost" size="icon" className="min-h-11 min-w-11 rounded-xl" aria-label="Toggle color theme" onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}>
            {resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border/70 px-5 py-9">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p className="font-serif text-base text-foreground">Seven Feathers Publishing Studio</p>
        <p>A home for independent work, made to be read and shared.</p>
      </div>
    </footer>
  );
}
