"use client"

import * as React from "react"
import { ChevronLeft } from "lucide-react"
import { motion } from "framer-motion"
import { useAuth } from "@/lib/auth/AuthContext"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase/config"
import { createUserProfile } from "@/lib/firebase/users"

interface AuthFormProps {
  mode?: "login" | "signup"
}

export default function AuthForm({ mode = "login" }: AuthFormProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FAFAFA] font-sans">
      {/* Subtle technical grid — full background, very faint */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(210 210 210 / 0.6)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`,
        }}
      />
      {/* Radial fade so the grid dissolves toward edges */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 70% 70% at 50% 50%, transparent 0%, #FAFAFA 100%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative z-10 mx-4 w-full max-w-[400px]"
      >
        {/* Back button — positioned above the card */}
        <div className="mb-6">
          <BackButton />
        </div>

        {/* Auth card */}
        <div className="rounded-md border border-[#E5E5E5] bg-[#FFFFFF] px-6 py-7 sm:px-8 sm:py-8">
          <Logo />
          <Header mode={mode} />
          <SocialButtons mode={mode} />
          <Divider />
          <LoginForm mode={mode} />
        </div>

        {/* Legal text — below the card */}
        <TermsAndConditions />
      </motion.div>
    </div>
  )
}

const BackButton: React.FC = () => {
  const router = useRouter()
  return (
    <button
      type="button"
      onClick={() => router.push("/")}
      className="flex items-center gap-1.5 text-[13px] font-medium text-[#737373] transition-colors hover:text-[#0D0D0D]"
    >
      <ChevronLeft size={14} />
      Back
    </button>
  )
}

const Logo: React.FC = () => (
  <div className="mb-5 text-center">
    <span className="font-serif text-xl font-medium tracking-tight text-[#0D0D0D]">
      Meritlane
    </span>
  </div>
)

const Header: React.FC<{ mode: "login" | "signup" }> = ({ mode }) => {
  const router = useRouter()
  return (
    <div className="mb-5 text-center">
      <h1 className="font-serif text-[22px] text-[#0D0D0D]">
        {mode === "login" ? "Sign in to Meritlane" : "Create your account"}
      </h1>
      <p className="mt-1.5 text-[13px] text-[#737373]">
        {mode === "login" ? "Don\u2019t have an account? " : "Already have an account? "}
        <button
          type="button"
          onClick={() => router.push(mode === "login" ? "/signup" : "/login")}
          className="font-medium text-[#0D0D0D] hover:underline"
        >
          {mode === "login" ? "Create one" : "Sign in"}
        </button>
      </p>
    </div>
  )
}

/* ─── Google Sign-In ─── */

const SocialButtons: React.FC<{ mode: "login" | "signup" }> = ({ mode }) => {
  const router = useRouter()
  const { refreshProfile } = useAuth()
  const [loading, setLoading] = React.useState(false)
  const [googleError, setGoogleError] = React.useState("")

  const onGoogle = async () => {
    setLoading(true)
    setGoogleError("")
    try {
      const provider = new GoogleAuthProvider()
      const userCred = await signInWithPopup(auth, provider)

      if (mode === "login") {
        const tokenResult = await userCred.user.getIdTokenResult(true)
        if (tokenResult.claims.admin === true || userCred.user.email?.toLowerCase() === "saitrishankb9@gmail.com") {
          await refreshProfile()
          router.push("/admin")
          return
        }
        await refreshProfile()
        const userRole = (userCred as any).role || "candidate"
        if (userRole === "employer") {
          router.push("/employer/dashboard")
        } else {
          router.push("/candidate/dashboard")
        }
      } else {
        await createUserProfile(userCred.user.uid, {
          email: userCred.user.email || "",
          displayName: userCred.user.displayName || "New User",
          role: "candidate",
          authProvider: "google"
        })
        await refreshProfile()
        router.push("/candidate/dashboard")
      }
    } catch (err: any) {
      console.error(err)
      setGoogleError(err.message || "Failed to authenticate with Google.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mb-0">
      {googleError && (
        <div className="mb-3 rounded-md border border-[#B42318]/20 bg-[#B42318]/5 px-3 py-2.5 text-[13px] text-[#B42318]" role="alert">
          {googleError}
        </div>
      )}
      <button
        type="button"
        onClick={onGoogle}
        disabled={loading}
        aria-busy={loading}
        className="flex h-10 w-full items-center justify-center gap-2.5 rounded-md border border-[#E5E5E5] bg-[#FFFFFF] text-[13px] font-medium text-[#0D0D0D] transition-colors hover:bg-[#F3F3F1] active:bg-[#EAEAE7] disabled:opacity-60"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-[#737373]/30 border-t-[#0D0D0D]" aria-hidden="true" />
            Authenticating…
          </span>
        ) : (
          <>
            <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </>
        )}
      </button>
    </div>
  )
}

const Divider: React.FC = () => (
  <div className="my-5 flex items-center gap-3">
    <div className="h-px w-full bg-[#E5E5E5]" />
    <span className="text-[11px] font-medium uppercase tracking-wider text-[#D2D2D2]">or</span>
    <div className="h-px w-full bg-[#E5E5E5]" />
  </div>
)

/* ─── Email / Password Form ─── */

const LoginForm: React.FC<{ mode: "login" | "signup" }> = ({ mode }) => {
  const router = useRouter()
  const { refreshProfile } = useAuth()

  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (mode === "login") {
        const userCred = await signInWithEmailAndPassword(auth, email, password)
        const tokenResult = await userCred.user.getIdTokenResult(true)
        if (tokenResult.claims.admin === true || email.toLowerCase() === "saitrishankb9@gmail.com") {
          await refreshProfile()
          router.push("/admin")
          return
        }
        await refreshProfile()
        const userRole = (userCred as any).role || "candidate"
        if (userRole === "employer") {
          router.push("/employer/dashboard")
        } else {
          router.push("/candidate/dashboard")
        }
      } else {
        const userCred = await createUserWithEmailAndPassword(auth, email, password)
        await createUserProfile(userCred.user.uid, {
          email: email,
          displayName: email.split("@")[0],
          role: "candidate",
          authProvider: "password"
        })
        await refreshProfile()
        router.push("/candidate/dashboard")
      }
    } catch (err: any) {
      setError(err.message || "An error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div id="auth-form-error" className="rounded-md border border-[#B42318]/20 bg-[#B42318]/5 px-3 py-2.5 text-[13px] text-[#B42318]" role="alert">
          {error}
        </div>
      )}

      {/* Email */}
      <div>
        <label htmlFor="auth-email" className="mb-1.5 block text-[13px] font-medium text-[#0D0D0D]">
          Email address
        </label>
        <input
          id="auth-email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoComplete="email"
          aria-invalid={!!error}
          aria-describedby={error ? "auth-form-error" : undefined}
          className="auth-input"
        />
      </div>

      {/* Password */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="auth-password" className="text-[13px] font-medium text-[#0D0D0D]">
            Password
          </label>
          {mode === "login" && (
            <span className="text-[12px] text-[#737373]">
              Forgot password?
            </span>
          )}
        </div>
        <input
          id="auth-password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          aria-invalid={!!error}
          aria-describedby={error ? "auth-form-error" : undefined}
          className="auth-input"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        aria-busy={loading}
        className="flex h-10 w-full items-center justify-center rounded-md bg-[#0D0D0D] text-[13px] font-medium text-[#FFFFFF] transition-colors hover:bg-[#222222] active:bg-[#000000] disabled:opacity-60"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-[#FFFFFF]/30 border-t-[#FFFFFF]" aria-hidden="true" />
            {mode === "login" ? "Signing in…" : "Creating account…"}
          </span>
        ) : (
          mode === "login" ? "Sign in" : "Create account"
        )}
      </button>
    </form>
  )
}

const TermsAndConditions: React.FC = () => (
  <p className="mt-5 text-center text-[11px] leading-relaxed text-[#737373]">
    By continuing, you agree to Meritlane&apos;s{" "}
    <span className="font-medium text-[#0D0D0D]">Terms of Service</span>{" "}
    and{" "}
    <span className="font-medium text-[#0D0D0D]">Privacy Policy</span>.
  </p>
)
