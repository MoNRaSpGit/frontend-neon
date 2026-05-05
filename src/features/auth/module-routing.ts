import { StoredAuthUser } from "./auth.types";

const KNOWN_MODULE_ROUTES: Record<string, string> = {
  neon: "/neon"
};

export function getEnabledModules(user: StoredAuthUser | null) {
  return user?.tenantContext?.modules || [];
}

export function getDefaultAuthenticatedRoute(user: StoredAuthUser | null) {
  const modules = getEnabledModules(user);

  if (modules.length === 1) {
    const route = KNOWN_MODULE_ROUTES[modules[0]];
    if (route) {
      return route;
    }
  }

  return "/dashboard";
}

export function hasModuleAccess(user: StoredAuthUser | null, moduleKey: string) {
  return getEnabledModules(user).includes(moduleKey);
}

export function getFirstAccessibleModuleRoute(user: StoredAuthUser | null) {
  for (const moduleKey of getEnabledModules(user)) {
    const route = KNOWN_MODULE_ROUTES[moduleKey];
    if (route) {
      return route;
    }
  }

  return "/dashboard";
}
