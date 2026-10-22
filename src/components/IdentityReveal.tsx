"use client";

import { useState } from "react";
import { decryptForRecord } from "@/lib/tide/relationship";
import { IDENTITY_RECORD_ID, Notice, tideErrorText, isNetworkRefusal, ui } from "@/lib/client";

export interface Identity {
  name: string;
  email: string;
  university: string;
  photo: string; // data: URL (synthetic avatar)
}

// The SAME button for every role. Nothing here checks who you are: the browser asks the ORK network
// to decrypt under the panel read policy, and the network decides. Before the quorum-approved reveal,
// nobody holds _tide_decryptor, so every attempt is refused by the ORKs themselves.
export function IdentityReveal({ ciphertext, readPolicy }: { ciphertext: string; readPolicy: string | null }) {
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const attempt = async () => {
    setBusy(true);
    setError(null);
    try {
      if (!readPolicy) throw new Error("No signed read policy yet (a panel member signs it on the Panel page).");
      const plaintext = await decryptForRecord(ciphertext, IDENTITY_RECORD_ID, readPolicy);
      setIdentity(JSON.parse(plaintext));
    } catch (e) {
      setError(tideErrorText(e));
    } finally {
      setBusy(false);
    }
  };

  if (identity) {
    return (
      <div style={{ display: "flex", gap: "0.9rem", alignItems: "center", background: "var(--panel-2)", padding: "0.75rem", borderRadius: 10, border: "1px solid var(--ok)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={identity.photo} alt="" width={56} height={56} style={{ borderRadius: 10 }} />
        <div>
          <div style={{ fontWeight: 600 }}>{identity.name}</div>
          <div style={{ color: "var(--muted)", fontSize: "0.88rem" }}>{identity.email}</div>
          <div style={{ color: "var(--muted)", fontSize: "0.88rem" }}>{identity.university}</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", flexWrap: "wrap" }}>
        <span style={ui.mono}>identity: {ciphertext.slice(0, 48)}…</span>
        <button onClick={attempt} disabled={busy} style={ui.btnGhost}>
          {busy ? "Asking the Tide network…" : "Reveal identity"}
        </button>
      </div>
      {error && (
        <Notice kind="err">
          <b>{isNetworkRefusal(error) ? "Refused by the Tide network (every ORK said no)." : "Decryption failed."}</b>
          <div style={{ ...ui.mono, marginTop: "0.35rem" }}>{error}</div>
        </Notice>
      )}
    </div>
  );
}
