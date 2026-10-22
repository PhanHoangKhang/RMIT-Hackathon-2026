"use client";

import { useState } from "react";
import { decryptForRecord } from "@/lib/tide/relationship";
import { IDENTITY_RECORD_ID, summarizeTideError, type TideErrorSummary } from "@/lib/client";
import { btn, mono } from "@/components/ui";

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
  const [error, setError] = useState<TideErrorSummary | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [busy, setBusy] = useState(false);

  const attempt = async () => {
    setBusy(true);
    setError(null);
    setShowDetails(false);
    try {
      if (!readPolicy) throw new Error("No signed read policy yet (a panel member signs it on the Panel page).");
      const plaintext = await decryptForRecord(ciphertext, IDENTITY_RECORD_ID, readPolicy);
      setIdentity(JSON.parse(plaintext));
    } catch (e) {
      setError(summarizeTideError(e));
    } finally {
      setBusy(false);
    }
  };

  if (identity) {
    return (
      <div className="flex items-center gap-4 rounded-xl border border-[#c8e4d8] bg-[#eaf5ef] p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={identity.photo} alt="" width={56} height={56} className="rounded-xl" />
        <div className="min-w-0">
          <p className="font-semibold text-[#193b35]">{identity.name}</p>
          <p className="truncate text-sm text-[#60766c]">{identity.email}</p>
          <p className="text-sm text-[#60766c]">{identity.university}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eaf5ef] px-2.5 py-1.5 text-[11px] font-semibold text-[#267256]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5" aria-hidden="true">
            <rect x="5" y="10" width="14" height="11" rx="2" />
            <path strokeLinecap="round" d="M8 10V7a4 4 0 0 1 8 0v3" />
          </svg>
          Identity encrypted
        </span>
        <span className={mono}>{ciphertext.slice(0, 40)}…</span>
        <button type="button" onClick={attempt} disabled={busy} className={btn.ghost}>
          {busy ? "Asking the Tide network…" : "Reveal identity"}
        </button>
      </div>
      {error && (
        <div role="alert" className="mt-3 rounded-xl border border-[#f1cfc4] bg-[#fdf1ed] p-4 text-sm text-[#9a3f27]">
          <p className="font-semibold">{error.reason ? `${error.headline}:` : `${error.headline}.`}</p>
          {error.reason && <p className="mt-1">{error.reason}.</p>}
          <button
            type="button"
            onClick={() => setShowDetails((v) => !v)}
            aria-expanded={showDetails}
            className="mt-2 text-xs font-medium underline underline-offset-2 hover:no-underline"
          >
            {showDetails ? "Hide details" : "Show details"}
          </button>
          {showDetails && <p className={`mt-2 max-h-64 overflow-auto break-all ${mono}`}>{error.raw}</p>}
        </div>
      )}
    </div>
  );
}
