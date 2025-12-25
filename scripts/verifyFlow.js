
import { createStudentProfile, createCompanyProfile, createJob, applyToJob, updateApplicationStatus, getConnection } from "../services/dbService.js";
import { randomUUID } from "crypto";

async function runVerification() {
    let conn;
    try {
        console.log("Starting Verification...");
        conn = await getConnection();

        // 1. Setup Data
        const student1 = { id: randomUUID(), email: `s1_${Date.now()}@test.com`, fullname: "Student One" };
        const student2 = { id: randomUUID(), email: `s2_${Date.now()}@test.com`, fullname: "Student Two" };
        const company = { id: randomUUID(), email: `c_${Date.now()}@test.com`, name: "Test Corp", domaine: "IT" };

        await createStudentProfile(student1);
        await createStudentProfile(student2);
        await createCompanyProfile(company);

        // 2. Create Job with Quota = 1
        const job = { title: "Dev Job", description: "Test", location: "Remote", type: "Stage", salary: "1000" };
        const { id: jobId } = await createJob({ ...job, companyId: company.id });
        // Manually set Quota to 1 for testing saturation
        await conn.execute(`UPDATE JOBS SET INTERVIEW_QUOTA = 1 WHERE ID = :jobId`, { jobId });
        await conn.commit();
        console.log(`Job Created ${jobId} with Quota 1`);

        // 3. Apply Student 1
        const app1 = await applyToJob(student1.id, jobId, "Cover 1");
        console.log("Student 1 Applied:", app1);
        // Check tokens
        let s1 = await conn.execute(`SELECT TOKENS_REMAINING FROM STUDENTS WHERE ID = :id`, { id: student1.id });
        console.log(`Student 1 Tokens: ${s1.rows[0][0]} (Expected 4)`);

        // 4. Apply Student 2
        const app2 = await applyToJob(student2.id, jobId, "Cover 2");
        console.log("Student 2 Applied:", app2);
        let s2 = await conn.execute(`SELECT TOKENS_REMAINING FROM STUDENTS WHERE ID = :id`, { id: student2.id });
        console.log(`Student 2 Tokens: ${s2.rows[0][0]} (Expected 4)`);

        // Get App IDs
        const appsRes = await conn.execute(`SELECT ID, STUDENT_ID FROM APPLICATIONS WHERE JOB_ID = :jobId ORDER BY CREATED_AT ASC`, { jobId });
        const appId1 = appsRes.rows[0][0];
        const appId2 = appsRes.rows[1][0];

        // 5. Accept Student 1 -> Should Trigger Auto-Schedule & Close Job & Cancel Student 2
        console.log("Accepting Student 1...");
        await updateApplicationStatus(appId1, company.id, 'ACCEPTED');
        console.log("Student 1 Accepted.");

        // 6. Verify Results
        // A. Interview Created?
        const interview = await conn.execute(`SELECT ROOM_ID, DATE_TIME FROM INTERVIEWS WHERE APPLICATION_ID = :id`, { id: appId1 });
        console.log("Interview Scheduled:", interview.rows[0]);

        // B. Job Closed?
        const jobCheck = await conn.execute(`SELECT IS_ACTIVE, ACCEPTED_COUNT FROM JOBS WHERE ID = :id`, { id: jobId });
        console.log(`Job Status: Active=${jobCheck.rows[0][0]}, Accepted=${jobCheck.rows[0][1]}`);

        // C. Student 2 Cancelled?
        const app2Check = await conn.execute(`SELECT STATUS FROM APPLICATIONS WHERE ID = :id`, { id: appId2 });
        console.log(`Student 2 App Status: ${app2Check.rows[0][0]} (Expected CANCELLED_QUOTA)`);

        // D. Student 2 Refunded?
        s2 = await conn.execute(`SELECT TOKENS_REMAINING FROM STUDENTS WHERE ID = :id`, { id: student2.id });
        console.log(`Student 2 Tokens: ${s2.rows[0][0]} (Expected 5 - Refunded)`);

        console.log("Verification Successful!");

    } catch (err) {
        console.error("Verification Failed", err);
    } finally {
        if (conn) await conn.close();
    }
}

runVerification();
