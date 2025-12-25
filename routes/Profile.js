import express from "express";
import { body } from "express-validator";
import {
  getProfile,
  updateProfile,
  profileExists,
  isPending,
} from "../controllers/profileController.js";
import { verifyAuth } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";

const router = express.Router();

const updateRules = [
  body("displayName").optional().isLength({ min: 2 }).withMessage("Display name too short"),
  body("photoUrl")
    .optional({ checkFalsy: true, nullable: true })
    .isURL({ require_tld: false })
    .withMessage("Photo URL invalid"),
  body("fullname").optional().isLength({ min: 2 }).withMessage("Full name too short"),
  body("phone").optional().isLength({ min: 8 }).withMessage("Phone too short"),
  body("address").optional().isLength({ min: 3 }).withMessage("Address too short"),
  body("domaine").optional().isLength({ min: 2 }).withMessage("Domain too short"),
  body("grade").optional().isLength({ min: 1 }).withMessage("Grade too short"),
  body("cvUrl")
    .optional({ checkFalsy: true, nullable: true })
    .isURL({ require_tld: false })
    .withMessage("CV URL invalid"),
  body("diplomaUrl")
    .optional({ checkFalsy: true, nullable: true })
    .isURL({ require_tld: false })
    .withMessage("Diploma URL invalid"),
  body("name").optional().isLength({ min: 2 }).withMessage("Company name too short"),
  body("logoUrl")
    .optional({ checkFalsy: true, nullable: true })
    .isURL({ require_tld: false })
    .withMessage("Logo URL invalid"),
];

router.get("/get", verifyAuth, getProfile);
router.put("/update", verifyAuth, updateRules, validateRequest, updateProfile);
router.get("/exist", verifyAuth, profileExists);
router.get("/pending", verifyAuth, isPending);

export default router;
