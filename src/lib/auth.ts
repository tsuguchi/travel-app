"use client";

import { useCallback, useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getRedirectResult,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithRedirect,
  signOut,
  type User,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/lib/firebase";
import { bulkPut, setActiveUser } from "@/lib/tripsStore";
import { hasMigrated, loadLegacyTrips, markMigrated } from "@/lib/storage";

/** サインイン時に一度だけ、旧 localStorage データを Firestore へ移す。 */
async function migrateLegacyOnce(uid: string): Promise<void> {
  if (hasMigrated(uid)) return;
  const legacy = loadLegacyTrips();
  if (legacy.length > 0) {
    await bulkPut(uid, legacy);
  }
  markMigrated(uid);
}

/**
 * Firebase 認証の状態を扱うフック。
 * configured=false（未設定）の場合は ready=true / user=null を返し、
 * 呼び出し側で設定手順を表示する。
 */
/** Firebase の認証エラーを日本語の手がかり付きメッセージにする。 */
function describeAuthError(err: unknown): string {
  const code =
    typeof err === "object" && err !== null && "code" in err
      ? String((err as { code: unknown }).code)
      : "";
  switch (code) {
    case "auth/operation-not-allowed":
      return "この認証方法が有効化されていません。Firebase コンソールの Authentication →「Sign-in method」で対象のプロバイダ（Google または メール/パスワード）を有効にしてください。";
    case "auth/unauthorized-domain":
      return "このドメインが承認されていません。Authentication →「設定」→「承認済みドメイン」に追加してください。";
    case "auth/popup-blocked":
      return "ブラウザにポップアップをブロックされました。ポップアップを許可して再度お試しください。";
    case "auth/configuration-not-found":
      return "認証の構成が見つかりません。Authentication を有効化し、プロバイダを設定してください。";
    case "auth/invalid-email":
      return "メールアドレスの形式が正しくありません。";
    case "auth/missing-password":
      return "パスワードを入力してください。";
    case "auth/weak-password":
      return "パスワードは6文字以上にしてください。";
    case "auth/email-already-in-use":
      return "このメールアドレスは既に登録済みです。「ログイン」をお試しください。";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "メールアドレスまたはパスワードが正しくありません。";
    default:
      return `サインインに失敗しました${code ? `（${code}）` : ""}。`;
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(!isFirebaseConfigured);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 未設定（auth=null）のときは ready の初期値が既に true なので何もしない。
    if (!auth) return;
    // リダイレクト方式の戻り。失敗時はここでエラーを拾って表示する。
    getRedirectResult(auth).catch((e) => setError(describeAuthError(e)));
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setActiveUser(u?.uid ?? null);
      if (u) {
        try {
          await migrateLegacyOnce(u.uid);
        } catch {
          // 移行に失敗してもアプリ自体は使えるようにする
        }
      }
      setReady(true);
    });
    return unsub;
  }, []);

  const signIn = useCallback(async () => {
    if (!auth) return;
    setError(null);
    try {
      // リダイレクト方式：タブ全体で Google へ遷移する。パスキー（WebAuthn）が
      // トップレベル文脈で動くため、ポップアップ/COOP 由来の失敗を避けられる。
      await signInWithRedirect(auth, new GoogleAuthProvider());
    } catch (e) {
      setError(describeAuthError(e));
    }
  }, []);

  const signInEmail = useCallback(async (email: string, password: string) => {
    if (!auth) return;
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      setError(describeAuthError(e));
    }
  }, []);

  const signUpEmail = useCallback(async (email: string, password: string) => {
    if (!auth) return;
    setError(null);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (e) {
      setError(describeAuthError(e));
    }
  }, []);

  const doSignOut = useCallback(async () => {
    if (!auth) return;
    await signOut(auth);
  }, []);

  return {
    user,
    ready,
    configured: isFirebaseConfigured,
    error,
    signIn,
    signInEmail,
    signUpEmail,
    signOut: doSignOut,
  };
}
