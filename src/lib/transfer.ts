import type { Trip } from "@/types";
import { coerceTrips } from "@/lib/storage";

const EXPORT_FORMAT = "travel-app:trips";
const EXPORT_VERSION = 1;

type ExportEnvelope = {
  format: string;
  version: number;
  exportedAt: string;
  trips: Trip[];
};

/** 全しおりを、メタ情報付きの JSON 文字列に書き出す。 */
export function exportTripsJson(trips: Trip[], exportedAt: string): string {
  const envelope: ExportEnvelope = {
    format: EXPORT_FORMAT,
    version: EXPORT_VERSION,
    exportedAt,
    trips,
  };
  return JSON.stringify(envelope, null, 2);
}

/**
 * エクスポート JSON 文字列を Trip 配列に復元する。
 * エンベロープ（{trips:[...]}）でも、素の配列でも受け付ける。
 * 壊れたフィールドは coerceTrips が既定値で補う。解析不能なら空配列。
 */
export function parseTripsJson(text: string): Trip[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return [];
  }
  if (Array.isArray(parsed)) return coerceTrips(parsed);
  if (
    typeof parsed === "object" &&
    parsed !== null &&
    "trips" in parsed
  ) {
    return coerceTrips((parsed as { trips: unknown }).trips);
  }
  return [];
}
