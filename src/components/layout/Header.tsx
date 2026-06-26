"use client";

import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Menu,
  Moon,
  Sun,
  Home,
  BookOpen,
  Code2,
  HelpCircle,
  FolderKanban,
  LayoutDashboard,
  MessageCircle,
  User,
  Award,
  Trophy,
  Swords,
  GraduationCap,
  Heart,
  Github,
  Twitter,
  Youtube,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const navItems = [
  { label: "Home", icon: Home, view: "home" as const },
  { label: "Courses", icon: BookOpen, view: "courses" as const },
  { label: "Playground", icon: Code2, view: "playground" as const },
  { label: "Quizzes", icon: HelpCircle, view: "quizzes" as const },
  { label: "Projects", icon: FolderKanban, view: "projects" as const },
  { label: "Dashboard", icon: LayoutDashboard, view: "dashboard" as const },
  { label: "AI Tutor", icon: MessageCircle, view: "ai-tutor" as const },
  { label: "Community", icon: User, view: "community" as const },
  { label: "Challenges", icon: Swords, view: "challenges" as const },
  { label: "Leaderboard", icon: Trophy, view: "leaderboard" as const },
  { label: "Profile", icon: User, view: "profile" as const },
  { label: "Certificates", icon: Award, view: "certificates" as const },
];

export function Header() {
  const { currentView, navigateTo, user } = useAppStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => navigateTo("home")}
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-js-yellow text-js-darker font-bold text-sm transition-transform group-hover:scale-110">
              JS
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold leading-tight">
                JavaScript Hero
              </h1>
              <p className="text-[10px] text-muted-foreground leading-tight">
                Academy
              </p>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.slice(0, 7).map((item) => (
              <button
                key={item.view}
                onClick={() => navigateTo(item.view)}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
                  currentView === item.view
                    ? "bg-js-yellow/15 text-js-yellow"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                {item.label}
              </button>
            ))}
            <div className="relative group">
              <button className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 cursor-pointer">
                More ▾
              </button>
              <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-border bg-popover p-1.5 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                {navItems.slice(7).map((item) => (
                  <button
                    key={item.view}
                    onClick={() => navigateTo(item.view)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer",
                      currentView === item.view
                        ? "bg-accent text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {user && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-js-yellow/10 border border-js-yellow/20">
                <span className="text-xs font-bold text-js-yellow">
                  {user.xp} XP
                </span>
              </div>
            )}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="h-9 w-9 rounded-lg"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
            )}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden h-9 w-9"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 p-0">
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-2 p-4 border-b">
                    <div className="h-8 w-8 rounded-lg bg-js-yellow text-js-darker flex items-center justify-center font-bold text-xs">
                      JS
                    </div>
                    <span className="font-bold text-sm">JS Hero Academy</span>
                  </div>
                  <nav className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                    {navItems.map((item) => (
                      <button
                        key={item.view}
                        onClick={() => navigateTo(item.view)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors mb-1 cursor-pointer",
                          currentView === item.view
                            ? "bg-js-yellow/15 text-js-yellow"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        )}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {item.label}
                      </button>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}