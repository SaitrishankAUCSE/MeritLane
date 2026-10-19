"use client";

import React, { useState, KeyboardEvent, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { parseSkillInput } from "@/lib/skills";

export interface TagInputProps {
  label?: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  helperText?: string;
  disabled?: boolean;
  options?: string[]; // for autocomplete
  splitOnComma?: boolean;
  mode?: "skills" | "text";
}

export function TagInput({
  label,
  tags,
  onChange,
  placeholder = "Add item (press Enter)...",
  helperText,
  disabled = false,
  options = [],
  splitOnComma = false,
  mode = "text"
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (inputValue.trim() && options.length > 0) {
      const lower = inputValue.toLowerCase();
      const filtered = options.filter(opt => 
        opt.toLowerCase().includes(lower) && !tags.some(t => t.toLowerCase() === opt.toLowerCase())
      );
      // Smart ranking: prefix matches first, then word-start matches, then general substring matches
      filtered.sort((a, b) => {
        const aLower = a.toLowerCase();
        const bLower = b.toLowerCase();
        const aStarts = aLower.startsWith(lower);
        const bStarts = bLower.startsWith(lower);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;

        const aWordMatch = aLower.includes(" " + lower) || aLower.includes("(" + lower);
        const bWordMatch = bLower.includes(" " + lower) || bLower.includes("(" + lower);
        if (aWordMatch && !bWordMatch) return -1;
        if (!aWordMatch && bWordMatch) return 1;

        return a.localeCompare(b);
      });
      setFilteredOptions(filtered.slice(0, 20)); // top 20 matches
      setShowDropdown(filtered.length > 0);
    } else {
      setShowDropdown(false);
    }
  }, [inputValue, tags, options]);

  const addTag = (valueOverride?: string) => {
    const rawVal = valueOverride !== undefined ? valueOverride : inputValue;
    const val = rawVal.trim();
    if (!val) return;

    let itemsToAdd: string[] = [];

    if (valueOverride) {
      // Direct selection from suggestions - do not split
      itemsToAdd = [val];
    } else if (mode === "skills" && splitOnComma) {
      // Multiple skills separated by comma
      const parts = val.includes(",") ? val.split(",") : [val];
      for (const p of parts) {
        const trimmed = p.trim();
        if (trimmed) {
          const matched = options.find(opt => opt.toLowerCase() === trimmed.toLowerCase());
          itemsToAdd.push(matched || trimmed);
        }
      }
    } else if (splitOnComma && val.includes(",")) {
      itemsToAdd = val.split(",").map(s => s.trim()).filter(Boolean);
    } else {
      // Single continuous phrase (e.g. "Hyderabad, India" or "Full-Stack Developer")
      const matched = options.find(opt => opt.toLowerCase() === val.toLowerCase());
      itemsToAdd = [matched || val];
    }

    let newTags = [...tags];
    let changed = false;
    for (const item of itemsToAdd) {
      if (item && !newTags.some(t => t.toLowerCase() === item.toLowerCase())) {
        newTags.push(item);
        changed = true;
      }
    }

    if (changed) {
      onChange(newTags);
    }
    setInputValue("");
    setShowDropdown(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    } else if (splitOnComma && e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  const removeTag = (indexToRemove: number) => {
    if (disabled) return;
    onChange(tags.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className={`flex flex-col gap-1.5 w-full text-left relative ${disabled ? "opacity-70 pointer-events-none" : ""}`} ref={wrapperRef}>
      {label && (
        <label className="font-sans text-[14px] text-foreground font-medium">
          {label}
        </label>
      )}
      <div className={`flex min-h-[42px] flex-wrap items-center gap-1.5 border border-border bg-surface px-2 py-1.5 rounded-md transition-colors ${disabled ? "opacity-70" : "focus-within:border-foreground"}`}>
        {tags.map((tag, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1.5 border border-border bg-surface-dim px-2.5 py-1 rounded-sm font-mono text-[12px] text-foreground select-none"
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={() => removeTag(idx)}
                className="text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-foreground rounded-sm transition-colors"
                aria-label={`Remove ${tag}`}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </span>
        ))}
        {!disabled && (
          <div className="flex min-w-[120px] flex-1 items-center relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={tags.length === 0 ? placeholder : "Add more..."}
              className="w-full bg-transparent px-1.5 py-1 text-[14px] text-foreground font-sans placeholder:text-muted-foreground focus:outline-none"
              disabled={disabled}
              autoComplete="off"
            />
          </div>
        )}
      </div>

      {showDropdown && filteredOptions.length > 0 && (
        <div className="absolute top-[calc(100%+4px)] left-0 w-full max-h-[250px] overflow-y-auto bg-surface-bright border border-border rounded-md shadow-sm z-50 py-1 scrollbar-hide">
          {filteredOptions.map((opt, idx) => (
            <div
              key={idx}
              onClick={() => addTag(opt)}
              className="px-4 py-2.5 text-[14px] font-sans text-foreground hover:bg-surface-dim cursor-pointer transition-colors"
            >
              {opt}
            </div>
          ))}
        </div>
      )}
      
      {helperText && (
        <p className="text-[13px] text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
}
