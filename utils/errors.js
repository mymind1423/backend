export class AppError extends Error {
  constructor(message, status = 500, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed", details) {
    super(message, 400, details);
  }
}

export class AuthError extends AppError {
  constructor(message = "Invalid token") {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super(message, 404);
  }
}
