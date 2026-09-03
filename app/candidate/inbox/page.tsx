"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { getIdToken } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import {
  Inbox,
  MailOpen,
  Mail,
  Search,
  RefreshCw,
  Building2,
  Calendar,
  Send,
  ShieldCheck,
  Clock,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  User,
  MessageSquare
} from "lucide-react";
import Link from "next/link";

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
  if (!name) return "E";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(ts: number): string {
  const now = new Date();
  const d = new Date(ts);
  if (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  ) {
    return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  }
  const diff = now.getTime() - ts;
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    return d.toLocaleDateString("en-GB", { weekday: "short" });
  }
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

function formatFullDate(ts: number): string {
  return new Date(ts).toLocaleString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CandidateInboxPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [fetching, setFetching] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "unread">("all");
  
  // Reply composition
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async (quiet = false) => {
    if (!quiet) setFetching(true);
    else setRefreshing(true);
    try {
      if (!auth.currentUser) return;
      const token = await getIdToken(auth.currentUser, true);
      const res = await fetch("/api/messages", {
        headers: { Authorization: "Bearer " + token },
      });
      if (res.ok) {
        const data = await res.json();
        const msgList: Message[] = data.messages || [];
        setMessages(msgList);

        // Auto-select first thread if on desktop and none selected
        if (!selectedPartnerId && msgList.length > 0) {
          const firstEmployerId = msgList[0].senderUid === user?.uid ? msgList[0].recipientUid : msgList[0].senderUid;
          setSelectedPartnerId(firstEmployerId);
        }
      }
    } catch (e) {
      console.error("Error fetching messages", e);
    } finally {
      setFetching(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
        return;
      }
      fetchMessages();
    }
  }, [user, loading, router]);

  // Group messages into conversations by partner UID (the employer)
  const threadsMap = new Map<string, { partnerId: string; partnerName: string; messages: Message[]; lastMessage: Message }>();

  messages.forEach((msg) => {
    const isSentByMe = msg.senderUid === user?.uid;
    const partnerId = isSentByMe ? msg.recipientUid : msg.senderUid;
    const partnerName = isSentByMe ? (msg.recipientUid ? "Employer" : "Recruiter") : msg.senderName;

    if (!threadsMap.has(partnerId)) {
      threadsMap.set(partnerId, {
        partnerId,
        partnerName,
        messages: [],
        lastMessage: msg,
      });
    }
    const thread = threadsMap.get(partnerId)!;
    thread.messages.push(msg);
    if (msg.timestamp > thread.lastMessage.timestamp) {
      thread.lastMessage = msg;
    }
  });

  const threads = Array.from(threadsMap.values());
  threads.sort((a, b) => b.lastMessage.timestamp - a.lastMessage.timestamp);

  const filteredThreads = threads.filter((t) => {
    const matchesSearch =
      t.partnerName.toLowerCase().includes(search.toLowerCase()) ||
      t.messages.some((m) => m.content.toLowerCase().includes(search.toLowerCase()));
    
    if (filterTab === "unread") {
      const hasUnread = t.messages.some((m) => m.recipientUid === user?.uid && !m.read && !readIds.has(m.id));
      return matchesSearch && hasUnread;
    }
    return matchesSearch;
  });

  const activeThread = selectedPartnerId ? threadsMap.get(selectedPartnerId) : null;
  const activeConversationMessages = activeThread ? [...activeThread.messages].sort((a, b) => a.timestamp - b.timestamp) : [];

  const unreadCount = messages.filter(
    (m) => m.recipientUid === user?.uid && !readIds.has(m.id) && !m.read
  ).length;

  const handleSelectThread = (partnerId: string) => {
    setSelectedPartnerId(partnerId);
    // Mark as read in local state
    const thread = threadsMap.get(partnerId);
    if (thread) {
      thread.messages.forEach((m) => {
        if (m.recipientUid === user?.uid) {
          setReadIds((prev) => new Set(prev).add(m.id));
        }
      });
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedPartnerId || !user) return;

    setSendingReply(true);
    try {
      const token = await getIdToken(auth.currentUser!, true);
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          recipientId: selectedPartnerId,
          content: replyText.trim(),
        }),
      });

      if (res.ok) {
        setReplyText("");
        await fetchMessages(true);
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    } catch (e) {
      console.error("Error sending reply", e);
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <div className="w-full h-full min-h-[calc(100dvh-64px)] lg:min-h-full flex flex-col bg-[#FAF8F5]">
      {/* ── Institutional Communications Header ── */}
      <div className="border-b border-[#E7E2DA] bg-white px-6 sm:px-10 py-5 shrink-0">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-mono tracking-[0.2em] text-[#78716C] uppercase mb-1">
              Verified Communications · Meritlane Direct Messaging
            </div>
            <h1 className="text-[26px] sm:text-[32px] text-[#1C1917] font-semibold tracking-tight leading-tight">
              Candidate Communications Hub
            </h1>
            <p className="text-[13px] text-[#78716C] font-sans mt-1">
              Direct interview invitations, technical inquiries, and recruitment outreach from verified employers.
            </p>
          </div>

          <div className="flex items-center gap-6 shrink-0">
            <div className="text-right">
              <div className="text-[10px] font-mono text-[#78716C] uppercase tracking-wider mb-0.5">Conversations</div>
              <div className="text-[24px] font-semibold text-[#1C1917]">{threads.length}</div>
            </div>
            <div className="w-px h-10 bg-[#E7E2DA]" />
            <div className="text-right">
              <div className="text-[10px] font-mono text-[#78716C] uppercase tracking-wider mb-0.5">Unread</div>
              <div className={`text-[24px] font-semibold ${unreadCount > 0 ? "text-[#064E3B]" : "text-[#78716C]"}`}>
                {unreadCount}
              </div>
            </div>
            <div className="w-px h-10 bg-[#E7E2DA]" />
            <button
              onClick={() => fetchMessages(true)}
              disabled={refreshing}
              className="h-10 w-10 border border-[#E7E2DA] bg-[#FAF8F5] hover:bg-white text-[#1C1917] rounded-full flex items-center justify-center transition-colors shadow-2xs"
              title="Refresh messages"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin text-[#064E3B]" : "text-[#78716C]"}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Messaging Workspace Split-View ── */}
      <div className="flex-1 flex overflow-hidden border-b border-[#E7E2DA]">
        {/* ── LEFT PANE: Thread Ledger List ── */}
        <div
          className={`flex flex-col border-r border-[#E7E2DA] bg-white ${
            selectedPartnerId ? "hidden lg:flex lg:w-[380px] xl:w-[420px]" : "flex w-full lg:w-[380px] xl:w-[420px]"
          } shrink-0`}
        >
          {/* Search & Filter Toolbar */}
          <div className="p-4 border-b border-[#F5F1EB] space-y-3 bg-[#FAF8F5]/50">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#78716C]" />
              <input
                type="text"
                placeholder="Search conversations or keywords…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-[13px] bg-white border border-[#E7E2DA] rounded-full text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:ring-1 focus:ring-[#1C1917] transition-all"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterTab("all")}
                className={`text-[11px] font-mono px-3 py-1 rounded-full border transition-colors ${
                  filterTab === "all"
                    ? "bg-[#1C1917] text-white border-[#1C1917]"
                    : "bg-white text-[#78716C] border-[#E7E2DA] hover:text-[#1C1917]"
                }`}
              >
                All Messages ({threads.length})
              </button>
              <button
                onClick={() => setFilterTab("unread")}
                className={`text-[11px] font-mono px-3 py-1 rounded-full border transition-colors ${
                  filterTab === "unread"
                    ? "bg-[#064E3B] text-white border-[#064E3B]"
                    : "bg-white text-[#78716C] border-[#E7E2DA] hover:text-[#1C1917]"
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>
          </div>

          {/* Threads List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#F5F1EB]">
            {fetching ? (
              <div className="flex flex-col items-center justify-center p-16 gap-3 text-[#78716C]">
                <div className="h-5 w-5 border-2 border-[#E7E2DA] border-t-[#1C1917] rounded-full animate-spin" />
                <p className="text-[12px] font-mono uppercase tracking-wider">Syncing communications…</p>
              </div>
            ) : filteredThreads.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="h-12 w-12 rounded-2xl bg-[#FAF8F5] border border-[#E7E2DA] flex items-center justify-center mb-3">
                  <Inbox className="h-5 w-5 text-[#A8A29E]" />
                </div>
                <div className="text-[14px] font-semibold text-[#1C1917] mb-1">
                  {search ? "No matching conversations" : "No messages yet"}
                </div>
                <p className="text-[12px] text-[#78716C] max-w-xs leading-relaxed font-sans">
                  {search
                    ? "Try searching for a different company or keyword."
                    : "When verified employers shortlist your technical dossier, interview invitations will appear here."}
                </p>
              </div>
            ) : (
              filteredThreads.map((thread) => {
                const isSelected = selectedPartnerId === thread.partnerId;
                const hasUnread = thread.messages.some(
                  (m) => m.recipientUid === user?.uid && !m.read && !readIds.has(m.id)
                );

                return (
                  <button
                    key={thread.partnerId}
                    onClick={() => handleSelectThread(thread.partnerId)}
                    className={`w-full text-left p-4.5 transition-all flex items-start gap-3.5 hover:bg-[#FAF8F5] relative ${
                      isSelected
                        ? "bg-[#FAF8F5] border-l-4 border-l-[#064E3B]"
                        : hasUnread
                        ? "bg-white"
                        : "bg-white/80"
                    }`}
                  >
                    {/* Employer Avatar */}
                    <div className="h-10 w-10 rounded-full bg-[#1C1917] text-white flex items-center justify-center text-[12px] font-mono font-bold shrink-0 shadow-2xs border border-[#E7E2DA]">
                      {getInitials(thread.partnerName)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <div className="flex items-center gap-1.5 truncate">
                          <span
                            className={`text-[13.5px] truncate ${
                              hasUnread ? "font-bold text-[#1C1917]" : "font-semibold text-[#333333]"
                            }`}
                          >
                            {thread.partnerName}
                          </span>
                          <ShieldCheck className="h-3.5 w-3.5 text-[#064E3B] shrink-0" />
                        </div>
                        <span className="text-[11px] font-mono text-[#78716C] shrink-0">
                          {formatDate(thread.lastMessage.timestamp)}
                        </span>
                      </div>

                      <div className="text-[11px] font-mono uppercase tracking-wider text-[#064E3B] mb-1">
                        Interview Invitation
                      </div>

                      <p
                        className={`text-[12.5px] line-clamp-2 leading-relaxed ${
                          hasUnread ? "text-[#1C1917] font-medium" : "text-[#78716C]"
                        }`}
                      >
                        {thread.lastMessage.content}
                      </p>
                    </div>

                    {hasUnread && (
                      <div className="h-2 w-2 rounded-full bg-[#064E3B] shrink-0 mt-2" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── RIGHT PANE: Conversation View & Action Center ── */}
        <div className={`flex-1 flex flex-col bg-[#FAF8F5] ${!selectedPartnerId ? "hidden lg:flex" : "flex"}`}>
          {activeThread ? (
            <>
              {/* Conversation Top Bar */}
              <div className="px-6 py-4 bg-white border-b border-[#E7E2DA] flex items-center justify-between gap-4 shrink-0 shadow-2xs">
                <div className="flex items-center gap-3.5">
                  <button
                    onClick={() => setSelectedPartnerId(null)}
                    className="lg:hidden p-1.5 -ml-1 text-[#78716C] hover:text-[#1C1917]"
                  >
                    ← Back
                  </button>
                  <div className="h-10 w-10 rounded-full bg-[#1C1917] text-white flex items-center justify-center text-[12px] font-mono font-bold shrink-0">
                    {getInitials(activeThread.partnerName)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-[16px] font-bold text-[#1C1917]">{activeThread.partnerName}</h2>
                      <span className="text-[10px] font-mono font-semibold uppercase text-[#064E3B] bg-[#064E3B]/10 border border-[#064E3B]/20 px-2 py-0.5 rounded-full">
                        Verified Employer
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[12px] text-[#78716C] font-sans mt-0.5">
                      <Building2 className="h-3.5 w-3.5 text-[#78716C]" />
                      <span>Technical Hiring & Talent Acquisition Team</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link href="/candidate/jobs">
                    <button className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 border border-[#E7E2DA] bg-[#FAF8F5] hover:bg-white text-[11px] font-mono font-semibold text-[#1C1917] rounded-full transition-colors">
                      <span>EXPLORE JOBS</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </Link>
                </div>
              </div>

              {/* Subject Strip */}
              <div className="px-6 py-2.5 bg-[#FAF8F5] border-b border-[#E7E2DA] flex items-center justify-between text-[11px] font-mono text-[#78716C] uppercase tracking-wider shrink-0">
                <div className="flex items-center gap-2">
                  <MailOpen className="h-3.5 w-3.5 text-[#064E3B]" />
                  <span>Topic: Technical Role Consideration & Candidate Evaluation</span>
                </div>
                <span>Secured Protocol</span>
              </div>

              {/* Message Stream */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
                {activeConversationMessages.map((msg) => {
                  const isSentByMe = msg.senderUid === user?.uid;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isSentByMe ? "items-end" : "items-start"}`}
                    >
                      <div className="flex items-center gap-2 mb-1.5 text-[11px] font-mono text-[#78716C]">
                        <span className="font-semibold text-[#1C1917]">
                          {isSentByMe ? "You (Candidate)" : msg.senderName}
                        </span>
                        <span>·</span>
                        <span>{formatFullDate(msg.timestamp)}</span>
                      </div>

                      <div
                        className={`max-w-[720px] p-5 sm:p-6 rounded-2xl border text-[14px] leading-relaxed shadow-xs ${
                          isSentByMe
                            ? "bg-[#064E3B] text-white border-[#064E3B] rounded-br-xs"
                            : "bg-white text-[#1C1917] border-[#E7E2DA] rounded-bl-xs"
                        }`}
                      >
                        <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Form */}
              <div className="p-4 sm:p-5 bg-white border-t border-[#E7E2DA] shrink-0">
                <form onSubmit={handleSendReply} className="space-y-3">
                  <div className="relative">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Write a direct reply to ${activeThread.partnerName}…`}
                      rows={3}
                      className="w-full p-3.5 bg-[#FAF8F5] border border-[#E7E2DA] rounded-xl text-[13px] text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:ring-1 focus:ring-[#1C1917] resize-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                          handleSendReply(e);
                        }
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[11px] font-mono text-[#78716C]">
                      Press <kbd className="bg-[#FAF8F5] border border-[#E7E2DA] px-1.5 py-0.5 rounded text-[10px]">Ctrl+Enter</kbd> to dispatch
                    </div>

                    <button
                      type="submit"
                      disabled={sendingReply || !replyText.trim()}
                      className="flex items-center gap-2 px-5 py-2.5 bg-[#064E3B] hover:bg-[#043327] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[12px] font-mono font-semibold uppercase tracking-wider rounded-full transition-colors shadow-xs"
                    >
                      {sendingReply ? (
                        <>
                          <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>SENDING…</span>
                        </>
                      ) : (
                        <>
                          <span>SEND DIRECT REPLY</span>
                          <Send className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            /* No conversation selected: Executive Full-Screen Communications Center */
            <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 overflow-y-auto">
              <div className="max-w-2xl w-full space-y-8 text-center">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-white border border-[#E7E2DA] shadow-xs text-[#064E3B] mx-auto">
                  <Mail className="h-8 w-8" />
                </div>

                <div className="space-y-2">
                  <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#064E3B]">
                    Institutional Messaging Engine
                  </div>
                  <h2 className="text-[24px] sm:text-[28px] font-bold text-[#1C1917] tracking-tight">
                    Direct Employer Inquiries
                  </h2>
                  <p className="text-[14px] text-[#78716C] max-w-lg mx-auto leading-relaxed">
                    Verified companies initiate direct contact with candidates after auditing proctored coding assessments, GitHub repositories, and verified technical dossiers.
                  </p>
                </div>

                {/* 3 Step Telemetry Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                  <div className="bg-white border border-[#E7E2DA] p-5 rounded-xl shadow-2xs space-y-2">
                    <div className="text-[10px] font-mono text-[#064E3B] uppercase font-bold">1. Verified Skills</div>
                    <div className="text-[14px] font-bold text-[#1C1917]">Take Assessments</div>
                    <p className="text-[12px] text-[#78716C] leading-relaxed">
                      Pass timed 15-minute proctored evaluations to earn verified skill badges.
                    </p>
                    <Link href="/candidate/verification" className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-[#064E3B] hover:underline pt-1">
                      <span>Take tests</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>

                  <div className="bg-white border border-[#E7E2DA] p-5 rounded-xl shadow-2xs space-y-2">
                    <div className="text-[10px] font-mono text-[#064E3B] uppercase font-bold">2. Code Evidence</div>
                    <div className="text-[14px] font-bold text-[#1C1917]">Sync Git & Projects</div>
                    <p className="text-[12px] text-[#78716C] leading-relaxed">
                      Connect repositories to showcase real commit histories and production deployments.
                    </p>
                    <Link href="/candidate/dashboard" className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-[#064E3B] hover:underline pt-1">
                      <span>Add projects</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>

                  <div className="bg-white border border-[#E7E2DA] p-5 rounded-xl shadow-2xs space-y-2">
                    <div className="text-[10px] font-mono text-[#064E3B] uppercase font-bold">3. Applications</div>
                    <div className="text-[14px] font-bold text-[#1C1917]">Browse Openings</div>
                    <p className="text-[12px] text-[#78716C] leading-relaxed">
                      Dispatch your 100% completed dossier directly to open engineering roles.
                    </p>
                    <Link href="/candidate/jobs" className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-[#064E3B] hover:underline pt-1">
                      <span>Browse jobs</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
