import { withAuth } from "@/lib/auth/middleware";
import { hasRole } from "@/lib/auth/tideJWT";
import { updateDb } from "@/lib/store";

// POST /api/cycle/advance — move the cycle to "reveal".
//
// There is no admin override here on purpose. The only evidence accepted is a verified,
// threshold-signed token that carries BOTH selection-panel and _tide_decryptor. _tide_decryptor reaches
// selection-panel only through the ADD_COMPOSITE change request that 2 of the 3 panel realm admins
// approved in the Tide enclave. Our server cannot mint that token, and neither can any one admin.
//
// Note the stage flag is a UI convenience: flipping it in data/db.json still decrypts nothing,
// because the ORKs check the caller's roles, not this file.
export const POST = withAuth(async (_req, jwt) => {
  const who = String(jwt.preferred_username ?? jwt.sub);
  const isPanel = hasRole(jwt, "selection-panel");
  const hasDecrypt = hasRole(jwt, "_tide_decryptor");

  return updateDb((db) => {
    if (db.cycle.stage === "reveal" && db.cycle.revealedBy) return Response.json({ cycle: db.cycle });
    if (!db.cycle.scoresLockedAt) {
      return Response.json({ error: "Scores are not locked yet." }, { status: 409 });
    }
    if (!isPanel || !hasDecrypt) {
      return Response.json(
        {
          error:
            `Refused for ${who}: the stage advances only on proof of the quorum-approved grant ` +
            `(a token carrying selection-panel + _tide_decryptor). This token has ` +
            `selection-panel=${isPanel}, _tide_decryptor=${hasDecrypt}.`,
        },
        { status: 403 }
      );
    }
    db.cycle.stage = "reveal";
    db.cycle.revealedAt = new Date().toISOString();
    db.cycle.revealedBy = who;
    return Response.json({ cycle: db.cycle });
  });
});
