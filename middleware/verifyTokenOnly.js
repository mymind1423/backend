import { admin } from "../config/firebase.js";
import { AuthError } from "../utils/errors.js";

// Lightweight middleware used for public signup flows (no Oracle lookup).
export async function verifyTokenOnly(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) throw new AuthError("Missing token");

    const decoded = await admin.auth().verifyIdToken(token);
    req.user = {
      uid: decoded.uid,
      email: decoded.email
    };
    next();
  } catch (err) {
    next(new AuthError("Invalid token"));
  }
}
