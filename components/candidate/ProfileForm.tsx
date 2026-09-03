import React, { useState, useMemo, useRef } from "react";
import { Save, Sparkles, FileText, CheckCircle2, UploadCloud, Trash2, Compass, ShieldCheck, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { TagInput } from "@/components/ui/TagInput";
import { CandidateProfile, saveCandidateProfile } from "@/lib/firebase/candidate";
import { useAuth } from "@/lib/auth/AuthContext";
import { Autocomplete } from "@/components/ui/Autocomplete";
import { COMMON_DEGREES, getBranchesForDegree, YEARS, fetchIndianColleges, COMMON_SKILLS } from "@/lib/constants";
import { useToast } from "@/components/ui/Toast";
import { useUnsavedChanges } from "@/components/ui/UnsavedChangesGuard";

interface ProfileFormProps {
  initialData: CandidateProfile | null;
  onSave: (data: CandidateProfile) => void;
  onCancel?: () => void;
  isNew?: boolean;
}

export function ProfileForm({ initialData, onSave, onCancel, isNew = false }: ProfileFormProps) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // PDF File Upload & Scan State
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeFileName, setResumeFileName] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [scanStage, setScanStage] = useState<number>(0);

  const initialValues = useMemo(() => ({
    name: initialData?.name || user?.displayName || "",
    college: initialData?.college || "",
    degree: initialData?.degree || "",
    branch: initialData?.branch || "",
    gradYear: initialData?.gradYear || "",
    githubUrl: initialData?.githubUrl || "",
    resumeUrl: initialData?.resumeUrl || "",
    resumeText: initialData?.resumeText || "",
    skills: initialData?.skills || [],
  }), [initialData, user]);

  const [formData, setFormData] = useState(initialValues);

  // ATS State
  const [analyzingAts, setAnalyzingAts] = useState(false);
  const [atsResult, setAtsResult] = useState<any>(
    initialData?.atsScore !== undefined
      ? {
          score: initialData.atsScore,
          rating: initialData.atsRating,
          summary: initialData.atsSummary,
        }
      : null
  );

  // Compute actual dirty state
  const isDirty = useMemo(() => {
    return (
      formData.name !== initialValues.name ||
      formData.college !== initialValues.college ||
      formData.degree !== initialValues.degree ||
      formData.branch !== initialValues.branch ||
      formData.gradYear !== initialValues.gradYear ||
      formData.githubUrl !== initialValues.githubUrl ||
      formData.resumeUrl !== initialValues.resumeUrl ||
      formData.resumeText !== initialValues.resumeText ||
      JSON.stringify(formData.skills) !== JSON.stringify(initialValues.skills)
    );
  }, [formData, initialValues]);

  // Derive branch options that are relevant to the currently selected degree
  const branchOptions = useMemo(() => getBranchesForDegree(formData.degree), [formData.degree]);

  const { GuardModal } = useUnsavedChanges(isDirty);

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleProcessPdfFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      setError("Only PDF resume documents (.pdf) are permitted.");
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      setError("File size exceeds 12MB limit.");
      return;
    }
    setError(null);
    setResumeFile(file);
    setResumeFileName(file.name);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleProcessPdfFile(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleProcessPdfFile(file);
  };

  const handleClearPdf = () => {
    setResumeFile(null);
    setResumeFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCheckAts = async () => {
    if (!resumeFile && (!formData.resumeText || formData.resumeText.trim().length < 30)) {
      setError("Please select a PDF resume file (.pdf) to evaluate.");
      return;
    }

    setAnalyzingAts(true);
    setError(null);
    setScanStage(1);

    const stageTimers: NodeJS.Timeout[] = [];
    stageTimers.push(setTimeout(() => setScanStage(2), 1100));
    stageTimers.push(setTimeout(() => setScanStage(3), 2200));
    stageTimers.push(setTimeout(() => setScanStage(4), 3500));
    stageTimers.push(setTimeout(() => setScanStage(5), 4700));

    const startTime = Date.now();

    try {
      const token = await user?.getIdToken(true);
      let res;
      if (resumeFile) {
        const data = new FormData();
        data.append("file", resumeFile);
        data.append("skills", JSON.stringify(formData.skills));
        res = await fetch("/api/candidate/ats-check", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: data,
        });
      } else {
        res = await fetch("/api/candidate/ats-check", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            resumeText: formData.resumeText,
            skills: formData.skills,
          }),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze resume.");
      }

      // Ensure the deep MNC screening sequence displays deliberately (minimum 5.4s)
      const elapsed = Date.now() - startTime;
      if (elapsed < 5400) {
        await new Promise((resolve) => setTimeout(resolve, 5400 - elapsed));
      }

      setAtsResult(data.result);
      if (data.extractedText && !formData.resumeText) {
        setFormData((prev) => ({ ...prev, resumeText: data.extractedText }));
      }

      addToast({
        type: "success",
        title: `ATS Screening Benchmark: ${data.result.score}/100 (${data.result.rating})`,
      });
    } catch (err: any) {
      setError(err.message || "Unable to complete enterprise ATS analysis.");
    } finally {
      stageTimers.forEach(clearTimeout);
      setAnalyzingAts(false);
      setScanStage(0);
    }
  };

  const handleSkillsChange = (newSkills: string[]) => {
    setFormData((prev) => ({ ...prev, skills: newSkills }));
  };

  const handleCancelClick = () => {
    if (isDirty) {
      setShowCancelConfirm(true);
    } else if (onCancel) {
      onCancel();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.name.trim()) {
      setError("Name is required.");
      return;
    }
    if (formData.skills.length === 0) {
      setError("Please add at least one technical skill.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updatedProfile: Partial<CandidateProfile> = {
        ...formData,
        updatedAt: Date.now(),
      };
      
      // If it's a completely new profile, set the default verification status
      if (isNew) {
        updatedProfile.verificationStatus = "draft";
        updatedProfile.projects = [];
      }

      await saveCandidateProfile(user.uid, updatedProfile);
      
      addToast({
        type: "success",
        title: "Profile saved successfully.",
      });

      onSave({
        ...(initialData || {}),
        ...updatedProfile,
      } as CandidateProfile);
    } catch (err: any) {
      setError(err.message || "Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <GuardModal />

      {/* Claude-Grade Resume Scanning & Parsing Modal Overlay with Background Blur */}
      <AnimatePresence>
        {analyzingAts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-lg bg-[#FAF8F5] border border-[#E7E2DA] shadow-2xl p-7 sm:p-8 text-center relative overflow-hidden"
            >
              {/* Animated emerald laser scan beam running across document */}
              <motion.div
                animate={{ y: [0, 240, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#064E3B] to-transparent shadow-[0_0_12px_#064E3B] pointer-events-none"
              />

              <div className="mx-auto mb-4 h-14 w-14 bg-white border border-[#E7E2DA] flex items-center justify-center relative shadow-xs">
                <FileText className="h-7 w-7 text-[#064E3B]" />
                <div className="absolute inset-0 border border-[#064E3B] animate-ping opacity-20" />
              </div>

              <div className="text-[10px] font-mono tracking-[0.2em] text-[#064E3B] uppercase mb-1 font-semibold">
                Enterprise ATS Engine · Fortune 500 Screening Protocol
              </div>
              <h3 className="font-serif text-[22px] sm:text-[26px] text-[#1C1917] font-normal mb-2">
                Auditing Technical Dossier
              </h3>
              <p className="text-[13px] text-[#78716C] font-sans mb-6 max-w-md mx-auto">
                Executing multi-pass institutional parsing against enterprise ATS benchmark standards...
              </p>

              {/* Step progression ledger */}
              <div className="bg-white border border-[#E7E2DA] p-4 sm:p-5 text-left space-y-3 font-mono text-[11px] shadow-xs">
                <div className={`flex items-center gap-2.5 transition-colors ${scanStage >= 1 ? "text-[#064E3B] font-medium" : "text-[#A8A29E]"}`}>
                  <span className="text-[12px]">{scanStage > 1 ? "✓" : "⟳"}</span>
                  <span>Document Layout: Extracting PDF AST tokens, glyphs & sections...</span>
                </div>
                <div className={`flex items-center gap-2.5 transition-colors ${scanStage >= 2 ? "text-[#064E3B] font-medium" : "text-[#A8A29E]"}`}>
                  <span className="text-[12px]">{scanStage > 2 ? "✓" : scanStage === 2 ? "⟳" : "○"}</span>
                  <span>Career Trajectory: Verifying role chronology & technical ownership...</span>
                </div>
                <div className={`flex items-center gap-2.5 transition-colors ${scanStage >= 3 ? "text-[#064E3B] font-medium" : "text-[#A8A29E]"}`}>
                  <span className="text-[12px]">{scanStage > 3 ? "✓" : scanStage === 3 ? "⟳" : "○"}</span>
                  <span>Impact Analysis: Auditing quantifiable metrics, latency & KPI density...</span>
                </div>
                <div className={`flex items-center gap-2.5 transition-colors ${scanStage >= 4 ? "text-[#064E3B] font-medium" : "text-[#A8A29E]"}`}>
                  <span className="text-[12px]">{scanStage > 4 ? "✓" : scanStage === 4 ? "⟳" : "○"}</span>
                  <span>Stack Conformance: Benchmarking skills against Tier-1 enterprise codebases...</span>
                </div>
                <div className={`flex items-center gap-2.5 transition-colors ${scanStage >= 5 ? "text-[#064E3B] font-medium" : "text-[#A8A29E]"}`}>
                  <span className="text-[12px]">{scanStage === 5 ? "⟳" : "○"}</span>
                  <span>Synthesis: Indexing candidate role matches & enterprise score...</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Local in-form cancel confirmation when clicking Cancel with unsaved edits */}
      {showCancelConfirm && (
        <div
          role="alertdialog"
          aria-modal="true"
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-6"
        >
          <div className="w-full max-w-sm bg-white rounded-2xl border border-[#E7E2DA] shadow-2xl overflow-hidden p-7">
            <h2 className="text-[18px] font-semibold text-[#1C1917] mb-2 leading-tight">
              Unsaved changes
            </h2>
            <p className="text-[14px] text-[#78716C] leading-relaxed mb-6">
              You have changes that haven&apos;t been saved. Do you want to leave without saving?
            </p>
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => setShowCancelConfirm(false)}
                className="w-full h-11 bg-[#1C1917] text-white text-[14px] font-semibold rounded-xl hover:bg-[#292524] transition-colors"
              >
                Continue Editing
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCancelConfirm(false);
                  if (onCancel) onCancel();
                }}
                className="w-full h-11 border border-[#E7E2DA] text-[#78716C] text-[14px] font-semibold rounded-xl hover:border-[#B42318] hover:text-[#B42318] transition-colors"
              >
                Leave Without Saving
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="border border-[#E7E2DA] bg-white rounded-2xl p-4 sm:p-8 space-y-6 sm:space-y-8 shadow-sm">
        <div>
          <h2 className="text-[20px] sm:text-[22px] font-semibold text-[#1C1917] mb-2">{isNew ? "Establish your identity" : "Edit your identity"}</h2>
          <p className="text-[14px] text-[#78716C] font-sans">
            This information forms the base of your verified technical record. Ensure your details are accurate.
          </p>
        </div>

        {error && (
          <div className="bg-[#FEF2F2] border border-[#B42318]/20 text-[#B42318] text-[14px] p-4 rounded-xl font-sans">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ada Lovelace"
              required
            />
            <Autocomplete
              label="Graduation Year"
              value={formData.gradYear}
              onChange={(val) => setFormData((prev) => ({ ...prev, gradYear: val }))}
              placeholder="e.g. 2024"
              options={YEARS}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Autocomplete
              label="University / College"
              value={formData.college}
              onChange={(val) => setFormData((prev) => ({ ...prev, college: val }))}
              placeholder="Type to search your university or college..."
              fetchOptions={fetchIndianColleges}
              allowManualEntry={true}
              manualEntryLabel="Custom Institution"
              manualEntryPlaceholder="Enter your university or college name"
            />
            <Autocomplete
              label="Degree"
              value={formData.degree}
              onChange={(val) => {
                // When degree changes, reset branch so user picks a relevant one
                setFormData((prev) => ({ ...prev, degree: val, branch: "" }));
              }}
              placeholder="e.g. B.Tech - Bachelor of Technology"
              options={COMMON_DEGREES}
              allowManualEntry={true}
              manualEntryLabel="Custom Degree"
              manualEntryPlaceholder="e.g. Bachelor of Technology"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Autocomplete
              label="Branch / Specialization"
              value={formData.branch}
              onChange={(val) => setFormData((prev) => ({ ...prev, branch: val }))}
              placeholder={formData.degree ? "Select branch for your degree" : "e.g. Computer Science and Engineering"}
              options={branchOptions}
              allowManualEntry={true}
              manualEntryLabel="Custom Branch"
              manualEntryPlaceholder="e.g. Computer Science"
            />
            <div className="flex flex-col justify-center">
              <span className="text-[12px] font-medium text-[#78716C] mb-1">Academic Credentials</span>
              <p className="text-[12px] text-[#78716C] leading-relaxed">
                Your university, degree, and specialization will appear on your public verification badge and employer dossier.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-[#E7E2DA]">
            <h3 className="font-semibold text-[14px] text-[#1C1917] mb-4">Technical Claims</h3>
            <div className="mb-6">
              <TagInput
                label="Skills & Domains"
                tags={formData.skills}
                onChange={handleSkillsChange}
                placeholder="React, Python, Systems Design..."
                helperText="The first skill listed will be your Primary Domain. Separate with commas or press Enter."
                options={COMMON_SKILLS}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-[#E7E2DA]">
            <h3 className="font-semibold text-[14px] text-[#1C1917] mb-4">External Evidence</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="GitHub URL"
                name="githubUrl"
                value={formData.githubUrl}
                onChange={handleChange}
                placeholder="https://github.com/username"
                type="url"
              />
              <Input
                label="External Resume / Portfolio URL"
                name="resumeUrl"
                value={formData.resumeUrl}
                onChange={handleChange}
                placeholder="https://yourwebsite.com"
                type="url"
              />
            </div>

            {/* PDF Resume Upload & Claude-Grade ATS Architecture Analyzer */}
            <div className="mt-6 border border-[#E7E2DA] bg-[#FAF8F5] rounded-2xl p-5 sm:p-7 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-4 pb-3 border-b border-[#E7E2DA]">
                <div>
                  <div className="text-[10px] font-mono tracking-[0.18em] text-[#064E3B] uppercase mb-1 font-semibold">
                    Document Telemetry & ATS Architecture
                  </div>
                  <h4 className="text-[16px] font-serif text-[#1C1917] font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#064E3B]" /> Resume PDF & Career Trajectory Parser
                  </h4>
                </div>
                <div className="text-[11px] font-mono text-[#78716C]">
                  Accepts PDF Only · Max 12MB
                </div>
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileInputChange}
                className="hidden"
              />

              {/* PDF Drag and Drop / Selection Zone */}
              {!resumeFile ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    isDragging
                      ? "border-[#064E3B] bg-[#064E3B]/[0.05]"
                      : "border-[#E7E2DA] bg-white hover:border-[#1C1917] hover:bg-[#F5F1EB]"
                  }`}
                >
                  <div className="mx-auto mb-3 h-10 w-10 bg-[#FAF8F5] border border-[#E7E2DA] rounded-lg flex items-center justify-center">
                    <UploadCloud className="h-5 w-5 text-[#064E3B]" />
                  </div>
                  <div className="text-[14px] font-serif text-[#1C1917] mb-1 font-medium">
                    Upload your technical resume (.pdf)
                  </div>
                  <p className="text-[12px] text-[#78716C] font-sans max-w-sm mx-auto">
                    Click to browse your device or drag and drop your PDF resume here for instant ATS scoring and role matching.
                  </p>
                  <span className="inline-block mt-3 text-[10px] font-mono uppercase tracking-wider text-[#064E3B] bg-[#064E3B]/10 px-2.5 py-1 border border-[#064E3B]/20">
                    PDF Document Only
                  </span>
                </div>
              ) : (
                /* Selected File Card */
                <div className="border border-[#E7E2DA] bg-white p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-[#064E3B]/10 border border-[#064E3B]/20 rounded-lg flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5 text-[#064E3B]" />
                    </div>
                    <div>
                      <div className="text-[13px] font-mono font-medium text-[#1C1917] truncate max-w-xs sm:max-w-md">
                        {resumeFileName}
                      </div>
                      <div className="text-[11px] font-mono text-[#78716C]">
                        {resumeFile ? `${(resumeFile.size / 1024).toFixed(1)} KB` : "PDF Document"} · Ready for analysis
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleClearPdf}
                      disabled={analyzingAts}
                      className="text-[11px] font-mono text-[#78716C] hover:text-[#B42318] px-2.5 py-1.5 border border-[#E7E2DA] hover:border-[#B42318]/30 transition-colors flex items-center gap-1.5 rounded"
                    >
                      <Trash2 className="h-3 w-3" />
                      Remove
                    </button>
                    <button
                      type="button"
                      onClick={handleCheckAts}
                      disabled={analyzingAts}
                      className="text-[11px] font-mono font-semibold px-3.5 py-1.5 bg-[#1C1917] hover:bg-[#064E3B] text-white transition-colors flex items-center gap-1.5 rounded tracking-[0.05em] shadow-xs"
                    >
                      <Sparkles className="h-3 w-3 text-amber-300" />
                      {analyzingAts ? "AUDITING..." : "EXECUTE ATS AUDIT"}
                    </button>
                  </div>
                </div>
              )}

              {/* Optional: manual fallback trigger */}
              <div className="mt-3 text-right">
                <button
                  type="button"
                  onClick={() => {
                    const current = formData.resumeText;
                    const promptText = prompt("Paste raw resume text or bullet points:", current);
                    if (promptText !== null) {
                      setFormData((prev) => ({ ...prev, resumeText: promptText }));
                    }
                  }}
                  className="text-[10px] font-mono text-[#78716C] hover:text-[#1C1917] underline"
                >
                  {formData.resumeText ? "Edit extracted text manually" : "Or paste resume text directly"}
                </button>
              </div>

              {/* ATS Results & Role Matching Panel */}
              {atsResult && (
                <div className="mt-6 border border-[#E7E2DA] bg-white rounded-xl p-5 sm:p-6 shadow-xs">
                  {/* Top Score Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b border-[#E7E2DA] pb-4">
                    <div className="flex items-center gap-4">
                      <div className="text-[34px] font-mono font-bold text-[#1C1917] leading-none">
                        {atsResult.score}<span className="text-[14px] text-[#78716C] font-normal">/100</span>
                      </div>
                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#78716C]">
                          ATS Screening Standard
                        </div>
                        <span className={`inline-block text-[10px] font-mono font-semibold tracking-wider uppercase px-2 py-0.5 border mt-0.5 ${
                          atsResult.score >= 80 
                            ? "bg-[#064E3B]/[0.08] text-[#064E3B] border-[#064E3B]/25" 
                            : atsResult.score >= 60 
                            ? "bg-[#FFFBEB] text-[#D97706] border-[#D97706]/30" 
                            : "bg-[#FEF2F2] text-[#B42318] border-[#B42318]/30"
                        }`}>
                          {atsResult.rating}
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] font-mono text-[#78716C]">
                      Fortune 500 Enterprise ATS Benchmark · Algorithmic Screening Protocol
                    </div>
                  </div>

                  {/* 4-Pillar Enterprise Screening Dimensions */}
                  {atsResult.dimensionScores && (
                    <div className="mb-5 bg-[#FAF8F5] border border-[#E7E2DA] p-4 rounded-xl">
                      <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#064E3B] font-semibold mb-3">
                        Enterprise Screening Metrics · Dimension Conformance
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                        <div className="bg-white border border-[#E7E2DA] p-3 rounded-lg shadow-2xs">
                          <div className="text-[20px] font-mono font-bold text-[#1C1917]">
                            {atsResult.dimensionScores.impactQuantification}%
                          </div>
                          <div className="text-[10px] font-mono text-[#78716C] uppercase tracking-wider mt-1">
                            Impact &amp; Metrics
                          </div>
                        </div>
                        <div className="bg-white border border-[#E7E2DA] p-3 rounded-lg shadow-2xs">
                          <div className="text-[20px] font-mono font-bold text-[#1C1917]">
                            {atsResult.dimensionScores.actionAgency}%
                          </div>
                          <div className="text-[10px] font-mono text-[#78716C] uppercase tracking-wider mt-1">
                            Action Agency
                          </div>
                        </div>
                        <div className="bg-white border border-[#E7E2DA] p-3 rounded-lg shadow-2xs">
                          <div className="text-[20px] font-mono font-bold text-[#1C1917]">
                            {atsResult.dimensionScores.technicalStackDepth}%
                          </div>
                          <div className="text-[10px] font-mono text-[#78716C] uppercase tracking-wider mt-1">
                            Stack Rigor
                          </div>
                        </div>
                        <div className="bg-white border border-[#E7E2DA] p-3 rounded-lg shadow-2xs">
                          <div className="text-[20px] font-mono font-bold text-[#1C1917]">
                            {atsResult.dimensionScores.atsLayoutFidelity}%
                          </div>
                          <div className="text-[10px] font-mono text-[#78716C] uppercase tracking-wider mt-1">
                            ATS Fidelity
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <p className="text-[13px] text-[#525252] leading-relaxed mb-6 font-sans">
                    {atsResult.summary}
                  </p>

                  {/* RECOMMENDED ROLES SECTION */}
                  {atsResult.recommendedRoles && atsResult.recommendedRoles.length > 0 && (
                    <div className="mb-6 border-t border-[#E7E2DA] pt-5">
                      <div className="text-[10px] font-mono tracking-[0.18em] text-[#064E3B] uppercase mb-1 font-semibold">
                        Career Trajectories &amp; Eligible Role Matches
                      </div>
                      <div className="text-[12px] font-sans text-[#78716C] mb-3">
                        Based on your extracted code skills, project depth, and engineering impact:
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {atsResult.recommendedRoles.map((roleObj: any, rIdx: number) => (
                          <div key={rIdx} className="border border-[#E7E2DA] bg-[#FAF8F5] p-3.5 rounded-lg flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <h5 className="font-serif text-[15px] font-medium text-[#1C1917]">
                                  {roleObj.role}
                                </h5>
                                <span className="text-[10px] font-mono font-semibold text-[#064E3B] bg-[#064E3B]/10 px-2 py-0.5 border border-[#064E3B]/20 shrink-0">
                                  {roleObj.matchPercentage}% MATCH
                                </span>
                              </div>
                              <div className="text-[10px] font-mono text-[#78716C] uppercase tracking-wider mb-2">
                                {roleObj.seniorLevel} Level
                              </div>
                              <p className="text-[11px] text-[#525252] font-sans leading-relaxed mb-3">
                                {roleObj.justification}
                              </p>
                            </div>

                            {roleObj.keyMatchedSkills && roleObj.keyMatchedSkills.length > 0 && (
                              <div className="flex gap-1.5 flex-wrap pt-2 border-t border-[#E7E2DA]">
                                {roleObj.keyMatchedSkills.map((sk: string) => (
                                  <span key={sk} className="text-[9px] font-mono bg-white border border-[#E7E2DA] text-[#1C1917] px-1.5 py-0.5">
                                    {sk}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Strengths and Improvements */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[12px] border-t border-[#E7E2DA] pt-5">
                    {atsResult.strengths && atsResult.strengths.length > 0 && (
                      <div className="bg-[#F0FDF4]/60 border border-[#16A34A]/25 rounded-lg p-3.5">
                        <span className="font-semibold text-[#064E3B] font-mono text-[11px] block mb-2 uppercase tracking-wider">
                          ✓ Verified Strengths
                        </span>
                        <ul className="space-y-1.5 text-[#1C1917] font-sans">
                          {atsResult.strengths.map((str: string, sIdx: number) => (
                            <li key={sIdx} className="flex items-start gap-1.5">
                              <span className="text-[#064E3B] font-mono">•</span>
                              <span>{str}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {atsResult.improvements && atsResult.improvements.length > 0 && (
                      <div className="bg-[#FFFBEB]/60 border border-[#D97706]/25 rounded-lg p-3.5">
                        <span className="font-semibold text-[#D97706] font-mono text-[11px] block mb-2 uppercase tracking-wider">
                          ⚠ High-Impact Improvements
                        </span>
                        <ul className="space-y-1.5 text-[#1C1917] font-sans">
                          {atsResult.improvements.map((imp: string, iIdx: number) => (
                            <li key={iIdx} className="flex items-start gap-1.5">
                              <span className="text-[#D97706] font-mono">•</span>
                              <span>{imp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-3 sm:gap-4 pt-6 border-t border-[#E7E2DA]">
          {!isNew && onCancel && (
            <Button type="button" variant="secondary" onClick={handleCancelClick} className="w-full sm:w-auto justify-center">
              Cancel
            </Button>
          )}
          <Button type="submit" variant="primary" loading={loading} leftIcon={<Save className="h-4 w-4" />} className="w-full sm:w-auto justify-center">
            {isNew ? "Create Profile" : "Save Changes"}
          </Button>
        </div>
      </form>
    </>
  );
}


