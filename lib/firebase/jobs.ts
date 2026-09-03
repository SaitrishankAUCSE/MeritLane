import { doc, getDoc, setDoc, collection, query, where, getDocs, orderBy, updateDoc, increment } from "firebase/firestore";
import { db } from "./config";

export type JobStatus = "draft" | "published" | "paused" | "closed";
export type WorkMode = "remote" | "hybrid" | "on-site";
export type EmploymentType = "full-time" | "part-time" | "internship" | "contract";
export type ApplicationStage = "applied" | "shortlisted" | "interviewing" | "offer" | "hired" | "rejected";

export interface Job {
  id: string;
  employerId: string;
  companyName: string;
  title: string;
  department?: string;
  description: string;
  location: string;
  workMode: WorkMode;
  employmentType: EmploymentType;
  requiredSkills: string[];
  salaryRange?: string;
  status: JobStatus;
  applicationCount: number;
  createdAt: number;
  updatedAt: number;
  publishedAt?: number;
  closedAt?: number;
}

export interface JobApplication {
  id: string; // `${jobId}_${candidateId}`
  jobId: string;
  employerId: string;
  candidateId: string;
  candidateName: string;
  candidateKey?: string;
  candidateCollege?: string;
  candidateBranch?: string;
  candidateGradYear?: string;
  candidateSkills: string[];
  candidateVerifiedSkills: Record<string, any>;
  status: ApplicationStage;
  appliedAt: number;
  updatedAt: number;
}

export interface JobFilters {
  search?: string;
  skill?: string;
  workMode?: string;
  employmentType?: string;
}

/**
 * Fetch published jobs with optional in-memory filter fallbacks
 */
export const fetchPublishedJobs = async (filters?: JobFilters): Promise<Job[]> => {
  try {
    const jobsRef = collection(db, "jobs");
    const q = query(
      jobsRef,
      where("status", "==", "published")
    );
    const snap = await getDocs(q);
    let jobs: Job[] = [];

    snap.forEach((d) => {
      jobs.push({ id: d.id, ...d.data() } as Job);
    });

    // Sort newest published first
    jobs.sort((a, b) => (b.publishedAt || b.createdAt) - (a.publishedAt || a.createdAt));

    if (filters) {
      if (filters.search && filters.search.trim().length > 0) {
        const queryTerm = filters.search.toLowerCase().trim();
        jobs = jobs.filter(
          (j) =>
            j.title.toLowerCase().includes(queryTerm) ||
            j.companyName.toLowerCase().includes(queryTerm) ||
            j.location.toLowerCase().includes(queryTerm) ||
            j.description.toLowerCase().includes(queryTerm)
        );
      }
      if (filters.skill && filters.skill.trim().length > 0) {
        const s = filters.skill.toLowerCase().trim();
        jobs = jobs.filter((j) =>
          j.requiredSkills.some((sk) => sk.toLowerCase() === s || sk.toLowerCase().includes(s))
        );
      }
      if (filters.workMode && filters.workMode !== "all") {
        jobs = jobs.filter((j) => j.workMode === filters.workMode);
      }
      if (filters.employmentType && filters.employmentType !== "all") {
        jobs = jobs.filter((j) => j.employmentType === filters.employmentType);
      }
    }

    return jobs;
  } catch (err) {
    console.error("fetchPublishedJobs error:", err);
    return [];
  }
};

/**
 * Fetch single job by ID
 */
export const fetchJobById = async (jobId: string): Promise<Job | null> => {
  try {
    const docRef = doc(db, "jobs", jobId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Job;
    }
    return null;
  } catch (err) {
    console.error("fetchJobById error:", err);
    return null;
  }
};

/**
 * Fetch jobs owned by a specific employer
 */
export const fetchEmployerJobs = async (employerId: string): Promise<Job[]> => {
  try {
    const jobsRef = collection(db, "jobs");
    const q = query(jobsRef, where("employerId", "==", employerId));
    const snap = await getDocs(q);
    const jobs: Job[] = [];

    snap.forEach((d) => {
      jobs.push({ id: d.id, ...d.data() } as Job);
    });

    jobs.sort((a, b) => b.updatedAt - a.updatedAt);
    return jobs;
  } catch (err) {
    console.error("fetchEmployerJobs error:", err);
    return [];
  }
};

/**
 * Check if a candidate has already applied to a specific job
 */
export const hasCandidateApplied = async (jobId: string, candidateId: string): Promise<boolean> => {
  try {
    const appId = `${jobId}_${candidateId}`;
    const snap = await getDoc(doc(db, "jobApplications", appId));
    return snap.exists();
  } catch (err) {
    console.error("hasCandidateApplied error:", err);
    return false;
  }
};
