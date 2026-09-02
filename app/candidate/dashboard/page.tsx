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

      {/* Page Header with Institutional Provenance Line and Primary CTA */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <span className="h-2 w-2 rounded-full bg-[#064E3B] animate-pulse" />
          <span className="text-[12px] font-mono tracking-widest text-[#064E3B] uppercase font-medium">
            Protocol 001.B • Technical Evidence Layer
          </span>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-[#E7E2DA] pb-8">
          <div>
            <h1 className="font-serif text-[32px] sm:text-[44px] lg:text-[50px] text-[#1C1917] leading-[1.08] mb-3">
              Build your proof.
            </h1>
            <p className="text-[15px] text-[#525252] font-sans max-w-2xl leading-relaxed">
              Link code repositories, production URLs, and verifiable technical artifacts that validate the engineering capabilities declared in your identity.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button 
              type="button"
              onClick={() => setIsModalOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={isModalOpen}
              className="flex items-center justify-center gap-2 px-6 h-11 bg-[#064E3B] text-[#FFFFFF] hover:bg-[#022c22] rounded-full text-[14px] font-sans font-medium transition-all shadow-[0_4px_14px_rgba(6,78,59,0.2)] active:scale-95"
            >
              <span>+</span> Add Evidence
            </button>
          </div>
        </div>
      </div>

      {/* Executive Telemetry & Verification Readiness Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
        <div className="bg-white border border-[#E7E2DA] rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#064E3B]/5 rounded-bl-full pointer-events-none" />
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#78716C] mb-1">Declared Skills</div>
          <div className="text-[32px] font-serif text-[#1C1917] font-normal leading-none my-2">{skills.length}</div>
          <div className="text-[12px] font-sans text-[#78716C]">Self-declared in your Identity</div>
        </div>

        <div className="bg-white border border-[#E7E2DA] rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#064E3B]/5 rounded-bl-full pointer-events-none" />
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#78716C] mb-1">Linked Artifacts</div>
          <div className="text-[32px] font-serif text-[#1C1917] font-normal leading-none my-2">{projects.length}</div>
          <div className="text-[12px] font-sans text-[#78716C]">Supporting code repositories</div>
        </div>

        <div className="bg-white border border-[#E7E2DA] rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#064E3B]/10 rounded-bl-full pointer-events-none" />
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#064E3B] mb-1">Verified Badges</div>
          <div className="text-[32px] font-serif text-[#064E3B] font-normal leading-none my-2">
            {Object.values(profile?.verifiedSkills || {}).filter((v: any) => v.status === "verified").length}
          </div>
          <div className="text-[12px] font-sans text-[#064E3B]">Audited & signed assessments</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Column: Evidence Coverage by Skill */}
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-[#E7E2DA]">
            <h2 className="text-[12px] font-mono uppercase tracking-[0.15em] text-[#78716C]">Evidence Coverage</h2>
            <span className="text-[11px] font-mono text-[#064E3B]">{skills.length} Capabilities</span>
          </div>
          
          <div className="space-y-4">
            {skills.map((skill, index) => {
              const isVerified = profile?.verifiedSkills?.[skill]?.status === "verified";
              const itemsCount = projects.filter(p => p.supportsClaim === skill).length;
              
              return (
                <div key={index} className={`border rounded-xl p-5 transition-all ${isVerified ? 'border-[#064E3B]/30 bg-[#F0FDF4]/50 shadow-[0_2px_12px_rgba(6,78,59,0.05)]' : 'border-[#E7E2DA] bg-white hover:border-[#C8C0B5]'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-[15px] font-medium text-[#1C1917] font-sans">{skill}</div>
                      <div className="text-[11px] text-[#78716C] mt-0.5">
                        {itemsCount > 0 ? `${itemsCount} linked artifact${itemsCount > 1 ? 's' : ''}` : 'No evidence attached yet'}
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-medium ${isVerified ? 'bg-[#064E3B]/10 text-[#064E3B] border border-[#064E3B]/20' : 'bg-[#F2EFE9] text-[#78716C] border border-[#E7E2DA]'}`}>
                      {isVerified ? 'Verified' : itemsCount > 0 ? 'Linked' : 'Pending'}
                    </span>
                  </div>
                  
                  {/* Segmented Progress Tracker */}
                  <div className="flex gap-1.5 mb-4">
                    <div className={`h-1.5 flex-1 rounded-full ${itemsCount > 0 || isVerified ? 'bg-[#064E3B]' : 'bg-[#E7E2DA]'}`} />
                    <div className={`h-1.5 flex-1 rounded-full ${itemsCount > 1 || isVerified ? 'bg-[#064E3B]' : 'bg-[#E7E2DA]'}`} />
                    <div className={`h-1.5 flex-1 rounded-full ${isVerified ? 'bg-[#064E3B]' : 'bg-[#E7E2DA]'}`} />
                  </div>
                  
                  {isVerified ? (
                    <div className="w-full flex items-center justify-center gap-2 text-[13px] font-sans font-medium text-[#064E3B] bg-[#064E3B]/10 border border-[#064E3B]/20 py-2.5 rounded-lg">
                      <FileCheck className="h-4 w-4 text-[#064E3B]" /> Audit Record Verified
                    </div>
                  ) : (
                    <button 
                      onClick={() => router.push(`/candidate/assessment?skill=${encodeURIComponent(skill)}`)}
                      className="w-full flex items-center justify-center gap-2 text-[13px] font-sans font-medium border border-[#064E3B] text-[#FFFFFF] bg-[#064E3B] hover:bg-[#022c22] py-2.5 rounded-lg transition-all shadow-xs"
                    >
                      Take Verification Assessment <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
            
            {skills.length === 0 && (
              <div className="text-[13px] text-[#78716C] p-6 border border-dashed border-[#E7E2DA] rounded-xl text-center bg-[#F8F6F3]">
                Declare your technical skills in your Identity section to establish your evidence coverage track.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Linked Technical Artifacts */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-[#E7E2DA]">
            <h2 className="text-[12px] font-mono uppercase tracking-[0.15em] text-[#78716C]">Linked Technical Artifacts</h2>
            <span className="text-[11px] font-mono text-[#78716C]">{projects.length} Repositories</span>
          </div>
          
          <div className="space-y-5">
            {projects.length === 0 ? (
               <div className="p-12 border border-dashed border-[#E7E2DA] rounded-xl text-center bg-[#FFFFFF] shadow-sm">
                 <div className="h-10 w-10 mx-auto rounded-full bg-[#064E3B]/10 text-[#064E3B] flex items-center justify-center mb-4">
                   <Code className="h-5 w-5" />
                 </div>
                 <h3 className="text-base font-serif text-[#1C1917] mb-2">No evidence linked yet</h3>
                 <p className="text-sm text-[#78716C] max-w-md mx-auto mb-6">
                   Attach your GitHub repositories or live projects so our audit protocol can inspect your architectural capability.
                 </p>
                 <button 
                   type="button" 
                   onClick={() => setIsModalOpen(true)}
                   className="px-6 py-2.5 bg-[#064E3B] text-white rounded-full text-[13px] font-medium hover:bg-[#022c22] transition-colors shadow-sm"
                 >
                   + Link First Repository
                 </button>
               </div>
            ) : (
              projects.map((project, idx) => (
                <div key={project.id || idx} className="border border-[#E7E2DA] bg-white p-6 sm:p-7 rounded-xl hover:border-[#064E3B]/40 hover:shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all relative">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2.5 mb-1">
                          <h3 className="text-[18px] font-serif text-[#1C1917]">{project.title}</h3>
                          {project.liveUrl && (
                            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] font-mono text-[#064E3B] bg-[#064E3B]/10 px-2 py-0.5 rounded border border-[#064E3B]/20 hover:underline">
                              Live Demo ↗
                            </a>
                          )}
                        </div>
                        <div className="text-[12px] font-mono text-[#78716C] flex items-center gap-2">
                          <FileCheck className="h-3.5 w-3.5 text-[#064E3B]" />
                          <span className="truncate max-w-xs sm:max-w-md">{project.repoUrl}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-[12px] font-sans shrink-0">
                        <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="text-[#064E3B] font-medium hover:underline">
                          View Code ↗
                        </a>
                        <span className="text-[#E7E2DA]">|</span>
                        <button onClick={() => handleRemoveEvidence(project.id)} className="text-[#B42318] hover:underline">
                          Remove
                        </button>
                      </div>
                    </div>

                    {project.description && (
                      <p className="text-[14px] text-[#525252] mb-5 leading-relaxed font-sans">
                        {project.description}
                      </p>
                    )}
                    
                    {project.skillsUsed && project.skillsUsed.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-5">
                        {project.skillsUsed.map(skill => (
                          <span key={skill} className="px-2.5 py-1 bg-[#F8F6F3] border border-[#E7E2DA] rounded-md text-[11px] font-mono text-[#525252]">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Audit Provenance Thread */}
                    <div className="border-t border-[#E7E2DA] pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[12px]">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[#064E3B]" />
                        <span className="text-[#78716C]">Supports Claim:</span>
                        <span className="font-medium text-[#1C1917] bg-[#F2EFE9] px-2 py-0.5 rounded text-[11px] font-mono">
                          {project.supportsClaim || "General Technical Capability"}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-[#064E3B] font-medium">
                        STATUS: ARTIFACT ATTACHED
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
