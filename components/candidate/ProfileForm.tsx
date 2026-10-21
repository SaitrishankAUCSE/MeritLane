import React, { useState, useMemo, useRef, useEffect } from "react";
import { Save, Sparkles, FileText, CheckCircle2, UploadCloud, Trash2, ShieldCheck, RefreshCw, AlertCircle, Briefcase, MapPin, Clock, DollarSign, Camera } from "lucide-react";
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
import { CandidateAvatar } from "@/components/ui/CandidateAvatar";

import { ALL_LOCATIONS } from "@/lib/locations";

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
  "Associate Software Developer",
  "Python Developer",
  "Java Developer",
  "React Developer",
  "Machine Learning Engineer",
  "QA / Test Automation Engineer",
  "Security Engineer",
  "Site Reliability Engineer (SRE)",
];

const PREFERRED_LOCATION_SUGGESTIONS = ALL_LOCATIONS;

function formatProfessionalError(err: any): string {
  if (!err) return "Unable to save profile changes. Please verify your details and try again.";
  const msg = typeof err === "string" ? err : err.message || "";

  if (msg.includes("Unsupported field value: undefined") || msg.includes("Function setDoc()")) {
    return "Some profile information could not be processed. Please review your entries and try saving again.";
  }
  if (msg.includes("permission-denied") || msg.includes("insufficient permissions")) {
    return "You do not currently have permission to update this profile. Please ensure you are signed in.";
  }
  if (msg.includes("network-request-failed") || msg.includes("failed-precondition") || msg.includes("offline")) {
    return "A network connectivity issue occurred. Please check your internet connection and try again.";
  }
  if (msg.includes("auth/") || msg.includes("invalid-credential")) {
    return "Your session may have expired. Please sign in again to save your profile.";
  }
  if (msg.toLowerCase().includes("quota")) {
    return "The service is temporarily experiencing high demand. Please try again in a few moments.";
  }
  if (msg.includes("FirebaseError:") || msg.includes("Error:") || msg.includes("at ")) {
    return "Unable to save profile changes at this time. Please review your details and try again.";
  }
  return msg;
}

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

  // Avatar Upload State (Instagram-style)
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [isProcessingAvatar, setIsProcessingAvatar] = useState(false);
  const [showPhotoActionSheet, setShowPhotoActionSheet] = useState(false);

  // PDF File Upload & Scan State
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeFileName, setResumeFileName] = useState<string>(
    initialData?.resumeFileName || (initialData?.resumeUrl ? "Candidate_Resume.pdf" : "")
  );
  const [isDragging, setIsDragging] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [parsedProfile, setParsedProfile] = useState<ParsedResumeProfile | null>(null);
  const pendingParseDataRef = useRef<any>(null);

  useEffect(() => {
    if (initialData?.resumeFileName) {
      setResumeFileName(initialData.resumeFileName);
    }
  }, [initialData?.resumeFileName]);

  const initialValues = useMemo(() => ({
    name: initialData?.name || user?.displayName || "",
    avatarUrl: initialData?.avatarUrl || user?.photoURL || "",
    college: initialData?.college || "",
    degree: initialData?.degree || "",
    branch: initialData?.branch || "",
    gradYear: initialData?.gradYear || "",
    githubUrl: initialData?.githubUrl || "",
    linkedinUrl: initialData?.linkedinUrl || "",
    portfolioUrl: initialData?.portfolioUrl || (initialData?.resumeUrl && (initialData.resumeUrl.includes("portfolio") || initialData.resumeUrl.includes("vercel.app") || !initialData.resumeUrl.toLowerCase().includes(".pdf")) ? initialData.resumeUrl : "") || "",
    resumeUrl: (initialData?.resumeUrl && !initialData.resumeUrl.includes("portfolio") && !initialData.resumeUrl.includes("vercel.app")) ? initialData.resumeUrl : "",
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
      formData.linkedinUrl !== initialValues.linkedinUrl ||
      formData.portfolioUrl !== initialValues.portfolioUrl ||
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
      const token = await user?.getIdToken();
      const data = new FormData();
      data.append("file", file);
      data.append("fileName", file.name);
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
      setError(err.message || "Unable to complete resume parsing.");
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

  // Instagram-style client image compressor (square center crop 256x256 WebP/JPEG <40KB)
  const processImageFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const size = 256;
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Unable to create canvas context"));
            return;
          }

          const minDim = Math.min(img.width, img.height);
          const startX = (img.width - minDim) / 2;
          const startY = (img.height - minDim) / 2;

          ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, size, size);

          try {
            const dataUrl = canvas.toDataURL("image/webp", 0.85);
            resolve(dataUrl);
          } catch {
            const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
            resolve(dataUrl);
          }
        };
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      addToast({
        type: "error",
        title: "Invalid file type",
        description: "Please choose an image file (PNG, JPG, JPEG, or WebP).",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      addToast({
        type: "error",
        title: "File too large",
        description: "Profile image must be under 10MB.",
      });
      return;
    }

    setIsProcessingAvatar(true);
    try {
      const compressedDataUrl = await processImageFile(file);
      setFormData((prev) => ({ ...prev, avatarUrl: compressedDataUrl }));
      setShowPhotoActionSheet(false);
      addToast({
        type: "success",
        title: "Profile photo updated",
        description: "Your new profile picture is ready.",
      });
    } catch (err: any) {
      console.error("Avatar upload failed:", err);
      addToast({
        type: "error",
        title: "Processing error",
        description: err.message || "Failed to process image.",
      });
    } finally {
      setIsProcessingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  const handleRemoveAvatar = () => {
    setFormData((prev) => ({ ...prev, avatarUrl: "" }));
    setShowPhotoActionSheet(false);
    addToast({
      type: "info",
      title: "Photo removed",
      description: "Avatar reset to initials monogram.",
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
        avatarUrl: formData.avatarUrl || "",
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

      // Sync users doc in Firestore and auth photoURL
      if (user) {
        try {
          const { doc, setDoc } = await import("firebase/firestore");
          const { db } = await import("@/lib/firebase/config");
          await setDoc(doc(db, "users", user.uid), {
            avatarUrl: formData.avatarUrl || "",
            photoURL: formData.avatarUrl || "",
          }, { merge: true });
        } catch {}

        // Notify admin of any custom or unlisted skills entered by candidate
        if (formData.skills && formData.skills.length > 0) {
          fetch("/api/candidate/new-skills", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              uid: user.uid,
              name: formData.name,
              email: user.email || initialData?.email || "",
              phone: initialData?.phone || "",
              college: formData.college || "",
              branch: formData.branch || "",
              gradYear: formData.gradYear || "",
              githubUrl: formData.githubUrl || "",
              resumeUrl: formData.resumeUrl || initialData?.resumeUrl || "",
              bio: formData.bio || "",
              candidateKey: initialData?.candidateKey || "",
              skills: formData.skills,
            }),
          }).catch((err) => console.warn("Failed to notify new skills:", err));
        }
      }

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("meritlane_current_candidate", JSON.stringify({
            name: formData.name,
            avatarUrl: formData.avatarUrl || "",
          }));
          window.dispatchEvent(
            new CustomEvent("meritlane-profile-updated", {
              detail: {
                name: formData.name,
                avatarUrl: formData.avatarUrl || "",
              },
            })
          );
        } catch {}
      }
      
      addToast({
        type: "success",
        title: "Profile saved successfully.",
      });

      onSave({
        ...(initialData || {}),
        ...updatedProfile,
      } as CandidateProfile);
    } catch (err: any) {
      setError(formatProfessionalError(err));
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
          <div className="w-full max-w-sm bg-white border border-black/[0.08] rounded-2xl shadow-2xl p-7">
            <h2 className="text-[18px] font-semibold text-[#101010] mb-2 leading-tight tracking-[-0.01em]">
              Unsaved Changes
            </h2>
            <p className="text-[13px] text-[#737373] leading-relaxed mb-6 font-sans">
              You have unsaved changes. Do you want to discard them?
            </p>
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => setShowCancelConfirm(false)}
                className="w-full h-11 rounded-full bg-[#101010] hover:bg-black/90 text-white text-xs font-medium transition-all shadow-xs"
              >
                Continue Editing
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCancelConfirm(false);
                  if (onCancel) onCancel();
                }}
                className="w-full h-11 rounded-full border border-black/[0.12] bg-white text-[#101010] hover:bg-black/[0.04] text-xs font-medium transition-all"
              >
                Discard &amp; Exit
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Welcome Callout for New Users */}
        {isNew && (
          <div className="bg-[#FAFAF9] border border-black/[0.08] rounded-2xl p-5 flex items-start gap-4 shadow-xs animate-in fade-in duration-200">
            <div className="h-10 w-10 rounded-xl bg-[#101010] text-white flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[14px] font-semibold text-[#101010] font-sans">
                  Step 1 of 4: Activate Your Candidate Dossier
                </span>
                <span className="text-[10px] font-medium uppercase tracking-wider bg-black/[0.04] text-[#101010] border border-black/[0.08] px-2.5 py-0.5 rounded-full">
                  Zero Experience Bias
                </span>
              </div>
              <p className="text-[13px] text-[#737373] leading-relaxed font-sans">
                MeritLane is built to help freshers and aspiring developers bypass the 0-2 year experience paradox. Upload your resume PDF below or fill in your details to activate your profile, unlock proctored skill tests, and let your actual code land interviews.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 p-4.5 rounded-xl flex items-start gap-3.5 text-red-700 shadow-xs animate-in fade-in duration-150">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-[13px] font-sans leading-relaxed">
              <p className="font-semibold text-red-800 mb-0.5">Profile Update Notice</p>
              <p className="text-red-700 font-normal">{error}</p>
            </div>
          </div>
        )}

        {/* ── TOP SECTION: RESUME UPLOAD FOR AUTO-FILL ── */}
        <div className="rounded-2xl border border-black/[0.08] bg-white p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-black/[0.04] border border-black/[0.08] text-[#101010] flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium tracking-[0.16em] uppercase text-[#737373]">
                    Step 1 · Resume
                  </span>
                  <span className="text-[9px] font-medium font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-black/[0.04] text-[#101010] border border-black/[0.08]">
                    Required
                  </span>
                </div>
                <h3 className="text-[18px] text-[#101010] font-semibold tracking-[-0.01em] mt-0.5">
                  Upload Your Resume
                </h3>
              </div>
            </div>
            <span className="text-[11px] font-mono text-[#737373] bg-[#FAFAF9] border border-black/[0.06] px-3 py-1 rounded-full self-start sm:self-auto">
              PDF Format · Max 12MB
            </span>
          </div>

          <p className="text-[13px] text-[#737373] mt-3 mb-4 leading-relaxed font-sans">
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
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? "border-[#101010] bg-black/[0.02]"
                  : "border-black/[0.12] bg-[#FAFAF9] hover:border-black/30 hover:bg-black/[0.02]"
              }`}
            >
              <div className="mx-auto mb-3 h-12 w-12 rounded-xl bg-white border border-black/[0.08] flex items-center justify-center">
                <UploadCloud className="h-6 w-6 text-[#101010]" />
              </div>
              <div className="text-[16px] text-[#101010] font-semibold mb-1">
                Click to upload or drag and drop your resume PDF here
              </div>
              <p className="text-[12px] text-[#737373] font-mono max-w-md mx-auto">
                Automatically finds your name, university, degree, year, and skills
              </p>
              <div className="mt-3.5 inline-flex items-center gap-1.5 text-[10px] font-sans font-semibold uppercase tracking-wide text-[#101010] bg-black/[0.04] px-3 py-1 rounded-full border border-black/[0.08]">
                <Sparkles className="h-3 w-3" />
                <span>Auto-fill from resume is ready</span>
              </div>
            </div>
          ) : (
            /* Resume Successfully Ingested Card */
            <div className="space-y-4">
              <div className="rounded-2xl border border-black/[0.08] bg-[#FAFAF9] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-black/[0.04] border border-black/[0.08] flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-emerald-700" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-mono font-semibold text-[#101010] truncate max-w-xs sm:max-w-md">
                        {resumeFileName || "Uploaded Resume.pdf"}
                      </span>
                      <span className="text-[10px] font-mono font-medium uppercase tracking-wide bg-emerald-500/10 text-emerald-800 border border-emerald-500/20 px-2.5 py-0.5 rounded-full shrink-0">
                        Uploaded
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-[#737373] mt-0.5">
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
                    className="rounded-full border border-black/[0.12] bg-white hover:bg-black/[0.04] text-[#101010] text-xs font-medium px-4 py-2 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className={`h-3 w-3 ${analyzingAts ? "animate-spin" : ""}`} />
                    {analyzingAts ? "Reading..." : "Replace Resume"}
                  </button>
                  <button
                    type="button"
                    onClick={handleClearPdf}
                    disabled={analyzingAts}
                    className="rounded-full border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium px-3.5 py-2 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3" />
                    Remove
                  </button>
                </div>
              </div>

              {/* Informative Banner */}
              <div className="bg-[#FAFAF9] border border-black/[0.06] rounded-xl p-3.5 text-[12px] font-mono text-[#525252] flex items-center justify-between">
                <span>✓ Details have been filled in below. Please check and adjust anything if needed before saving.</span>
              </div>

              {/* ATS Results Snapshot (if available) */}
              {atsResult && (
                <div className="rounded-2xl border border-black/[0.08] bg-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="text-[26px] font-mono font-bold text-[#101010]">
                      {atsResult.score}<span className="text-[12px] text-[#737373] font-normal">/100</span>
                    </div>
                    <div>
                      <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#737373]">
                        Resume Score
                      </div>
                      <span className="text-[10px] font-medium uppercase text-emerald-800 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                        {atsResult.rating}
                      </span>
                    </div>
                  </div>
                  <div className="text-[11px] font-mono text-[#737373] max-w-sm">
                    {atsResult.summary}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── STEP 2: BASIC INFORMATION & PHOTO ── */}
        <div className="rounded-2xl border border-black/[0.08] bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="pb-4 border-b border-black/[0.06]">
            <span className="text-[10px] font-medium tracking-[0.16em] uppercase text-[#737373] font-semibold">
              Step 2 · Candidate Identity
            </span>
            <h3 className="text-[18px] sm:text-[20px] text-[#101010] font-semibold tracking-[-0.02em] mt-0.5">
              Basic Information
            </h3>
            <p className="text-[13px] text-[#737373] font-sans">
              Your technical identity as displayed to recruiters and on your public verified profile.
            </p>
          </div>

          <div className="space-y-6">
            {/* ── Instagram-Style Profile Photo Section ── */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-5 bg-[#FAFAF9] border border-black/[0.08] rounded-2xl shadow-sm">
              <div
                className="relative group cursor-pointer shrink-0 self-start sm:self-center"
                onClick={() => {
                  if (formData.avatarUrl) {
                    setShowPhotoActionSheet(true);
                  } else {
                    avatarInputRef.current?.click();
                  }
                }}
                title={formData.avatarUrl ? "Click to change or remove photo" : "Click to upload photo"}
              >
                <CandidateAvatar
                  avatarUrl={formData.avatarUrl || user?.photoURL}
                  name={formData.name || "Candidate"}
                  size="xl"
                  showBadge={false}
                />
                <div className="absolute inset-0 rounded-full bg-black/45 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-5 w-5" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[15px] sm:text-[16px] font-semibold text-[#101010] truncate tracking-[-0.01em]">
                    {formData.name || "Candidate Portrait"}
                  </span>
                </div>
                <p className="text-[12px] text-[#737373] mb-3.5 font-sans">
                  Profile photo visible to employers and on your public technical record.
                </p>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={isProcessingAvatar}
                    className="rounded-full bg-[#101010] hover:bg-black/90 text-white text-xs font-medium px-4 py-2 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <UploadCloud className="h-3.5 w-3.5" />
                    <span>{formData.avatarUrl ? "Update Photo" : "Upload Photo"}</span>
                  </button>

                  {formData.avatarUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      disabled={isProcessingAvatar}
                      className="rounded-full border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium px-4 py-2 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              </div>

              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarFileSelect}
              />
            </div>

            {/* Instagram-style Photo Action Sheet Modal */}
            {showPhotoActionSheet && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
                onClick={() => setShowPhotoActionSheet(false)}
              >
                <div
                  className="w-full max-w-xs bg-white rounded-2xl border border-black/[0.08] shadow-2xl overflow-hidden text-center divide-y divide-black/[0.06] animate-in zoom-in-95 duration-150"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="py-4 px-6 bg-[#FAFAF9]">
                    <h3 className="text-[15px] font-semibold text-[#101010]">Change Profile Photo</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPhotoActionSheet(false);
                      avatarInputRef.current?.click();
                    }}
                    className="w-full py-3.5 text-[13px] font-medium text-[#101010] hover:bg-black/[0.03] transition-colors cursor-pointer"
                  >
                    Upload New Photo
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="w-full py-3.5 text-[13px] font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    Remove Current Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPhotoActionSheet(false)}
                    className="w-full py-3 text-[13px] font-medium text-[#737373] hover:bg-black/[0.03] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

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
              <div className="flex flex-col justify-center bg-[#FAFAF9] border border-black/[0.06] rounded-xl p-4">
                <span className="text-[10px] font-sans font-semibold uppercase tracking-wide text-[#737373] mb-1">
                  Public Profile Note
                </span>
                <p className="text-[12px] text-[#101010] leading-relaxed font-sans">
                  Your university, degree, and branch will appear on your public profile for recruiters to verify.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── STEP 3: TECHNICAL SKILLS ── */}
        <div className="rounded-2xl border border-black/[0.08] bg-white p-6 sm:p-8 shadow-xs space-y-4">
          <div className="pb-4 border-b border-black/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-medium tracking-[0.16em] uppercase text-[#737373] font-semibold">
                Step 3 · Verified Capabilities
              </span>
              <h3 className="text-[18px] sm:text-[20px] text-[#101010] font-semibold tracking-[-0.02em] mt-0.5">
                Technical Skills
              </h3>
              <p className="text-[13px] text-[#737373] font-sans mt-0.5">
                These skills were parsed from your resume. Take timed assessments to earn verified proof badges.
              </p>
            </div>
            <span className="text-[11px] font-mono text-[#737373] bg-[#FAFAF9] border border-black/[0.06] px-3 py-1 rounded-full w-fit">
              {formData.skills.length} skills added
            </span>
          </div>

          <div>
            <TagInput
              label="Declared Skills"
              tags={formData.skills}
              onChange={handleSkillsChange}
              placeholder="React, Python, Systems Design..."
              helperText="The first skill listed will be your primary focus. Separate with commas or press Enter."
              options={COMMON_SKILLS}
              splitOnComma={true}
              mode="skills"
            />
          </div>
        </div>

        {/* ── STEP 4: TARGETED ROLES & PREFERENCES ── */}
        <div className="rounded-2xl border border-black/[0.08] bg-white p-6 sm:p-8 shadow-xs space-y-5">
          <div className="pb-4 border-b border-black/[0.06]">
            <span className="text-[10px] font-medium tracking-[0.16em] uppercase text-[#737373] font-semibold">
              Step 4 · Career Focus
            </span>
            <h3 className="text-[18px] sm:text-[20px] text-[#101010] font-semibold tracking-[-0.02em] mt-0.5">
              Targeted Roles &amp; Career Preferences
            </h3>
            <p className="text-[13px] text-[#737373] font-sans">
              Tell prospective employers the exact engineering roles, locations, and working models you want.
            </p>
          </div>

          <div className="space-y-5">
            {/* Targeted Roles */}
            <div>
              <TagInput
                label="Targeted Job Roles"
                tags={formData.targetRoles}
                onChange={(tags) => setFormData((prev) => ({ ...prev, targetRoles: tags }))}
                placeholder="e.g. Full-Stack Developer, Backend Engineer, DevOps..."
                helperText="Specify the roles you are best suited for. Select from suggestions or press Enter."
                options={TARGET_ROLE_SUGGESTIONS}
                splitOnComma={false}
                mode="text"
              />
            </div>

            {/* Preferred Locations */}
            <div>
              <TagInput
                label="Preferred Work Locations"
                tags={formData.preferredLocations}
                onChange={(tags) => setFormData((prev) => ({ ...prev, preferredLocations: tags }))}
                placeholder="e.g. Remote, Hyderabad, India, Bangalore, India..."
                helperText="Where are you willing or eager to work? (Type 'City, Country' and press Enter, or choose from suggestions)"
                options={PREFERRED_LOCATION_SUGGESTIONS}
                splitOnComma={false}
                mode="text"
              />
            </div>

            {/* Work Preference, Availability, and Expected Compensation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-[11px] font-sans font-semibold uppercase tracking-wider text-[#737373] mb-1.5">
                  Work Preference
                </label>
                <select
                  name="workPreference"
                  value={formData.workPreference}
                  onChange={(e) => setFormData((prev) => ({ ...prev, workPreference: e.target.value as any }))}
                  className="w-full h-10 px-3 border border-black/[0.12] bg-[#FAFAF9] text-[13px] text-[#101010] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#101010]"
                >
                  <option value="Remote">Remote Only</option>
                  <option value="Hybrid">Hybrid (Flexible)</option>
                  <option value="On-site">On-site (Office)</option>
                  <option value="Flexible">Flexible / Open to All</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-sans font-semibold uppercase tracking-wider text-[#737373] mb-1.5">
                  Notice / Availability
                </label>
                <select
                  name="availability"
                  value={formData.availability}
                  onChange={(e) => setFormData((prev) => ({ ...prev, availability: e.target.value }))}
                  className="w-full h-10 px-3 border border-black/[0.12] bg-[#FAFAF9] text-[13px] text-[#101010] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#101010]"
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
              <label className="block text-[11px] font-sans font-semibold uppercase tracking-wider text-[#737373] mb-1.5">
                Professional Headline / Engineering Focus
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={2}
                placeholder="Brief 1-2 sentence engineering focus e.g. Full-Stack TypeScript & Go engineer passionate about scalable backend systems and high-performance web applications."
                className="w-full px-3 py-2 border border-black/[0.12] bg-[#FAFAF9] text-[13px] text-[#101010] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#101010] leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* ── STEP 5: LINKS & PORTFOLIO ── */}
        <div className="rounded-2xl border border-black/[0.08] bg-white p-6 sm:p-8 shadow-xs space-y-5">
          <div className="pb-4 border-b border-black/[0.06] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-medium tracking-[0.16em] uppercase text-[#737373] font-semibold">
                Step 5 · Evidence &amp; Links
              </span>
              <h3 className="text-[18px] sm:text-[20px] text-[#101010] font-semibold tracking-[-0.02em] mt-0.5">
                Links &amp; Portfolio
              </h3>
              <p className="text-[13px] text-[#737373] font-sans mt-0.5">
                Add links to your code repository, professional network, and personal portfolio.
              </p>
            </div>
            <span className="text-[11px] font-mono text-[#737373] bg-[#FAFAF9] border border-black/[0.06] px-3 py-1 rounded-full">
              Optional
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="GitHub URL (Optional)"
              name="githubUrl"
              value={formData.githubUrl}
              onChange={handleChange}
              placeholder="https://github.com/SaitrishankAUCSE"
              type="url"
              helperText="Link to your code repository or open-source profile"
            />
            <Input
              label="LinkedIn URL (Optional)"
              name="linkedinUrl"
              value={formData.linkedinUrl}
              onChange={handleChange}
              placeholder="https://www.linkedin.com/in/saitrishank/"
              type="url"
              helperText="Link to your professional profile"
            />
            <Input
              label="Portfolio / Personal Website URL (Optional)"
              name="portfolioUrl"
              value={formData.portfolioUrl}
              onChange={handleChange}
              placeholder="https://saitrishank-portfolio.vercel.app/"
              type="url"
              helperText="Link to your personal website or portfolio"
            />
            <Input
              label="Resume Document / PDF Link (Optional)"
              name="resumeUrl"
              value={formData.resumeUrl}
              onChange={handleChange}
              placeholder="https://drive.google.com/... or direct PDF link"
              type="url"
              helperText="Direct URL to your hosted resume or Google Drive document"
            />
          </div>
        </div>

        {/* ── SAVE ACTION BAR ── */}
        <div className="rounded-2xl border border-black/[0.08] bg-white p-5 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="text-[12px] font-mono text-[#737373]">
            {!hasResume ? (
              <span className="text-amber-800 flex items-center gap-1.5 font-medium">
                <AlertCircle className="h-4 w-4" />
                Please upload your resume in Step 1 to save profile.
              </span>
            ) : (
              <span className="text-emerald-700 flex items-center gap-1.5 font-medium">
                <ShieldCheck className="h-4 w-4" />
                Resume on file · Ready to save.
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
