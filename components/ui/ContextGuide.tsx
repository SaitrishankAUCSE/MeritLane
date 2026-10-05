"use client";

import React, { useState, useEffect } from "react";
import { X, CheckCircle2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface GuideStep {
  title: string;
  description?: string;
  isCompleted?: boolean;
}

interface ContextGuideProps {
  title: string;
  description?: string;
  steps: GuideStep[];
  ctaLabel?: string;
  ctaHref?: string;
  ctaOnClick?: () => void;
  ctaDisabled?: boolean;
  storageKey: string;
}

export function ContextGuide(_props: ContextGuideProps) {
  // Suppressed to maintain clean institutional aesthetic without SaaS onboarding widgets
  return null;
}
