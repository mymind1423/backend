import { validationResult } from "express-validator";
import { ValidationError } from "../utils/errors.js";

export function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const details = errors.array().map((e) => ({
    field: e.path,
    message: e.msg,
  }));

  next(new ValidationError("Invalid input", details));
}
