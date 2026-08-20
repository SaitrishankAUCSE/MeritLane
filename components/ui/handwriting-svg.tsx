"use client";

import { motion } from "framer-motion";
import * as opentype from "opentype.js";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const DEFAULT_FONT_URL =
  "https://raw.githubusercontent.com/google/fonts/main/ofl/indieflower/IndieFlower-Regular.ttf";

interface HandwritingSvgProps {
  path?: string;
  text?: string;
  fontUrl?: string;
  className?: string;
  strokeClassName?: string;
  duration?: number;
  delay?: number;
  strokeWidth?: number;
  width?: number;
  height?: number;
  fontSize?: number;
  ease?: "linear" | "easeIn" | "easeOut" | "easeInOut";
  onAnimationComplete?: () => void;
}

export function HandwritingSvg({
  path: pathProp,
  text,
  fontUrl = DEFAULT_FONT_URL,
  className,
  strokeClassName,
  duration = 2,
  delay = 0.5,
  strokeWidth = 2,
  width = 100,
  height = 100,
  fontSize = 48,
  ease = "easeInOut",
  onAnimationComplete,
}: HandwritingSvgProps) {
  const [path, setPath] = useState<string | null>(pathProp ?? null);
  const [viewBox, setViewBox] = useState(`${0} ${0} ${width} ${height}`);
  const [loading, setLoading] = useState(!!text && !pathProp);

  useEffect(() => {
    if (!text || pathProp) {
      setPath(pathProp ?? null);
      setViewBox(`0 0 ${width} ${height}`);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(fontUrl)
      .then((res) => res.arrayBuffer())
      .then((buffer) => {
        if (cancelled) {
          return;
        }
        const font = opentype.parse(buffer);
        const p = font.getPath(text, 0, fontSize, fontSize);
        const bbox = p.getBoundingBox();
        const pad = 5;
        const vx = Math.floor(bbox.x1) - pad;
        const vy = Math.floor(bbox.y1) - pad;
        const vw = Math.ceil(bbox.x2 - bbox.x1) + pad * 2;
        const vh = Math.ceil(bbox.y2 - bbox.y1) + pad * 2;
        setViewBox(`${vx} ${vy} ${vw} ${vh}`);
        setPath(p.toPathData(2));
      })
      .catch(() => {
        if (!cancelled) {
          setPath(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [text, fontUrl, pathProp, fontSize, width, height]);

  if (loading) {
    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className={cn("w-full h-auto text-muted-foreground", className)}
        aria-hidden={true}
      >
        <title>Handwriting SVG loading</title>
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={14}
        >
          Loading...
        </text>
      </svg>
    );
  }

  const d = path ?? "";
  if (!d) {
    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className={cn("w-full h-auto text-muted-foreground", className)}
        aria-hidden={true}
      >
        <title>Handwriting SVG</title>
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={12}
        >
          {text ? "Invalid font" : "Provide path or text"}
        </text>
      </svg>
    );
  }

  const svgViewBox = pathProp ? `0 0 ${width} ${height}` : viewBox;
  
  // Split the compound path into individual segments (by 'M' or 'm' command) 
  // to avoid browser bugs with getTotalLength() on compound paths
  const segments = d.split(/(?=[Mm])/g).filter(s => s.trim().length > 0);
  
  // Calculate timing for sequential drawing
  const segmentDuration = duration / (segments.length || 1);

  return (
    <svg
      viewBox={svgViewBox}
      className={cn("w-full h-auto text-rose-500", className)}
      aria-hidden={true}
    >
      <title>Handwriting SVG</title>
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;
        return (
          <motion.path
            key={index}
            d={segment}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={strokeClassName}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ 
              delay: delay + (index * segmentDuration), 
              duration: segmentDuration, 
              ease: "linear" 
            }}
            onAnimationComplete={isLast ? onAnimationComplete : undefined}
          />
        );
      })}
    </svg>
  );
}

export default HandwritingSvg;
