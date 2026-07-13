export function normalizeVietnamese(value: string): string {
  return value.normalize('NFC');
}

export function normalizeForComparison(value: string): string {
  return normalizeVietnamese(value).trim().toLocaleLowerCase('vi');
}
