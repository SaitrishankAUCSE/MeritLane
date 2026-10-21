"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { Building, Globe, MapPin, Layers, Save, CheckCircle2, Sparkles, User, Link } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MeritlaneLoader } from "@/components/ui/MeritlaneLoader";

export default function EmployerProfilePage() {
  const { user, userProfile, loading } = useAuth();
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [location, setLocation] = useState("");
  const [techStack, setTechStack] = useState("");
  const [about, setAbout] = useState("");
  const [role, setRole] = useState("");
  const [linkedin, setLinkedin] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const ep = (userProfile as any)?.employerProfile;
    if (ep) {
      setCompanyName(ep.companyName || "");
      setWebsite(ep.website || "");
      setLocation(ep.location || "");
      setTechStack(ep.techStack || "");
      setAbout(ep.about || "");
      setRole(ep.role || "");
      setLinkedin(ep.linkedin || "");
    }
  }, [userProfile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    setSaved(false);

    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/employer/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          companyName,
          website,
          location,
          techStack,
          about,
          role,
          linkedin,
        }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <MeritlaneLoader level="page" text="Loading Profile..." />;
  }

  const displayInitial = companyName ? companyName.charAt(0).toUpperCase() : (user?.displayName ? user.displayName.charAt(0).toUpperCase() : "E");
  const displayCompany = companyName || "Company Name";

  return (
    <div className="w-full min-h-full bg-transparent pb-24 text-[#101010]">
      {/* ── Flush Header Strip ── */}
      <div className="border-b border-black/[0.08] bg-white px-4 sm:px-6 lg:px-8 py-5">
        <div className="max-w-4xl mx-auto w-full">
          <div className="text-[10px] font-medium tracking-[0.16em] text-[#737373] uppercase mb-1">
            Company Profile · Employer Portal
          </div>
          <h1 className="text-[24px] sm:text-[30px] font-semibold text-[#101010] tracking-[-0.03em] leading-tight">
            Employer Identity
          </h1>
          <p className="text-[13px] text-[#737373] font-sans mt-0.5">
            Your public company profile displayed to candidates when you reach out or send interview invitations.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6 sm:space-y-8">

        {/* Step 1 Welcome Callout for Uncompleted Profile */}
        {(!companyName || !location) && (
          <div className="bg-white border border-black/[0.08] rounded-2xl p-5 sm:p-6 flex items-start gap-4 shadow-xs animate-in fade-in duration-200">
            <div className="h-10 w-10 rounded-full bg-black/[0.04] text-[#101010] border border-black/[0.08] flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[14px] font-bold text-[#101010] font-sans">
                  Step 1 of 4: Set Up Your Company Profile
                </span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-black/[0.04] text-[#101010] border border-black/[0.08] px-2.5 py-0.5 rounded-full">
                  You Are Here
                </span>
              </div>
              <p className="text-[13px] text-[#737373] leading-relaxed font-sans">
                Complete your company identity below to unlock verified candidate search, job postings, and direct engineering outreach.
              </p>
            </div>
          </div>
        )}

        {/* Company Card Header Preview */}
        <div className="bg-white border border-black/[0.08] rounded-2xl p-6 sm:p-8 shadow-xs flex items-start gap-4 sm:gap-5">
          <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-[#101010] text-white flex items-center justify-center font-mono text-[22px] sm:text-[26px] font-bold shrink-0">
            {displayInitial}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-[22px] sm:text-[24px] font-bold text-[#101010] tracking-tight">{displayCompany}</h2>
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#101010] bg-black/[0.04] border border-black/[0.08] px-2.5 py-0.5 rounded-full">
                Verified Hiring Partner
              </span>
            </div>
            <p className="text-[13px] text-[#737373] mt-1 font-sans">{location || "Location"} · {website || "Website"}</p>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSave} className="bg-white border border-black/[0.08] rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
          
          {/* Personal Role & LinkedIn */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-[12px] font-medium text-[#101010] block mb-1.5">
                Your Role / Title
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373]" />
                <input
                  type="text"
                  required
                  placeholder="e.g. CTO, Recruiter, Engineering Manager"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/[0.12] text-[14px] text-[#101010] placeholder:text-[#a3a3a3] focus:border-[#101010] focus:ring-1 focus:ring-[#101010] outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[12px] font-medium text-[#101010] block mb-1.5">
                LinkedIn Profile URL
              </label>
              <div className="relative">
                <Link className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373]" />
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/..."
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/[0.12] text-[14px] text-[#101010] placeholder:text-[#a3a3a3] focus:border-[#101010] focus:ring-1 focus:ring-[#101010] outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-[12px] font-medium text-[#101010] block mb-1.5">
                Company / Organization Name
              </label>
              <div className="relative">
                <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373]" />
                <input
                  type="text"
                  required
                  placeholder="Company Name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/[0.12] text-[14px] text-[#101010] placeholder:text-[#a3a3a3] focus:border-[#101010] focus:ring-1 focus:ring-[#101010] outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[12px] font-medium text-[#101010] block mb-1.5">
                Company Website
              </label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373]" />
                <input
                  type="url"
                  required
                  placeholder="https://company.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/[0.12] text-[14px] text-[#101010] placeholder:text-[#a3a3a3] focus:border-[#101010] focus:ring-1 focus:ring-[#101010] outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-[12px] font-medium text-[#101010] block mb-1.5">
                Headquarters / Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373]" />
                <input
                  type="text"
                  required
                  placeholder="e.g. San Francisco, CA"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/[0.12] text-[14px] text-[#101010] placeholder:text-[#a3a3a3] focus:border-[#101010] focus:ring-1 focus:ring-[#101010] outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[12px] font-medium text-[#101010] block mb-1.5">
                Core Tech Stack Focus
              </label>
              <div className="relative">
                <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373]" />
                <input
                  type="text"
                  required
                  placeholder="e.g. React, Node, AWS"
                  value={techStack}
                  onChange={(e) => setTechStack(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/[0.12] text-[14px] text-[#101010] placeholder:text-[#a3a3a3] focus:border-[#101010] focus:ring-1 focus:ring-[#101010] outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-[12px] font-medium text-[#101010] block mb-1.5">
              About the Engineering Team & Culture
            </label>
            <textarea
              rows={3}
              required
              placeholder="Tell candidates what makes your engineering team unique..."
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-black/[0.12] text-[14px] text-[#101010] placeholder:text-[#a3a3a3] focus:border-[#101010] focus:ring-1 focus:ring-[#101010] outline-none transition-all resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {saved ? (
              <div className="flex items-center gap-1.5 text-[13px] font-medium text-emerald-700">
                <CheckCircle2 className="h-4 w-4" /> Identity details updated successfully.
              </div>
            ) : (
              <div />
            )}
            <Button type="submit" leftIcon={<Save className="h-4 w-4" />} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Identity"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
