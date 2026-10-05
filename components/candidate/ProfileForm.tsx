import React, { useState, useMemo, useRef } from "react";
import { Save, Sparkles, FileText, CheckCircle2, UploadCloud, Trash2, ShieldCheck, RefreshCw, AlertCircle, Briefcase, MapPin, Clock, DollarSign } from "lucide-react";
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

const TARGET_ROLE_SUGGESTIONS = [
  "Full-Stack Developer",
  "Backend Engineer",
  "Frontend Engineer",
  "Software Engineer",
  "DevOps Engineer",
  "Cloud Architect",
  "Mobile Developer",
  "Data Engineer",
  "AI / Machine Learning Engineer",
  "Systems Engineer",
];

const PREFERRED_LOCATION_SUGGESTIONS = [
  "Remote",
  "Bangalore, India",
  "Hyderabad, India",
  "Pune, India",
  "Mumbai, India",
  "Delhi NCR, India",
  "Chennai, India",
  "San Francisco, USA",
  "New York, USA",
  "London, UK",
  "Singapore",
];

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
    targetRoles: initialData?.targetRoles || [],
    preferredLocations: initialData?.preferredLocations || [],
    workPreference: initialData?.workPreference || "Remote",
    availability: initialData?.availability || "Immediate (Ready to Join)",
    expectedSalary: initialData?.expectedSalary || "",
    bio: initialData?.bio || "",
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
      formData.workPreference !== initialValues.workPreference ||
      formData.availability !== initialValues.availability ||
      formData.expectedSalary !== initialValues.expectedSalary ||
      formData.bio !== initialValues.bio ||
      JSON.stringify(formData.skills) !== JSON.stringify(initialValues.skills) ||
      JSON.stringify(formData.targetRoles) !== JSON.stringify(initialValues.targetRoles) ||
      JSON.stringify(formData.preferredLocations) !== JSON.stringify(initialValues.preferredLocations)
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
          name: (!prev.name || prev.name === "Candidate" || isNew) ? (parsed.name || prev.name || "") : (prev.name || parsed.name || ""),
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
        resumeFileName: resumeFileName || initialData?.resumeFileName,
        resumeUploadedAt: resumeFile ? Date.now() : (initialData?.resumeUploadedAt || Date.now()),
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

      {/* Resume Scanner Terminal */}
      <InstitutionalResumeScanner
        isOpen={scannerOpen}
        fileName={resumeFileName || "resume.pdf"}
        parsedData={parsedProfile}
        isAnalyzing={analyzingAts}
        error={error}
        onComplete={handleScannerComplete}
        onClose={() => {
          setScannerOpen(false);
          setAnalyzingAts(false);
        }}
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
              You have unsaved changes. Do you want to discard them?
            </p>
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => setShowCancelConfirm(false)}
                className="w-full h-11 bg-[var(--color-primary)] text-white text-[13px] font-sans font-semibold uppercase tracking-wide font-semibold hover:bg-[var(--color-primary-hover)] transition-colors"
              >
                Continue Editing
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCancelConfirm(false);
                  if (onCancel) onCancel();
                }}
                className="w-full h-11 border border-[var(--color-border)] text-[var(--color-muted-foreground)] text-[13px] font-sans font-semibold uppercase tracking-wide font-semibold hover:border-[#7A3B2E] hover:text-[#7A3B2E] transition-colors"
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
          <div className="text-[10px] font-medium tracking-[0.2em] text-[#7A3B2E] uppercase font-semibold mb-1">
            Profile Setup
          </div>
          <h2 className="font-serif text-[24px] sm:text-[30px] font-semibold text-[var(--color-foreground)] leading-tight">
            {isNew ? "Create Your Profile" : "Edit Your Profile"}
          </h2>
          <p className="text-[14px] text-[var(--color-muted-foreground)] font-sans mt-1">
            Upload your resume to automatically fill in your education, skills, and details. You can review and edit everything before saving.
          </p>
        </div>

        {error && (
          <div className="bg-[#7A3B2E]/10 border border-[#7A3B2E]/30 text-[#7A3B2E] text-[13px] font-mono p-4 flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ── TOP SECTION: RESUME UPLOAD FOR AUTO-FILL ── */}
        <div className="border border-[var(--color-border)] bg-[var(--color-background)] p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[var(--color-primary)] text-white flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium tracking-[0.18em] uppercase text-[var(--color-muted-foreground)]">
                    Step 1 · Resume
                  </span>
                  <span className="text-[9px] font-medium font-semibold tracking-wider uppercase px-2 py-0.5 bg-[#7A3B2E]/15 text-[#7A3B2E] border border-[#7A3B2E]/30">
                    Required
                  </span>
                </div>
                <h3 className="font-serif text-[18px] text-[var(--color-foreground)] font-semibold mt-0.5">
                  Upload Your Resume
                </h3>
              </div>
            </div>
            <span className="text-[11px] font-mono text-[var(--color-muted-foreground)] bg-[var(--color-surface-low)] border border-[var(--color-border)] px-3 py-1 self-start sm:self-auto">
              PDF Format · Max 12MB
            </span>
          </div>

          <p className="text-[13px] text-[var(--color-muted-foreground)] mt-3 mb-4 leading-relaxed font-sans">
            We automatically read your resume to fill in your name, college, degree, graduation year, and skills below. You can change any field anytime.
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
                Click to upload or drag and drop your resume PDF here
              </div>
              <p className="text-[12px] text-[var(--color-muted-foreground)] font-mono max-w-md mx-auto">
                Automatically finds your name, university, degree, year, and skills
              </p>
              <div className="mt-3.5 inline-flex items-center gap-1.5 text-[10px] font-sans font-semibold uppercase tracking-wide text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-3 py-1 border border-[var(--color-primary)]/25">
                <Sparkles className="h-3 w-3" />
                <span>Auto-fill from resume is ready</span>
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
                      <span className="text-[9px] font-sans font-semibold uppercase tracking-wide bg-[var(--color-primary)]/15 text-[var(--color-primary)] border border-[var(--color-primary)]/30 px-2 py-0.5 shrink-0">
                        Uploaded
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-[var(--color-muted-foreground)] mt-0.5">
                      {resumeFile ? `${(resumeFile.size / 1024).toFixed(1)} KB · ` : ""}
                      {formData.skills.length} skills &amp; details filled below
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
                    {analyzingAts ? "Reading..." : "Replace Resume"}
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
                <span>✓ Details have been filled in below. Please check and adjust anything if needed before saving.</span>
              </div>

              {/* ATS Results Snapshot (if available) */}
              {atsResult && (
                <div className="border border-[var(--color-border)] bg-[var(--color-background)] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="text-[26px] font-mono font-bold text-[var(--color-foreground)]">
                      {atsResult.score}<span className="text-[12px] text-[var(--color-muted-foreground)] font-normal">/100</span>
                    </div>
                    <div>
                      <div className="text-[9px] font-medium uppercase tracking-[0.16em] text-[var(--color-muted-foreground)]">
                        Resume Score
                      </div>
                      <span className="text-[10px] font-medium font-semibold tracking-wider uppercase text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2 py-0.5 border border-[var(--color-primary)]/20">
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
            <span className="text-[10px] font-medium tracking-[0.18em] uppercase text-[var(--color-muted-foreground)] font-semibold">
              Step 2 · Your Details
            </span>
            <h3 className="font-serif text-[18px] sm:text-[20px] text-[var(--color-foreground)] font-semibold mt-0.5">
              Review Your Information
            </h3>
            <p className="text-[13px] text-[var(--color-muted-foreground)] font-sans">
              Check your profile details below. You can change any information anytime.
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
                manualEntryLabel="Custom College"
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
                label="Branch / Major"
                value={formData.branch}
                onChange={(val) => setFormData((prev) => ({ ...prev, branch: val }))}
                placeholder={formData.degree ? "Select branch for your degree" : "e.g. Computer Science and Engineering"}
                options={branchOptions}
                allowManualEntry={true}
                manualEntryLabel="Custom Branch"
                manualEntryPlaceholder="e.g. Computer Science"
              />
              <div className="flex flex-col justify-center bg-[var(--color-background)] border border-[var(--color-border)] p-4">
                <span className="text-[10px] font-sans font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)] mb-1">
                  Public Profile Note
                </span>
                <p className="text-[12px] text-[var(--color-foreground)] leading-relaxed font-sans">
                  Your university, degree, and branch will appear on your public profile for recruiters to see.
                </p>
              </div>
            </div>

            {/* Skills */}
            <div className="pt-3 border-t border-[var(--color-border)]">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-serif text-[16px] text-[var(--color-foreground)] font-semibold">
                  Technical Skills
                </h4>
                <span className="text-[10px] font-mono text-[var(--color-muted-foreground)]">
                  {formData.skills.length} skills added
                </span>
              </div>
              <p className="text-[12px] text-[var(--color-muted-foreground)] mb-4 font-sans">
                These skills were found from your resume. You can take short tests to earn verified badges on them.
              </p>
              <div className="mb-6">
                <TagInput
                  label="Skills"
                  tags={formData.skills}
                  onChange={handleSkillsChange}
                  placeholder="React, Python, Systems Design..."
                  helperText="The first skill listed will be your primary focus. Separate with commas or press Enter."
                  options={COMMON_SKILLS}
                />
              </div>
            </div>

            {/* Targeted Roles & Career Preferences */}
            <div className="pt-3 border-t border-[var(--color-border)]">
              <div className="flex items-center gap-2 mb-1">
                <Briefcase className="h-4 w-4 text-[var(--color-primary)]" />
                <h4 className="font-serif text-[16px] text-[var(--color-foreground)] font-semibold">
                  Targeted Roles &amp; Career Preferences
                </h4>
              </div>
              <p className="text-[12px] text-[var(--color-muted-foreground)] mb-4 font-sans">
                Tell prospective employers the exact engineering roles, locations, and working models you are targeting.
              </p>

              <div className="space-y-5">
                {/* Targeted Roles */}
                <div>
                  <TagInput
                    label="Targeted Job Roles"
                    tags={formData.targetRoles}
                    onChange={(tags) => setFormData((prev) => ({ ...prev, targetRoles: tags }))}
                    placeholder="e.g. Full-Stack Developer, Backend Engineer, DevOps..."
                    helperText="Specify the roles you are best suited for. Separate with commas or press Enter."
                    options={TARGET_ROLE_SUGGESTIONS}
                  />
                </div>

                {/* Preferred Locations */}
                <div>
                  <TagInput
                    label="Preferred Work Locations"
                    tags={formData.preferredLocations}
                    onChange={(tags) => setFormData((prev) => ({ ...prev, preferredLocations: tags }))}
                    placeholder="e.g. Remote, Bangalore, Hyderabad, Pune..."
                    helperText="Where are you willing or eager to work? (Includes Remote)"
                    options={PREFERRED_LOCATION_SUGGESTIONS}
                  />
                </div>

                {/* Work Preference, Availability, and Expected Compensation */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-[11px] font-sans font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)] mb-1.5">
                      Work Preference
                    </label>
                    <select
                      name="workPreference"
                      value={formData.workPreference}
                      onChange={(e) => setFormData((prev) => ({ ...prev, workPreference: e.target.value as any }))}
                      className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-background)] text-[13px] text-[var(--color-foreground)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--color-foreground)]"
                    >
                      <option value="Remote">Remote Only</option>
                      <option value="Hybrid">Hybrid (Flexible)</option>
                      <option value="On-site">On-site (Office)</option>
                      <option value="Flexible">Flexible / Open to All</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-sans font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)] mb-1.5">
                      Notice / Availability
                    </label>
                    <select
                      name="availability"
                      value={formData.availability}
                      onChange={(e) => setFormData((prev) => ({ ...prev, availability: e.target.value }))}
                      className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-background)] text-[13px] text-[var(--color-foreground)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--color-foreground)]"
                    >
                      <option value="Immediate (Ready to Join)">Immediate (Ready to Join)</option>
                      <option value="15 Days Notice">15 Days Notice</option>
                      <option value="30 Days (1 Month)">30 Days (1 Month)</option>
                      <option value="60 Days (2 Months)">60 Days (2 Months)</option>
                      <option value="Summer Internship">Summer Internship</option>
                      <option value="Graduating Senior (Class of 2026)">Graduating Senior (Class of 2026)</option>
                    </select>
                  </div>

                  <div>
                    <Input
                      label="Expected Compensation (Optional)"
                      name="expectedSalary"
                      value={formData.expectedSalary}
                      onChange={handleChange}
                      placeholder="e.g. ₹8 - 12 LPA or $90k/yr"
                    />
                  </div>
                </div>

                {/* Professional Bio */}
                <div>
                  <label className="block text-[11px] font-sans font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)] mb-1.5">
                    Professional Headline / Engineering Focus
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Brief 1-2 sentence engineering focus e.g. Full-Stack TypeScript & Go engineer passionate about scalable backend systems and high-performance web applications."
                    className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-background)] text-[13px] text-[var(--color-foreground)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--color-foreground)] leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* External Links */}
            <div className="pt-3 border-t border-[var(--color-border)]">
              <h4 className="font-serif text-[16px] text-[var(--color-foreground)] font-semibold mb-1">
                Links &amp; Portfolio
              </h4>
              <p className="text-[12px] text-[var(--color-muted-foreground)] mb-4 font-sans">
                Add links to your GitHub or personal portfolio website.
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
                  label="Portfolio / Personal Website URL"
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
                Please upload your resume in Step 1 to continue.
              </span>
            ) : (
              <span className="text-[var(--color-primary)] flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                Resume uploaded · Ready to save profile.
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
              {isNew ? "Create Profile" : "Save Changes"}
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}
