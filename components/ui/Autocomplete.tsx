import React, { useState, useEffect, useRef, useCallback } from "react";
import { AlertCircle, Loader2, ChevronDown, Check } from "lucide-react";

export interface AutocompleteProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  label?: string;
  helperText?: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  // Use either static options or a fetch function
  options?: string[];
  fetchOptions?: (query: string) => Promise<string[]>;
  debounceMs?: number;
}

export function Autocomplete({
  label,
  helperText,
  error,
  id,
  className = "",
  disabled,
  value,
  onChange,
  options,
  fetchOptions,
  debounceMs = 300,
  placeholder,
  ...props
}: AutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : "autocomplete-input");

  // Sync prop value to input value when it changes externally
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const runSearch = useCallback(async (query: string) => {
    setLoading(true);
    try {
      if (fetchOptions) {
        const results = await fetchOptions(query);
        setFilteredOptions(results);
      } else if (options) {
        const results = options.filter(opt => opt.toLowerCase().includes(query.toLowerCase()));
        setFilteredOptions(results);
      }
    } catch (err) {
      console.error("Autocomplete search error:", err);
    } finally {
      setLoading(false);
    }
  }, [fetchOptions, options]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setInputValue(newVal);
    onChange(newVal); // Let parent know immediately
    setIsOpen(true);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(() => {
      runSearch(newVal);
    }, debounceMs);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    runSearch(inputValue);
  };

  const handleOptionSelect = (option: string) => {
    setInputValue(option);
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col gap-1.5 w-full text-left relative" ref={wrapperRef}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold text-zinc-900">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          disabled={disabled}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className={`w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 transition-all duration-150 ease-out hover:border-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 disabled:opacity-50 disabled:bg-zinc-50 ${
            error
              ? "border-red-500 hover:border-red-600 focus:border-red-500 focus:ring-red-500/10 text-red-900 pr-10"
              : ""
          } ${className}`}
          {...props}
          autoComplete="off"
        />
        
        {/* End Adornment (Error, Loading, or Chevron) */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
          ) : error ? (
            <AlertCircle className="h-4 w-4 text-red-500" aria-hidden="true" />
          ) : (
            <ChevronDown className="h-4 w-4 text-zinc-400" />
          )}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 mt-1 w-full z-50 max-h-60 overflow-y-auto rounded-md border border-zinc-200 bg-white py-1 shadow-lg focus:outline-none">
          {loading && filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-sm text-zinc-500 text-center">Loading...</div>
          ) : filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-sm text-zinc-500 text-center">
              {inputValue ? "No results found. You can keep your custom entry." : "Type to search..."}
            </div>
          ) : (
            <ul className="text-sm text-zinc-900 pb-1">
              {filteredOptions.map((opt, idx) => (
                <li
                  key={idx}
                  onMouseDown={(e) => {
                    // Prevent input blur before click fires
                    e.preventDefault();
                  }}
                  onClick={() => handleOptionSelect(opt)}
                  className={`cursor-pointer select-none px-3.5 py-2 hover:bg-zinc-50 flex items-center justify-between ${
                    opt === value ? "bg-zinc-100 font-medium" : ""
                  }`}
                >
                  <span className="truncate">{opt}</span>
                  {opt === value && <Check className="h-4 w-4 text-zinc-900 shrink-0 ml-2" />}
                </li>
              ))}
              {inputValue && !filteredOptions.some(opt => opt.toLowerCase() === inputValue.toLowerCase()) && (
                <li
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleOptionSelect(inputValue)}
                  className="cursor-pointer select-none px-3.5 py-2 mt-1 border-t border-zinc-100 text-zinc-900 hover:bg-zinc-50 font-medium flex items-center"
                >
                  Use &quot;{inputValue}&quot;
                </li>
              )}
            </ul>
          )}
        </div>
      )}

      {helperText && !error && (
        <p className="text-xs text-zinc-500">{helperText}</p>
      )}
      {error && (
        <p className="text-xs font-medium text-red-600 animate-in fade-in duration-150">
          {error}
        </p>
      )}
    </div>
  );
}
