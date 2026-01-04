export function normalizeText(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

export function hashKey(parts: Array<string | undefined | null>): string {
  const joined = parts
    .filter((p) => p !== undefined && p !== null)
    .map((p) => normalizeText(String(p)))
    .join('|');
  let hash = 0;
  for (let i = 0; i < joined.length; i++) {
    const chr = joined.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return `h${Math.abs(hash)}`;
}
