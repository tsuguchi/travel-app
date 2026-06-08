import type { Trip } from "@/types";
import { coerceTrips } from "@/lib/normalize";

/**
 * 旧バージョン（localStorage 保存）のデータを Firestore へ移行するための
 * 読み取り専用ユーティリティ。新規保存は Firestore 側で行う。
 */

const STORAGE_KEY = "travel-app:trips:v1";
// 移行済みかどうかを uid ごとに記録するキーの接頭辞。
const MIGRATED_PREFIX = "travel-app:migrated:";

function canUseStorage(): boolean {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
}

/** localStorage に残る旧データを読み込む（壊れていれば空配列）。 */
export function loadLegacyTrips(): Trip[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return coerceTrips(JSON.parse(raw));
  } catch {
    return [];
  }
}

/** 指定ユーザーについて移行済みかどうか。 */
export function hasMigrated(uid: string): boolean {
  if (!canUseStorage()) return true;
  return window.localStorage.getItem(MIGRATED_PREFIX + uid) === "1";
}

/** 移行完了を記録する。 */
export function markMigrated(uid: string): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(MIGRATED_PREFIX + uid, "1");
  } catch {
    // 記録できなくても致命的ではない（最悪、次回も移行を試みるだけ）。
  }
}
