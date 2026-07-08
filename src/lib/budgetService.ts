import {
  BudgetCategory,
  BudgetSettings,
  BudgetStatus,
  BudgetTransaction,
  BucketSummary,
  CategoryType,
  DailyBudgetSummary,
  DailyLedger,
  MonthlyBudgetSummary,
  TransactionType,
  WeeklyBudgetSummary,
  WeeklyDaySummary,
} from '../types/budget';
import {
  createCategory,
  createTransaction,
  deleteLedgersFrom,
  deleteTransaction,
  getLedger,
  getSettings,
  listCategories,
  listLedgers,
  listTransactions,
  loadAllCategories,
  loadAllTransactions,
  newId,
  saveSettings,
  updateCategory,
  upsertLedger,
} from './budgetStorage';
import {
  addDaysWIB,
  getDateKeyWIB,
  getDayLabelWIB,
  getMonthKeyWIB,
  getTodayWIB,
  getWeekRangeWIB,
  getYesterdayWIB,
  parseDateKeyWIB,
  wibNowIso,
} from './wibTime';

export function transactionTypeFromCategory(type: CategoryType): TransactionType {
  if (type === 'saving') return 'saving';
  if (type === 'investment_stock') return 'investment';
  if (type === 'trading') return 'trading';
  return 'expense';
}

export function budgetStatus(spent: number, limit: number): BudgetStatus {
  if (spent > limit) return 'overbudget';
  const remaining = limit - spent;
  if (remaining <= limit * 0.3) return 'warning';
  return 'safe';
}

export function dailyStatus(remaining: number, available: number): BudgetStatus {
  if (remaining < 0) return 'overbudget';
  if (available > 0 && remaining <= available * 0.3) return 'warning';
  return 'safe';
}

function sumByType(
  txs: BudgetTransaction[],
  categories: Map<string, BudgetCategory>,
  types: CategoryType[],
): number {
  return txs.reduce((sum, tx) => {
    const cat = categories.get(tx.categoryId);
    if (cat && types.includes(cat.type)) {
      return sum + tx.amount;
    }
    return sum;
  }, 0);
}

function sumByTransactionType(txs: BudgetTransaction[], type: TransactionType): number {
  return txs.filter((t) => t.transactionType === type).reduce((s, t) => s + t.amount, 0);
}

function dailySpentForDate(
  userId: string,
  date: string,
  txs: BudgetTransaction[],
  categories: Map<string, BudgetCategory>,
): number {
  return sumByType(
    txs.filter((t) => t.userId === userId && t.occurredDateWib === date),
    categories,
    ['spending_daily'],
  );
}

function computeDaySettlement(
  settings: BudgetSettings,
  carriedDeficit: number,
  totalSpent: number,
) {
  const overflowDeficit = Math.max(0, carriedDeficit - settings.dailyAllowance);
  const available = Math.max(0, settings.dailyAllowance - carriedDeficit);
  const dailyRemaining = available - totalSpent;
  const rolledToWeekend = Math.max(0, dailyRemaining);
  const deficitCarried =
    overflowDeficit + (dailyRemaining < 0 ? -dailyRemaining : 0);
  return { available, dailyRemaining, rolledToWeekend, deficitCarried };
}

/** Idempotent — settle satu hari kalau belum */
export async function settleDailyBudget(userId: string, date: string): Promise<DailyLedger | null> {
  const today = getTodayWIB();
  if (date >= today) {
    return null;
  }

  const existing = await getLedger(userId, date);
  if (existing?.isSettled) {
    return existing;
  }

  const settings = await getSettings(userId);
  const categories = await categoryMap(userId);
  const txs = await loadAllTransactions();

  let carriedDeficit = settings.carriedDeficit;
  const prevDate = addDaysWIB(date, -1);
  const prevLedger = await getLedger(userId, prevDate);
  if (prevLedger?.isSettled) {
    carriedDeficit = prevLedger.deficitCarried;
  } else if (settings.lastSettledDate && settings.lastSettledDate < date) {
    const gapStart = settings.lastSettledDate
      ? addDaysWIB(settings.lastSettledDate, 1)
      : date;
    if (gapStart < date) {
      await settlePendingDays(userId, addDaysWIB(date, -1));
      const refreshed = await getLedger(userId, prevDate);
      carriedDeficit = refreshed?.deficitCarried ?? carriedDeficit;
    }
  }

  const totalSpent = dailySpentForDate(userId, date, txs, categories);
  const { available, dailyRemaining, rolledToWeekend, deficitCarried } = computeDaySettlement(
    settings,
    carriedDeficit,
    totalSpent,
  );

  const ledger: DailyLedger = {
    id: existing?.id ?? newId(),
    userId,
    date,
    dailyAllowance: settings.dailyAllowance,
    availableDailyAllowance: available,
    totalDailySpent: totalSpent,
    dailyRemaining,
    rolledToWeekend,
    deficitCarried,
    isSettled: true,
    settledAt: wibNowIso(),
  };

  settings.carriedDeficit = deficitCarried;
  settings.lastSettledDate = date;
  await upsertLedger(ledger);
  settings.weekendBalance = await rebuildWeekendBalance(userId);
  await saveSettings(settings);
  return ledger;
}

async function rebuildWeekendBalance(userId: string): Promise<number> {
  const ledgers = await listLedgers(userId);
  const rolled = ledgers
    .filter((l) => l.isSettled)
    .reduce((s, l) => s + l.rolledToWeekend, 0);
  const cats = await categoryMap(userId);
  const txs = await loadAllTransactions();
  const spent = txs
    .filter((t) => t.userId === userId && cats.get(t.categoryId)?.type === 'weekend')
    .reduce((s, t) => s + t.amount, 0);
  return rolled - spent;
}

/** Settle semua hari dari lastSettled+1 sampai kemarin */
export async function settlePendingDays(
  userId: string,
  untilDate: string = getYesterdayWIB(),
): Promise<void> {
  const settings = await getSettings(userId);
  const today = getTodayWIB();
  if (untilDate >= today) {
    untilDate = getYesterdayWIB();
  }

  let cursor = settings.lastSettledDate
    ? addDaysWIB(settings.lastSettledDate, 1)
    : findFirstActivityDate(userId, await loadAllTransactions()) ?? untilDate;

  while (cursor <= untilDate) {
    await settleDailyBudget(userId, cursor);
    cursor = addDaysWIB(cursor, 1);
  }
}

function findFirstActivityDate(userId: string, txs: BudgetTransaction[]): string | null {
  const userTxs = txs.filter((t) => t.userId === userId);
  if (userTxs.length === 0) {
    return null;
  }
  return userTxs.reduce((min, t) => (t.occurredDateWib < min ? t.occurredDateWib : min), userTxs[0].occurredDateWib);
}

async function categoryMap(userId: string): Promise<Map<string, BudgetCategory>> {
  const cats = await listCategories(userId);
  return new Map(cats.map((c) => [c.id, c]));
}

export async function getDailyBudgetSummary(
  userId: string,
  date: string = getTodayWIB(),
): Promise<DailyBudgetSummary> {
  await settlePendingDays(userId);
  const settings = await getSettings(userId);
  const categories = await categoryMap(userId);
  const txs = await loadAllTransactions();
  const today = getTodayWIB();

  if (date < today) {
    const ledger = await getLedger(userId, date);
    if (ledger) {
      return {
        date,
        allowance: ledger.dailyAllowance,
        available: ledger.availableDailyAllowance,
        spent: ledger.totalDailySpent,
        remaining: ledger.dailyRemaining,
        status: dailyStatus(ledger.dailyRemaining, ledger.availableDailyAllowance),
        deficitCarried: ledger.deficitCarried,
      };
    }
  }

  let carriedDeficit = settings.carriedDeficit;
  const yesterday = getYesterdayWIB(date);
  const yLedger = await getLedger(userId, yesterday);
  if (yLedger?.isSettled) {
    carriedDeficit = yLedger.deficitCarried;
  }

  const totalSpent = dailySpentForDate(userId, date, txs, categories);
  const { available, dailyRemaining, deficitCarried } = computeDaySettlement(
    settings,
    carriedDeficit,
    totalSpent,
  );

  return {
    date,
    allowance: settings.dailyAllowance,
    available,
    spent: totalSpent,
    remaining: dailyRemaining,
    status: dailyStatus(dailyRemaining, available),
    deficitCarried,
  };
}

function bucketSummary(spent: number, limit: number, extraLabel?: string): BucketSummary {
  return {
    limit,
    spent,
    remaining: limit - spent,
    status: budgetStatus(spent, limit),
    extraLabel,
  };
}

export async function getWeeklyBucketSummary(
  userId: string,
  type: CategoryType,
  date: string = getTodayWIB(),
): Promise<BucketSummary> {
  const settings = await getSettings(userId);
  const { start, end } = getWeekRangeWIB(date);
  const categories = await categoryMap(userId);
  const txs = await listTransactions(userId, { from: start, to: end });
  const spent = sumByType(txs, categories, [type]);

  if (type === 'coffee') {
    const cupsLeft = settings.coffeeAvgCup > 0
      ? Math.max(0, Math.floor((settings.coffeeWeeklyLimit - spent) / settings.coffeeAvgCup))
      : 0;
    return bucketSummary(
      spent,
      settings.coffeeWeeklyLimit,
      `~${cupsLeft} cup lagi`,
    );
  }
  if (type === 'transport') {
    return bucketSummary(spent, settings.transportWeeklyLimit);
  }
  return bucketSummary(spent, settings.bufferWeeklyLimit);
}

export async function getWeekendBalance(userId: string): Promise<number> {
  await settlePendingDays(userId);
  const settings = await getSettings(userId);
  return settings.weekendBalance;
}

export async function getMonthlyBudgetSummary(
  userId: string,
  date: string = getTodayWIB(),
): Promise<MonthlyBudgetSummary> {
  const settings = await getSettings(userId);
  const monthKey = getMonthKeyWIB(date);
  const txs = await listTransactions(userId);
  const monthTxs = txs.filter((t) => t.occurredDateWib.startsWith(monthKey));

  return {
    monthKey,
    trading: bucketSummary(
      sumByTransactionType(monthTxs, 'trading'),
      settings.tradingMonthlyLimit,
    ),
    saving: sumByTransactionType(monthTxs, 'saving'),
    investment: sumByTransactionType(monthTxs, 'investment'),
  };
}

export async function getWeeklyBudgetSummary(
  userId: string,
  date: string = getTodayWIB(),
): Promise<WeeklyBudgetSummary> {
  await settlePendingDays(userId);
  const settings = await getSettings(userId);
  const { start, end } = getWeekRangeWIB(date);
  const categories = await categoryMap(userId);
  const txs = await listTransactions(userId, { from: start, to: end });
  const ledgers = await listLedgers(userId, start, end);

  const days: WeeklyDaySummary[] = [];
  let cursor = start;
  while (cursor <= end) {
    const dayTxs = txs.filter((t) => t.occurredDateWib === cursor);
    const daySpent = dayTxs.reduce((s, t) => s + t.amount, 0);
    const ledger = ledgers.find((l) => l.date === cursor);
    const daily = cursor === getTodayWIB()
      ? await getDailyBudgetSummary(userId, cursor)
      : null;

    days.push({
      date: cursor,
      dayLabel: getDayLabelWIB(cursor),
      spent: daySpent,
      dailyRemaining: ledger?.dailyRemaining ?? daily?.remaining ?? 0,
      rolledToWeekend: ledger?.rolledToWeekend ?? 0,
      transactions: dayTxs,
    });
    cursor = addDaysWIB(cursor, 1);
  }

  const dailyTypes = sumByType(txs, categories, ['spending_daily']);
  const totalOverbudget = days.reduce(
    (s, d) => s + (d.dailyRemaining < 0 ? -d.dailyRemaining : 0),
    0,
  );

  return {
    weekStart: start,
    weekEnd: end,
    totalDailyAllowance: settings.dailyAllowance * 7,
    totalDailySpent: dailyTypes,
    totalRolledToWeekend: ledgers.reduce((s, l) => s + l.rolledToWeekend, 0),
    coffee: sumByType(txs, categories, ['coffee']),
    transport: sumByType(txs, categories, ['transport']),
    other: sumByType(txs, categories, ['other']),
    saving: sumByTransactionType(txs, 'saving'),
    investment: sumByTransactionType(txs, 'investment'),
    trading: sumByTransactionType(txs, 'trading'),
    totalOverbudget,
    weekendBalance: settings.weekendBalance,
    days,
  };
}

export async function updateBudgetSettings(
  userId: string,
  payload: Partial<
    Pick<
      BudgetSettings,
      | 'dailyAllowance'
      | 'coffeeWeeklyLimit'
      | 'transportWeeklyLimit'
      | 'bufferWeeklyLimit'
      | 'tradingMonthlyLimit'
      | 'coffeeAvgCup'
    >
  >,
): Promise<BudgetSettings> {
  const settings = await getSettings(userId);
  const next = { ...settings, ...payload };
  await saveSettings(next);
  return next;
}

/** Recalculate dari tanggal tertentu setelah backdate/edit */
export async function recalculateFromDate(userId: string, fromDate: string): Promise<void> {
  const settings = await getSettings(userId);
  if (!settings.lastSettledDate || settings.lastSettledDate >= fromDate) {
    await deleteLedgersFrom(userId, fromDate);
    const earlierLedgers = await listLedgers(userId, undefined, addDaysWIB(fromDate, -1));
    const lastBefore = earlierLedgers.at(-1);
    settings.lastSettledDate = lastBefore?.date ?? null;
    settings.carriedDeficit = lastBefore?.deficitCarried ?? 0;
    settings.weekendBalance = await rebuildWeekendBalance(userId);
    await saveSettings(settings);
  }
  await settlePendingDays(userId);
  const refreshed = await getSettings(userId);
  refreshed.weekendBalance = await rebuildWeekendBalance(userId);
  await saveSettings(refreshed);
}

export type CreateTxPayload = {
  categoryId: string;
  amount: number;
  note?: string;
  occurredAt?: string;
  occurredDateWib?: string;
};

export async function addTransaction(
  userId: string,
  payload: CreateTxPayload,
): Promise<{ tx: BudgetTransaction; weekendWarning?: string }> {
  const categories = await listCategories(userId);
  const cat = categories.find((c) => c.id === payload.categoryId);
  if (!cat) {
    throw new Error('Kategori tidak ditemukan');
  }
  if (!Number.isFinite(payload.amount) || payload.amount <= 0) {
    throw new Error('Nominal tidak valid');
  }

  const occurredAt = payload.occurredAt ?? wibNowIso();
  const occurredDateWib = payload.occurredDateWib ?? getDateKeyWIB(new Date(occurredAt));

  const tx = await createTransaction(userId, {
    categoryId: cat.id,
    categoryNameSnapshot: cat.name,
    amount: Math.round(payload.amount),
    note: payload.note?.trim() || undefined,
    transactionType: transactionTypeFromCategory(cat.type),
    occurredAt,
    occurredDateWib,
  });

  const today = getTodayWIB();
  if (occurredDateWib < today) {
    await recalculateFromDate(userId, occurredDateWib);
  } else {
    const fresh = await getSettings(userId);
    fresh.weekendBalance = await rebuildWeekendBalance(userId);
    await saveSettings(fresh);
  }

  let weekendWarning: string | undefined;
  if (cat.type === 'weekend') {
    const bal = (await getSettings(userId)).weekendBalance;
    if (bal < 0) {
      weekendWarning = 'Saldo weekend kurang — transaksi tetap tersimpan';
    }
  }

  return { tx, weekendWarning };
}

export {
  createCategory,
  updateCategory,
  listCategories,
  listTransactions,
  deleteTransaction,
  settleDailyBudget,
  settlePendingDays,
};

