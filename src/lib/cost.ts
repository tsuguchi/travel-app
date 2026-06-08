import type { ItineraryDay, Trip } from "@/types";

/** 1日分の費用合計（円）。 */
export function dayTotalCost(day: ItineraryDay): number {
  return day.spots.reduce((sum, spot) => sum + spot.cost, 0);
}

/** 旅行全体の費用合計（全日・全予定の合計、円）。 */
export function tripTotalCost(trip: Trip): number {
  return trip.days.reduce((sum, day) => sum + dayTotalCost(day), 0);
}

/** 予算に対する残額。予算未設定(0)や合計が予算以下なら 0 以上、超過なら負。 */
export function budgetRemaining(trip: Trip): number {
  return trip.budget - tripTotalCost(trip);
}

/** 金額を「1,234円」形式に整える。 */
export function formatYen(amount: number): string {
  return `${Math.round(amount).toLocaleString("ja-JP")}円`;
}
