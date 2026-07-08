export function formatRupiah(amount: number): string {
  const safe = Number.isFinite(amount) ? Math.round(amount) : 0;
  const prefix = safe < 0 ? '-Rp' : 'Rp';
  return `${prefix}${Math.abs(safe).toLocaleString('id-ID')}`;
}

export function parseRupiahInput(raw: string): number | null {
  const digits = raw.replace(/[^\d]/g, '');
  if (!digits) {
    return null;
  }
  const value = Number(digits);
  if (!Number.isFinite(value) || value <= 0) {
    return null;
  }
  return value;
}

export function formatRupiahInput(value: number): string {
  if (!Number.isFinite(value) || value <= 0) {
    return '';
  }
  return value.toLocaleString('id-ID');
}
