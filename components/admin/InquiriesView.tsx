"use client";

import React, { useState, useMemo } from "react";
import { 
  Mail, 
  Search, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  RefreshCw, 
  MessageSquare, 
  Inbox,
  Filter,
  Check,
  RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";

export interface InquiryRecord {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: number;
  read: boolean;
  status: "new" | "read" | "resolved";
}

interface InquiriesViewProps {
  inquiries: InquiryRecord[];
  loading: boolean;
  onRefresh: () => void;
  onMarkRead: (id: string, read: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function InquiriesView({
  inquiries,
  loading,
  onRefresh,
  onMarkRead,
  onDelete,
}: InquiriesViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "unread" | "read">("all");
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryRecord | null>(null);

  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inq) => {
      const matchesFilter =
        filterStatus === "all" ||
        (filterStatus === "unread" && !inq.read) ||
        (filterStatus === "read" && inq.read);

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        inq.name.toLowerCase().includes(q) ||
        inq.email.toLowerCase().includes(q) ||
        inq.message.toLowerCase().includes(q);

      return matchesFilter && matchesSearch;
    });
  }, [inquiries, filterStatus, searchQuery]);

  const unreadCount = useMemo(() => inquiries.filter((i) => !i.read).length, [inquiries]);

  const handleToggleRead = async (inq: InquiryRecord) => {
    setActionInProgress(inq.id);
    try {
      await onMarkRead(inq.id, !inq.read);
      if (selectedInquiry?.id === inq.id) {
        setSelectedInquiry({ ...inq, read: !inq.read });
      }
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    setActionInProgress(id);
    try {
      await onDelete(id);
      if (selectedInquiry?.id === id) {
        setSelectedInquiry(null);
      }
    } finally {
      setActionInProgress(null);
    }
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp) return "Just now";
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-serif font-bold text-foreground">
              Landing Page Inquiries
            </h2>
            {unreadCount > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Direct messages received through the public contact form on the MeritLane homepage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRefresh}
            loading={loading}
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white p-3 rounded-lg border border-border shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or message..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#FAFAFA] border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-foreground"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setFilterStatus("all")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterStatus === "all"
                ? "bg-[#1C1917] text-white"
                : "bg-surface text-muted-foreground hover:bg-[#F5F5F4]"
            }`}
          >
            All ({inquiries.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus("unread")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterStatus === "unread"
                ? "bg-[#1C1917] text-white"
                : "bg-surface text-muted-foreground hover:bg-[#F5F5F4]"
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus("read")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterStatus === "read"
                ? "bg-[#1C1917] text-white"
                : "bg-surface text-muted-foreground hover:bg-[#F5F5F4]"
            }`}
          >
            Read ({inquiries.length - unreadCount})
          </button>
        </div>
      </div>

      {/* Main List */}
      {filteredInquiries.length === 0 ? (
        <Card className="border border-dashed border-border bg-white py-16 text-center">
          <CardContent className="space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-[#F5F5F4] flex items-center justify-center text-muted-foreground">
              <Inbox className="h-6 w-6" />
            </div>
            <h3 className="font-serif text-base font-semibold text-foreground">
              No inquiries found
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {searchQuery || filterStatus !== "all"
                ? "No messages match your search or filter criteria."
                : "Messages submitted from the website contact section will appear here automatically."}
            </p>
            {(searchQuery || filterStatus !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setFilterStatus("all");
                }}
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredInquiries.map((inq) => {
            const isUnread = !inq.read;
            const isProcessing = actionInProgress === inq.id;

            return (
              <div
                key={inq.id}
                className={`group relative rounded-xl border p-5 transition-all duration-200 ${
                  isUnread
                    ? "bg-white border-blue-300 shadow-sm ring-1 ring-blue-100"
                    : "bg-[#FAFAFA] border-border hover:bg-white hover:border-[#D6D3D1]"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Sender Info */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2.5">
                      {isUnread && (
                        <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0" title="Unread" />
                      )}
                      <h4 className="font-serif text-[17px] font-semibold text-[#1C1917]">
                        {inq.name}
                      </h4>
                      <Badge
                        variant={isUnread ? "pending" : "neutral"}
                        size="sm"
                        className="text-[10px]"
                      >
                        {isUnread ? "NEW MESSAGE" : "READ"}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#78716C]">
                      <a
                        href={`mailto:${inq.email}?subject=Re: MeritLane Inquiry&body=Hi ${encodeURIComponent(inq.name)},%0D%0A%0D%0AThank you for reaching out to MeritLane.%0D%0A%0D%0A`}
                        className="inline-flex items-center gap-1 font-mono text-blue-600 hover:underline"
                        title="Click to compose reply"
                      >
                        <Mail className="h-3 w-3" />
                        {inq.email}
                      </a>
                      <span className="flex items-center gap-1 text-[11px]">
                        <Clock className="h-3 w-3" />
                        {formatDate(inq.createdAt)}
                      </span>
                    </div>

                    {/* Message Body */}
                    <div className="mt-3.5 bg-white rounded-lg border border-[#E5E5E5] p-4 text-[14px] text-[#1C1917] leading-relaxed whitespace-pre-wrap font-sans">
                      {inq.message}
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 pt-2 sm:pt-0">
                    <a
                      href={`mailto:${inq.email}?subject=Re: MeritLane Inquiry&body=Hi ${encodeURIComponent(inq.name)},%0D%0A%0D%0AThank you for reaching out to MeritLane.%0D%0A%0D%0A`}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-[#1C1917] text-white hover:bg-[#333] transition-colors shadow-xs"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      Reply via Email
                    </a>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleRead(inq)}
                      disabled={isProcessing}
                      className="text-xs"
                      leftIcon={isUnread ? <Check className="h-3 w-3" /> : <RotateCcw className="h-3 w-3" />}
                    >
                      {isUnread ? "Mark as Read" : "Mark Unread"}
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(inq.id)}
                      disabled={isProcessing}
                      className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                      leftIcon={<Trash2 className="h-3 w-3" />}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
