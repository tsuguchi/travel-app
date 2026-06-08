// 画面間で共有する Tailwind クラス・ブランド色の定数。
// 重複していたボタン/入力欄スタイルを1か所に集約する。

/** デジタル庁デザインシステム準拠のブランド青。 */
export const BRAND_BLUE = "#0017c1";

/** 塗り（Primary）ボタン。1画面に原則1個。 */
export const PRIMARY_BUTTON =
  "rounded-md bg-[#0017c1] px-4 py-2 font-bold text-white hover:bg-[#000fa0]";

/** アウトライン（Secondary）ボタン。 */
export const OUTLINE_BUTTON =
  "rounded-md border border-[#0017c1] px-4 py-2 text-sm font-bold text-[#0017c1] hover:bg-blue-50";

/** フォーム入力欄の共通スタイル（境界線コントラスト 3:1 以上）。 */
export const FIELD_INPUT =
  "rounded-md border border-gray-500 bg-white px-3 py-2 focus:border-[#0017c1]";
