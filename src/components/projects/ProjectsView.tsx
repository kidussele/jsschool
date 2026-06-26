"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/lib/store";
import { projectData } from "@/lib/project-data";
import { useState, useEffect, useCallback } from "react";
import {
  FolderKanban,
  Clock,
  Code2,
  ArrowRight,
  LogIn,
} from "lucide-react";
import { cn } from "@/lib/utils";

const diffConfig: Record<string, { color: string; bg: string; accent: string; label: string }> = {
  beginner: { color: "text-emerald-500", bg: "bg-emerald-500/10", accent: "#10B981", label: "Beginner" },
  intermediate: { color: "text-js-sky", bg: "bg-js-sky/10", accent: "#38BDF8", label: "Intermediate" },
  advanced: { color: "text-js-violet", bg: "bg-js-violet/10", accent: "#8B5CF6", label: "Advanced" },
  expert: { color: "text-js-rose", bg: "bg-js-rose/10", accent: "#F43F5E", label: "Expert" },
};

const categoryIcons: Record<string, string> = {
  Utility: "🔧",
  Productivity: "📝",
  Interactive: "🎮",
  "API Integration": "🌐",
  "Web Development": "💻",
  "Real-time": "⚡",
  "Data Visualization": "📊",
  "Full-Stack": "🏗️",
};

interface Submission {
  id: string;
  projectId: string;
  status: string;
  submittedAt: string;
}

const statusStyles: Record<string, { bg: string; text: string; border: string }> = {
  pending: { bg: "bg-yellow-500/10", text: "text-yellow-600 dark:text-yellow-400", border: "border-yellow-500/20" },
  approved: { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-500/20" },
  rejected: { bg: "bg-rose-500/10", text: "text-rose-600 dark:text-rose-400", border: "border-rose-500/20" },
};

export function ProjectsView() {
  const { user, navigateTo, setCurrentProjectId, setCurrentView } = useAppStore();
  const [filter, setFilter] = useState<string>("all");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(false);

  const fetchSubmissions = useCallback(async () => {
    if (!user) return;
    setLoadingSubs(true);
    try {
      const res = await fetch(`/api/projects/submit?userId=${user.id}`);
      const data = await res.json();
      if (data.submissions) {
        setSubmissions(data.submissions);
      }
    } catch {
      // silent fail
    } finally {
      setLoadingSubs(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const getProjectStatus = (projectId: string): string | null => {
    const sub = submissions.find((s) => s.projectId === projectId);
    return sub ? sub.status : null;
  };

  const categories = ["all", ...Array.from(new Set(projectData.map((p) => p.difficulty)))];
  const filtered = filter === "all" ? projectData : projectData.filter((p) => p.difficulty === filter);

  // Login prompt
  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="h-20 w-20 rounded-3xl bg-js-violet/10 flex items-center justify-center mx-auto mb-6">
            <FolderKanban className="h-10 w-10 text-js-violet" />
          </div>
          <h1 className="text-2xl font-extrabold mb-2">Start Building Projects</h1>
          <p className="text-sm text-muted-foreground mb-8">
            Sign in to track your project submissions and earn XP.
          </p>
          <Button
            className="w-full bg-js-yellow text-js-darker hover:bg-js-yellow/90 font-bold rounded-xl h-12 gap-2"
            onClick={() => navigateTo("login")}
          >
            <LogIn className="h-4 w-4" />Sign In to Continue
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-js-violet/10">
            <FolderKanban className="h-5 w-5 text-js-violet" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">Projects</h1>
            <p className="text-sm text-muted-foreground">Build real-world applications and boost your portfolio</p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex gap-2 mb-8 flex-wrap">
        {categories.map((cat) => {
          const cfg = cat === "all" ? null : diffConfig[cat];
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer flex items-center gap-1.5",
                filter === cat
                  ? "bg-js-yellow text-js-darker shadow-sm"
                  : "bg-muted text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              {cat === "all" ? "All Projects" : cfg?.label}
              {cat !== "all" && (
                <span className="text-[10px] opacity-70">({projectData.filter((p) => p.difficulty === cat).length})</span>
              )}
            </button>
          );
        })}
      </motion.div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((project, i) => {
          const cfg = diffConfig[project.difficulty];
          const status = getProjectStatus(project.id);
          const statusStyle = status ? statusStyles[status] : null;
          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.05 }}
            >
              <Card className="h-full hover:border-js-yellow/30 transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-js-yellow/5 group overflow-hidden">
                <div className="h-1.5" style={{ background: `linear-gradient(to right, ${cfg.accent}, transparent)` }} />
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-2xl">{categoryIcons[project.category] || "📦"}</div>
                    <div className="flex items-center gap-1.5">
                      {statusStyle && (
                        <Badge
                          variant="outline"
                          className={cn("text-[10px] border capitalize", statusStyle.bg, statusStyle.text, statusStyle.border)}
                        >
                          {status}
                        </Badge>
                      )}
                      <Badge variant="outline" className={cn("text-[10px] border", cfg.color, cfg.bg)}>
                        {cfg.label}
                      </Badge>
                    </div>
                  </div>
                  <h3 className="font-bold text-base mb-2 group-hover:text-js-yellow transition-colors">{project.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">{project.description}</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {project.skills.slice(0, 3).map((skill) => (
                      <span key={skill} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {skill}
                      </span>
                    ))}
                    {project.skills.length > 3 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        +{project.skills.length - 3}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{project.duration}</span>
                      <span className="flex items-center gap-1"><Code2 className="h-3.5 w-3.5" />{project.steps.length} steps</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs gap-1 text-js-yellow hover:text-js-yellow hover:bg-js-yellow/10"
                      onClick={() => {
                        setCurrentProjectId(project.id);
                        setCurrentView("project-detail");
                      }}
                    >
                      Start <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}