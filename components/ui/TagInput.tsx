"use client";

import React, { useState, KeyboardEvent } from "react";
import { X, Plus } from "lucide-react";

interface TagInputProps {
  label?: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  helperText?: string;
}

export function TagInput({
  label,
  tags,
  onChange,
  placeholder = "Add skill (press Enter)...",
  helperText,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const addTag = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
      setInputValue("");
    }
  };

  const removeTag = (indexToRemove: number) => {
    onChange(tags.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-xs font-medium text-zinc-700">{label}</label>}
      <div className="flex min-h-[42px] flex-wrap items-center gap-1.5 rounded-md border border-zinc-200 bg-white p-1.5 shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-colors">
        {tags.map((tag, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-800 border border-zinc-200"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(idx)}
              className="text-zinc-400 hover:text-zinc-700 focus:outline-none"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <div className="flex flex-1 items-center min-w-[120px]">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={addTag}
            placeholder={tags.length === 0 ? placeholder : "Add more..."}
            className="w-full bg-transparent px-2 py-1 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
          />
        </div>
      </div>
      {helperText && <p className="text-xs text-zinc-500">{helperText}</p>}
    </div>
  );
}
