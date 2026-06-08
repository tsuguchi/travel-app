# Firebase セットアップ手順

このアプリはしおりを **Firebase（Firestore）** に保存し、**Google サインイン**で
ユーザーごとにデータを分離します。利用前に以下を一度だけ設定してください。

## 1. Firebase プロジェクトとウェブアプリの作成

1. [Firebase コンソール](https://console.firebase.google.com/) で「プロジェクトを追加」。
2. 作成後、「プロジェクトの概要」横の歯車 →「プロジェクトの設定」→「マイアプリ」で
   **ウェブアプリ（</>）** を登録。
3. 表示される `firebaseConfig` の値を控える（`apiKey` など）。

## 2. Google 認証を有効化

1. 左メニュー「構築」→「Authentication」→「始める」。
2. 「Sign-in method」→ **Google** を有効化して保存。
3. ローカル開発では `localhost` は既定で承認済み。デプロイ先のドメインは
   Authentication →「設定」→「承認済みドメイン」に追加する。

## 3. Firestore データベースの作成

1. 左メニュー「構築」→「Firestore Database」→「データベースを作成」。
2. ロケーションを選択（例：`asia-northeast1`）。
3. **本番モード**で作成し、ルールは次の手順で適用する。

## 4. セキュリティルールの適用

リポジトリの [`firestore.rules`](./firestore.rules) の内容を、Firestore →「ルール」に
貼り付けて「公開」。各ユーザーは自分の `users/{uid}/trips` だけを読み書きできる。

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}/trips/{tripId} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    match /{document=**} { allow read, write: if false; }
  }
}
```

## 5. 環境変数の設定

`.env.local.example` を `.env.local` にコピーし、手順1の構成値を設定する。

```bash
cp .env.local.example .env.local
# 各 NEXT_PUBLIC_FIREBASE_* に firebaseConfig の値を記入
```

| 変数 | firebaseConfig のキー |
| --- | --- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `apiKey` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `authDomain` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `projectId` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `storageBucket` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `appId` |

`NEXT_PUBLIC_*` はクライアントに露出するが、ウェブ構成は公開前提であり、
保護は上記セキュリティルールで担保する。

## 6. 起動・確認

```bash
npm run dev
```

`http://localhost:3000` を開き「Google でサインイン」。初回サインイン時、ブラウザに
残っていた旧 localStorage のしおりがあれば Firestore へ自動移行される（端末ごと一度だけ）。

## データ構造

```
users/{uid}/trips/{tripId}  ← 1 ドキュメント = 1 しおり（Trip）
```

環境変数が未設定の場合、アプリは「Firebase の設定が必要です」と表示し、
ビルドやテストは問題なく通る（CI も同様）。
