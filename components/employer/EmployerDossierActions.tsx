"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Bookmark, BookmarkCheck, MessageSquare, Sparkles, ChevronDown, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { MessageModal } from "@/components/employer/MessageModal";

const PIPELINE_STAGES = [
  { id: "shortlisted", label: "Shortlisted", color: "bg-[#FAF8F5] text-[#1C1917] border-[#E7E2DA]" },
  { id: "interviewing", label: "Interviewing", color: "bg-amber-50/80 text-amber-900 border-amber-200" },
  { id: "offer", label: "Offer Extended", color: "bg-emerald-50 text-[#064E3B] border-emerald-200" },
  { id: "hired", label: "Hired", color: "bg-[#1C1917] text-white border-[#1C1917]" },
  { id: "rejected", label: "Archived / Rejected", color: "bg-[#F5F5F4] text-[#78716C] border-[#E7E2DA]" },
];

interface EmployerDossierActionsProps {
  candidateId: string;
  candidateName?: string;
}

export function EmployerDossierActions({ candidateId, candidateName = "Candidate" }: EmployerDossierActionsProps) {
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [pipelineStage, setPipelineStage] = useState<string>("shortlisted");
  const [loading, setLoading] = useState(true);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [showAiCard, setShowAiCard] = useState(false);
  
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    
    import("posthog-js").then((posthog) => {
      posthog.default.capture("candidate_dossier_view", { candidateId });
    });
    
    const checkStatus = async () => {
      try {
        const token = await user.getIdToken(true);
        const res = await fetch("/api/employer/shortlist/list", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const shortlisted = (data.candidates || []).some((c: any) => c.uid === candidateId);
          setIsShortlisted(shortlisted);
          if (data.pipeline && data.pipeline[candidateId]) {
            setPipelineStage(data.pipeline[candidateId]);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    checkStatus();
  }, [user, candidateId]);

  const toggleShortlist = async () => {
    const nextState = !isShortlisted;
    setIsShortlisted(nextState);

    try {
      const token = await user?.getIdToken(true);
      const res = await fetch("/api/employer/shortlist", {
        method: nextState ? "POST" : "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ candidateId })
      });

      if (!res.ok) {
        setIsShortlisted(!nextState);
      }
    } catch {
      setIsShortlisted(!nextState);
    }
  };

  const handleStageChange = async (newStage: string) => {
    setPipelineStage(newStage);
    try {
      const token = await user?.getIdToken(true);
      await fetch("/api/employer/pipeline", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ candidateId, stage: newStage })
      });
    } catch (e) {
      console.error("Failed to update pipeline stage", e);
    }
  };

  const generateAiSummary = async () => {
    if (aiSummary) {
      setShowAiCard(!showAiCard);
      return;
    }
    setLoadingAi(true);
    setShowAiCard(true);
    try {
      const token = await user?.getIdToken(true);
      const res = await fetch("/api/employer/ai-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ candidateId })
      });
      if (res.ok) {
        const data = await res.json();
        setAiSummary(data.summary || "Summary unavailable.");
      } else {
        setAiSummary("Unable to generate summary at this time.");
      }
    } catch {
      setAiSummary("System error while contacting AI evaluation service.");
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <>
      <div className="fixed top-16 lg:top-0 left-0 lg:left-[220px] right-0 h-16 bg-[#FAFAFA]/95 backdrop-blur-md border-b border-[#E5E5E5] z-[40] flex items-center justify-between px-6 lg:px-12 transition-all duration-300">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-[13px] font-sans font-medium text-[#737373] hover:text-[#0D0D0D] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="flex items-center gap-3">
          {/* Evidence Synthesis Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={generateAiSummary}
            className="gap-1.5 text-[12px] border-[#E7E2DA] bg-[#FAF8F5] text-[#1C1917] hover:bg-[#F5F1EB]"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#064E3B]" />
            {showAiCard ? "Hide Synthesis" : "Evidence Synthesis"}
          </Button>

          {/* Direct Message Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMessageModalOpen(true)}
            className="gap-1.5 text-[12px] border-[#E7E2DA] text-[#1C1917] hover:bg-[#FAF8F5]"
          >
            <MessageSquare className="h-3.5 w-3.5 text-[#78716C]" />
            Message
          </Button>

          {/* Pipeline Selector (When shortlisted) */}
          {isShortlisted && (
            <div className="relative inline-block">
              <select
                value={pipelineStage}
                onChange={(e) => handleStageChange(e.target.value)}
                className="text-[12px] font-medium bg-white border border-[#E7E2DA] rounded-lg px-3 py-1.5 text-[#1C1917] outline-none cursor-pointer hover:border-[#1C1917] transition-colors"
              >
                {PIPELINE_STAGES.map((s) => (
                  <option key={s.id} value={s.id}>
                    Stage: {s.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Shortlist Toggle */}
          {!loading && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={toggleShortlist}
              className={`gap-1.5 text-[12px] ${isShortlisted ? "bg-white border-[#E7E2DA] text-[#064E3B] font-semibold" : "border-[#E7E2DA] text-[#1C1917] hover:bg-white"}`}
            >
              {isShortlisted ? (
                <><BookmarkCheck className="h-3.5 w-3.5 text-[#064E3B]" /> Shortlisted</>
              ) : (
                <><Bookmark className="h-3.5 w-3.5 text-[#78716C]" /> Shortlist</>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Floating Collapsible Evidence Summary Card */}
      {showAiCard && (
        <div className="fixed top-36 right-6 lg:right-12 max-w-md w-full z-30 animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="bg-white border border-[#E7E2DA] rounded-2xl shadow-xl p-5 relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-[#F5F1EB] mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#064E3B]" />
                <h4 className="text-[13px] font-semibold text-[#1C1917]">Candidate Evidence Synthesis</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowAiCard(false)}
                className="text-[11px] text-[#78716C] hover:text-[#1C1917]"
              >
                Close
              </button>
            </div>
            
            {loadingAi ? (
              <div className="py-6 flex flex-col items-center justify-center space-y-2 text-[#78716C]">
                <div className="h-5 w-5 border-2 border-[#E7E2DA] border-t-[#064E3B] rounded-full animate-spin" />
                <p className="text-[12px] text-[#78716C] font-mono uppercase tracking-wider">Synthesizing verified code evidence…</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-[13px] text-[#333333] leading-relaxed font-sans">
                  {aiSummary}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-[#064E3B] font-mono font-medium pt-2 border-t border-[#F5F1EB]">
                  <CheckCircle2 className="h-3 w-3" /> Grounded in verified assessment scores & evidence nodes
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Direct Messaging Modal */}
      <MessageModal
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        recipientId={candidateId}
        recipientName={candidateName}
      />
    </>
  );
}
