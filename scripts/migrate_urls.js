import { withConnection } from "../services/coreDb.js";

async function migrate() {
    console.log("Starting migration to update URL IP addresses...");
    await withConnection(async (conn) => {
        const targetIp = "192.168.1.11";
        const port = "5000";

        // We want to replace both localhost and 127.0.0.1
        const replacements = [
            { old: `http://localhost:${port}`, new: `http://${targetIp}:${port}` },
            { old: `http://127.0.0.1:${port}`, new: `http://${targetIp}:${port}` }
        ];

        for (const r of replacements) {
            console.log(`Replacing ${r.old} -> ${r.new}`);

            // USERS.PHOTO_URL
            let res = await conn.execute(
                `UPDATE USERS SET PHOTO_URL = REPLACE(PHOTO_URL, :oldStr, :newStr) WHERE PHOTO_URL LIKE :likeStr`,
                { oldStr: r.old, newStr: r.new, likeStr: r.old + '%' }
            );
            console.log(`Updated ${res.rowsAffected} rows in USERS (PHOTO_URL)`);

            // STUDENTS.CV_URL
            res = await conn.execute(
                `UPDATE STUDENTS SET CV_URL = REPLACE(CV_URL, :oldStr, :newStr) WHERE CV_URL LIKE :likeStr`,
                { oldStr: r.old, newStr: r.new, likeStr: r.old + '%' }
            );
            console.log(`Updated ${res.rowsAffected} rows in STUDENTS (CV_URL)`);

            // STUDENTS.DIPLOMA_URL
            res = await conn.execute(
                `UPDATE STUDENTS SET DIPLOMA_URL = REPLACE(DIPLOMA_URL, :oldStr, :newStr) WHERE DIPLOMA_URL LIKE :likeStr`,
                { oldStr: r.old, newStr: r.new, likeStr: r.old + '%' }
            );
            console.log(`Updated ${res.rowsAffected} rows in STUDENTS (DIPLOMA_URL)`);
        }

        await conn.commit();
        console.log("Migration successfully committed.");
    });
}

migrate().then(() => {
    console.log("Done");
    process.exit(0);
}).catch(err => {
    console.error("Migration failed:", err);
    process.exit(1);
});
