import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { IntroDraftList } from '../components/IntroDraftList';
import { NetworkBanner } from '../components/NetworkBanner';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import {
  IntroDraft,
  addDraft,
  deleteDraft,
  loadDrafts,
} from '../lib/introStorage';
import { syncPendingDrafts } from '../lib/syncService';

export function HomeScreen() {
  const { isConnected: isOnline } = useNetworkStatus();
  const [drafts, setDrafts] = useState<IntroDraft[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const syncInProgress = useRef(false);

  const pendingCount = drafts.filter((draft) => !draft.synced).length;

  const refreshDrafts = useCallback(async () => {
    const stored = await loadDrafts();
    setDrafts(stored);
  }, []);

  const runSync = useCallback(async () => {
    if (!isOnline || syncInProgress.current) {
      return;
    }

    syncInProgress.current = true;
    setSyncing(true);
    try {
      const result = await syncPendingDrafts();
      setDrafts(result.drafts);
    } finally {
      syncInProgress.current = false;
      setSyncing(false);
    }
  }, [isOnline]);

  useEffect(() => {
    refreshDrafts().finally(() => setLoading(false));
  }, [refreshDrafts]);

  useEffect(() => {
    if (isOnline && pendingCount > 0) {
      runSync();
    }
  }, [isOnline, pendingCount, runSync]);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      return;
    }

    await addDraft(title, content);
    setTitle('');
    setContent('');
    await refreshDrafts();

    if (isOnline) {
      await runSync();
    }
  };

  const handleDelete = async (id: string) => {
    const updated = await deleteDraft(id);
    setDrafts(updated);
  };

  const canSave = title.trim().length > 0 && content.trim().length > 0;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <NetworkBanner isOnline={isOnline} pendingCount={pendingCount} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>innerly</Text>
            <Text style={styles.subtitle}>
              {isOnline
                ? 'Mode online — draft tersimpan & tersinkron'
                : 'Mode offline — draft disimpan lokal di HP'}
            </Text>
          </View>

          {loading ? (
            <ActivityIndicator color="#833AB4" style={styles.loader} />
          ) : (
            <IntroDraftList
              drafts={drafts}
              isOnline={isOnline}
              onDelete={handleDelete}
            />
          )}

          <View style={styles.form}>
            <Text style={styles.formLabel}>Draft intro baru</Text>
            <TextInput
              style={styles.input}
              placeholder="Judul intro"
              placeholderTextColor="#666"
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Isi intro / caption..."
              placeholderTextColor="#666"
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
            />
            <View style={styles.actions}>
              <Pressable
                style={[styles.button, !canSave && styles.buttonDisabled]}
                onPress={handleSave}
                disabled={!canSave}
              >
                <Text style={styles.buttonText}>
                  {isOnline ? 'Simpan & Sync' : 'Simpan Offline'}
                </Text>
              </Pressable>

              {isOnline && pendingCount > 0 && (
                <Pressable
                  style={[styles.buttonSecondary, syncing && styles.buttonDisabled]}
                  onPress={runSync}
                  disabled={syncing}
                >
                  {syncing ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.buttonText}>Sync ({pendingCount})</Text>
                  )}
                </Pressable>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  flex: {
    flex: 1,
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
    gap: 20,
  },
  header: {
    gap: 6,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: '#888',
    fontSize: 14,
    lineHeight: 20,
  },
  loader: {
    marginVertical: 24,
  },
  form: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  formLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#0f0f0f',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    color: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  button: {
    flex: 1,
    backgroundColor: '#833AB4',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#333',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
