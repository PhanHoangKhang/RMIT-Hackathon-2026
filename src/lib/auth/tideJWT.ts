import { jwtVerify, createLocalJWKSet } from "jose";
import type { JWTPayload } from "jose";
import { loadTideConfig } from "./tidecloakConfig";

// Lazy initialization — do NOT load config at module level.
// Next.js 16 evaluates module-level code during `next build` for static
// page generation. If tidecloak.json doesn't exist yet (placeholder or
// pre-bootstrap), eager loading throws at build time.
let _jwks: ReturnType<typeof createLocalJWKSet> | null = null;
let _config: ReturnType<typeof loadTideConfig> | null = null;

function getConfig() {
  if (!_config) {
    _config = loadTideConfig();
    if (!_config.jwk) {
      throw new Error(
        "Adapter JSON missing jwk field. Re-export with IGA enabled."
      );
    }
    _jwks = createLocalJWKSet(_config.jwk);
  }
  return { config: _config, JWKS: _jwks! };
}

export async function verifyTideJWT(token: string): Promise<JWTPayload> {
  const { config, JWKS } = getConfig();
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: `${config["auth-server-url"].replace(/\/+$/, "")}/realms/${config.realm}`,
  });

  if (payload.azp !== config.resource) {
    throw new Error("Token azp does not match client");
  }

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) {
    throw new Error("Token expired");
  }
  if (payload.iat && payload.iat > now + 60) {
    throw new Error("Token issued in future");
  }

  return payload;
}

export function hasRole(payload: JWTPayload, role: string): boolean {
  // 1. Check Realm Roles
  const realmAccess = payload.realm_access;

  const realmRoles =
    realmAccess &&
    typeof realmAccess === "object" &&
    "roles" in realmAccess &&
    Array.isArray(realmAccess.roles)
      ? realmAccess.roles
      : [];

  if (realmRoles.includes(role)) {
    return true;
  }

  // 2. Check Client Roles for the configured application
  const { config } = getConfig();
  const resourceAccess = payload.resource_access;

  if (!resourceAccess || typeof resourceAccess !== "object") {
    return false;
  }

  // Cast to allow access using a dynamic client ID
  const access = resourceAccess as Record<string, unknown>;
  const clientAccess = access[config.resource];

  if (!clientAccess || typeof clientAccess !== "object") {
    return false;
  }

  const clientRoles =
    "roles" in clientAccess && Array.isArray(clientAccess.roles)
      ? clientAccess.roles
      : [];

  return clientRoles.includes(role);
}

export function extractToken(authHeader: string | null): string {
  if (!authHeader) throw new Error("Missing Authorization header");
  if (authHeader.startsWith("Bearer ")) return authHeader.substring(7);
  if (authHeader.startsWith("DPoP ")) return authHeader.substring(5);
  throw new Error("Invalid Authorization header format");
}
