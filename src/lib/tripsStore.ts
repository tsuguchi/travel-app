import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import type { Trip } from "@/types";
import { createId } from "@/lib/id";
import { cloneTripWithNewIds } from "@/lib/trip";
import { coerceTrip } from "@/lib/normalize";
import { db } from "@/lib/firebase";

/**
 * 全しおりの外部ストア。Firestore の users/{uid}/trips を信頼できる保存先とし、
 * onSnapshot でリアルタイム購読する。useSyncExternalStore から購読する。
 *
 * 編集中の体感を保つため「楽観的更新（cache を即時更新）＋デバウンス書き込み」
 * を採用。書き込み待ち（dirty）のしおりは、他要因の onSnapshot で上書きしない。
 */

let cache: Trip[] = [];
let status: "idle" | "loading" | "ready" = "idle";
let currentUid: string | null = null;
let unsubscribe: (() => void) | null = null;

const listeners = new Set<() => void>();
const SERVER_SNAPSHOT: Trip[] = [];

// 書き込み待ちのしおり ID（onSnapshot による上書きから守る）
const dirty = new Set<string>();
// デバウンス用タイマー（しおり ID 単位）
const flushTimers = new Map<string, ReturnType<typeof setTimeout>>();
const FLUSH_DELAY_MS = 600;

function notify(): void {
  listeners.forEach((l) => l());
}

function setCache(next: Trip[]): void {
  cache = next;
  notify();
}

/** createdAt 降順（新しいしおりが上）に整える。 */
function sortTrips(trips: Trip[]): Trip[] {
  return [...trips].sort((a, b) => b.createdAt - a.createdAt);
}

function tripsCollection(uid: string) {
  if (!db) throw new Error("Firestore is not configured");
  return collection(db, "users", uid, "trips");
}

// --- useSyncExternalStore 連携 ---
export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): Trip[] {
  return cache;
}

export function getServerSnapshot(): Trip[] {
  return SERVER_SNAPSHOT;
}

export function getLoadedSnapshot(): boolean {
  return status === "ready";
}

export function getServerLoaded(): boolean {
  return false;
}

/**
 * 購読対象のユーザーを切り替える。サインイン時に uid、サインアウト時に null。
 */
export function setActiveUser(uid: string | null): void {
  if (uid === currentUid) return;

  // 旧ユーザーの購読・保留中の書き込みを片付ける
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
  flushTimers.forEach((t) => clearTimeout(t));
  flushTimers.clear();
  dirty.clear();

  currentUid = uid;
  cache = [];
  status = uid && db ? "loading" : "ready";
  notify();

  if (!uid || !db) return;

  unsubscribe = onSnapshot(
    tripsCollection(uid),
    (snap) => {
      const incoming: Trip[] = [];
      snap.forEach((d) => {
        const trip = coerceTrip({ ...d.data(), id: d.id });
        if (trip) incoming.push(trip);
      });
      // 編集中（dirty）のしおりはローカルの値を優先する
      const merged = incoming.map((t) => {
        if (!dirty.has(t.id)) return t;
        return cache.find((c) => c.id === t.id) ?? t;
      });
      status = "ready";
      setCache(sortTrips(merged));
    },
    () => {
      // 購読エラー時も画面を止めない
      status = "ready";
      notify();
    },
  );
}

// --- 書き込み（楽観的更新 + デバウンス） ---
function scheduleFlush(id: string): void {
  const existing = flushTimers.get(id);
  if (existing) clearTimeout(existing);
  flushTimers.set(
    id,
    setTimeout(() => {
      void flush(id);
    }, FLUSH_DELAY_MS),
  );
}

async function flush(id: string): Promise<void> {
  flushTimers.delete(id);
  const uid = currentUid;
  const trip = cache.find((t) => t.id === id);
  if (!uid || !db || !trip) {
    dirty.delete(id);
    return;
  }
  try {
    await setDoc(doc(tripsCollection(uid), id), trip);
  } finally {
    dirty.delete(id);
  }
}

export function createTrip(): string {
  const now = Date.now();
  const id = createId();
  const trip: Trip = {
    id,
    title: "新しいしおり",
    destination: "",
    startDate: "",
    endDate: "",
    budget: 0,
    days: [{ id: createId(), date: "", spots: [] }],
    createdAt: now,
    updatedAt: now,
  };
  setCache(sortTrips([trip, ...cache]));
  const uid = currentUid;
  if (uid && db) void setDoc(doc(tripsCollection(uid), id), trip);
  return id;
}

export function updateTrip(
  id: string,
  patch: Partial<Omit<Trip, "id" | "createdAt">>,
): void {
  let changed = false;
  const next = cache.map((t) => {
    if (t.id !== id) return t;
    changed = true;
    return { ...t, ...patch, updatedAt: Date.now() };
  });
  if (!changed) return;
  dirty.add(id);
  setCache(next);
  scheduleFlush(id);
}

export function deleteTrip(id: string): void {
  setCache(cache.filter((t) => t.id !== id));
  dirty.delete(id);
  const timer = flushTimers.get(id);
  if (timer) {
    clearTimeout(timer);
    flushTimers.delete(id);
  }
  const uid = currentUid;
  if (uid && db) void deleteDoc(doc(tripsCollection(uid), id));
}

export function duplicateTrip(id: string): string {
  const now = Date.now();
  const src = cache.find((t) => t.id === id);
  if (!src) return "";
  const copy: Trip = {
    ...cloneTripWithNewIds(src),
    title: `${src.title}（コピー）`,
    createdAt: now,
    updatedAt: now,
  };
  setCache(sortTrips([copy, ...cache]));
  const uid = currentUid;
  if (uid && db) void setDoc(doc(tripsCollection(uid), copy.id), copy);
  return copy.id;
}

export function importTrips(incoming: Trip[]): number {
  if (incoming.length === 0) return 0;
  const now = Date.now();
  const cloned = incoming.map((t) => ({
    ...cloneTripWithNewIds(t),
    createdAt: now,
    updatedAt: now,
  }));
  setCache(sortTrips([...cloned, ...cache]));
  const uid = currentUid;
  if (uid && db) {
    for (const t of cloned) void setDoc(doc(tripsCollection(uid), t.id), t);
  }
  return cloned.length;
}

/** 移行用：既存 ID を保ったまま一括書き込みする。 */
export async function bulkPut(uid: string, trips: Trip[]): Promise<void> {
  if (!db) return;
  await Promise.all(
    trips.map((t) => setDoc(doc(tripsCollection(uid), t.id), t)),
  );
}
