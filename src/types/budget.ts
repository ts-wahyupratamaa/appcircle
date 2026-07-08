export type CategoryType =
  | 'spending_daily'
  | 'coffee'
  | 'transport'
  | 'weekend'
  | 'saving'
  | 'investment_stock'
  | 'trading'
  | 'other';

export type TransactionType = 'expense' | 'saving' | 'investment' | 'trading';

export type BudgetStatus = 'safe' | 'warning' | 'overbudget';

export type BudgetCategory = {
  id: string;
  userId: string;
  name: string;
  type: CategoryType;
  weeklyLimit?: number;
  monthlyLimit?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type BudgetSettings = {
  userId: string;
  dailyAllowance: number;
  coffeeWeeklyLimit: number;
  transportWeeklyLimit: number;
  bufferWeeklyLimit: number;
  tradingMonthlyLimit: number;
  coffeeAvgCup: number;
  weekendBalance: number;
  carriedDeficit: number;
  lastSettledDate: string | null;
  updatedAt: string;
};

export type BudgetTransaction = {
  id: string;
  userId: string;
  categoryId: string;
  categoryNameSnapshot: string;
  amount: number;
  note?: string;
  transactionType: TransactionType;
  occurredAt: string;
  occurredDateWib: string;
  createdAt: string;
  updatedAt: string;
};

export type DailyLedger = {
  id: string;
  userId: string;
  date: string;
  dailyAllowance: number;
  availableDailyAllowance: number;
  totalDailySpent: number;
  dailyRemaining: number;
  rolledToWeekend: number;
  deficitCarried: number;
  isSettled: boolean;
  settledAt?: string;
};

export type DailyBudgetSummary = {
  date: string;
  allowance: number;
  available: number;
  spent: number;
  remaining: number;
  status: BudgetStatus;
  deficitCarried: number;
};

export type BucketSummary = {
  limit: number;
  spent: number;
  remaining: number;
  status: BudgetStatus;
  extraLabel?: string;
};

export type WeeklyDaySummary = {
  date: string;
  dayLabel: string;
  spent: number;
  dailyRemaining: number;
  rolledToWeekend: number;
  transactions: BudgetTransaction[];
};

export type WeeklyBudgetSummary = {
  weekStart: string;
  weekEnd: string;
  totalDailyAllowance: number;
  totalDailySpent: number;
  totalRolledToWeekend: number;
  coffee: number;
  transport: number;
  other: number;
  saving: number;
  investment: number;
  trading: number;
  totalOverbudget: number;
  weekendBalance: number;
  days: WeeklyDaySummary[];
};

export type MonthlyBudgetSummary = {
  monthKey: string;
  trading: BucketSummary;
  saving: number;
  investment: number;
};

export const BUDGET_STORAGE_KEYS = {
  categories: '@instaintrov/budget-categories',
  transactions: '@instaintrov/budget-transactions',
  ledgers: '@instaintrov/budget-ledgers',
  settings: '@instaintrov/budget-settings',
} as const;

export const DEFAULT_BUDGET_SETTINGS: Omit<BudgetSettings, 'userId' | 'updatedAt'> = {
  dailyAllowance: 45_000,
  coffeeWeeklyLimit: 120_000,
  transportWeeklyLimit: 80_000,
  bufferWeeklyLimit: 75_000,
  tradingMonthlyLimit: 300_000,
  coffeeAvgCup: 35_000,
  weekendBalance: 0,
  carriedDeficit: 0,
  lastSettledDate: null,
};

export const CATEGORY_TYPE_LABELS: Record<CategoryType, string> = {
  spending_daily: 'Harian',
  coffee: 'Ngopi / Cafe',
  transport: 'Transport',
  weekend: 'Weekend',
  saving: 'Tabungan',
  investment_stock: 'Saham',
  trading: 'Trading',
  other: 'Lain-lain',
};

export const CATEGORY_SUGGESTIONS: { name: string; type: CategoryType }[] = [
  { name: 'Harian', type: 'spending_daily' },
  { name: 'Ngopi', type: 'coffee' },
  { name: 'Transport', type: 'transport' },
  { name: 'Weekend', type: 'weekend' },
  { name: 'Tabungan', type: 'saving' },
  { name: 'Saham', type: 'investment_stock' },
  { name: 'Trading', type: 'trading' },
  { name: 'Belanja', type: 'other' },
  { name: 'Obat', type: 'other' },
  { name: 'Lain-lain', type: 'other' },
];
