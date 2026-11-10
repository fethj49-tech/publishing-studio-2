import { ArrowRight, BookOpen, Feather, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SiteFooter, SiteHeader } from '@/components/OpenPressSiteChrome';
import { usePublishedArticles } from '@/hooks/use-publishing-data';

function coverIsSafe(value: string) {
  return /^https?:\/\//i.test(value);
}

export default function HomePage() {
  const { articles, loading, error, updatedAt, refresh } = usePublishedArticles();
  const sorted = [...articles].sort((a, b) => a.title.localeCompare(b.title));
  const lead = sorted[0];
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-5 pb-12 pt-8 md:px-8 md:pt-14">
        <section className="relative isolate overflow-hidden rounded-[2rem] border border-border/70 bg-gradient-to-br from-primary/10 via-card to-muted/60 px-6 py-10 shadow-xl shadow-primary/5 md:px-12 md:py-16">
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full border border-primary/10" />
          <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full border border-primary/15" />
          <div className="relative max-w-3xl">
            <Badge variant="outline" className="mb-5 gap-2 rounded-full border-primary/20 bg-background/70 px-3 py-1 text-primary"><Feather size={14} /> Independent voices, thoughtfully published</Badge>
            <h1 className="font-serif text-4xl font-semibold leading-[1.08] tracking-tight md:text-6xl">Work worth sharing deserves <span className="text-primary">room to be read.</span></h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg md:leading-8">Seven Feathers Publishing Studio is a home for writing, art, audio, and film. Browse published work, or step into the studio to shape and publish your own.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#stories" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Read the stories <ArrowRight size={16} /></a>
              <Button asChild variant="outline" className="min-h-11 rounded-xl"><Link to="/studio">Enter the studio</Link></Button>
            </div>
            <div className="mt-10 flex items-center gap-3 border-t border-border/60 pt-5 text-sm text-muted-foreground"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><BookOpen size={17} /></span><span><strong className="text-foreground tabular-nums">{loading ? '…' : articles.length}</strong> published {articles.length === 1 ? 'story' : 'stories'}</span></div>
          </div>
        </section>

        <section id="stories" className="scroll-mt-24 pt-16">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">The reading room</p><h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight md:text-4xl">Published work</h2></div>
            <p className="max-w-md text-sm leading-6 text-muted-foreground">A quiet shelf for stories, ideas, and creative work ready to meet its readers.</p>
          </div>
          {loading ? <div className="grid gap-5 md:grid-cols-2"><div className="h-64 animate-pulse rounded-2xl bg-muted motion-reduce:animate-none" /><div className="h-64 animate-pulse rounded-2xl bg-muted motion-reduce:animate-none" /></div> : error && updatedAt == null ? <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6"><p className="font-medium">The reading room could not load.</p><p className="mt-2 text-sm text-muted-foreground">{error.message}</p><Button className="mt-4 min-h-11" onClick={() => void refresh()}>Try again</Button></div> : lead ? <div className="grid gap-5 md:grid-cols-2">
            {sorted.map((article, index) => <Card key={article.id} className={index === 0 ? 'overflow-hidden rounded-2xl border-border/70 bg-card/70 shadow-lg shadow-primary/5 md:col-span-2 md:grid md:grid-cols-[.9fr_1.1fr]' : 'overflow-hidden rounded-2xl border-border/70 bg-card/70 shadow-sm transition hover:-translate-y-1 hover:shadow-lg'}>
              {coverIsSafe(article.cover) ? <img src={article.cover} alt={`Cover art for ${article.title}`} className={index === 0 ? 'h-56 w-full object-cover md:h-full' : 'h-48 w-full object-cover'} loading="lazy" /> : <div aria-hidden="true" className={`flex items-center justify-center bg-gradient-to-br from-primary/15 via-card to-muted/70 text-primary ${index === 0 ? 'min-h-56 md:min-h-80' : 'h-48'}`}><BookOpen size={36} strokeWidth={1.25} /></div>}
              <CardContent className={index === 0 ? 'flex flex-col justify-center p-6 md:p-10' : 'p-6'}>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{article.format}</p>
                <h3 className="mt-3 font-serif text-2xl font-semibold leading-tight md:text-3xl"><Link className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" to={`/story/${encodeURIComponent(article.slug)}`}>{article.title}</Link></h3>
                <p className="mt-2 text-sm text-muted-foreground">By {article.creator || 'Seven Feathers contributor'}</p>
                <p className="mt-4 line-clamp-3 leading-7 text-muted-foreground">{article.excerpt || article.body.slice(0, 190)}</p>
                <Link className="mt-5 inline-flex min-h-11 w-fit items-center gap-2 font-medium text-primary" to={`/story/${encodeURIComponent(article.slug)}`}>Read story <ArrowRight size={16} /></Link>
              </CardContent>
            </Card>)}
          </div> : <div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-12 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Sparkles size={21} /></span><h3 className="mt-4 font-serif text-2xl font-semibold">A shelf waiting for its first story</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">Nothing has been published here yet. When a story is ready, it will appear in this reading room.</p><Button asChild className="mt-5 min-h-11 rounded-xl"><Link to="/studio">Open the studio</Link></Button></div>}
          {error && updatedAt != null && <p role="status" className="mt-4 text-sm text-muted-foreground">Showing the most recent stories. The last refresh did not complete. <button className="underline underline-offset-4" onClick={() => void refresh()}>Refresh now</button></p>}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
