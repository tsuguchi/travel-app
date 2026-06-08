import type { SpotCategory } from "@/types";

/** 種別ごとのアイコンと、十分なコントラストを確保した配色（バッジ用）。 */
export const CATEGORY_STYLE: Record<
  SpotCategory,
  { icon: string; badgeClass: string }
> = {
  観光: { icon: "📷", badgeClass: "bg-blue-100 text-blue-900" },
  食事: { icon: "🍴", badgeClass: "bg-orange-100 text-orange-900" },
  移動: { icon: "🚃", badgeClass: "bg-green-100 text-green-900" },
  宿泊: { icon: "🛏️", badgeClass: "bg-purple-100 text-purple-900" },
  その他: { icon: "📌", badgeClass: "bg-gray-200 text-gray-800" },
};
