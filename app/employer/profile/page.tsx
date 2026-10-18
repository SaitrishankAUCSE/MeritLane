"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { Building, Globe, MapPin, CheckCircle2, Save, Layers, User, Link } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { fetchEmployerProfile, saveEmployerProfile } from "@/lib/firebase/employer";
import { MeritlaneLoader } from "@/components/ui/MeritlaneLoader";

export default function EmployerProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [website, setWebsite] = useState("");
  const [location, setLocation] = useState("");
  const [techStack, setTechStack] = useState("");
  const [about, setAbout] = useState("");
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    async function loadData() {
      try {
        const p = await fetchEmployerProfile(user!.uid);
        if (p) {
          setCompanyName(p.companyName || p.name || "");
          setRole(p.role || "");
          setLinkedin(p.linkedin || "");
          setWebsite(p.website || "");
          setLocation(p.location || "");
          setTechStack(p.techStack || "");
          setAbout(p.about || "");
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSaving(true);
    try {
      await saveEmployerProfile(user.uid, {
        companyName,
        role,
        linkedin,
        website,
        location,
        techStack,
        about,
        name: companyName // Syncing name for consistency if needed by other parts of the app
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error("Failed to save profile", err);
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
    <div className="flex flex-col h-full bg-[#FAFAFA] overflow-y-auto">
      <div className="w-full px-4 sm:px-8 lg:px-12 py-8 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="border-b border-border pb-6">
          <h1 className="font-serif text-[26px] sm:text-[32px] font-bold text-foreground leading-tight">
            Employer Identity
          </h1>
          <p className="text-[13px] sm:text-[14px] text-muted-foreground font-sans mt-1">
            Your public company profile displayed to candidates when you reach out or send interview invitations.
          </p>
        </div>

        {/* Company Card Header Preview */}
        <div className="bg-white border border-border rounded p-4 sm:p-8 shadow-sm flex items-start gap-4 sm:gap-5">
          <div className="h-12 w-12 sm:h-16 sm:w-16 rounded bg-foreground text-white flex items-center justify-center font-serif text-[20px] sm:text-[26px] font-bold shrink-0">
            {displayInitial}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="font-serif text-[24px] font-bold text-foreground">{displayCompany}</h2>
              <span className="text-[11px] font-medium font-bold uppercase tracking-wider text-[#15803D] bg-[#15803D]/10 px-2.5 py-0.5 rounded-sm">
                Verified Hiring Partner
              </span>
            </div>
            <p className="text-[13px] text-muted-foreground mt-1">{location || "Location"} · {website || "Website"}</p>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSave} className="bg-white border border-border rounded p-6 sm:p-8 shadow-sm space-y-5">
          
          {/* New Row: Personal Role & LinkedIn */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-[12px] font-medium text-foreground block mb-1">
                Your Role / Title
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  required
                  placeholder="e.g. CTO, Recruiter, Engineering Manager"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded border border-border text-[14px] text-foreground focus:border-foreground focus:ring-1 focus:ring-foreground outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[12px] font-medium text-foreground block mb-1">
                LinkedIn Profile URL
              </label>
              <div className="relative">
                <Link className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/..."
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded border border-border text-[14px] text-foreground focus:border-foreground focus:ring-1 focus:ring-foreground outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-[12px] font-medium text-foreground block mb-1">
                Company / Organization Name
              </label>
              <div className="relative">
                <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  required
                  placeholder="Company Name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded border border-border text-[14px] text-foreground focus:border-foreground focus:ring-1 focus:ring-foreground outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[12px] font-medium text-foreground block mb-1">
                Company Website
              </label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="url"
                  required
                  placeholder="https://company.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded border border-border text-[14px] text-foreground focus:border-foreground focus:ring-1 focus:ring-foreground outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-[12px] font-medium text-foreground block mb-1">
                Headquarters / Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  required
                  placeholder="e.g. San Francisco, CA"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded border border-border text-[14px] text-foreground focus:border-foreground focus:ring-1 focus:ring-foreground outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[12px] font-medium text-foreground block mb-1">
                Core Tech Stack Focus
              </label>
              <div className="relative">
                <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  required
                  placeholder="e.g. React, Node, AWS"
                  value={techStack}
                  onChange={(e) => setTechStack(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded border border-border text-[14px] text-foreground focus:border-foreground focus:ring-1 focus:ring-foreground outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-[12px] font-medium text-foreground block mb-1">
              About the Engineering Team & Culture
            </label>
            <textarea
              rows={3}
              required
              placeholder="Tell candidates what makes your engineering team unique..."
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              className="w-full px-4 py-2.5 rounded border border-border text-[14px] text-foreground focus:border-foreground focus:ring-1 focus:ring-foreground outline-none transition-all resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {saved ? (
              <div className="flex items-center gap-1.5 text-[13px] font-medium text-[#15803D]">
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
