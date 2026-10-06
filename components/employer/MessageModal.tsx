"use client";

import React, { useState, useRef } from "react";
import { X, Send, CheckCircle2, MessageSquare, Sparkles, Paperclip, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  MessageAttachment,
  AttachmentPreviewTray,
  processFileForAttachment,
} from "@/components/ui/MessageAttachments";

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
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setAttachmentError(null);
    setUploadingAttachment(true);

    try {
      const remainingSlots = 5 - attachments.length;
      if (remainingSlots <= 0) {
        throw new Error("You can attach up to 5 files per message.");
      }

      const filesToProcess = Array.from(files).slice(0, remainingSlots);
      const newAttachments: MessageAttachment[] = [];

      for (const file of filesToProcess) {
        const att = await processFileForAttachment(file);
        newAttachments.push(att);
      }

      setAttachments((prev) => [...prev, ...newAttachments]);
    } catch (err: any) {
      setAttachmentError(err.message || "Failed to process attached file.");
    } finally {
      setUploadingAttachment(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

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
    if ((!content.trim() && attachments.length === 0) || !user) return;

    setSending(true);
    setError(null);
    setAttachmentError(null);

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
          attachments,
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
        setAttachments([]);
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
      <div className="bg-white w-full max-w-lg rounded border border-[#E5E5E5] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E5E5E5] flex items-center justify-between bg-[#FAFAFA]">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded bg-[#0D0D0D] text-white flex items-center justify-center">
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
            className="p-1.5 rounded text-[#737373] hover:text-[#0D0D0D] hover:bg-[#E5E5E5]/50 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        {sentSuccess ? (
          <div className="p-10 flex flex-col items-center justify-center text-center space-y-3">
            <div className="h-12 w-12 rounded bg-[#15803D]/10 text-[#15803D] flex items-center justify-center">
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
              <div className="bg-red-500/10 border border-red-500/20 text-red-600 text-[13px] p-3 rounded">
                {error}
              </div>
            )}

            {/* Quick Templates */}
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-sans font-semibold uppercase tracking-wide text-[#737373] mb-2">
                <Sparkles className="h-3 w-3 text-[#15803D]" /> Quick Recruiter Templates
              </div>
              <div className="flex flex-wrap gap-2">
                {QUICK_TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setContent(tmpl.text)}
                    className="text-[12px] px-3 py-1 rounded border border-[#E5E5E5] bg-[#FAFAFA] hover:bg-white hover:border-[#0D0D0D] text-[#0D0D0D] font-medium transition-all"
                  >
                    {tmpl.title}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[12px] font-medium text-[#0D0D0D]">
                  Message Body
                </label>
                {uploadingAttachment && (
                  <span className="text-[11px] font-mono text-[#737373] flex items-center gap-1">
                    <span className="h-2.5 w-2.5 border-2 border-[#15803D] border-t-transparent rounded-full animate-spin" />
                    Processing file…
                  </span>
                )}
              </div>

              {attachmentError && (
                <div className="mb-2 p-2 bg-red-50 border border-red-200 text-red-600 text-[12px] rounded">
                  {attachmentError}
                </div>
              )}

              <div className="border border-[#E5E5E5] rounded focus-within:border-[#0D0D0D] transition-all bg-[#FAFAFA]">
                <textarea
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Type your message, opportunity details, or interview scheduling link..."
                  className="w-full px-4 py-3 bg-transparent text-[14px] text-[#0D0D0D] outline-none resize-none placeholder:text-[#737373]"
                />

                {attachments.length > 0 && (
                  <div className="px-3 pb-2.5">
                    <AttachmentPreviewTray
                      attachments={attachments}
                      onRemove={handleRemoveAttachment}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1 flex-wrap">
              {/* File Attachment Controls */}
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAttachment || attachments.length >= 5}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAFAFA] hover:bg-white border border-[#E5E5E5] hover:border-[#0D0D0D] rounded text-[12px] font-medium text-[#0D0D0D] transition-colors disabled:opacity-50"
                  title="Attach file (PDF, Doc, Archive)"
                >
                  <Paperclip className="h-3.5 w-3.5 text-[#737373]" />
                  <span>Attach File</span>
                </button>

                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploadingAttachment || attachments.length >= 5}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAFAFA] hover:bg-white border border-[#E5E5E5] hover:border-[#0D0D0D] rounded text-[12px] font-medium text-[#0D0D0D] transition-colors disabled:opacity-50"
                  title="Attach image"
                >
                  <ImageIcon className="h-3.5 w-3.5 text-[#737373]" />
                  <span>Attach Image</span>
                </button>
              </div>

              <div className="flex items-center gap-3 ml-auto">
                <Button type="button" variant="secondary" onClick={onClose} disabled={sending}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={sending}
                  leftIcon={<Send className="h-4 w-4" />}
                  disabled={uploadingAttachment || (!content.trim() && attachments.length === 0)}
                >
                  Send Message
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
