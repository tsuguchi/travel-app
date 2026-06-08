"use client";

import type { ItineraryDay, Spot } from "@/types";
import { formatDateJa } from "@/lib/date";
import { isSortedByTime } from "@/lib/spot";
import { dayTotalCost, formatYen } from "@/lib/cost";
import { FIELD_INPUT, OUTLINE_BUTTON } from "@/lib/ui";
import SpotRow from "@/components/SpotRow";

type Props = {
  day: ItineraryDay;
  dayNumber: number;
  onChangeDate: (date: string) => void;
  onDeleteDay: () => void;
  onAddSpot: () => void;
  onSortSpots: () => void;
  onChangeSpot: (spotId: string, patch: Partial<Spot>) => void;
  onDeleteSpot: (spotId: string) => void;
};

export default function DayCard({
  day,
  dayNumber,
  onChangeDate,
  onDeleteDay,
  onAddSpot,
  onSortSpots,
  onChangeSpot,
  onDeleteSpot,
}: Props) {
  // 2件以上あり、まだ時刻順でないときだけ並べ替えを促す。
  const canSort = day.spots.length >= 2 && !isSortedByTime(day.spots);
  const total = dayTotalCost(day);
  return (
    <section className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-bold">{dayNumber}日目</h3>
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor={`date-${day.id}`}>
            {dayNumber}日目の日付
          </label>
          <input
            id={`date-${day.id}`}
            type="date"
            value={day.date}
            onChange={(e) => onChangeDate(e.target.value)}
            className={FIELD_INPUT}
          />
          <button
            type="button"
            onClick={onDeleteDay}
            className="rounded-md px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-100"
          >
            日を削除
          </button>
        </div>
      </div>

      {day.date && (
        <p className="mt-1 text-sm text-gray-600">{formatDateJa(day.date)}</p>
      )}

      {day.spots.length === 0 ? (
        <p className="mt-3 text-sm text-gray-600">まだ予定がありません。</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {day.spots.map((spot, i) => (
            <SpotRow
              key={spot.id}
              spot={spot}
              index={i}
              onChange={(patch) => onChangeSpot(spot.id, patch)}
              onDelete={() => onDeleteSpot(spot.id)}
            />
          ))}
        </ul>
      )}

      {total > 0 && (
        <p className="mt-2 text-right text-sm font-bold text-gray-800">
          この日の合計：{formatYen(total)}
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={onAddSpot} className={OUTLINE_BUTTON}>
          ＋ 予定を追加
        </button>
        {canSort && (
          <button
            type="button"
            onClick={onSortSpots}
            className={OUTLINE_BUTTON}
          >
            時刻順に並べ替え
          </button>
        )}
      </div>
    </section>
  );
}
