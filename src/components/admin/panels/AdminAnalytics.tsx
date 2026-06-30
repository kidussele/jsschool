"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, Users, Trophy, BookOpen, Clock, Medal } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AnalyticsData {
  userGrowth: { date: string; count: number }[];
  dailyActive: { date: string; count: number }[];
  quizActivity: { date: string; count: number; avgScore: number }[];
  challengeActivity: { date: string; count: number }[];
  topUsers: { id: string; name: string; xp: number; streak: number; createdAt: string }[];
  lessonCompletions: { status: string; count: number }[];
  popularLessons: { lessonId: string; completions: number }[];
  discussionStats: { totalPosts: number; avgLikes: number };
  certificateCount: number;
  scoreDistribution: Record<string, number>;
  recentActivity: {
    id: string;
    action: string;
    details: string;
    createdAt: string;
    userName: string;
  }[];
}

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

const scoreRanges = [
  { key: "0-25", label: "0-25%", color: "bg-red-500/80" },
  { key: "26-50", label: "26-50%", color: "bg-orange-500/80" },
  { key: "51-75", label: "51-75%", color: "bg-js-yellow/80" },
  { key: "76-100", label: "76-100%", color: "bg-green-500/80" },
];

const medalColors = [
  "text-amber-400",
  "text-gray-400",
  "text-amber-700",
];

const actionBadgeColors: Record<string, string> = {
  login: "bg-js-sky/10 text-js-sky",
  lesson_completed: "bg-js-emerald/10 text-js-emerald",
  quiz_taken: "bg-js-violet/10 text-js-violet",
  challenge_submitted: "bg-js-rose/10 text-js-rose",
  project_submitted: "bg-js-orange/10 text-js-orange",
  discussion_post: "bg-js-sky/10 text-js-sky",
};

export function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch("/api/admin/analytics");
        if (!res.ok) throw new Error("Failed to fetch analytics");
        const json = await res.json();
        setData(json);
      } catch {
        toast.error("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-16">
        <BarChart3 className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
        <p className="text-muted-foreground">Failed to load analytics data</p>
      </div>
    );
  }

  const maxGrowth = Math.max(...data.userGrowth.map((d) => d.count), 1);
  const maxScore = Math.max(
    ...scoreRanges.map((r) => data.scoreDistribution[r.key] || 0),
    1
  );
  const maxLessonCompletions = Math.max(
    ...data.popularLessons.map((l) => l.completions),
    1
  );

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Users",
            value: data.userGrowth.reduce((a, b) => a + b.count, 0).toLocaleString(),
            icon: Users,
            color: "text-js-sky",
            bg: "bg-js-sky/10",
          },
          {
            label: "Certificates",
            value: data.certificateCount?.toLocaleString() ?? "0",
            icon: Trophy,
            color: "text-js-yellow",
            bg: "bg-js-yellow/10",
          },
          {
            label: "Discussion Posts",
            value: data.discussionStats?.totalPosts?.toLocaleString() ?? "0",
            icon: BookOpen,
            color: "text-js-emerald",
            bg: "bg-js-emerald/10",
          },
          {
            label: "Avg. Likes/Post",
            value: data.discussionStats?.avgLikes?.toFixed(1) ?? "0",
            icon: Medal,
            color: "text-js-violet",
            bg: "bg-js-violet/10",
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", stat.bg)}>
                      <Icon className={cn("h-5 w-5", stat.color)} />
                    </div>
                    <div>
                      <p className="text-2xl font-extrabold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* User Growth Chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-js-sky" />
              User Growth (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.userGrowth.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No data available</p>
            ) : (
              <div className="flex items-end gap-1 h-40">
                {data.userGrowth.map((d, i) => (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center justify-end h-full"
                  >
                    <div
                      className="w-full bg-js-sky/80 rounded-t-sm min-h-[2px] transition-all hover:bg-js-sky"
                      style={{ height: `${(d.count / maxGrowth) * 100}%` }}
                      title={`${d.date}: ${d.count} users`}
                    />
                    {i % 5 === 0 && (
                      <span className="text-[9px] text-muted-foreground mt-1">
                        {d.date.slice(5)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Score Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Quiz Score Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {scoreRanges.map((range) => {
              const count = data.scoreDistribution[range.key] || 0;
              const pct = (count / maxScore) * 100;
              return (
                <div key={range.key} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-xs text-muted-foreground w-16">{range.label}</span>
                    <span className="text-xs font-medium">{count}</span>
                  </div>
                  <div className="h-5 w-full bg-muted/50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className={cn("h-full rounded-full", range.color)}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>

      {/* Top Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-4 w-4 text-js-yellow" />
              Top 10 Users by XP
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.topUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No users yet</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 text-xs">#</TableHead>
                    <TableHead className="text-xs">Name</TableHead>
                    <TableHead className="text-xs text-right">XP</TableHead>
                    <TableHead className="text-xs text-right">Streak</TableHead>
                    <TableHead className="text-xs text-right">Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.topUsers.slice(0, 10).map((u, i) => (
                    <TableRow key={u.id}>
                      <TableCell className="text-xs font-bold">
                        {i < 3 ? (
                          <Medal className={cn("h-4 w-4", medalColors[i])} />
                        ) : (
                          i + 1
                        )}
                      </TableCell>
                      <TableCell className="text-xs font-medium">{u.name}</TableCell>
                      <TableCell className="text-xs text-right font-mono">
                        {u.xp.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-xs text-right">
                        🔥 {u.streak}
                      </TableCell>
                      <TableCell className="text-xs text-right text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Popular Lessons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-js-emerald" />
              Popular Lessons
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.popularLessons.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No lesson data yet</p>
            ) : (
              <div className="space-y-3">
                {data.popularLessons.slice(0, 10).map((lesson, i) => {
                  const pct = (lesson.completions / maxLessonCompletions) * 100;
                  return (
                    <div key={lesson.lessonId} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-6 text-right shrink-0">
                        {i + 1}.
                      </span>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium truncate">
                            {lesson.lessonId}
                          </span>
                          <span className="text-xs text-muted-foreground shrink-0 ml-2">
                            {lesson.completions}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.5, delay: i * 0.05 }}
                            className="h-full bg-js-emerald/70 rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-js-rose" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {data.recentActivity.slice(0, 5).map((entry, i) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] px-1.5 py-0 shrink-0 mt-0.5",
                        actionBadgeColors[entry.action] || "bg-muted text-muted-foreground"
                      )}
                    >
                      {entry.action.replace(/_/g, " ")}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium">{entry.userName}</span>
                        {entry.details && (
                          <span className="text-muted-foreground"> — {entry.details}</span>
                        )}
                      </p>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">
                      {relativeTime(entry.createdAt)}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}