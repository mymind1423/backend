import { buildFileUrl } from "../utils/fileUrl.js";
import { ValidationError } from "../utils/errors.js";

function ensureFile(req) {
  if (!req.file) {
    throw new ValidationError("Upload failed", [{ field: "file", message: "File is required" }]);
  }
}

export function uploadCvFile(req, res, next) {
  try {
    ensureFile(req);
    res.json({ url: buildFileUrl("cv", req.file.filename) });
  } catch (err) {
    next(err);
  }
}

export function uploadDiplomaFile(req, res, next) {
  try {
    ensureFile(req);
    res.json({ url: buildFileUrl("diploma", req.file.filename) });
  } catch (err) {
    next(err);
  }
}

export function uploadLogoFile(req, res, next) {
  try {
    ensureFile(req);
    res.json({ url: buildFileUrl("logo", req.file.filename) });
  } catch (err) {
    next(err);
  }
}

export function uploadAvatarFile(req, res, next) {
  try {
    ensureFile(req);
    res.json({ url: buildFileUrl("avatars", req.file.filename) });
  } catch (err) {
    next(err);
  }
}
