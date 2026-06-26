"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAppStore } from "@/lib/store";
import { courseData } from "@/lib/course-data";
import { quizData as qd } from "@/lib/quiz-data";
import { projectData } from "@/lib/project-data";
import {
  BarChart3, Flame, Zap, Trophy, BookOpen, Target,
  CheckCircle2, Clock, TrendingUp, Award, Star, Code2,
} from "lucide-react";

const totalLessons = courseData.reduce((a, l) => a + l.modules.reduce((b, m) => b + m.lessons.length, 0), 0);
const totalQuizzes = qd.length;
const totalProjects = projectData.length;

export function DashboardView() {
  const { user, navigateTo } = useAppStore();

  const xp = user?.xp ?? 0;
  const level = user?.level ?? 1;
  const streak = user?.streak ?? 0;
  const xpForNextLevel = level * 500;
  const xpInLevel = xp - (level - 1) * 500;
  const progressPct = Math.min((xpInLevel / xpForNextLevel) * 100, 100);

  // Simulated stats
  const completedLessons = Math.min(Math.floor(xp / 30), totalLessons);
  const completedQuizzes = Math.min(Math.floor(xp / 100), totalQuizzes);
  const completedProjects = Math.min(Math.floor(xp / 200), totalProjects);

  const stats = [
    { label: "Total XP", value: xp.toLocaleString(), icon: Zap, color: "text-js-yellow", bg: "bg-js-yellow/10" },
    { label: "Level", value: level, icon: Trophy, color: "text-js-sky", bg: "bg-js-sky/10" },
    { label: "Day Streak", value: streak, icon: Flame, color: "text-js-rose", bg: "bg-js-rose/10" },
    { label: "Study Hours", value: Math.floor(xp / 25), icon: Clock, color: "text-js-emerald", bg: "bg-js-emerald/10" },
  ];

  const achievements = [
    { name: "First Steps", desc: "Complete your first lesson", icon: "🎯", unlocked: completedLessons > 0 },
    { name: "Quick Learner", desc: "Complete 10 lessons", icon: "📚", unlocked: completedLessons >= 10 },
    { name: "Quiz Master", desc: "Score 100% on any quiz", icon: "🧠", unlocked: completedQuizzes > 0 },
    { name: "Code Warrior", desc: "Complete 5 challenges", icon: "⚔️", unlocked: xp >= 500 },
    { name: "Streak King", desc: "Maintain a 7-day streak", icon: "🔥", unlocked: streak >= 7 },
    { name: "Project Builder", desc: "Complete your first project", icon: "🏗️", unlocked: completedProjects > 0 },
    { name: "Halfway Hero", desc: "Complete 50% of all content", icon: "⭐", unlocked: completedLessons > totalLessons / 2 },
    { name: "JavaScript Hero", desc: "Complete the entire course", icon: "🏆", unlocked: completedLessons >= totalLessons },
  ];

  const weeklyData = [
    { day: "Mon", xp: 45 },
    { day: "Tue", xp: 80 },
    { day: "Wed", xp: 30 },
    { day: "Thu", xp: 120 },
    { day: "Fri", xp: 60 },
    { day: "Sat", xp: 95 },
    { day: "Sun", xp: 40 },
  ];
  const maxXp = Math.max(...weeklyData.map((d) => d.xp));

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
                    Welcome back, {user?.name || "Hero"}! 👋
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Level {level} • {xp.toLocaleString()} XP earned
                  </p>
                </div>
              </div>
              <Button className="bg-js-yellow text-js-darker hover:bg-js-yellow/90 font-bold rounded-xl" onClick={() => navigateTo("courses")}>
                Continue Learning
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
              <div className="space-y-4">
                {courseData.map((levelData) => {
                  const total = levelData.modules.reduce((a, m) => a + m.lessons.length, 0);
                  const done = Math.min(Math.floor(completedLessons * (total / totalLessons)), total);
                  const pct = Math.round((done / total) * 100);
                  return (
                    <div key={levelData.id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium">{levelData.title}</span>
                        <span className="text-xs text-muted-foreground">{done}/{total} lessons ({pct}%)</span>
                      </div>
                      <div className="flex gap-2 items-center">
                        <Progress value={pct} className="h-2 flex-1" />
                        <span className="text-xs font-semibold w-10 text-right" style={{ color: levelData.color }}>{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t">
                {[
                  { label: "Lessons", val: completedLessons, total: totalLessons, icon: BookOpen, color: "text-js-yellow" },
                  { label: "Quizzes", val: completedQuizzes, total: totalQuizzes, icon: Target, color: "text-js-violet" },
                  { label: "Projects", val: completedProjects, total: totalProjects, icon: Code2, color: "text-js-emerald" },
                ].map((item) => (
                  <div key={item.label} className="text-center p-3 rounded-xl bg-muted/50">
                    <item.icon className={`h-5 w-5 mx-auto mb-1.5 ${item.color}`} />
                    <div className="text-lg font-bold">{item.val}</div>
                    <div className="text-[10px] text-muted-foreground">of {item.total} {item.label}</div>
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
                      style={{ height: `${(d.xp / maxXp) * 100}%`, minHeight: 4 }}
                    />
                    <span className="text-[10px] text-muted-foreground">{d.day}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-xl bg-js-yellow/5 border border-js-yellow/10 text-center">
                <div className="text-lg font-bold text-js-yellow">{weeklyData.reduce((a, b) => a + b.xp, 0)}</div>
                <div className="text-[10px] text-muted-foreground">XP earned this week</div>
              </div>
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
                  key={ach.name}
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