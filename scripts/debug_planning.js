const { getKey, getCert } = require('../config/dbConfig');
const oracledb = require('oracledb');
const fs = require('fs');
const path = require('path');

async function checkData() {
    let connection;
    try {
        const walletPath = path.join(process.cwd(), 'wallet');

        connection = await oracledb.getConnection({
            user: "admin",
            password: "YourStrongPassword123!",
            connectString: `(description= (retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1521)(host=ep-delicate-rain-a2dhmj84.eu-central-1.aws.neon.tech))(connect_data=(service_name=neondb_High))(security=(ssl_server_dn_match=yes)(ssl_server_cert_dn="CN=ep-delicate-rain-a2dhmj84.eu-central-1.aws.neon.tech,OU=Neon,O=Neon,L=San Francisco,ST=California,C=US")))`,

        });

        console.log("Connected to DB.");

        // Check Interviews
        const interviews = await connection.execute(`SELECT ID, TITLE, DATE_TIME, STUDENT_ID, COMPANY_ID FROM INTERVIEWS`);
        console.log(`Interviews Count: ${interviews.rows.length}`);
        if (interviews.rows.length > 0) {
            console.log("Sample Interview:", interviews.rows[0]);
            console.log("Date Type:", typeof interviews.rows[0][2]);
            console.log("Date Value:", interviews.rows[0][2]);
        }

        // Check Applications
        const apps = await connection.execute(`SELECT STATUS, COUNT(*) FROM APPLICATIONS GROUP BY STATUS`);
        console.log("Applications by Status:");
        apps.rows.forEach(r => console.log(`- ${r[0]}: ${r[1]}`));


    } catch (err) {
        console.error("Error:", err);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error("Error closing connection:", err);
            }
        }
    }
}

checkData();
