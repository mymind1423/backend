
import { getConnection } from "../config/db.js";
import fs from "fs";

async function check() {
    let log = "";
    const logFile = "check_tables_log.txt";

    try {
        const conn = await getConnection();

        // Check Students
        const s = await conn.execute("SELECT COUNT(*) FROM STUDENTS");
        log += `Students: ${s.rows[0][0]}\n`;

        // Check Jobs
        const j = await conn.execute("SELECT COUNT(*) FROM JOBS");
        log += `Jobs: ${j.rows[0][0]}\n`;

        // Check Rooms
        const r = await conn.execute("SELECT COUNT(*) FROM ROOMS");
        log += `Rooms: ${r.rows[0][0]}\n`;

        // Check Tokens Column
        try {
            await conn.execute("SELECT TOKENS_REMAINING FROM STUDENTS FETCH NEXT 1 ROWS ONLY");
            log += "TOKENS_REMAINING column exists.\n";
        } catch (e) {
            log += `TOKENS_REMAINING error: ${e.message}\n`;
        }

        await conn.close();
    } catch (e) {
        log += `Error: ${e.message}\n${e.stack}\n`;
    }

    fs.writeFileSync(logFile, log);
    console.log("Check complete.");
}

check();
