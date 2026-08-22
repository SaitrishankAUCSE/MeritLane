"use client"

import * as React from "react"
import { ChevronLeft, Box } from "lucide-react"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"
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
    <div className="bg-white dark:bg-zinc-950 py-20 min-h-screen flex items-center justify-center text-zinc-800 dark:text-zinc-200 selection:bg-zinc-300 dark:selection:bg-zinc-600 relative overflow-hidden">
      <div className="absolute top-8 left-8 z-20">
        <BackButton />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.25, ease: "easeInOut" }}
        className="relative z-10 mx-auto w-full max-w-md p-6 sm:p-8 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl"
      >
        <Logo />
        <Header mode={mode} />
        <SocialButtons mode={mode} />
        <Divider />
        <LoginForm mode={mode} />
        <TermsAndConditions />
      </motion.div>
      <BackgroundDecoration />
    </div>
  )
}

const BackButton: React.FC = () => {
  const router = useRouter()
  return (
    <button 
      onClick={() => router.back()}
      className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
    >
      <ChevronLeft size={16} /> Go back
    </button>
  )
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string
  loading?: boolean
}

const Button: React.FC<ButtonProps> = ({ children, className, loading, ...props }) => (
  <button
    disabled={loading}
    className={`rounded-md bg-gradient-to-br from-[#0D0D0D] to-[#222222] dark:from-blue-400 dark:to-blue-700 px-4 py-2 text-sm font-semibold text-zinc-50 
    ring-2 ring-transparent ring-offset-2 ring-offset-white dark:ring-offset-zinc-950 
    transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:scale-100 ${className}`}
    {...props}
  >
    {loading ? "Please wait..." : children}
  </button>
)

const Logo: React.FC = () => (
  <div className="mb-6 flex justify-center items-center">
    <Box className="h-8 w-8 text-[#0D0D0D] dark:text-zinc-100" />
    <span className="ml-2 text-xl font-serif font-medium tracking-tight text-[#0D0D0D] dark:text-zinc-100">Meritlane</span>
  </div>
)

const Header: React.FC<{mode: "login" | "signup"}> = ({mode}) => {
  const router = useRouter()
  return (
    <div className="mb-6 text-center">
      <h1 className="text-2xl font-serif text-[#0D0D0D] dark:text-zinc-100 mb-2">
        {mode === "login" ? "Sign In to Meritlane" : "Create an Account"}
      </h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        {mode === "login" ? "Don't have an account? " : "Already have an account? "}
        <button 
          onClick={() => router.push(mode === "login" ? "/signup" : "/login")}
          className="text-[#0D0D0D] dark:text-zinc-100 font-medium hover:underline"
        >
          {mode === "login" ? "Create one." : "Sign in."}
        </button>
      </p>
    </div>
  )
}

const SocialButtons: React.FC<{mode: "login" | "signup"}> = ({mode}) => {
  const router = useRouter()
  const { refreshProfile } = useAuth()
  const [loading, setLoading] = React.useState(false)

  const onGoogle = async () => {
    setLoading(true)
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
      alert(err.message || "Failed to authenticate with Google")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mb-6 space-y-3">
      <div className="grid grid-cols-1 gap-3">
        <SocialButton fullWidth onClick={onGoogle} disabled={loading} icon={
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        }>
          Continue with Google
        </SocialButton>
      </div>
    </div>
  )
}

const SocialButton: React.FC<{
  icon?: React.ReactNode
  fullWidth?: boolean
  children?: React.ReactNode
  onClick?: () => void
  disabled?: boolean
}> = ({ icon, fullWidth, children, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`relative z-0 flex items-center justify-center gap-2 overflow-hidden rounded-md 
    border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 
    px-4 py-2 font-medium text-sm text-zinc-800 dark:text-zinc-200 transition-all duration-500
    hover:bg-zinc-50 active:scale-[0.98] disabled:opacity-70 disabled:scale-100
    ${fullWidth ? "col-span-1" : ""}`}
  >
    {icon}
    <span>{children}</span>
  </button>
)

const Divider: React.FC = () => (
  <div className="my-6 flex items-center gap-3">
    <div className="h-[1px] w-full bg-zinc-200 dark:bg-zinc-700" />
    <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">OR</span>
    <div className="h-[1px] w-full bg-zinc-200 dark:bg-zinc-700" />
  </div>
)

const LoginForm: React.FC<{mode: "login" | "signup"}> = ({mode}) => {
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
        const userRole = (userCred as any).role || "candidate" // Fallback
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
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-100">
          {error}
        </div>
      )}
      <div>
        <label
          htmlFor="email-input"
          className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-400"
        >
          Email Address
        </label>
        <input
          id="email-input"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 
          bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-800 dark:text-zinc-200
          placeholder-zinc-400 dark:placeholder-zinc-500 
          ring-1 ring-transparent transition-shadow focus:outline-0 focus:border-[#0D0D0D]"
        />
      </div>
      <div className="mb-6">
        <div className="mb-1.5 flex items-end justify-between">
          <label
            htmlFor="password-input"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-400"
          >
            Password
          </label>
          {mode === "login" && (
            <a href="#" className="text-xs font-medium text-[#0D0D0D] dark:text-zinc-300 hover:underline">
              Forgot?
            </a>
          )}
        </div>
        <input
          id="password-input"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••••••"
          required
          className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 
          bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-800 dark:text-zinc-200
          placeholder-zinc-400 dark:placeholder-zinc-500 
          ring-1 ring-transparent transition-shadow focus:outline-0 focus:border-[#0D0D0D]"
        />
      </div>
      <Button type="submit" loading={loading} className="w-full">
        {mode === "login" ? "Sign in" : "Create account"}
      </Button>
    </form>
  )
}

const TermsAndConditions: React.FC = () => (
  <p className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
    By continuing, you agree to our{" "}
    <a href="#" className="text-[#0D0D0D] dark:text-zinc-300 underline font-medium">
      Terms & Conditions
    </a>{" "}
    and{" "}
    <a href="#" className="text-[#0D0D0D] dark:text-zinc-300 underline font-medium">
      Privacy Policy.
    </a>
  </p>
)

const BackgroundDecoration: React.FC = () => {
  const { theme } = useTheme()
  const isDarkTheme = theme === "dark"

  return (
    <div
      className="absolute right-0 top-0 z-0 size-full md:size-[50vw] opacity-20 dark:opacity-40 pointer-events-none"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke-width='1.5' stroke='rgb(115 115 115 / 0.5)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`,
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: isDarkTheme
            ? "radial-gradient(100% 100% at 100% 0%, rgba(9,9,11,0), rgba(9,9,11,1))"
            : "radial-gradient(100% 100% at 100% 0%, rgba(250,250,250,0), rgba(250,250,250,1))",
        }}
      />
    </div>
  )
}
