"use client";

import { Eye, EyeOff, LoaderCircle, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";

import { getClientAuth } from "@/lib/firebase/client";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const csrfResponse = await fetch("/api/auth/session", {
        method: "GET",
        cache: "no-store",
      });
      if (!csrfResponse.ok) {
        throw new Error("Unable to begin a secure session.");
      }
      const { csrfToken } = (await csrfResponse.json()) as {
        csrfToken: string;
      };

      const auth = getClientAuth();
      const credential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );
      const idToken = await credential.user.getIdToken();
      const sessionResponse = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ idToken, csrfToken }),
      });
      await firebaseSignOut(auth);

      if (!sessionResponse.ok) {
        const body = (await sessionResponse.json()) as { error?: string };
        throw new Error(body.error ?? "Unable to sign in.");
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setError(
        "Unable to sign in. Check the administrator email and password.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="login-form" onSubmit={login}>
      <div className="login-icon">
        <LockKeyhole aria-hidden="true" />
      </div>
      <span className="eyebrow">Authorized access</span>
      <h1>Administrator login</h1>
      <p>Sign in to review and manage incoming project enquiries.</p>

      <div className="field">
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="admin@example.com"
        />
      </div>

      <div className="field">
        <label htmlFor="login-password">Password</label>
        <div className="password-control">
          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff aria-hidden="true" size={18} />
            ) : (
              <Eye aria-hidden="true" size={18} />
            )}
          </button>
        </div>
      </div>

      {error ? (
        <div className="dashboard-alert" role="alert">
          {error}
        </div>
      ) : null}

      <button className="primary-button" type="submit" disabled={submitting}>
        {submitting ? (
          <>
            <LoaderCircle className="spin" aria-hidden="true" size={18} />
            Signing in
          </>
        ) : (
          "Sign in securely"
        )}
      </button>
    </form>
  );
}
