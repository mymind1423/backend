
import { getConnection } from "../config/db.js";
import fs from "fs";

async function check() {
    let log = "";
    try {
        const conn = await getConnection();

        const res = await conn.execute(
            `SELECT COLUMN_NAME, DATA_TYPE, DATA_LENGTH, DATA_PRECISION 
             FROM USER_TAB_COLUMNS 
             WHERE TABLE_NAME = 'INTERVIEWS'`
        );

        log += "INTERVIEWS Table Schema:\n";
        res.rows.forEach(r => {
            log += `${r[0]}: ${r[1]} (${r[2]})\n`;
        });

        await conn.close();
    } catch (e) {
        log += `Error: ${e.message}\n`;
    }

    fs.writeFileSync("schema_log.txt", log);
}

check();
