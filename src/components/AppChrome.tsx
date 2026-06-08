"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { FIELD_INPUT, OUTLINE_BUTTON, PRIMARY_BUTTON } from "@/lib/ui";

/**
 * ヘッダーと認証ゲートをまとめるクライアント層。
 * - Firebase 未設定 → 設定手順を表示
 * - 認証解決前 → 読み込み表示
 * - 未サインイン → サインイン画面
 * - サインイン済み → children（アプリ本体）
 */
export default function AppChrome({ children }: { children: React.ReactNode }) {
  const {
    user,
    ready,
    configured,
    error,
    notice,
    signIn,
    signInEmail,
    signUpEmail,
    resetPassword,
    signOut,
  } = useAuth();

  return (
    <>
      <header className="bg-[#0017c1] text-white print:hidden">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-lg font-bold">
            <span aria-hidden="true">🧳</span>
            旅のしおり
          </Link>
          {configured && user && (
            <div className="flex items-center gap-3 text-sm">
              <span className="max-w-[40vw] truncate" title={user.email ?? ""}>
                {user.displayName ?? user.email}
              </span>
              <button
                type="button"
                onClick={signOut}
                className="rounded-md border border-white px-3 py-1.5 font-bold hover:bg-white/10"
              >
                サインアウト
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        {!configured ? (
          <SetupNotice />
        ) : !ready ? (
          <p className="text-gray-600">読み込み中…</p>
        ) : !user ? (
          <SignIn
            onSignIn={signIn}
            onSignInEmail={signInEmail}
            onSignUpEmail={signUpEmail}
            onResetPassword={resetPassword}
            error={error}
            notice={notice}
          />
        ) : (
          children
        )}
      </main>
    </>
  );
}

function SignIn({
  onSignIn,
  onSignInEmail,
  onSignUpEmail,
  onResetPassword,
  error,
  notice,
}: {
  onSignIn: () => void;
  onSignInEmail: (email: string, password: string) => void;
  onSignUpEmail: (email: string, password: string) => void;
  onResetPassword: (email: string) => void;
  error: string | null;
  notice: string | null;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="mx-auto mt-10 max-w-md rounded-lg border border-gray-200 bg-white p-8">
      <h1 className="text-center text-xl font-bold">サインインしてください</h1>
      <p className="mt-2 text-center text-gray-700">
        しおりはアカウントごとに保存され、複数の端末で同期されます。
      </p>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-md bg-red-50 p-3 text-sm font-bold text-red-700"
        >
          {error}
        </p>
      )}
      {notice && (
        <p
          role="status"
          className="mt-4 rounded-md bg-green-50 p-3 text-sm font-bold text-green-800"
        >
          {notice}
        </p>
      )}

      <button
        type="button"
        onClick={onSignIn}
        className={`${PRIMARY_BUTTON} mt-6 w-full`}
      >
        Google でサインイン
      </button>

      <div className="my-6 flex items-center gap-3 text-sm text-gray-500">
        <span className="h-px flex-1 bg-gray-300" />
        または メールアドレスで
        <span className="h-px flex-1 bg-gray-300" />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSignInEmail(email, password);
        }}
      >
        <label className="block font-bold" htmlFor="auth-email">
          メールアドレス
        </label>
        <input
          id="auth-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`mt-1 w-full ${FIELD_INPUT}`}
        />

        <label className="mt-4 block font-bold" htmlFor="auth-password">
          パスワード（6文字以上）
        </label>
        <input
          id="auth-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`mt-1 w-full ${FIELD_INPUT}`}
        />

        <div className="mt-6 flex flex-wrap gap-2">
          <button type="submit" className={PRIMARY_BUTTON}>
            ログイン
          </button>
          <button
            type="button"
            onClick={() => onSignUpEmail(email, password)}
            className={OUTLINE_BUTTON}
          >
            新規登録
          </button>
        </div>

        <button
          type="button"
          onClick={() => onResetPassword(email)}
          className="mt-4 text-sm text-[#0017c1] underline"
        >
          パスワードを忘れた場合（再設定メールを送信）
        </button>
      </form>
    </div>
  );
}

function SetupNotice() {
  return (
    <div className="mt-10 rounded-lg border border-dashed border-gray-300 bg-white p-6">
      <h1 className="text-xl font-bold">Firebase の設定が必要です</h1>
      <p className="mt-2 text-gray-700">
        このアプリはデータを Firebase（Firestore）に保存します。利用前に
        Firebase プロジェクトを作成し、構成を環境変数に設定してください。
      </p>
      <ol className="mt-4 list-decimal space-y-1 pl-6 text-gray-700">
        <li>Firebase コンソールでプロジェクトとウェブアプリを作成</li>
        <li>Authentication で「Google」と「メール/パスワード」を有効化</li>
        <li>Firestore Database を作成</li>
        <li>
          構成を <code>.env.local</code> の <code>NEXT_PUBLIC_FIREBASE_*</code>{" "}
          に設定して再起動
        </li>
      </ol>
      <p className="mt-3 text-sm text-gray-600">
        詳しい手順はリポジトリの <code>FIREBASE_SETUP.md</code> を参照してください。
      </p>
    </div>
  );
}
