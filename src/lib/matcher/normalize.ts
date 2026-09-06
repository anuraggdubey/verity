export function normalizeText(value: string): string {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
}

export function normalizeCurrency(value: string): string {
  const currency = value.trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) throw new Error(`Invalid ISO currency "${value}"`);
  return currency;
}

export function parseIsoDate(value: string): string {
  const text = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) throw new Error(`Invalid ISO date "${value}"`);
  const date = new Date(`${text}T00:00:00Z`);
  if (Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== text) {
    throw new Error(`Invalid ISO date "${value}"`);
  }
  return text;
}

export function parseMoneyMinor(value: string | number): number {
  const text = String(value).trim().replace(/,/g, '');
  if (!/^-?\d+(\.\d{1,2})?$/.test(text)) throw new Error(`Invalid monetary amount "${value}"`);
  return Math.round(Number(text) * 100);
}

export function daysBetween(left: string, right: string): number {
  return Math.abs(Date.parse(`${left}T00:00:00Z`) - Date.parse(`${right}T00:00:00Z`)) / 86_400_000;
}
