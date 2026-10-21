"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { db } from "@/lib/firebase/config";
import { doc, updateDoc } from "firebase/firestore";
import {
  ShieldCheck,
  Code,
  Layers,
  Award,
  Trophy,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  Terminal,
  Play,
  Briefcase,
  ExternalLink,
  Sparkles,
  GitBranch,
  Fingerprint,
  Mail,
  X,
  FileCheck,
  HelpCircle,
  Users,
  Search,
  CheckSquare,
  Zap,
  Rocket,
  Compass,
  FileText,
} from "lucide-react";

/**
 * High-performance celebratory confetti canvas bursting upward on welcome
 */
function CelebrationConfetti() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      rotation: number;
      vRot: number;
      alpha: number;
    }> = [];

    const colors = ["#065F46", "#10B981", "#F59E0B", "#D97706", "#3B82F6", "#EC4899", "#8B5CF6"];

    const updateSize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    updateSize();

    for (let i = 0; i < 70; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.5;
      const speed = 7 + Math.random() * 9;
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 80,
        y: canvas.height * 0.45,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 5 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2,
        alpha: 1,
      });
    }

    let start = performance.now();
    const render = (time: number) => {
      const elapsed = (time - start) / 1000;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let alive = false;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.22;
        p.vx *= 0.985;
        p.rotation += p.vRot;

        if (elapsed > 1.8) {
          p.alpha = Math.max(0, p.alpha - 0.02);
        }

        if (p.alpha > 0.01 && p.y < canvas.height + 20) {
          alive = true;
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
          ctx.restore();
        }
      }

      if (alive) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-30 h-full w-full"
    />
  );
}

export function ProtocolWelcomeExperience() {
  const { user, userProfile, role, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isEmployer = role === "employer" || pathname?.startsWith("/employer");

  const [isOpen, setIsOpen] = useState(false);
  // -1: Celebration Entrance Animation Screen (for new users only)
  // 0-3: 4-Step Interactive Feature Tour
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [simulatedRunOutput, setSimulatedRunOutput] = useState<string[]>([]);
  const [isRunningSim, setIsRunningSim] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Check if user is a genuinely NEW user who JUST registered
  useEffect(() => {
    if (loading || !user) return;

    const completedKey = `meritlane_welcome_v4_${user.uid}`;
    const hasAlreadySeen =
      (typeof window !== "undefined" && localStorage.getItem(completedKey) === "true") ||
      userProfile?.hasSeenWelcomeOnboarding === true;

    // Existing users who already completed or dismissed onboarding MUST NEVER see this modal again
    if (hasAlreadySeen) {
      return;
    }

    // STRICT USER RULE: Only trigger celebration animation when a brand-new user signs up, NEVER on regular logins
    const isBrandNewSignup =
      typeof window !== "undefined" &&
      sessionStorage.getItem("meritlane_trigger_signup_welcome") === user.uid;

    if (isBrandNewSignup) {
      // Consume the one-time trigger immediately so refreshes/logins will never show it again
      sessionStorage.removeItem("meritlane_trigger_signup_welcome");
      localStorage.setItem(completedKey, "true");
      localStorage.setItem(`meritlane_seen_session_${user.uid}`, "true");

      if (db) {
        updateDoc(doc(db, "users", user.uid), {
          hasSeenWelcomeOnboarding: true,
          isNewUser: false,
        }).catch(() => {});
      }

      setCurrentStep(-1);
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      // Normal login — ensure user is marked as having seen onboarding so it never interrupts their workflow
      if (typeof window !== "undefined") {
        localStorage.setItem(completedKey, "true");
        localStorage.setItem(`meritlane_seen_session_${user.uid}`, "true");
        localStorage.removeItem(`meritlane_show_welcome_${user.uid}`);
        localStorage.removeItem(`meritlane_new_signup_${user.uid}`);
      }
    }
  }, [user, userProfile, loading]);

  // Global event listener to re-open guide anytime from user menu or help button
  useEffect(() => {
    const handleOpen = () => {
      setCurrentStep(0);
      setIsCompleted(false);
      setIsOpen(true);
    };
    window.addEventListener("open-meritlane-welcome", handleOpen);
    return () => window.removeEventListener("open-meritlane-welcome", handleOpen);
  }, []);

  // Keyboard navigation support
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleDismiss();
      } else if (e.key === "ArrowRight") {
        if (currentStep >= 0 && currentStep < totalSteps - 1) {
          setCurrentStep((prev) => prev + 1);
        } else if (currentStep === -1) {
          setCurrentStep(0);
        }
      } else if (e.key === "ArrowLeft") {
        if (currentStep > 0) setCurrentStep((prev) => prev - 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentStep]);

  const handleDismiss = async () => {
    setIsOpen(false);
    if (!user) return;
    const completedKey = `meritlane_welcome_v4_${user.uid}`;
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(completedKey, "true");
        localStorage.setItem(`meritlane_seen_session_${user.uid}`, "true");
        localStorage.removeItem(`meritlane_show_welcome_${user.uid}`);
        localStorage.removeItem(`meritlane_new_signup_${user.uid}`);
        window.dispatchEvent(new CustomEvent("meritlane-welcome-dismissed"));
      }
      if (db) {
        await updateDoc(doc(db, "users", user.uid), {
          hasSeenWelcomeOnboarding: true,
          isNewUser: false,
        }).catch(() => {});
      }
    } catch {}
  };

  const handleComplete = async () => {
    setIsCompleted(true);
    setTimeout(() => {
      handleDismiss();
    }, 600);
  };

  // Run interactive simulation in Candidate Step 1 (Skill Tests)
  const runSimulatedSandbox = () => {
    if (isRunningSim) return;
    setIsRunningSim(true);
    setSimulatedRunOutput(["> Starting Python compiler sandbox..."]);

    setTimeout(() => {
      setSimulatedRunOutput((prev) => [...prev, "> Running Public Test Case 1: [2, 7, 11, 15], target 9..."]);
    }, 400);

    setTimeout(() => {
      setSimulatedRunOutput((prev) => [...prev, "  ✓ Test Case 1 Passed in 1.4ms (Expected: [0, 1])"]);
    }, 800);

    setTimeout(() => {
      setSimulatedRunOutput((prev) => [...prev, "  ✓ Test Case 2 Passed in 1.2ms (Edge case: zeros & negatives)"]);
    }, 1200);

    setTimeout(() => {
      setSimulatedRunOutput((prev) => [
        ...prev,
        "> All 5 test cases passed successfully!",
        "[PASSED] 94% score: Official Verified Badge Awarded",
      ]);
      setIsRunningSim(false);
    }, 1600);
  };

  const candidateKey = user?.uid ? `ML-${user.uid.substring(0, 8).toUpperCase()}` : "ML-7E2A91D4";
  const displayName =
    user?.displayName ||
    userProfile?.displayName ||
    user?.email?.split("@")[0] ||
    (isEmployer ? "Hiring Lead" : "Engineer");

  // ── Candidate Walkthrough Steps (Clear, practical English) ──────────────────
  const candidateSteps = [
    {
      pillLabel: "1. Profile Setup",
      stage: "Step 1 of 4 • You Are Here",
      title: "Build Your Profile & Connect GitHub",
      subtitle: "Your real commits and projects replace lengthy text resumes.",
      description:
        "Traditional resumes get lost in applicant filters. On MeritLane, you upload your resume once to auto-fill your details, connect GitHub, and list your top skills. Your actual code does the talking.",
      bullets: [
        "Upload your resume PDF to automatically extract your education and skills.",
        "Connect GitHub to showcase your real repositories and commit activity.",
        "Your unique Candidate Key anchors your permanent public verified portfolio.",
      ],
      widget: (
        <div className="bg-white border border-[#D8D2C5] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#D8D2C5] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-full bg-emerald-900/10 border border-emerald-900/20 flex items-center justify-center font-bold text-emerald-900 text-xs">
                {displayName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="text-[13px] font-bold text-[#1C1917]">{displayName}</div>
                <div className="text-[11px] font-mono text-[#78716C]">{candidateKey}</div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-900 bg-emerald-900/10 border border-emerald-900/20 px-2.5 py-0.5 rounded-full">
              <ShieldCheck className="h-3.5 w-3.5" /> Ready for Verification
            </span>
          </div>

          <div className="space-y-2">
            <div className="text-[11px] font-sans uppercase tracking-wider text-[#78716C] font-semibold">
              Connected GitHub Activity
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-lg bg-[#FAF7F0] border border-[#D8D2C5] text-center">
                <div className="text-[15px] font-bold text-[#1C1917]">348</div>
                <div className="text-[11px] text-[#78716C]">Commits</div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#FAF7F0] border border-[#D8D2C5] text-center">
                <div className="text-[15px] font-bold text-[#1C1917]">12</div>
                <div className="text-[11px] text-[#78716C]">Repos</div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#FAF7F0] border border-[#D8D2C5] text-center">
                <div className="text-[15px] font-bold text-emerald-900">Top 5%</div>
                <div className="text-[11px] text-[#78716C]">Active</div>
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded bg-emerald-900/[0.04] border border-emerald-900/15 flex items-center gap-2 text-[12px] text-emerald-900 font-medium">
            <GitBranch className="h-3.5 w-3.5 shrink-0" />
            <span>Complete this step below to unlock all remaining features!</span>
          </div>
        </div>
      ),
    },
    {
      pillLabel: "2. Skill Tests",
      stage: "Step 2 of 4 • Unlocks After Profile",
      title: "Take Real Coding & Knowledge Tests",
      subtitle: "Solve practical challenges curated from 500+ top tech interview questions.",
      description:
        "Once your profile is saved, you unlock proctored skill assessments. Write code directly in your browser, test against sample cases, and receive instant automated feedback.",
      bullets: [
        "Standard Track: 1 Easy + 1 Medium question to earn your Verified Professional badge.",
        "Advanced Track: Solve a Hard challenge to earn prestigious Gold Honors distinction.",
        "Built-in sandbox compiler: run code against test cases before submitting.",
      ],
      widget: (
        <div className="bg-[#0F172A] border border-slate-700 rounded-xl overflow-hidden shadow-md font-mono text-xs">
          <div className="bg-slate-800/90 px-4 py-2 border-b border-slate-700 flex items-center justify-between text-slate-300">
            <div className="flex items-center gap-2">
              <Terminal className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-[11px] text-slate-200 font-semibold">sandbox_runner.py · 500 Questions</span>
            </div>
            <button
              onClick={runSimulatedSandbox}
              disabled={isRunningSim}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-[11px] font-bold cursor-pointer transition-colors shadow-xs"
            >
              <Play className="h-2.5 w-2.5 fill-current" />
              {isRunningSim ? "Running..." : "Run Test Suite"}
            </button>
          </div>

          <div className="p-4 space-y-1.5 min-h-[170px] text-[11.5px] leading-relaxed text-slate-300 overflow-y-auto">
            {simulatedRunOutput.length === 0 ? (
              <div className="text-slate-400 italic py-5 text-center font-sans text-[12px]">
                Click &quot;Run Test Suite&quot; above to preview how MeritLane compiles code and runs test cases.
              </div>
            ) : (
              simulatedRunOutput.map((line, i) => (
                <div
                  key={i}
                  className={
                    line.includes("★")
                      ? "text-amber-400 font-bold"
                      : line.includes("✓")
                      ? "text-emerald-400"
                      : "text-slate-300"
                  }
                >
                  {line}
                </div>
              ))
            )}
          </div>

          <div className="px-4 py-2 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Passing Benchmark: 75%+</span>
            <span className="text-emerald-400 font-semibold">Proctored &amp; Fair</span>
          </div>
        </div>
      ),
    },
    {
      pillLabel: "3. Verified Badge",
      stage: "Step 3 of 4 • Your Credential",
      title: "Earn Your Official Verification Badge",
      subtitle: "Score 75% or higher to show employers your skills are genuine.",
      description:
        "When you complete an assessment, your verified score is permanently recorded. Companies can view your exact score breakdown and code quality without asking you to repeat screening quizzes.",
      bullets: [
        "Your score is verified and tamper-proof — companies know it is 100% genuine.",
        "Share your personalized public link on LinkedIn, your resume, or job applications.",
        "Stand out immediately to engineering managers over unverified applicants.",
      ],
      widget: (
        <div className="bg-white border-2 border-emerald-900/30 rounded-xl p-5 shadow-xs space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-emerald-900" />
              <span className="text-[12px] font-sans font-bold tracking-wide text-emerald-900 uppercase">
                Verified Skill Credential
              </span>
            </div>
            <span className="text-[11px] font-sans bg-amber-50 text-amber-800 border border-amber-300 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
              <Trophy className="h-3 w-3 text-amber-700" /> Gold Honors
            </span>
          </div>

          <div className="space-y-1 pt-1">
            <div className="text-[15px] font-sans font-bold text-[#1C1917]">Python &amp; Algorithms Master</div>
            <div className="text-[12px] text-[#78716C] leading-relaxed">
              Passed proctored coding and algorithmic challenge with 94% score.
            </div>
          </div>

          <div className="p-3 bg-[#FAF7F0] border border-[#D8D2C5] rounded-lg flex items-center justify-between">
            <div className="truncate pr-2">
              <div className="text-[10px] uppercase font-semibold text-[#78716C]">Your Public Verification Link</div>
              <div className="text-[12px] font-mono text-emerald-900 font-semibold truncate">
                meritlane.com/p/{candidateKey.toLowerCase()}
              </div>
            </div>
            <button
              onClick={() => {
                setCopiedLink(true);
                setTimeout(() => setCopiedLink(false), 2000);
              }}
              className="shrink-0 flex items-center gap-1 text-[11px] font-sans font-semibold bg-white border border-[#D8D2C5] px-2.5 py-1 rounded hover:border-[#1C1917] transition-colors cursor-pointer"
            >
              {copiedLink ? <Check className="h-3 w-3 text-emerald-700" /> : <Copy className="h-3 w-3" />}
              {copiedLink ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      ),
    },
    {
      pillLabel: "4. Get Hired",
      stage: "Step 4 of 4 • Direct Interviews",
      title: "Get Discovered & Hired Faster",
      subtitle: "Top companies search by verified skills and reach out directly.",
      description:
        "Once verified, your profile appears in the Employer Talent Directory. Because employers already know you can code, you skip basic technical screenings and jump straight to team interviews.",
      bullets: [
        "Direct messages: verified employers send interview invitations straight to your Inbox.",
        "Apply in 1 click: apply to open roles with your verified test scores attached.",
        "Zero recruiter spam: connect directly with actual hiring managers and founders.",
      ],
      widget: (
        <div className="bg-white border border-[#D8D2C5] rounded-xl p-5 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between border-b border-[#D8D2C5] pb-3">
            <div className="flex items-center gap-2 text-[#1C1917] font-semibold text-[13px]">
              <Mail className="h-4 w-4 text-emerald-900" />
              Incoming Interview Invitation
            </div>
            <span className="text-[10px] bg-emerald-900/10 text-emerald-900 px-2 py-0.5 rounded font-bold uppercase">
              Fast Track
            </span>
          </div>

          <div className="space-y-2 text-[12px] text-[#78716C] leading-relaxed">
            <div className="p-3 rounded-lg bg-[#FAF7F0] border border-[#D8D2C5] text-[#1C1917]">
              <p className="font-semibold text-[12px] mb-1 text-emerald-950">Engineering Lead at Tech Corp:</p>
              &ldquo;We saw your 94% score on the Python assessment. We would love to skip our initial screening and schedule an interview with you this week.&rdquo;
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-[#78716C]">Average response time: under 24 hours</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-900 hover:underline">
              View Inbox <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      ),
    },
  ];

  // ── Employer Walkthrough Steps ──────────────────────────────────────────────
  const employerSteps = [
    {
      pillLabel: "1. Company Profile",
      stage: "Step 1 of 4 • You Are Here",
      title: "Complete Your Company Profile",
      subtitle: "Set up your hiring profile to unlock candidate search and job posts.",
      description:
        "Tell engineers about your company, engineering culture, and tech stack. Complete this step below to unlock the verified candidate search and job posting tools.",
      bullets: [
        "Enter your company name, website, and engineering team size.",
        "Highlight your core technologies and hiring locations.",
        "Verified company profiles receive higher candidate response rates.",
      ],
      widget: (
        <div className="bg-white border border-[#D8D2C5] rounded-xl p-5 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between border-b border-[#D8D2C5] pb-3">
            <div>
              <div className="text-[13px] font-bold text-[#1C1917]">Company Profile Setup</div>
              <div className="text-[11px] text-[#78716C]">Hiring Partner Verification</div>
            </div>
            <span className="text-[11px] font-semibold bg-emerald-900/10 text-emerald-900 px-2.5 py-0.5 rounded-full">
              Step 1 Required
            </span>
          </div>
          <div className="p-3 rounded-lg bg-[#FAF7F0] border border-[#D8D2C5] text-[12px] text-[#57534E] leading-relaxed">
            Complete your profile below to unlock job posting and candidate search.
          </div>
        </div>
      ),
    },
    {
      pillLabel: "2. Post Jobs",
      stage: "Step 2 of 4 • Job Benchmarks",
      title: "Post Jobs with Exact Skill Requirements",
      subtitle: "Tell candidates the tech stack and minimum test score you need.",
      description:
        "Creating a job listing is fast and straightforward. Set the programming languages and frameworks required for your engineering role so candidates know exactly what to prepare for.",
      bullets: [
        "Pick required skills: Python, React, TypeScript, Go, Java, SQL, and more.",
        "Set passing criteria: require a minimum 75% score or Gold Honors distinction.",
        "Automatically filter out unqualified applicants before you spend time reviewing.",
      ],
      widget: (
        <div className="bg-white border border-[#D8D2C5] rounded-xl p-5 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between border-b border-[#D8D2C5] pb-3">
            <div>
              <div className="text-[13px] font-bold text-[#1C1917]">Senior Backend Engineer</div>
              <div className="text-[11px] text-[#78716C]">Full-time · Remote</div>
            </div>
            <span className="text-[11px] font-semibold bg-emerald-900/10 text-emerald-900 px-2.5 py-0.5 rounded-full">
              Active Opening
            </span>
          </div>
          <div className="space-y-2">
            <div className="text-[11px] font-sans uppercase tracking-wider text-[#78716C] font-semibold">
              Required Skill Benchmarks
            </div>
            <div className="flex flex-wrap gap-1.5">
              <span className="text-[11px] font-medium bg-[#FAF7F0] border border-[#D8D2C5] px-2.5 py-1 rounded">
                Python (≥75% Score)
              </span>
              <span className="text-[11px] font-medium bg-[#FAF7F0] border border-[#D8D2C5] px-2.5 py-1 rounded">
                SQL &amp; Database Design
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      pillLabel: "3. Filter Talent",
      stage: "Step 3 of 4 • Talent Search",
      title: "Find Candidates by Verified Skills",
      subtitle: "Search through engineers who passed real proctored technical evaluations.",
      description:
        "No more sorting through keyword-stuffed resumes or guessing if a candidate actually knows what they claim. Search candidates with real, automated test results.",
      bullets: [
        "Filter by verified language mastery (Python, React, TypeScript, Go, Java, SQL).",
        "Inspect real Git commit activity, project history, and code repository complexity.",
        "Zero resume fluff: every badge links directly to verified sandbox test runs.",
      ],
      widget: (
        <div className="bg-white border border-[#D8D2C5] rounded-xl p-5 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between border-b border-[#D8D2C5] pb-3">
            <div className="text-[13px] font-bold text-[#1C1917]">Verified Talent Directory</div>
            <span className="text-[10px] font-mono bg-emerald-900/10 text-emerald-900 px-2 py-0.5 rounded font-bold uppercase">
              ≥ 75% Score
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2.5 rounded bg-[#FAF7F0] border border-[#D8D2C5]">
              <span className="text-[12px] font-medium text-[#1C1917]">Python &amp; Systems</span>
              <span className="text-[11px] font-mono text-emerald-900 font-bold">142 Engineers Verified</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded bg-[#FAF7F0] border border-[#D8D2C5]">
              <span className="text-[12px] font-medium text-[#1C1917]">React &amp; TypeScript</span>
              <span className="text-[11px] font-mono text-emerald-900 font-bold">98 Engineers Verified</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      pillLabel: "4. Direct Hire",
      stage: "Step 4 of 4 • Interview & Hire",
      title: "Contact Candidates Directly with Zero Recruiter Fees",
      subtitle: "Send interview invitations straight to verified candidates.",
      description:
        "Skip external recruitment agencies and endless screening calls. Send direct messages and interview invitations to engineers who have already met your skill benchmarks.",
      bullets: [
        "Direct Messaging: reach out directly to candidates inside MeritLane.",
        "High response rate: verified candidates actively check incoming interview invitations.",
        "Zero agency commissions: hire as many engineers as you need at no extra fee.",
      ],
      widget: (
        <div className="bg-white border border-[#D8D2C5] rounded-xl p-5 shadow-xs space-y-3">
          <div className="text-[12px] font-bold text-[#1C1917] flex items-center gap-1.5">
            <Mail className="h-4 w-4 text-emerald-900" /> Direct Candidate Pipeline
          </div>
          <div className="p-3 bg-[#FAF7F0] border border-[#D8D2C5] rounded-lg text-[12px] text-[#78716C] leading-relaxed">
            &ldquo;Send personalized interview invitations directly to candidates who passed your skill benchmarks.&rdquo;
          </div>
          <div className="flex items-center justify-between text-[11px] text-emerald-900 font-semibold">
            <span>Average Response Rate: 89%</span>
            <span>Zero Agency Fees</span>
          </div>
        </div>
      ),
    },
  ];

  const activeSteps = isEmployer ? employerSteps : candidateSteps;
  const totalSteps = activeSteps.length;
  const currentStepData = currentStep >= 0 ? activeSteps[currentStep] : null;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-stone-900/40 animate-fade-in font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-4xl bg-[#FDFBF7] border-2 border-[#D8D2C5] rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto"
        >
          {/* Confetti Animation when on Welcome Celebration Screen */}
          {currentStep === -1 && <CelebrationConfetti />}

          {/* Top Header */}
          <div className="bg-[#F3EFE6] border-b border-[#D8D2C5] px-6 py-3.5 flex items-center justify-between relative z-40">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-emerald-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                M
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-bold tracking-wider uppercase text-emerald-900">
                  {isEmployer ? "MERITLANE FOR EMPLOYERS" : "MERITLANE"}
                </span>
                <span className="hidden sm:inline-block h-1 w-1 rounded-full bg-emerald-900" />
                <span className="hidden sm:inline-block text-[11px] font-medium text-[#78716C]">
                  {currentStep === -1
                    ? "Welcome Celebration"
                    : isEmployer
                    ? "Platform Walkthrough · 4 Simple Steps"
                    : "Platform Walkthrough · 4 Simple Steps"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {currentStep >= 0 && (
                <span className="text-[11px] font-semibold text-[#78716C] bg-white border border-[#D8D2C5] px-2.5 py-0.5 rounded-full">
                  Step {currentStep + 1} of {totalSteps}
                </span>
              )}
              {currentStep === -1 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-900 bg-emerald-900/10 border border-emerald-900/20 px-2.5 py-0.5 rounded-full">
                  <Sparkles className="h-3 w-3" /> New Account
                </span>
              )}
              <button
                onClick={handleDismiss}
                className="text-[#78716C] hover:text-[#1C1917] p-1 rounded hover:bg-black/5 transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Stepper Navigation Pills (Visible once walkthrough begins) */}
          {currentStep >= 0 && (
            <div className="px-6 pt-3.5 pb-2.5 border-b border-[#D8D2C5] bg-white flex flex-wrap gap-2 items-center justify-between relative z-40">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                {activeSteps.map((s, idx) => {
                  const isActive = currentStep === idx;
                  const isPassed = currentStep > idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentStep(idx)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all cursor-pointer ${
                        isActive
                          ? "bg-emerald-900 text-white shadow-xs font-semibold scale-[1.02]"
                          : isPassed
                          ? "bg-emerald-900/10 text-emerald-900 hover:bg-emerald-900/20"
                          : "bg-[#F4F0E8] text-[#78716C] hover:text-[#1C1917]"
                      }`}
                    >
                      {isPassed ? (
                        <Check className="h-3.5 w-3.5 shrink-0" />
                      ) : (
                        <span className="w-4 h-4 rounded-full border border-current text-[10px] flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                      )}
                      <span className="inline font-medium">
                        {s.pillLabel}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Quick Skip link */}
              <button
                onClick={handleDismiss}
                className="text-[12px] text-[#78716C] hover:text-[#1C1917] underline cursor-pointer"
              >
                Skip Tour
              </button>
            </div>
          )}

          {/* ── SMOOTH STEP TRANSITION CONTAINER ── */}
          <div className="relative min-h-[440px] flex flex-col justify-center overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              {/* ── STAGE -1: CELEBRATION & WELCOME SCREEN ── */}
              {currentStep === -1 ? (
                <motion.div
                  key="celebration-welcome"
                  initial={{ opacity: 0, scale: 0.98, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, x: -28 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="p-6 sm:p-10 flex flex-col items-center text-center relative z-20 space-y-6"
                >
                  {/* Animated Floating Celebration Icon */}
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 12, stiffness: 180, delay: 0.1 }}
                    className="relative flex items-center justify-center"
                  >
                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-emerald-950 via-emerald-800 to-emerald-600 text-white flex items-center justify-center shadow-xl shadow-emerald-950/20 ring-4 ring-emerald-500/20">
                      <Rocket className="h-10 w-10 text-white" />
                    </div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: "spring" }}
                      className="absolute -top-2 -right-2 bg-amber-400 text-amber-950 p-1.5 rounded-full shadow-md"
                    >
                      <Sparkles className="h-4 w-4 fill-amber-950" />
                    </motion.div>
                  </motion.div>

                  {/* Welcome Headlines with Spring Fade In */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="space-y-2 max-w-xl"
                  >
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-900 bg-emerald-900/10 border border-emerald-900/20 px-3 py-1 rounded-md">
                      Account Created Successfully
                    </div>
                    <h1 className="text-[26px] sm:text-[32px] font-bold text-[#1C1917] tracking-tight leading-tight">
                      Welcome to MeritLane, {displayName}!
                    </h1>
                    <p className="text-[14px] text-[#78716C] leading-relaxed">
                      {isEmployer
                        ? "Before you can post jobs or search candidates, set up your company profile. Let's take a quick 60-second look at how MeritLane works and what unlocking the platform looks like."
                        : "Welcome to MeritLane: the proof-of-work platform built for ambitious freshers and early-career engineers. Complete your profile to unlock proctored skill tests, earn verified credentials, and get discovered by tech companies without getting trapped in 0-2 year experience loops."}
                    </p>
                  </motion.div>

                  {/* 3 Staggered Value Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full max-w-2xl text-left pt-2">
                    {isEmployer ? (
                      <>
                        <motion.div
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="p-4 rounded-xl bg-white border border-[#D8D2C5] shadow-xs space-y-1.5"
                        >
                          <div className="h-8 w-8 rounded-lg bg-emerald-900/10 flex items-center justify-center text-emerald-900">
                            <Briefcase className="h-4 w-4" />
                          </div>
                          <div className="text-[13px] font-bold text-[#1C1917]">1. Company Profile</div>
                          <div className="text-[12px] text-[#78716C] leading-normal">
                            Activate your hiring account to unlock job posting and talent search.
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                          className="p-4 rounded-xl bg-white border border-[#D8D2C5] shadow-xs space-y-1.5"
                        >
                          <div className="h-8 w-8 rounded-lg bg-emerald-900/10 flex items-center justify-center text-emerald-900">
                            <Terminal className="h-4 w-4" />
                          </div>
                          <div className="text-[13px] font-bold text-[#1C1917]">2. Audit Real Code</div>
                          <div className="text-[12px] text-[#78716C] leading-normal">
                            Inspect exact code solutions and automated test pass rates.
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                          className="p-4 rounded-xl bg-white border border-[#D8D2C5] shadow-xs space-y-1.5"
                        >
                          <div className="h-8 w-8 rounded-lg bg-emerald-900/10 flex items-center justify-center text-emerald-900">
                            <Mail className="h-4 w-4" />
                          </div>
                          <div className="text-[13px] font-bold text-[#1C1917]">3. Hire Directly</div>
                          <div className="text-[12px] text-[#78716C] leading-normal">
                            Direct message verified engineers with zero agency commissions.
                          </div>
                        </motion.div>
                      </>
                    ) : (
                      <>
                        <motion.div
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="p-4 rounded-xl bg-white border border-[#D8D2C5] shadow-xs space-y-1.5"
                        >
                          <div className="h-8 w-8 rounded-lg bg-emerald-900/10 flex items-center justify-center text-emerald-900">
                            <GitBranch className="h-4 w-4" />
                          </div>
                          <div className="text-[13px] font-bold text-[#1C1917]">1. Proof Over Pedigree</div>
                          <div className="text-[12px] text-[#78716C] leading-normal">
                            No Tier-1 college bias. Upload your resume and connect GitHub to showcase your real code craftsmanship.
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                          className="p-4 rounded-xl bg-white border border-[#D8D2C5] shadow-xs space-y-1.5"
                        >
                          <div className="h-8 w-8 rounded-lg bg-emerald-900/10 flex items-center justify-center text-emerald-900">
                            <Code className="h-4 w-4" />
                          </div>
                          <div className="text-[13px] font-bold text-[#1C1917]">2. Proctored Tests</div>
                          <div className="text-[12px] text-[#78716C] leading-normal">
                            Take real coding challenges in our live browser compilers across 26+ languages and frameworks.
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                          className="p-4 rounded-xl bg-white border border-[#D8D2C5] shadow-xs space-y-1.5"
                        >
                          <div className="h-8 w-8 rounded-lg bg-emerald-900/10 flex items-center justify-center text-emerald-900">
                            <Trophy className="h-4 w-4" />
                          </div>
                          <div className="text-[13px] font-bold text-[#1C1917]">3. Direct Hiring Access</div>
                          <div className="text-[12px] text-[#78716C] leading-normal">
                            Score ≥75% to earn your verified badge and get contacted directly by tech companies hiring for ability.
                          </div>
                        </motion.div>
                      </>
                    )}
                  </div>

                  {/* Action Buttons for Welcome Screen */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55 }}
                    className="flex flex-col sm:flex-row items-center gap-3 pt-3"
                  >
                    <button
                      onClick={() => setCurrentStep(0)}
                      className="h-11 px-7 bg-emerald-900 hover:bg-emerald-950 text-white rounded-xl text-[14px] font-bold transition-all shadow-md hover:scale-[1.02] flex items-center gap-2 cursor-pointer"
                    >
                      <Compass className="h-4 w-4" />
                      <span>Learn How It Works (60s Tour)</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleDismiss}
                      className="h-11 px-5 text-[13px] font-semibold text-[#78716C] hover:text-[#1C1917] transition-colors cursor-pointer"
                    >
                      Start Profile Setup Now
                    </button>
                  </motion.div>
                </motion.div>
              ) : currentStepData ? (
                /* ── STAGES 0 TO 3: 4-STEP TEACHING WALKTHROUGH WITH SMOOTH SLIDE ── */
                <motion.div
                  key={`step-${currentStep}`}
                  initial={{ opacity: 0, x: 28 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -28 }}
                  transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                  className="p-6 sm:p-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
                >
                  {/* Left Column: Text & Instructions (7 cols) */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-900 bg-emerald-900/10 border border-emerald-900/20 px-2.5 py-0.5 rounded-full">
                      <Sparkles className="h-3 w-3 text-emerald-900" />
                      {currentStepData.stage}
                    </div>

                    <h2 className="text-[22px] sm:text-[26px] font-bold text-[#1C1917] leading-tight tracking-tight">
                      {currentStepData.title}
                    </h2>

                    <p className="text-[14px] font-semibold text-emerald-950">
                      {currentStepData.subtitle}
                    </p>

                    <p className="text-[13px] text-[#78716C] leading-relaxed">
                      {currentStepData.description}
                    </p>

                    <div className="space-y-2 pt-1">
                      {currentStepData.bullets.map((bullet, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-[12.5px] text-[#1C1917]">
                          <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                          <span className="leading-normal">{bullet}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Interactive Visual Widget (5 cols) */}
                  <div className="lg:col-span-5 flex flex-col justify-center">
                    {currentStepData.widget}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {/* Footer Controls (Visible during the 4-step walkthrough) */}
          {currentStep >= 0 && (
            <div className="bg-[#F3EFE6] border-t border-[#D8D2C5] px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-[11px] text-[#78716C]">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-700 animate-pulse" />
                <span>Click step pills or use arrow keys to browse</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  onClick={() => {
                    if (currentStep === 0) {
                      setCurrentStep(-1);
                    } else {
                      setCurrentStep((prev) => prev - 1);
                    }
                  }}
                  className="h-10 px-4 border border-[#D8D2C5] bg-white text-[#78716C] hover:text-[#1C1917] rounded-lg text-[13px] font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>

                {currentStep < totalSteps - 1 ? (
                  <button
                    onClick={() => setCurrentStep((prev) => prev + 1)}
                    className="h-10 px-5 bg-[#1C1917] text-white hover:bg-stone-800 rounded-lg text-[13px] font-semibold transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    Next Step <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleComplete}
                    className="h-10 px-6 bg-emerald-900 hover:bg-emerald-800 text-white rounded-lg text-[13px] font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md hover:scale-[1.02]"
                  >
                    <Check className="h-4 w-4" />
                    {isCompleted
                      ? "Unlocking Workspace..."
                      : isEmployer
                      ? "Got It! Start Company Profile Setup"
                      : "Got It! Start Profile Setup"}
                  </button>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
