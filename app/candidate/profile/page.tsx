"use client";

import React, { useState, useEffect } from "react";
import { Plus, Save, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { TagInput } from "@/components/ui/TagInput";
import { Autocomplete } from "@/components/ui/Autocomplete";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { fetchCandidateProfile, saveCandidateProfile, ProjectEntry, VerificationStatus } from "@/lib/firebase/candidate";
import { logFunnelEvent } from "@/lib/analytics/logEvent";
import { Workspace } from "@/components/proof/Workspace";
import { ProofThread, EvidenceBlock } from "@/components/proof/ProofThread";
import { StatusMark } from "@/components/proof/StatusMark";

const ENGINEERING_BRANCHES = [
  "Computer Science and Engineering",
  "Information Technology",
  "Electronics and Communication Engineering",
  "Electrical and Electronics Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Aerospace Engineering",
  "Biotechnology",
  "Artificial Intelligence and Data Science",
  "Cyber Security",
  "Robotics and Automation"
];

const PASSING_YEARS = Array.from({ length: 15 }, (_, i) => (new Date().getFullYear() - 5 + i).toString());

export default function CandidateProfilePage() {
  const { user, role: userRole, loading: authLoading, profileLoading, userProfile } = useAuth();
  const router = useRouter();
  
  const [dataLoading, setDataLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>("draft");
  const [name, setName] = useState<string>("");
  const [college, setCollege] = useState<string>("");
  const [branch, setBranch] = useState<string>("");
  const [gradYear, setGradYear] = useState<string>("");
  const [githubUrl, setGithubUrl] = useState<string>("");
  const [skills, setSkills] = useState<string[]>([]);
  const [projects, setProjects] = useState<ProjectEntry[]>([]);

  useEffect(() => {
    if (!authLoading && user?.email?.toLowerCase() === "saitrishankb9@gmail.com") {
      router.replace("/admin");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!authLoading && !profileLoading && user && userRole === "candidate") {
      fetchCandidateProfile(user.uid)
        .then((profile) => {
          if (profile) {
            setName(profile.name || "");
            setCollege(profile.college || "");
            setBranch(profile.branch || "");
            setGradYear(profile.gradYear || "");
            setGithubUrl(profile.githubUrl || "");
            setSkills(profile.skills || []);
            setProjects(profile.projects || []);
            setVerificationStatus(profile.verificationStatus || "draft");
          }
        })
        .catch((error) => console.error("Error fetching profile:", error))
        .finally(() => setDataLoading(false));
    }
  }, [user, userRole, authLoading, profileLoading]);

  const handleSave = async (statusOverride?: VerificationStatus) => {
    if (!user) return;
    setSaving(true);
    const targetStatus = statusOverride || verificationStatus;
    
    try {
      await saveCandidateProfile(user.uid, {
        name,
        email: user.email || "",
        college,
        branch,
        gradYear,
        githubUrl,
        resumeUrl: "",
        skills,
        projects,
        verificationStatus: targetStatus,
      });
      setVerificationStatus(targetStatus);
      if (targetStatus === "pending") {
        logFunnelEvent("profile_submitted", { projectCount: projects.length });
      }
    } catch (error: any) {
      console.error("Error saving:", error);
    } finally {
      setSaving(false);
    }
  };

  const fetchColleges = async (query: string): Promise<string[]> => {
    if (!query || query.length < 2) return [];
    try {
      const response = await fetch(`/api/colleges?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      return data.results || [];
    } catch (err) {
      return [];
    }
  };

  if (authLoading || (user && profileLoading) || dataLoading) {
    return (
      <Workspace>
        <div className="h-64 animate-pulse bg-surface-low" />
      </Workspace>
    );
  }

  const isLocked = verificationStatus === "verified";
  const assessmentCount = userProfile?.assessmentScores ? Object.keys(userProfile.assessmentScores).length : 0;

  return (
    <Workspace>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 pb-6 border-b border-border">
        <div>
          <p className="font-data mb-2 text-outline uppercase tracking-wider">
            ID: {user?.uid?.substring(0, 8)}... • {branch || "Identity Workspace"}
          </p>
          <h1 className="font-serif text-[48px] font-semibold leading-[1.1] text-foreground tracking-[-0.02em]">
            {name || "Engineer Identity"}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {isLocked ? (
            <Button variant="outline" disabled className="w-full sm:w-auto border-border">
              Dossier Verified & Locked
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => handleSave()} loading={saving} className="text-foreground">
                [+] SAVE DOSSIER
              </Button>
              {verificationStatus !== "pending" && (
                <Button variant="ghost" size="sm" onClick={() => handleSave("pending")} loading={saving} disabled={projects.length === 0} className="text-secondary hover:bg-secondary/10">
                  [+] SUBMIT FOR AUDIT
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* LEFT COLUMN: Identity & Skills (4 cols) */}
        <div className="lg:col-span-4 space-y-12">
          
          <section>
            <h2 className="font-label mb-6 text-outline border-b border-border pb-2">Identity & Artifacts</h2>
            <div className="space-y-5">
              <Input
                label="Full Legal Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ada Lovelace"
                disabled={isLocked}
              />
              <div className="space-y-1.5">
                <label className="font-data text-outline">University / College</label>
                <Autocomplete
                  value={college}
                  onChange={setCollege}
                  fetchOptions={fetchColleges}
                  placeholder="Search university..."
                  disabled={isLocked}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-data text-outline">Branch</label>
                  <select
                    className="field-select"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    disabled={isLocked}
                  >
                    <option value="">Select Branch</option>
                    {ENGINEERING_BRANCHES.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="font-data text-outline">Grad Year</label>
                  <select
                    className="field-select"
                    value={gradYear}
                    onChange={(e) => setGradYear(e.target.value)}
                    disabled={isLocked}
                  >
                    <option value="">Select Year</option>
                    {PASSING_YEARS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
              <Input
                label="GitHub URL"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/..."
                disabled={isLocked}
              />
            </div>
          </section>

          <section>
            <h2 className="font-label mb-6 text-outline border-b border-border pb-2">Core Competencies</h2>
            
            {assessmentCount > 0 && (
              <div className="mb-6 space-y-3">
                {Object.entries(userProfile?.assessmentScores || {}).map(([skill, score]) => (
                  <div key={skill} className="flex items-center justify-between">
                    <span className="font-data text-foreground">{skill.replace('python_', 'Python (').replace('_', ' ') + (skill.startsWith('python_') ? ')' : '')}</span>
                    <span className="font-data text-success">Verified L{score as React.ReactNode}</span>
                  </div>
                ))}
              </div>
            )}

            <div>
              <p className="font-data text-outline mb-3">Declared Stack</p>
              <TagInput
                tags={skills}
                onChange={setSkills}
                placeholder="Type skill & enter..."
                disabled={isLocked}
              />
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Evidence Ledger (8 cols) */}
        <div className="lg:col-span-8">
          <div className="flex justify-between items-end border-b border-border pb-2 mb-10">
            <h2 className="font-label text-outline">Evidence Ledger</h2>
            {!isLocked && (
              <Button variant="ghost" size="xs" onClick={() => {
                setProjects([...projects, { id: `p-${Date.now()}`, title: "", repoUrl: "", liveUrl: "", description: "" }]);
              }}>
                [+] APPEND EVIDENCE
              </Button>
            )}
          </div>

          <div className="proof-focus-group space-y-8">
            {projects.length === 0 ? (
              <p className="font-data text-muted-foreground text-center py-12 border border-dashed border-border">
                No project evidence attached.
              </p>
            ) : (
              projects.map((project, index) => (
                <ProofThread 
                  key={project.id} 
                  claim={project.title || `Project Evidence #${index + 1}`}
                  kicker={isLocked ? "Lead Engineer" : "Editing Evidence"}
                  status={verificationStatus === "verified" ? "verified" : verificationStatus === "pending" ? "pending" : "declared"}
                >
                  <EvidenceBlock source={project.repoUrl || "GitHub Repository"}>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Input
                        label="Repository Name"
                        value={project.title}
                        onChange={(e) => {
                          const newP = [...projects];
                          newP[index].title = e.target.value;
                          setProjects(newP);
                        }}
                        placeholder="e.g. Distributed Key-Value Store"
                        disabled={isLocked}
                      />
                      <Input
                        label="Repository URL"
                        value={project.repoUrl}
                        onChange={(e) => {
                          const newP = [...projects];
                          newP[index].repoUrl = e.target.value;
                          setProjects(newP);
                        }}
                        placeholder="https://github.com/..."
                        disabled={isLocked}
                      />
                      <div className="sm:col-span-2">
                        <Input
                          label="Live Demo URL (Optional)"
                          value={project.liveUrl || ""}
                          onChange={(e) => {
                            const newP = [...projects];
                            newP[index].liveUrl = e.target.value;
                            setProjects(newP);
                          }}
                          placeholder="https://..."
                          disabled={isLocked}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Textarea
                          label="Technical Provenance (Description)"
                          value={project.description}
                          onChange={(e) => {
                            const newP = [...projects];
                            newP[index].description = e.target.value;
                            setProjects(newP);
                          }}
                          placeholder="Explain the architecture and challenging problems solved."
                          rows={3}
                          disabled={isLocked}
                        />
                      </div>
                    </div>
                  </EvidenceBlock>
                  
                  <div className="flex items-center justify-between border-t border-border mt-4 pt-4">
                    <div className="flex gap-4">
                      <span className="font-label text-outline">CLAIMS:</span>
                      <span className="font-data text-accent">{skills.slice(0, 2).join(", ")}</span>
                    </div>
                    {!isLocked && (
                      <Button variant="ghost" size="xs" onClick={() => setProjects(projects.filter(p => p.id !== project.id))} className="text-danger hover:bg-danger/10">
                        [-] REMOVE
                      </Button>
                    )}
                  </div>
                  
                  {isLocked && (
                    <div className="flex items-center gap-6 mt-4 font-data text-outline">
                      <span className="flex items-center gap-2"><StatusMark status="verified" /> Hash: 0x9A...2F11</span>
                      <span>Validator: Meritlane Protocol</span>
                    </div>
                  )}
                </ProofThread>
              ))
            )}
          </div>
        </div>
      </div>
    </Workspace>
  );
}
