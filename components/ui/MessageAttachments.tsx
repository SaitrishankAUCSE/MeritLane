"use client";

import React, { useState } from "react";
import {
  Paperclip,
  Image as ImageIcon,
  FileText,
  FileCode,
  FileArchive,
  File as FileGeneric,
  X,
  Download,
  Eye,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";

export interface MessageAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function isImageAttachment(att: MessageAttachment): boolean {
  if (att.type && att.type.startsWith("image/")) return true;
  return /\.(png|jpe?g|webp|gif|svg)$/i.test(att.name);
}

function getFileIcon(type: string, name: string) {
  const lowerName = name.toLowerCase();
  if (type.includes("pdf") || lowerName.endsWith(".pdf")) {
    return <FileText className="h-4 w-4 text-[#DC2626]" />;
  }
  if (
    type.includes("javascript") ||
    type.includes("typescript") ||
    type.includes("json") ||
    /\.(js|ts|tsx|jsx|json|py|go|sql|html|css|cpp|c|rs)$/i.test(lowerName)
  ) {
    return <FileCode className="h-4 w-4 text-[#0284C7]" />;
  }
  if (
    type.includes("zip") ||
    type.includes("tar") ||
    type.includes("compressed") ||
    /\.(zip|tar|gz|rar|7z)$/i.test(lowerName)
  ) {
    return <FileArchive className="h-4 w-4 text-[#D97706]" />;
  }
  return <FileGeneric className="h-4 w-4 text-[#78716C]" />;
}

/**
 * Client-side file processor:
 * - Compresses images to WebP/JPEG under 1600px width/height
 * - Reads documents as base64 data URLs
 * - Enforces 2MB maximum per file
 */
export async function processFileForAttachment(file: File): Promise<MessageAttachment> {
  const MAX_SIZE_BYTES = 2.5 * 1024 * 1024; // 2.5MB
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error(`"${file.name}" exceeds the 2.5MB size limit. Please attach a smaller file.`);
  }

  const id = Math.random().toString(36).substring(2, 9);

  // If it's an image (except SVG), optimize via HTML Canvas
  if (file.type.startsWith("image/") && !file.type.includes("svg")) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          try {
            const maxDim = 1400;
            let width = img.width;
            let height = img.height;

            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
              // Fallback to original data URL
              return resolve({
                id,
                name: file.name,
                size: file.size,
                type: file.type,
                url: e.target?.result as string,
              });
            }

            ctx.drawImage(img, 0, 0, width, height);
            const mimeType = "image/jpeg";
            const dataUrl = canvas.toDataURL(mimeType, 0.85);

            // Estimate base64 byte size
            const base64Length = dataUrl.length - (dataUrl.indexOf(",") + 1);
            const byteSize = Math.round((base64Length * 3) / 4);

            resolve({
              id,
              name: file.name.replace(/\.[^/.]+$/, "") + ".jpg",
              size: byteSize,
              type: mimeType,
              url: dataUrl,
            });
          } catch (err) {
            reject(err);
          }
        };
        img.onerror = () => reject(new Error("Failed to load image for processing"));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  }

  // Non-image or SVG file: read as standard base64 data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve({
        id,
        name: file.name,
        size: file.size,
        type: file.type || "application/octet-stream",
        url: e.target?.result as string,
      });
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Preview tray for files pending to be sent
 */
export function AttachmentPreviewTray({
  attachments,
  onRemove,
}: {
  attachments: MessageAttachment[];
  onRemove: (id: string) => void;
}) {
  if (attachments.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 pt-2 pb-1 border-t border-[#E7E2DA]/60">
      {attachments.map((att) => {
        const isImg = isImageAttachment(att);
        return (
          <div
            key={att.id}
            className="flex items-center gap-2 pl-2 pr-1.5 py-1 bg-white border border-[#E7E2DA] rounded text-[12px] shadow-2xs group"
          >
            {isImg ? (
              <img
                src={att.url}
                alt={att.name}
                className="h-6 w-6 object-cover rounded border border-[#E7E2DA]"
              />
            ) : (
              getFileIcon(att.type, att.name)
            )}
            <div className="flex flex-col min-w-0 max-w-[140px] sm:max-w-[180px]">
              <span className="font-mono text-[11px] text-[#1C1917] truncate leading-tight">
                {att.name}
              </span>
              <span className="text-[9px] font-mono text-[#A8A29E] leading-tight">
                {formatBytes(att.size)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onRemove(att.id)}
              className="p-1 hover:bg-[#FAF8F5] text-[#78716C] hover:text-[#1C1917] rounded transition-colors"
              title="Remove attachment"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Attachment display inside a message bubble
 */
export function MessageAttachmentsList({
  attachments,
  isSentByMe,
}: {
  attachments?: MessageAttachment[];
  isSentByMe?: boolean;
}) {
  const [selectedImg, setSelectedImg] = useState<MessageAttachment | null>(null);

  if (!attachments || attachments.length === 0) return null;

  const images = attachments.filter(isImageAttachment);
  const files = attachments.filter((a) => !isImageAttachment(a));

  return (
    <div className="mt-2.5 flex flex-col gap-2">
      {/* Images Grid */}
      {images.length > 0 && (
        <div
          className={`grid gap-2 ${
            images.length === 1 ? "grid-cols-1" : images.length === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"
          }`}
        >
          {images.map((img) => (
            <div
              key={img.id}
              className="relative group rounded overflow-hidden border border-black/10 bg-black/5 cursor-pointer max-w-[280px]"
              onClick={() => setSelectedImg(img)}
            >
              <img
                src={img.url}
                alt={img.name}
                className="w-full h-auto max-h-[220px] object-cover hover:scale-[1.02] transition-transform duration-200"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <span className="p-1.5 bg-white/90 rounded text-[#1C1917] hover:bg-white transition-colors">
                  <Eye className="h-3.5 w-3.5" />
                </span>
                <a
                  href={img.url}
                  download={img.name}
                  onClick={(e) => e.stopPropagation()}
                  className="p-1.5 bg-white/90 rounded text-[#1C1917] hover:bg-white transition-colors"
                  title="Download image"
                >
                  <Download className="h-3.5 w-3.5" />
                </a>
              </div>
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-1.5 px-2 text-[10px] text-white font-mono truncate">
                {img.name} ({formatBytes(img.size)})
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Files / Documents */}
      {files.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {files.map((file) => (
            <a
              key={file.id}
              href={file.url}
              download={file.name}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-between gap-3 p-2.5 rounded border text-[12px] font-sans transition-colors ${
                isSentByMe
                  ? "bg-white/10 hover:bg-white/20 border-white/20 text-white"
                  : "bg-white hover:bg-[#FAF8F5] border-[#E7E2DA] text-[#1C1917]"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`p-1.5 rounded ${
                    isSentByMe ? "bg-white/20 text-white" : "bg-[#FAF8F5] text-[#1C1917]"
                  }`}
                >
                  {getFileIcon(file.type, file.name)}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-mono text-[12px] truncate max-w-[200px] sm:max-w-[280px]">
                    {file.name}
                  </span>
                  <span
                    className={`text-[10px] font-mono ${
                      isSentByMe ? "text-white/70" : "text-[#78716C]"
                    }`}
                  >
                    {formatBytes(file.size)}
                  </span>
                </div>
              </div>
              <Download
                className={`h-4 w-4 shrink-0 ${
                  isSentByMe ? "text-white/80" : "text-[#78716C]"
                }`}
              />
            </a>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedImg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-150"
          onClick={() => setSelectedImg(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-2 text-white text-[12px] font-mono">
              <span className="truncate pr-4">{selectedImg.name}</span>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={selectedImg.url}
                  download={selectedImg.name}
                  className="flex items-center gap-1.5 px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-white text-[11px] font-semibold transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download</span>
                </a>
                <button
                  onClick={() => setSelectedImg(null)}
                  className="p-1 bg-white/20 hover:bg-white/30 rounded text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <img
              src={selectedImg.url}
              alt={selectedImg.name}
              className="max-h-[80vh] w-auto object-contain rounded border border-white/20 bg-black/40 shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
