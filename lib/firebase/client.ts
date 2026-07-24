"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, inMemoryPersistence, setPersistence } from "firebase/auth";

function requiredPublic(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required public configuration: ${name}`);
  }
  return value;
}

export function getClientAuth() {
  const app =
    getApps().length > 0
      ? getApp()
      : initializeApp({
          apiKey: requiredPublic(
            "NEXT_PUBLIC_FIREBASE_API_KEY",
            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
          ),
          authDomain: requiredPublic(
            "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
            process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          ),
          projectId: requiredPublic(
            "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
            process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          ),
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
          messagingSenderId:
            process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
          appId: requiredPublic(
            "NEXT_PUBLIC_FIREBASE_APP_ID",
            process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
          ),
        });

  const auth = getAuth(app);
  void setPersistence(auth, inMemoryPersistence);
  return auth;
}
