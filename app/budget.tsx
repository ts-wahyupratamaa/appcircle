import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { BudgetDashboard } from '../src/components/budget/BudgetDashboard';
import { BudgetSettingsSheet } from '../src/components/budget/BudgetSettingsSheet';
import { CategorySheet } from '../src/components/budget/CategorySheet';
import { TransactionSheet } from '../src/components/budget/TransactionSheet';
import { MainBottomNav } from '../src/components/MainBottomNav';
import { magicNavBottomInset } from '../src/components/BottomNav';
import { useBudget } from '../src/context/BudgetProvider';
import { useCircle } from '../src/context/CircleProvider';
import { colors, layout, spacing } from '../src/theme';
import { topPadding } from '../src/theme/safeArea';
import { BudgetCategory, CategoryType } from '../src/types/budget';

export default function BudgetScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { ready: circleReady, hasSession } = useCircle();
  const { ready: budgetReady, settings, addCategory, submitTransaction, saveSettings } = useBudget();

  const [txCategory, setTxCategory] = useState<BudgetCategory | null>(null);
  const [showCategory, setShowCategory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [suggest, setSuggest] = useState<{ name: string; type: CategoryType } | null>(null);

  useEffect(() => {
    if (circleReady && !hasSession) {
      router.replace('/');
    }
  }, [circleReady, hasSession, router]);

  const handleSuggestion = async (name: string, type: CategoryType) => {
    setSuggest({ name, type });
    setShowCategory(true);
  };

  const handleSaveCategory = async (name: string, type: CategoryType) => {
    try {
      await addCategory(name, type);
      setSuggest(null);
    } catch (e) {
      Alert.alert('Gagal', e instanceof Error ? e.message : 'Tidak bisa simpan kategori');
    }
  };

  const ready = circleReady && budgetReady;

  if (!ready) {
    return (
      <View style={[styles.screen, styles.loading]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={{
          paddingTop: topPadding(insets.top) + spacing.lg,
          paddingBottom: magicNavBottomInset(insets.bottom) + spacing.md,
          paddingHorizontal: layout.screenPad,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <BudgetDashboard
          onCategorySelect={setTxCategory}
          onAddCategory={() => {
            setSuggest(null);
            setShowCategory(true);
          }}
          onSuggestion={handleSuggestion}
          onSettings={() => setShowSettings(true)}
        />
      </ScrollView>

      <MainBottomNav />

      <CategorySheet
        visible={showCategory}
        initialName={suggest?.name}
        initialType={suggest?.type}
        onClose={() => {
          setShowCategory(false);
          setSuggest(null);
        }}
        onSave={handleSaveCategory}
      />

      <TransactionSheet
        visible={Boolean(txCategory)}
        category={txCategory}
        onClose={() => setTxCategory(null)}
        onSubmit={submitTransaction}
      />

      <BudgetSettingsSheet
        visible={showSettings}
        settings={settings}
        onClose={() => setShowSettings(false)}
        onSave={saveSettings}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.pageWarm,
  },
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
