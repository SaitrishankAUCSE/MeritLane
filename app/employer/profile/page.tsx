"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { Building, Globe, MapPin, Sparkles, CheckCircle2, Save, Layers } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function EmployerProfilePage() {
  const { user } = useAuth();
  const [companyName, setCompanyName] = useState("BannuTech Global");
  const [website, setWebsite] = useState("https://bannutech.io");
  const [location, setLocation] = useState("Bengaluru, India");
  const [techStack, setTechStack] = useState("React, Next.js, Python, PostgreSQL, AWS");
  const [about, setAbout] = useState("Building next-generation enterprise AI software and high-throughput distributed systems.");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] overflow-y-auto">
      <div className="p-8 lg:p-12 max-w-[850px] w-full mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-[#E5E5E5] pb-6">
          <h1 className="font-serif text-[32px] font-bold text-[#0D0D0D] leading-tight">
            Employer Identity
          </h1>
          <p className="text-[14px] text-[#737373] font-sans mt-1">
            Your public company profile displayed to candidates when you reach out or send interview invitations.
          </p>
        </div>

        {/* Company Card Header Preview */}
        <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 sm:p-8 shadow-sm flex items-start gap-5">
          <div className="h-16 w-16 rounded-2xl bg-[#0D0D0D] text-white flex items-center justify-center font-serif text-[26px] font-bold shrink-0">
            {companyName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="font-serif text-[24px] font-bold text-[#0D0D0D]">{companyName}</h2>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#15803D] bg-[#15803D]/10 px-2.5 py-0.5 rounded-sm">
                Verified Hiring Partner
              </span>
            </div>
            <p className="text-[13px] text-[#737373] mt-1">{location} · {website}</p>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSave} className="bg-white border border-[#E5E5E5] rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-[12px] font-medium text-[#0D0D0D] block mb-1">
                Company / Organization Name
              </label>
              <div className="relative">
                <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373]" />
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5E5E5] text-[14px] text-[#0D0D0D] focus:border-[#0D0D0D] focus:ring-1 focus:ring-[#0D0D0D] outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[12px] font-medium text-[#0D0D0D] block mb-1">
                Company Website
              </label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373]" />
                <input
                  type="url"
                  required
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5E5E5] text-[14px] text-[#0D0D0D] focus:border-[#0D0D0D] focus:ring-1 focus:ring-[#0D0D0D] outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-[12px] font-medium text-[#0D0D0D] block mb-1">
                Headquarters / Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373]" />
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5E5E5] text-[14px] text-[#0D0D0D] focus:border-[#0D0D0D] focus:ring-1 focus:ring-[#0D0D0D] outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[12px] font-medium text-[#0D0D0D] block mb-1">
                Core Tech Stack Focus
              </label>
              <div className="relative">
                <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373]" />
                <input
                  type="text"
                  required
                  value={techStack}
                  onChange={(e) => setTechStack(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5E5E5] text-[14px] text-[#0D0D0D] focus:border-[#0D0D0D] focus:ring-1 focus:ring-[#0D0D0D] outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-[12px] font-medium text-[#0D0D0D] block mb-1">
              About the Engineering Team & Culture
            </label>
            <textarea
              rows={3}
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E5E5E5] text-[14px] text-[#0D0D0D] focus:border-[#0D0D0D] focus:ring-1 focus:ring-[#0D0D0D] outline-none transition-all resize-none"
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
            <Button type="submit" leftIcon={<Save className="h-4 w-4" />}>
              Save Identity
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
