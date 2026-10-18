"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Bookmark, BookmarkCheck, MessageSquare, ChevronDown, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { MessageModal } from "@/components/employer/MessageModal";

const PIPELINE_STAGES = [
  { id: "shortlisted", label: "Shortlisted", color: "bg-surface text-foreground border-border" },
  { id: "interviewing", label: "Interviewing", color: "bg-amber-50/80 text-amber-900 border-amber-200" },
  { id: "offer", label: "Offer Extended", color: "bg-emerald-50 text-emerald-900 border-emerald-200" },
  { id: "hired", label: "Hired", color: "bg-foreground text-white border-foreground" },
  { id: "rejected", label: "Archived / Rejected", color: "bg-surface text-muted-foreground border-border" },
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
  
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    
    import("posthog-js").then((posthog) => {
      posthog.default.capture("candidate_dossier_view", { candidateId });
    });
    
    const checkStatus = async () => {
      try {
        const token = await user.getIdToken();
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
      const token = await user?.getIdToken();
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
      const token = await user?.getIdToken();
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

  return (
    <>
      <div className="fixed top-16 lg:top-0 left-0 lg:left-[240px] right-0 h-16 bg-surface/95 backdrop-blur-md border-b border-border z-[40] flex items-center justify-between px-6 lg:px-12 transition-all duration-300">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-[13px] font-sans font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="flex items-center gap-3">

          {/* Direct Message Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMessageModalOpen(true)}
            className="gap-1.5 text-[12px] border-border text-foreground hover:bg-surface"
          >
            <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
            Message
          </Button>

          {/* Pipeline Selector (When shortlisted) */}
          {isShortlisted && (
            <div className="relative inline-block">
              <select
                value={pipelineStage}
                onChange={(e) => handleStageChange(e.target.value)}
                className="text-[12px] font-medium bg-white border border-border rounded px-3 py-1.5 text-foreground outline-none cursor-pointer hover:border-foreground transition-colors"
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
              className={`gap-1.5 text-[12px] ${isShortlisted ? "bg-white border-border text-emerald-900 font-semibold" : "border-border text-foreground hover:bg-white"}`}
            >
              {isShortlisted ? (
                <><BookmarkCheck className="h-3.5 w-3.5 text-emerald-900" /> Shortlisted</>
              ) : (
                <><Bookmark className="h-3.5 w-3.5 text-muted-foreground" /> Shortlist</>
              )}
            </Button>
          )}
        </div>
      </div>
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
