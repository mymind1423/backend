import oracledb from "oracledb";
import { withConnection, normalizeUser, addSystemLog, notifyAdmins } from "./coreDb.js";
import { replaceFile, deleteFileFromUrl } from "../utils/fileUtils.js";
import { admin as firebaseAdmin } from "../firebase/firebaseAdmin.js";

/**
 * AUTH & PROFILE
 */
export async function getUserById(id) {
    return withConnection(async (conn) => {
        const res = await conn.execute(
            `SELECT * FROM USERS WHERE id = :id`,
            { id },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        return normalizeUser(res.rows[0]);
    });
}

export async function checkUserExists(id) {
    return withConnection(async (conn) => {
        const res = await conn.execute(
            `SELECT COUNT(*) as CNT FROM USERS WHERE ID = :id`,
            { id },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        return res.rows[0].CNT > 0;
    });
}

export async function getUserStatus(id) {
    return withConnection(async (conn) => {
        const res = await conn.execute(
            `SELECT STATUS FROM USERS WHERE ID = :id`,
            { id },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        return res.rows[0] ? res.rows[0].STATUS : null;
    });
}

export async function getUserByEmail(email) {
    return withConnection(async (conn) => {
        const res = await conn.execute(
            `SELECT * FROM USERS WHERE lower(email) = lower(:email)`,
            { email },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        return normalizeUser(res.rows[0]);
    });
}

export async function isPhoneRegistered(phone) {
    return withConnection(async (conn) => {
        const res = await conn.execute(
            `SELECT COUNT(*) as CNT FROM STUDENTS WHERE PHONE = :phone`,
            { phone },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        return res.rows[0].CNT > 0;
    });
}

export async function createStudentProfile(payload) {
    const { id, email, fullname, phone, address, faculty, domaine, grade, cvUrl, diplomaUrl } = payload;
    return withConnection(async (conn) => {
        await conn.execute(
            `INSERT INTO USERS (ID, USER_TYPE, EMAIL, DISPLAY_NAME, STATUS) VALUES (:id, 'student', :email, :fullname, 'approved')`,
            { id, email, fullname }
        );
        await conn.execute(
            `INSERT INTO STUDENTS (ID, FULLNAME, PHONE, ADDRESS, FACULTY, DOMAINE, GRADE, CV_URL, DIPLOMA_URL)
       VALUES (:id, :fullname, :phone, :address, :faculty, :domaine, :grade, :cvUrl, :diplomaUrl)`,
            {
                id: id || null,
                fullname: fullname || null,
                phone: phone || null,
                address: address || null,
                faculty: faculty || null,
                domaine: domaine || null,
                grade: grade || null,
                cvUrl: cvUrl || null,
                diplomaUrl: diplomaUrl || null
            }
        );
        await conn.commit();
        await addSystemLog('SYSTEM', 'NEW_STUDENT', { id, email, fullname });
        await notifyAdmins('Nouvelle Inscription', `${fullname} s'est inscrit en tant qu'étudiant.`);
        return { id };
    });
}

export async function createCompanyProfile(payload) {
    const { id, email, name, address, domaine, logoUrl } = payload;
    return withConnection(async (conn) => {
        await conn.execute(
            `INSERT INTO USERS (ID, USER_TYPE, EMAIL, DISPLAY_NAME, PHOTO_URL, STATUS) VALUES (:id, 'company', :email, :name, :logoUrl, 'pending')`,
            { id, email, name, logoUrl }
        );
        await conn.execute(
            `INSERT INTO COMPANIES (ID, NAME, ADDRESS, DOMAINE) VALUES (:id, :name, :address, :domaine)`,
            { id: id || null, name: name || null, address: address || null, domaine: domaine || null }
        );
        await conn.commit();
        await addSystemLog('SYSTEM', 'NEW_COMPANY', { id, email, name });
        await notifyAdmins('Demande de Validation', `L'entreprise ${name} souhaite rejoindre la plateforme.`);
        return { id };
    });
}

export async function getProfileById(id) {
    return withConnection(async (conn) => {
        const user = await getUserById(id);
        if (!user) return null;

        if (user.userType === "student") {
            const res = await conn.execute(
                `SELECT * FROM STUDENTS WHERE id = :id`,
                { id },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            const s = res.rows[0];

            const tokenRes = await conn.execute(
                `SELECT TOKENS_REMAINING, MAX_TOKENS FROM STUDENTS WHERE ID = :id`,
                { id },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            const remaining = tokenRes.rows[0] ? tokenRes.rows[0].TOKENS_REMAINING : 5;
            const max = tokenRes.rows[0] ? tokenRes.rows[0].MAX_TOKENS : 5;

            return {
                ...user,
                fullname: s.FULLNAME,
                phone: s.PHONE,
                address: s.ADDRESS,
                domaine: s.DOMAINE,
                grade: s.GRADE,
                cvUrl: s.CV_URL,
                diplomaUrl: s.DIPLOMA_URL,
                faculty: s.FACULTY,
                tokensRemaining: remaining,
                maxTokens: max
            };
        } else if (user.userType === "company") {
            const res = await conn.execute(
                `SELECT NAME, ADDRESS, DOMAINE, INTERVIEW_QUOTA FROM COMPANIES WHERE id = :id`,
                { id },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            const c = res.rows[0];
            const usageRes = await conn.execute(
                `SELECT COUNT(*) as CNT FROM INTERVIEWS WHERE COMPANY_ID = :id AND STATUS IN ('ACCEPTED', 'COMPLETED')`,
                { id },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            const usage = usageRes.rows[0].CNT;

            return {
                ...user,
                name: c.NAME,
                address: c.ADDRESS,
                domaine: c.DOMAINE,
                quota: { total: c.INTERVIEW_QUOTA, used: usage, remaining: c.INTERVIEW_QUOTA - usage }
            };
        }
        return user;
    });
}

export async function updateUserProfile(id, payload) {
    return withConnection(async (conn) => {
        const user = await getUserById(id);
        if (!user) return null;

        // Handle File replacements
        const currentProfile = await getProfileById(id);
        if (payload.photoUrl !== undefined) await replaceFile(currentProfile.photoUrl, payload.photoUrl);
        if (payload.logoUrl !== undefined) await replaceFile(currentProfile.photoUrl, payload.logoUrl);

        if (user.userType === 'student') {
            if (payload.cvUrl !== undefined) await replaceFile(currentProfile.cvUrl, payload.cvUrl);
            if (payload.diplomaUrl !== undefined) await replaceFile(currentProfile.diplomaUrl, payload.diplomaUrl);
        }

        // 1. Dynamic Update for USERS
        const userUpdates = [];
        const userParams = { id };

        if (payload.displayName !== undefined) {
            userUpdates.push('DISPLAY_NAME = :displayName');
            userParams.displayName = payload.displayName;
        }

        const newPhoto = payload.photoUrl !== undefined ? payload.photoUrl : payload.logoUrl;
        if (newPhoto !== undefined) {
            userUpdates.push('PHOTO_URL = :photo');
            userParams.photo = newPhoto;
        }

        userUpdates.push('UPDATED_AT = SYSTIMESTAMP');

        if (userUpdates.length > 1) {
            await conn.execute(`UPDATE USERS SET ${userUpdates.join(', ')} WHERE ID = :id`, userParams);
        }

        // 2. Dynamic Update for Sub-tables (STUDENTS / COMPANIES)
        if (user.userType === 'student') {
            const fields = [];
            const params = { id };
            const map = {
                fullname: 'FULLNAME', phone: 'PHONE', address: 'ADDRESS',
                domaine: 'DOMAINE', grade: 'GRADE', cvUrl: 'CV_URL', diplomaUrl: 'DIPLOMA_URL', faculty: 'FACULTY'
            };

            for (const [key, col] of Object.entries(map)) {
                if (payload[key] !== undefined) {
                    fields.push(`${col} = :${key}`);
                    params[key] = payload[key];
                }
            }

            if (fields.length > 0) {
                await conn.execute(`UPDATE STUDENTS SET ${fields.join(', ')} WHERE ID = :id`, params);
            }
        } else if (user.userType === 'company') {
            const fields = [];
            const params = { id };
            const map = { name: 'NAME', address: 'ADDRESS', domaine: 'DOMAINE' };

            for (const [key, col] of Object.entries(map)) {
                if (payload[key] !== undefined) {
                    fields.push(`${col} = :${key}`);
                    params[key] = payload[key];
                }
            }

            if (fields.length > 0) {
                await conn.execute(`UPDATE COMPANIES SET ${fields.join(', ')} WHERE ID = :id`, params);
            }
        }

        await conn.commit();
        return { success: true };
    });
}

export async function deleteUser(id) {
    return withConnection(async (conn) => {
        const user = await getUserById(id);
        if (user.photoUrl) await deleteFileFromUrl(user.photoUrl);
        // Delete from Firebase
        try { await firebaseAdmin.auth().deleteUser(id); } catch (e) { }
        // Delete from DB
        await conn.execute(`DELETE FROM USERS WHERE ID = :id`, { id });
        await conn.commit();
        await addSystemLog('ADMIN', 'DELETE_USER', { id });
        return { success: true };
    });
}

export async function getStudentProfileForAI(userId) {
    return withConnection(async (conn) => {
        const res = await conn.execute(
            `SELECT S.FULLNAME, S.DOMAINE, S.GRADE, S.CV_URL FROM STUDENTS S WHERE S.ID = :userId`,
            { userId },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        return res.rows[0] ? { fullname: res.rows[0].FULLNAME, domaine: res.rows[0].DOMAINE, grade: res.rows[0].GRADE, cvUrl: res.rows[0].CV_URL } : null;
    });
}

export async function approveUserTest(email) {
    return withConnection(async (conn) => {
        await conn.execute(`UPDATE USERS SET STATUS = 'approved' WHERE EMAIL = :email`, { email });
        await conn.commit();
    });
}

export async function getUserStatusByEmail(email) {
    return withConnection(async (conn) => {
        const res = await conn.execute(
            `SELECT STATUS FROM USERS WHERE EMAIL = :email`,
            { email },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        return res.rows[0] ? res.rows[0].STATUS : null;
    });
}

export async function makeUserAdmin(email) {
    return withConnection(async (conn) => {
        await conn.execute(`UPDATE USERS SET USER_TYPE = 'admin' WHERE EMAIL = :email`, { email });
        await conn.commit();
    });
}

export async function updateAdminProfile(id, displayName) {
    return withConnection(async (conn) => {
        await conn.execute(`UPDATE USERS SET DISPLAY_NAME = :displayName WHERE ID = :id`, { displayName, id });
        await conn.commit();
    });
}

export async function getAllUsers() {
    return withConnection(async (conn) => {
        const res = await conn.execute(
            `SELECT ID, USER_TYPE, EMAIL, DISPLAY_NAME, PHOTO_URL, STATUS FROM USERS`,
            {},
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        return res.rows.map(normalizeUser);
    });
}
