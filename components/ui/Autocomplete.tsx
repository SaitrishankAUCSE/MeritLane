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
        <label htmlFor={inputId} className="font-data text-outline">
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
          className={`field-line pr-8 ${
            error ? "border-danger text-danger" : ""
          } ${className}`}
          {...props}
          autoComplete="off"
        />
        
        {/* End Adornment (Error, Loading, or Chevron) */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-outline" />
          ) : error ? (
            <AlertCircle className="h-4 w-4 text-danger" aria-hidden="true" />
          ) : (
            <ChevronDown className="h-4 w-4 text-outline" />
          )}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 z-50 mt-1 max-h-60 w-full overflow-y-auto border border-border bg-surface py-1 focus:outline-none">
          {loading && filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-center text-sm text-muted-foreground">Loading...</div>
          ) : filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-center text-sm text-muted-foreground">
              {inputValue ? "No results found. You can keep your custom entry." : "Type to search..."}
            </div>
          ) : (
            <ul className="pb-1 text-sm text-foreground">
              {filteredOptions.map((opt, idx) => (
                <li
                  key={idx}
                  onMouseDown={(e) => {
                    e.preventDefault();
                  }}
                  onClick={() => handleOptionSelect(opt)}
                  className={`flex cursor-pointer items-center justify-between px-3.5 py-2 select-none hover:bg-surface-low ${
                    opt === value ? "bg-surface-low font-medium" : ""
                  }`}
                >
                  <span className="truncate">{opt}</span>
                  {opt === value && <Check className="ml-2 h-4 w-4 shrink-0 text-foreground" />}
                </li>
              ))}
              {inputValue && !filteredOptions.some(opt => opt.toLowerCase() === inputValue.toLowerCase()) && (
                <li
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleOptionSelect(inputValue)}
                  className="mt-1 flex cursor-pointer items-center border-t border-border px-3.5 py-2 font-medium text-foreground select-none hover:bg-surface-low"
                >
                  Use &quot;{inputValue}&quot;
                </li>
              )}
            </ul>
          )}
        </div>
      )}

      {helperText && !error && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
      {error && (
        <p className="text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
