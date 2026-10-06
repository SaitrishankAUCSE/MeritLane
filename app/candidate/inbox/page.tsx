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
  Send,
  ShieldCheck,
  ExternalLink,
  Paperclip,
  Image as ImageIcon,
  Archive,
  ArchiveRestore,
  CheckCheck,
  Check,
  X,
  Lock,
  ArrowRight,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import {
  MessageAttachment,
  AttachmentPreviewTray,
  MessageAttachmentsList,
  processFileForAttachment,
} from "@/components/ui/MessageAttachments";

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
  if (!name) return "E";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatListTime(ts: number): string {
  const now = new Date();
  const d = new Date(ts);
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  if (isToday) {
    return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  }

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return "Yesterday";
  }

  const diffMs = now.getTime() - ts;
  if (diffMs < 7 * 24 * 60 * 60 * 1000) {
    return d.toLocaleDateString("en-GB", { weekday: "short" });
  }

  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

function formatMessageTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function groupMessagesByDate(msgs: Message[]) {
  const groups: { dateLabel: string; messages: Message[] }[] = [];
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  msgs.forEach((m) => {
    const d = new Date(m.timestamp);
    let dateLabel = d.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    if (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    ) {
      dateLabel = "Today";
    } else if (
      d.getDate() === yesterday.getDate() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getFullYear() === yesterday.getFullYear()
    ) {
      dateLabel = "Yesterday";
    }

    const last = groups[groups.length - 1];
    if (last && last.dateLabel === dateLabel) {
      last.messages.push(m);
    } else {
      groups.push({ dateLabel, messages: [m] });
    }
  });

  return groups;
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
  const [filterTab, setFilterTab] = useState<"all" | "unread" | "archived">("all");
  const [archivedPartnerIds, setArchivedPartnerIds] = useState<Set<string>>(new Set());

  // Reply composition
  const [replyText, setReplyText] = useState("");
  const [replyAttachments, setReplyAttachments] = useState<MessageAttachment[]>([]);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [sendingReply, setSendingReply] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load archived conversations from localStorage
  useEffect(() => {
    if (user?.uid) {
      try {
        const stored = localStorage.getItem(`meritlane_archived_conversations_${user.uid}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setArchivedPartnerIds(new Set(parsed));
          }
        }
      } catch (err) {
        console.error("Failed to load archived conversations", err);
      }
    }
  }, [user?.uid]);

  const toggleArchive = (partnerId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setArchivedPartnerIds((prev) => {
      const next = new Set(prev);
      if (next.has(partnerId)) {
        next.delete(partnerId);
      } else {
        next.add(partnerId);
      }
      if (user?.uid) {
        try {
          localStorage.setItem(
            `meritlane_archived_conversations_${user.uid}`,
            JSON.stringify(Array.from(next))
          );
        } catch (err) {
          console.error("Failed to save archived conversations", err);
        }
      }
      return next;
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setAttachmentError(null);
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

        // Auto-select first active thread on desktop if none currently selected
        if (!selectedPartnerId && msgList.length > 0) {
          const firstEmployerId =
            msgList[0].senderUid === user?.uid ? msgList[0].recipientUid : msgList[0].senderUid;
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
        router.replace("/");
        return;
      }
      fetchMessages();
    }
  }, [user, loading, router]);

  // Group messages into conversations by partner UID (the employer)
  const threadsMap = new Map<
    string,
    { partnerId: string; partnerName: string; messages: Message[]; lastMessage: Message }
  >();

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

  const allThreads = Array.from(threadsMap.values());
  allThreads.sort((a, b) => b.lastMessage.timestamp - a.lastMessage.timestamp);

  const activeNonArchivedThreads = allThreads.filter((t) => !archivedPartnerIds.has(t.partnerId));
  const archivedThreads = allThreads.filter((t) => archivedPartnerIds.has(t.partnerId));

  const totalUnreadCount = messages.filter(
    (m) => m.recipientUid === user?.uid && !readIds.has(m.id) && !m.read
  ).length;

  const unreadNonArchivedCount = activeNonArchivedThreads.reduce((acc, t) => {
    const unreadInThread = t.messages.some(
      (m) => m.recipientUid === user?.uid && !m.read && !readIds.has(m.id)
    );
    return acc + (unreadInThread ? 1 : 0);
  }, 0);

  const filteredThreads = allThreads.filter((t) => {
    const isArchived = archivedPartnerIds.has(t.partnerId);

    // Filter by tab
    if (filterTab === "archived") {
      if (!isArchived) return false;
    } else {
      if (isArchived) return false;
      if (filterTab === "unread") {
        const hasUnread = t.messages.some(
          (m) => m.recipientUid === user?.uid && !m.read && !readIds.has(m.id)
        );
        if (!hasUnread) return false;
      }
    }

    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchesName = t.partnerName.toLowerCase().includes(q);
      const matchesContent = t.messages.some((m) => m.content.toLowerCase().includes(q));
      return matchesName || matchesContent;
    }

    return true;
  });

  const activeThread = selectedPartnerId ? threadsMap.get(selectedPartnerId) : null;
  const isSelectedArchived = selectedPartnerId ? archivedPartnerIds.has(selectedPartnerId) : false;
  const activeConversationMessages = activeThread
    ? [...activeThread.messages].sort((a, b) => a.timestamp - b.timestamp)
    : [];

  const messageGroups = groupMessagesByDate(activeConversationMessages);

  // Auto scroll to bottom when conversation messages change
  useEffect(() => {
    if (selectedPartnerId) {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [selectedPartnerId, activeConversationMessages.length]);

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

  const handleSendReply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!replyText.trim() && replyAttachments.length === 0) || !selectedPartnerId || !user) return;

    setSendingReply(true);
    setAttachmentError(null);
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
          attachments: replyAttachments,
        }),
      });

      if (res.ok) {
        setReplyText("");
        setReplyAttachments([]);
        await fetchMessages(true);
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else {
        const data = await res.json();
        setAttachmentError(data.error || "Failed to send message.");
      }
    } catch (e: any) {
      console.error("Error sending reply", e);
      setAttachmentError(e.message || "Failed to send reply.");
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <div className="w-full h-full min-h-0 flex flex-col bg-[#F8F6F3] overflow-hidden select-none sm:select-auto">
      {/* ── Compact Institutional Application Toolbar (Fixed, No Scroll) ── */}
      <header className="h-14 bg-white border-b border-[#E7E2DA] px-4 sm:px-6 flex items-center justify-between shrink-0 z-10 shadow-2xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[#064E3B] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Mail className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[15px] sm:text-[16px] font-semibold text-[#1C1917] tracking-tight">
                  Candidate Communications
                </h1>
                <span className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-[#064E3B] bg-[#064E3B]/10 px-2 py-0.5 rounded-full border border-[#064E3B]/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#064E3B] animate-pulse" />
                  Direct Wire
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Toolbar Metrics & Refresh */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-2 text-[12px] font-mono text-[#78716C] bg-[#FAF8F5] px-3 py-1.5 rounded-lg border border-[#E7E2DA]">
            <span>Conversations:</span>
            <span className="font-bold text-[#1C1917]">{activeNonArchivedThreads.length}</span>
            {totalUnreadCount > 0 && (
              <>
                <span className="text-[#D6D3D1]">|</span>
                <span className="text-[#064E3B] font-bold">{totalUnreadCount} unread</span>
              </>
            )}
          </div>

          <button
            onClick={() => fetchMessages(true)}
            disabled={refreshing}
            className="h-8.5 px-3 border border-[#E7E2DA] bg-[#FAF8F5] hover:bg-white text-[#1C1917] rounded-lg flex items-center gap-1.5 text-[12px] font-medium transition-colors shadow-2xs disabled:opacity-50"
            title="Refresh messages"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-[#064E3B]" : "text-[#78716C]"}`} />
            <span className="hidden md:inline">Sync</span>
          </button>
        </div>
      </header>

      {/* ── Main Chat Workspace (Fixed height, only internal panes scroll) ── */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* ── LEFT PANE: Conversation Ledger List ── */}
        <aside
          className={`flex flex-col border-r border-[#E7E2DA] bg-white h-full min-h-0 ${
            selectedPartnerId
              ? "hidden lg:flex lg:w-[350px] xl:w-[390px]"
              : "flex w-full lg:w-[350px] xl:w-[390px]"
          } shrink-0`}
        >
          {/* Search & Filter Header */}
          <div className="p-3 sm:p-3.5 border-b border-[#E7E2DA] bg-[#FAF8F5]/80 space-y-2.5 shrink-0">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#78716C]" />
              <input
                type="text"
                placeholder="Search chats or keywords…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8.5 pr-8 py-1.5 text-[12.5px] bg-white border border-[#E7E2DA] rounded-lg text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:ring-1 focus:ring-[#1C1917] focus:border-[#1C1917] transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#78716C] hover:text-[#1C1917]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Filter Pills with real-time counters including Archive */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setFilterTab("all")}
                className={`flex-1 text-[11px] font-mono py-1 px-2 rounded-md border text-center transition-all ${
                  filterTab === "all"
                    ? "bg-[#1C1917] text-white border-[#1C1917] font-semibold shadow-2xs"
                    : "bg-white text-[#78716C] border-[#E7E2DA] hover:bg-[#FAF8F5] hover:text-[#1C1917]"
                }`}
              >
                All ({activeNonArchivedThreads.length})
              </button>

              <button
                onClick={() => setFilterTab("unread")}
                className={`flex-1 text-[11px] font-mono py-1 px-2 rounded-md border text-center transition-all ${
                  filterTab === "unread"
                    ? "bg-[#064E3B] text-white border-[#064E3B] font-semibold shadow-2xs"
                    : "bg-white text-[#78716C] border-[#E7E2DA] hover:bg-[#FAF8F5] hover:text-[#1C1917]"
                }`}
              >
                Unread ({unreadNonArchivedCount})
              </button>

              <button
                onClick={() => setFilterTab("archived")}
                className={`flex-1 text-[11px] font-mono py-1 px-2 rounded-md border flex items-center justify-center gap-1 transition-all ${
                  filterTab === "archived"
                    ? "bg-[#44403C] text-white border-[#44403C] font-semibold shadow-2xs"
                    : "bg-white text-[#78716C] border-[#E7E2DA] hover:bg-[#FAF8F5] hover:text-[#1C1917]"
                }`}
              >
                <Archive className="h-3 w-3" />
                <span>Archive ({archivedThreads.length})</span>
              </button>
            </div>
          </div>

          {/* Conversation Cards Scroll Stream (ONLY THIS SCROLLS) */}
          <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-[#F5F1EB]">
            {fetching ? (
              <div className="flex flex-col items-center justify-center p-12 gap-2.5 text-[#78716C]">
                <div className="h-5 w-5 border-2 border-[#E7E2DA] border-t-[#064E3B] rounded-full animate-spin" />
                <p className="text-[11px] font-mono uppercase tracking-wider">Syncing communications…</p>
              </div>
            ) : filteredThreads.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-[#78716C]">
                <div className="h-10 w-10 rounded-xl bg-[#FAF8F5] border border-[#E7E2DA] flex items-center justify-center mb-2.5 text-[#A8A29E]">
                  {filterTab === "archived" ? (
                    <Archive className="h-4 w-4" />
                  ) : (
                    <Inbox className="h-4 w-4" />
                  )}
                </div>
                <div className="text-[13px] font-semibold text-[#1C1917] mb-0.5">
                  {filterTab === "archived"
                    ? "No archived conversations"
                    : search
                    ? "No matching conversations"
                    : filterTab === "unread"
                    ? "No unread messages"
                    : "No conversations yet"}
                </div>
                <p className="text-[11.5px] max-w-[240px] leading-relaxed">
                  {filterTab === "archived"
                    ? "Chats you archive will be stored here cleanly without cluttering your inbox."
                    : search
                    ? "Try searching for a different company name or keyword."
                    : "When verified employers shortlist your technical dossier, direct messages will appear here."}
                </p>
              </div>
            ) : (
              filteredThreads.map((thread) => {
                const isSelected = selectedPartnerId === thread.partnerId;
                const isArchived = archivedPartnerIds.has(thread.partnerId);
                const hasUnread = thread.messages.some(
                  (m) => m.recipientUid === user?.uid && !m.read && !readIds.has(m.id)
                );
                const unreadCountInThread = thread.messages.filter(
                  (m) => m.recipientUid === user?.uid && !m.read && !readIds.has(m.id)
                ).length;

                return (
                  <div
                    key={thread.partnerId}
                    onClick={() => handleSelectThread(thread.partnerId)}
                    className={`group w-full p-3.5 transition-all cursor-pointer flex items-start gap-3 relative select-none ${
                      isSelected
                        ? "bg-[#F3EFE9] border-l-4 border-l-[#064E3B]"
                        : hasUnread
                        ? "bg-white hover:bg-[#FAF8F5]"
                        : "bg-white/80 hover:bg-[#FAF8F5]"
                    }`}
                  >
                    {/* Employer Monogram Avatar */}
                    <div className="relative shrink-0">
                      <div className="h-9.5 w-9.5 rounded-lg bg-[#1C1917] text-white flex items-center justify-center text-[12px] font-mono font-bold shadow-2xs border border-[#E7E2DA]">
                        {getInitials(thread.partnerName)}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-white flex items-center justify-center">
                        <ShieldCheck className="h-3 w-3 text-[#064E3B]" />
                      </span>
                    </div>

                    {/* Middle Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span
                          className={`text-[13px] truncate ${
                            hasUnread ? "font-bold text-[#1C1917]" : "font-semibold text-[#292524]"
                          }`}
                        >
                          {thread.partnerName}
                        </span>
                        <span className="text-[10.5px] font-mono text-[#78716C] shrink-0">
                          {formatListTime(thread.lastMessage.timestamp)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-[#064E3B] bg-[#064E3B]/10 px-1.5 py-0.2 rounded">
                          Interview Invite
                        </span>
                        {isArchived && (
                          <span className="text-[10px] font-sans uppercase font-medium text-[#78716C] bg-[#E7E2DA] px-1.5 py-0.2 rounded">
                            Archived
                          </span>
                        )}
                      </div>

                      <p
                        className={`text-[12px] line-clamp-1 leading-snug ${
                          hasUnread ? "text-[#1C1917] font-medium" : "text-[#78716C]"
                        }`}
                      >
                        {thread.lastMessage.content || "(Attachment sent)"}
                      </p>
                    </div>

                    {/* Right Action Tray: Unread Badge & Archive Button */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0 self-center">
                      {hasUnread && (
                        <span className="h-4.5 min-w-[18px] px-1 rounded-full bg-[#064E3B] text-white text-[10px] font-mono font-bold flex items-center justify-center">
                          {unreadCountInThread}
                        </span>
                      )}

                      {/* Archive / Unarchive Button */}
                      <button
                        type="button"
                        onClick={(e) => toggleArchive(thread.partnerId, e)}
                        className={`p-1.5 rounded-md border border-transparent transition-all ${
                          isArchived
                            ? "text-[#064E3B] hover:bg-[#E7E2DA] hover:border-[#D6D3D1] opacity-100"
                            : "text-[#A8A29E] hover:text-[#1C1917] hover:bg-[#FAF8F5] hover:border-[#E7E2DA] opacity-0 group-hover:opacity-100"
                        }`}
                        title={isArchived ? "Unarchive conversation" : "Archive conversation"}
                      >
                        {isArchived ? (
                          <ArchiveRestore className="h-3.5 w-3.5" />
                        ) : (
                          <Archive className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* ── RIGHT PANE: Modern Chat Thread Workspace ── */}
        <section
          className={`flex-1 min-h-0 flex flex-col bg-[#FAF8F5] h-full ${
            !selectedPartnerId ? "hidden lg:flex" : "flex"
          }`}
        >
          {activeThread ? (
            <>
              {/* Active Conversation Sticky Header (Fixed, No Scroll) */}
              <div className="px-4 sm:px-6 py-3 bg-white border-b border-[#E7E2DA] flex items-center justify-between gap-3 shrink-0 shadow-2xs z-10">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => setSelectedPartnerId(null)}
                    className="lg:hidden p-1.5 -ml-1 text-[#78716C] hover:text-[#1C1917] hover:bg-[#FAF8F5] rounded-md transition-colors"
                    title="Back to conversation list"
                  >
                    ←
                  </button>

                  <div className="h-9 w-9 rounded-lg bg-[#1C1917] text-white flex items-center justify-center text-[12px] font-mono font-bold shrink-0">
                    {getInitials(activeThread.partnerName)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-[15px] font-bold text-[#1C1917] truncate">
                        {activeThread.partnerName}
                      </h2>
                      <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-medium font-semibold uppercase text-[#064E3B] bg-[#064E3B]/10 border border-[#064E3B]/20 px-2 py-0.5 rounded">
                        <ShieldCheck className="h-3 w-3" />
                        Verified Employer
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11.5px] text-[#78716C] font-sans truncate">
                      <Building2 className="h-3 w-3 text-[#78716C] shrink-0" />
                      <span className="truncate">Technical Hiring & Engineering Talent Acquisition</span>
                    </div>
                  </div>
                </div>

                {/* Right Actions: Archive Toggle & Explore Jobs */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleArchive(activeThread.partnerId)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-[11px] font-mono font-medium transition-all ${
                      isSelectedArchived
                        ? "bg-[#064E3B]/10 border-[#064E3B]/30 text-[#064E3B] hover:bg-[#064E3B]/20"
                        : "bg-white border-[#E7E2DA] text-[#78716C] hover:text-[#1C1917] hover:bg-[#FAF8F5]"
                    }`}
                    title={isSelectedArchived ? "Unarchive conversation" : "Archive conversation"}
                  >
                    {isSelectedArchived ? (
                      <>
                        <ArchiveRestore className="h-3.5 w-3.5 text-[#064E3B]" />
                        <span>Unarchive</span>
                      </>
                    ) : (
                      <>
                        <Archive className="h-3.5 w-3.5" />
                        <span>Archive</span>
                      </>
                    )}
                  </button>

                  <Link href="/candidate/jobs" target="_blank">
                    <button className="hidden md:flex items-center gap-1.5 px-3 py-1.5 border border-[#E7E2DA] bg-[#FAF8F5] hover:bg-white text-[11px] font-mono font-semibold text-[#1C1917] rounded-lg transition-colors shadow-2xs">
                      <span>EXPLORE JOBS</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </Link>
                </div>
              </div>

              {/* Verified Topic Protocol Ribbon */}
              <div className="px-4 sm:px-6 py-1.5 bg-[#F4F1EB] border-b border-[#E7E2DA] flex items-center justify-between text-[10.5px] font-mono text-[#78716C] uppercase tracking-wider shrink-0">
                <div className="flex items-center gap-1.5">
                  <Lock className="h-3 w-3 text-[#064E3B]" />
                  <span>Secured Protocol · Interview & Evaluation Wire</span>
                </div>
                <span className="hidden sm:inline">MeritLane Verified Direct Messaging</span>
              </div>

              {/* Message Feed Stream (ONLY THIS SCROLLS) */}
              <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
                {messageGroups.map((group, groupIdx) => (
                  <div key={groupIdx} className="space-y-4">
                    {/* Sleek Day Divider */}
                    <div className="flex items-center justify-center my-3">
                      <span className="px-3 py-1 rounded-full bg-white border border-[#E7E2DA] text-[11px] font-mono text-[#78716C] shadow-2xs">
                        {group.dateLabel}
                      </span>
                    </div>

                    {/* Messages for this date */}
                    {group.messages.map((msg) => {
                      const isSentByMe = msg.senderUid === user?.uid;
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isSentByMe ? "items-end" : "items-start"}`}
                        >
                          <div
                            className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 sm:p-5 shadow-2xs transition-all ${
                              isSentByMe
                                ? "bg-[#064E3B] text-white rounded-br-xs border border-[#064E3B]"
                                : "bg-white text-[#1C1917] rounded-tl-xs border border-[#E7E2DA]"
                            }`}
                          >
                            {/* Message Header info inside bubble */}
                            <div
                              className={`flex items-center gap-2 mb-1.5 text-[10.5px] font-mono ${
                                isSentByMe ? "text-emerald-200" : "text-[#78716C]"
                              }`}
                            >
                              <span className="font-semibold">
                                {isSentByMe ? "You (Candidate)" : msg.senderName}
                              </span>
                              <span>·</span>
                              <span>{formatMessageTime(msg.timestamp)}</span>
                            </div>

                            {/* Text Content */}
                            {msg.content && (
                              <div className="whitespace-pre-wrap font-sans text-[13.5px] leading-relaxed break-words">
                                {msg.content}
                              </div>
                            )}

                            {/* Attachments */}
                            <MessageAttachmentsList
                              attachments={msg.attachments}
                              isSentByMe={isSentByMe}
                            />

                            {/* Message footer status for outgoing */}
                            {isSentByMe && (
                              <div className="flex items-center justify-end gap-1 mt-1.5 text-emerald-200 text-[10px] font-mono">
                                <span>Delivered</span>
                                <CheckCheck className="h-3 w-3" />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}

                <div ref={messagesEndRef} />
              </div>

              {/* ── Modern Bottom Composer Bar (Fixed, No Scroll) ── */}
              <div className="p-3 sm:p-4 bg-white border-t border-[#E7E2DA] shrink-0 z-10">
                <form onSubmit={handleSendReply} className="space-y-2.5">
                  {attachmentError && (
                    <div className="p-2.5 bg-[#FEF2F2] border border-[#B42318]/20 rounded-lg text-[12px] text-[#B42318] flex items-center justify-between">
                      <span>{attachmentError}</span>
                      <button
                        type="button"
                        onClick={() => setAttachmentError(null)}
                        className="text-[#B42318] hover:opacity-75"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Input container */}
                  <div className="border border-[#E7E2DA] rounded-xl bg-[#FAF8F5] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1C1917]/10 focus-within:border-[#1C1917] transition-all">
                    <textarea
                      ref={textareaRef}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Reply directly to ${activeThread.partnerName}… (Press Enter to send)`}
                      rows={2}
                      className="w-full p-3 bg-transparent text-[13.5px] text-[#1C1917] placeholder-[#A8A29E] focus:outline-none resize-none leading-relaxed"
                      onKeyDown={(e) => {
                        // Standard chat app UX: Enter sends, Shift+Enter makes newline!
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendReply();
                        }
                      }}
                    />

                    {/* Previews of attached files */}
                    {replyAttachments.length > 0 && (
                      <div className="px-3 pb-2.5">
                        <AttachmentPreviewTray
                          attachments={replyAttachments}
                          onRemove={handleRemoveAttachment}
                        />
                      </div>
                    )}

                    {/* Toolbar controls inside input box */}
                    <div className="px-3 py-2 border-t border-[#E7E2DA]/60 flex items-center justify-between gap-2 flex-wrap">
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
                          className="p-1.5 hover:bg-[#E7E2DA]/50 rounded-md text-[#78716C] hover:text-[#1C1917] transition-colors disabled:opacity-50"
                          title="Attach files (PDF, document, code, archive)"
                        >
                          <Paperclip className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => imageInputRef.current?.click()}
                          disabled={uploadingAttachment || replyAttachments.length >= 5}
                          className="p-1.5 hover:bg-[#E7E2DA]/50 rounded-md text-[#78716C] hover:text-[#1C1917] transition-colors disabled:opacity-50"
                          title="Attach images"
                        >
                          <ImageIcon className="h-4 w-4" />
                        </button>

                        {uploadingAttachment && (
                          <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#78716C] pl-1">
                            <div className="h-3 w-3 border-2 border-[#1C1917] border-t-transparent rounded-full animate-spin" />
                            <span>Processing…</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="hidden sm:inline text-[11px] font-mono text-[#A8A29E]">
                          <kbd className="bg-[#FAF8F5] border border-[#E7E2DA] px-1 py-0.5 rounded text-[10px]">
                            Enter
                          </kbd>{" "}
                          to send ·{" "}
                          <kbd className="bg-[#FAF8F5] border border-[#E7E2DA] px-1 py-0.5 rounded text-[10px]">
                            Shift+Enter
                          </kbd>{" "}
                          for newline
                        </span>

                        <button
                          type="submit"
                          disabled={
                            sendingReply ||
                            uploadingAttachment ||
                            (!replyText.trim() && replyAttachments.length === 0)
                          }
                          className="flex items-center gap-1.5 px-4 py-1.5 bg-[#064E3B] hover:bg-[#043327] disabled:opacity-40 disabled:cursor-not-allowed text-white text-[12px] font-semibold rounded-lg transition-all shadow-xs"
                        >
                          {sendingReply ? (
                            <>
                              <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Sending…</span>
                            </>
                          ) : (
                            <>
                              <span>Send</span>
                              <Send className="h-3 w-3" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </>
          ) : (
            /* Executive Clean Empty State when no conversation is selected */
            <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-8 text-center overflow-y-auto">
              <div className="max-w-md w-full space-y-6">
                <div className="h-16 w-16 rounded-2xl bg-white border border-[#E7E2DA] shadow-xs text-[#064E3B] flex items-center justify-center mx-auto">
                  <MessageSquare className="h-8 w-8" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-[20px] font-bold text-[#1C1917] tracking-tight">
                    Direct Employer Communications
                  </h3>
                  <p className="text-[13px] text-[#78716C] leading-relaxed">
                    Select a conversation from the left to view verified technical inquiries, schedule interviews, and share project dossiers.
                  </p>
                </div>

                <div className="p-4 bg-white border border-[#E7E2DA] rounded-xl text-left space-y-2.5 shadow-2xs">
                  <div className="flex items-center gap-2 text-[12px] font-semibold text-[#1C1917]">
                    <Sparkles className="h-3.5 w-3.5 text-[#064E3B]" />
                    <span>How Direct Inquiries Work</span>
                  </div>
                  <p className="text-[12px] text-[#78716C] leading-relaxed">
                    Employers review your proctored assessment scores and GitHub projects before reaching out directly through this secured channel.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
