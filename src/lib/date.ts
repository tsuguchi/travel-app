/** "2026-07-01" を Date に変換する。空文字・不正値は null。ローカル時刻で解釈する。 */
function parseIsoDate(iso: string): Date | null {
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** "2026-07-01" を "2026年7月1日(水)" のような表示に整える。 */
export function formatDateJa(iso: string): string {
  const d = parseIsoDate(iso);
  if (!d) return iso || "日付未定";
  const week = ["日", "月", "火", "水", "木", "金", "土"][d.getDay()];
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日(${week})`;
}

/** 出発日・帰着日から「2泊3日」などの期間表現を作る。 */
export function formatDuration(startDate: string, endDate: string): string {
  const start = parseIsoDate(startDate);
  const end = parseIsoDate(endDate);
  if (!start || !end) return "";
  const nights = Math.round(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (nights < 0) return "";
  if (nights === 0) return "日帰り";
  return `${nights}泊${nights + 1}日`;
}
