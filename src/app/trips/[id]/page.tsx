"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import type { ItineraryDay, Spot } from "@/types";
import { useTrips } from "@/lib/useTrips";
import { createId } from "@/lib/id";
import { formatDuration } from "@/lib/date";
import { FIELD_INPUT, PRIMARY_BUTTON } from "@/lib/ui";
import DayCard from "@/components/DayCard";

const fieldInputClass = `mt-1 w-full ${FIELD_INPUT}`;

export default function TripDetailPage() {
  const params = useParams<{ id: string }>();
  const { trips, loaded, updateTrip } = useTrips();
  const trip = trips.find((t) => t.id === params.id);

  if (!loaded) {
    return <p className="text-gray-600">読み込み中…</p>;
  }

  if (!trip) {
    return (
      <div>
        <p className="text-lg font-bold">しおりが見つかりませんでした。</p>
        <Link href="/" className="mt-3 inline-block text-[#0017c1] underline">
          ← 一覧へ戻る
        </Link>
      </div>
    );
  }

  // 以降は trip が確定しているので、ローカルに束縛して扱う。
  const t = trip;

  // --- 旅程（days）を不変更新するヘルパー群 ---
  function setDays(days: ItineraryDay[]) {
    updateTrip(t.id, { days });
  }

  /** 指定した日を変換関数で置き換える。 */
  function updateDay(dayId: string, fn: (day: ItineraryDay) => ItineraryDay) {
    setDays(t.days.map((d) => (d.id === dayId ? fn(d) : d)));
  }

  /** 指定した日のスポット配列を変換関数で置き換える。 */
  function updateSpots(dayId: string, fn: (spots: Spot[]) => Spot[]) {
    updateDay(dayId, (d) => ({ ...d, spots: fn(d.spots) }));
  }

  function addDay() {
    setDays([...t.days, { id: createId(), date: "", spots: [] }]);
  }

  function changeDayDate(dayId: string, date: string) {
    updateDay(dayId, (d) => ({ ...d, date }));
  }

  function deleteDay(dayId: string) {
    setDays(t.days.filter((d) => d.id !== dayId));
  }

  function addSpot(dayId: string) {
    const spot: Spot = {
      id: createId(),
      time: "",
      title: "",
      category: "観光",
      memo: "",
    };
    updateSpots(dayId, (spots) => [...spots, spot]);
  }

  function changeSpot(dayId: string, spotId: string, patch: Partial<Spot>) {
    updateSpots(dayId, (spots) =>
      spots.map((s) => (s.id === spotId ? { ...s, ...patch } : s)),
    );
  }

  function deleteSpot(dayId: string, spotId: string) {
    updateSpots(dayId, (spots) => spots.filter((s) => s.id !== spotId));
  }

  const duration = formatDuration(t.startDate, t.endDate);

  return (
    <div>
      <Link href="/" className="text-sm text-[#0017c1] underline">
        ← 一覧へ戻る
      </Link>

      <h1 className="mt-3 text-2xl font-bold">
        {trip.title || "（無題のしおり）"}
      </h1>

      {/* 基本情報 */}
      <section className="mt-3 rounded-lg border border-gray-200 bg-white p-4">
        <label className="block font-bold" htmlFor="trip-title">
          タイトル
        </label>
        <input
          id="trip-title"
          type="text"
          value={trip.title}
          onChange={(e) => updateTrip(trip.id, { title: e.target.value })}
          className={`${fieldInputClass} text-lg`}
        />

        <label className="mt-4 block font-bold" htmlFor="trip-destination">
          行き先
        </label>
        <input
          id="trip-destination"
          type="text"
          value={trip.destination}
          placeholder="例：京都"
          onChange={(e) => updateTrip(trip.id, { destination: e.target.value })}
          className={fieldInputClass}
        />

        <div className="mt-4 flex flex-wrap gap-4">
          <div className="flex-1">
            <label className="block font-bold" htmlFor="trip-start">
              出発日
            </label>
            <input
              id="trip-start"
              type="date"
              value={trip.startDate}
              onChange={(e) =>
                updateTrip(trip.id, { startDate: e.target.value })
              }
              className={fieldInputClass}
            />
          </div>
          <div className="flex-1">
            <label className="block font-bold" htmlFor="trip-end">
              帰着日
            </label>
            <input
              id="trip-end"
              type="date"
              value={trip.endDate}
              onChange={(e) => updateTrip(trip.id, { endDate: e.target.value })}
              className={fieldInputClass}
            />
          </div>
        </div>
        {duration && (
          <p className="mt-2 text-sm text-gray-700">期間：{duration}</p>
        )}
      </section>

      {/* 旅程 */}
      <h2 className="mt-6 text-xl font-bold">旅程</h2>
      <div className="mt-3 space-y-4">
        {trip.days.map((day, i) => (
          <DayCard
            key={day.id}
            day={day}
            dayNumber={i + 1}
            onChangeDate={(date) => changeDayDate(day.id, date)}
            onDeleteDay={() => deleteDay(day.id)}
            onAddSpot={() => addSpot(day.id)}
            onChangeSpot={(spotId, patch) => changeSpot(day.id, spotId, patch)}
            onDeleteSpot={(spotId) => deleteSpot(day.id, spotId)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={addDay}
        className={`mt-4 ${PRIMARY_BUTTON}`}
      >
        ＋ 日を追加
      </button>
    </div>
  );
}
