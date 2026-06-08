"use client";

import { useSyncExternalStore } from "react";
import {
  createTrip,
  deleteTrip,
  duplicateTrip,
  getLoadedSnapshot,
  getServerLoaded,
  getServerSnapshot,
  getSnapshot,
  importTrips,
  subscribe,
  updateTrip,
} from "@/lib/tripsStore";

/**
 * 全しおりを外部ストア（Firestore 同期）から購読するフック。
 * 認証済みユーザーの users/{uid}/trips をリアルタイムに反映する。
 * loaded は最初のスナップショット受信後に true になる。
 */
export function useTrips() {
  const trips = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const loaded = useSyncExternalStore(
    subscribe,
    getLoadedSnapshot,
    getServerLoaded,
  );

  return {
    trips,
    loaded,
    createTrip,
    updateTrip,
    deleteTrip,
    duplicateTrip,
    importTrips,
  };
}
