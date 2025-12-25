import {
    getStudentStats,
    getAllCompanies,
    createJob,
    getRecentJobs as fetchRecentJobs,
    applyToJob,
    getStudentApplications,
    getJobsByCompany,
    toggleSavedJob,
    getStudentSavedJobs,
    getStudentInterviews,
    deleteApplication
} from "../services/dbService.js";
import { generateJobForCompany } from "../utils/jobGenerator.js";

export async function getStats(req, res, next) {
    try {
        const stats = await getStudentStats(req.user.uid);
        res.json(stats);
    } catch (err) {
        next(err);
    }
}

export async function getCompanies(req, res, next) {
    try {
        const companies = await getAllCompanies();
        res.json(companies);
    } catch (err) {
        next(err);
    }
}

export async function getRecentJobs(req, res, next) {
    try {
        let jobs = await fetchRecentJobs(100, req.user.uid);
        if (jobs.length === 0) {
            const companies = await getAllCompanies();
            if (companies.length > 0) {
                for (const company of companies) {
                    const count = Math.floor(Math.random() * 2) + 1;
                    for (let i = 0; i < count; i++) {
                        const job = generateJobForCompany(company);
                        await createJob(job);
                    }
                }
                jobs = await fetchRecentJobs(100, req.user.uid);
            }
        }
        res.json(jobs);
    } catch (err) {
        next(err);
    }
}

export async function apply(req, res, next) {
    try {
        const { jobId } = req.body;
        const result = await applyToJob(req.user.uid, jobId);
        res.json(result);
    } catch (err) {
        next(err);
    }
}

export async function myApplications(req, res, next) {
    try {
        const apps = await getStudentApplications(req.user.uid);
        res.json(apps);
    } catch (err) {
        next(err);
    }
}

export async function getCompanyJobs(req, res, next) {
    try {
        const { companyId } = req.params;
        const jobs = await getJobsByCompany(companyId, req.user.uid);
        res.json(jobs);
    } catch (err) {
        next(err);
    }
}

export async function toggleSave(req, res, next) {
    try {
        const { jobId } = req.body;
        const result = await toggleSavedJob(req.user.uid, jobId);
        res.json(result);
    } catch (err) {
        next(err);
    }
}

export async function getSaved(req, res, next) {
    try {
        const savedJobs = await getStudentSavedJobs(req.user.uid);
        res.json(savedJobs);
    } catch (err) {
        next(err);
    }
}

export async function getInterviews(req, res, next) {
    try {
        const interviews = await getStudentInterviews(req.user.uid);
        res.json(interviews);
    } catch (err) {
        next(err);
    }
}

export async function withdrawApplication(req, res, next) {
    try {
        const { id } = req.body;
        const result = await deleteApplication(id, req.user.uid);
        res.json(result);
    } catch (err) { next(err); }
}

