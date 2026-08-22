"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { TagInput } from "@/components/ui/TagInput";
import { CandidateProfile, saveCandidateProfile } from "@/lib/firebase/candidate";
import { useAuth } from "@/lib/auth/AuthContext";
import { Save, X } from "lucide-react";

interface ProfileFormProps {
  initialData: CandidateProfile | null;
  onSave: (data: CandidateProfile) => void;
  onCancel?: () => void;
  isNew?: boolean;
}

export function ProfileForm({ initialData, onSave, onCancel, isNew = false }: ProfileFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: initialData?.name || user?.displayName || "",
    college: initialData?.college || "",
    branch: initialData?.branch || "",
    gradYear: initialData?.gradYear || "",
    githubUrl: initialData?.githubUrl || "",
    resumeUrl: initialData?.resumeUrl || "",
    skills: initialData?.skills || [],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSkillsChange = (newSkills: string[]) => {
    setFormData((prev) => ({ ...prev, skills: newSkills }));
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
    <form onSubmit={handleSubmit} className="border border-[#272a2f] bg-[#111316] rounded-md p-6 sm:p-8 space-y-8 shadow-2xl">
      <div>
        <h2 className="font-serif text-[24px] text-white mb-2">{isNew ? "Establish your identity" : "Edit your identity"}</h2>
        <p className="text-[14px] text-[#8e928f] font-sans">
          This information forms the base of your verified technical record. Ensure your details are accurate.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[14px] p-4 rounded-md font-sans">
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
          <Input
            label="Graduation Year"
            name="gradYear"
            value={formData.gradYear}
            onChange={handleChange}
            placeholder="e.g. 2024"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="University / College"
            name="college"
            value={formData.college}
            onChange={handleChange}
            placeholder="Institution Name"
          />
          <Input
            label="Degree / Branch"
            name="branch"
            value={formData.branch}
            onChange={handleChange}
            placeholder="Computer Science"
          />
        </div>

        <div className="pt-2 border-t border-[#272a2f]">
          <h3 className="font-sans font-medium text-[14px] text-white mb-4">Technical Claims</h3>
          <div className="mb-6">
            <TagInput
              label="Skills & Domains"
              tags={formData.skills}
              onChange={handleSkillsChange}
              placeholder="React, Python, Systems Design..."
              helperText="The first skill listed will be your Primary Domain. Separate with commas or press Enter."
            />
          </div>
        </div>

        <div className="pt-2 border-t border-[#272a2f]">
          <h3 className="font-sans font-medium text-[14px] text-white mb-4">External Evidence</h3>
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
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 pt-6 border-t border-[#272a2f]">
        {!isNew && onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" loading={loading} leftIcon={<Save className="h-4 w-4" />}>
          {isNew ? "Create Profile" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
