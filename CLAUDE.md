# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

> ⚠️ このプロジェクトは Next.js 16 (App Router)。AGENTS.md のとおり、API・規約は学習データと異なる場合がある。実装前に `node_modules/next/dist/docs/` の該当ガイドを確認すること。

## 概要

旅行計画・しおり作成アプリ。サーバーや DB を持たず、データは**ブラウザの localStorage のみ**に保存する完全クライアントサイドの SPA。

## コマンド

```bash
npm run dev      # 開発サーバー (http://localhost:3000)
npm run build    # 本番ビルド
npm run start    # ビルド成果物を起動
npm run lint     # ESLint (eslint-config-next)
npx tsc --noEmit # 型チェック（package.json には未登録だが必須）
```

テストフレームワークは未導入。変更後は最低限 `npx tsc --noEmit` と `npm run lint` を通すこと。

## アーキテクチャ

データフローの中心は **外部ストア + `useSyncExternalStore`** パターン。複数ページ・複数タブ間で「全しおり」を一貫して同期するための設計。

```
localStorage ⇄ src/lib/storage.ts (読み書き＋正規化)
                     ↑
              src/lib/tripsStore.ts (メモリキャッシュ + subscribe/notify、storage イベントでタブ間同期)
                     ↑
              src/lib/useTrips.ts (useSyncExternalStore でストアを購読する唯一のフック)
                     ↑
        src/app/page.tsx (一覧) / src/app/trips/[id]/page.tsx (詳細・編集)
```

理解に複数ファイルの読解が要る要点：

- **状態は `useTrips()` 経由でのみ触る。** `useState` でしおりを持たない。`createTrip / updateTrip / deleteTrip` はすべて `tripsStore.updateStore()` を呼び、保存と購読者通知が一括で走る。`updateTrip` は `updatedAt` を自動更新する。
- **SSR/ハイドレーション対策。** `tripsStore.getServerSnapshot()` は安定した空配列を返し、クライアントでは `getSnapshot()` が localStorage 由来のキャッシュを返す。`useTrips` の `loaded` は「サーバー=false / クライアント=true」を返す2つ目の `useSyncExternalStore` で、初期描画のチラつきを防ぐ。`loaded` が false の間は一覧/詳細ともローディング表示にすること。
- **`getSnapshot` の参照安定性が前提。** `tripsStore` はキャッシュ(`cache`)を `updateStore` 時にのみ再代入するため、無変更時は同一参照を返す。ここを壊すと `useSyncExternalStore` が無限再描画する。
- **読み込み時の防御的正規化。** `storage.ts` の `normalizeTrip/Day/Spot` が欠落フィールドを既定値で補う。consumer は `trip.days` 等が常に配列である前提でよい（旧スキーマ・手編集データでもクラッシュしない）。スキーマを変えるときは `STORAGE_KEY`（現 `travel-app:trips:v1`）のバージョンを上げるか正規化を更新する。

## ドメインモデル

`src/types.ts` が単一の出所。`Trip` → `ItineraryDay[]`（旅程の各日）→ `Spot[]`（各日の予定）。`Spot.category` は `SpotCategory`（観光/食事/移動/宿泊/その他）で、表示用のアイコン・配色は `src/lib/category.ts` に集約。

## UI 規約（デジタル庁デザインシステム準拠）

- 共有の Tailwind クラス・ブランド色は `src/lib/ui.ts` に集約（`PRIMARY_BUTTON` / `OUTLINE_BUTTON` / `FIELD_INPUT` / `BRAND_BLUE`）。ボタン・入力欄を作るときはここを使い、クラス文字列を再定義しない。
- フォーム入力には必ずラベルを紐付ける（視覚ラベル、または `sr-only` + `htmlFor`／`aria-label`）。placeholder をラベル代わりにしない。
- 入力欄の枠線は `gray-500`（コントラスト 3:1 以上を満たす）。テキストは 16px 以上。`globals.css` の `:focus-visible` で全要素にフォーカスリングを付与済み。
- 日本語フォントは `next/font` の Noto Sans JP を CSS 変数 `--font-noto-sans-jp` 経由で適用。
