"use client";

import React, { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { parseSkillInput } from "@/lib/skills";

export interface TagInputProps {
  label?: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  helperText?: string;
  disabled?: boolean;
}

export function TagInput({
  label,
  tags,
  onChange,
  placeholder = "Add skill (press Enter)...",
  helperText,
  disabled = false,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const addTag = () => {
    if (disabled) return;
    const parsedTags = parseSkillInput(inputValue);
    if (parsedTags.length > 0) {
      const newTags = [...tags];
      let changed = false;
      for (const t of parsedTags) {
        if (!newTags.includes(t)) {
          newTags.push(t);
          changed = true;
        }
      }
      if (changed) {
        onChange(newTags);
      }
      setInputValue("");
    }
  };

  const removeTag = (indexToRemove: number) => {
    if (disabled) return;
    onChange(tags.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className={`flex flex-col gap-1.5 w-full text-left ${disabled ? "opacity-70 pointer-events-none" : ""}`}>
      {label && (
        <label className="font-data text-outline">
          {label}
        </label>
      )}
      <div className={`flex min-h-[42px] flex-wrap items-center gap-1.5 border-b border-border py-1.5 ${disabled ? "opacity-70" : "focus-within:border-foreground"}`}>
        {tags.map((tag, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1 border border-border px-2 py-0.5 font-data text-muted-foreground select-none"
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={() => removeTag(idx)}
                className="text-outline hover:text-foreground focus:outline-none"
                aria-label={`Remove ${tag}`}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </span>
        ))}
        {!disabled && (
          <div className="flex min-w-[120px] flex-1 items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={addTag}
              placeholder={tags.length === 0 ? placeholder : "Add more..."}
              className="w-full bg-transparent px-1.5 py-1 text-[15px] text-foreground placeholder:text-outline focus:outline-none"
              disabled={disabled}
            />
          </div>
        )}
      </div>
      {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}
    </div>
  );
}
