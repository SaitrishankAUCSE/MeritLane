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
  verifiedFocuses,
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

function projectName(project: ProjectRecord, index: number): string {
  return asString(project.title) || asString(project.name) || `Project ${index + 1}`;
}

function projectTechnologies(project: ProjectRecord): string[] {
  const listed = asStringArray(project.technologies).length
    ? asStringArray(project.technologies)
    : asStringArray(project.tech);
  return listed;
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
      className="mb-5 flex items-baseline gap-3 border-b border-border pb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground"
    >
      <span className="font-mono text-outline">{index}</span>
      <span className="text-foreground">{children}</span>
    </h2>
  );
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-outline">{label}</p>
      <p className="mt-1 break-words text-sm text-muted-foreground">{value}</p>
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
  const focuses = verifiedFocuses(assessmentKeys);
  const title = derivePublicationTitle({ assessmentKeys });
  const abstract = buildAbstract({
    projectTitles: projects.map((project, index) => projectName(project, index)),
    projectDescriptions: projects.map((project) => asString(project.description)).filter(Boolean),
    focuses,
  });
  const verifiedAt = candidate.verifiedAt ?? null;
  const assessmentDate = user.assessmentDate ?? null;
  const createdAt = user.createdAt ?? null;
  const verifiedAtLabel = formatPublicDate(verifiedAt);
  const assessmentDateLabel = formatPublicDate(assessmentDate);
  const createdAtLabel = formatPublicDate(createdAt);
  const hasProjects = projects.length > 0;
  const isPublished = statusLabel === "PUBLISHED";

  const verifiedClaims: { name: string; source: string }[] = [];

  for (const [key] of assessmentEntries) {
    const label = humanizeAssessmentKey(key);
    const matchingSkill = skills.find((skill) => {
      const normalized = skill.toLowerCase();
      return (
        normalized.length > 2 &&
        (normalized === label.toLowerCase() ||
          key.toLowerCase().replace(/_/g, " ").includes(normalized))
      );
    });
    verifiedClaims.push({
      name: matchingSkill || label,
      source: "Technical Assessment",
    });
  }

  const assessedNames = new Set(verifiedClaims.map((claim) => claim.name.toLowerCase()));
  for (const project of projects) {
    for (const tech of projectTechnologies(project)) {
      if (assessedNames.has(tech.toLowerCase())) continue;
      verifiedClaims.push({
        name: tech,
        source: "Project Evidence",
      });
      assessedNames.add(tech.toLowerCase());
    }
  }

  const references: { label: string; href: string }[] = [];
  if (githubUrl) {
    references.push({ label: "GitHub repository", href: githubUrl });
  }
  projects.forEach((project, index) => {
    const name = projectName(project, index);
    if (asString(project.repoUrl)) {
      references.push({ label: `Source repository — ${name}`, href: asString(project.repoUrl) });
    }
    if (asString(project.liveUrl)) {
      references.push({ label: `Live demo — ${name}`, href: asString(project.liveUrl) });
    }
  });

  const history: { label: string; date?: string; dateTime?: string }[] = [];
  if (createdAtLabel) {
    history.push({
      label: "Profile created",
      date: createdAtLabel,
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

  const byline = [affiliation, discipline, graduation].filter(Boolean).join(" · ");
  const verifiedSummary =
    verifiedClaims.length > 0
      ? verifiedClaims.map((claim) => claim.name).slice(0, 3).join(" · ")
      : "None public";

  const statusTone =
    statusLabel === "PUBLISHED"
      ? "text-emerald-800"
      : statusLabel === "UNDER REVIEW" || statusLabel === "REVISION REQUESTED"
        ? "text-amber-800"
        : "text-muted-foreground";

  return (
    <div className="relative min-h-screen bg-surface pb-24 text-foreground">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[380px] bg-[radial-gradient(ellipse_at_top,_rgba(139,168,137,0.1),_transparent_64%)]"
      />

      <div className="relative mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-foreground">Meritlane</p>
            <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Published Technical Proof
            </p>
            <p className="mt-2 font-mono text-[11px] text-muted-foreground">Record {recordId}</p>
          </div>
          <nav aria-label="Publication actions" className="flex items-center gap-4">
            <Link
              href="/employer/dashboard"
              className="text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              Find Engineers
            </Link>
            <span aria-hidden="true" className="h-3 w-px bg-zinc-300" />
            <Link
              href="/signup"
              className="text-xs font-semibold text-foreground transition-colors hover:text-muted-foreground"
            >
              Get Verified
            </Link>
          </nav>
        </header>

        <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-start">
          <article className="min-w-0">
            <p className={`text-[10px] font-semibold uppercase tracking-[0.22em] ${statusTone}`}>
              {statusLabel}
            </p>

            <h1 className="mt-4 max-w-3xl font-[family-name:var(--font-proof-serif),ui-serif,Georgia,serif] text-[1.7rem] leading-tight tracking-tight text-foreground sm:text-[2.15rem] sm:leading-[1.18]">
              {title}
            </h1>

            <div className="mt-5">
              <p className="text-base font-medium text-foreground">{author}</p>
              {byline && <p className="mt-1 text-xs text-muted-foreground">{byline}</p>}
            </div>

            <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 border-y border-border py-5 sm:grid-cols-4">
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-outline">Who</dt>
                <dd className="mt-1 text-sm text-foreground">{author}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-outline">Focus</dt>
                <dd className="mt-1 text-sm text-foreground">
                  {focuses.length > 0 ? focuses.join(" · ") : "Not specified"}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-outline">Built</dt>
                <dd className="mt-1 text-sm text-foreground">
                  {hasProjects ? `${projects.length} project${projects.length === 1 ? "" : "s"}` : "No public projects"}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-outline">Verified</dt>
                <dd className="mt-1 text-sm text-foreground">{verifiedSummary}</dd>
              </div>
            </dl>

            <div className="mt-5">
              <ProofTrace
                status="verified"
                assessmentScores={assessmentScores}
                assessmentDate={(user.assessmentDate || candidate.verifiedAt) as string | number | Date | null}
                candidateName={author}
                size="sm"
              />
            </div>

            <section className="mt-12" aria-labelledby="abstract-heading">
              <SectionLabel id="abstract-heading" index="01">
                Abstract
              </SectionLabel>
              <p className="max-w-prose text-[15px] leading-7 text-muted-foreground">{abstract}</p>
            </section>

            <section className="mt-14" aria-labelledby="methodology-heading">
              <SectionLabel id="methodology-heading" index="02">
                Methodology
              </SectionLabel>
              <p className="mb-8 max-w-prose text-sm text-muted-foreground">
                How technical ability was demonstrated through public project work.
              </p>
              {hasProjects ? (
                <div className="space-y-10">
                  {projects.map((project, index) => {
                    const name = projectName(project, index);
                    const description = asString(project.description);
                    const repoUrl = asString(project.repoUrl);
                    const liveUrl = asString(project.liveUrl);
                    const technologies = projectTechnologies(project);

                    return (
                      <div key={project.id || `${name}-${index}`}>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-outline">
                          Project
                        </p>
                        <h3 className="mt-1 text-lg font-medium text-foreground">{name}</h3>
                        <p className="mt-3 max-w-prose text-sm leading-6 text-muted-foreground">
                          <span className="mr-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-outline">
                            What it does
                          </span>
                          {description || "No project description was provided."}
                        </p>
                        {technologies.length > 0 && (
                          <p className="mt-3 font-mono text-xs text-muted-foreground">
                            <span className="mr-2 font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-outline">
                              Technologies
                            </span>
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
                                className="inline-flex items-center gap-1.5 border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-foreground"
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
                                className="inline-flex items-center gap-1.5 bg-foreground px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-zinc-800"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                                Live Demo
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No public project evidence is available.</p>
              )}
            </section>

            <section className="mt-14" aria-labelledby="results-heading">
              <SectionLabel id="results-heading" index="03">
                Results
              </SectionLabel>
              {assessmentEntries.length > 0 ? (
                <div className="divide-y divide-zinc-200 border-y border-border">
                  {assessmentEntries.map(([key, score]) => {
                    const numeric = Number(score);
                    const hasNumeric = Number.isFinite(numeric);
                    return (
                      <div key={key} className="py-5">
                        <h3 className="text-base font-medium text-foreground">
                          {humanizeAssessmentKey(key)}
                        </h3>
                        <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                          <div>
                            <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-outline">
                              Status
                            </dt>
                            <dd className="mt-1 text-sm text-emerald-800">Completed</dd>
                          </div>
                          <div>
                            <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-outline">
                              Score
                            </dt>
                            <dd className="mt-1 font-mono text-sm text-foreground">
                              {hasNumeric ? `${numeric.toFixed(0)} / 5` : String(score)}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-outline">
                              Technical signal
                            </dt>
                            <dd className="mt-1 text-sm text-muted-foreground">Assessment completed</dd>
                          </div>
                        </dl>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="font-mono text-sm text-muted-foreground">
                  Assessment result not publicly disclosed.
                </p>
              )}
            </section>

            <section className="mt-14" aria-labelledby="claims-heading">
              <SectionLabel id="claims-heading" index="04">
                Verified Claims
              </SectionLabel>
              {verifiedClaims.length > 0 ? (
                <ul className="space-y-8">
                  {verifiedClaims.map((claim) => (
                    <li key={`${claim.name}-${claim.source}`}>
                      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-foreground">
                        {claim.name}
                      </p>
                      <div className="relative mt-3 ml-2 border-l border-border pl-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-outline">
                          Source
                        </p>
                        <p className="mt-1 text-sm text-foreground">{claim.source}</p>
                        <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-800">
                          Verified
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No independently verified claims are publicly recorded.</p>
              )}
            </section>

            <section className="mt-14" aria-labelledby="review-heading">
              <SectionLabel id="review-heading" index="05">
                Verification Review
              </SectionLabel>
              <dl className="max-w-prose space-y-4">
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-outline">
                    Publication status
                  </dt>
                  <dd className="mt-1 text-sm text-foreground">{statusLabel}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-outline">
                    Review outcome
                  </dt>
                  <dd className="mt-1 text-sm text-muted-foreground">
                    {isPublished ? "Verification completed." : statusLabel}
                  </dd>
                </div>
                {reviewComment && (
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-outline">
                      Review note
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-muted-foreground">{reviewComment}</dd>
                  </div>
                )}
              </dl>

              {history.length > 0 && (
                <ol className="mt-10 space-y-0">
                  {history.map((event, index) => (
                    <li key={event.label} className="relative flex gap-4 pb-6 last:pb-0">
                      <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground" />
                      {index < history.length - 1 && (
                        <span
                          aria-hidden="true"
                          className="absolute left-[2.5px] top-4 h-[calc(100%-8px)] w-px bg-surface-high"
                        />
                      )}
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
                          {event.label}
                        </p>
                        {event.date && (
                          <time className="mt-1 block font-mono text-xs text-muted-foreground" dateTime={event.dateTime}>
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
              <SectionLabel id="references-heading" index="06">
                References
              </SectionLabel>
              {references.length > 0 ? (
                <ol className="space-y-3">
                  {references.map((reference, index) => (
                    <li key={`${reference.href}-${index}`} className="flex gap-3 text-sm leading-6">
                      <span className="font-mono text-xs text-outline">[{index + 1}]</span>
                      <a
                        href={reference.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-w-0 break-all text-foreground underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-900"
                      >
                        {reference.label}
                      </a>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-muted-foreground">No public source references are available.</p>
              )}
            </section>
          </article>

          <aside className="lg:sticky lg:top-20">
            <div className="border-t border-border pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-outline">
                Record metadata
              </p>
              <dl className="mt-4 space-y-4">
                <MetaCell label="Publication status" value={statusLabel} />
                <MetaCell label="Record ID" value={recordId} />
                <MetaCell label="Author" value={author} />
                {affiliation && <MetaCell label="Affiliation" value={affiliation} />}
                {verifiedAtLabel && <MetaCell label="Verification date" value={verifiedAtLabel} />}
              </dl>
            </div>
          </aside>
        </div>

        <footer className="mt-16 flex flex-col gap-3 border-t border-border pt-8 sm:flex-row sm:items-center">
          <Link
            href="/employer/dashboard"
            className="inline-flex items-center justify-center bg-foreground px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-zinc-800"
          >
            Access talent pool
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center border border-border bg-surface px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-foreground transition-colors hover:border-foreground"
          >
            Get verified
          </Link>
        </footer>
      </div>
    </div>
  );
}

