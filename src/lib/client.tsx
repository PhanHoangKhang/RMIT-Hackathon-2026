"use client";

import { useTideCloak } from "@tidecloak/nextjs";
import { useCallback, useEffect, useState } from "react";

export const IDENTITY_RECORD_ID = "identity-cycle-2026"; // must match src/lib/store.ts

export interface Me {
  sub: string;
  username: string | null;
  roles: string[];
}

export interface Criterion {
  id: string;
  label: string;
  description: string;
  max: number;
}

export interface CycleState {
  cycle: {
    id: string;
    name: string;
    stage: "blind" | "reveal";
    scoresLockedAt: string | null;
    lockedBy: string | null;
    revealedAt: string | null;
    revealedBy: string | null;
    criteria: Criterion[];
  };
  counts: { applications: number; reviewers: number; scores: number };
  allScoresSubmitted: boolean;
  policies: { write: boolean; read: boolean };
}

export interface ApplicationView {
  id: string;
  label: string;
  category: string;
  brief: string;
  skills: string[];
  workSamples: { title: string; description: string }[];
  identityCiphertext: string;
  createdAt: string;
}

export interface ScoreRow {
  applicationId: string;
  label: string;
  reviewer: string;
  mine: boolean;
  scores: Record<string, number>;
  total: number;
  feedback: string;
  submittedAt: string;
}

/**
 * App API + TideCloak admin API, both through secureFetch so every call carries the DPoP proof
 * the server (and TideCloak) require. secureFetch needs an ABSOLUTE url: it derives the proof's
 * `htu` with a bare `new URL()` and throws "Invalid URL" on a relative one (AP-74).
 */
export function useApi() {
  const tc = useTideCloak();

  const api = useCallback(
    async <T = any,>(path: string, init: RequestInit = {}): Promise<T> => {
      const res = await tc.secureFetch(new URL(path, window.location.origin).href, {
        cache: "no-store",
        ...init,
        headers: { "Content-Type": "application/json", ...(init.headers || {}) },
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
      return body as T;
    },
    [tc]
  );

  /** Browser -> TideCloak with the user's OWN token (AP-89). Returns status + parsed body. */
  const kc = useCallback(
    async (path: string, init: RequestInit = {}) => {
      const cfg = tc.getConfig();
      const base = `${String(cfg["auth-server-url"]).replace(/\/+$/, "")}/admin/realms/${cfg.realm}`;
      const res = await tc.secureFetch(`${base}${path}`, {
        ...init,
        headers: { "Content-Type": "application/json", ...(init.headers || {}) },
      });
      const text = await res.text();
      let body: any = text;
      try {
        body = text ? JSON.parse(text) : null;
      } catch {}
      return { status: res.status, ok: res.ok, body };
    },
    [tc]
  );

  return { ...tc, api, kc };
}

export function useMe() {
  const { api, authenticated, token } = useApi();
  const [me, setMe] = useState<Me | null>(null);
  useEffect(() => {
    if (authenticated && token) api<Me>("/api/me").then(setMe).catch(() => setMe(null));
  }, [authenticated, token, api]);
  return me;
}

/**
 * A contract refusal arrives as TIDE-TIDEJS-NET-THRESHOLD_FAILURE ("Could not reach enough VVK
 * ORKs"). It is NOT an outage: every ORK answered no, and the reason is in `cause` (AP-RA18).
 */
export function tideErrorText(err: unknown): string {
  const parts: string[] = [];
  let e: any = err;
  for (let i = 0; e && i < 5; i++) {
    const msg = typeof e === "string" ? e : e.message || String(e);
    if (msg && !parts.includes(msg)) parts.push(msg);
    e = e.cause;
  }
  return parts.join(" ← ") || "Unknown error";
}

export function isNetworkRefusal(text: string): boolean {
  return /THRESHOLD_FAILURE|not found|subjectId|Tags do not|list of roles/i.test(text);
}

export const b64 = {
  from: (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0)),
  to: (b: Uint8Array) => {
    let s = "";
    for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
    return btoa(s);
  },
};
