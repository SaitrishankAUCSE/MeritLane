import React from "react";
import { Loader2 } from "lucide-react";

export type LoaderLevel = "page" | "section" | "button";

interface MeritlaneLoaderProps {
  level?: LoaderLevel;
  text?: string;
  className?: string;
}

export const MeritlaneLoader: React.FC<MeritlaneLoaderProps> = ({ 
  level = "section", 
  text,
  className = ""
}) => {
  if (level === "page") {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center bg-[#FAFAFA] ${className}`}>
        <div className="flex flex-col w-[300px] items-center text-center">
          <div className="mb-6 relative flex items-center justify-center">
            <div className="h-10 w-10 border border-[#E5E5E5] border-t-[#0D0D0D] rounded-full animate-spin"></div>
            <img src="/logo-m.png" alt="M" className="h-4 w-4 absolute opacity-50" />
          </div>
          <div className="font-sans text-[10px] font-bold uppercase tracking-[0.15em] text-[#0D0D0D] mb-1">
            Meritlane
          </div>
          <div className="font-mono text-[9px] text-[#737373] uppercase tracking-[0.2em] mb-4">
            Proof Record
          </div>
          
          <div className="flex items-center gap-3 w-full">
            <span className="font-mono text-[10px] text-[#737373] tracking-widest uppercase shrink-0 text-right w-[80px]">
              {text || "Syncing..."}
            </span>
            <div className="h-px bg-[#E5E5E5] flex-1 relative overflow-hidden">
              <div className="absolute top-0 bottom-0 left-0 w-1/3 bg-[#0D0D0D] animate-[indeterminate_1.5s_ease-in-out_infinite]" />
            </div>
          </div>
        </div>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes indeterminate {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(300%); }
          }
        `}} />
      </div>
    );
  }

  if (level === "button") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Loader2 className="h-3.5 w-3.5 animate-spin text-current opacity-70" />
        {text && <span>{text}</span>}
      </div>
    );
  }

  // Section level (default)
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <div className="h-4 w-4 border border-[#E5E5E5] border-t-[#0D0D0D] rounded-full animate-spin mb-3"></div>
      <div className="font-mono text-[10px] text-[#737373] uppercase tracking-[0.15em]">
        {text || "Loading Data"}
      </div>
    </div>
  );
};
