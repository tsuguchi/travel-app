import type { Spot } from "@/types";

/**
 * スポットを時刻の昇順に並べ替えた新しい配列を返す（元配列は変更しない）。
 * 時刻 "HH:MM" は文字列比較で時系列順になる。未入力（空文字）は末尾へ。
 * 同時刻・同条件は元の順序を保つ（安定ソート）。
 */
export function sortSpotsByTime(spots: Spot[]): Spot[] {
  return [...spots].sort((a, b) => {
    if (!a.time && !b.time) return 0;
    if (!a.time) return 1;
    if (!b.time) return -1;
    if (a.time < b.time) return -1;
    if (a.time > b.time) return 1;
    return 0;
  });
}

/** 既に時刻順（未入力は末尾）に並んでいるかを判定する。 */
export function isSortedByTime(spots: Spot[]): boolean {
  const sorted = sortSpotsByTime(spots);
  return spots.every((s, i) => s.id === sorted[i].id);
}
