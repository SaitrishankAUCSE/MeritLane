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

  if (loading) {
    return <MeritlaneLoader level="page" text="Authenticating" />;
  }

  return (
    <div className="w-full px-8 md:px-16 lg:px-24 py-12 mx-auto max-w-[1600px] h-full overflow-y-auto scrollbar-hide relative">
      
      <div className="mb-12">
        <div className="text-[14px] font-sans font-medium text-[#737373] mb-3 flex items-center gap-2">
          <FolderOpen className="h-3 w-3" /> Evidence Workspace
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-[#E5E5E5] pb-6">
          <div>
            <h1 className="font-serif text-[40px] sm:text-[48px] text-[#0D0D0D] leading-tight mb-2">Build your proof.</h1>
            <div className="text-[14px] text-[#0D0D0D] font-sans">Provide the material that supports the claims made in your Identity.</div>
          </div>
          <button 
            type="button"
            onClick={() => setIsModalOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={isModalOpen}
            className="px-5 h-10 border border-[#0D0D0D] bg-[#0D0D0D] text-[#FFFFFF] hover:bg-[#222222] hover:text-[#FFFFFF] rounded-md text-[14px] font-sans font-medium transition-all font-bold shrink-0"
          >
            [+] Add evidence
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Column: Evidence Coverage */}
        <div className="space-y-8">
          <h2 className="text-[12px] font-mono uppercase tracking-[0.1em] text-[#666666] mb-6">Evidence Coverage</h2>
          
          <div className="space-y-6">
            {skills.map((skill, index) => {
              const isVerified = profile?.verifiedSkills?.[skill]?.status === "verified";
              const itemsCount = projects.filter(p => p.supportsClaim === skill).length;
              
              return (
                <div key={index} className="border border-[#E5E5E5] bg-[#FFFFFF] p-5 rounded-lg">
                  <div className="flex justify-between items-end mb-3">
                    <div className="text-[14px] font-medium text-[#0D0D0D]">{skill}</div>
                    <div className={`text-[10px] font-mono ${isVerified ? 'text-[#15803D]' : 'text-[#666666]'}`}>
                      {isVerified ? (itemsCount > 0 ? `${itemsCount} ITEM${itemsCount > 1 ? 'S' : ''}` : 'VERIFIED') : `${itemsCount} ITEM${itemsCount !== 1 ? 'S' : ''}`}
                    </div>
                  </div>
                  
                  <div className="flex gap-1 mb-3">
                    <div className={`h-2 flex-1 rounded-sm ${isVerified ? 'bg-[#15803D]' : 'bg-[#E5E5E5]'}`}></div>
                    <div className={`h-2 flex-1 rounded-sm ${isVerified ? 'bg-[#15803D]' : 'bg-[#E5E5E5]'}`}></div>
                    <div className={`h-2 flex-1 rounded-sm ${isVerified ? 'bg-[#15803D]' : 'bg-[#E5E5E5]'}`}></div>
                    <div className={`h-2 flex-1 rounded-sm ${isVerified ? 'bg-[#15803D]' : 'bg-[#E5E5E5]'}`}></div>
                  </div>
                  
                  {isVerified ? (
                    <>
                      <div className="text-[11px] text-[#15803D] mb-4">Verification successful.</div>
                      <div className="w-full flex items-center justify-center gap-2 text-[14px] font-sans font-medium border border-[#E5E5E5] text-[#15803D] bg-[#F0FDF4] py-2 h-10 rounded-md">
                        ✓ Verified
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-[11px] text-[#666666] mb-4">{itemsCount > 0 ? 'Verification pending.' : 'No supporting evidence yet.'}</div>
                      <button 
                        onClick={() => router.push(`/candidate/assessment?skill=${encodeURIComponent(skill)}`)}
                        className="w-full flex items-center justify-center gap-2 text-[14px] font-sans font-medium border border-[#0D0D0D] text-[#FFFFFF] bg-[#0D0D0D] py-2 h-10 rounded-md hover:bg-[#222222] hover:text-[#FFFFFF] transition-all font-bold"
                      >
                        Start verification <ArrowRight className="h-3 w-3" />
                      </button>
                    </>
                  )}
                </div>
              );
            })}
            
            {skills.length === 0 && (
              <div className="text-[13px] text-[#737373] p-4 border border-[#E5E5E5] border-dashed rounded-lg text-center">
                Add skills in your Identity to see them here.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Evidence Objects */}
        <div className="lg:col-span-2 space-y-8">
          <h2 className="text-[12px] font-mono uppercase tracking-[0.1em] text-[#666666] mb-6">Linked Artifacts</h2>
          
          <div className="space-y-6">
            
            {projects.length === 0 ? (
               <div className="text-[14px] text-[#737373] p-8 border border-[#E5E5E5] border-dashed rounded-lg text-center bg-[#FAFAFA]">
                 No evidence linked yet. Click [+] Add evidence to prove your skills.
               </div>
            ) : (
              projects.map((project, idx) => (
                <div key={project.id || idx} className="border border-[#E5E5E5] bg-[#FFFFFF] p-6 rounded-lg group hover:border-[#D2D2D2] transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-[16px] font-sans font-medium text-[#0D0D0D] mb-1">{project.title}</h3>
                        <div className="text-[12px] font-sans font-medium text-[#666666] flex items-center gap-2">
                          <FileCheck className="h-3.5 w-3.5" /> Project Repository
                        </div>
                      </div>
                      <div className="flex gap-3 text-[11px] font-sans font-medium text-[#666666]">
                        <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[#0D0D0D] transition-colors">View</a>
                        <button onClick={() => handleRemoveEvidence(project.id)} className="hover:text-[#B42318] transition-colors">Remove</button>
                      </div>
                    </div>

                    {project.description && (
                      <div className="text-[13px] text-[#404040] mb-4 whitespace-pre-wrap leading-relaxed">
                        {project.description}
                      </div>
                    )}
                    
                    {project.skillsUsed && project.skillsUsed.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {project.skillsUsed.map(skill => (
                          <span key={skill} className="px-2 py-1 bg-[#F3F3F1] border border-[#E5E5E5] rounded-md text-[11px] font-mono text-[#404040]">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Proof Thread */}
                  <div className="mt-6 border-t border-[#E5E5E5] pt-6">
                    <div className="text-[10px] font-sans font-medium text-[#666666] mb-4">Supports Claim:</div>
                    <div className="relative border-l border-[#E5E5E5] pl-4 space-y-4">
                      <div className="relative">
                        <div className="absolute -left-[18.5px] top-1.5 h-2 w-2 rounded-full bg-[#15803D]" />
                        <div className="text-[13px] font-medium text-[#0D0D0D]">{project.supportsClaim || "Unspecified"}</div>
                        <div className="text-[11px] text-[#666666] mt-1">Status: Evidence Linked</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            
          </div>
        </div>

      </div>

      {/* Add Evidence Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D0D0D]/40 backdrop-blur-sm p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-evidence-title"
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FFFFFF] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E5E5E5]">
              <h2 id="modal-evidence-title" className="text-[16px] font-bold text-[#0D0D0D]">Add Supporting Evidence</h2>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)} 
                className="text-[#737373] hover:text-[#0D0D0D]"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" aria-hidden="true" />
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

              <div className="flex justify-end gap-3 mt-4">
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
                  className="flex items-center gap-2 px-4 py-2 bg-[#0D0D0D] text-[#FFFFFF] hover:bg-[#222222] rounded-md text-[13px] font-medium transition-colors disabled:opacity-70"
                >
                  {saving && <div className="h-3.5 w-3.5 rounded-full border-[1.5px] border-[#FFFFFF]/30 border-t-[#FFFFFF] animate-spin" />}
                  Link Evidence
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
