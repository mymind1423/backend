import express from "express";
import { uploadCv, uploadDiploma, uploadLogo, uploadAvatar } from "../config/multer.js";
import {
  uploadCvFile,
  uploadDiplomaFile,
  uploadLogoFile,
  uploadAvatarFile,
} from "../controllers/uploadController.js";
import { verifyTokenOnly } from "../middleware/verifyTokenOnly.js";

const router = express.Router();

router.post("/cv", verifyTokenOnly, uploadCv.single("file"), uploadCvFile);
router.post("/diploma", verifyTokenOnly, uploadDiploma.single("file"), uploadDiplomaFile);
router.post("/logo", verifyTokenOnly, uploadLogo.single("file"), uploadLogoFile);
router.post("/avatar", verifyTokenOnly, uploadAvatar.single("file"), uploadAvatarFile);

export default router;
