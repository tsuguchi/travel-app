"use client";

import { useCallback, useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
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
      return "Google サインインが有効化されていません。Firebase コンソールの Authentication →「Sign-in method」で Google を有効にしてください。";
    case "auth/unauthorized-domain":
      return "このドメインが承認されていません。Authentication →「設定」→「承認済みドメイン」に追加してください。";
    case "auth/popup-blocked":
      return "ブラウザにポップアップをブロックされました。ポップアップを許可して再度お試しください。";
    case "auth/configuration-not-found":
      return "認証の構成が見つかりません。Authentication を有効化し、Google プロバイダを設定してください。";
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
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (e) {
      const code =
        typeof e === "object" && e !== null && "code" in e
          ? String((e as { code: unknown }).code)
          : "";
      // ユーザーが自分でポップアップを閉じた場合はエラー表示しない
      if (
        code === "auth/popup-closed-by-user" ||
        code === "auth/cancelled-popup-request"
      ) {
        return;
      }
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
    signOut: doSignOut,
  };
}
