"use client";

import { useTideCloak } from "@tidecloak/nextjs";
import { useCallback, useEffect, useState } from "react";

export const IDENTITY_RECORD_ID = "identity-cycle-2026"; // must match src/lib/store.ts

export interface Me {
  sub: string;
  username: string | null;
  roles: string[];
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
    criteria: { id: string; label: string; max: number }[];
  };
  counts: { applications: number; reviewers: number; scores: number };
  allScoresSubmitted: boolean;
  policies: { write: boolean; read: boolean };
}

export interface ApplicationView {
  id: string;
  label: string;
  workSamples: { title: string; description: string }[];
  identityCiphertext: string;
  createdAt: string;
}

/**
 * App API + TideCloak admin API, both through secureFetch so every call carries the DPoP proof
 * the server (and TideCloak) require. A plain `fetch` with `Bearer` is rejected by withAuth.
 */
export function useApi() {
  const tc = useTideCloak();

  const api = useCallback(
    async <T = any,>(path: string, init: RequestInit = {}): Promise<T> => {
      const res = await tc.secureFetch(path, {
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

const ROLE_LINKS: [string, string, string][] = [
  ["applicant", "/apply", "Apply"],
  ["reviewer", "/review", "Review"],
  ["admin", "/admin", "Admin"],
  ["panel-member", "/panel", "Panel"],
];

export function Nav({ me }: { me: Me | null }) {
  const { logout } = useTideCloak();
  return (
    <header style={ui.header}>
      <a href="/" style={ui.brand}>
        <span style={ui.logo}>B</span>BlindReview
      </a>
      <nav style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
        {ROLE_LINKS.filter(([r]) => me?.roles.includes(r)).map(([, href, label]) => (
          <a key={href} href={href} style={ui.navLink}>{label}</a>
        ))}
        <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
          {me?.username ?? "…"}
        </span>
        <button onClick={logout} style={ui.btnGhost}>Log out</button>
      </nav>
    </header>
  );
}

export function RoleChips({ roles }: { roles: string[] }) {
  return (
    <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
      {roles.map((r) => (
        <span key={r} style={{ ...ui.chip, ...(r.startsWith("_tide") ? ui.chipTide : {}) }}>{r}</span>
      ))}
    </div>
  );
}

export function Notice({ kind, children }: { kind: "ok" | "err" | "info"; children: React.ReactNode }) {
  const color = kind === "ok" ? "var(--ok)" : kind === "err" ? "var(--err)" : "var(--accent)";
  return (
    <div style={{ borderLeft: `3px solid ${color}`, background: "var(--panel-2)", padding: "0.6rem 0.8rem", borderRadius: 6, margin: "0.75rem 0", fontSize: "0.9rem", wordBreak: "break-word" }}>
      {children}
    </div>
  );
}

export function Gate({ me, role, children }: { me: Me | null; role: string; children: React.ReactNode }) {
  if (!me) return <p style={{ color: "var(--muted)" }}>Loading…</p>;
  if (!me.roles.includes(role)) {
    return <Notice kind="err">This page is for the <b>{role}</b> role. Your token does not carry it.</Notice>;
  }
  return <>{children}</>;
}

export const ui: Record<string, React.CSSProperties> = {
  page: { maxWidth: 960, margin: "0 auto", padding: "1.5rem 1.25rem 3rem" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap", marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: "1px solid var(--line)" },
  brand: { display: "flex", alignItems: "center", gap: "0.6rem", color: "var(--text)", fontWeight: 700, textDecoration: "none", fontSize: "1.1rem" },
  logo: { display: "grid", placeItems: "center", width: 36, height: 36, borderRadius: 10, background: "var(--accent)", color: "#fff" },
  navLink: { color: "var(--text)", textDecoration: "none", padding: "0.35rem 0.75rem", border: "1px solid var(--line)", borderRadius: 8, fontSize: "0.9rem", background: "var(--panel)" },
  card: { background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 16, padding: "1.25rem 1.4rem", marginBottom: "1rem", boxShadow: "0 1px 2px rgba(25,59,53,.05)" },
  btn: { background: "var(--accent)", color: "#fff", border: "none", borderRadius: 8, padding: "0.55rem 1rem", fontSize: "0.92rem", fontWeight: 600 },
  btnDanger: { background: "var(--err)", color: "#fff", border: "none", borderRadius: 8, padding: "0.55rem 1rem", fontSize: "0.92rem", fontWeight: 600 },
  btnGhost: { background: "var(--panel)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 8, padding: "0.35rem 0.75rem", fontSize: "0.85rem" },
  input: { width: "100%", boxSizing: "border-box", padding: "0.55rem", marginBottom: "0.6rem", background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 8, color: "var(--text)", fontSize: "0.92rem" },
  label: { display: "block", fontSize: "0.8rem", color: "var(--muted)", marginBottom: "0.25rem" },
  chip: { fontSize: "0.75rem", padding: "0.15rem 0.55rem", borderRadius: 999, border: "1px solid var(--line)", color: "var(--muted)", background: "var(--panel-2)" },
  chipTide: { borderColor: "var(--accent)", color: "var(--accent)" },
  mono: { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: "0.78rem", color: "var(--muted)", wordBreak: "break-all" },
  h2: { margin: "0 0 0.75rem", fontSize: "1.1rem", fontWeight: 600 },
};
