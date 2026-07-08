import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  addTransaction,
  createCategory,
  CreateTxPayload,
  getDailyBudgetSummary,
  getMonthlyBudgetSummary,
  getSettings,
  getWeeklyBucketSummary,
  getWeeklyBudgetSummary,
  getWeekendBalance,
  listCategories,
  listTransactions,
  settlePendingDays,
  updateBudgetSettings,
} from '../lib/budgetService';
import { getTodayWIB } from '../lib/wibTime';
import {
  BudgetCategory,
  BudgetSettings,
  BudgetTransaction,
  CategoryType,
  DailyBudgetSummary,
  MonthlyBudgetSummary,
  WeeklyBudgetSummary,
} from '../types/budget';
import { useProfile } from './ProfileProvider';

type BudgetContextValue = {
  ready: boolean;
  categories: BudgetCategory[];
  transactions: BudgetTransaction[];
  settings: BudgetSettings | null;
  daily: DailyBudgetSummary | null;
  weekly: WeeklyBudgetSummary | null;
  monthly: MonthlyBudgetSummary | null;
  coffeeBucket: Awaited<ReturnType<typeof getWeeklyBucketSummary>> | null;
  transportBucket: Awaited<ReturnType<typeof getWeeklyBucketSummary>> | null;
  weekendBalance: number;
  refresh: () => Promise<void>;
  addCategory: (name: string, type: CategoryType) => Promise<BudgetCategory>;
  submitTransaction: (payload: CreateTxPayload) => Promise<string | undefined>;
  saveSettings: (patch: Partial<BudgetSettings>) => Promise<void>;
};

const BudgetContext = createContext<BudgetContextValue | null>(null);

export function BudgetProvider({ children }: { children: ReactNode }) {
  const { accountId } = useProfile();
  const [ready, setReady] = useState(false);
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [transactions, setTransactions] = useState<BudgetTransaction[]>([]);
  const [settings, setSettings] = useState<BudgetSettings | null>(null);
  const [daily, setDaily] = useState<DailyBudgetSummary | null>(null);
  const [weekly, setWeekly] = useState<WeeklyBudgetSummary | null>(null);
  const [monthly, setMonthly] = useState<MonthlyBudgetSummary | null>(null);
  const [coffeeBucket, setCoffeeBucket] = useState<BudgetContextValue['coffeeBucket']>(null);
  const [transportBucket, setTransportBucket] = useState<BudgetContextValue['transportBucket']>(null);
  const [weekendBalance, setWeekendBalance] = useState(0);

  const refresh = useCallback(async () => {
    if (!accountId) {
      setReady(true);
      return;
    }
    const today = getTodayWIB();
    await settlePendingDays(accountId);
    const [
      cats,
      txs,
      sett,
      dailySum,
      weeklySum,
      monthlySum,
      coffee,
      transport,
      weekend,
    ] = await Promise.all([
      listCategories(accountId),
      listTransactions(accountId),
      getSettings(accountId),
      getDailyBudgetSummary(accountId, today),
      getWeeklyBudgetSummary(accountId, today),
      getMonthlyBudgetSummary(accountId, today),
      getWeeklyBucketSummary(accountId, 'coffee', today),
      getWeeklyBucketSummary(accountId, 'transport', today),
      getWeekendBalance(accountId),
    ]);
    setCategories(cats);
    setTransactions(txs);
    setSettings(sett);
    setDaily(dailySum);
    setWeekly(weeklySum);
    setMonthly(monthlySum);
    setCoffeeBucket(coffee);
    setTransportBucket(transport);
    setWeekendBalance(weekend);
    setReady(true);
  }, [accountId]);

  useEffect(() => {
    setReady(false);
    void refresh();
  }, [refresh]);

  const addCategory = useCallback(
    async (name: string, type: CategoryType) => {
      if (!accountId) throw new Error('Belum login');
      const cat = await createCategory(accountId, { name, type });
      await refresh();
      return cat;
    },
    [accountId, refresh],
  );

  const submitTransaction = useCallback(
    async (payload: CreateTxPayload) => {
      if (!accountId) throw new Error('Belum login');
      const { weekendWarning } = await addTransaction(accountId, payload);
      await refresh();
      return weekendWarning;
    },
    [accountId, refresh],
  );

  const saveSettings = useCallback(
    async (patch: Partial<BudgetSettings>) => {
      if (!accountId) return;
      await updateBudgetSettings(accountId, patch);
      await refresh();
    },
    [accountId, refresh],
  );

  const value = useMemo(
    () => ({
      ready,
      categories,
      transactions,
      settings,
      daily,
      weekly,
      monthly,
      coffeeBucket,
      transportBucket,
      weekendBalance,
      refresh,
      addCategory,
      submitTransaction,
      saveSettings,
    }),
    [
      ready,
      categories,
      transactions,
      settings,
      daily,
      weekly,
      monthly,
      coffeeBucket,
      transportBucket,
      weekendBalance,
      refresh,
      addCategory,
      submitTransaction,
      saveSettings,
    ],
  );

  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>;
}

export function useBudget() {
  const ctx = useContext(BudgetContext);
  if (!ctx) {
    throw new Error('useBudget harus di dalam BudgetProvider');
  }
  return ctx;
}
