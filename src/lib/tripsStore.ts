import type { Trip } from "@/types";
import { loadTrips, saveTrips, STORAGE_KEY } from "@/lib/storage";

/**
 * 全しおりの外部ストア。useSyncExternalStore から購読する。
 * localStorage を信頼できる保存先とし、メモリ上にキャッシュを持つ。
 */

// null = まだ localStorage から読み込んでいない
let cache: Trip[] | null = null;
const listeners = new Set<() => void>();

// サーバー描画・ハイドレーション時に返す安定した空配列
const SERVER_SNAPSHOT: Trip[] = [];

function ensureLoaded(): Trip[] {
  if (cache === null) cache = loadTrips();
  return cache;
}

function notify(): void {
  listeners.forEach((l) => l());
}

// 他タブでの変更を検知して同期する（モジュールで1つだけ登録する）
function handleStorageEvent(e: StorageEvent): void {
  // 自分のキー以外（無関係なキーや別アプリの書き込み）は無視する。
  // key === null は localStorage.clear() を表すので同期する。
  if (e.key !== null && e.key !== STORAGE_KEY) return;
  cache = loadTrips();
  notify();
}

export function getSnapshot(): Trip[] {
  return ensureLoaded();
}

export function getServerSnapshot(): Trip[] {
  return SERVER_SNAPSHOT;
}

export function subscribe(listener: () => void): () => void {
  if (listeners.size === 0 && typeof window !== "undefined") {
    window.addEventListener("storage", handleStorageEvent);
  }
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && typeof window !== "undefined") {
      window.removeEventListener("storage", handleStorageEvent);
    }
  };
}

/** ストアを更新し、保存して購読者へ通知する。 */
export function updateStore(updater: (prev: Trip[]) => Trip[]): void {
  const next = updater(ensureLoaded());
  cache = next;
  saveTrips(next);
  notify();
}
