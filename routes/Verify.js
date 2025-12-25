import express from "express";
import { query } from "express-validator";
import { verifyEmail, verifyPhone } from "../controllers/verifyController.js";
import { validateRequest } from "../middleware/validateRequest.js";

const router = express.Router();

router.get(
  "/email",
  query("email").isEmail().withMessage("Invalid email"),
  validateRequest,
  verifyEmail
);

router.get(
  "/phone",
  query("phone").isLength({ min: 8 }).withMessage("Phone required"),
  validateRequest,
  verifyPhone
);

export default router;
