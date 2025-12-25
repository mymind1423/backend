import express from "express";
import { getJobs, createNewJob, getApplications, updateStatus, deleteJob, updateJob, getInterviews, saveEvaluation, getEvaluation, getStudentPublicProfile, updateInterviewState, notifyInterviewStudent, getStudentList, inviteStudent } from "../controllers/companyController.js";
import { verifyAuth } from "../middleware/authMiddleware.js";

const router = express.Router();


router.get("/jobs", verifyAuth, getJobs);
router.post("/jobs", verifyAuth, createNewJob);
router.delete("/jobs", verifyAuth, deleteJob);
router.put("/jobs", verifyAuth, updateJob);

router.get("/applications", verifyAuth, getApplications);
router.post("/applications/status", verifyAuth, updateStatus);
router.get("/interviews", verifyAuth, getInterviews);
router.post("/interviews/:id/status", verifyAuth, updateInterviewState);
router.post("/interviews/:id/notify", verifyAuth, notifyInterviewStudent);
router.post("/evaluation", verifyAuth, saveEvaluation);
router.get("/evaluation/:studentId", verifyAuth, getEvaluation);
router.get("/student-profile/:studentId", verifyAuth, getStudentPublicProfile);

// Talent Pool
router.get("/talents", verifyAuth, getStudentList);
router.post("/invite", verifyAuth, inviteStudent);

export default router;
