
import { randomUUID } from "crypto";
import fs from "fs";

function log(msg) {
    fs.appendFileSync("verify_log.txt", msg + "\n");
}

async function run() {
    try {
        fs.writeFileSync("verify_log.txt", "Starting Log V3...\n");

        log("Loading modules...");
        const dbService = await import("../services/dbService.js");
        const dbConfig = await import("../config/db.js");
        log("Modules loaded.");

        const { createStudentProfile, createCompanyProfile, createJob, applyToJob, updateApplicationStatus } = dbService;
        const { getConnection } = dbConfig;

        log("Starting Verification V3...");
        const conn = await getConnection();

        // 1. Setup Data
        const student1 = { id: randomUUID(), email: `s1_${Date.now()}@test.com`, fullname: "Student One" };
        const student2 = { id: randomUUID(), email: `s2_${Date.now()}@test.com`, fullname: "Student Two" };
        const company = { id: randomUUID(), email: `c_${Date.now()}@test.com`, name: "Test Corp", domaine: "IT" };

        log("Creating Student 1...");
        await createStudentProfile(student1);
        log("Creating Student 2...");
        await createStudentProfile(student2);
        log("Creating Company...");
        await createCompanyProfile(company);

        // 2. Create Job
        log("Creating Job...");
        const { id: jobId } = await createJob({
            title: "Dev Job", description: "Test", location: "Remote", type: "Stage", salary: "1000", companyId: company.id
        });
        await conn.execute(`UPDATE JOBS SET INTERVIEW_QUOTA = 1 WHERE ID = :jobId`, { jobId });
        await conn.commit();
        log(`Job Created: ${jobId}`);

        // 3. Apply
        log("Student 1 Applying...");
        await applyToJob(student1.id, jobId, "Cover 1");
        log("Student 1 Applied.");

        log("Student 2 Applying...");
        await applyToJob(student2.id, jobId, "Cover 2");
        log("Student 2 Applied.");

        // 4. Accept
        const appsRes = await conn.execute(`SELECT ID FROM APPLICATIONS WHERE JOB_ID = :jobId ORDER BY CREATED_AT ASC`, { jobId });
        const appId1 = appsRes.rows[0][0];

        log(`Accepting App 1: ${appId1}`);
        await updateApplicationStatus(appId1, company.id, 'ACCEPTED');
        log("Accepted.");

        // 5. Check
        const s2Token = await conn.execute(`SELECT TOKENS_REMAINING FROM STUDENTS WHERE ID = :id`, { id: student2.id });
        log(`Student 2 Tokens: ${s2Token.rows[0][0]}`); // Should be 5 (4 -> refund -> 5)

        const jobCheck = await conn.execute(`SELECT IS_ACTIVE, ACCEPTED_COUNT FROM JOBS WHERE ID = :id`, { id: jobId });
        log(`Job Status: Active=${jobCheck.rows[0][0]}, Accepted=${jobCheck.rows[0][1]}`); // Active=0, Accepted=1

        await conn.close();
        log("Done.");

    } catch (e) {
        log(`CRITICAL FAILURE: ${e.message}\n${e.stack}`);
    }
}

run();
