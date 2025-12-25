import { getUserByEmail, isPhoneRegistered } from "../services/dbService.js";

export async function verifyEmail(req, res, next) {
  try {
    const email = req.query.email;
    const user = await getUserByEmail(email);
    res.json({ exists: !!user });
  } catch (err) {
    next(err);
  }
}

export async function verifyPhone(req, res, next) {
  try {
    const phone = req.query.phone;
    const exists = await isPhoneRegistered(phone);
    res.json({ exists });
  } catch (err) {
    next(err);
  }
}
