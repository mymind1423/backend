import { admin } from "../config/firebase.js";
import { getUserById } from "../services/dbService.js";
import { AuthError, ForbiddenError } from "../utils/errors.js";

// Full auth check: Firebase token + Oracle profile
export async function verifyAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) throw new AuthError("Missing token");

    const decoded = await admin.auth().verifyIdToken(token);
    const userRecord = await getUserById(decoded.uid);
    if (!userRecord) throw new ForbiddenError("User not found");

    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      userType: userRecord.userType,
      status: userRecord.status,
    };

    next();
  } catch (err) {
    if (err instanceof AuthError || err instanceof ForbiddenError) {
      return next(err);
    }
    next(new AuthError("Invalid or expired token"));
  }
}
