# デプロイ手順（Firebase Hosting）

本アプリは Next.js の**静的エクスポート**（`output: "export"` → `out/`）として書き出し、
**Firebase Hosting**（無料 Spark プランで可）で配信します。公開 URL は
`https://<プロジェクトID>.web.app`（本プロジェクトでは `https://travel-ac55b.web.app`）です。

## 前提

- `FIREBASE_SETUP.md` の設定が済んでいること（`.env.local` に `NEXT_PUBLIC_FIREBASE_*`）。
  ビルド時にこの構成値が静的ファイルへ埋め込まれます。
- Firebase にログイン（初回のみ。グローバルインストール不要、`npx` を使用）：

```bash
npx firebase-tools login
```

> グローバルに入れたい場合は `npm install -g firebase-tools` でも可。その場合 `firebase login` / `firebase deploy ...` が使えます（PATH が通っていることが前提）。

## デプロイ

```bash
npm run deploy
```

`npm run deploy` は `next build`（`out/` を生成）→ `npx firebase-tools deploy --only hosting` を実行します。
完了すると `Hosting URL: https://travel-ac55b.web.app` が表示されます。

> 手動で行う場合：`npm run build` の後に `npx firebase-tools deploy --only hosting`。

## セキュリティルールも配信する場合

```bash
firebase deploy --only hosting,firestore:rules
```

`firebase.json` の `firestore.rules` を参照して `firestore.rules` を反映します。

## 認証の承認済みドメイン

デプロイ先ドメイン（`travel-ac55b.web.app` / `travel-ac55b.firebaseapp.com`）は、
Firebase の Authentication →「設定」→「承認済みドメイン」に含まれている必要があります。
これらの既定ドメインは通常自動で登録済みです。独自ドメインを使う場合は追加してください。

## 構成メモ

- ルーティングは静的化のため、詳細ページを `/trips?id=<id>`（クエリパラメータ）にしています。
- `firebase.json` の `cleanUrls: true` と `rewrites`（`** → /index.html`）により、
  直リンク・再読み込み・未知パスでも SPA として動作します。
- ホスティングは静的配信のみ（サーバー処理なし）。データの読み書きはクライアントから
  Firestore に対して行われ、保護はセキュリティルールで担保されます。
