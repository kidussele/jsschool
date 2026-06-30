"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";
import { useAppStore } from "@/lib/store";
import {
  Shield,
  LayoutDashboard,
  Users,
  BookOpen,
  HelpCircle,
  ImageIcon,
  Brain,
  BarChart3,
  Activity,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AdminDashboard } from "./panels/AdminDashboard";
import { AdminUsers } from "./panels/AdminUsers";
import { AdminCourses } from "./panels/AdminCourses";
import { AdminQuizzes } from "./panels/AdminQuizzes";
import { AdminImages } from "./panels/AdminImages";
import { AdminAIPrompts } from "./panels/AdminAIPrompts";
import { AdminAnalytics } from "./panels/AdminAnalytics";
import { AdminActivityLog } from "./panels/AdminActivityLog";

export type AdminTab = "dashboard" | "users" | "courses" | "quizzes" | "images" | "ai-prompts" | "analytics" | "activity";

interface AdminNavItem {
  id: AdminTab;
  label: string;
  icon: React.ElementType;
  color: string;
}

const navItems: AdminNavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, color: "text-js-yellow" },
  { id: "users", label: "Users", icon: Users, color: "text-js-sky" },
  { id: "courses", label: "Courses", icon: BookOpen, color: "text-js-emerald" },
  { id: "quizzes", label: "Quiz Builder", icon: HelpCircle, color: "text-js-violet" },
  { id: "images", label: "Images", icon: ImageIcon, color: "text-js-orange" },
  { id: "ai-prompts", label: "AI Prompts", icon: Brain, color: "text-rose-400" },
  { id: "analytics", label: "Analytics", icon: BarChart3, color: "text-cyan-400" },
  { id: "activity", label: "Activity Log", icon: Activity, color: "text-js-rose" },
];

const panelVariants = {
  initial: { opacity: 0, x: 10 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -10 },
};

export function AdminView() {
  const { user, navigateTo } = useAppStore();
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleTabChange = useCallback((tab: AdminTab) => {
    setActiveTab(tab);
    setMobileSidebarOpen(false);
  }, []);

  // Access denied for non-admins
  if (!user || user.role !== "admin") {
    return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-destructive/10 mb-6">
            <Shield className="h-10 w-10 text-destructive" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-3">Access Denied</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            You do not have permission to access the admin panel. This area is restricted to administrators only.
          </p>
        </motion.div>
      </div>
    );
  }

  const renderPanel = () => {
    switch (activeTab) {
      case "dashboard": return <AdminDashboard onNavigate={handleTabChange} />;
      case "users": return <AdminUsers />;
      case "courses": return <AdminCourses />;
      case "quizzes": return <AdminQuizzes />;
      case "images": return <AdminImages />;
      case "ai-prompts": return <AdminAIPrompts />;
      case "analytics": return <AdminAnalytics />;
      case "activity": return <AdminActivityLog />;
      default: return <AdminDashboard onNavigate={handleTabChange} />;
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex gap-0 lg:gap-4">
      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 lg:top-20 left-0 z-50 lg:z-0 h-screen lg:h-[calc(100vh-8rem)] w-64 flex-shrink-0 bg-card border-r border-border transition-all duration-300 flex flex-col",
          sidebarCollapsed && "w-16",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-js-violet/10">
                <Shield className="h-4 w-4 text-js-violet" />
              </div>
              <span className="font-bold text-sm">Admin Panel</span>
            </div>
          )}
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="lg:hidden p-1 rounded hover:bg-accent"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex p-1 rounded hover:bg-accent"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer",
                  isActive
                    ? "bg-js-yellow/10 text-js-yellow"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent",
                  sidebarCollapsed && "justify-center px-2"
                )}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-js-yellow" : item.color)} />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        {!sidebarCollapsed && (
          <div className="p-3 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => navigateTo("home")}
            >
              Back to Site
            </Button>
          </div>
        )}
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 p-4 lg:p-6">
        {/* Mobile header */}
        <div className="flex items-center gap-3 mb-4 lg:hidden">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => setMobileSidebarOpen(true)}
          >
            <Shield className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-lg font-bold">
              {navItems.find((n) => n.id === activeTab)?.label || "Admin"}
            </h2>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </div>

        {/* Desktop tab header */}
        <div className="hidden lg:flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-js-violet/10">
            {(() => {
              const Icon = navItems.find((n) => n.id === activeTab)?.icon || LayoutDashboard;
              return <Icon className="h-5 w-5 text-js-violet" />;
            })()}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold">
              {navItems.find((n) => n.id === activeTab)?.label || "Admin"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {activeTab === "dashboard" && "Platform overview and key metrics"}
              {activeTab === "users" && "Manage registered users and roles"}
              {activeTab === "courses" && "View and manage course content structure"}
              {activeTab === "quizzes" && "Create, edit, and manage quizzes"}
              {activeTab === "images" && "Upload and manage image assets"}
              {activeTab === "ai-prompts" && "Configure AI system prompts"}
              {activeTab === "analytics" && "Detailed platform analytics and insights"}
              {activeTab === "activity" && "View recent user activity"}
            </p>
          </div>
        </div>

        {/* Panel content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={panelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2 }}
          >
            {renderPanel()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}