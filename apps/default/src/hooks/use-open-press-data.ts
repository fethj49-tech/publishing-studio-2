import { useEffect, useMemo, useState } from 'react';
import { createNode, getFieldValue, getNodes, getTitle } from '@/lib/genesis-data';
import { PLAYBOOK_PROJECT_ID, SUBMISSIONS_PROJECT_ID } from '@/lib/open-press-config';

export type Submission = { id: string; title: string; creator: string; format: string; stage: string };
export type Guide = { id: string; kind: string; path: string; rights: string; cost: string };

export function useOpenPressData() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const loadData = async () => {
    setLoading(true);
    try {
      const [rows, guideRows] = await Promise.all([getNodes(SUBMISSIONS_PROJECT_ID), getNodes(PLAYBOOK_PROJECT_ID)]);
      setSubmissions(rows.map((row) => ({ id: row.id, title: getTitle(row, 'Work Title') ?? 'Untitled work', creator: getFieldValue(row, 'Creator') ?? 'Unknown creator', format: getFieldValue(row, 'Format') ?? 'Written work', stage: getFieldValue(row, 'Stage') ?? 'Idea' })));
      setGuides(guideRows.map((row) => ({ id: row.id, kind: getFieldValue(row, 'Work Kind') ?? getTitle(row, 'Work Kind') ?? 'Work', path: getFieldValue(row, 'Recommended Path') ?? '', rights: getFieldValue(row, 'Rights Check') ?? '', cost: getFieldValue(row, 'No-Fee Option') ?? '' })));
    } catch (loadError) { setError(loadError instanceof Error ? loadError.message : 'The publishing library could not be loaded.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void loadData(); }, []);
  const counts = useMemo(() => ({ total: submissions.length, active: submissions.filter((item) => item.stage !== 'Published').length, published: submissions.filter((item) => item.stage === 'Published').length }), [submissions]);
  const submit = async (values: { title: string; creator: string; format: string; rights: string; next: string }) => {
    setSaving(true);
    setSubmitted(false);
    setError('');
    try {
      await createNode(SUBMISSIONS_PROJECT_ID, { 'Work Title': values.title.trim(), Creator: values.creator.trim(), Format: values.format, Stage: 'Idea', 'Rights Note': values.rights.trim(), 'Next Step': values.next.trim() || 'Review publishing path' });
      await loadData();
      setSubmitted(true);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'The work could not be saved.');
      throw saveError;
    } finally {
      setSaving(false);
    }
  };
  const viewState = { submissions, guides, counts, loading, saving, submitted, error, submit };
  return viewState;
}
