/**
 * 衝突しない ID を生成する。
 * 対応ブラウザでは crypto.randomUUID()、無い環境ではフォールバックを使う。
 */
export function createId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
