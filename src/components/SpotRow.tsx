"use client";

import type { Spot, SpotCategory } from "@/types";
import { SPOT_CATEGORIES } from "@/types";
import { CATEGORY_STYLE } from "@/lib/category";
import { FIELD_INPUT } from "@/lib/ui";

type Props = {
  spot: Spot;
  index: number;
  onChange: (patch: Partial<Spot>) => void;
  onDelete: () => void;
};

const inputClass = FIELD_INPUT;

export default function SpotRow({ spot, index, onChange, onDelete }: Props) {
  const label = `${index + 1}件目の予定`;
  return (
    <li className="rounded-md border border-gray-200 bg-white p-3">
      <div className="flex flex-wrap items-center gap-2">
        <label className="sr-only" htmlFor={`time-${spot.id}`}>
          {label}の時刻
        </label>
        <input
          id={`time-${spot.id}`}
          type="time"
          value={spot.time}
          onChange={(e) => onChange({ time: e.target.value })}
          className={`${inputClass} w-28`}
        />

        <label className="sr-only" htmlFor={`category-${spot.id}`}>
          {label}の種別
        </label>
        <select
          id={`category-${spot.id}`}
          value={spot.category}
          onChange={(e) =>
            onChange({ category: e.target.value as SpotCategory })
          }
          className={inputClass}
        >
          {SPOT_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_STYLE[c].icon} {c}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={onDelete}
          className="ml-auto rounded-md px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-50"
          aria-label={`${label}を削除`}
        >
          削除
        </button>
      </div>

      <label className="sr-only" htmlFor={`title-${spot.id}`}>
        {label}の内容
      </label>
      <input
        id={`title-${spot.id}`}
        type="text"
        value={spot.title}
        placeholder="行き先・予定（例：清水寺）"
        onChange={(e) => onChange({ title: e.target.value })}
        className={`${inputClass} mt-2 w-full`}
      />

      <label className="sr-only" htmlFor={`memo-${spot.id}`}>
        {label}のメモ
      </label>
      <input
        id={`memo-${spot.id}`}
        type="text"
        value={spot.memo}
        placeholder="メモ（任意：予約番号・持ち物など）"
        onChange={(e) => onChange({ memo: e.target.value })}
        className={`${inputClass} mt-2 w-full`}
      />

      <div className="mt-2 flex items-center gap-2">
        <label className="text-sm font-bold" htmlFor={`cost-${spot.id}`}>
          費用
        </label>
        <input
          id={`cost-${spot.id}`}
          type="number"
          inputMode="numeric"
          min={0}
          step={100}
          value={spot.cost === 0 ? "" : spot.cost}
          placeholder="0"
          onChange={(e) =>
            onChange({
              cost: e.target.value === "" ? 0 : Math.max(0, Number(e.target.value)),
            })
          }
          className={`${inputClass} w-32 text-right`}
        />
        <span className="text-sm text-gray-700">円</span>
      </div>
    </li>
  );
}
