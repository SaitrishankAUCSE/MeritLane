"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Search } from "lucide-react";

export interface AutocompleteProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  options?: string[]; // Static options
  fetchOptions?: (query: string) => Promise<string[]>; // Dynamic fetch
  disabled?: boolean;
}

export function Autocomplete({
  label,
  value,
  onChange,
  placeholder,
  options,
  fetchOptions,
  disabled
}: AutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sync prop value to local query if it changes externally
  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    if (fetchOptions) {
      const delayDebounceFn = setTimeout(async () => {
        setIsLoading(true);
        try {
          const res = await fetchOptions(query);
          setResults(res);
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoading(false);
        }
      }, 300); // 300ms debounce
      return () => clearTimeout(delayDebounceFn);
    } else if (options) {
      if (!query) {
        setResults(options);
      } else {
        const filtered = options.filter(opt => opt.toLowerCase().includes(query.toLowerCase()));
        setResults(filtered);
      }
    }
  }, [query, isOpen, options, fetchOptions]);

  const handleSelect = (selected: string) => {
    setQuery(selected);
    onChange(selected);
    setIsOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    onChange(e.target.value); // Keep parent state in sync even if not selected from list
    setIsOpen(true);
  };

  const inputId = label ? label.toLowerCase().replace(/\s+/g, "-") : undefined;

  return (
    <div className="flex w-full flex-col gap-1.5 text-left relative" ref={wrapperRef}>
      {label && (
        <label htmlFor={inputId} className="font-sans text-[14px] text-foreground font-medium">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          disabled={disabled}
          value={query}
          onChange={handleChange}
          onFocus={() => setIsOpen(true)}
          className={"w-full h-[42px] px-3 py-2 bg-surface text-foreground text-[14px] font-sans border rounded-md transition-colors placeholder:text-muted-foreground focus:outline-none focus:border-outline focus-visible:ring-1 focus-visible:ring-foreground disabled:opacity-50 border-border"}
          placeholder={placeholder}
          autoComplete="off"
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">
          {isLoading ? <div className="h-4 w-4 rounded-full border-[1.5px] border-[#E5E5E5] border-t-[#0D0D0D] animate-spin" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-[calc(100%+4px)] left-0 w-full max-h-[250px] overflow-y-auto bg-[#FFFFFF] border border-[#E5E5E5] rounded-md shadow-sm z-50 py-1 scrollbar-hide">
          {results.length > 0 ? (
            results.map((res, idx) => (
              <div
                key={idx}
                onClick={() => handleSelect(res)}
                className="px-4 py-2.5 text-[14px] font-sans text-[#0D0D0D] hover:bg-[#F3F3F1] hover:text-[#0D0D0D] cursor-pointer transition-colors"
              >
                {res}
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-[13px] text-[#737373] italic font-sans">
              {isLoading ? "Searching..." : "No matches found."}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
