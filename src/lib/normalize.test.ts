import { describe, expect, it } from "vitest";
import { coerceTrip, coerceTrips } from "@/lib/normalize";

describe("coerceTrips", () => {
  it("days が無いデータでも days: [] を補う", () => {
    const [trip] = coerceTrips([{ id: "t1", title: "旧データ" }]);
    expect(trip.days).toEqual([]);
    expect(trip.destination).toBe("");
    expect(trip.budget).toBe(0);
  });

  it("spot の欠落フィールドを既定値で補う（category は その他）", () => {
    const trips = coerceTrips([
      { id: "t1", title: "t", days: [{ id: "d1", spots: [{ id: "s1" }] }] },
    ]);
    expect(trips[0].days[0].spots[0]).toEqual({
      id: "s1",
      time: "",
      title: "",
      category: "その他",
      memo: "",
      cost: 0,
    });
  });

  it("id / title を欠くエントリは除外する", () => {
    const trips = coerceTrips([
      { id: "ok", title: "有効" },
      { title: "id なし" },
      { id: "title なし" },
      null,
      "文字列",
    ]);
    expect(trips).toHaveLength(1);
    expect(trips[0].id).toBe("ok");
  });

  it("未知のキーは取り込まない", () => {
    const trip = coerceTrips([
      { id: "t1", title: "t", evil: "x", days: [] },
    ])[0] as unknown as Record<string, unknown>;
    expect(trip.evil).toBeUndefined();
  });

  it("不正な budget / cost（文字列・負値）は 0 に正規化する", () => {
    const trips = coerceTrips([
      {
        id: "t1",
        title: "t",
        budget: "５万円",
        days: [{ id: "d1", spots: [{ id: "s1", cost: -100 }] }],
      },
    ]);
    expect(trips[0].budget).toBe(0);
    expect(trips[0].days[0].spots[0].cost).toBe(0);
  });

  it("配列でなければ空配列", () => {
    expect(coerceTrips({ not: "array" })).toEqual([]);
    expect(coerceTrips(null)).toEqual([]);
  });
});

describe("coerceTrip", () => {
  it("有効な1件を正規化する", () => {
    const trip = coerceTrip({ id: "t1", title: "京都", budget: 1000 });
    expect(trip?.id).toBe("t1");
    expect(trip?.budget).toBe(1000);
    expect(trip?.days).toEqual([]);
  });

  it("id / title が無ければ null", () => {
    expect(coerceTrip({ title: "id なし" })).toBeNull();
    expect(coerceTrip(null)).toBeNull();
  });
});
