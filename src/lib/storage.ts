import type { ItineraryDay, Spot, Trip } from "@/types";

export const STORAGE_KEY = "travel-app:trips:v1";

/** 保存データを安全な Trip 形へ整える。欠落フィールドは既定値で補う。 */
function normalizeTrip(raw: Record<string, unknown>): Trip {
  const days = Array.isArray(raw.days)
    ? (raw.days as unknown[]).map(normalizeDay)
    : [];
  return {
    id: String(raw.id),
    title: String(raw.title),
    destination: typeof raw.destination === "string" ? raw.destination : "",
    startDate: typeof raw.startDate === "string" ? raw.startDate : "",
    endDate: typeof raw.endDate === "string" ? raw.endDate : "",
    days,
    createdAt: typeof raw.createdAt === "number" ? raw.createdAt : 0,
    updatedAt: typeof raw.updatedAt === "number" ? raw.updatedAt : 0,
  };
}

function normalizeDay(raw: unknown): ItineraryDay {
  const d = (raw ?? {}) as Record<string, unknown>;
  return {
    id: typeof d.id === "string" ? d.id : "",
    date: typeof d.date === "string" ? d.date : "",
    spots: Array.isArray(d.spots) ? (d.spots as unknown[]).map(normalizeSpot) : [],
  };
}

function normalizeSpot(raw: unknown): Spot {
  const s = (raw ?? {}) as Record<string, unknown>;
  return {
    id: typeof s.id === "string" ? s.id : "",
    time: typeof s.time === "string" ? s.time : "",
    title: typeof s.title === "string" ? s.title : "",
    category: typeof s.category === "string" ? (s.category as Spot["category"]) : "その他",
    memo: typeof s.memo === "string" ? s.memo : "",
  };
}

/**
 * localStorage が利用可能か判定する。
 * SSR 中（window 不在）やプライベートモードでの例外を考慮する。
 */
function canUseStorage(): boolean {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
}

/** 保存済みの全しおりを読み込む。壊れたデータは無視して空配列を返す。 */
export function loadTrips(): Trip[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // id と title を持つものだけ採用し、欠落フィールドは既定値で補う。
    return parsed
      .filter(
        (t): t is Record<string, unknown> =>
          typeof t === "object" &&
          t !== null &&
          typeof (t as Record<string, unknown>).id === "string" &&
          typeof (t as Record<string, unknown>).title === "string",
      )
      .map(normalizeTrip);
  } catch {
    return [];
  }
}

/** 全しおりを保存する。 */
export function saveTrips(trips: Trip[]): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
  } catch {
    // 容量超過などは黙って無視する（UI を壊さない）。
  }
}
