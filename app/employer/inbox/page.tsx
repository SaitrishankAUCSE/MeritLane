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
} from "lucide-react";

interface Message {
  id: string;
  senderUid: string;
  senderName: string;
  senderRole?: string;
  recipientUid: string;
  content: string;
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
  const [selected, setSelected] = useState<Message | null>(null);
  const [thread, setThread] = useState<Message[]>([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && (!user || role !== "employer")) {
      router.replace("/login");
    }
  }, [user, role, authLoading, router]);

  const fetchMessages = async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const token = await user.getIdToken(true);
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

  const handleSelectMessage = async (msg: Message) => {
    setSelected(msg);
    setSendError("");
    setReply("");

    // Build thread: parent + current + replies
    const threadMessages = [msg];
    // Find replies to this message
    const replies = messages.filter(
      (m) => m.parentMessageId === msg.id && m.id !== msg.id
    );
    threadMessages.push(...replies);
    setThread(threadMessages.sort((a, b) => a.timestamp - b.timestamp));

    // Mark as read
    if (!msg.read && user) {
      try {
        const token = await user.getIdToken(true);
        await fetch("/api/messages", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ messageId: msg.id, read: true }),
        });
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, read: true } : m))
        );
      } catch {
        // Non-critical
      }
    }

    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handleSendReply = async () => {
    if (!reply.trim() || !selected || !user) return;
    setSending(true);
    setSendError("");
    try {
      const token = await user.getIdToken(true);
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipientUid: selected.senderUid,
          content: reply.trim(),
          parentMessageId: selected.id,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send reply.");
      }
      setReply("");
      await fetchMessages();
    } catch (err: any) {
      setSendError(err.message || "Failed to send reply.");
    } finally {
      setSending(false);
    }
  };

  const filteredMessages = messages.filter(
    (m) =>
      !m.parentMessageId &&
      (m.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.content.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const unreadCount = messages.filter((m) => !m.read && !m.parentMessageId).length;

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] text-[#1C1917]">
      {/* Header */}
      <div className="border-b border-[#E7E2DA] bg-white px-6 sm:px-10 py-6">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-mono tracking-[0.2em] text-[#78716C] uppercase mb-1">
              Employer Communication Centre · Meritlane
            </div>
            <h1 className="text-[26px] sm:text-[32px] font-bold uppercase tracking-[0.06em] text-[#1C1917] leading-tight flex items-center gap-3">
              INBOX
              {unreadCount > 0 && (
                <span className="text-[13px] font-mono font-semibold bg-[#064E3B] text-white px-2 py-0.5 rounded">
                  {unreadCount} NEW
                </span>
              )}
            </h1>
          </div>
          <button
            onClick={fetchMessages}
            className="flex items-center gap-2 px-4 py-2 border border-[#E7E2DA] bg-white hover:bg-[#FAF8F5] text-[12px] font-mono font-semibold rounded transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            REFRESH
          </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 py-8">
        {loading ? (
          <div className="border border-[#E7E2DA] bg-white p-16 text-center rounded">
            <div className="h-6 w-6 border-2 border-[#E7E2DA] border-t-[#1C1917] rounded-full animate-spin mx-auto mb-3" />
            <div className="text-[12px] font-mono text-[#78716C] uppercase tracking-wider">
              Loading messages…
            </div>
          </div>
        ) : error ? (
          <div className="border border-[#B42318]/20 bg-[#FEF2F2] p-8 text-center rounded">
            <p className="text-[14px] text-[#B42318] mb-4">{error}</p>
            <button
              onClick={fetchMessages}
              className="px-4 py-2 bg-[#1C1917] text-white text-[12px] font-mono font-semibold rounded"
            >
              RETRY
            </button>
          </div>
        ) : (
          <div className="flex gap-6 h-[calc(100vh-220px)] min-h-[500px]">
            {/* Message List */}
            <div className="w-full max-w-[360px] shrink-0 flex flex-col border border-[#E7E2DA] bg-white rounded overflow-hidden shadow-xs">
              {/* Search */}
              <div className="border-b border-[#E7E2DA] p-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#A8A29E]" />
                  <input
                    type="text"
                    placeholder="Search messages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-[13px] font-sans border border-[#E7E2DA] rounded bg-[#FAF8F5] focus:outline-none focus:border-[#1C1917] placeholder:text-[#A8A29E]"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-[#F5F1EB]">
                {filteredMessages.length === 0 ? (
                  <div className="p-10 text-center">
                    <Inbox className="h-10 w-10 text-[#C8BFB0] mx-auto mb-3" />
                    <div className="text-[13px] text-[#78716C] font-sans">No messages yet</div>
                    <div className="text-[11px] text-[#A8A29E] mt-1">
                      Messages from candidates will appear here
                    </div>
                  </div>
                ) : (
                  filteredMessages.map((msg) => (
                    <button
                      key={msg.id}
                      onClick={() => handleSelectMessage(msg)}
                      className={`w-full text-left p-4 hover:bg-[#FAF8F5] transition-colors ${
                        selected?.id === msg.id ? "bg-[#F5F1EB]" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-9 w-9 shrink-0 rounded bg-[#1C1917] flex items-center justify-center text-white text-[11px] font-mono font-semibold">
                          {getInitials(msg.senderName)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-[13px] font-semibold truncate ${!msg.read ? "text-[#1C1917]" : "text-[#78716C]"}`}>
                              {msg.senderName}
                            </span>
                            <span className="text-[10px] font-mono text-[#A8A29E] shrink-0">
                              {formatTimestamp(msg.timestamp)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {!msg.read && (
                              <div className="h-1.5 w-1.5 rounded-full bg-[#064E3B] shrink-0" />
                            )}
                            <p className={`text-[12px] truncate ${!msg.read ? "text-[#1C1917]" : "text-[#A8A29E]"}`}>
                              {msg.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Message Detail */}
            <div className="flex-1 border border-[#E7E2DA] bg-white rounded overflow-hidden shadow-xs flex flex-col">
              {!selected ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
                  <MessageSquare className="h-12 w-12 text-[#C8BFB0] mb-4" />
                  <div className="text-[16px] font-semibold text-[#1C1917] mb-1">
                    Select a message
                  </div>
                  <p className="text-[13px] text-[#78716C] max-w-xs">
                    Choose a conversation from the left to view its contents and reply.
                  </p>
                </div>
              ) : (
                <>
                  {/* Thread Header */}
                  <div className="border-b border-[#E7E2DA] px-6 py-4 flex items-center justify-between bg-[#FAF8F5]">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded bg-[#1C1917] flex items-center justify-center text-white text-[11px] font-mono font-semibold">
                        {getInitials(selected.senderName)}
                      </div>
                      <div>
                        <div className="text-[14px] font-semibold text-[#1C1917]">{selected.senderName}</div>
                        <div className="text-[11px] font-mono text-[#78716C]">
                          {formatTimestamp(selected.timestamp)}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded border border-[#E7E2DA] text-[#78716C] uppercase tracking-wider">
                      CANDIDATE
                    </span>
                  </div>

                  {/* Thread Messages */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-5">
                    {thread.map((m) => {
                      const isFromMe = m.senderUid === user?.uid;
                      return (
                        <div
                          key={m.id}
                          className={`flex gap-3 ${isFromMe ? "flex-row-reverse" : ""}`}
                        >
                          <div className={`h-8 w-8 shrink-0 rounded flex items-center justify-center text-[10px] font-mono font-semibold ${
                            isFromMe ? "bg-[#064E3B] text-white" : "bg-[#1C1917] text-white"
                          }`}>
                            {isFromMe ? "ME" : getInitials(m.senderName)}
                          </div>
                          <div className={`max-w-[70%] ${isFromMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
                            <div className={`px-4 py-3 rounded text-[14px] font-sans leading-relaxed border ${
                              isFromMe
                                ? "bg-[#064E3B] text-white border-[#064E3B]/30"
                                : "bg-[#F5F1EB] text-[#1C1917] border-[#E7E2DA]"
                            }`}>
                              {m.content}
                            </div>
                            <span className="text-[10px] font-mono text-[#A8A29E]">
                              {formatTimestamp(m.timestamp)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={bottomRef} />
                  </div>

                  {/* Reply Box */}
                  <div className="border-t border-[#E7E2DA] p-4 bg-[#FAF8F5]">
                    {sendError && (
                      <p className="text-[12px] text-[#B42318] mb-2">{sendError}</p>
                    )}
                    <div className="flex gap-3">
                      <textarea
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                            handleSendReply();
                          }
                        }}
                        placeholder="Type your reply… (Ctrl+Enter to send)"
                        rows={3}
                        className="flex-1 px-3 py-2.5 text-[13px] font-sans border border-[#E7E2DA] rounded bg-white focus:outline-none focus:border-[#1C1917] resize-none placeholder:text-[#A8A29E]"
                      />
                      <button
                        onClick={handleSendReply}
                        disabled={sending || !reply.trim()}
                        className="px-4 py-2 bg-[#064E3B] hover:bg-[#043327] text-white text-[12px] font-mono font-semibold rounded transition-colors disabled:opacity-50 flex items-center gap-2 self-end"
                      >
                        {sending ? (
                          <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Send className="h-3.5 w-3.5" />
                        )}
                        SEND
                      </button>
                    </div>
                    <p className="text-[10px] font-mono text-[#A8A29E] mt-2">
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
