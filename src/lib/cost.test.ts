import { describe, expect, it } from "vitest";
import type { ItineraryDay, Spot, Trip } from "@/types";
import {
  budgetRemaining,
  dayTotalCost,
  formatYen,
  tripTotalCost,
} from "@/lib/cost";

function spot(cost: number): Spot {
  return { id: "s", time: "", title: "", category: "観光", memo: "", cost };
}

function day(...costs: number[]): ItineraryDay {
  return { id: "d", date: "", spots: costs.map(spot) };
}

function trip(budget: number, days: ItineraryDay[]): Trip {
  return {
    id: "t",
    title: "",
    destination: "",
    startDate: "",
    endDate: "",
    budget,
    days,
    createdAt: 0,
    updatedAt: 0,
  };
}

describe("dayTotalCost", () => {
  it("その日の費用を合計する", () => {
    expect(dayTotalCost(day(1000, 500, 0))).toBe(1500);
  });
  it("予定なしは 0", () => {
    expect(dayTotalCost(day())).toBe(0);
  });
});

describe("tripTotalCost", () => {
  it("全日の費用を合計する", () => {
    expect(tripTotalCost(trip(0, [day(1000, 500), day(2000)]))).toBe(3500);
  });
});

describe("budgetRemaining", () => {
  it("予算が合計を上回れば残額は正", () => {
    expect(budgetRemaining(trip(10000, [day(3000)]))).toBe(7000);
  });
  it("超過すれば負", () => {
    expect(budgetRemaining(trip(5000, [day(8000)]))).toBe(-3000);
  });
  it("予算未設定(0)なら合計の符号反転", () => {
    expect(budgetRemaining(trip(0, [day(1200)]))).toBe(-1200);
  });
});

describe("formatYen", () => {
  it("3桁区切りで円表記にする", () => {
    expect(formatYen(1234567)).toBe("1,234,567円");
  });
  it("0円", () => {
    expect(formatYen(0)).toBe("0円");
  });
  it("小数は四捨五入する", () => {
    expect(formatYen(999.6)).toBe("1,000円");
  });
});
