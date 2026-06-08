import { describe, expect, it } from "vitest";
import type { Spot } from "@/types";
import { isSortedByTime, sortSpotsByTime } from "@/lib/spot";

function spot(id: string, time: string): Spot {
  return { id, time, title: id, category: "観光", memo: "" };
}

describe("sortSpotsByTime", () => {
  it("時刻の昇順に並べ替える", () => {
    const input = [spot("a", "15:00"), spot("b", "09:30"), spot("c", "12:00")];
    expect(sortSpotsByTime(input).map((s) => s.id)).toEqual(["b", "c", "a"]);
  });

  it("時刻未入力（空文字）は末尾へ送る", () => {
    const input = [spot("a", ""), spot("b", "09:30"), spot("c", "")];
    const ids = sortSpotsByTime(input).map((s) => s.id);
    expect(ids[0]).toBe("b");
    expect(ids.slice(1).sort()).toEqual(["a", "c"]);
  });

  it("同時刻は元の順序を保つ（安定ソート）", () => {
    const input = [spot("a", "10:00"), spot("b", "10:00"), spot("c", "10:00")];
    expect(sortSpotsByTime(input).map((s) => s.id)).toEqual(["a", "b", "c"]);
  });

  it("元の配列を破壊しない", () => {
    const input = [spot("a", "15:00"), spot("b", "09:30")];
    sortSpotsByTime(input);
    expect(input.map((s) => s.id)).toEqual(["a", "b"]);
  });
});

describe("isSortedByTime", () => {
  it("整列済みなら true", () => {
    expect(
      isSortedByTime([spot("a", "09:00"), spot("b", "10:00"), spot("c", "")]),
    ).toBe(true);
  });

  it("未整列なら false", () => {
    expect(isSortedByTime([spot("a", "10:00"), spot("b", "09:00")])).toBe(false);
  });

  it("空配列・1件は true", () => {
    expect(isSortedByTime([])).toBe(true);
    expect(isSortedByTime([spot("a", "10:00")])).toBe(true);
  });
});
