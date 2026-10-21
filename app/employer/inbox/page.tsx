"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import {
  Inbox,
  MailOpen,
  Mail,
  Search,
  RefreshCw,
  Send,
  User,
  MessageSquare,
  Clock,
  ChevronRight,
  Paperclip,
  Image as ImageIcon,
} from "lucide-react";
import {
  MessageAttachment,
  AttachmentPreviewTray,
  MessageAttachmentsList,
  processFileForAttachment,
} from "@/components/ui/MessageAttachments";
import { MeritlaneLoader } from "@/components/ui/MeritlaneLoader";
import { Button } from "@/components/ui/Button";

interface Message {
  id: string;
  senderUid: string;
  senderName: string;
  senderRole?: string;
  recipientUid: string;
  content: string;
  attachments?: MessageAttachment[];
  parentMessageId?: string | null;
  timestamp: number;
  read: boolean;
}

function getInitials(name: string): string {
  if (!name) return "C";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  }
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

export default function EmployerInboxPage() {
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [reply, setReply] = useState("");
  const [replyAttachments, setReplyAttachments] = useState<MessageAttachment[]>([]);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [attachmentError, setAttachmentError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setAttachmentError("");
    setUploadingAttachment(true);

    try {
      const remainingSlots = 5 - replyAttachments.length;
      if (remainingSlots <= 0) {
        throw new Error("You can attach up to 5 files per message.");
      }

      const filesToProcess = Array.from(files).slice(0, remainingSlots);
      const newAttachments: MessageAttachment[] = [];

      for (const file of filesToProcess) {
        const attachment = await processFileForAttachment(file);
        newAttachments.push(attachment);
      }

      setReplyAttachments((prev) => [...prev, ...newAttachments]);
    } catch (err: any) {
      setAttachmentError(err.message || "Failed to process file.");
    } finally {
      setUploadingAttachment(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    setReplyAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
  };

  const fetchMessages = async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/messages", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load messages.");
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load messages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && (!user || role !== "employer")) {
      router.replace("/");
      return;
    }
    if (user && role === "employer") {
      fetchMessages();
    }
  }, [user, role, authLoading, router]);

  const conversationsByPartner = React.useMemo(() => {
    if (!user) return {};
    const grouped: Record<string, { partnerId: string; partnerName: string; messages: Message[]; lastMessage: Message }> = {};

    messages.forEach((m) => {
      const partnerId = m.senderUid === user.uid ? m.recipientUid : m.senderUid;
      const partnerName = m.senderUid === user.uid ? "Candidate" : m.senderName;

      if (!grouped[partnerId]) {
        grouped[partnerId] = {
          partnerId,
          partnerName,
          messages: [],
          lastMessage: m,
        };
      }
      grouped[partnerId].messages.push(m);
      if (m.timestamp > grouped[partnerId].lastMessage.timestamp) {
        grouped[partnerId].lastMessage = m;
        if (m.senderUid !== user.uid) {
          grouped[partnerId].partnerName = m.senderName;
        }
      }
    });

    Object.values(grouped).forEach((conv) => {
      conv.messages.sort((a, b) => a.timestamp - b.timestamp);
    });

    return grouped;
  }, [messages, user]);

  const sortedThreads = React.useMemo(() => {
    return Object.values(conversationsByPartner).sort(
      (a, b) => b.lastMessage.timestamp - a.lastMessage.timestamp
    );
  }, [conversationsByPartner]);

  const filteredThreads = React.useMemo(() => {
    if (!searchTerm.trim()) return sortedThreads;
    const term = searchTerm.toLowerCase();
    return sortedThreads.filter(
      (t) =>
        t.partnerName.toLowerCase().includes(term) ||
        t.lastMessage.content.toLowerCase().includes(term)
    );
  }, [sortedThreads, searchTerm]);

  useEffect(() => {
    if (!selectedPartnerId && sortedThreads.length > 0) {
      setSelectedPartnerId(sortedThreads[0].partnerId);
    }
  }, [sortedThreads, selectedPartnerId]);

  const activeThread = selectedPartnerId ? conversationsByPartner[selectedPartnerId] : null;
  const activeConversationMessages = activeThread ? activeThread.messages : [];

  const unreadCount = messages.filter(
    (m) => m.recipientUid === user?.uid && !m.read && !readIds.has(m.id)
  ).length;

  const handleSelectThread = async (partnerId: string) => {
    setSelectedPartnerId(partnerId);
    const thread = conversationsByPartner[partnerId];
    if (thread) {
      thread.messages.forEach((m) => {
        if (m.recipientUid === user?.uid && !m.read) {
          setReadIds((prev) => new Set(prev).add(m.id));
        }
      });
      try {
        const token = await user?.getIdToken();
        if (token) {
          const unreadMsgs = thread.messages.filter((m) => m.recipientUid === user?.uid && !m.read);
          for (let u of unreadMsgs) {
            fetch("/api/messages", {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ messageId: u.id, read: true }),
            });
          }
        }
      } catch (err) {}
    }
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handleSendReply = async () => {
    if ((!reply.trim() && replyAttachments.length === 0) || !selectedPartnerId || !user) return;
    setSending(true);
    setSendError("");
    setAttachmentError("");
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipientId: selectedPartnerId,
          content: reply.trim(),
          attachments: replyAttachments,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send reply.");
      }
      setReply("");
      setReplyAttachments([]);
      await fetchMessages();
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err: any) {
      setSendError(err.message || "Failed to send reply.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F8F8F6] text-[#101010] font-sans pb-16">
      {/* ── Top Header Strip ── */}
      <div className="border-b border-black/[0.08] bg-white px-6 sm:px-10 py-5">
        <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-medium text-black/50 mb-1">
              Employer Communication Center · MeritLane
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#101010] flex items-center gap-2.5">
              <span>Candidate Messages</span>
              {unreadCount > 0 && (
                <span className="text-xs font-mono font-medium bg-[#101010] text-white px-2.5 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </h1>
          </div>
          <Button
            variant="outline"
            onClick={fetchMessages}
            className="flex items-center gap-1.5 px-4 py-2 text-xs rounded-full border-black/[0.12] bg-white text-[#101010] hover:bg-black/[0.04] shadow-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-6">
        {loading ? (
          <div className="rounded-2xl border border-black/[0.08] bg-white p-16 text-center shadow-xs">
            <MeritlaneLoader level="section" text="Loading messages…" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center">
            <p className="text-sm text-red-700 mb-4">{error}</p>
            <Button
              onClick={fetchMessages}
              className="rounded-full bg-[#101010] text-white text-xs px-4 py-2 shadow-xs"
            >
              Retry
            </Button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-5 h-[calc(100vh-220px)] min-h-[550px]">
            {/* Conversations Sidebar */}
            <div className="w-full lg:w-[360px] shrink-0 flex flex-col rounded-2xl border border-black/[0.08] bg-white overflow-hidden shadow-xs">
              <div className="border-b border-black/[0.08] p-3.5">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40" />
                  <input
                    type="text"
                    placeholder="Search candidate conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-xs font-sans rounded-full border border-black/[0.12] bg-[#F8F8F6] text-[#101010] focus:outline-none focus:border-black placeholder:text-black/40"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-black/[0.06]">
                {filteredThreads.length === 0 ? (
                  <div className="p-10 text-center">
                    <Inbox className="h-8 w-8 text-black/30 mx-auto mb-3" />
                    <div className="text-xs font-semibold text-[#101010]">No conversations yet</div>
                    <div className="text-[11px] text-black/50 mt-1">
                      Messages with verified candidates will appear here
                    </div>
                  </div>
                ) : (
                  filteredThreads.map((thread) => {
                    const hasUnread = thread.messages.some(
                      (m) => m.recipientUid === user?.uid && !m.read && !readIds.has(m.id)
                    );
                    const isSelected = selectedPartnerId === thread.partnerId;

                    return (
                      <button
                        key={thread.partnerId}
                        onClick={() => handleSelectThread(thread.partnerId)}
                        className={`w-full text-left p-4 hover:bg-black/[0.02] transition-colors relative ${
                          isSelected ? "bg-black/[0.04]" : ""
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#101010]" />
                        )}
                        <div className="flex items-start gap-3">
                          <div className="h-9 w-9 shrink-0 rounded-full bg-black/[0.05] border border-black/[0.08] flex items-center justify-center text-[#101010] text-xs font-semibold">
                            {getInitials(thread.partnerName)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span
                                className={`text-xs truncate ${
                                  hasUnread ? "font-bold text-[#101010]" : "font-medium text-black/80"
                                }`}
                              >
                                {thread.partnerName}
                              </span>
                              <span className="text-[10px] text-black/40 shrink-0 font-mono">
                                {formatTimestamp(thread.lastMessage.timestamp)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {hasUnread && (
                                <div className="h-1.5 w-1.5 rounded-full bg-[#101010] shrink-0" />
                              )}
                              <p
                                className={`text-xs truncate ${
                                  hasUnread ? "text-[#101010] font-medium" : "text-black/50"
                                }`}
                              >
                                {thread.lastMessage.content}
                              </p>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 rounded-2xl border border-black/[0.08] bg-white overflow-hidden shadow-xs flex flex-col">
              {!activeThread ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
                  <div className="h-12 w-12 rounded-full bg-black/[0.04] border border-black/[0.08] flex items-center justify-center text-black/40 mb-3">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <div className="text-sm font-semibold text-[#101010] mb-1">
                    Select a conversation
                  </div>
                  <p className="text-xs text-black/50 max-w-xs">
                    Choose a candidate thread from the left to view messages and schedule interviews.
                  </p>
                </div>
              ) : (
                <>
                  <div className="border-b border-black/[0.08] px-6 py-4 flex items-center justify-between bg-[#F8F8F6]">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-black/[0.05] border border-black/[0.08] flex items-center justify-center text-[#101010] text-xs font-bold">
                        {getInitials(activeThread.partnerName)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#101010]">{activeThread.partnerName}</div>
                        <div className="text-[11px] text-black/50">
                          Active thread · {formatTimestamp(activeThread.lastMessage.timestamp)}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-full border border-black/[0.08] bg-black/[0.04] text-black/70">
                      Candidate
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {activeConversationMessages.map((m) => {
                      const isFromMe = m.senderUid === user?.uid;
                      return (
                        <div
                          key={m.id}
                          className={`flex gap-2.5 ${isFromMe ? "flex-row-reverse" : ""}`}
                        >
                          <div
                            className={`h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-[10px] font-semibold ${
                              isFromMe
                                ? "bg-[#101010] text-white"
                                : "bg-black/[0.05] border border-black/[0.08] text-[#101010]"
                            }`}
                          >
                            {isFromMe ? "You" : getInitials(m.senderName)}
                          </div>
                          <div className={`max-w-[75%] ${isFromMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
                            <div
                              className={`px-4 py-3 text-xs leading-relaxed ${
                                isFromMe
                                  ? "bg-[#101010] text-white rounded-2xl rounded-br-xs shadow-xs"
                                  : "bg-[#F8F8F6] border border-black/[0.08] text-[#101010] rounded-2xl rounded-bl-xs shadow-2xs"
                              }`}
                            >
                              {m.content && <div>{m.content}</div>}
                              <MessageAttachmentsList attachments={m.attachments} isSentByMe={isFromMe} />
                            </div>
                            <span className="text-[10px] font-mono text-black/40">
                              {formatTimestamp(m.timestamp)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={bottomRef} />
                  </div>

                  <div className="border-t border-black/[0.08] p-4 bg-[#F8F8F6]">
                    {sendError && (
                      <p className="text-xs text-red-600 mb-2">{sendError}</p>
                    )}
                    {attachmentError && (
                      <p className="text-xs text-red-600 mb-2">{attachmentError}</p>
                    )}

                    <div className="flex flex-col gap-2">
                      <div className="border border-black/[0.12] rounded-2xl bg-white focus-within:border-black transition-all shadow-xs overflow-hidden">
                        <textarea
                          value={reply}
                          onChange={(e) => setReply(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                              handleSendReply();
                            }
                          }}
                          placeholder="Type your response to the candidate… (Ctrl+Enter to send)"
                          rows={3}
                          className="w-full px-4 py-3 text-xs font-sans bg-transparent focus:outline-none resize-none placeholder:text-black/40"
                        />

                        {replyAttachments.length > 0 && (
                          <div className="px-3 pb-2.5">
                            <AttachmentPreviewTray
                              attachments={replyAttachments}
                              onRemove={handleRemoveAttachment}
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-3 flex-wrap pt-1">
                        {/* Hidden file inputs & attach buttons */}
                        <div className="flex items-center gap-1.5">
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
                            disabled={uploadingAttachment || replyAttachments.length >= 5}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-black/[0.04] border border-black/[0.12] rounded-full text-xs font-medium text-[#101010] transition-colors disabled:opacity-50 shadow-2xs"
                            title="Attach files (PDF, job descriptions, contracts, etc.)"
                          >
                            <Paperclip className="h-3.5 w-3.5 text-black/60" />
                            <span>Attach File</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => imageInputRef.current?.click()}
                            disabled={uploadingAttachment || replyAttachments.length >= 5}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-black/[0.04] border border-black/[0.12] rounded-full text-xs font-medium text-[#101010] transition-colors disabled:opacity-50 shadow-2xs"
                            title="Attach images (diagrams, photos, screenshots)"
                          >
                            <ImageIcon className="h-3.5 w-3.5 text-black/60" />
                            <span>Attach Image</span>
                          </button>

                          {uploadingAttachment && (
                            <div className="flex items-center gap-1.5 text-xs text-black/50">
                              <div className="h-3 w-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                              <span>Uploading…</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-3 ml-auto">
                          <Button
                            onClick={handleSendReply}
                            disabled={sending || uploadingAttachment || (!reply.trim() && replyAttachments.length === 0)}
                            className="px-5 py-2 bg-[#101010] hover:bg-black text-white text-xs font-medium rounded-full shadow-xs transition-colors disabled:opacity-50 flex items-center gap-2"
                          >
                            {sending ? (
                              <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <Send className="h-3.5 w-3.5" />
                            )}
                            <span>Send</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                    <p className="text-[11px] text-black/40 mt-1">
                      Ctrl+Enter to send · Messages are encrypted and archived for verification audits
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
