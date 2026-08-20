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

  if (!date || Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

export function humanizeAssessmentKey(key: string): string {
  if (key.startsWith("python_")) {
    const rest = key.slice("python_".length).replace(/_/g, " ").trim();
    return rest ? `Python (${rest})` : "Python";
  }
  return key.replace(/_/g, " ").trim();
}

/** Short verified focus label from an assessment key (e.g. python_core → Python). */
export function assessmentFocusLabel(key: string): string {
  const lower = key.toLowerCase();
  if (lower.startsWith("python")) return "Python";
  if (lower.startsWith("react")) return "React";
  if (lower.startsWith("node") || lower.startsWith("nodejs")) return "Node.js";
  if (lower.startsWith("javascript") || lower.startsWith("js_")) return "JavaScript";
  if (lower.startsWith("typescript") || lower.startsWith("ts_")) return "TypeScript";
  if (lower.startsWith("java") && !lower.startsWith("javascript")) return "Java";
  if (lower.startsWith("sql")) return "SQL";
  const first = key.split("_").filter(Boolean)[0];
  return first ? capitalizeToken(first) : humanizeAssessmentKey(key);
}

export function verifiedFocuses(assessmentKeys: string[]): string[] {
  const focuses: string[] = [];
  for (const key of assessmentKeys) {
    const label = assessmentFocusLabel(key);
    if (label && !focuses.some((item) => item.toLowerCase() === label.toLowerCase())) {
      focuses.push(label);
    }
    if (focuses.length >= 2) break;
  }
  return focuses;
}

export function derivePublicationTitle(options: { assessmentKeys: string[] }): string {
  const focuses = verifiedFocuses(options.assessmentKeys);
  if (focuses.length === 0) return "Verified Technical Record";
  if (focuses.length === 1) return `Verified Technical Work in ${focuses[0]}`;
  return `Verified Technical Work in ${focuses[0]} & ${focuses[1]}`;
}

export function buildAbstract(options: {
  projectTitles: string[];
  projectDescriptions: string[];
  focuses: string[];
}): string {
  const titles = options.projectTitles.filter(Boolean);
  const descriptions = options.projectDescriptions
    .map((item) => item.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  if (titles.length === 0 && descriptions.length === 0 && options.focuses.length === 0) {
    return "Technical summary not yet provided.";
  }

  const parts: string[] = [];

  if (options.focuses.length > 0) {
    parts.push(
      `This record documents verified technical work in ${joinFocuses(options.focuses)}.`
    );
  }

  if (titles.length === 1) {
    parts.push(`Public project evidence: ${titles[0]}.`);
  } else if (titles.length > 1) {
    parts.push(`Public project evidence: ${titles.slice(0, 3).join("; ")}.`);
  }

  if (descriptions[0]) {
    const excerpt =
      descriptions[0].length > 220 ? `${descriptions[0].slice(0, 217).trimEnd()}…` : descriptions[0];
    parts.push(excerpt);
  }

  if (parts.length === 0) return "Technical summary not yet provided.";
  return parts.join(" ");
}

export function publicationRecordId(id: string): string {
  return `ML-${id.substring(0, 8).toUpperCase()}`;
}

function joinFocuses(focuses: string[]): string {
  if (focuses.length === 1) return focuses[0];
  if (focuses.length === 2) return `${focuses[0]} and ${focuses[1]}`;
  return focuses.join(", ");
}

function capitalizeToken(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
