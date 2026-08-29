"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Bookmark, BookmarkCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth/AuthContext";
import { getIdToken } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { useRouter } from "next/navigation";

export function EmployerDossierActions({ candidateId }: { candidateId: string }) {
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    
    // Track dossier view
    import("posthog-js").then((posthog) => {
      posthog.default.capture("candidate_dossier_view", { candidateId });
    });
    
    const checkShortlist = async () => {
      try {
        const token = await getIdToken(auth.currentUser!, true);
        const res = await fetch("/api/employer/shortlist", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const shortlisted = data.shortlistedCandidates || [];
          setIsShortlisted(shortlisted.includes(candidateId));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    checkShortlist();
  }, [user, candidateId]);

  const toggleShortlist = async () => {
    const nextState = !isShortlisted;
    setIsShortlisted(nextState); // Optimistic UI

    try {
      const token = await getIdToken(auth.currentUser!, true);
      const res = await fetch("/api/employer/shortlist", {
        method: nextState ? "POST" : "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ candidateId })
      });

      if (!res.ok) {
        setIsShortlisted(!nextState); // Revert
      }
    } catch (e) {
      setIsShortlisted(!nextState); // Revert
    }
  };

  return (
    <div className="fixed top-16 lg:top-0 left-0 lg:left-[220px] right-0 h-16 bg-[#FAFAFA]/90 backdrop-blur-md border-b border-[#E5E5E5] z-[40] flex items-center justify-between px-6 lg:px-12 transition-all duration-300">
      <button 
        onClick={() => router.back()} 
        className="flex items-center gap-2 text-[13px] font-sans font-medium text-[#737373] hover:text-[#0D0D0D] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Discovery
      </button>

      <div className="flex items-center gap-4">
        {!loading && (
          <Button 
            variant="outline" 
            onClick={toggleShortlist}
            className={`gap-2 ${isShortlisted ? "bg-white border-[#D2D2D2] text-[#0D0D0D]" : "border-[#E5E5E5] text-[#0D0D0D] hover:bg-white"}`}
          >
            {isShortlisted ? (
              <><BookmarkCheck className="h-4 w-4" /> Shortlisted</>
            ) : (
              <><Bookmark className="h-4 w-4" /> Shortlist Candidate</>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

