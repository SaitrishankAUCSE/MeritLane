"use client";

import React, { useState } from "react";
import { X, Send, CheckCircle2, MessageSquare, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth/AuthContext";

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientId: string;
  recipientName: string;
  onMessageSent?: () => void;
}

const QUICK_TEMPLATES = [
  {
    title: "Interview Request",
    text: "Hello! We reviewed your verified profile and evidence on MeritLane and were deeply impressed by your technical work. We would like to schedule a 30-minute introductory conversation regarding an engineering role on our team.",
  },
  {
    title: "Project Inquiry",
    text: "Hi! I noticed your verified project work on MeritLane and would love to learn more about your architectural choices and current availability for technical opportunities.",
  },
  {
    title: "Fast-Track Discussion",
    text: "Hello! Given your verified assessment score on MeritLane, we would love to fast-track you to a technical interview round for our open engineering position.",
  }
];

export function MessageModal({
  isOpen,
  onClose,
  recipientId,
  recipientName,
  onMessageSent,
}: MessageModalProps) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !sending) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, sending, onClose]);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;

    setSending(true);
    setError(null);

    try {
      const token = await user.getIdToken(true);
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipientId,
          content: content.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send message");
      }

      setSentSuccess(true);
      if (onMessageSent) onMessageSent();
      setTimeout(() => {
        setSentSuccess(false);
        setContent("");
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl border border-[#E5E5E5] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E5E5E5] flex items-center justify-between bg-[#FAFAFA]">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#0D0D0D] text-white flex items-center justify-center">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-serif text-[18px] text-[#0D0D0D] leading-tight">
                Message Candidate
              </h3>
              <p className="text-[12px] text-[#737373] font-sans">
                Sending direct inquiry to <span className="font-semibold text-[#0D0D0D]">{recipientName}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#737373] hover:text-[#0D0D0D] hover:bg-[#E5E5E5]/50 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        {sentSuccess ? (
          <div className="p-10 flex flex-col items-center justify-center text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-[#15803D]/10 text-[#15803D] flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h4 className="font-serif text-[20px] text-[#0D0D0D]">Message Delivered</h4>
            <p className="text-[13px] text-[#737373]">
              Your outreach has been delivered to {recipientName}&apos;s verified inbox.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSend} className="p-6 space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-600 text-[13px] p-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Quick Templates */}
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-[#737373] mb-2">
                <Sparkles className="h-3 w-3 text-[#15803D]" /> Quick Recruiter Templates
              </div>
              <div className="flex flex-wrap gap-2">
                {QUICK_TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setContent(tmpl.text)}
                    className="text-[12px] px-3 py-1 rounded-full border border-[#E5E5E5] bg-[#FAFAFA] hover:bg-white hover:border-[#0D0D0D] text-[#0D0D0D] font-medium transition-all"
                  >
                    {tmpl.title}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[12px] font-medium text-[#0D0D0D] block mb-1.5">
                Message Body
              </label>
              <textarea
                rows={5}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type your message, opportunity details, or interview scheduling link..."
                className="w-full px-4 py-3 rounded-xl border border-[#E5E5E5] text-[14px] text-[#0D0D0D] focus:border-[#0D0D0D] focus:ring-1 focus:ring-[#0D0D0D] outline-none transition-all resize-none placeholder:text-[#737373]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={onClose} disabled={sending}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={sending}
                leftIcon={<Send className="h-4 w-4" />}
                disabled={!content.trim()}
              >
                Send Message
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
