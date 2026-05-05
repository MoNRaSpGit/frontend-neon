import { describe, expect, it } from "vitest";
import { StoredAuthUser } from "../../features/auth/auth.types";
import { getDefaultAuthenticatedRoute, getFirstAccessibleModuleRoute, hasModuleAccess } from "../../features/auth/module-routing";
import { userCanAccessSaasAdmin } from "../../features/auth/tenant-capabilities";
import { FRONTEND_BUILD_INFO } from "../config/build";

function buildUser(modules: string[]): StoredAuthUser {
  return {
    id: 1,
    email: "demo@saaspro.com",
    fullName: "Demo User",
    role: "admin",
    tenantContext: {
      tenant: {
        id: 10,
        name: "Demo Tenant",
        slug: "demo-tenant",
        status: "active"
      },
      membership: {
        role: "admin",
        status: "active",
        isDefault: true
      },
      billing: {
        status: "active",
        paidUntil: null,
        graceUntil: null,
        blockedReason: null
      },
      modules
    }
  };
}

describe("frontend neon smoke", () => {
  it("routes single-module users directly into neon", () => {
    expect(getDefaultAuthenticatedRoute(buildUser(["neon"]))).toBe("/neon");
  });

  it("keeps dashboard as fallback for unknown contexts", () => {
    expect(getFirstAccessibleModuleRoute(buildUser(["unknown-module"]))).toBe("/dashboard");
  });

  it("checks module access against tenant context", () => {
    const user = buildUser(["neon"]);
    expect(hasModuleAccess(user, "neon")).toBe(true);
    expect(hasModuleAccess(user, "camiones")).toBe(false);
  });

  it("derives saas admin access from global role", () => {
    const adminUser = buildUser(["neon"]);
    expect(userCanAccessSaasAdmin(adminUser)).toBe(true);
    expect(userCanAccessSaasAdmin({ ...adminUser, role: "member" })).toBe(false);
  });

  it("exposes frontend build information", () => {
    expect(typeof FRONTEND_BUILD_INFO.version).toBe("string");
    expect(FRONTEND_BUILD_INFO.version.length).toBeGreaterThan(0);
    expect(typeof FRONTEND_BUILD_INFO.releaseSha).toBe("string");
    expect(FRONTEND_BUILD_INFO.environment.length).toBeGreaterThan(0);
  });
});
