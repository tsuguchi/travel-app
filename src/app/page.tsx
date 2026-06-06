"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTrips } from "@/lib/useTrips";
import { formatDateJa, formatDuration } from "@/lib/date";
import { PRIMARY_BUTTON } from "@/lib/ui";

export default function HomePage() {
  const router = useRouter();
  const { trips, loaded, createTrip, deleteTrip } = useTrips();

  function handleCreate() {
    const id = createTrip();
    router.push(`/trips/${id}`);
  }

  function handleDelete(id: string, title: string) {
    if (window.confirm(`「${title}」を削除します。よろしいですか？`)) {
      deleteTrip(id);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">しおり一覧</h1>
        <button
          type="button"
          onClick={handleCreate}
          className={PRIMARY_BUTTON}
        >
          ＋ 新しいしおり
        </button>
      </div>

      {!loaded ? (
        <p className="mt-8 text-gray-600">読み込み中…</p>
      ) : trips.length === 0 ? (
        <div className="mt-10 rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
          <p className="text-lg font-bold">まだしおりがありません</p>
          <p className="mt-2 text-gray-600">
            「新しいしおり」から旅行計画を作り始めましょう。
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {trips.map((trip) => {
            const duration = formatDuration(trip.startDate, trip.endDate);
            const spotCount = trip.days.reduce(
              (sum, day) => sum + day.spots.length,
              0,
            );
            return (
              <li
                key={trip.id}
                className="rounded-lg border border-gray-200 bg-white shadow-sm"
              >
                <div className="flex items-start justify-between gap-3 p-4">
                  <Link
                    href={`/trips/${trip.id}`}
                    className="min-w-0 flex-1 hover:underline"
                  >
                    <span className="block truncate text-lg font-bold text-[#0017c1]">
                      {trip.title}
                    </span>
                    <span className="mt-1 block text-sm text-gray-700">
                      {trip.destination || "行き先未定"}
                      {duration && ` ・ ${duration}`}
                    </span>
                    <span className="mt-1 block text-sm text-gray-600">
                      {trip.startDate
                        ? formatDateJa(trip.startDate)
                        : "日程未定"}
                      {` ・ 予定 ${spotCount}件`}
                    </span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(trip.id, trip.title)}
                    className="shrink-0 rounded-md px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-50"
                    aria-label={`「${trip.title}」を削除`}
                  >
                    削除
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
