export type PublicationStatusLabel =
  | "PUBLISHED"
  | "UNDER REVIEW"
  | "REVISION REQUESTED"
  | "DRAFT";

export function publicationStatusLabel(status: unknown): PublicationStatusLabel {
  switch (status) {
    case "verified":
      return "PUBLISHED";
    case "pending":
      return "UNDER REVIEW";
    case "rejected":
    case "changes_required":
      return "REVISION REQUESTED";
    default:
      return "DRAFT";
  }
}

export function formatPublicDate(value: unknown): string | null {
  if (value == null || value === "") return null;

  let date: Date | null = null;
  if (typeof value === "number") {
    date = new Date(value);
  } else if (typeof value === "string") {
    date = new Date(value);
  } else if (typeof value === "object") {
    const record = value as { toDate?: () => Date; seconds?: number; _seconds?: number };
    if (typeof record.toDate === "function") {
      date = record.toDate();
    } else if (typeof record.seconds === "number") {
      date = new Date(record.seconds * 1000);
    } else if (typeof record._seconds === "number") {
      date = new Date(record._seconds * 1000);
    }
  }

  if (!date || Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatPublicDateTimeAttr(value: unknown): string | undefined {
  if (value == null || value === "") return undefined;
  if (typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
  }
  if (typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
  }
  return undefined;
}

export function humanizeAssessmentKey(key: string): string {
  if (key.startsWith("python_")) {
    const rest = key.slice("python_".length).replace(/_/g, " ").trim();
    return rest ? `Python (${rest})` : "Python";
  }
  return key.replace(/_/g, " ").trim();
}

export function primaryTechnicalFocus(options: {
  assessmentKeys: string[];
  skills: string[];
}): string | null {
  const firstAssessment = options.assessmentKeys[0];
  if (firstAssessment) {
    if (firstAssessment.toLowerCase().startsWith("python")) return "Python";
    const words = humanizeAssessmentKey(firstAssessment)
      .replace(/[()]/g, " ")
      .split(/\s+/)
      .filter(Boolean);
    return words[0] ? capitalizeToken(words[0]) : null;
  }

  const firstSkill = options.skills.find((skill) => skill.trim().length > 0);
  return firstSkill ? firstSkill.trim() : null;
}

export function derivePublicationTitle(options: {
  assessmentKeys: string[];
  skills: string[];
}): string {
  const focus = primaryTechnicalFocus(options);
  if (!focus) return "Verified Technical Record";
  return `A Verified Implementation of ${focus}`;
}

export function buildAbstract(projectDescriptions: string[]): string {
  const text = projectDescriptions
    .map((item) => item.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join(" ");

  if (!text) return "Technical summary not yet provided.";
  if (text.length <= 420) return text;
  return `${text.slice(0, 417).trimEnd()}…`;
}

export function publicationRecordId(id: string): string {
  return `ML-${id.substring(0, 8).toUpperCase()}`;
}

function capitalizeToken(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
