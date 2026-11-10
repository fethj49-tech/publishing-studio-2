import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { BookOpen, Check, Eye, FilePlus2, Globe2, Save, Send, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SiteFooter, SiteHeader } from '@/components/OpenPressSiteChrome';
import { emptyDraft, useStudioData, type DraftValues } from '@/hooks/use-publishing-data';
import { getFieldValue, getTitle } from '@/lib/genesis-data';

const selectClass = 'flex min-h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export default function StudioPage() {
  const data = useStudioData();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<DraftValues>(emptyDraft);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [formError, setFormError] = useState('');
  const selected = useMemo(() => data.drafts.find((draft) => draft.id === selectedId) ?? null, [data.drafts, selectedId]);

  useEffect(() => {
    if (selected) {
      const { id, stage, publishedId, ...values } = selected;
      setForm(values);
      setNotice(stage === 'Published' ? 'The current version is live. Save your changes here, then publish edits to update readers.' : '');
    }
  }, [selected]);

  const set = (key: keyof DraftValues, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const chooseDraft = (id: string) => { setFormError(''); setSelectedId(id); };
  const startNew = () => { setSelectedId(null); setForm(emptyDraft); setNotice(''); setFormError(''); };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true); setFormError(''); setNotice('');
    try {
      const id = await data.saveDraft(selectedId, form, selected?.stage ?? 'Idea');
      if (!selectedId && id) setSelectedId(id);
      setNotice(selected?.stage === 'Published' ? 'Changes saved to your studio. The current version remains live until you publish edits.' : 'Draft saved. It is not public until you publish it.');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'The draft could not be saved.');
    } finally { setBusy(false); }
  };

  const publish = async () => {
    if (!selectedId) { setFormError('Save this draft before publishing.'); return; }
    setBusy(true); setFormError(''); setNotice('');
    try {
      await data.publishDraft(selectedId, form, selected?.publishedId ?? '');
      setNotice('Published to the public website.');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'The story could not be published.');
    } finally { setBusy(false); }
  };

  const unpublish = async () => {
    if (!selectedId || !selected?.publishedId) return;
    if (!window.confirm('Remove this story from the public website? The draft will stay in your studio.')) return;
    setBusy(true); setFormError(''); setNotice('');
    try {
      await data.unpublishDraft(selectedId, selected.publishedId);
      setNotice('Unpublished. The draft is still here and can be published again.');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'The story could not be unpublished.');
    } finally { setBusy(false); }
  };

  const visibleDrafts = [...data.drafts].sort((a, b) => a.title.localeCompare(b.title));
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl px-5 pb-12 pt-8 md:px-8 md:pt-12">
        <section className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-gradient-to-br from-primary/10 via-card to-muted/50 p-6 shadow-lg shadow-primary/5 md:p-9">
          <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-20 h-56 w-56 rounded-full border border-primary/15" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><Badge variant="outline" className="gap-2 rounded-full border-primary/20 bg-background/70 text-primary"><Sparkles size={14} /> Editorial workspace</Badge><h1 className="mt-4 font-serif text-4xl font-semibold tracking-tight md:text-5xl">Your publishing studio</h1><p className="mt-3 max-w-2xl leading-7 text-muted-foreground">Shape a draft, save it to your desk, and publish it to the public reading room when it is ready.</p></div><Button onClick={startNew} className="min-h-11 shrink-0 rounded-xl"><FilePlus2 size={16} /> New draft</Button></div>
        </section>

        {data.error && data.drafts.length === 0 && data.articles.length === 0 && data.digests.length === 0 && <div className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/5 p-5"><p className="font-medium">Your studio records could not load.</p><p className="mt-2 text-sm text-muted-foreground">{data.error.message}</p><Button className="mt-4 min-h-11" onClick={() => void data.refresh()}>Try again</Button></div>}
        {data.error && (data.drafts.length > 0 || data.articles.length > 0 || data.digests.length > 0) && <p role="status" className="mt-4 text-sm text-muted-foreground">Showing the most recent studio records. The last refresh did not complete. <button className="underline underline-offset-4" onClick={() => void data.refresh()}>Refresh now</button></p>}

        <div className="mt-8 grid gap-7 lg:grid-cols-[minmax(0,.78fr)_minmax(0,1.5fr)]">
          <aside className="space-y-6">
            <Card className="rounded-2xl border-border/70 bg-card/70">
              <CardHeader className="flex-row items-center justify-between"><div><CardTitle className="font-serif text-2xl">Your drafts</CardTitle><CardDescription className="mt-2">{visibleDrafts.length} {visibleDrafts.length === 1 ? 'work' : 'works'} on the desk</CardDescription></div><BookOpen className="text-primary" size={20} /></CardHeader>
              <CardContent className="space-y-2">
                {data.loading && visibleDrafts.length === 0 ? [1, 2].map((item) => <div key={item} className="h-16 animate-pulse rounded-xl bg-muted motion-reduce:animate-none" />) : visibleDrafts.length ? visibleDrafts.map((draft) => <button key={draft.id} onClick={() => chooseDraft(draft.id)} className={`flex min-h-14 w-full items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left transition hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${selectedId === draft.id ? 'border-primary/40 bg-primary/5' : 'border-border/70 bg-background/50'}`}><span className="min-w-0"><span className="block truncate font-medium">{draft.title || 'Untitled work'}</span><span className="mt-1 block truncate text-xs text-muted-foreground">{draft.creator || 'Creator not set'}</span></span><Badge variant="outline" className="shrink-0">{draft.stage}</Badge></button>) : <p className="rounded-xl border border-dashed border-border p-4 text-sm leading-6 text-muted-foreground">Your desk is clear. Start a draft to shape the first story.</p>}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/70 bg-card/70">
              <CardHeader><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><Sparkles size={17} /></span><div><CardTitle className="font-serif text-xl">Weekly notes</CardTitle><CardDescription className="mt-1">From your Monday publishing review</CardDescription></div></div></CardHeader>
              <CardContent className="space-y-3">
                {data.digests.length ? data.digests.map((digest) => <div key={digest.id} className="rounded-xl border border-border/60 bg-background/60 p-4"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">{getFieldValue(digest, 'Period') || 'Weekly review'}</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6">{getFieldValue(digest, 'Digest Text') || getTitle(digest, 'Digest Text') || digest.content || 'A review is on file.'}</p></div>) : <p className="rounded-xl border border-dashed border-border p-4 text-sm leading-6 text-muted-foreground">No weekly notes have landed yet. They will appear here after the Monday review runs.</p>}
              </CardContent>
            </Card>
          </aside>

          <Card className="rounded-2xl border-border/70 bg-card/70 shadow-lg shadow-primary/5">
            <CardHeader><CardTitle className="font-serif text-2xl">{selected ? 'Edit your draft' : 'Shape a story'}</CardTitle><CardDescription>Save your work privately, then publish it to the public reading room when it is ready.</CardDescription></CardHeader>
            <CardContent>
              <form onSubmit={save} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2"><Label htmlFor="draft-title">Story title</Label><Input id="draft-title" autoComplete="off" required value={form.title} onChange={(event) => set('title', event.target.value)} placeholder="A title readers will remember" className="min-h-11 rounded-xl" /></div>
                  <div className="space-y-2"><Label htmlFor="draft-creator">Creator</Label><Input id="draft-creator" autoComplete="name" required value={form.creator} onChange={(event) => set('creator', event.target.value)} placeholder="Your name or studio" className="min-h-11 rounded-xl" /></div>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2"><Label htmlFor="draft-format">Format</Label><select id="draft-format" value={form.format} onChange={(event) => set('format', event.target.value)} className={selectClass}><option>Written work</option><option>Visual art</option><option>Audio</option><option>Video</option></select></div>
                  <div className="space-y-2"><Label htmlFor="draft-slug">Story address</Label><Input id="draft-slug" autoComplete="off" value={form.slug} onChange={(event) => set('slug', event.target.value)} placeholder="made-from-title-when-empty" className="min-h-11 rounded-xl" /><p className="text-xs text-muted-foreground">Leave blank to make it from the title.</p></div>
                </div>
                <div className="space-y-2"><Label htmlFor="draft-excerpt">Short introduction</Label><Textarea id="draft-excerpt" value={form.excerpt} onChange={(event) => set('excerpt', event.target.value)} placeholder="A few lines to invite readers in" rows={3} /></div>
                <div className="space-y-2"><Label htmlFor="draft-body">Story text</Label><Textarea id="draft-body" value={form.body} onChange={(event) => set('body', event.target.value)} placeholder="Write or paste the full work here. Basic Markdown is supported on the reading page." rows={12} className="min-h-64 leading-7" /></div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2"><Label htmlFor="draft-cover">Cover image address <span className="text-muted-foreground">(optional)</span></Label><Input id="draft-cover" type="url" autoComplete="url" value={form.cover} onChange={(event) => set('cover', event.target.value)} placeholder="https://…" className="min-h-11 rounded-xl" /></div>
                  <div className="space-y-2"><Label htmlFor="draft-rights">Rights and permissions note</Label><Input id="draft-rights" autoComplete="off" value={form.rights} onChange={(event) => set('rights', event.target.value)} placeholder="What still needs a rights check?" className="min-h-11 rounded-xl" /></div>
                </div>
                <div className="space-y-2"><Label htmlFor="draft-next">Next step <span className="text-muted-foreground">(optional)</span></Label><Input id="draft-next" autoComplete="off" value={form.next} onChange={(event) => set('next', event.target.value)} placeholder="A note to your future self" className="min-h-11 rounded-xl" /></div>
                {formError && <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{formError}</p>}
                {notice && <p role="status" className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm text-foreground">{notice}</p>}
                <div className="flex flex-wrap gap-3 border-t border-border/60 pt-5">
                  <Button type="submit" variant="outline" disabled={busy} className="min-h-11 rounded-xl"><Save size={16} /> {busy ? 'Saving…' : 'Save draft'}</Button>
                  {selected && <Button type="button" onClick={() => void publish()} disabled={busy || !form.body.trim()} className="min-h-11 rounded-xl"><Send size={16} /> {busy ? 'Working…' : selected.stage === 'Published' ? 'Publish edits' : 'Publish to website'}</Button>}
                  {selected?.stage === 'Published' && <Button type="button" onClick={() => void unpublish()} disabled={busy} variant="ghost" className="min-h-11 rounded-xl text-destructive hover:text-destructive"><Eye size={16} /> Unpublish</Button>}
                  {selected?.stage === 'Published' && selected.slug && <Button asChild variant="ghost" className="min-h-11 rounded-xl"><Link to={`/story/${encodeURIComponent(selected.slug)}`} target="_blank"><Globe2 size={16} /> View live story</Link></Button>}
                </div>
                <p className="text-xs leading-5 text-muted-foreground"><Check size={13} className="mr-1 inline text-primary" /> Publishing copies this draft into the public story shelf. Unpublishing keeps the draft and takes its story off the public site.</p>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
