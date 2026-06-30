"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  TrendingUp,
  BookOpen,
  Star,
  Swords,
  Award,
  MessageCircle,
  FolderKanban,
  Zap,
  Trophy,
  HelpCircle,
  BarChart3,
} from "lucide-react";

interface AdminStats {
  totalUsers: number;
  totalLessonsCompleted: number;
  totalQuizzesTaken: number;
  totalPosts: number;
  totalProjectsSubmitted: number;
  totalChallengesCompleted: number;
  totalCertificates: number;
  avgQuizScore: number;
  activeUsersThisWeek: number;
  totalXP: number;
  totalAchievementsEarned: number;
  totalAchievements: number;
}

interface StatCardDef {
  label: string;
  key: keyof AdminStats;
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
  format?: (v: number) => string;
}

const primaryStats: StatCardDef[] = [
  { label: "Total Users", key: "totalUsers", icon: Users, iconColor: "text-js-yellow", bgColor: "bg-js-yellow/10" },
  { label: "Active This Week", key: "activeUsersThisWeek", icon: TrendingUp, iconColor: "text-js-emerald", bgColor: "bg-js-emerald/10" },
  { label: "Lessons Completed", key: "totalLessonsCompleted", icon: BookOpen, iconColor: "text-js-sky", bgColor: "bg-js-sky/10" },
  { label: "Quizzes Taken", key: "totalQuizzesTaken", icon: Star, iconColor: "text-js-violet", bgColor: "bg-js-violet/10" },
  { label: "Challenges Solved", key: "totalChallengesCompleted", icon: Swords, iconColor: "text-js-rose", bgColor: "bg-js-rose/10" },
  { label: "Certificates Issued", key: "totalCertificates", icon: Award, iconColor: "text-amber-500", bgColor: "bg-amber-500/10" },
  { label: "Forum Posts", key: "totalPosts", icon: MessageCircle, iconColor: "text-js-sky", bgColor: "bg-js-sky/10" },
  { label: "Projects Submitted", key: "totalProjectsSubmitted", icon: FolderKanban, iconColor: "text-js-violet", bgColor: "bg-js-violet/10" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

interface AdminDashboardProps {
  onNavigate: (tab: string) => void;
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      const data = await res.json();
      setStats(data);
    } catch {
      toast.error("Failed to load admin stats");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const weeklyActiveRate =
    stats && stats.totalUsers > 0
      ? Math.round((stats.activeUsersThisWeek / stats.totalUsers) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Primary Stats Grid */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {primaryStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.key} variants={itemVariants}>
              {loading ? (
                <Card className="glass-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-muted animate-pulse" />
                      <div className="space-y-2 flex-1">
                        <div className="h-3 w-20 rounded bg-muted animate-pulse" />
                        <div className="h-5 w-12 rounded bg-muted animate-pulse" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="glass-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", stat.bgColor)}>
                        <Icon className={cn("h-5 w-5", stat.iconColor)} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
                        <p className="text-lg font-bold">
                          {stats
                            ? stat.format
                              ? stat.format(stats[stat.key] as number)
                              : (stats[stat.key] as number).toLocaleString()
                            : "—"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {/* Secondary Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.5 }}
      >
        {loading ? (
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-muted animate-pulse" />
                    <div className="space-y-2 flex-1">
                      <div className="h-3 w-24 rounded bg-muted animate-pulse" />
                      <div className="h-4 w-16 rounded bg-muted animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Avg Quiz Score */}
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-js-yellow/10">
                    <Zap className="h-4 w-4 text-js-yellow" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Avg Quiz Score</p>
                    <p className="text-sm font-bold">
                      {stats ? `${Math.round(stats.avgQuizScore)}%` : "—"}
                    </p>
                  </div>
                </div>

                {/* Total XP Earned */}
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-js-yellow/10">
                    <Trophy className="h-4 w-4 text-js-yellow" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total XP Earned</p>
                    <p className="text-sm font-bold">
                      {stats ? stats.totalXP.toLocaleString() : "—"}
                    </p>
                  </div>
                </div>

                {/* Achievements Earned */}
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-js-emerald/10">
                    <Award className="h-4 w-4 text-js-emerald" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Achievements Earned</p>
                    <p className="text-sm font-bold">
                      {stats
                        ? `${stats.totalAchievementsEarned}/${stats.totalAchievements}`
                        : "—"}
                    </p>
                  </div>
                </div>

                {/* Weekly Active Rate */}
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-js-sky/10">
                    <TrendingUp className="h-4 w-4 text-js-sky" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Weekly Active Rate</p>
                    <p className="text-sm font-bold">
                      {stats ? `${weeklyActiveRate}%` : "—"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.65 }}
      >
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Manage Users */}
          <Card
            className="glass-card cursor-pointer hover:border-js-sky/50 transition-colors"
            onClick={() => onNavigate("users")}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-js-sky/10">
                <Users className="h-5 w-5 text-js-sky" />
              </div>
              <div>
                <p className="text-sm font-semibold">Manage Users</p>
                <p className="text-xs text-muted-foreground">View and edit user roles</p>
              </div>
            </CardContent>
          </Card>

          {/* Build Quiz */}
          <Card
            className="glass-card cursor-pointer hover:border-js-violet/50 transition-colors"
            onClick={() => onNavigate("quizzes")}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-js-violet/10">
                <HelpCircle className="h-5 w-5 text-js-violet" />
              </div>
              <div>
                <p className="text-sm font-semibold">Build Quiz</p>
                <p className="text-xs text-muted-foreground">Create and manage quizzes</p>
              </div>
            </CardContent>
          </Card>

          {/* View Analytics */}
          <Card
            className="glass-card cursor-pointer hover:border-js-emerald/50 transition-colors"
            onClick={() => onNavigate("analytics")}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-js-emerald/10">
                <BarChart3 className="h-5 w-5 text-js-emerald" />
              </div>
              <div>
                <p className="text-sm font-semibold">View Analytics</p>
                <p className="text-xs text-muted-foreground">Platform insights and data</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}