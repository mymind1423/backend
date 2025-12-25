import { ForbiddenError } from "../utils/errors.js";

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.userType !== "admin") {
    return next(new ForbiddenError("Admin access required"));
  }
  next();
}
