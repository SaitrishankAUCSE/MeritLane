"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface RandomLetterSwapProps {
  label: string;
  className?: string;
  staggerDuration?: number;
  transition?: any;
}

const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";

export function RandomLetterSwap({
  label,
  className = "",
  staggerDuration = 0.025,
  transition = { duration: 0.6, type: "spring" }
}: RandomLetterSwapProps) {
  const [displayedText, setDisplayedText] = useState(label);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!isHovered) {
      setDisplayedText(label);
      return;
    }

    let iterations = 0;
    const maxIterations = label.length * 2;
    
    const interval = setInterval(() => {
      setDisplayedText(() =>
        label
          .split("")
          .map((char, index) => {
            if (index < Math.floor(iterations / 2)) {
              return label[index];
            }
            if (label[index] === " ") return " ";
            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join("")
      );

      if (iterations >= maxIterations) {
        clearInterval(interval);
        setDisplayedText(label);
      }
      
      iterations += 1;
    }, staggerDuration * 1000);

    return () => {
      clearInterval(interval);
      setDisplayedText(label);
    };
  }, [isHovered, label, staggerDuration]);

  return (
    <motion.span
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      transition={transition}
    >
      {displayedText}
    </motion.span>
  );
}
