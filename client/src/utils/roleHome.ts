import type { Role } from "../types";
import { employeeHome } from "./employeeAccess";

/**
 * Centralized role → home route mapping. Every login/register flow should
 * call this instead of repeating the ternary inline, so adding a role later
 * only requires a change here.
 */
export const getHomeRouteForRole = (role: Role, permissions: string[] = []): string => {
  switch (role) {
    case "admin":
      return "/admin";
    case "employee":
      return employeeHome({ permissions });
    case "partner":
      return "/partner/dashboard";
    case "parent":
      return "/parent";
    case "university":
      return "/university";
    case "student":
    default:
      return "/student";
  }
};
