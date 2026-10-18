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
        const att = await processFileForAttachment(file);
        newAttachments.push(att);
      }

      setReplyAttachments((prev) => [...prev, ...newAttachments]);
    } catch (err: any) {
      setAttachmentError(err.message || "Failed to process attached file.");
    } finally {
      setUploadingAttachment(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setReplyAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  useEffect(() => {
    if (!authLoading && (!user || role !== "employer")) {
      router.replace("/");
    }
  }, [user, role, authLoading, router]);

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
      setError(err.message || "Failed to load messages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && role === "employer") {
      fetchMessages();
    }
  }, [user, role]);

  const threadsMap = new Map<string, { partnerId: string; partnerName: string; messages: Message[]; lastMessage: Message }>();

  messages.forEach((msg) => {
    const isSentByMe = msg.senderUid === user?.uid;
    const partnerId = isSentByMe ? msg.recipientUid : msg.senderUid;
    let partnerName = isSentByMe ? "Candidate" : msg.senderName;

    if (!threadsMap.has(partnerId)) {
      threadsMap.set(partnerId, {
        partnerId,
        partnerName,
        messages: [],
        lastMessage: msg,
      });
    } else {
      if (!isSentByMe) {
        threadsMap.get(partnerId)!.partnerName = msg.senderName;
      }
    }
    const thread = threadsMap.get(partnerId)!;
    thread.messages.push(msg);
    if (msg.timestamp > thread.lastMessage.timestamp) {
      thread.lastMessage = msg;
    }
  });

  const threads = Array.from(threadsMap.values());
  threads.sort((a, b) => b.lastMessage.timestamp - a.lastMessage.timestamp);

  const filteredThreads = threads.filter((t) =>
    t.partnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.messages.some((m) => m.content.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const activeThread = selectedPartnerId ? threadsMap.get(selectedPartnerId) : null;
  const activeConversationMessages = activeThread ? [...activeThread.messages].sort((a, b) => a.timestamp - b.timestamp) : [];

  const unreadCount = messages.filter(
    (m) => m.recipientUid === user?.uid && !readIds.has(m.id) && !m.read
  ).length;

  const handleSelectThread = async (partnerId: string) => {
    setSelectedPartnerId(partnerId);
    setSendError("");
    setReply("");

    const thread = threadsMap.get(partnerId);
    if (thread) {
      thread.messages.forEach((m) => {
        if (m.recipientUid === user?.uid && !m.read) {
          setReadIds((prev) => new Set(prev).add(m.id));
        }
      });
      try {
        const token = await user?.getIdToken();
        if (token) {
          const unreadMsgs = thread.messages.filter(m => m.recipientUid === user?.uid && !m.read);
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
    <div className="w-full min-h-screen bg-surface text-foreground">
      <div className="border-b border-border bg-white px-6 sm:px-10 py-6">
        <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-medium tracking-[0.2em] text-muted-foreground uppercase mb-1">
              Employer Communication Centre · Meritlane
            </div>
            <h1 className="text-[26px] sm:text-[32px] font-bold uppercase tracking-[0.06em] text-foreground leading-tight flex items-center gap-3">
              INBOX
              {unreadCount > 0 && (
                <span className="text-[13px] font-mono font-semibold bg-emerald-900 text-white px-2 py-0.5 rounded">
                  {unreadCount} NEW
                </span>
              )}
            </h1>
          </div>
          <button
            onClick={fetchMessages}
            className="flex items-center gap-2 px-4 py-2 border border-border bg-white hover:bg-surface text-[12px] font-mono font-semibold rounded transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            REFRESH
          </button>
        </div>
      </div>

      <div className="w-full px-6 sm:px-10 py-8">
        {loading ? (
          <div className="border border-border bg-white p-16 text-center rounded">
            <MeritlaneLoader level="section" text="Loading messages…" />
          </div>
        ) : error ? (
          <div className="border border-danger/20 bg-danger/10 p-8 text-center rounded">
            <p className="text-[14px] text-danger mb-4">{error}</p>
            <button
              onClick={fetchMessages}
              className="px-4 py-2 bg-foreground text-white text-[12px] font-mono font-semibold rounded"
            >
              RETRY
            </button>
          </div>
        ) : (
          <div className="flex gap-6 h-[calc(100vh-220px)] min-h-[500px]">
            <div className="w-full max-w-[360px] shrink-0 flex flex-col border border-border bg-white rounded overflow-hidden shadow-xs">
              <div className="border-b border-border p-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/70" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-[13px] font-sans border border-border rounded bg-surface focus:outline-none focus:border-foreground placeholder:text-muted-foreground/70"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-[#E7E2DA]">
                {filteredThreads.length === 0 ? (
                  <div className="p-10 text-center">
                    <Inbox className="h-10 w-10 text-[#C8BFB0] mx-auto mb-3" />
                    <div className="text-[13px] text-muted-foreground font-sans">No conversations yet</div>
                    <div className="text-[11px] text-muted-foreground/70 mt-1">
                      Messages with candidates will appear here
                    </div>
                  </div>
                ) : (
                  filteredThreads.map((thread) => {
                    const hasUnread = thread.messages.some(m => m.recipientUid === user?.uid && !m.read && !readIds.has(m.id));
                    return (
                      <button
                        key={thread.partnerId}
                        onClick={() => handleSelectThread(thread.partnerId)}
                        className={`w-full text-left p-4 hover:bg-surface transition-colors ${
                          selectedPartnerId === thread.partnerId ? "bg-border" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="h-9 w-9 shrink-0 rounded bg-foreground flex items-center justify-center text-white text-[11px] font-mono font-semibold">
                            {getInitials(thread.partnerName)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className={`text-[13px] font-semibold truncate ${hasUnread ? "text-foreground" : "text-muted-foreground"}`}>
                                {thread.partnerName}
                              </span>
                              <span className="text-[10px] font-mono text-muted-foreground/70 shrink-0">
                                {formatTimestamp(thread.lastMessage.timestamp)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {hasUnread && (
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-900 shrink-0" />
                              )}
                              <p className={`text-[12px] truncate ${hasUnread ? "text-foreground" : "text-muted-foreground/70"}`}>
                                {thread.lastMessage.content}
                              </p>
                            </div>
                          </div>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </div>

            <div className="flex-1 border border-border bg-white rounded overflow-hidden shadow-xs flex flex-col">
              {!activeThread ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
                  <MessageSquare className="h-12 w-12 text-[#C8BFB0] mb-4" />
                  <div className="text-[16px] font-semibold text-foreground mb-1">
                    Select a conversation
                  </div>
                  <p className="text-[13px] text-muted-foreground max-w-xs">
                    Choose a conversation from the left to view its contents and reply.
                  </p>
                </div>
              ) : (
                <>
                  <div className="border-b border-border px-6 py-4 flex items-center justify-between bg-surface">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded bg-foreground flex items-center justify-center text-white text-[11px] font-mono font-semibold">
                        {getInitials(activeThread.partnerName)}
                      </div>
                      <div>
                        <div className="text-[14px] font-semibold text-foreground">{activeThread.partnerName}</div>
                        <div className="text-[11px] font-mono text-muted-foreground">
                          {formatTimestamp(activeThread.lastMessage.timestamp)}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-medium font-semibold px-2 py-0.5 rounded border border-border text-muted-foreground uppercase tracking-wider">
                      CANDIDATE
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-5">
                    {activeConversationMessages.map((m) => {
                      const isFromMe = m.senderUid === user?.uid;
                      return (
                        <div
                          key={m.id}
                          className={`flex gap-3 ${isFromMe ? "flex-row-reverse" : ""}`}
                        >
                          <div className={`h-8 w-8 shrink-0 rounded flex items-center justify-center text-[10px] font-mono font-semibold ${
                            isFromMe ? "bg-emerald-900 text-white" : "bg-foreground text-white"
                          }`}>
                            {isFromMe ? "ME" : getInitials(m.senderName)}
                          </div>
                          <div className={`max-w-[70%] ${isFromMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
                            <div className={`px-4 py-3 rounded text-[14px] font-sans leading-relaxed border ${
                              isFromMe
                                ? "bg-emerald-900 text-white border-emerald-900/30"
                                : "bg-border text-foreground border-border"
                            }`}>
                              {m.content && <div>{m.content}</div>}
                              <MessageAttachmentsList attachments={m.attachments} isSentByMe={isFromMe} />
                            </div>
                            <span className="text-[10px] font-mono text-muted-foreground/70">
                              {formatTimestamp(m.timestamp)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={bottomRef} />
                  </div>

                  <div className="border-t border-border p-4 bg-surface">
                    {sendError && (
                      <p className="text-[12px] text-danger mb-2">{sendError}</p>
                    )}
                    {attachmentError && (
                      <p className="text-[12px] text-danger mb-2">{attachmentError}</p>
                    )}

                    <div className="flex flex-col gap-2">
                      <div className="border border-border rounded bg-white focus-within:border-foreground transition-all">
                        <textarea
                          value={reply}
                          onChange={(e) => setReply(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                              handleSendReply();
                            }
                          }}
                          placeholder="Type your reply... (Ctrl+Enter to send)"
                          rows={3}
                          className="w-full px-3 py-2.5 text-[13px] font-sans bg-transparent focus:outline-none resize-none placeholder:text-muted-foreground/70"
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

                      <div className="flex items-center justify-between gap-3 flex-wrap">
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
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-surface border border-border rounded text-[12px] font-mono text-foreground hover:border-foreground transition-colors disabled:opacity-50"
                            title="Attach files (PDF, job descriptions, contracts, etc.)"
                          >
                            <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>Attach File</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => imageInputRef.current?.click()}
                            disabled={uploadingAttachment || replyAttachments.length >= 5}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-surface border border-border rounded text-[12px] font-mono text-foreground hover:border-foreground transition-colors disabled:opacity-50"
                            title="Attach images (diagrams, photos, screenshots)"
                          >
                            <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>Attach Image</span>
                          </button>

                          {uploadingAttachment && (
                            <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground">
                              <div className="h-3 w-3 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
                              <span>Processing…</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-3 ml-auto">
                          <button
                            onClick={handleSendReply}
                            disabled={sending || uploadingAttachment || (!reply.trim() && replyAttachments.length === 0)}
                            className="px-4 py-2 bg-emerald-900 hover:bg-emerald-950 text-white text-[12px] font-mono font-semibold rounded transition-colors disabled:opacity-50 flex items-center gap-2"
                          >
                            {sending ? (
                              <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <Send className="h-3.5 w-3.5" />
                            )}
                            SEND
                          </button>
                        </div>
                      </div>
                    </div>
                    <p className="text-[10px] font-mono text-muted-foreground/70 mt-2">
                      Ctrl+Enter to send · Replies are private between you and the candidate
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
