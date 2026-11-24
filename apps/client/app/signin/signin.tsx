"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function SignIn() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const response = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: mode, email, password }) });
      const result = await response.json() as { error?: string; confirmationRequired?: boolean; message?: string };
      if (!response.ok) throw new Error(result.error || "Could not authenticate.");
      if (result.confirmationRequired) { setError(result.message || "Check your inbox to confirm your email."); setMode("signin"); return; }
      const next = new URLSearchParams(window.location.search).get("next");
      window.location.assign(next?.startsWith("/") && !next.startsWith("//") ? next : "/");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Authentication failed.");
    } finally {
      setBusy(false);
    }
  }

  return <main className="auth-page"><Link className="brand" href="/"><span className="brand-icon">U</span>urbaniz<span className="brand-period">.</span></Link><section className="auth-card"><p className="kicker">SECURE ACCOUNT</p><h1>{mode === "signin" ? "Welcome back." : "Create your account."}</h1><p className="auth-subtitle">{mode === "signin" ? "Sign in to reserve verified parking." : "Sign up to start reserving parking."}</p><form onSubmit={submit}><label htmlFor="email">Email</label><input id="email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} /><label htmlFor="password">Password</label><input id="password" type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} required minLength={8} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} />{error && <p className="auth-error" role="alert">{error}</p>}<button disabled={busy}>{busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}</button></form><button className="auth-switch" onClick={() => { setError(""); setMode(mode === "signin" ? "signup" : "signin"); }}>{mode === "signin" ? "New to Urbaniz? Create an account" : "Already have an account? Sign in"}</button><Link className="back-home" href="/">← Back to parking</Link></section><p className="auth-note">Account authentication is provided by the configured Urbaniz backend.</p></main>;
}
