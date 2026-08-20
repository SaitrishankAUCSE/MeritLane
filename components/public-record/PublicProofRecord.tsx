import Link from "next/link";
import { Code2, ExternalLink } from "lucide-react";
import { ProofTrace } from "@/components/ui/ProofTrace";
import {
  buildAbstract,
  derivePublicationTitle,
  formatPublicDate,
  formatPublicDateTimeAttr,
  humanizeAssessmentKey,
  publicationRecordId,
  publicationStatusLabel,
} from "@/components/public-record/publication";

type ProjectRecord = {
  id?: string;
  title?: string;
  name?: string;
  description?: string;
  repoUrl?: string;
  liveUrl?: string;
  technologies?: string[];
  tech?: string[];
};

type PublicProofRecordProps = {
  id: string;
  candidate: Record<string, unknown>;
  user: Record<string, unknown>;
};

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
}

function SectionLabel({
  id,
  index,
  children,
}: {
  id: string;
  index: string;
  children: string;
}) {
  return (
    <h2
      id={id}
      className="mb-5 flex items-baseline gap-3 border-b border-zinc-200 pb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500"
    >
      <span className="font-mono text-zinc-400">{index}</span>
      <span className="text-zinc-800">{children}</span>
    </h2>
  );
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">{label}</p>
      <p className="mt-1 truncate text-sm text-zinc-800">{value}</p>
    </div>
  );
}

export function PublicProofRecord({ id, candidate, user }: PublicProofRecordProps) {
  const author = asString(candidate.name) || asString(user.displayName) || "Unknown author";
  const affiliation = asString(candidate.college);
  const discipline = asString(candidate.branch);
  const graduation = asString(candidate.gradYear);
  const githubUrl = asString(candidate.githubUrl);
  const skills = asStringArray(candidate.skills);
  const projects = Array.isArray(candidate.projects) ? (candidate.projects as ProjectRecord[]) : [];
  const assessmentScores =
    user.assessmentScores && typeof user.assessmentScores === "object"
      ? (user.assessmentScores as Record<string, unknown>)
      : null;
  const assessmentEntries = assessmentScores
    ? Object.entries(assessmentScores).filter(([, score]) => score != null && score !== "")
    : [];
  const assessmentKeys = assessmentEntries.map(([key]) => key);
  const verificationStatus = asString(candidate.verificationStatus) || "verified";
  const statusLabel = publicationStatusLabel(verificationStatus);
  const reviewComment = asString(candidate.verificationReason);
  const recordId = publicationRecordId(id);
  const title = derivePublicationTitle({ assessmentKeys, skills });
  const abstract = buildAbstract(
    projects.map((project) => asString(project.description)).filter(Boolean)
  );
  const verifiedAt = candidate.verifiedAt ?? null;
  const assessmentDate = user.assessmentDate ?? candidate.verifiedAt ?? null;
  const createdAt = user.createdAt ?? null;
  const verifiedAtLabel = formatPublicDate(verifiedAt);
  const assessmentDateLabel = formatPublicDate(assessmentDate);
  const createdAtLabel = formatPublicDate(createdAt);
  const hasProjects = projects.length > 0;
  const isPublished = statusLabel === "PUBLISHED";

  const verifiedClaims = assessmentEntries.map(([key, score]) => {
    const label = humanizeAssessmentKey(key);
    const matchingSkill = skills.find((skill) => {
      const normalized = skill.toLowerCase();
      return (
        normalized.length > 2 &&
        (normalized === label.toLowerCase() ||
          key.toLowerCase().replace(/_/g, " ").includes(normalized))
      );
    });
    return {
      name: matchingSkill || label,
      source: "Technical Assessment",
      status: "Verified",
      score,
    };
  });

  const references: { label: string; href: string }[] = [];
  if (githubUrl) {
    references.push({ label: "Authenticated GitHub profile", href: githubUrl });
  }
  projects.forEach((project, index) => {
    const name = asString(project.title) || asString(project.name) || `Implementation ${index + 1}`;
    if (asString(project.repoUrl)) {
      references.push({ label: `Source repository — ${name}`, href: asString(project.repoUrl) });
    }
    if (asString(project.liveUrl)) {
      references.push({ label: `Live demonstration — ${name}`, href: asString(project.liveUrl) });
    }
  });

  const history: { label: string; date?: string; dateTime?: string }[] = [];
  if (createdAtLabel || createdAt) {
    history.push({
      label: "Profile created",
      date: createdAtLabel || undefined,
      dateTime: formatPublicDateTimeAttr(createdAt),
    });
  }
  if (hasProjects) {
    history.push({ label: "Evidence submitted" });
  }
  if (assessmentEntries.length > 0) {
    history.push({
      label: "Assessment completed",
      date: assessmentDateLabel || undefined,
      dateTime: formatPublicDateTimeAttr(assessmentDate),
    });
  }
  if (isPublished) {
    history.push({ label: "Verification review" });
    history.push({
      label: "Published",
      date: verifiedAtLabel || undefined,
      dateTime: formatPublicDateTimeAttr(verifiedAt),
    });
  }

  const statusTone =
    statusLabel === "PUBLISHED"
      ? "border-emerald-700/40 text-emerald-800"
      : statusLabel === "UNDER REVIEW" || statusLabel === "REVISION REQUESTED"
        ? "border-amber-700/40 text-amber-800"
        : "border-zinc-300 text-zinc-600";

  return (
    <div className="relative min-h-screen bg-[#F7F5FB] pb-24 text-zinc-900">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_at_top,_rgba(228,222,245,0.7),_transparent_62%)]"
      />

      <div className="relative mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-zinc-200 pb-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-900">Meritlane</p>
            <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
              Published Technical Proof
            </p>
            <p className="mt-2 font-mono text-[11px] text-zinc-500">
              Record {recordId}
            </p>
          </div>
          <nav aria-label="Publication actions" className="flex items-center gap-4">
            <Link
              href="/employer/dashboard"
              className="text-xs font-semibold text-zinc-500 transition-colors hover:text-zinc-900"
            >
              Find Engineers
            </Link>
            <span aria-hidden="true" className="h-3 w-px bg-zinc-300" />
            <Link
              href="/signup"
              className="text-xs font-semibold text-zinc-900 transition-colors hover:text-zinc-600"
            >
              Get Verified
            </Link>
          </nav>
        </header>

        <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-start">
          <article className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <p className={`inline-flex items-center gap-2 border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] ${statusTone}`}>
                {isPublished && (
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-emerald-700" />
                )}
                {statusLabel}
              </p>
              <ProofTrace
                status="verified"
                assessmentScores={assessmentScores}
                assessmentDate={assessmentDate as string | number | Date | null}
                candidateName={author}
                size="sm"
              />
            </div>

            <h1 className="mt-6 font-[family-name:var(--font-proof-serif),ui-serif,Georgia,serif] text-[1.75rem] leading-tight tracking-tight text-zinc-950 sm:text-4xl sm:leading-[1.15]">
              {title}
            </h1>

            <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-y border-zinc-200 py-5 sm:grid-cols-4">
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">Author</dt>
                <dd className="mt-1 text-sm text-zinc-800">{author}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">Affiliation</dt>
                <dd className="mt-1 text-sm text-zinc-800">{affiliation || "Not recorded"}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">Discipline</dt>
                <dd className="mt-1 text-sm text-zinc-800">{discipline || "Not recorded"}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">Graduation</dt>
                <dd className="mt-1 text-sm text-zinc-800">{graduation || "Not recorded"}</dd>
              </div>
            </dl>

            <section className="mt-12" aria-labelledby="abstract-heading">
              <SectionLabel id="abstract-heading" index="01">Abstract</SectionLabel>
              <p className="max-w-prose text-[15px] leading-7 text-zinc-700">{abstract}</p>
            </section>

            <section className="mt-14" aria-labelledby="methodology-heading">
              <SectionLabel id="methodology-heading" index="02">Methodology</SectionLabel>
              {hasProjects ? (
                <div className="space-y-10">
                  {projects.map((project, index) => {
                    const name = asString(project.title) || asString(project.name) || "Untitled implementation";
                    const description = asString(project.description);
                    const repoUrl = asString(project.repoUrl);
                    const liveUrl = asString(project.liveUrl);
                    const technologies = asStringArray(project.technologies).length
                      ? asStringArray(project.technologies)
                      : asStringArray(project.tech);

                    return (
                      <div key={project.id || `${name}-${index}`} className="border-l border-zinc-300 pl-4 sm:pl-5">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                          Implementation {String(index + 1).padStart(2, "0")}
                        </p>
                        <h3 className="mt-1 text-lg font-medium text-zinc-950">{name}</h3>
                        {description ? (
                          <p className="mt-3 max-w-prose text-sm leading-6 text-zinc-700">{description}</p>
                        ) : (
                          <p className="mt-3 text-sm text-zinc-500">No implementation notes were provided.</p>
                        )}
                        {technologies.length > 0 && (
                          <p className="mt-4 font-mono text-xs text-zinc-600">
                            <span className="mr-2 uppercase tracking-wider text-zinc-400">Technology</span>
                            {technologies.join(" · ")}
                          </p>
                        )}
                        {(repoUrl || liveUrl) && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {repoUrl && (
                              <a
                                href={repoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-800 transition-colors hover:border-zinc-900"
                              >
                                <Code2 className="h-3.5 w-3.5" />
                                Repository
                              </a>
                            )}
                            {liveUrl && (
                              <a
                                href={liveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-zinc-800"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                                Demonstration
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-zinc-500">No public implementation evidence is available.</p>
              )}
            </section>

            <section className="mt-14" aria-labelledby="results-heading">
              <SectionLabel id="results-heading" index="03">Results</SectionLabel>
              {assessmentEntries.length > 0 ? (
                <div className="space-y-4">
                  {assessmentEntries.map(([key, score]) => {
                    const numeric = Number(score);
                    const hasNumeric = Number.isFinite(numeric);
                    return (
                      <div key={key} className="border border-zinc-200 bg-white px-4 py-4 sm:px-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                              Assessment record
                            </p>
                            <h3 className="mt-1 text-base font-medium text-zinc-950">
                              {humanizeAssessmentKey(key)}
                            </h3>
                            <p className="mt-1 text-xs uppercase tracking-wider text-emerald-800">Completed</p>
                          </div>
                          <p className="font-mono text-sm text-zinc-900">
                            {hasNumeric ? (
                              <>
                                <span className="text-xl font-semibold">{numeric.toFixed(0)}</span>
                                <span className="text-zinc-500"> / 5</span>
                              </>
                            ) : (
                              <span>{String(score)}</span>
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="font-mono text-sm text-zinc-500">
                  Assessment result not publicly disclosed.
                </p>
              )}
            </section>

            <section className="mt-14" aria-labelledby="claims-heading">
              <SectionLabel id="claims-heading" index="04">Verified Claims</SectionLabel>
              {verifiedClaims.length > 0 ? (
                <ul className="space-y-8">
                  {verifiedClaims.map((claim) => (
                    <li key={claim.name}>
                      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-900">
                        {claim.name}
                      </p>
                      <div className="mt-3 ml-1 border-l border-zinc-300 pl-4">
                        <p className="text-xs text-zinc-500">
                          Verified through
                        </p>
                        <p className="mt-1 font-mono text-sm text-zinc-800">{claim.source}</p>
                        <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-800">
                          {claim.status}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-zinc-500">No independently verified claims are publicly recorded.</p>
              )}
              {githubUrl && (
                <div className="mt-8 ml-1 border-l border-zinc-300 pl-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-900">GitHub</p>
                  <p className="mt-2 text-xs text-zinc-500">Authenticated repository</p>
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-sm text-zinc-800 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-900"
                  >
                    Source profile
                  </a>
                </div>
              )}
            </section>

            <section className="mt-14" aria-labelledby="review-heading">
              <SectionLabel id="review-heading" index="05">Peer Review</SectionLabel>
              <div className="border border-zinc-200 bg-white px-4 py-5 sm:px-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                  Review status
                </p>
                <p className="mt-2 text-sm text-zinc-900">{statusLabel}</p>
                {isPublished && (
                  <p className="mt-3 text-sm leading-6 text-zinc-700">Verification review completed.</p>
                )}
                {reviewComment && (
                  <blockquote className="mt-4 border-l border-zinc-300 pl-4 text-sm leading-6 text-zinc-700">
                    {reviewComment}
                  </blockquote>
                )}
              </div>

              {history.length > 0 && (
                <ol className="mt-8 space-y-0">
                  {history.map((event, index) => (
                    <li key={event.label} className="relative flex gap-4 pb-6 last:pb-0">
                      <span aria-hidden="true" className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-zinc-900" />
                      {index < history.length - 1 && (
                        <span aria-hidden="true" className="absolute left-[3.5px] top-4 h-[calc(100%-8px)] w-px bg-zinc-200" />
                      )}
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-900">
                          {event.label}
                        </p>
                        {event.date && (
                          <time className="mt-1 block font-mono text-xs text-zinc-500" dateTime={event.dateTime}>
                            {event.date}
                          </time>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </section>

            <section className="mt-14" aria-labelledby="references-heading">
              <SectionLabel id="references-heading" index="06">References</SectionLabel>
              {references.length > 0 ? (
                <ol className="space-y-3">
                  {references.map((reference, index) => (
                    <li key={`${reference.href}-${index}`} className="flex gap-3 text-sm leading-6">
                      <span className="font-mono text-xs text-zinc-400">[{index + 1}]</span>
                      <a
                        href={reference.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-w-0 break-all text-zinc-800 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-900"
                      >
                        {reference.label}
                      </a>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-zinc-500">No public source references are available.</p>
              )}
            </section>
          </article>

          <aside className="lg:sticky lg:top-20">
            <div className="border-t border-zinc-200 pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
                Publication metadata
              </p>
              <dl className="mt-4 space-y-4">
                <MetaCell label="Status" value={statusLabel} />
                <MetaCell label="Record ID" value={recordId} />
                <MetaCell label="Author" value={author} />
                {affiliation && <MetaCell label="Affiliation" value={affiliation} />}
                {verifiedAtLabel && <MetaCell label="Verification date" value={verifiedAtLabel} />}
              </dl>
            </div>
          </aside>
        </div>

        <footer className="mt-16 flex flex-col gap-3 border-t border-zinc-200 pt-8 sm:flex-row sm:items-center">
          <Link
            href="/employer/dashboard"
            className="inline-flex items-center justify-center bg-zinc-900 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-zinc-800"
          >
            Access talent pool
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center border border-zinc-300 bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-900 transition-colors hover:border-zinc-900"
          >
            Get verified
          </Link>
        </footer>
      </div>
    </div>
  );
}
