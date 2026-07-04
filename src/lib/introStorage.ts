import AsyncStorage from '@react-native-async-storage/async-storage';

const DRAFTS_KEY = '@instaintrov/drafts';

export type IntroDraft = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  synced: boolean;
};

export async function loadDrafts(): Promise<IntroDraft[]> {
  const raw = await AsyncStorage.getItem(DRAFTS_KEY);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as IntroDraft[];
  } catch {
    return [];
  }
}

export async function saveDrafts(drafts: IntroDraft[]): Promise<void> {
  await AsyncStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
}

export async function addDraft(title: string, content: string): Promise<IntroDraft> {
  const draft: IntroDraft = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: title.trim(),
    content: content.trim(),
    createdAt: new Date().toISOString(),
    synced: false,
  };

  const drafts = await loadDrafts();
  drafts.unshift(draft);
  await saveDrafts(drafts);

  return draft;
}

export async function markDraftsSynced(ids: string[]): Promise<IntroDraft[]> {
  const idSet = new Set(ids);
  const drafts = await loadDrafts();
  const updated = drafts.map((draft) =>
    idSet.has(draft.id) ? { ...draft, synced: true } : draft,
  );
  await saveDrafts(updated);
  return updated;
}

export async function deleteDraft(id: string): Promise<IntroDraft[]> {
  const drafts = await loadDrafts();
  const updated = drafts.filter((draft) => draft.id !== id);
  await saveDrafts(updated);
  return updated;
}
