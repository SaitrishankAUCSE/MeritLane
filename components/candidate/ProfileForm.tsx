import React, { useState, useMemo, useRef } from "react";
import { Save, Sparkles, FileText, CheckCircle2, UploadCloud, Trash2, ShieldCheck, RefreshCw, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { TagInput } from "@/components/ui/TagInput";
import { CandidateProfile, saveCandidateProfile } from "@/lib/firebase/candidate";
import { useAuth } from "@/lib/auth/AuthContext";
import { Autocomplete } from "@/components/ui/Autocomplete";
import { COMMON_DEGREES, getBranchesForDegree, YEARS, fetchIndianColleges, COMMON_SKILLS } from "@/lib/constants";
import { useToast } from "@/components/ui/Toast";
import { useUnsavedChanges } from "@/components/ui/UnsavedChangesGuard";
import { InstitutionalResumeScanner } from "@/components/candidate/InstitutionalResumeScanner";
import { ParsedResumeProfile } from "@/lib/resume/parser";

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
  const [resumeFileName, setResumeFileName] = useState<string>(initialData?.resumeUrl ? "Existing Resume Document" : "");
  const [isDragging, setIsDragging] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [parsedProfile, setParsedProfile] = useState<ParsedResumeProfile | null>(null);
  const pendingParseDataRef = useRef<any>(null);

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

  // Check if a resume is present (either newly uploaded or already extracted)
  const hasResume = Boolean(
    resumeFile ||
    (formData.resumeText && formData.resumeText.trim().length > 30) ||
    initialData?.resumeUrl ||
    initialData?.resumeText
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

  // Immediate upload & parse upon file selection
  const autoParseResume = async (file: File) => {
    setScannerOpen(true);
    setAnalyzingAts(true);
    setError(null);
    setParsedProfile(null);
    pendingParseDataRef.current = null;

    try {
      const token = await user?.getIdToken(true);
      const data = new FormData();
      data.append("file", file);
      data.append("skills", JSON.stringify(formData.skills));

      const res = await fetch("/api/candidate/ats-check", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Failed to parse resume.");
      }

      pendingParseDataRef.current = resData;
      if (resData.parsed) {
        setParsedProfile(resData.parsed);
      }
    } catch (err: any) {
      console.error("Resume auto-parse error:", err);
      setError(err.message || "Unable to complete institutional resume parsing.");
      setScannerOpen(false);
      setAnalyzingAts(false);
    }
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
    // Immediately start automated parsing and auto-fill
    autoParseResume(file);
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

  const handleScannerComplete = () => {
    setScannerOpen(false);
    setAnalyzingAts(false);

    const data = pendingParseDataRef.current;
    if (!data) return;

    const parsed: ParsedResumeProfile | undefined = data.parsed;
    const result = data.result;
    const extractedText = data.extractedText;

    if (parsed) {
      setFormData((prev) => {
        // Merge skills without duplicates
        const currentSkills = new Set(prev.skills);
        (parsed.skills || []).forEach((s) => {
          if (s && typeof s === "string") currentSkills.add(s.trim());
        });

        return {
          ...prev,
          name: (!prev.name || prev.name === "Candidate" || isNew) ? (parsed.name || prev.name) : (prev.name || parsed.name),
          college: parsed.college || prev.college,
          degree: parsed.degree || prev.degree,
          branch: parsed.branch || prev.branch,
          gradYear: parsed.gradYear || prev.gradYear,
          githubUrl: parsed.githubUrl || prev.githubUrl,
          skills: Array.from(currentSkills),
          resumeText: extractedText || prev.resumeText,
        };
      });
    }

    if (result) {
      setAtsResult(result);
    }

    addToast({
      type: "success",
      title: `Resume parsed: ${parsed?.skills?.length || 0} skills & academic profile auto-populated below.`,
    });
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

    // MANDATORY RESUME UPLOAD CHECK
    if (!hasResume) {
      setError("Resume is mandatory. Please upload your technical resume (.pdf) above so your profile can be filled and verified.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!formData.name.trim()) {
      setError("Full Name is required.");
      return;
    }
    if (formData.skills.length === 0) {
      setError("Please confirm or declare at least one technical skill.");
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
        title: "Candidate record saved successfully.",
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

      {/* Institutional Resume Scanner & Decompiler Terminal */}
      <InstitutionalResumeScanner
        isOpen={scannerOpen}
        fileName={resumeFileName || "resume.pdf"}
        parsedData={parsedProfile}
        onComplete={handleScannerComplete}
      />

      {/* Local in-form cancel confirmation */}
      {showCancelConfirm && (
        <div
          role="alertdialog"
          aria-modal="true"
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-xs p-6"
        >
          <div className="w-full max-w-sm bg-[var(--color-background)] border border-[var(--color-border)] shadow-2xl p-7">
            <h2 className="text-[18px] font-serif font-semibold text-[var(--color-foreground)] mb-2 leading-tight">
              Unsaved Changes
            </h2>
            <p className="text-[14px] text-[var(--color-muted-foreground)] leading-relaxed mb-6 font-sans">
              You have modifications that have not been committed to your candidate record. Do you wish to discard them?
            </p>
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => setShowCancelConfirm(false)}
                className="w-full h-11 bg-[var(--color-primary)] text-white text-[13px] font-mono uppercase tracking-wider font-semibold hover:bg-[var(--color-primary-hover)] transition-colors"
              >
                Continue Editing
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCancelConfirm(false);
                  if (onCancel) onCancel();
                }}
                className="w-full h-11 border border-[var(--color-border)] text-[var(--color-muted-foreground)] text-[13px] font-mono uppercase tracking-wider font-semibold hover:border-[#7A3B2E] hover:text-[#7A3B2E] transition-colors"
              >
                Discard &amp; Exit
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="border border-[var(--color-border)] bg-[var(--color-surface-low)] p-6 sm:p-10 space-y-8 shadow-xs">
        {/* Page Header */}
        <div className="border-b border-[var(--color-border)] pb-5">
          <div className="text-[10px] font-mono tracking-[0.2em] text-[#7A3B2E] uppercase font-semibold mb-1">
            Institutional Attestation Protocol
          </div>
          <h2 className="font-serif text-[24px] sm:text-[30px] font-semibold text-[var(--color-foreground)] leading-tight">
            {isNew ? "Establish Candidate Identity Record" : "Edit Candidate Identity Record"}
          </h2>
          <p className="text-[14px] text-[var(--color-muted-foreground)] font-sans mt-1">
            This information forms the verified basis of your technical record. Upload your official resume to automatically populate your credentials and claimed capabilities.
          </p>
        </div>

        {error && (
          <div className="bg-[#7A3B2E]/10 border border-[#7A3B2E]/30 text-[#7A3B2E] text-[13px] font-mono p-4 flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ── TOP SECTION: MANDATORY RESUME UPLOAD FOR AUTO-FILL ── */}
        <div className="border border-[var(--color-border)] bg-[var(--color-background)] p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[var(--color-primary)] text-white flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono tracking-[0.18em] uppercase text-[var(--color-muted-foreground)]">
                    Step 01 · Ingestion Engine
                  </span>
                  <span className="text-[9px] font-mono font-semibold tracking-wider uppercase px-2 py-0.5 bg-[#7A3B2E]/15 text-[#7A3B2E] border border-[#7A3B2E]/30">
                    Mandatory
                  </span>
                </div>
                <h3 className="font-serif text-[18px] text-[var(--color-foreground)] font-semibold mt-0.5">
                  Official Technical Resume Upload
                </h3>
              </div>
            </div>
            <span className="text-[11px] font-mono text-[var(--color-muted-foreground)] bg-[var(--color-surface-low)] border border-[var(--color-border)] px-3 py-1 self-start sm:self-auto">
              PDF Format · Max 12MB
            </span>
          </div>

          <p className="text-[13px] text-[var(--color-muted-foreground)] mt-3 mb-4 leading-relaxed font-sans">
            Your resume is parsed to automatically fill your name, college, degree, graduation year, and technical skills into the record below. All fields remain fully editable for verification.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {!resumeFile && !formData.resumeText ? (
            /* Upload Dropzone */
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                  : "border-[var(--color-border)] bg-[var(--color-surface-low)] hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-mid)]/30"
              }`}
            >
              <div className="mx-auto mb-3 h-12 w-12 bg-[var(--color-background)] border border-[var(--color-border)] flex items-center justify-center">
                <UploadCloud className="h-6 w-6 text-[var(--color-primary)]" />
              </div>
              <div className="font-serif text-[16px] text-[var(--color-foreground)] font-semibold mb-1">
                Click to browse or drop your official resume PDF here
              </div>
              <p className="text-[12px] text-[var(--color-muted-foreground)] font-mono max-w-md mx-auto">
                Auto-extracts name, university, degree, cohort, and capabilities directly into the fields below
              </p>
              <div className="mt-3.5 inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-3 py-1 border border-[var(--color-primary)]/25">
                <Sparkles className="h-3 w-3" />
                <span>Immediate Auto-Parse &amp; Auto-Fill Active</span>
              </div>
            </div>
          ) : (
            /* Resume Successfully Ingested Card */
            <div className="space-y-4">
              <div className="border border-[var(--color-border)] bg-[var(--color-surface-low)] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-[var(--color-primary)]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-mono font-semibold text-[var(--color-foreground)] truncate max-w-xs sm:max-w-md">
                        {resumeFileName || "Uploaded Resume.pdf"}
                      </span>
                      <span className="text-[9px] font-mono uppercase tracking-wider bg-[var(--color-primary)]/15 text-[var(--color-primary)] border border-[var(--color-primary)]/30 px-2 py-0.5 shrink-0">
                        Parsed &amp; Ingested
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-[var(--color-muted-foreground)] mt-0.5">
                      {resumeFile ? `${(resumeFile.size / 1024).toFixed(1)} KB · ` : ""}
                      {formData.skills.length} skills &amp; academic credentials auto-populated below
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={analyzingAts}
                    className="text-[11px] font-mono font-semibold text-[var(--color-foreground)] hover:text-[var(--color-primary)] px-3 py-1.5 border border-[var(--color-border)] bg-[var(--color-background)] hover:bg-[var(--color-surface-mid)] transition-colors flex items-center gap-1.5"
                  >
                    <RefreshCw className={`h-3 w-3 ${analyzingAts ? "animate-spin" : ""}`} />
                    {analyzingAts ? "Re-parsing..." : "Replace Resume"}
                  </button>
                  <button
                    type="button"
                    onClick={handleClearPdf}
                    disabled={analyzingAts}
                    className="text-[11px] font-mono text-[#7A3B2E] hover:text-[#52251D] px-2.5 py-1.5 border border-[#7A3B2E]/30 hover:bg-[#7A3B2E]/10 transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    Remove
                  </button>
                </div>
              </div>

              {/* Informative Banner */}
              <div className="bg-[var(--color-surface-mid)]/40 border-l-2 border-[var(--color-primary)] p-3 text-[12px] font-mono text-[var(--color-foreground)] flex items-center justify-between">
                <span>✓ Extracted credentials have been automatically populated below. Review and adjust any details before saving.</span>
              </div>

              {/* ATS Results Snapshot (if available) */}
              {atsResult && (
                <div className="border border-[var(--color-border)] bg-[var(--color-background)] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="text-[26px] font-mono font-bold text-[var(--color-foreground)]">
                      {atsResult.score}<span className="text-[12px] text-[var(--color-muted-foreground)] font-normal">/100</span>
                    </div>
                    <div>
                      <div className="text-[9px] font-mono uppercase tracking-[0.16em] text-[var(--color-muted-foreground)]">
                        ATS Architecture Rating
                      </div>
                      <span className="text-[10px] font-mono font-semibold tracking-wider uppercase text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2 py-0.5 border border-[var(--color-primary)]/20">
                        {atsResult.rating}
                      </span>
                    </div>
                  </div>
                  <div className="text-[11px] font-mono text-[var(--color-muted-foreground)] max-w-sm">
                    {atsResult.summary}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── STEP 2: REVIEW & COMPLETE EXTRACTED PROFILE DETAILS ── */}
        <div className="pt-2 border-t border-[var(--color-border)]">
          <div className="mb-6">
            <span className="text-[10px] font-mono tracking-[0.18em] uppercase text-[var(--color-muted-foreground)] font-semibold">
              Step 02 · Credential Attestation
            </span>
            <h3 className="font-serif text-[18px] sm:text-[20px] text-[var(--color-foreground)] font-semibold mt-0.5">
              Review &amp; Verify Extracted Information
            </h3>
            <p className="text-[13px] text-[var(--color-muted-foreground)] font-sans">
              Confirm your candidate details below. All fields can be adjusted manually if needed.
            </p>
          </div>

          <div className="space-y-6">
            {/* Name & Cohort */}
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
                placeholder="e.g. 2026"
                options={YEARS}
              />
            </div>

            {/* University & Degree */}
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
                  setFormData((prev) => ({ ...prev, degree: val, branch: "" }));
                }}
                placeholder="e.g. B.Tech - Bachelor of Technology"
                options={COMMON_DEGREES}
                allowManualEntry={true}
                manualEntryLabel="Custom Degree"
                manualEntryPlaceholder="e.g. Bachelor of Technology"
              />
            </div>

            {/* Branch & Notice */}
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
              <div className="flex flex-col justify-center bg-[var(--color-background)] border border-[var(--color-border)] p-4">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-muted-foreground)] mb-1">
                  Public Attestation Note
                </span>
                <p className="text-[12px] text-[var(--color-foreground)] leading-relaxed font-sans">
                  Your university, degree, and specialization will appear on your public verification badge and employer dossier.
                </p>
              </div>
            </div>

            {/* Skills */}
            <div className="pt-3 border-t border-[var(--color-border)]">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-serif text-[16px] text-[var(--color-foreground)] font-semibold">
                  Extracted Technical Capabilities
                </h4>
                <span className="text-[10px] font-mono text-[var(--color-muted-foreground)]">
                  {formData.skills.length} skills registered
                </span>
              </div>
              <p className="text-[12px] text-[var(--color-muted-foreground)] mb-4 font-sans">
                These capabilities were extracted from your resume. Each skill can be verified through our proctored assessment suite.
              </p>
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

            {/* External Links */}
            <div className="pt-3 border-t border-[var(--color-border)]">
              <h4 className="font-serif text-[16px] text-[var(--color-foreground)] font-semibold mb-1">
                External Evidence Repositories
              </h4>
              <p className="text-[12px] text-[var(--color-muted-foreground)] mb-4 font-sans">
                Provide external links to substantiate your software provenance.
              </p>
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
                  label="Portfolio / External Website URL"
                  name="resumeUrl"
                  value={formData.resumeUrl}
                  onChange={handleChange}
                  placeholder="https://yourwebsite.com"
                  type="url"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-[var(--color-border)]">
          <div className="text-[11px] font-mono text-[var(--color-muted-foreground)]">
            {!hasResume ? (
              <span className="text-[#7A3B2E] flex items-center gap-1.5 font-semibold">
                <AlertCircle className="h-3.5 w-3.5" />
                Resume upload is required in Step 01 to proceed.
              </span>
            ) : (
              <span className="text-[var(--color-primary)] flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                Resume ingested · Ready to establish identity record.
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!isNew && onCancel && (
              <Button type="button" variant="secondary" onClick={handleCancelClick} className="w-full sm:w-auto justify-center">
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={!hasResume}
              leftIcon={<Save className="h-4 w-4" />}
              className="w-full sm:w-auto justify-center"
            >
              {isNew ? "Create Candidate Record" : "Save Changes"}
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}
