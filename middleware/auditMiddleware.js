import { addSystemLog } from "../services/dbService.js";

export async function auditLogger(req, res, next) {
    // Only log mutations (POST, PUT, DELETE)
    if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
        const originalSend = res.send;
        res.send = function (body) {
            // Log after response is sent
            const adminId = req.user?.uid || 'UNKNOWN';
            const action = `${req.method}_${req.path.split('/').pop().toUpperCase()}`;
            const details = {
                params: req.params,
                body: req.body,
                status: res.statusCode
            };

            addSystemLog(adminId, action, JSON.stringify(details))
                .catch(err => console.error("Audit log failed", err));

            return originalSend.apply(res, arguments);
        };
    }
    next();
}
