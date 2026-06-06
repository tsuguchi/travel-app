"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { Trip } from "@/types";
import { createId } from "@/lib/id";
import {
  getServerSnapshot,
  getSnapshot,
  subscribe,
  updateStore,
} from "@/lib/tripsStore";

/**
 * 全しおりを外部ストア（localStorage 同期）から購読するフック。
 * loaded は、ハイドレーション後（クライアント側）に true になる。
 */
export function useTrips() {
  const trips = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const loaded = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  /** 新しい空のしおりを作成し、その ID を返す。 */
  const createTrip = useCallback((): string => {
    const now = Date.now();
    const id = createId();
    const trip: Trip = {
      id,
      title: "新しいしおり",
      destination: "",
      startDate: "",
      endDate: "",
      days: [{ id: createId(), date: "", spots: [] }],
      createdAt: now,
      updatedAt: now,
    };
    updateStore((prev) => [trip, ...prev]);
    return id;
  }, []);

  /** 指定したしおりを部分更新する。updatedAt は自動で更新する。 */
  const updateTrip = useCallback(
    (id: string, patch: Partial<Omit<Trip, "id" | "createdAt">>) => {
      updateStore((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, ...patch, updatedAt: Date.now() } : t,
        ),
      );
    },
    [],
  );

  /** 指定したしおりを削除する。 */
  const deleteTrip = useCallback((id: string) => {
    updateStore((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { trips, loaded, createTrip, updateTrip, deleteTrip };
}
