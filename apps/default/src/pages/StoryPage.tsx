import { ArrowLeft, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SiteFooter, SiteHeader } from '@/components/OpenPressSiteChrome';
import { usePublishedArticles } from '@/hooks/use-publishing-data';

function safeImage(value: string) {
  return /^https?:\/\//i.test(value);
}

export default function StoryPage() {
  const { slug = '' } = useParams();
  const { articles, loading, error, updatedAt, refresh } = usePublishedArticles();
  const article = articles.find((item) => item.slug === slug);
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-5 pb-12 pt-8 md:px-8 md:pt-14">
        <Button asChild variant="ghost" className="min-h-11 -ml-3 rounded-xl"><Link to="/"><ArrowLeft size={16} /> Back to stories</Link></Button>
        {loading ? <div className="mt-8 space-y-4"><div className="h-10 w-3/4 animate-pulse rounded-lg bg-muted motion-reduce:animate-none" /><div className="h-5 w-1/3 animate-pulse rounded bg-muted motion-reduce:animate-none" /><div className="mt-10 h-80 animate-pulse rounded-2xl bg-muted motion-reduce:animate-none" /></div> : error && updatedAt == null ? <section className="mt-8 rounded-2xl border border-destructive/30 bg-destructive/5 p-6"><h1 className="font-serif text-2xl font-semibold">This story is not available right now.</h1><p className="mt-2 text-sm text-muted-foreground">{error.message}</p><Button className="mt-4 min-h-11" onClick={() => void refresh()}>Try again</Button></section> : article ? <article className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{article.format}</p>
          <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight tracking-tight md:text-5xl">{article.title}</h1>
          <p className="mt-4 text-sm text-muted-foreground">By <span className="text-foreground">{article.creator || 'Seven Feathers contributor'}</span></p>
          {safeImage(article.cover) ? <img src={article.cover} alt={`Cover art for ${article.title}`} className="mt-8 max-h-[30rem] w-full rounded-2xl border border-border/70 object-cover" /> : <div aria-hidden="true" className="mt-8 flex h-40 items-center justify-center rounded-2xl border border-border/70 bg-gradient-to-br from-primary/10 via-card to-muted/70 text-primary"><BookOpen size={34} strokeWidth={1.25} /></div>}
          {article.excerpt && <p className="mt-8 border-s-2 border-primary/50 ps-5 font-serif text-xl leading-8 text-muted-foreground">{article.excerpt}</p>}
          <div className="prose prose-stone mt-9 max-w-none leading-8 dark:prose-invert prose-headings:font-serif prose-a:text-primary prose-img:rounded-xl">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.body}</ReactMarkdown>
          </div>
        </article> : <section className="mt-12 rounded-2xl border border-border/70 bg-card/60 p-8 text-center"><h1 className="font-serif text-3xl font-semibold">That story is not on the shelf.</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">It may have been unpublished, or its address may have changed.</p><Button asChild className="mt-5 min-h-11 rounded-xl"><Link to="/">Browse published stories</Link></Button></section>}
        {error && updatedAt != null && <p role="status" className="mt-6 text-sm text-muted-foreground">Showing the most recent version. The last refresh did not complete. <button className="underline underline-offset-4" onClick={() => void refresh()}>Refresh now</button></p>}
      </main>
      <SiteFooter />
    </div>
  );
}
