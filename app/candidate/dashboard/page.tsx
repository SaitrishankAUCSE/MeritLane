"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { fetchCandidateProfile, CandidateProfile, ProjectEntry } from "@/lib/firebase/candidate";
import { FileCheck, Code, FolderOpen, ArrowRight, X } from "lucide-react";
import { MeritlaneLoader } from "@/components/ui/MeritlaneLoader";
import { db } from "@/lib/firebase/config";
import { doc, updateDoc } from "firebase/firestore";
import { TagInput } from "@/components/ui/TagInput";
import { motion, AnimatePresence } from "framer-motion";
import { ContextGuide } from "@/components/ui/ContextGuide";

export default function CandidateDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [newProject, setNewProject] = useState<Partial<ProjectEntry>>({
    title: "",
    repoUrl: "",
    liveUrl: "",
    description: "",
    supportsClaim: "",
    skillsUsed: []
  });

  useEffect(() => {
    if (!loading && user) {
      fetchCandidateProfile(user.uid)
        .then((p) => {
          setProfile(p);
          if (p?.skills && p.skills.length > 0) {
            setNewProject(prev => ({ ...prev, supportsClaim: p.skills[0] }));
          }
        })
        .catch((err) => console.error(err));
    }
  }, [user, loading]);

  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  const skills = profile?.skills || [];
  const projects = profile?.projects || [];

  const handleSaveEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    
    if (!newProject.title || !newProject.repoUrl) {
      setErrorMsg("Title and Repository URL are required.");
      return;
    }

    setSaving(true);
    setErrorMsg("");

    try {
      const projectToAdd: ProjectEntry = {
        id: Date.now().toString(),
        title: newProject.title || "",
        repoUrl: newProject.repoUrl || "",
        liveUrl: newProject.liveUrl || "",
        description: newProject.description || "",
        supportsClaim: newProject.supportsClaim || "",
        skillsUsed: newProject.skillsUsed || []
      };

      const updatedProjects = [...projects, projectToAdd];
      await updateDoc(doc(db, "candidates", user.uid), {
        projects: updatedProjects,
        updatedAt: Date.now()
      });

      setProfile({ ...profile, projects: updatedProjects });
      setIsModalOpen(false);
      setNewProject({ title: "", repoUrl: "", liveUrl: "", description: "", supportsClaim: skills[0] || "", skillsUsed: [] });
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to save evidence.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveEvidence = async (idToRemove: string) => {
    if (!user || !profile) return;
    try {
      const updatedProjects = projects.filter(p => p.id !== idToRemove);
      await updateDoc(doc(db, "candidates", user.uid), {
        projects: updatedProjects,
        updatedAt: Date.now()
      });
      setProfile({ ...profile, projects: updatedProjects });
    } catch (err) {
      console.error("Failed to remove evidence", err);
    }
  };

  if (loading && !user) {
    return <MeritlaneLoader level="page" text="Authenticating" />;
  }

  return (
    <div className="w-full px-4 sm:px-8 md:px-16 lg:px-24 py-8 sm:py-12 mx-auto max-w-[1600px] h-full overflow-y-auto scrollbar-hide relative">
      
      {/* Top Protocol Status & Context Guide */}
      <ContextGuide 
        storageKey="candidate_dashboard"
        title="Evidence Workspace"
        description="This is where you prove you actually know the skills you claimed in your profile. Without evidence, your profile cannot pass the manual audit."
        steps={[
          { title: "Review Claims", description: "Check the skills listed under Evidence Coverage.", isCompleted: true },
          { title: "Add Evidence", description: "Link a GitHub repository or project URL.", isCompleted: (profile?.projects?.length || 0) > 0 },
          { title: "Coverage", description: "Ensure every claimed skill has supporting evidence.", isCompleted: (profile?.skills?.length || 0) > 0 && (profile?.projects?.length || 0) >= (profile?.skills?.length || 1) }
        ]}
        ctaLabel="Ready for Assessment?"
        ctaHref="/candidate/assessment"
      />

      {/* Page Header: Academic & Credential Registry Authority */}
      <div className="mb-10 border-b border-[#E7E2DA] pb-7">
        <div className="text-[12px] font-mono tracking-[0.15em] text-[#78716C] uppercase mb-2">
          Evidence Workspace
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-6">
          <div>
            <h1 className="font-serif text-[34px] sm:text-[42px] text-[#1C1917] leading-[1.1] mb-2 font-normal">
              Build your proof.
            </h1>
            <p className="text-[14px] text-[#525252] font-sans max-w-2xl leading-relaxed">
              Link repositories, architectural artifacts, and live production deployments to establish evidence for your technical capabilities.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button 
              type="button"
              onClick={() => setIsModalOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={isModalOpen}
              className="flex items-center justify-center gap-2 px-5 h-10 bg-[#064E3B] text-[#FFFFFF] hover:bg-[#022c22] rounded text-[13px] font-sans font-medium transition-colors shadow-xs"
            >
              <span>+</span> Add Evidence
            </button>
          </div>
        </div>
      </div>

      {/* Institutional Telemetry Ledger */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white border border-[#E7E2DA] p-6 shadow-xs">
          <div className="text-[11px] font-mono uppercase tracking-[0.15em] text-[#78716C] mb-2">Declared Capabilities</div>
          <div className="text-[34px] font-serif text-[#1C1917] leading-none mb-2">{skills.length}</div>
          <div className="text-[12px] font-sans text-[#78716C]">Self-declared technical claims</div>
        </div>

        <div className="bg-white border border-[#E7E2DA] p-6 shadow-xs">
          <div className="text-[11px] font-mono uppercase tracking-[0.15em] text-[#78716C] mb-2">Linked Repositories</div>
          <div className="text-[34px] font-serif text-[#1C1917] leading-none mb-2">{projects.length}</div>
          <div className="text-[12px] font-sans text-[#78716C]">Supporting code artifacts</div>
        </div>

        <div className="bg-white border border-[#E7E2DA] p-6 shadow-xs">
          <div className="text-[11px] font-mono uppercase tracking-[0.15em] text-[#064E3B] mb-2">Verified Badges</div>
          <div className="text-[34px] font-serif text-[#064E3B] leading-none mb-2">
            {Object.values(profile?.verifiedSkills || {}).filter((v: any) => v.status === "verified").length}
          </div>
          <div className="text-[12px] font-sans text-[#064E3B]">Audited assessment records</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Column: Evidence Coverage by Skill */}
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#E7E2DA]">
            <h2 className="text-[12px] font-mono uppercase tracking-[0.15em] text-[#1C1917]">Evidence Coverage</h2>
            <span className="text-[11px] font-mono text-[#78716C]">{skills.length} Total</span>
          </div>
          
          <div className="space-y-4">
            {skills.map((skill, index) => {
              const isVerified = profile?.verifiedSkills?.[skill]?.status === "verified";
              const itemsCount = projects.filter(p => p.supportsClaim === skill).length;
              
              return (
                <div key={index} className={`border p-5 transition-colors bg-white ${isVerified ? 'border-[#064E3B]/40' : 'border-[#E7E2DA]'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-[15px] font-serif text-[#1C1917]">{skill}</div>
                      <div className="text-[12px] text-[#78716C] font-sans mt-0.5">
                        {itemsCount > 0 ? `${itemsCount} linked artifact${itemsCount > 1 ? 's' : ''}` : 'No evidence linked'}
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 border ${isVerified ? 'bg-[#064E3B]/10 text-[#064E3B] border-[#064E3B]/20' : 'bg-[#F8F6F3] text-[#78716C] border-[#E7E2DA]'}`}>
                      {isVerified ? 'VERIFIED' : itemsCount > 0 ? 'LINKED' : 'PENDING'}
                    </span>
                  </div>
                  
                  {isVerified ? (
                    <div className="w-full text-center text-[12px] font-mono text-[#064E3B] bg-[#064E3B]/5 border border-[#064E3B]/20 py-2 mt-4">
                      ✓ Audit Record Verified
                    </div>
                  ) : (
                    <button 
                      onClick={() => router.push(`/candidate/assessment?skill=${encodeURIComponent(skill)}`)}
                      className="w-full flex items-center justify-center gap-2 text-[12px] font-sans font-medium border border-[#1C1917] text-[#1C1917] hover:bg-[#1C1917] hover:text-white py-2 rounded-none transition-colors mt-4"
                    >
                      Take Assessment <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
            
            {skills.length === 0 && (
              <div className="text-[13px] text-[#78716C] p-6 border border-dashed border-[#E7E2DA] text-center bg-white">
                Declare your technical skills in Identity to establish your audit track.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Linked Technical Artifacts */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#E7E2DA]">
            <h2 className="text-[12px] font-mono uppercase tracking-[0.15em] text-[#1C1917]">Linked Technical Artifacts</h2>
            <span className="text-[11px] font-mono text-[#78716C]">{projects.length} Repositories</span>
          </div>
          
          <div className="space-y-4">
            {projects.length === 0 ? (
               <div className="p-12 border border-dashed border-[#E7E2DA] text-center bg-white">
                 <h3 className="text-base font-serif text-[#1C1917] mb-2 font-normal">No evidence linked yet</h3>
                 <p className="text-sm text-[#78716C] max-w-md mx-auto mb-6">
                   Attach code repositories or production links to establish evidentiary proof for audit review.
                 </p>
                 <button 
                   type="button" 
                   onClick={() => setIsModalOpen(true)}
                   className="px-5 py-2 bg-[#064E3B] text-white text-[13px] font-medium hover:bg-[#022c22] transition-colors"
                 >
                   + Link Repository
                 </button>
               </div>
            ) : (
              projects.map((project, idx) => (
                <div key={project.id || idx} className="border border-[#E7E2DA] bg-white p-6 transition-colors hover:border-[#1C1917]">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-[17px] font-serif text-[#1C1917] font-normal">{project.title}</h3>
                          {project.liveUrl && (
                            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] font-mono text-[#064E3B] bg-[#064E3B]/5 px-2 py-0.5 border border-[#064E3B]/20 hover:underline">
                              Live Demo ↗
                            </a>
                          )}
                        </div>
                        <div className="text-[12px] font-mono text-[#78716C]">
                          {project.repoUrl}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-[12px] font-sans shrink-0">
                        <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="text-[#1C1917] underline hover:text-[#064E3B]">
                          View Source ↗
                        </a>
                        <span className="text-[#E7E2DA]">|</span>
                        <button onClick={() => handleRemoveEvidence(project.id)} className="text-[#78716C] hover:text-[#B42318]">
                          Remove
                        </button>
                      </div>
                    </div>

                    {project.description && (
                      <p className="text-[13.5px] text-[#525252] mb-4 leading-relaxed font-sans">
                        {project.description}
                      </p>
                    )}
                    
                    {project.skillsUsed && project.skillsUsed.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.skillsUsed.map(skill => (
                          <span key={skill} className="px-2 py-0.5 bg-[#F8F6F3] border border-[#E7E2DA] text-[11px] font-mono text-[#525252]">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Audit Ledger Line */}
                    <div className="border-t border-[#E7E2DA] pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[12px]">
                      <div className="flex items-center gap-2">
                        <span className="text-[#78716C]">Supports Claim:</span>
                        <span className="font-mono text-[#1C1917] bg-[#F8F6F3] px-2 py-0.5 border border-[#E7E2DA] text-[11px]">
                          {project.supportsClaim || "General Technical Capability"}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-[#064E3B]">
                        [ ARTIFACT ATTACHED ]
                      </div>
                    </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Add Evidence Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-[#0D0D0D]/40 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-evidence-title"
              className="relative z-10 bg-[#FFFFFF] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-[#E5E5E5]"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#E5E5E5] bg-[#FAFAFA]">
                <h2 id="modal-evidence-title" className="text-[16px] font-serif text-[#0D0D0D]">Add Supporting Evidence</h2>
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)} 
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[#737373] hover:text-[#0D0D0D] hover:bg-[#E5E5E5] transition-colors"
                  aria-label="Close modal"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              
              <form onSubmit={handleSaveEvidence} className="p-6 flex flex-col gap-5">
                {errorMsg && (
                  <div role="alert" className="text-[13px] text-[#B42318] bg-[#B42318]/10 p-3 rounded-md">
                    {errorMsg}
                  </div>
                )}
                
                <div className="space-y-1.5">
                  <label htmlFor="evidence-project-title" className="text-[13px] font-medium text-[#0D0D0D]">Project Title <span className="text-[#B42318]">*</span></label>
                  <input 
                    id="evidence-project-title"
                    type="text" 
                    value={newProject.title}
                    onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                    className="w-full border border-[#E5E5E5] rounded-md px-3 py-2 text-[14px] outline-none focus:border-[#0D0D0D] transition-colors"
                    placeholder="e.g. Meritlane Backend Services"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="evidence-repo-url" className="text-[13px] font-medium text-[#0D0D0D]">Repository URL <span className="text-[#B42318]">*</span></label>
                  <input 
                    id="evidence-repo-url"
                    type="url" 
                    value={newProject.repoUrl}
                    onChange={(e) => setNewProject({...newProject, repoUrl: e.target.value})}
                    className="w-full border border-[#E5E5E5] rounded-md px-3 py-2 text-[14px] outline-none focus:border-[#0D0D0D] transition-colors"
                    placeholder="https://github.com/username/project"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="evidence-live-url" className="text-[13px] font-medium text-[#0D0D0D]">Live URL <span className="text-[#737373] font-normal">(Optional)</span></label>
                  <input 
                    id="evidence-live-url"
                    type="url" 
                    value={newProject.liveUrl}
                    onChange={(e) => setNewProject({...newProject, liveUrl: e.target.value})}
                    className="w-full border border-[#E5E5E5] rounded-md px-3 py-2 text-[14px] outline-none focus:border-[#0D0D0D] transition-colors"
                    placeholder="https://myproject.com"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="evidence-description" className="text-[13px] font-medium text-[#0D0D0D]">Description <span className="text-[#737373] font-normal">(Optional)</span></label>
                  <textarea 
                    id="evidence-description"
                    value={newProject.description}
                    onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                    className="w-full border border-[#E5E5E5] rounded-md px-3 py-2 text-[14px] outline-none focus:border-[#0D0D0D] transition-colors resize-none h-20"
                    placeholder="Describe what you built and how it works..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-[#0D0D0D]">Other Features & Skills <span className="text-[#737373] font-normal">(Optional)</span></label>
                  <TagInput 
                    tags={newProject.skillsUsed || []} 
                    onChange={(tags) => setNewProject({...newProject, skillsUsed: tags})}
                    placeholder="e.g. Postgres, AWS, Real-time (press Enter)"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="evidence-supports-claim" className="text-[13px] font-medium text-[#0D0D0D]">Supports Claim <span className="text-[#B42318]">*</span></label>
                  <select 
                    id="evidence-supports-claim"
                    aria-describedby="evidence-supports-claim-desc"
                    value={newProject.supportsClaim}
                    onChange={(e) => setNewProject({...newProject, supportsClaim: e.target.value})}
                    className="w-full border border-[#E5E5E5] rounded-md px-3 py-2 text-[14px] outline-none focus:border-[#0D0D0D] transition-colors bg-transparent"
                    required
                  >
                    {skills.length === 0 ? (
                      <option value="">No skills found in Identity</option>
                    ) : (
                      skills.map((skill) => (
                        <option key={skill} value={skill}>{skill}</option>
                      ))
                    )}
                  </select>
                  <p id="evidence-supports-claim-desc" className="text-[11px] text-[#737373]">Select the skill this evidence proves.</p>
                </div>

                <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-[#E5E5E5]">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-[13px] font-medium text-[#737373] hover:text-[#0D0D0D] transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-[#064E3B] text-[#FFFFFF] hover:bg-[#022c22] rounded-full text-[13px] font-medium transition-colors disabled:opacity-70 shadow-xs"
                  >
                    {saving && <div className="h-3.5 w-3.5 rounded-full border-[1.5px] border-[#FFFFFF]/30 border-t-[#FFFFFF] animate-spin" />}
                    Link Evidence
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
