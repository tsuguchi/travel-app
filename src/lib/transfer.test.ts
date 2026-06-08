import { describe, expect, it } from "vitest";
import type { Trip } from "@/types";
import { exportTripsJson, parseTripsJson } from "@/lib/transfer";

function makeTrip(id: string): Trip {
  return {
    id,
    title: "旅行",
    destination: "京都",
    startDate: "2026-07-10",
    endDate: "2026-07-11",
    budget: 30000,
    days: [
      {
        id: "d1",
        date: "2026-07-10",
        spots: [
          { id: "s1", time: "10:00", title: "清水寺", category: "観光", memo: "", cost: 500 },
        ],
      },
    ],
    createdAt: 1,
    updatedAt: 2,
  };
}

describe("exportTripsJson / parseTripsJson", () => {
  it("エクスポートした JSON をそのまま復元できる", () => {
    const trips = [makeTrip("t1"), makeTrip("t2")];
    const json = exportTripsJson(trips, "2026-06-08T00:00:00.000Z");
    expect(parseTripsJson(json)).toEqual(trips);
  });

  it("エンベロープに format/version/exportedAt を含む", () => {
    const json = exportTripsJson([makeTrip("t1")], "2026-06-08T00:00:00.000Z");
    const obj = JSON.parse(json);
    expect(obj.format).toBe("travel-app:trips");
    expect(obj.version).toBe(1);
    expect(obj.exportedAt).toBe("2026-06-08T00:00:00.000Z");
  });
});

describe("parseTripsJson の受け入れと防御", () => {
  it("素の配列も受け付ける", () => {
    const trips = [makeTrip("t1")];
    expect(parseTripsJson(JSON.stringify(trips))).toEqual(trips);
  });

  it("壊れた JSON は空配列", () => {
    expect(parseTripsJson("{壊れた")).toEqual([]);
  });

  it("trips を持たないオブジェクトは空配列", () => {
    expect(parseTripsJson(JSON.stringify({ foo: 1 }))).toEqual([]);
  });

  it("不正な要素を除外し、欠落フィールドを補う", () => {
    const json = JSON.stringify({
      trips: [
        { id: "ok", title: "有効" },
        { title: "id なし" },
      ],
    });
    const result = parseTripsJson(json);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("ok");
    expect(result[0].days).toEqual([]);
    expect(result[0].budget).toBe(0);
  });
});
