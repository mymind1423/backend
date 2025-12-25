/**
 * Scheduler Service
 * Handles automated interview scheduling for Djibouti Campus (Balbala).
 * Constraints: Jan 11-15, 08:30 - 12:00, 30 min slots.
 * Rooms: Salle A1, Salle A2.
 */

const START_HOUR = 8;
const START_MIN = 30;
const END_HOUR = 12;
const END_MIN = 0;
const SLOT_DURATION_MS = 30 * 60 * 1000;

// Jan 11 to Jan 15, 2025 (Assuming current/next year context, prompt says "11 au 15 Janvier")
// We will assume 2025 based on Metadata or 2026? Metadata says 2025-12-23. So next Jan is Jan 2026.
// Let's assume Jan 2026 to be safe, or just "Next Jan".
// Actually, prompt doesn't specify year. I'll use 2026 since we are in Dec 2025.
const YEAR = 2026;
const TARGET_MONTH = 0; // January (0-indexed)
const DAYS = [11, 12, 13, 14, 15];

export async function findBestSlot(conn, studentId, companyId) {
    // 1. Fetch Existing Commitments
    // Company Interviews
    const companyInts = await conn.execute(
        `SELECT DATE_TIME FROM INTERVIEWS WHERE COMPANY_ID = :id AND STATUS != 'CANCELLED'`,
        { id: companyId }
    );

    // Student Interviews
    const studentInts = await conn.execute(
        `SELECT DATE_TIME FROM INTERVIEWS WHERE STUDENT_ID = :id AND STATUS != 'CANCELLED'`,
        { id: studentId }
    );

    // Room Usage (Global)
    // We need to know which room is taken.
    const allInts = await conn.execute(
        `SELECT DATE_TIME, ROOM FROM INTERVIEWS WHERE STATUS != 'CANCELLED'`
    );

    const companyBusy = new Set(companyInts.rows.map(r => new Date(r[0]).getTime()));
    const studentBusy = new Set(studentInts.rows.map(r => new Date(r[0]).getTime()));

    const roomUsage = {}; // time -> Set(rooms)
    allInts.rows.forEach(r => {
        const time = new Date(r[0]).getTime();
        const room = r[1] || 'A1'; // Default to A1 if null
        if (!roomUsage[time]) roomUsage[time] = new Set();
        roomUsage[time].add(room);
    });

    // 2. Iterate Slots
    for (const day of DAYS) {
        // Generate slots for this day
        const baseDate = new Date(YEAR, TARGET_MONTH, day, START_HOUR, START_MIN, 0);
        // 08:30

        // We go until 12:00. Last slot starts at 11:30.
        // Slots: 8:30, 9:00, 9:30, 10:00, 10:30, 11:00, 11:30
        // Total 7 slots.

        for (let i = 0; i < 7; i++) {
            const slotTime = new Date(baseDate.getTime() + (i * SLOT_DURATION_MS));
            const timeMs = slotTime.getTime();

            // Checks
            if (companyBusy.has(timeMs)) continue;
            if (studentBusy.has(timeMs)) continue;

            // Room Check
            const usedRooms = roomUsage[timeMs] || new Set();

            let assignedRoom = null;
            if (!usedRooms.has('A1')) assignedRoom = 'A1';
            else if (!usedRooms.has('A2')) assignedRoom = 'A2';

            if (assignedRoom) {
                return {
                    startTime: slotTime,
                    roomName: assignedRoom, // 'A1' or 'A2'
                    roomId: assignedRoom // Simple mapping
                };
            }
        }
    }

    throw new Error("Aucun créneau disponible (Salles complètes ou incompatibilité d'agenda).");
}
