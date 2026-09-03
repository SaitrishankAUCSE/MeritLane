import { CandidateProfile } from "./firebase/candidate";

export interface ProfileCompletionBreakdown {
  identity: boolean;
  education: boolean;
  skills: boolean;
  evidence: boolean;
}

export interface ProfileCompletionResult {
  percentage: number;
  isComplete: boolean;
  missingFields: string[];
  breakdown: ProfileCompletionBreakdown;
}

/**
 * Canonical profile completion calculator.
 * Used across the application to evaluate whether a candidate has reached
 * 100% profile completion before applying to jobs.
 *
 * 4 Pillars (25% each):
 * 1. Identity (Full Name) - 25%
 * 2. Academic Credentials (College, Degree / Branch) - 25%
 * 3. Technical Capabilities (At least 1 declared skill) - 25%
 * 4. Technical Evidence (PDF Resume / Text, GitHub URL, or Project artifact) - 25%
 */
export function calculateProfileCompletion(profile: CandidateProfile | null | undefined): ProfileCompletionResult {
  if (!profile) {
    return {
      percentage: 0,
      isComplete: false,
      missingFields: [
        "Identity (Full Name)",
        "Academic Credentials (University / Degree)",
        "Technical Capabilities (At least 1 skill)",
        "Technical Evidence (Resume, GitHub, or Projects)",
      ],
      breakdown: {
        identity: false,
        education: false,
        skills: false,
        evidence: false,
      },
    };
  }

  const hasIdentity = Boolean(profile.name && profile.name.trim().length >= 2);
  const hasEducation = Boolean(
    profile.college &&
    profile.college.trim().length > 0 &&
    ((profile.degree && profile.degree.trim().length > 0) || (profile.branch && profile.branch.trim().length > 0))
  );
  const hasSkills = Boolean(Array.isArray(profile.skills) && profile.skills.length >= 1);
  const hasEvidence = Boolean(
    (profile.resumeUrl && profile.resumeUrl.trim().length > 0) ||
    (profile.resumeText && profile.resumeText.trim().length > 20) ||
    (profile.githubUrl && profile.githubUrl.trim().length > 0) ||
    (profile.githubEvidence && profile.githubEvidence.repoCount > 0) ||
    (Array.isArray(profile.projects) && profile.projects.length >= 1)
  );

  const missingFields: string[] = [];
  let earnedScore = 0;

  if (hasIdentity) {
    earnedScore += 25;
  } else {
    missingFields.push("Full Name in Identity Record");
  }

  if (hasEducation) {
    earnedScore += 25;
  } else {
    missingFields.push("Academic Credentials (College, Degree / Branch)");
  }

  if (hasSkills) {
    earnedScore += 25;
  } else {
    missingFields.push("Declare at least one technical skill");
  }

  if (hasEvidence) {
    earnedScore += 25;
  } else {
    missingFields.push("Attach external evidence (Resume PDF, GitHub profile, or Project artifact)");
  }

  const isComplete = earnedScore === 100;

  return {
    percentage: earnedScore,
    isComplete,
    missingFields,
    breakdown: {
      identity: hasIdentity,
      education: hasEducation,
      skills: hasSkills,
      evidence: hasEvidence,
    },
  };
}
