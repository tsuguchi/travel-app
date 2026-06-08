"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { Trip } from "@/types";
import { createId } from "@/lib/id";
import { cloneTripWithNewIds } from "@/lib/trip";
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
      budget: 0,
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

  /**
   * 指定したしおりを複製し、新しい ID を返す。
   * 日・予定にもすべて新しい ID を振り直し、元の直後に挿入する。
   */
  const duplicateTrip = useCallback((id: string): string => {
    const now = Date.now();
    const copy = { id: "" };
    updateStore((prev) => {
      const index = prev.findIndex((t) => t.id === id);
      if (index === -1) return prev;
      const cloned: Trip = {
        ...cloneTripWithNewIds(prev[index]),
        title: `${prev[index].title}（コピー）`,
        createdAt: now,
        updatedAt: now,
      };
      copy.id = cloned.id;
      const next = [...prev];
      next.splice(index + 1, 0, cloned);
      return next;
    });
    return copy.id;
  }, []);

  /**
   * 外部 JSON 由来のしおりを取り込む。既存を壊さないよう ID を振り直し、
   * 先頭に追加する。取り込んだ件数を返す。
   */
  const importTrips = useCallback((incoming: Trip[]): number => {
    if (incoming.length === 0) return 0;
    const now = Date.now();
    const cloned = incoming.map((t) => ({
      ...cloneTripWithNewIds(t),
      createdAt: now,
      updatedAt: now,
    }));
    updateStore((prev) => [...cloned, ...prev]);
    return cloned.length;
  }, []);

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
