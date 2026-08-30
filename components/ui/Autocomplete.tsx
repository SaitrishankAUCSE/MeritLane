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
  emptyStateMessage?: string;
  noResultsMessage?: string;
  noResultsSubMessage?: string;
  errorMessage?: string;
  allowManualEntry?: boolean;
  manualEntryLabel?: string;
  manualEntryPlaceholder?: string;
  manualEntryHelpText?: string;
}

export function Autocomplete({
  label,
  value,
  onChange,
  placeholder,
  options,
  fetchOptions,
  disabled,
  emptyStateMessage = "Start typing to search...",
  noResultsMessage = "No matches found.",
  noResultsSubMessage = "Try a different spelling or search term.",
  errorMessage = "Unable to load results right now. Please try again.",
  allowManualEntry = false,
  manualEntryLabel = "Institution name",
  manualEntryPlaceholder = "Enter your university or college name",
  manualEntryHelpText = "Can't find your institution? Enter its official name manually."
}: AutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [isManualMode, setIsManualMode] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sync prop value to local query if it changes externally
  useEffect(() => {
    if (!isManualMode) {
      setQuery(value);
    }
  }, [value, isManualMode]);

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
    if (!isOpen || isManualMode) return;
    setError(false);

    if (fetchOptions) {
      if (!query) {
        setResults([]);
        return;
      }
      
      const delayDebounceFn = setTimeout(async () => {
        setIsLoading(true);
        setError(false);
        try {
          const res = await fetchOptions(query);
          setResults(res);
        } catch (e) {
          console.error(e);
          setError(true);
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      }, 250); // 250ms debounce
      return () => clearTimeout(delayDebounceFn);
    } else if (options) {
      if (!query) {
        setResults(options);
      } else {
        const filtered = options.filter(opt => opt.toLowerCase().includes(query.toLowerCase()));
        setResults(filtered);
      }
    }
  }, [query, isOpen, options, fetchOptions, isManualMode]);

  const handleSelect = (selected: string) => {
    setQuery(selected);
    onChange(selected);
    setIsOpen(false);
  };

  const handleSelectOther = () => {
    setIsManualMode(true);
    setIsOpen(false);
    setQuery("");
    onChange(""); // clear value when entering manual mode
  };

  const switchToSearchMode = () => {
    setIsManualMode(false);
    setQuery("");
    onChange("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val); // Keep parent state in sync
    if (!isManualMode) {
      setIsOpen(true);
    }
  };

  const toggleOpen = () => {
    if (!disabled && !isManualMode) {
      setIsOpen(!isOpen);
    }
  };

  const inputId = label ? label.toLowerCase().replace(/\s+/g, "-") : undefined;

  if (isManualMode) {
    return (
      <div className="flex w-full flex-col gap-1.5 text-left relative">
        <div className="flex justify-between items-center">
          {label && (
            <label htmlFor={inputId} className="font-sans text-[14px] text-foreground font-medium">
              {manualEntryLabel}
            </label>
          )}
          <button 
            type="button" 
            onClick={switchToSearchMode}
            className="text-[13px] text-primary hover:underline font-sans"
          >
            Choose from institution list
          </button>
        </div>
        <input
          id={inputId}
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(e.target.value.trimStart())}
          className="w-full h-[42px] px-3 py-2 bg-surface text-foreground text-[14px] font-sans border rounded-md transition-colors placeholder:text-muted-foreground focus:outline-none focus:border-outline focus-visible:ring-1 focus-visible:ring-foreground disabled:opacity-50 border-border"
          placeholder={manualEntryPlaceholder}
          autoComplete="off"
        />
        <p className="text-[13px] text-muted-foreground font-sans">{manualEntryHelpText}</p>
      </div>
    );
  }

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
          className={"w-full h-[42px] px-3 py-2 pr-10 bg-surface text-foreground text-[14px] font-sans border rounded-md transition-colors placeholder:text-muted-foreground focus:outline-none focus:border-outline focus-visible:ring-1 focus-visible:ring-foreground disabled:opacity-50 border-border"}
          placeholder={placeholder}
          autoComplete="off"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={`${inputId}-listbox`}
        />
        <button 
          type="button"
          onClick={toggleOpen}
          disabled={disabled}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground focus:outline-none"
        >
          {isLoading ? <div className="h-4 w-4 rounded-full border-[1.5px] border-[#E5E5E5] border-t-[#0D0D0D] animate-spin" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {isOpen && (
        <div id={`${inputId}-listbox`} role="listbox" className="absolute top-[calc(100%+4px)] left-0 w-full max-h-[300px] flex flex-col bg-[#FFFFFF] border border-[#E5E5E5] rounded-md shadow-sm z-50 py-1">
          <div className="overflow-y-auto scrollbar-hide flex-1">
            {isLoading ? (
              <div className="px-4 py-3 text-[13px] text-[#737373] italic font-sans">
                Searching...
              </div>
            ) : error ? (
              <div className="px-4 py-3 text-[13px] text-[#B42318] font-sans">
                {errorMessage}
              </div>
            ) : fetchOptions && !query ? (
              <div className="px-4 py-3 text-[13px] text-[#737373] italic font-sans">
                {emptyStateMessage}
              </div>
            ) : results.length > 0 ? (
              results.map((res, idx) => (
                <div
                  key={idx}
                  role="option"
                  aria-selected={query === res}
                  onClick={() => handleSelect(res)}
                  className="px-4 py-2.5 text-[14px] font-sans text-[#0D0D0D] hover:bg-[#F3F3F1] hover:text-[#0D0D0D] cursor-pointer transition-colors"
                >
                  {res}
                </div>
              ))
            ) : (
              <div className="px-4 py-3">
                <div className="text-[14px] font-medium text-[#0D0D0D] font-sans">
                  {noResultsMessage}
                </div>
                <div className="text-[12px] text-[#737373] font-sans mt-0.5">
                  {noResultsSubMessage}
                </div>
              </div>
            )}
          </div>
          
          {allowManualEntry && fetchOptions && query && !isLoading && !error && (
            <div className="border-t border-[#E5E5E5] mt-1 pt-1 bg-[#FAFAFA] flex-shrink-0">
              <div
                role="option"
                onClick={handleSelectOther}
                className="px-4 py-3 text-[14px] font-sans text-primary font-medium hover:bg-[#F3F3F1] cursor-pointer transition-colors flex items-center"
              >
                Other — My institution isn't listed
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
