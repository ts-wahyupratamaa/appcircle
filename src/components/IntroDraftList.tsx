import { Pressable, StyleSheet, Text, View } from 'react-native';

import { IntroDraft } from '../lib/introStorage';

type Props = {
  drafts: IntroDraft[];
  isOnline: boolean;
  onDelete: (id: string) => void;
};

export function IntroDraftList({ drafts, isOnline, onDelete }: Props) {
  if (drafts.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>Belum ada draft</Text>
        <Text style={styles.emptyText}>
          Buat intro di bawah. Bisa offline — nanti auto-sync saat online.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {drafts.map((draft) => (
        <View key={draft.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{draft.title}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Hapus draft ${draft.title}`}
              onPress={() => onDelete(draft.id)}
              hitSlop={8}
            >
              <Text style={styles.deleteText}>Hapus</Text>
            </Pressable>
          </View>
          <Text style={styles.cardContent}>{draft.content}</Text>
          <View style={styles.cardFooter}>
            <Text style={styles.date}>
              {new Date(draft.createdAt).toLocaleString('id-ID')}
            </Text>
            <View
              style={[
                styles.statusBadge,
                draft.synced ? styles.syncedBadge : styles.pendingBadge,
              ]}
            >
              <Text style={styles.statusText}>
                {draft.synced ? 'Synced' : isOnline ? 'Pending' : 'Offline'}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
  empty: {
    paddingVertical: 32,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 12,
  },
  cardTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  deleteText: {
    color: '#f87171',
    fontSize: 13,
    fontWeight: '600',
  },
  cardContent: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    color: '#666',
    fontSize: 12,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  syncedBadge: {
    backgroundColor: '#14532d',
  },
  pendingBadge: {
    backgroundColor: '#422006',
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
});
