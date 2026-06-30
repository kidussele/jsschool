"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  LogIn,
  BookOpen,
  HelpCircle,
  Swords,
  FolderKanban,
  MessageCircle,
  Activity,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface ActivityLogEntry {
  id: string;
  userId: string;
  action: string;
  details: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
}

const ACTION_FILTERS = [
  { key: "All", label: "All" },
  { key: "login", label: "Login" },
  { key: "lesson_completed", label: "Lessons" },
  { key: "quiz_taken", label: "Quizzes" },
  { key: "challenge_submitted", label: "Challenges" },
  { key: "project_submitted", label: "Projects" },
  { key: "discussion_post", label: "Discussion" },
];

const actionConfig: Record<
  string,
  { icon: React.ElementType; color: string; bg: string; label: string }
> = {
  login: {
    icon: LogIn,
    color: "text-js-sky",
    bg: "bg-js-sky/10",
    label: "Logged in",
  },
  lesson_completed: {
    icon: BookOpen,
    color: "text-js-emerald",
    bg: "bg-js-emerald/10",
    label: "Completed a lesson",
  },
  quiz_taken: {
    icon: HelpCircle,
    color: "text-js-violet",
    bg: "bg-js-violet/10",
    label: "Took a quiz",
  },
  challenge_submitted: {
    icon: Swords,
    color: "text-js-rose",
    bg: "bg-js-rose/10",
    label: "Submitted a challenge",
  },
  project_submitted: {
    icon: FolderKanban,
    color: "text-js-orange",
    bg: "bg-js-orange/10",
    label: "Submitted a project",
  },
  discussion_post: {
    icon: MessageCircle,
    color: "text-js-sky",
    bg: "bg-js-sky/10",
    label: "Posted in discussion",
  },
};

const relativeTime = (dateStr: string) => {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

const PAGE_LIMIT = 30;

export function AdminActivityLog() {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [action, setAction] = useState("All");
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const actionParam = action === "All" ? "" : `&action=${action}`;
      const res = await fetch(
        `/api/admin/activity?page=${page}&limit=${PAGE_LIMIT}${actionParam}`
      );
      if (!res.ok) throw new Error("Failed to fetch activity logs");
      const data = await res.json();
      setLogs(data.logs || []);
      setTotal(data.total || 0);
    } catch {
      toast.error("Failed to load activity logs");
    } finally {
      setLoading(false);
    }
  }, [page, action]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const totalPages = Math.ceil(total / PAGE_LIMIT);

  return (
    <div className="space-y-6">
      {/* Action Type Filter */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center gap-2"
      >
        <Filter className="h-4 w-4 text-muted-foreground mr-1" />
        {ACTION_FILTERS.map((filter) => (
          <Button
            key={filter.key}
            variant={action === filter.key ? "default" : "outline"}
            size="sm"
            className={cn(
              action === filter.key && "bg-js-yellow text-js-dark hover:bg-js-yellow/90",
              "text-xs"
            )}
            onClick={() => {
              setAction(filter.key);
              setPage(1);
            }}
          >
            {filter.label}
          </Button>
        ))}
      </motion.div>

      {/* Activity Timeline */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <Activity className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-muted-foreground">No activity logs found</p>
          <p className="text-xs text-muted-foreground mt-1">
            {action !== "All"
              ? `No ${action.replace(/_/g, " ")} activity recorded`
              : "Activity will appear here as users interact with the platform"}
          </p>
        </motion.div>
      ) : (
        <>
          <div className="relative space-y-0">
            {/* Timeline line */}
            <div className="absolute left-5 top-6 bottom-6 w-px bg-border" />

            <div className="space-y-1">
              {logs.map((entry, i) => {
                const config = actionConfig[entry.action] || {
                  icon: Activity,
                  color: "text-muted-foreground",
                  bg: "bg-muted",
                  label: entry.action.replace(/_/g, " "),
                };
                const Icon = config.icon;

                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.2 }}
                    className="relative pl-12 py-2.5 group"
                  >
                    {/* Timeline dot */}
                    <div
                      className={cn(
                        "absolute left-3.5 top-4 h-3 w-3 rounded-full border-2 border-background z-10",
                        config.color === "text-js-sky" && "bg-js-sky",
                        config.color === "text-js-emerald" && "bg-js-emerald",
                        config.color === "text-js-violet" && "bg-js-violet",
                        config.color === "text-js-rose" && "bg-js-rose",
                        config.color === "text-js-orange" && "bg-js-orange",
                        config.color === "text-muted-foreground" && "bg-muted-foreground"
                      )}
                    />

                    <Card className="glass-card group-hover:shadow-md transition-shadow">
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                              config.bg
                            )}
                          >
                            <Icon className={cn("h-4 w-4", config.color)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium">
                                {entry.user?.name || "Unknown User"}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {config.label}
                              </span>
                            </div>
                            {entry.details && (
                              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                {entry.details}
                              </p>
                            )}
                          </div>
                          <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">
                            {relativeTime(entry.createdAt)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}