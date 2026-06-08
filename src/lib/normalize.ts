import type { ItineraryDay, Spot, Trip } from "@/types";

/**
 * 任意の入力（localStorage・Firestore・インポート JSON）を安全な Trip 形へ
 * 整える正規化ロジック。保存先に依存しない純粋関数として切り出している。
 */

/** 有限な非負数だけ受け入れ、それ以外（文字列・NaN・Infinity・負値）は 0。 */
export function toFiniteNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : 0;
}

export function normalizeSpot(raw: unknown): Spot {
  const s = (raw ?? {}) as Record<string, unknown>;
  return {
    id: typeof s.id === "string" ? s.id : "",
    time: typeof s.time === "string" ? s.time : "",
    title: typeof s.title === "string" ? s.title : "",
    category:
      typeof s.category === "string" ? (s.category as Spot["category"]) : "その他",
    memo: typeof s.memo === "string" ? s.memo : "",
    cost: toFiniteNumber(s.cost),
  };
}

export function normalizeDay(raw: unknown): ItineraryDay {
  const d = (raw ?? {}) as Record<string, unknown>;
  return {
    id: typeof d.id === "string" ? d.id : "",
    date: typeof d.date === "string" ? d.date : "",
    spots: Array.isArray(d.spots) ? (d.spots as unknown[]).map(normalizeSpot) : [],
  };
}

/** 欠落フィールドを既定値で補う。id・title は呼び出し側で検証済みの前提。 */
export function normalizeTrip(raw: Record<string, unknown>): Trip {
  return {
    id: String(raw.id),
    title: String(raw.title),
    destination: typeof raw.destination === "string" ? raw.destination : "",
    startDate: typeof raw.startDate === "string" ? raw.startDate : "",
    endDate: typeof raw.endDate === "string" ? raw.endDate : "",
    budget: toFiniteNumber(raw.budget),
    days: Array.isArray(raw.days) ? (raw.days as unknown[]).map(normalizeDay) : [],
    createdAt: typeof raw.createdAt === "number" ? raw.createdAt : 0,
    updatedAt: typeof raw.updatedAt === "number" ? raw.updatedAt : 0,
  };
}

/**
 * 任意の値を安全な Trip 配列へ変換する。
 * 配列でなければ空配列。id・title を持つ要素だけ採用し、欠落は既定値で補う。
 */
export function coerceTrips(parsed: unknown): Trip[] {
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter(
      (t): t is Record<string, unknown> =>
        typeof t === "object" &&
        t !== null &&
        typeof (t as Record<string, unknown>).id === "string" &&
        typeof (t as Record<string, unknown>).title === "string",
    )
    .map(normalizeTrip);
}

/** 1件の生データを Trip に整える（id・title が無ければ null）。Firestore 読込用。 */
export function coerceTrip(raw: unknown): Trip | null {
  if (
    typeof raw !== "object" ||
    raw === null ||
    typeof (raw as Record<string, unknown>).id !== "string" ||
    typeof (raw as Record<string, unknown>).title !== "string"
  ) {
    return null;
  }
  return normalizeTrip(raw as Record<string, unknown>);
}
