"use client"

import * as React from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Globe, Share2, MessageCircle, Moon, Send, Sun, Mail } from "lucide-react"

export function Footerdemo() {
  const [isDarkMode, setIsDarkMode] = React.useState(true)

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDarkMode])

  return (
    <footer className="relative border-t bg-background text-foreground transition-colors duration-300">
      <div className="mx-auto w-full max-w-[1600px] px-8 md:px-16 lg:px-24 py-12">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <h2 className="mb-4 text-3xl font-serif font-bold tracking-tight">Stay Connected</h2>
            <p className="mb-6 text-muted-foreground font-sans">
              Join our newsletter for the latest platform updates and exclusive features.
            </p>
            <form className="relative">
              <Input
                type="email"
                placeholder="Enter your email"
                className="pr-12 backdrop-blur-sm"
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-1 top-1 h-8 w-8 rounded bg-foreground text-background transition-transform hover:scale-105"
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Subscribe</span>
              </Button>
            </form>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-serif font-semibold">Platform</h3>
            <nav className="space-y-2 text-sm font-sans">
              <a href="#" className="block transition-colors hover:text-foreground text-muted-foreground">
                For Engineers
              </a>
              <a href="#" className="block transition-colors hover:text-foreground text-muted-foreground">
                For Employers
              </a>
              <a href="#" className="block transition-colors hover:text-foreground text-muted-foreground">
                Verification Standard
              </a>
              <a href="#" className="block transition-colors hover:text-foreground text-muted-foreground">
                Methodology
              </a>
            </nav>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-serif font-semibold">Institution</h3>
            <nav className="space-y-2 text-sm font-sans">
              <a href="#" className="block transition-colors hover:text-foreground text-muted-foreground">
                About Us
              </a>
              <a href="#" className="block transition-colors hover:text-foreground text-muted-foreground">
                Careers
              </a>
              <a href="#" className="block transition-colors hover:text-foreground text-muted-foreground">
                Contact Support
              </a>
            </nav>
          </div>
          <div className="relative">
            <h3 className="mb-4 text-lg font-serif font-semibold">Follow Us</h3>
            <div className="mb-6 flex space-x-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full">
                      <MessageCircle className="h-4 w-4" />
                      <span className="sr-only">Twitter</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Follow us on Twitter</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full">
                      <Share2 className="h-4 w-4" />
                      <span className="sr-only">LinkedIn</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Connect with us on LinkedIn</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-center md:flex-row">
          <p className="text-sm text-muted-foreground font-mono">
            � {new Date().getFullYear()} Meritlane. All rights reserved.
          </p>
          <nav className="flex gap-4 text-sm font-mono text-muted-foreground">
            <a href="#" className="transition-colors hover:text-foreground">
              Privacy Policy
            </a>
            <a href="#" className="transition-colors hover:text-foreground">
              Terms of Service
            </a>
          </nav>
        </div>
      </div>
    </footer>
  )
}
