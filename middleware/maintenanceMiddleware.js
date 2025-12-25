import { getSystemSettings } from "../services/dbService.js";

export async function checkMaintenanceMode(req, res, next) {
    try {
        // Paths that are ALWAYS allowed (admin API, login, etc)
        // Actually, we only block non-admins.
        const settings = await getSystemSettings();
        const isMaintenance = settings.MAINTENANCE_MODE === 'true';

        if (isMaintenance && req.user?.userType !== 'admin') {
            return res.status(503).json({
                error: "Maintenance Mode",
                message: "Le portail est actuellement en maintenance pour des améliorations techniques. Reviens plus tard !"
            });
        }
        next();
    } catch (err) {
        next(); // Proceed if settings fail
    }
}
