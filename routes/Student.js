import express from "express";
import { getStats, getCompanies, getRecentJobs, apply, myApplications, getCompanyJobs, toggleSave, getSaved, getInterviews, withdrawApplication } from "../controllers/studentController.js";
import { verifyAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/stats", verifyAuth, getStats);
router.get("/companies", verifyAuth, getCompanies);
router.get("/jobs", verifyAuth, getRecentJobs);
router.post("/apply", verifyAuth, apply);
router.get("/applications", verifyAuth, myApplications);
router.post("/applications/delete", verifyAuth, withdrawApplication);
router.get("/companies/:companyId/jobs", verifyAuth, getCompanyJobs);

router.post("/save-job", verifyAuth, toggleSave);
router.get("/saved-jobs", verifyAuth, getSaved);
router.get("/interviews", verifyAuth, getInterviews);

export default router;
