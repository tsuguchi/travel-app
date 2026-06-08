import type { Trip } from "@/types";
import { formatDateJa, formatDuration } from "@/lib/date";
import { CATEGORY_STYLE } from "@/lib/category";

/**
 * 印刷・PDF 用の読み取り専用ビュー。画面では非表示（hidden）にし、
 * 印刷時のみ表示する（print:block）。各日はページ途中で切れないようにする。
 */
export default function TripPrintView({ trip }: { trip: Trip }) {
  const duration = formatDuration(trip.startDate, trip.endDate);
  return (
    <div className="hidden text-black print:block">
      <h1 className="text-2xl font-bold">{trip.title || "（無題のしおり）"}</h1>
      <p className="mt-1">
        {trip.destination || "行き先未定"}
        {duration && ` ・ ${duration}`}
      </p>
      {trip.startDate && (
        <p className="text-sm">
          {formatDateJa(trip.startDate)}
          {trip.endDate && ` 〜 ${formatDateJa(trip.endDate)}`}
        </p>
      )}

      {trip.days.map((day, i) => (
        <section key={day.id} className="mt-4 break-inside-avoid">
          <h2 className="border-b border-black pb-1 font-bold">
            {i + 1}日目
            {day.date && `（${formatDateJa(day.date)}）`}
          </h2>
          {day.spots.length === 0 ? (
            <p className="mt-1 text-sm">予定なし</p>
          ) : (
            <ul className="mt-1">
              {day.spots.map((spot) => (
                <li key={spot.id} className="mt-1 flex gap-2">
                  <span className="w-12 shrink-0 tabular-nums">
                    {spot.time || "--:--"}
                  </span>
                  <span>
                    <span aria-hidden="true">
                      {CATEGORY_STYLE[spot.category].icon}{" "}
                    </span>
                    {spot.title || "（無題）"}
                    {spot.memo && (
                      <span className="block text-sm text-gray-700">
                        {spot.memo}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}
