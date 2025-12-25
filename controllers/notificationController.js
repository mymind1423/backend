import {
    getUserNotifications,
    markNotificationRead,
    markAllNotificationsRead,
} from "../services/dbService.js";

export async function getNotifications(req, res, next) {
    try {
        const notifs = await getUserNotifications(req.user.uid);
        res.json(notifs);
    } catch (err) {
        next(err);
    }
}

export async function readNotification(req, res, next) {
    try {
        const { id } = req.params;
        await markNotificationRead(id);
        res.json({ success: true });
    } catch (err) {
        next(err);
    }
}



export async function readAllNotifications(req, res, next) {
    try {
        await markAllNotificationsRead(req.user.uid);
        res.json({ success: true });
    } catch (err) {
        next(err);
    }
}

export async function removeNotification(req, res, next) {
    try {
        const { id } = req.params;
        await deleteNotification(id);
        res.json({ success: true });
    } catch (err) {
        next(err);
    }
}
