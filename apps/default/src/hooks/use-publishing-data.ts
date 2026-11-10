import { useMemo } from 'react';
import { useLiveNodes } from '@/hooks/use-live-nodes';
import { createNode, getFieldValue, getTitle, updateNode } from '@/lib/genesis-data';
import type { GenesisNode } from '@/lib/genesis-data';
import { ARTICLES_PROJECT_ID, DIGESTS_PROJECT_ID, SUBMISSIONS_PROJECT_ID } from '@/lib/open-press-config';

export type Article = {
  id: string;
  title: string;
  creator: string;
  format: string;
  status: string;
  body: string;
  excerpt: string;
  slug: string;
  cover: string;
  draftId: string;
};

export type DraftValues = {
  title: string;
  creator: string;
  format: string;
  rights: string;
  next: string;
  body: string;
  excerpt: string;
  slug: string;
  cover: string;
};

export const emptyDraft: DraftValues = {
  title: '', creator: '', format: 'Written work', rights: '', next: '', body: '', excerpt: '', slug: '', cover: '',
};

const field = (node: GenesisNode, name: string) => getFieldValue(node, name) ?? '';
const makeSlug = (value: string) => value.trim().toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'story';

export function asArticle(node: GenesisNode): Article {
  const title = getTitle(node, 'Article Title') ?? 'Untitled story';
  return {
    id: node.id,
    title,
    creator: field(node, 'Creator'),
    format: field(node, 'Format') || 'Written work',
    status: field(node, 'Publication Status'),
    body: field(node, 'Article Body'),
    excerpt: field(node, 'Excerpt'),
    slug: field(node, 'Slug') || makeSlug(title),
    cover: field(node, 'Cover Image URL'),
    draftId: field(node, 'Draft Row ID'),
  };
}

export function usePublishedArticles() {
  const live = useLiveNodes(ARTICLES_PROJECT_ID);
  const articles = live.nodes.map(asArticle).filter((article) => article.status === 'Published');
  return { ...live, articles };
}

export function asDraft(node: GenesisNode): DraftValues & { id: string; stage: string; publishedId: string } {
  return {
    id: node.id,
    title: getTitle(node, 'Work Title') ?? '',
    creator: field(node, 'Creator'),
    format: field(node, 'Format') || 'Written work',
    rights: field(node, 'Rights Note'),
    next: field(node, 'Next Step'),
    body: field(node, 'Article Body'),
    excerpt: field(node, 'Excerpt'),
    slug: field(node, 'Slug'),
    cover: field(node, 'Cover Image URL'),
    stage: field(node, 'Stage') || 'Idea',
    publishedId: field(node, 'Published Row ID'),
  };
}

function requireSavedFields(result: { ignoredKeys: string[] }) {
  if (result.ignoredKeys.length > 0) {
    throw new Error(`Some details were not saved: ${result.ignoredKeys.join(', ')}.`);
  }
}

export function useStudioData() {
  const draftsLive = useLiveNodes(SUBMISSIONS_PROJECT_ID);
  const articlesLive = useLiveNodes(ARTICLES_PROJECT_ID);
  const digestsLive = useLiveNodes(DIGESTS_PROJECT_ID);
  const drafts = useMemo(() => draftsLive.nodes.map(asDraft), [draftsLive.nodes]);

  const saveDraft = async (draftId: string | null, values: DraftValues, currentStage = 'Idea') => {
    const title = values.title.trim();
    const creator = values.creator.trim();
    if (!title || !creator) throw new Error('Add a title and creator before saving.');
    const nextStage = currentStage;
    const fields: Record<string, string> = {
      'Work Title': title,
      Creator: creator,
      Format: values.format,
      Stage: nextStage,
      'Rights Note': values.rights.trim(),
      'Next Step': values.next.trim(),
      'Article Body': values.body.trim(),
      Excerpt: values.excerpt.trim(),
      Slug: makeSlug(values.slug || title),
      'Cover Image URL': values.cover.trim(),
    };
    const result = draftId
      ? await updateNode(SUBMISSIONS_PROJECT_ID, draftId, fields)
      : await createNode(SUBMISSIONS_PROJECT_ID, fields);
    requireSavedFields(result);
    await draftsLive.refresh();
    return draftId ?? result.id;
  };

  const publishDraft = async (draftId: string, values: DraftValues, linkedArticleId = '') => {
    const title = values.title.trim();
    const creator = values.creator.trim();
    const body = values.body.trim();
    if (!title || !creator || !body) throw new Error('Add a title, creator, and article text before publishing.');
    const slug = makeSlug(values.slug || title);
    const articleFields: Record<string, string> = {
      'Article Title': title,
      Creator: creator,
      Format: values.format,
      'Publication Status': 'Published',
      'Article Body': body,
      Excerpt: values.excerpt.trim(),
      Slug: slug,
      'Cover Image URL': values.cover.trim(),
      'Draft Row ID': draftId,
    };
    const draftFields: Record<string, string> = {
      'Work Title': title,
      Creator: creator,
      Format: values.format,
      'Rights Note': values.rights.trim(),
      'Next Step': values.next.trim(),
      'Article Body': body,
      Excerpt: values.excerpt.trim(),
      Slug: slug,
      'Cover Image URL': values.cover.trim(),
    };
    requireSavedFields(await updateNode(SUBMISSIONS_PROJECT_ID, draftId, draftFields));
    const alreadyPublished = articlesLive.nodes.find((node) => node.id === linkedArticleId || field(node, 'Draft Row ID') === draftId);
    if (alreadyPublished) {
      requireSavedFields(await updateNode(ARTICLES_PROJECT_ID, alreadyPublished.id, articleFields));
      requireSavedFields(await updateNode(SUBMISSIONS_PROJECT_ID, draftId, { Stage: 'Published', 'Published Row ID': alreadyPublished.id }));
      await Promise.all([articlesLive.refresh(), draftsLive.refresh()]);
      return alreadyPublished.id;
    }
    const created = await createNode(ARTICLES_PROJECT_ID, articleFields);
    requireSavedFields(created);
    if (!created.id) throw new Error('The article was written, but its link back to the draft could not be saved. Refresh and publish again to reconnect it.');
    requireSavedFields(await updateNode(SUBMISSIONS_PROJECT_ID, draftId, { Stage: 'Published', 'Published Row ID': created.id as string }));
    await Promise.all([articlesLive.refresh(), draftsLive.refresh()]);
    return created.id;
  };

  const unpublishDraft = async (draftId: string, linkedArticleId = '') => {
    const article = articlesLive.nodes.find((node) => node.id === linkedArticleId || field(node, 'Draft Row ID') === draftId);
    if (!article) throw new Error('The published story link is missing. Refresh the studio and try again.');
    requireSavedFields(await updateNode(ARTICLES_PROJECT_ID, article.id, { 'Publication Status': 'Unpublished' }));
    requireSavedFields(await updateNode(SUBMISSIONS_PROJECT_ID, draftId, { Stage: 'Ready to publish' }));
    await Promise.all([articlesLive.refresh(), draftsLive.refresh()]);
  };

  return {
    drafts,
    digests: digestsLive.nodes,
    articles: articlesLive.nodes.map(asArticle),
    loading: draftsLive.loading || articlesLive.loading || digestsLive.loading,
    error: draftsLive.error || articlesLive.error || digestsLive.error,
    refresh: async () => Promise.all([draftsLive.refresh(), articlesLive.refresh(), digestsLive.refresh()]),
    saveDraft,
    publishDraft,
    unpublishDraft,
  };
}
