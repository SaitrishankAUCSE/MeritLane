import React from "react";
import { adminDb } from "@/lib/firebase/admin";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Code2, ExternalLink, Calendar, Cpu, ArrowRight, Layers } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PublicProfilePage({ params }: Props) {
  const { id } = await params;

  let candidateDoc;
  let userDoc;

  try {
    candidateDoc = await adminDb!.collection("candidates").doc(id).get();
    userDoc = await adminDb!.collection("users").doc(id).get();
  } catch (err) {
    console.error("Error fetching public profile:", err);
    notFound();
  }

  if (!candidateDoc.exists) {
    notFound();
  }

  const candidate = candidateDoc.data()!;
  
  // Must be fully verified to be public
  if (candidate.verificationStatus !== "verified") {
    notFound();
  }

  const user = userDoc.exists ? userDoc.data()! : {};
  const assessmentScores = user.assessmentScores || null;
  const assessmentDate = user.assessmentDate || candidate.verifiedAt || null;

  return (
    <div className="min-h-screen bg-[#FBF8F1] selection:bg-[#0A192F] selection:text-white">
      {/* Institutional Top Bar */}
      <div className="w-full bg-[#0A192F] border-b-4 border-[#D4AF37] px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#D4AF37]" />
            <span className="font-serif font-bold text-[#FBF8F1] tracking-wide uppercase text-sm">Meritlane</span>
          </Link>
          <div className="flex gap-4">
            <Link href="/employer/dashboard" className="text-xs font-semibold text-[#D4AF37] hover:text-[#FBF8F1] uppercase tracking-widest transition-colors">Hire Engineers</Link>
            <Link href="/signup" className="text-xs font-semibold text-[#F0EAD6] hover:text-white uppercase tracking-widest transition-colors">Get Verified</Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 sm:py-20">
        
        {/* Certificate Header */}
        <div className="bg-white border-2 border-[#0A192F] p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          {/* Decorative Corner Borders */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#D4AF37] m-2"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#D4AF37] m-2"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#D4AF37] m-2"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#D4AF37] m-2"></div>

          <div className="text-center mb-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#0A192F] text-[#D4AF37] mb-6 shadow-lg border-2 border-[#D4AF37]">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#0A192F]/60 mb-2">Official Verified Record</h4>
            <h1 className="text-4xl sm:text-5xl font-serif font-black text-[#0A192F] mb-4">
              {candidate.name || user.displayName || "Unknown Engineer"}
            </h1>
            <p className="text-lg text-[#0A192F]/80 font-medium">
              {candidate.college && candidate.branch 
                ? `${candidate.branch} · ${candidate.college} '${candidate.gradYear}`
                : "Software Engineer"}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-12 pt-10 border-t border-[#0A192F]/10">
            <div>
              <h5 className="text-xs font-bold uppercase tracking-widest text-[#0A192F]/50 mb-3">Verification ID</h5>
              <p className="font-mono text-sm font-semibold text-[#0A192F] bg-[#F0EAD6] inline-block px-3 py-1 border border-[#D4AF37]/30">
                {id.substring(0, 12).toUpperCase()}
              </p>
            </div>
            <div>
              <h5 className="text-xs font-bold uppercase tracking-widest text-[#0A192F]/50 mb-3">Verified Date</h5>
              <p className="text-sm font-semibold text-[#0A192F] flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#D4AF37]" />
                {assessmentDate ? new Date(assessmentDate).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }) : "Recently Verified"}
              </p>
            </div>
          </div>
        </div>

        {/* Assessment Scores */}
        {assessmentScores && (
          <div className="mt-12">
            <h3 className="text-xl font-serif font-bold text-[#0A192F] mb-6 flex items-center gap-2 border-b-2 border-[#D4AF37] pb-2 inline-flex">
              <Cpu className="h-5 w-5 text-[#D4AF37]" />
              Standardized Assessment
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Object.entries(assessmentScores).map(([key, score]) => (
                <div key={key} className="bg-white border border-[#0A192F]/10 p-5 shadow-sm text-center">
                  <div className="text-[#0A192F]/60 text-xs font-bold uppercase tracking-widest mb-2">{key.replace(/([A-Z])/g, ' $1')}</div>
                  <div className="text-3xl font-serif font-black text-[#0A192F]">{Number(score).toFixed(0)}<span className="text-base text-[#0A192F]/40">/100</span></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Core Competencies */}
        {candidate.skills && candidate.skills.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl font-serif font-bold text-[#0A192F] mb-6 flex items-center gap-2 border-b-2 border-[#D4AF37] pb-2 inline-flex">
              <Code2 className="h-5 w-5 text-[#D4AF37]" />
              Verified Competencies
            </h3>
            <div className="flex flex-wrap gap-2">
              {candidate.skills.map((skill: string) => (
                <span key={skill} className="bg-[#0A192F] text-[#FBF8F1] px-4 py-1.5 text-sm font-medium border border-[#D4AF37]/50 shadow-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Portfolio */}
        {candidate.projects && candidate.projects.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl font-serif font-bold text-[#0A192F] mb-6 flex items-center gap-2 border-b-2 border-[#D4AF37] pb-2 inline-flex">
              <Layers className="h-5 w-5 text-[#D4AF37]" />
              Verified Portfolio
            </h3>
            <div className="space-y-6">
              {candidate.projects.map((project: any, idx: number) => (
                <div key={idx} className="bg-white border border-[#0A192F]/10 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                    <h4 className="text-lg font-bold text-[#0A192F] font-serif">{project.name}</h4>
                    <div className="flex gap-3">
                      {project.githubUrl && (
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold uppercase tracking-widest text-[#0A192F]/60 hover:text-[#0A192F] flex items-center gap-1 bg-[#F0EAD6] px-3 py-1 border border-[#0A192F]/10">
                          Code <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      {project.liveUrl && (
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold uppercase tracking-widest text-[#D4AF37] hover:text-[#D4AF37]/80 flex items-center gap-1 bg-[#0A192F] px-3 py-1">
                          Demo <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-[#0A192F]/80 leading-relaxed mb-4">{project.description}</p>
                  
                  {project.stack && project.stack.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-[#0A192F]/5">
                      {project.stack.map((tech: string) => (
                        <span key={tech} className="text-xs font-medium text-[#0A192F]/60 border border-[#0A192F]/10 px-2 py-0.5">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Viral CTAs */}
        <div className="mt-20 border-t-2 border-[#0A192F]/10 pt-12 flex flex-col sm:flex-row gap-6">
          <div className="flex-1 bg-[#0A192F] p-8 border-l-4 border-[#D4AF37]">
            <h4 className="text-[#FBF8F1] font-serif font-bold text-xl mb-3">Hire this Engineer</h4>
            <p className="text-[#FBF8F1]/70 text-sm mb-6 leading-relaxed">Meritlane connects you with proven talent. Bypass the resume screen and hire based on verified architectural ability.</p>
            <Link href="/employer/dashboard" className="inline-flex items-center gap-2 bg-[#D4AF37] text-[#0A192F] px-5 py-2.5 text-sm font-bold uppercase tracking-widest hover:bg-[#F0EAD6] transition-colors">
              Access Talent Pool <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="flex-1 bg-white p-8 border-l-4 border-[#0A192F] shadow-sm">
            <h4 className="text-[#0A192F] font-serif font-bold text-xl mb-3">Claim Your Record</h4>
            <p className="text-[#0A192F]/70 text-sm mb-6 leading-relaxed">Are you an elite engineer without the college pedigree? Prove your skills and earn your verified institutional record.</p>
            <Link href="/signup" className="inline-flex items-center gap-2 border border-[#0A192F] text-[#0A192F] px-5 py-2.5 text-sm font-bold uppercase tracking-widest hover:bg-[#0A192F] hover:text-[#FBF8F1] transition-colors">
              Get Verified <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
