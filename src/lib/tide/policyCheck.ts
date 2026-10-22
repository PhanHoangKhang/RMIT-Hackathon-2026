import { Models } from "@tideorg/js";
import { IDENTITY_RECORD_ID } from "@/lib/store";

// Server-side check before storing a signed policy (AP-RA08): it must parse, be signed, use the
// built-in contract, and say exactly what this app expects for its purpose. Anything else is refused,
// so a caller cannot overwrite a good policy with junk or with a wider grant.
export const EXPECTED = {
  // Write-only drop box: applicants encrypt identity, never decrypt it.
  write: { subjectType: "Role", subjectId: "applicant", roles: ["_tide_encryptor"] },
  // Panel read: works only once selection-panel carries _tide_decryptor (the quorum-approved reveal).
  read: { subjectType: "Role", subjectId: "selection-panel", roles: ["_tide_decryptor"] },
} as const;

export interface PolicySummary {
  contractId: string;
  subjectType: string;
  subjectId: string;
  recordId: string;
  roles: string;
  signed: boolean;
}

export function describePolicy(policyB64: string): PolicySummary {
  const bytes = Uint8Array.from(Buffer.from(policyB64, "base64"));
  const p = Models.Policy.from(bytes) as unknown as {
    contractId: string;
    signature?: Uint8Array;
    params: { entries: Map<string, unknown> };
  };
  const param = (k: string) => String(p.params.entries.get(k) ?? "");
  return {
    contractId: p.contractId,
    subjectType: param("subjectType"),
    subjectId: param("subjectId"),
    recordId: param("assignmentId"),
    roles: param("roles"),
    signed: !!p.signature && p.signature.length > 0,
  };
}

/** Returns null when the policy is acceptable for `purpose`, else the reason it is refused. */
export function checkPolicy(purpose: "write" | "read", summary: PolicySummary): string | null {
  const want = EXPECTED[purpose];
  if (summary.contractId !== "RelationshipAttestation:1") return `contract is ${summary.contractId}`;
  if (!summary.signed) return "policy is not signed";
  if (summary.recordId !== IDENTITY_RECORD_ID) return `assignmentId is ${summary.recordId}`;
  if (summary.subjectType.toLowerCase() !== want.subjectType.toLowerCase() || summary.subjectId !== want.subjectId)
    return `subject is ${summary.subjectType}:${summary.subjectId}`;
  let roles: unknown;
  try {
    roles = JSON.parse(summary.roles);
  } catch {
    return "roles param is not JSON";
  }
  if (JSON.stringify(roles) !== JSON.stringify(want.roles)) return `roles are ${summary.roles}`;
  return null;
}
