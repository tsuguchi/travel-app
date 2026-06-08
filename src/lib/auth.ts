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
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(!isFirebaseConfigured);

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
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch {
      // ポップアップを閉じた等は無視する
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
    signIn,
    signOut: doSignOut,
  };
}
