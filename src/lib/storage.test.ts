// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import type { Trip } from "@/types";
import { STORAGE_KEY, loadTrips, saveTrips } from "@/lib/storage";

function makeTrip(over: Partial<Trip> = {}): Trip {
  return {
    id: "t1",
    title: "京都旅行",
    destination: "京都",
    startDate: "2026-07-10",
    endDate: "2026-07-12",
    days: [{ id: "d1", date: "2026-07-10", spots: [] }],
    createdAt: 1,
    updatedAt: 2,
    ...over,
  };
}

afterEach(() => {
  window.localStorage.clear();
});

describe("saveTrips / loadTrips", () => {
  it("保存した内容をそのまま読み戻せる", () => {
    const trips = [makeTrip()];
    saveTrips(trips);
    expect(loadTrips()).toEqual(trips);
  });

  it("未保存（キーなし）は空配列", () => {
    expect(loadTrips()).toEqual([]);
  });
});

describe("loadTrips の防御的正規化", () => {
  it("days が無いデータでも days: [] を補う", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([{ id: "t1", title: "旧データ" }]),
    );
    const [trip] = loadTrips();
    expect(trip.days).toEqual([]);
    expect(trip.destination).toBe("");
  });

  it("spot の欠落フィールドを既定値で補う（category は その他）", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        { id: "t1", title: "t", days: [{ id: "d1", spots: [{ id: "s1" }] }] },
      ]),
    );
    const spot = loadTrips()[0].days[0].spots[0];
    expect(spot).toEqual({
      id: "s1",
      time: "",
      title: "",
      category: "その他",
      memo: "",
    });
  });

  it("id / title を欠くエントリは除外する", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        { id: "ok", title: "有効" },
        { title: "id なし" },
        { id: "title なし" },
        null,
        "文字列",
      ]),
    );
    const trips = loadTrips();
    expect(trips).toHaveLength(1);
    expect(trips[0].id).toBe("ok");
  });

  it("未知のキーは取り込まない（不要なデータ混入を防ぐ）", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([{ id: "t1", title: "t", evil: "x", days: [] }]),
    );
    const trip = loadTrips()[0] as unknown as Record<string, unknown>;
    expect(trip.evil).toBeUndefined();
  });

  it("壊れた JSON は空配列（クラッシュしない）", () => {
    window.localStorage.setItem(STORAGE_KEY, "{壊れた");
    expect(loadTrips()).toEqual([]);
  });

  it("配列でない JSON は空配列", () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ not: "array" }));
    expect(loadTrips()).toEqual([]);
  });
});
