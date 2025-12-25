import oracledb from 'oracledb';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const ORDERED_TABLES = [
    'USERS',
    'SYSTEM_SETTINGS',
    'COMPANIES',
    'STUDENTS',
    'JOBS',
    'APPLICATIONS',
    'INTERVIEWS',
    'EVALUATIONS',
    'SAVED_JOBS',
    'NOTIFICATIONS',
    'SYSTEM_LOGS',
    'MESSAGES'
];

oracledb.fetchAsString = [oracledb.CLOB];

async function exportDb() {
    let conn;
    try {
        console.log("Connecting to local database...");
        conn = await oracledb.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONNECT_STRING
        });

        let sqlScript = `-- Database Export for InternFlow
-- Date: ${new Date().toISOString()}

`;

        // 1. Get DDL (Schema)
        console.log("Exporting Schema (DDL)...");
        for (const table of ORDERED_TABLES) {
            try {
                // Determine dependencies to disable constraints momentarily if needed, 
                // but simpler to just export table creation.
                // DBMS_METADATA.GET_DDL returns the CREATE statement.
                const ddlRes = await conn.execute(
                    `SELECT DBMS_METADATA.GET_DDL('TABLE', :name) FROM DUAL`,
                    { name: table }
                );
                let ddl = ddlRes.rows[0][0]; // CLOB or String
                // Clean up schema name if present "FRONT"."TABLE" -> "TABLE"
                ddl = ddl.replace(/"FRONT"\./g, "");
                // Remove SEGMENT CREATION or storage clauses that might fail on different DB versions/editions
                // But usually XE to XE is fine.

                sqlScript += `\n-- Table: ${table}\n`;
                // Add a "DROP TABLE IF EXISTS" equivalent
                sqlScript += `BEGIN EXECUTE IMMEDIATE 'DROP TABLE ${table} CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;\n/\n`;

                sqlScript += `${ddl};\n`;
            } catch (err) {
                console.warn(`Could not get DDL for ${table} (maybe it doesn't exist?):`, err.message);
            }
        }

        // 2. Get Data (Inserts)
        console.log("Exporting Data...");
        for (const table of ORDERED_TABLES) {
            try {
                const res = await conn.execute(
                    `SELECT * FROM ${table}`,
                    {},
                    { outFormat: oracledb.OUT_FORMAT_OBJECT } // Get column names
                );

                if (res.rows.length > 0) {
                    sqlScript += `\n-- Data for: ${table}\n`;

                    // Build INSERT statements
                    for (const row of res.rows) {
                        const cols = Object.keys(row);
                        const vals = Object.values(row).map(v => {
                            if (v === null) return 'NULL';
                            if (typeof v === 'number') return v;
                            if (v instanceof Date) {
                                // Oracle Timestamp format conversion
                                // simple approach: TO_TIMESTAMP('ISO_STRING', 'YYYY-MM-DD"T"HH24:MI:SS.FF3"Z"')
                                return `TO_TIMESTAMP('${v.toISOString()}', 'YYYY-MM-DD"T"HH24:MI:SS.FF3"Z"')`;
                            }
                            // String escaping ' -> ''
                            return `'${String(v).replace(/'/g, "''")}'`;
                        });

                        sqlScript += `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${vals.join(', ')});\n`;
                    }
                    sqlScript += `COMMIT;\n`;
                }
            } catch (err) {
                console.warn(`Could not get data for ${table}:`, err.message);
            }
        }

        const outputFile = path.join(process.cwd(), 'backup_full.sql');
        fs.writeFileSync(outputFile, sqlScript);
        console.log(`\nExport complete! File saved to: ${outputFile}`);

    } catch (err) {
        console.error("Export failed:", err);
    } finally {
        if (conn) await conn.close();
    }
}

exportDb();
