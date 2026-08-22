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
}

export function TagInput({
  label,
  tags,
  onChange,
  placeholder = "Add skill (press Enter)...",
  helperText,
  disabled = false,
  options = []
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
        opt.toLowerCase().includes(lower) && !tags.includes(opt)
      );
      setFilteredOptions(filtered.slice(0, 15)); // top 15 matches
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  }, [inputValue, tags, options]);

  const addTag = (valueOverride?: string) => {
    const val = valueOverride || inputValue;
    if (val.trim() !== "") {
      const parsed = parseSkillInput(val);
      let newTags = [...tags];
      let changed = false;
      for (const t of parsed) {
        if (!newTags.includes(t)) {
          newTags.push(t);
          changed = true;
        }
      }
      if (changed) {
        onChange(newTags);
      }
      setInputValue("");
      setShowDropdown(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      // If there's an exact match in the filtered options and user hits enter, they probably want to type it directly,
      // but let's just let addTag handle the raw input string.
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
            className="inline-flex items-center gap-1.5 border border-[#D2D2D2] bg-[#181a1f] px-2.5 py-1 rounded-sm font-mono text-[12px] text-[#0D0D0D] select-none"
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={() => removeTag(idx)}
                className="text-[#737373] hover:text-[#0D0D0D] focus:outline-none focus-visible:ring-1 focus-visible:ring-white rounded-sm transition-colors"
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
        <div className="absolute top-[calc(100%+4px)] left-0 w-full max-h-[250px] overflow-y-auto bg-[#181a1f] border border-[#E5E5E5] rounded-md shadow-2xl z-50 py-1 scrollbar-hide">
          {filteredOptions.map((opt, idx) => (
            <div
              key={idx}
              onClick={() => addTag(opt)}
              className="px-4 py-2.5 text-[14px] font-sans text-[#0D0D0D] hover:bg-[#E5E5E5] hover:text-[#0D0D0D] cursor-pointer transition-colors"
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
