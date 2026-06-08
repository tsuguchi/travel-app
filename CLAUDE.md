# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

> ⚠️ このプロジェクトは Next.js 16 (App Router)。AGENTS.md のとおり、API・規約は学習データと異なる場合がある。実装前に `node_modules/next/dist/docs/` の該当ガイドを確認すること。

## 概要

旅行計画・しおり作成アプリ。データは **Firebase（Firestore）** に保存し、**Google サインイン**でユーザーごとに分離する。クライアント（ブラウザ）の Firebase Web SDK から直接 Firestore を読み書きする構成。セットアップは `FIREBASE_SETUP.md`、環境変数は `NEXT_PUBLIC_FIREBASE_*`（`.env.local`）。**環境変数が未設定なら**「設定してください」を表示し、ビルド・テスト・CI は通る（`isFirebaseConfigured` でガード）。

## コマンド

```bash
npm run dev        # 開発サーバー (http://localhost:3000)
npm run build      # 本番ビルド（output:"export" のため out/ に静的書き出し）
npm run deploy     # next build → firebase deploy --only hosting（要 firebase login）
npm run start      # ビルド成果物を起動
npm run lint       # ESLint (eslint-config-next)
npm test           # Vitest（src/**/*.test.ts を1回実行）
npm run test:watch # Vitest ウォッチモード
npx tsc --noEmit   # 型チェック（package.json には未登録だが必須）
```

テストは Vitest を使用（設定は `vitest.config.ts`、`@/` エイリアス解決済み・environment は node）。対象は純粋関数（`src/lib/date.ts`・`src/lib/spot.ts` 等）。localStorage や DOM に依存するロジックのテストには jsdom 等の追加設定が必要。変更後は最低限 `npx tsc --noEmit`・`npm run lint`・`npm test` を通すこと。

## アーキテクチャ

データフローの中心は **外部ストア（Firestore 購読）+ `useSyncExternalStore`** パターン。

```
Firestore users/{uid}/trips ⇄ src/lib/tripsStore.ts
   (onSnapshot 購読 / 楽観的更新 + デバウンス書き込み、メモリキャッシュ + subscribe/notify)
                     ↑                                   ↑ setActiveUser(uid)
              src/lib/useTrips.ts                  src/lib/auth.ts (useAuth: onAuthStateChanged)
   (useSyncExternalStore でストアを購読)        src/components/AppChrome.tsx (認証ゲート + ヘッダー)
                     ↑
        src/app/page.tsx (一覧) / src/app/trips/page.tsx（?id=） (詳細・編集)
```

理解に複数ファイルの読解が要る要点：

- **状態は `useTrips()` 経由でのみ触る。** `createTrip / updateTrip / deleteTrip / duplicateTrip / importTrips` はすべて `tripsStore` の関数で、現在の `currentUid` 配下の Firestore ドキュメント（1しおり=1ドキュメント、docId=trip.id）に書き込む。`updateTrip` は `updatedAt` を自動更新する。
- **認証とストアの連動。** `useAuth`（`AppChrome` が1か所だけで使用）が `onAuthStateChanged` で `tripsStore.setActiveUser(uid|null)` を呼び、購読対象を切り替える。サインイン時に旧 localStorage データを Firestore へ**一度だけ移行**する（`src/lib/storage.ts` の `loadLegacyTrips`/`hasMigrated`/`markMigrated`）。`AppChrome` が未設定/未サインインを出し分け、サインイン済みのときだけ `children` を描画する。
- **楽観的更新 + デバウンス。** 入力のたびに `cache` を即時更新して再描画し、Firestore 書き込みは 600ms デバウンス（編集中＝`dirty` のしおりは onSnapshot で上書きしない）。これで毎キーストロークの書き込みを避ける。`getSnapshot` の参照安定性が前提（無変更時は同一 `cache` 参照）。
- **`loaded`。** `getLoadedSnapshot` は最初の onSnapshot 受信後（または未サインイン確定後）に true。false の間はローディング表示。
- **防御的正規化。** `src/lib/normalize.ts` の `coerceTrip(s)`/`normalizeTrip/Day/Spot` が欠落フィールドを既定値で補う（Firestore 読み込み・JSON インポート共通）。consumer は `trip.days` 等が常に配列である前提でよい。

## ドメインモデル

`src/types.ts` が単一の出所。`Trip` → `ItineraryDay[]`（旅程の各日）→ `Spot[]`（各日の予定）。`Spot.category` は `SpotCategory`（観光/食事/移動/宿泊/その他）で、表示用のアイコン・配色は `src/lib/category.ts` に集約。

## UI 規約（デジタル庁デザインシステム準拠）

- 共有の Tailwind クラス・ブランド色は `src/lib/ui.ts` に集約（`PRIMARY_BUTTON` / `OUTLINE_BUTTON` / `FIELD_INPUT` / `BRAND_BLUE`）。ボタン・入力欄を作るときはここを使い、クラス文字列を再定義しない。
- フォーム入力には必ずラベルを紐付ける（視覚ラベル、または `sr-only` + `htmlFor`／`aria-label`）。placeholder をラベル代わりにしない。
- 入力欄の枠線は `gray-500`（コントラスト 3:1 以上を満たす）。テキストは 16px 以上。`globals.css` の `:focus-visible` で全要素にフォーカスリングを付与済み。
- 日本語フォントは `next/font` の Noto Sans JP を CSS 変数 `--font-noto-sans-jp` 経由で適用。
