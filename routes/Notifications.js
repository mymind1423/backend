import express from "express";
import {
    getNotifications,
    readNotification,
    readAllNotifications,
    removeNotification,
} from "../controllers/notificationController.js";
import { verifyAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyAuth, getNotifications);
router.put("/read-all", verifyAuth, readAllNotifications);
router.put("/:id/read", verifyAuth, readNotification);
router.delete("/:id", verifyAuth, removeNotification);

export default router;
