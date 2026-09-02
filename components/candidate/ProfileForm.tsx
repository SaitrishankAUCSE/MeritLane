import React, { useState, useMemo } from "react";
import { Save, Sparkles, FileText, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { TagInput } from "@/components/ui/TagInput";
import { CandidateProfile, saveCandidateProfile } from "@/lib/firebase/candidate";
import { useAuth } from "@/lib/auth/AuthContext";
import { Autocomplete } from "@/components/ui/Autocomplete";
import { COMMON_DEGREES, COMMON_BRANCHES, YEARS, fetchIndianColleges, COMMON_SKILLS } from "@/lib/constants";
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const { GuardModal } = useUnsavedChanges(isDirty);

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCheckAts = async () => {
    if (!formData.resumeText.trim() || formData.resumeText.trim().length < 30) {
      setError("Please enter your resume content or bullet points (at least 30 characters) to analyze ATS score.");
      return;
    }

    setAnalyzingAts(true);
    setError(null);

    try {
      const token = await user?.getIdToken(true);
      const res = await fetch("/api/candidate/ats-check", {
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

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze resume.");
      }

      setAtsResult(data.result);
      addToast({
        type: "success",
        title: `ATS Score: ${data.result.score}/100 (${data.result.rating})`,
      });
    } catch (err: any) {
      setError(err.message || "Unable to check ATS score.");
    } finally {
      setAnalyzingAts(false);
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
              onChange={(val) => setFormData((prev) => ({ ...prev, degree: val }))}
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
              placeholder="e.g. Computer Science and Engineering"
              options={COMMON_BRANCHES}
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

            {/* Resume Text Content & ATS Score Analyzer */}
            <div className="mt-6 border border-[#E7E2DA] bg-[#F8F6F3] rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div>
                  <h4 className="text-[14px] font-semibold text-[#1C1917] flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#78716C]" /> Resume Content &amp; ATS Score Checker
                  </h4>
                  <p className="text-[12px] text-[#78716C] mt-0.5">
                    Paste your resume text or project bullet points to evaluate your resume against industry ATS screening standards.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCheckAts}
                  disabled={analyzingAts || !formData.resumeText.trim()}
                  className="inline-flex items-center justify-center gap-1.5 px-4 h-9 bg-[#1C1917] hover:bg-[#292524] text-white text-[12px] font-semibold rounded-xl transition-colors disabled:opacity-50 shrink-0 w-full sm:w-auto"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                  {analyzingAts ? "Analyzing ATS..." : "Check ATS Score"}
                </button>
              </div>

              <textarea
                name="resumeText"
                value={formData.resumeText}
                onChange={handleChange}
                rows={5}
                placeholder="Paste your resume work experience, projects, and summary here to test ATS keyword density, action verbs, and quantifiable impact..."
                className="w-full bg-white border border-[#E7E2DA] rounded-xl p-3.5 text-[13px] font-mono text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#1C1917] resize-y"
              />

              {/* ATS Results Card */}
              {atsResult && (
                <div className="mt-4 border border-[#E7E2DA] bg-white rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-4 mb-3 border-b border-[#E7E2DA] pb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-[28px] font-mono font-bold text-[#1C1917]">
                        {atsResult.score}<span className="text-[14px] text-[#78716C]">/100</span>
                      </div>
                      <div>
                        <div className="text-[11px] font-mono uppercase tracking-wider text-[#78716C]">
                          ATS Screening Rating
                        </div>
                        <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                          atsResult.score >= 80 
                            ? "bg-[#F0FDF4] text-[#16A34A] border-[#16A34A]/20" 
                            : atsResult.score >= 60 
                            ? "bg-[#FFFBEB] text-[#D97706] border-[#D97706]/20" 
                            : "bg-[#FEF2F2] text-[#B42318] border-[#B42318]/20"
                        }`}>
                          {atsResult.rating}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[13px] text-[#78716C] leading-relaxed mb-4">
                    {atsResult.summary}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[12px]">
                    {atsResult.strengths && atsResult.strengths.length > 0 && (
                      <div className="bg-[#F0FDF4]/50 border border-[#16A34A]/20 rounded-lg p-3">
                        <span className="font-semibold text-[#16A34A] block mb-1.5">✓ Strengths</span>
                        <ul className="space-y-1 text-[#1C1917]">
                          {atsResult.strengths.map((str: string, sIdx: number) => (
                            <li key={sIdx} className="flex items-start gap-1.5">
                              <span className="text-[#16A34A]">•</span> {str}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {atsResult.improvements && atsResult.improvements.length > 0 && (
                      <div className="bg-[#FFFBEB]/50 border border-[#D97706]/20 rounded-lg p-3">
                        <span className="font-semibold text-[#D97706] block mb-1.5">⚠ Improvement Areas</span>
                        <ul className="space-y-1 text-[#1C1917]">
                          {atsResult.improvements.map((imp: string, iIdx: number) => (
                            <li key={iIdx} className="flex items-start gap-1.5">
                              <span className="text-[#D97706]">•</span> {imp}
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


