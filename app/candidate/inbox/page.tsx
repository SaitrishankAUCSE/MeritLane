"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { getIdToken } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import {
  Inbox,
  MailOpen,
  Mail,
  Circle,
  Search,
  RefreshCw,
  Building2,
  Calendar,
  MessageSquare,
  ChevronRight,
  ArrowLeft,
  ShieldCheck,
  Clock,
  Info
} from "lucide-react";
import { ContextGuide } from "@/components/ui/ContextGuide";

interface Message {
  id: string;
  senderUid: string;
  senderName: string;
  recipientUid: string;
  content: string;
  timestamp: number;
  read: boolean;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string): string {
  const colors = [
    "bg-indigo-600",
    "bg-violet-600",
    "bg-emerald-600",
    "bg-rose-600",
    "bg-amber-600",
    "bg-sky-600",
    "bg-teal-600",
    "bg-fuchsia-600",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function formatDate(ts: number): string {
  const now = new Date();
  const d = new Date(ts);
  if (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  ) {
    return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  }
  const diff = now.getTime() - ts;
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    return d.toLocaleDateString("en-IN", { weekday: "short" });
  }
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

function formatFullDate(ts: number): string {
  return new Date(ts).toLocaleString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getPreview(content: string): string {
  return content.replace(/\n+/g, " ").trim().slice(0, 80);
}

export default function CandidateInboxPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [fetching, setFetching] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<Message | null>(null);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  const fetchMessages = async (quiet = false) => {
    if (!quiet) setFetching(true);
    else setRefreshing(true);
    try {
      const token = await getIdToken(auth.currentUser!, true);
      const res = await fetch("/api/messages", {
        headers: { Authorization: "Bearer " + token },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
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

  const filteredMessages = messages.filter(
    (m) =>
      m.senderName.toLowerCase().includes(search.toLowerCase()) ||
      m.content.toLowerCase().includes(search.toLowerCase())
  );

  const unreadCount = messages.filter((m) => !readIds.has(m.id) && !m.read).length;

  const handleSelect = (msg: Message) => {
    setSelected(msg);
    setReadIds((prev) => new Set(prev).add(msg.id));
  };

  return (
    <div className="flex h-full bg-[#F7F7F6] overflow-hidden">
      {/* LEFT PANEL - Message List */}
      <div
        className={`flex flex-col border-r border-[#E5E5E5] bg-white ${
          selected ? "hidden lg:flex lg:w-[340px] xl:w-[380px]" : "flex w-full lg:w-[340px] xl:w-[380px]"
        } shrink-0`}
      >
        {/* Panel Header */}
        <div className="px-5 pt-6 pb-4 border-b border-[#F0F0EF]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-[#0D0D0D] flex items-center justify-center">
                <Inbox className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-[16px] font-bold text-[#0D0D0D] leading-tight">Inbox</h1>
                {unreadCount > 0 && (
                  <p className="text-[11px] text-indigo-600 font-medium font-mono">
                    {unreadCount} unread
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => fetchMessages(true)}
              disabled={refreshing}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-[#737373] hover:bg-[#F3F3F1] hover:text-[#0D0D0D] transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#ABABAB]" />
            <input
              type="text"
              placeholder="Search messages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-[13px] bg-[#F5F5F4] border border-transparent rounded-xl text-[#0D0D0D] placeholder-[#ABABAB] focus:outline-none focus:border-[#D2D2D2] focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto">
          {fetching ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-[#ABABAB]">
              <div className="h-5 w-5 border-2 border-[#E5E5E5] border-t-[#0D0D0D] rounded-full animate-spin" />
              <p className="text-[12px] font-sans">Loading messages...</p>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3 px-6 text-center">
              <div className="h-12 w-12 rounded-2xl bg-[#F3F3F1] flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-[#ABABAB]" />
              </div>
              <div>
                <p className="text-[14px] font-serif text-[#0D0D0D] mb-1">
                  {search ? "No results found" : "No messages yet"}
                </p>
                <p className="text-[12px] text-[#ABABAB] font-sans">
                  {search
                    ? "Try a different search term."
                    : "Employer outreach will appear here once you're shortlisted."}
                </p>
              </div>
            </div>
          ) : (
            <div>
              {filteredMessages.map((msg) => {
                const isUnread = !readIds.has(msg.id) && !msg.read;
                const isSelected = selected?.id === msg.id;
                return (
                  <button
                    key={msg.id}
                    onClick={() => handleSelect(msg)}
                    className={`w-full text-left px-4 py-4 border-b border-[#F3F3F1] transition-all hover:bg-[#F9F9F8] relative ${
                      isSelected ? "bg-indigo-50 border-l-2 border-l-indigo-600" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div
                        className={`h-10 w-10 rounded-xl ${getAvatarColor(
                          msg.senderName
                        )} text-white text-[13px] font-bold flex items-center justify-center shrink-0`}
                      >
                        {getInitials(msg.senderName)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span
                            className={`text-[13px] truncate ${
                              isUnread ? "font-bold text-[#0D0D0D]" : "font-medium text-[#525252]"
                            }`}
                          >
                            {msg.senderName}
                          </span>
                          <span className="text-[11px] text-[#ABABAB] font-mono shrink-0 ml-2">
                            {formatDate(msg.timestamp)}
                          </span>
                        </div>
                        <p
                          className={`text-[12px] truncate mb-1 ${
                            isUnread ? "text-[#0D0D0D] font-medium" : "text-[#737373]"
                          }`}
                        >
                          Interview Invitation
                        </p>
                        <p className="text-[12px] text-[#ABABAB] truncate">{getPreview(msg.content)}</p>
                      </div>

                      {isUnread && (
                        <Circle className="h-2 w-2 fill-indigo-600 text-indigo-600 shrink-0 mt-1.5" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer — pipeline status */}
        {!fetching && messages.length > 0 && (
          <div className="px-5 py-3 border-t border-[#F0F0EF] bg-[#FAFAF9]">
            <div className="flex items-center gap-1.5 text-[11px] text-[#737373] font-mono">
              <ShieldCheck className="h-3 w-3 text-emerald-600" />
              <span>{messages.length} message{messages.length > 1 ? "s" : ""} from verified employers</span>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT PANEL - Message Detail */}
      <div className={`flex-1 flex flex-col overflow-hidden ${selected ? "flex" : "hidden lg:flex"}`}>
        {selected ? (
          <>
            {/* Message Header */}
            <div className="flex items-center gap-4 px-6 lg:px-10 py-5 border-b border-[#E5E5E5] bg-white">
              <button
                onClick={() => setSelected(null)}
                className="lg:hidden h-8 w-8 rounded-lg flex items-center justify-center text-[#737373] hover:bg-[#F3F3F1] transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div
                className={`h-11 w-11 rounded-xl ${getAvatarColor(
                  selected.senderName
                )} text-white text-[14px] font-bold flex items-center justify-center shrink-0`}
              >
                {getInitials(selected.senderName)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-[16px] font-bold text-[#0D0D0D] font-sans">{selected.senderName}</h2>
                  <span className="text-[11px] font-mono font-semibold uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Verified Employer
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                  <span className="flex items-center gap-1 text-[12px] text-[#737373]">
                    <Building2 className="h-3 w-3" />
                    Talent Acquisition
                  </span>
                  <span className="text-[#D2D2D2]">·</span>
                  <span className="flex items-center gap-1 text-[12px] text-[#737373]">
                    <Calendar className="h-3 w-3" />
                    {formatFullDate(selected.timestamp)}
                  </span>
                </div>
              </div>
            </div>

            {/* Message Subject strip */}
            <div className="px-6 lg:px-10 py-4 bg-[#F9F9F8] border-b border-[#F0F0EF]">
              <div className="flex items-center gap-2">
                <MailOpen className="h-4 w-4 text-indigo-500" />
                <span className="text-[13px] font-semibold text-[#0D0D0D]">
                  Interview Invitation — Technical Engineering Role
                </span>
              </div>
            </div>

            {/* Message Body */}
            <div className="flex-1 overflow-y-auto px-6 lg:px-10 py-8 bg-white">
              <div className="max-w-[720px]">
                <div className="prose prose-sm max-w-none">
                  <div className="text-[15px] text-[#2A2A2A] font-sans leading-[1.8] whitespace-pre-wrap">
                    {selected.content}
                  </div>
                </div>

                {/* Reply info */}
                <div className="mt-10 p-5 border border-[#E5E5E5] rounded-2xl bg-[#FAFAF9] flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                    <Info className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-[#0D0D0D] mb-0.5">Beta — Direct Reply Disabled</p>
                    <p className="text-[12px] text-[#737373] leading-relaxed">
                      During the beta phase, employer replies are handled over email. The employer has your
                      verified contact information. You may reach them using the contact details in the
                      message above.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Compose Area — reply */}
            <div className="px-6 lg:px-10 py-5 border-t border-[#E5E5E5] bg-white">
              <div
                onClick={() =>
                  alert(
                    "Replying to messages is currently disabled during the beta phase. The employer will contact you via email."
                  )
                }
                className="w-full flex items-center gap-3 px-4 py-3 border border-[#E5E5E5] rounded-xl cursor-text hover:border-[#ABABAB] transition-colors"
              >
                <div className="h-7 w-7 rounded-full bg-[#F3F3F1] flex items-center justify-center text-[11px] font-bold text-[#737373]">
                  {user?.email?.[0]?.toUpperCase() || "U"}
                </div>
                <span className="text-[13px] text-[#ABABAB] select-none">Reply to {selected.senderName}...</span>
              </div>
            </div>
          </>
        ) : (
          /* No message selected placeholder */
          <div className="flex-1 flex flex-col items-center justify-center bg-[#F9F9F8] p-6 lg:p-10 overflow-y-auto">
            <div className="w-full max-w-[460px]">
              <ContextGuide
                storageKey="candidate_inbox"
                title="How your Inbox works"
                description="Employers reach out here after reviewing your verified profile. You cannot contact them first — they must find you through skill verification."
                steps={[
                  { title: "Get verified", description: "Pass skill assessments so employers can discover your verified proof of work." },
                  { title: "Get shortlisted", description: "An employer reviews your dossier and saves you to their pipeline." },
                  { title: "Receive a message", description: "The employer sends an interview invitation here. It will appear in the left panel." },
                ]}
                ctaLabel="View my verification status"
                ctaHref="/candidate/verification"
              />
              <div className="flex flex-col items-center gap-4 mt-6">
                <div className="h-14 w-14 rounded-2xl bg-white border border-[#E7E2DA] shadow-sm flex items-center justify-center">
                  <Mail className="h-6 w-6 text-[#A8A29E]" />
                </div>
                <div className="text-center">
                  <p className="text-[15px] font-semibold text-[#1C1917] mb-1">
                    {fetching ? "Loading inbox..." : messages.length === 0 ? "No messages yet" : "Select a message"}
                  </p>
                  <p className="text-[13px] text-[#78716C] max-w-xs">
                    {messages.length === 0
                      ? "Employer interview invitations will appear here once you are shortlisted."
                      : "Choose a message from the list on the left."}
                  </p>
                </div>
                {!fetching && messages.length === 0 && (
                  <div className="flex items-center gap-1.5 text-[12px] text-[#78716C] border border-[#E7E2DA] bg-white px-3 py-1.5 rounded-full">
                    <Clock className="h-3 w-3" />
                    <span>Pass assessments to appear in employer discovery</span>
                    <ChevronRight className="h-3 w-3" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
