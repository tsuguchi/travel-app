/** "2026-07-01" を Date に変換する。空文字・不正値は null。ローカル時刻で解釈する。 */
function parseIsoDate(iso: string): Date | null {
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Date を "YYYY-MM-DD"（ローカル日付）に整形する。 */
function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** 自動生成で扱う日数の上限（暴走防止）。 */
export const MAX_TRIP_DAYS = 60;

/**
 * 出発日〜帰着日（両端含む）の日付列を返す。
 * 不正・逆順・上限(MAX_TRIP_DAYS)超過の場合は空配列。
 */
export function enumerateDates(startDate: string, endDate: string): string[] {
  const start = parseIsoDate(startDate);
  const end = parseIsoDate(endDate);
  if (!start || !end || end.getTime() < start.getTime()) return [];
  const dates: string[] = [];
  const cur = new Date(start);
  // setDate でカレンダー加算するので DST にも影響されない。
  while (cur.getTime() <= end.getTime()) {
    dates.push(toIsoDate(cur));
    if (dates.length > MAX_TRIP_DAYS) return [];
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
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
