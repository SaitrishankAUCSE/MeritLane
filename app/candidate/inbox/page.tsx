"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { Inbox, MessageSquare } from "lucide-react";
import { ContextGuide } from "@/components/ui/ContextGuide";
import { getIdToken } from "firebase/auth";
import { auth } from "@/lib/firebase/config";

interface Message {
  id: string;
  senderUid: string;
  senderName: string;
  recipientUid: string;
  content: string;
  timestamp: number;
  read: boolean;
}

export default function CandidateInboxPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
        return;
      }

      const fetchMessages = async () => {
        try {
          const token = await getIdToken(auth.currentUser!, true);
          const res = await fetch("/api/messages", {
            headers: { Authorization: "Bearer " + token }
          });
          if (res.ok) {
            const data = await res.json();
            setMessages(data.messages || []);
          }
        } catch (e) {
          console.error("Error fetching messages", e);
        } finally {
          setFetching(false);
        }
      };

      fetchMessages();
    }
  }, [user, loading, router]);

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] overflow-y-auto">
      <div className="p-8 lg:p-12 max-w-[900px] w-full mx-auto">
        
        <ContextGuide 
          storageKey="candidate_inbox"
          title="Communications"
          description="Employers use this channel to initiate contact after reviewing your verified profile and evidence."
          steps={[
            { title: "Get Verified", description: "You must pass assessments to appear in employer discovery.", isCompleted: true },
            { title: "Get Shortlisted", description: "Employers review your dossier and add you to their pipeline.", isCompleted: messages.length > 0 },
            { title: "Respond", description: "Reply promptly to employer outreach to begin the interview process.", isCompleted: false }
          ]}
        />

        <div className="flex items-center gap-4 border-b border-[#E5E5E5] pb-8 mb-10">
          <div className="h-12 w-12 rounded-full bg-[#E5E5E5] flex items-center justify-center text-[#0D0D0D]">
            <Inbox className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-[28px] font-serif text-[#0D0D0D] leading-tight mb-1">Employer Inbox</h1>
            <p className="text-[14px] text-[#737373] font-sans">Direct messages and outreach from verified employers.</p>
          </div>
        </div>

        {fetching ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#737373]">
            <div className="h-6 w-6 border-2 border-[#D2D2D2] border-t-[#0D0D0D] rounded-full animate-spin mb-4" />
            <p className="text-[13px] font-sans">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="border border-dashed border-[#D2D2D2] rounded-2xl p-16 text-center bg-transparent">
            <MessageSquare className="h-8 w-8 mx-auto text-[#D2D2D2] mb-4" />
            <h2 className="text-[18px] font-serif text-[#0D0D0D] mb-2">No messages yet</h2>
            <p className="text-[14px] text-[#737373] font-sans max-w-sm mx-auto">
              When employers review your verified proof and shortlist you, their direct outreach will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className="bg-white border border-[#E5E5E5] rounded-xl p-6 transition-all hover:border-[#D2D2D2]">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-[15px] font-sans font-medium text-[#0D0D0D]">{msg.senderName}</div>
                  <div className="text-[12px] font-mono text-[#737373] uppercase tracking-wider">
                    {new Date(msg.timestamp).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-[14px] text-[#525252] font-sans leading-relaxed whitespace-pre-wrap mb-6">
                  {msg.content}
                </div>
                <div className="border-t border-[#E5E5E5] pt-4 flex justify-end">
                  <button 
                    onClick={() => alert("Replying to messages is currently disabled during the beta phase. Employers will contact you via email.")}
                    className="text-[13px] font-sans font-medium text-[#737373] hover:text-[#0D0D0D] px-4 py-2 border border-[#E5E5E5] rounded-md transition-colors"
                  >
                    Reply
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
