import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  BUDGET_STORAGE_KEYS,
  BudgetCategory,
  BudgetSettings,
  BudgetTransaction,
  DailyLedger,
  DEFAULT_BUDGET_SETTINGS,
} from '../types/budget';
import { wibNowIso } from './wibTime';

function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function readJson<T>(key: string): Promise<T[]> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) {
    return [];
  }
  try {
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

async function writeJson<T>(key: string, data: T[]): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(data));
}

// ── Settings ──

export async function loadAllSettings(): Promise<BudgetSettings[]> {
  return readJson<BudgetSettings>(BUDGET_STORAGE_KEYS.settings);
}

export async function getSettings(userId: string): Promise<BudgetSettings> {
  const all = await loadAllSettings();
  const found = all.find((s) => s.userId === userId);
  if (found) {
    return found;
  }
  const fresh: BudgetSettings = {
    ...DEFAULT_BUDGET_SETTINGS,
    userId,
    updatedAt: wibNowIso(),
  };
  await saveSettings(fresh);
  return fresh;
}

export async function saveSettings(settings: BudgetSettings): Promise<void> {
  const all = await loadAllSettings();
  const idx = all.findIndex((s) => s.userId === settings.userId);
  const next = { ...settings, updatedAt: wibNowIso() };
  if (idx >= 0) {
    all[idx] = next;
  } else {
    all.push(next);
  }
  await writeJson(BUDGET_STORAGE_KEYS.settings, all);
}

// ── Categories ──

export async function loadAllCategories(): Promise<BudgetCategory[]> {
  return readJson<BudgetCategory>(BUDGET_STORAGE_KEYS.categories);
}

export async function listCategories(userId: string): Promise<BudgetCategory[]> {
  const all = await loadAllCategories();
  return all
    .filter((c) => c.userId === userId && c.isActive)
    .sort((a, b) => a.name.localeCompare(b.name, 'id'));
}

async function saveCategories(all: BudgetCategory[]): Promise<void> {
  await writeJson(BUDGET_STORAGE_KEYS.categories, all);
}

export async function createCategory(
  userId: string,
  payload: Pick<BudgetCategory, 'name' | 'type'> & {
    weeklyLimit?: number;
    monthlyLimit?: number;
  },
): Promise<BudgetCategory> {
  const all = await loadAllCategories();
  const now = wibNowIso();
  const cat: BudgetCategory = {
    id: newId(),
    userId,
    name: payload.name.trim(),
    type: payload.type,
    weeklyLimit: payload.weeklyLimit,
    monthlyLimit: payload.monthlyLimit,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };
  all.push(cat);
  await saveCategories(all);
  return cat;
}

export async function updateCategory(
  userId: string,
  categoryId: string,
  payload: Partial<Pick<BudgetCategory, 'name' | 'type' | 'weeklyLimit' | 'monthlyLimit' | 'isActive'>>,
): Promise<BudgetCategory | null> {
  const all = await loadAllCategories();
  const idx = all.findIndex((c) => c.id === categoryId && c.userId === userId);
  if (idx < 0) {
    return null;
  }
  all[idx] = { ...all[idx], ...payload, updatedAt: wibNowIso() };
  await saveCategories(all);
  return all[idx];
}

// ── Transactions ──

export async function loadAllTransactions(): Promise<BudgetTransaction[]> {
  return readJson<BudgetTransaction>(BUDGET_STORAGE_KEYS.transactions);
}

export async function listTransactions(
  userId: string,
  filters?: { from?: string; to?: string; categoryId?: string },
): Promise<BudgetTransaction[]> {
  const all = await loadAllTransactions();
  return all
    .filter((t) => {
      if (t.userId !== userId) {
        return false;
      }
      if (filters?.from && t.occurredDateWib < filters.from) {
        return false;
      }
      if (filters?.to && t.occurredDateWib > filters.to) {
        return false;
      }
      if (filters?.categoryId && t.categoryId !== filters.categoryId) {
        return false;
      }
      return true;
    })
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
}

async function saveTransactions(all: BudgetTransaction[]): Promise<void> {
  await writeJson(BUDGET_STORAGE_KEYS.transactions, all);
}

export async function createTransaction(
  userId: string,
  payload: Omit<BudgetTransaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
): Promise<BudgetTransaction> {
  const all = await loadAllTransactions();
  const now = wibNowIso();
  const tx: BudgetTransaction = {
    ...payload,
    id: newId(),
    userId,
    createdAt: now,
    updatedAt: now,
  };
  all.push(tx);
  await saveTransactions(all);
  return tx;
}

export async function deleteTransaction(userId: string, txId: string): Promise<boolean> {
  const all = await loadAllTransactions();
  const idx = all.findIndex((t) => t.id === txId && t.userId === userId);
  if (idx < 0) {
    return false;
  }
  all.splice(idx, 1);
  await saveTransactions(all);
  return true;
}

// ── Ledgers ──

export async function loadAllLedgers(): Promise<DailyLedger[]> {
  return readJson<DailyLedger>(BUDGET_STORAGE_KEYS.ledgers);
}

export async function getLedger(userId: string, date: string): Promise<DailyLedger | null> {
  const all = await loadAllLedgers();
  return all.find((l) => l.userId === userId && l.date === date) ?? null;
}

export async function listLedgers(userId: string, from?: string, to?: string): Promise<DailyLedger[]> {
  const all = await loadAllLedgers();
  return all
    .filter((l) => {
      if (l.userId !== userId) {
        return false;
      }
      if (from && l.date < from) {
        return false;
      }
      if (to && l.date > to) {
        return false;
      }
      return true;
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function upsertLedger(ledger: DailyLedger): Promise<void> {
  const all = await loadAllLedgers();
  const idx = all.findIndex((l) => l.userId === ledger.userId && l.date === ledger.date);
  if (idx >= 0) {
    all[idx] = ledger;
  } else {
    all.push(ledger);
  }
  await writeJson(BUDGET_STORAGE_KEYS.ledgers, all);
}

export async function deleteLedgersFrom(userId: string, fromDate: string): Promise<void> {
  const all = await loadAllLedgers();
  const kept = all.filter((l) => !(l.userId === userId && l.date >= fromDate));
  await writeJson(BUDGET_STORAGE_KEYS.ledgers, kept);
}

export { newId };
