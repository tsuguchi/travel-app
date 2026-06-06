// 旅のしおり（旅程）アプリのドメイン型定義

/** スポットの種別。色分け・アイコン表示に使う。 */
export type SpotCategory = "観光" | "食事" | "移動" | "宿泊" | "その他";

export const SPOT_CATEGORIES: SpotCategory[] = [
  "観光",
  "食事",
  "移動",
  "宿泊",
  "その他",
];

/** 1日の中の訪問予定（スポット）。 */
export interface Spot {
  id: string;
  /** 予定時刻。"09:00" 形式。未定なら空文字。 */
  time: string;
  /** スポット名・予定の見出し。 */
  title: string;
  category: SpotCategory;
  /** 補足メモ。 */
  memo: string;
}

/** 旅程の1日分。 */
export interface ItineraryDay {
  id: string;
  /** 日付。"2026-07-01" 形式。未定なら空文字。 */
  date: string;
  spots: Spot[];
}

/** 1件の旅のしおり。 */
export interface Trip {
  id: string;
  title: string;
  destination: string;
  /** 出発日。"2026-07-01" 形式。 */
  startDate: string;
  /** 帰着日。"2026-07-03" 形式。 */
  endDate: string;
  days: ItineraryDay[];
  /** 作成・更新時刻（エポックミリ秒）。一覧の並び替えに使う。 */
  createdAt: number;
  updatedAt: number;
}
