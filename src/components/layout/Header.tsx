"use client";

import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Search,
  Bell,
  LogOut,
  LogIn,
  UserPlus,
  ChevronDown,
  Shield,
  X,
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
  const {
    currentView,
    navigateTo,
    user,
    setUser,
    setMobileMenuOpen,
    mobileMenuOpen,
  } = useAppStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch unread notification count
  useEffect(() => {
    if (user) {
      fetch("/api/notifications?userId=" + user.id)
        .then((res) => res.json())
        .then((data) => {
          setUnreadCount(data.unreadCount || 0);
        })
        .catch(() => {
          // ignore
        });
    }
  }, [user]);

  const handleLogout = () => {
    setUser(null);
    navigateTo("home");
    setMobileMenuOpen(false);
  };

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
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Search button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateTo("search")}
              className="h-9 w-9 rounded-lg"
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Notification bell - only when logged in */}
            {user && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-lg relative"
                onClick={() => navigateTo("dashboard")}
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-js-rose text-[9px] font-bold text-white ring-2 ring-background">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>
            )}

            {/* User XP badge */}
            {user && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-js-yellow/10 border border-js-yellow/20">
                <span className="text-xs font-bold text-js-yellow">
                  {user.xp} XP
                </span>
              </div>
            )}

            {/* Theme toggle */}
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

            {/* User Avatar Dropdown (logged in) */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 cursor-pointer">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-js-yellow text-js-darker font-bold text-sm ring-2 ring-js-yellow/20 hover:ring-js-yellow/40 transition-all">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigateTo("dashboard")}>
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigateTo("profile")}>
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigateTo("certificates")}>
                    <Award className="h-4 w-4 mr-2" />
                    Certificates
                  </DropdownMenuItem>
                  {user.role === "admin" && (
                    <DropdownMenuItem onClick={() => navigateTo("admin")}>
                      <Shield className="h-4 w-4 mr-2" />
                      Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} variant="destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Login / Sign Up buttons (not logged in) */}
            {!user && (
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateTo("login")}
                  className="h-8 gap-1.5 text-sm"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  Login
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigateTo("register")}
                  className="h-8 gap-1.5 text-sm bg-js-yellow text-js-darker hover:bg-js-yellow/90 font-bold"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  Sign Up
                </Button>
              </div>
            )}

            {/* Mobile menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
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
                  <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-js-yellow text-js-darker flex items-center justify-center font-bold text-xs">
                        JS
                      </div>
                      <span className="font-bold text-sm">JS Hero Academy</span>
                    </div>
                  </div>
                  <nav className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                    {navItems.map((item) => (
                      <button
                        key={item.view}
                        onClick={() => {
                          navigateTo(item.view);
                          setMobileMenuOpen(false);
                        }}
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
                  {/* Mobile menu footer */}
                  <div className="border-t p-3 space-y-2">
                    {!user ? (
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          className="w-full gap-2 text-sm"
                          onClick={() => {
                            navigateTo("login");
                            setMobileMenuOpen(false);
                          }}
                        >
                          <LogIn className="h-4 w-4" />
                          Login
                        </Button>
                        <Button
                          className="w-full gap-2 text-sm bg-js-yellow text-js-darker hover:bg-js-yellow/90 font-bold"
                          onClick={() => {
                            navigateTo("register");
                            setMobileMenuOpen(false);
                          }}
                        >
                          <UserPlus className="h-4 w-4" />
                          Sign Up
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center gap-3 px-3 py-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-js-yellow text-js-darker font-bold text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user.name}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {user.xp} XP
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            handleLogout();
                            setMobileMenuOpen(false);
                          }}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
