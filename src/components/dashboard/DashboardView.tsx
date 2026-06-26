"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/lib/store";
import { courseData } from "@/lib/course-data";
import { quizData as qd } from "@/lib/quiz-data";
import { projectData } from "@/lib/project-data";
import {
  BarChart3, Flame, Zap, Trophy, BookOpen, Target,
  CheckCircle2, Clock, TrendingUp, Award, Star, Code2,
  LogIn, Bell, AlertCircle,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────
interface ProgressRecord {
  id: string;
  userId: string;
  lessonId: string;
  status: string;
  xpEarned: number;
  completedAt: string | null;
}

interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  score: number;
  totalPoints: number;
  correctCount: number;
  totalQuestions: number;
  completedAt: string;
  quiz?: { id: string; title: string; difficulty: string };
}

interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  earnedAt: string;
  achievement: {
    id: string;
    name: string;
    description: string;
    icon: string;
    xpReward: number;
  };
}

interface NotificationRecord {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface DashboardData {
  progress: ProgressRecord[];
  quizAttempts: QuizAttempt[];
  notifications: NotificationRecord[];
  userAchievements: UserAchievement[];
}

// ── Constants ─────────────────────────────────────────────────
const totalLessons = courseData.reduce(
  (a, l) => a + l.modules.reduce((b, m) => b + m.lessons.length, 0),
  0
);
const totalQuizzes = qd.length;
const totalProjects = projectData.length;

const ALL_ACHIEVEMENTS = [
  { id: "first-steps", name: "First Steps", desc: "Complete your first lesson", icon: "🎯" },
  { id: "quick-learner", name: "Quick Learner", desc: "Complete 10 lessons", icon: "📚" },
  { id: "quiz-master", name: "Quiz Master", desc: "Score 100% on any quiz", icon: "🧠" },
  { id: "code-warrior", name: "Code Warrior", desc: "Complete 5 challenges", icon: "⚔️" },
  { id: "streak-king", name: "Streak King", desc: "Maintain a 7-day streak", icon: "🔥" },
  { id: "project-builder", name: "Project Builder", desc: "Complete your first project", icon: "🏗️" },
  { id: "halfway-hero", name: "Halfway Hero", desc: "Complete 50% of all content", icon: "⭐" },
  { id: "javascript-hero", name: "JavaScript Hero", desc: "Complete the entire course", icon: "🏆" },
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ── Fetch helper ──────────────────────────────────────────────
async function fetchDashboardData(userId: string): Promise<DashboardData> {
  const [progressRes, quizRes, notifRes, achRes] = await Promise.all([
    fetch(`/api/progress?userId=${userId}`),
    fetch(`/api/quizzes/attempts?userId=${userId}`),
    fetch(`/api/notifications?userId=${userId}`),
    fetch(`/api/achievements?userId=${userId}`),
  ]);

  const [progressData, quizData, notifData, achData] = await Promise.all([
    progressRes.json(),
    quizRes.json(),
    notifRes.json(),
    achRes.json(),
  ]);

  return {
    progress: progressData.progress || [],
    quizAttempts: quizData.attempts || [],
    notifications: notifData.notifications || [],
    userAchievements: achData.achievements || [],
  };
}

// ── Weekly chart data calculation ─────────────────────────────
function calcWeeklyXp(
  progress: ProgressRecord[],
  quizAttempts: QuizAttempt[]
): { day: string; xp: number }[] {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - dayOfWeek);
  weekStart.setHours(0, 0, 0, 0);

  const xpByDay: Record<number, number> = {};
  for (let i = 0; i < 7; i++) xpByDay[i] = 0;

  // XP from progress records completed this week
  for (const p of progress) {
    if (p.completedAt) {
      const d = new Date(p.completedAt);
      if (d >= weekStart) {
        const dow = d.getDay();
        xpByDay[dow] = (xpByDay[dow] || 0) + (p.xpEarned || 0);
      }
    }
  }

  // XP from quiz attempts this week (10 XP per correct answer)
  for (const q of quizAttempts) {
    const d = new Date(q.completedAt);
    if (d >= weekStart) {
      const dow = d.getDay();
      const xp = q.correctCount * 10;
      xpByDay[dow] = (xpByDay[dow] || 0) + xp;
    }
  }

  return DAY_NAMES.map((day, i) => ({ day, xp: xpByDay[i] || 0 }));
}

// ── Component ─────────────────────────────────────────────────
export function DashboardView() {
  const { user, navigateTo } = useAppStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchDashboardData(user.id);
      setData(result);
    } catch {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Not logged in ───────────────────────────────────────────
  if (!user) {
    return (
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-js-sky/10 mb-6">
            <LogIn className="h-10 w-10 text-js-sky" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-2">Login Required</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Sign in to track your progress, view achievements, and continue your learning journey.
          </p>
          <Button
            className="bg-js-yellow text-js-darker hover:bg-js-yellow/90 font-bold rounded-xl"
            onClick={() => navigateTo("login")}
          >
            <LogIn className="h-4 w-4 mr-2" />
            Sign In
          </Button>
        </motion.div>
      </div>
    );
  }

  // ── Derived data from REAL API ──────────────────────────────
  const xp = user.xp ?? 0;
  const streak = user.streak ?? 0;
  const level = Math.floor(xp / 500) + 1;
  const xpForNextLevel = level * 500;
  const xpInLevel = xp - (level - 1) * 500;
  const progressPct = Math.min((xpInLevel / xpForNextLevel) * 100, 100);

  // Stats from real data
  const completedLessons = data
    ? data.progress.filter((p) => p.status === "completed").length
    : 0;
  const completedQuizzes = data ? data.quizAttempts.length : 0;
  const totalQuizScore = data
    ? data.quizAttempts.reduce((sum, a) => sum + a.score, 0)
    : 0;
  const studyMinutes = data
    ? data.progress.reduce((sum, p) => sum + (p.xpEarned > 0 ? Math.max(1, Math.round(p.xpEarned / 10)) : 0), 0)
    : 0;

  const stats = [
    { label: "Total XP", value: xp.toLocaleString(), icon: Zap, color: "text-js-yellow", bg: "bg-js-yellow/10" },
    { label: "Level", value: level, icon: Trophy, color: "text-js-sky", bg: "bg-js-sky/10" },
    { label: "Day Streak", value: streak, icon: Flame, color: "text-js-rose", bg: "bg-js-rose/10" },
    { label: "Study Sessions", value: studyMinutes, icon: Clock, color: "text-js-emerald", bg: "bg-js-emerald/10" },
  ];

  // Achievement unlock status from real data
  const earnedIds = new Set(
    data?.userAchievements.map((ua) => ua.achievementId) ?? []
  );
  const achievements = ALL_ACHIEVEMENTS.map((a) => ({
    ...a,
    unlocked: earnedIds.has(a.id),
  }));

  // Weekly XP from real data
  const weeklyData = data
    ? calcWeeklyXp(data.progress, data.quizAttempts)
    : DAY_NAMES.map((day) => ({ day, xp: 0 }));
  const maxXp = Math.max(...weeklyData.map((d) => d.xp), 1);

  // Find last incomplete lesson for "Continue Learning"
  const lastIncompleteLesson = data
    ? (() => {
        // Build flat ordered list of all lessons
        const allLessons: { id: string; title: string; moduleId: string; levelId: string; order: number }[] = [];
        for (const lv of courseData) {
          for (const mod of lv.modules) {
            for (const les of mod.lessons) {
              allLessons.push({
                id: les.id,
                title: les.title,
                moduleId: mod.id,
                levelId: lv.id,
                order: les.order,
              });
            }
          }
        }
        const completedIds = new Set(
          data.progress.filter((p) => p.status === "completed").map((p) => p.lessonId)
        );
        // Find first incomplete
        return allLessons.find((l) => !completedIds.has(l.id)) ?? null;
      })()
    : null;

  // Course progress per level from real data
  const completedLessonIds = new Set(
    data?.progress.filter((p) => p.status === "completed").map((p) => p.lessonId) ?? []
  );

  // ── Loading skeleton ────────────────────────────────────────
  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex items-center gap-3 mb-8">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-52" />
            <Skeleton className="h-4 w-72" />
          </div>
        </div>
        <Skeleton className="h-40 w-full rounded-2xl mb-6" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 lg:col-span-2 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
        <Skeleton className="h-60 w-full rounded-xl mt-6" />
      </div>
    );
  }

  // ── Error state ─────────────────────────────────────────────
  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 mb-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button variant="outline" onClick={loadData}>Try Again</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-js-sky/10">
            <BarChart3 className="h-5 w-5 text-js-sky" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">Progress Dashboard</h1>
            <p className="text-sm text-muted-foreground">Track your learning journey and achievements</p>
          </div>
        </div>
      </motion.div>

      {/* Welcome Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-6">
        <Card className="overflow-hidden border-border">
          <div className="bg-gradient-to-r from-js-yellow/5 via-js-sky/5 to-js-violet/5 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-js-yellow/20 flex items-center justify-center text-2xl font-extrabold text-js-yellow">
                  {level}
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    Welcome back, {user.name || "Hero"}! 👋
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Level {level} • {xp.toLocaleString()} XP earned
                  </p>
                </div>
              </div>
              <Button
                className="bg-js-yellow text-js-darker hover:bg-js-yellow/90 font-bold rounded-xl"
                onClick={() => {
                  if (lastIncompleteLesson) {
                    const store = useAppStore.getState();
                    store.setCurrentLesson(lastIncompleteLesson);
                    navigateTo("lesson");
                  } else {
                    navigateTo("courses");
                  }
                }}
              >
                {lastIncompleteLesson ? "Continue Learning" : "Browse Courses"}
              </Button>
            </div>
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-muted-foreground">Level {level} Progress</span>
                <span className="font-semibold text-js-yellow">{Math.round(progressPct)}%</span>
              </div>
              <Progress value={progressPct} className="h-3 [&>div]:bg-gradient-to-r [&>div]:from-js-yellow [&>div]:to-js-orange" />
              <p className="text-xs text-muted-foreground mt-1.5">{xpForNextLevel - xpInLevel} XP until Level {level + 1}</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 + i * 0.05 }}>
            <Card className="hover:border-border/80 transition-colors">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                </div>
                <div className={`text-2xl sm:text-3xl font-extrabold ${stat.color} mb-0.5`}>{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Learning Progress */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2">
          <Card>
            <CardContent className="p-5 sm:p-6">
              <h3 className="font-bold text-base mb-4 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-js-sky" />
                Course Progress
              </h3>
              {courseData.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No courses available yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {courseData.map((levelData) => {
                    const total = levelData.modules.reduce(
                      (a, m) => a + m.lessons.length,
                      0
                    );
                    const done = levelData.modules.reduce(
                      (acc, mod) =>
                        acc +
                        mod.lessons.filter((l) => completedLessonIds.has(l.id)).length,
                      0
                    );
                    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                    return (
                      <div key={levelData.id}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-medium">{levelData.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {done}/{total} lessons ({pct}%)
                          </span>
                        </div>
                        <div className="flex gap-2 items-center">
                          <Progress value={pct} className="h-2 flex-1" />
                          <span
                            className="text-xs font-semibold w-10 text-right"
                            style={{ color: levelData.color }}
                          >
                            {pct}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t">
                {[
                  { label: "Lessons", val: completedLessons, total: totalLessons, icon: BookOpen, color: "text-js-yellow" },
                  { label: "Quizzes", val: completedQuizzes, total: totalQuizzes, icon: Target, color: "text-js-violet" },
                  { label: "Quiz Score", val: totalQuizScore, total: "pts" as unknown as number, icon: Star, color: "text-js-emerald" },
                ].map((item) => (
                  <div key={item.label} className="text-center p-3 rounded-xl bg-muted/50">
                    <item.icon className={`h-5 w-5 mx-auto mb-1.5 ${item.color}`} />
                    <div className="text-lg font-bold">{item.val}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {item.label === "Quiz Score" ? `total points` : `of ${item.total} ${item.label}`}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Weekly XP Chart */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card>
            <CardContent className="p-5 sm:p-6">
              <h3 className="font-bold text-base mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-js-emerald" />
                Weekly Activity
              </h3>
              <div className="flex items-end gap-2 h-40">
                {weeklyData.map((d) => (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground">{d.xp}</span>
                    <div
                      className="w-full rounded-t-md bg-gradient-to-t from-js-yellow/80 to-js-yellow/40 transition-all duration-500 hover:from-js-yellow hover:to-js-yellow/60"
                      style={{
                        height: `${(d.xp / maxXp) * 100}%`,
                        minHeight: d.xp > 0 ? 4 : 2,
                      }}
                    />
                    <span className="text-[10px] text-muted-foreground">{d.day}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-xl bg-js-yellow/5 border border-js-yellow/10 text-center">
                <div className="text-lg font-bold text-js-yellow">
                  {weeklyData.reduce((a, b) => a + b.xp, 0)}
                </div>
                <div className="text-[10px] text-muted-foreground">XP earned this week</div>
              </div>

              {/* Recent Notifications */}
              {data && data.notifications.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Bell className="h-3 w-3" />
                    Recent Notifications
                  </h4>
                  <div className="max-h-36 overflow-y-auto custom-scrollbar space-y-1.5">
                    {data.notifications.slice(0, 5).map((notif) => (
                      <div
                        key={notif.id}
                        className={`text-xs p-2 rounded-lg ${
                          notif.read ? "bg-muted/30 text-muted-foreground" : "bg-js-sky/5 text-foreground"
                        }`}
                      >
                        <div className="font-medium truncate">{notif.title}</div>
                        <div className="truncate opacity-70">{notif.message}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Achievements */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-6">
        <Card>
          <CardContent className="p-5 sm:p-6">
            <h3 className="font-bold text-base mb-4 flex items-center gap-2">
              <Award className="h-4 w-4 text-js-yellow" />
              Achievements
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    ach.unlocked
                      ? "bg-card border-js-yellow/20"
                      : "bg-muted/30 border-border opacity-50"
                  }`}
                >
                  <div className="text-2xl mb-1.5">{ach.icon}</div>
                  <div className="text-xs font-semibold mb-0.5">{ach.name}</div>
                  <div className="text-[10px] text-muted-foreground">{ach.desc}</div>
                  {ach.unlocked && (
                    <div className="flex items-center justify-center gap-1 mt-1.5">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      <span className="text-[10px] text-emerald-500 font-medium">Unlocked</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}