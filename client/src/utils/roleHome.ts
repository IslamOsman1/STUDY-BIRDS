import type { Role } from "../types";

/**
 * Centralized role → home route mapping. Every login/register flow should
 * call this instead of repeating the ternary inline, so adding a role later
 * only requires a change here.
 */
export const getHomeRouteForRole = (role: Role): string => {
  switch (role) {
    case "admin":
      return "/admin";
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
