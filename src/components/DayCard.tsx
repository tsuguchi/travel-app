"use client";

import type { ItineraryDay, Spot } from "@/types";
import { formatDateJa } from "@/lib/date";
import { FIELD_INPUT, OUTLINE_BUTTON } from "@/lib/ui";
import SpotRow from "@/components/SpotRow";

type Props = {
  day: ItineraryDay;
  dayNumber: number;
  onChangeDate: (date: string) => void;
  onDeleteDay: () => void;
  onAddSpot: () => void;
  onChangeSpot: (spotId: string, patch: Partial<Spot>) => void;
  onDeleteSpot: (spotId: string) => void;
};

export default function DayCard({
  day,
  dayNumber,
  onChangeDate,
  onDeleteDay,
  onAddSpot,
  onChangeSpot,
  onDeleteSpot,
}: Props) {
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

      <button
        type="button"
        onClick={onAddSpot}
        className={`mt-3 ${OUTLINE_BUTTON}`}
      >
        ＋ 予定を追加
      </button>
    </section>
  );
}
