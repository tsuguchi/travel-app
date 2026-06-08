import type { Trip } from "@/types";
import { createId } from "@/lib/id";

/**
 * しおりを深くコピーし、しおり・各日・各予定すべてに新しい ID を振り直す。
 * 複製や、外部データのインポート時に既存 ID と衝突させないために使う。
 */
export function cloneTripWithNewIds(trip: Trip): Trip {
  return {
    ...trip,
    id: createId(),
    days: trip.days.map((day) => ({
      ...day,
      id: createId(),
      spots: day.spots.map((spot) => ({ ...spot, id: createId() })),
    })),
  };
}
