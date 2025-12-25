import { AppError } from "../utils/errors.js";

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  const status = err.status || 500;
  const payload = {
    error: err.message || "Internal server error",
    timestamp: new Date().toISOString()
  };

  if (err.details) {
    payload.details = err.details;
  }

  console.error("Request failed:", {
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
    status,
    message: err.message,
    details: err.details,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });

  res.status(status).json(payload);
}

export const notFoundHandler = (req, res) => {
  res.status(404).json({ error: "Route not found" });
};
