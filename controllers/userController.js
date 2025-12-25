import { getUserById } from "../services/dbService.js";

export async function getUserInfo(req, res, next) {
  try {
    const dbUser = await getUserById(req.user.uid);

    res.json({
      message: "Secure user info",
      uid: req.user.uid,
      email: req.user.email,
      user_type: dbUser ? dbUser.userType : null,
      status: dbUser ? dbUser.status : null,
    });
  } catch (err) {
    next(err);
  }
}
