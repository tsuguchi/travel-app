import { describe, expect, it } from "vitest";
import { enumerateDates, formatDateJa, formatDuration } from "@/lib/date";

describe("enumerateDates", () => {
  it("両端を含む日付列を返す", () => {
    expect(enumerateDates("2026-07-10", "2026-07-12")).toEqual([
      "2026-07-10",
      "2026-07-11",
      "2026-07-12",
    ]);
  });

  it("同日は1件", () => {
    expect(enumerateDates("2026-07-10", "2026-07-10")).toEqual(["2026-07-10"]);
  });

  it("月をまたいでも連続する", () => {
    expect(enumerateDates("2026-07-30", "2026-08-01")).toEqual([
      "2026-07-30",
      "2026-07-31",
      "2026-08-01",
    ]);
  });

  it("逆順・空・不正値は空配列", () => {
    expect(enumerateDates("2026-07-12", "2026-07-10")).toEqual([]);
    expect(enumerateDates("", "2026-07-10")).toEqual([]);
    expect(enumerateDates("2026-07-10", "")).toEqual([]);
  });

  it("上限(60日)を超える範囲は空配列", () => {
    expect(enumerateDates("2026-01-01", "2026-12-31")).toEqual([]);
  });
});

describe("formatDuration", () => {
  it("2泊3日", () => {
    expect(formatDuration("2026-07-10", "2026-07-12")).toBe("2泊3日");
  });

  it("同日は日帰り", () => {
    expect(formatDuration("2026-07-10", "2026-07-10")).toBe("日帰り");
  });

  it("逆順・未入力は空文字", () => {
    expect(formatDuration("2026-07-12", "2026-07-10")).toBe("");
    expect(formatDuration("", "")).toBe("");
  });
});

describe("formatDateJa", () => {
  it("曜日付きの和文日付に整える", () => {
    expect(formatDateJa("2026-07-10")).toBe("2026年7月10日(金)");
  });

  it("未入力は『日付未定』", () => {
    expect(formatDateJa("")).toBe("日付未定");
  });
});
