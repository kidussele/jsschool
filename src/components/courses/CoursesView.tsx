"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Sprout,
  Zap,
  Rocket,
  Crown,
  BookOpen,
  FileText,
  ChevronRight,
  Clock,
  Layers,
  CheckCircle2,
  Circle,
  Lock,
  LogIn,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { useAppStore } from "@/lib/store";
import { courseData, type CourseLevel, type CourseModule, type CourseLesson } from "@/lib/course-data";
import { cn } from "@/lib/utils";

// ── Level metadata ──────────────────────────────────────────────
const LEVEL_CONFIG: Record<
  string,
  { color: string; gradient: string; icon: React.ElementType; bgGlow: string }
> = {
  "level-1": {
    color: "#10B981",
    gradient: "from-emerald-500/20 to-emerald-500/5",
    icon: Sprout,
    bgGlow: "shadow-emerald-500/10",
  },
  "level-2": {
    color: "#38BDF8",
    gradient: "from-sky-400/20 to-sky-400/5",
    icon: Zap,
    bgGlow: "shadow-sky-400/10",
  },
  "level-3": {
    color: "#8B5CF6",
    gradient: "from-violet-500/20 to-violet-500/5",
    icon: Rocket,
    bgGlow: "shadow-violet-500/10",
  },
  "level-4": {
    color: "#F43F5E",
    gradient: "from-rose-500/20 to-rose-500/5",
    icon: Crown,
    bgGlow: "shadow-rose-500/10",
  },
};

// ── Animations ──────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

const lessonItemVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.25 } },
};

// ── Helpers ─────────────────────────────────────────────────────
function getTotalLessons(level: CourseLevel): number {
  return level.modules.reduce((sum, m) => sum + m.lessons.length, 0);
}

function getTotalDuration(level: CourseLevel): string {
  const total = getTotalLessons(level) * 5;
  if (total < 60) return `${total} min`;
  return `${Math.floor(total / 60)}h ${total % 60}m`;
}

interface ProgressRecord {
  id: string;
  userId: string;
  lessonId: string;
  status: string;
  xpEarned: number;
  completedAt: string | null;
}

// Build an ordered list of ALL lesson IDs across the entire course for sequential unlock logic
function buildOrderedLessonIds() {
  const ids: string[] = [];
  for (const level of courseData) {
    for (const mod of level.modules) {
      for (const lesson of mod.lessons) {
        ids.push(lesson.id);
      }
    }
  }
  return ids;
}

const orderedLessonIds = buildOrderedLessonIds();

// ── Component ───────────────────────────────────────────────────
export function CoursesView() {
  const { user, setCurrentLesson, setCurrentView } = useAppStore();
  const [progress, setProgress] = useState<ProgressRecord[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(false);

  const fetchProgress = useCallback(async () => {
    if (!user?.id) return;
    setLoadingProgress(true);
    try {
      const res = await fetch(`/api/progress?userId=${user.id}`);
      const data = await res.json();
      setProgress(data.progress ?? []);
    } catch (err) {
      console.error("Failed to fetch progress:", err);
    } finally {
      setLoadingProgress(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) fetchProgress();
  }, [fetchProgress, user?.id]);

  // Build a map of lessonId -> status for quick lookups
  const progressMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of progress) {
      map.set(p.lessonId, p.status);
    }
    return map;
  }, [progress]);

  // Sequential unlock: a lesson is unlocked if the previous lesson is completed, or if it's the first lesson
  const isLessonUnlocked = useCallback(
    (lessonId: string) => {
      if (!user) return true; // Allow browsing for non-logged-in users
      const idx = orderedLessonIds.indexOf(lessonId);
      if (idx <= 0) return true; // First lesson is always unlocked
      const prevLessonId = orderedLessonIds[idx - 1];
      return progressMap.get(prevLessonId) === "completed";
    },
    [user, progressMap]
  );

  const handleLessonClick = async (
    lesson: CourseLesson,
    mod: CourseModule,
    level: CourseLevel
  ) => {
    // If not unlocked, do nothing
    if (!isLessonUnlocked(lesson.id)) return;

    // Save progress as in_progress if user is authenticated
    if (user?.id) {
      const currentStatus = progressMap.get(lesson.id);
      if (currentStatus !== "completed" && currentStatus !== "in_progress") {
        try {
          await fetch("/api/progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user.id,
              lessonId: lesson.id,
              status: "in_progress",
              xpEarned: 0,
              timeSpent: 0,
            }),
          });
          // Optimistically update local state
          setProgress((prev) => {
            const exists = prev.find((p) => p.lessonId === lesson.id);
            if (exists) return prev;
            return [
              { id: "temp", userId: user.id, lessonId: lesson.id, status: "in_progress", xpEarned: 0, completedAt: null },
              ...prev,
            ];
          });
        } catch {
          // Silently fail, still navigate
        }
      }
    }

    setCurrentLesson({
      id: lesson.id,
      title: lesson.title,
      moduleId: mod.id,
      levelId: level.id,
      order: lesson.order,
    });
    setCurrentView("lesson");
  };

  // Calculate module completion
  function getModuleCompletedCount(mod: CourseModule): number {
    let count = 0;
    for (const lesson of mod.lessons) {
      if (progressMap.get(lesson.id) === "completed") count++;
    }
    return count;
  }

  // Calculate level completion
  function getLevelCompletedCount(level: CourseLevel): number {
    let count = 0;
    for (const mod of level.modules) {
      count += getModuleCompletedCount(mod);
    }
    return count;
  }

  // ── Login prompt for authenticated-only features ──
  // We still show the course tree, but prompt login for progress features

  // ── Loading skeleton ──
  if (loadingProgress && user) {
    return (
      <section className="relative min-h-screen w-full px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 top-20 h-80 w-80 rounded-full bg-[#F7DF1E]/5 blur-3xl" />
          <div className="absolute -right-40 bottom-40 h-96 w-96 rounded-full bg-[#38BDF8]/5 blur-3xl" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 mb-10 text-center"
        >
          <Skeleton className="h-6 w-28 mb-4 mx-auto rounded-full" />
          <Skeleton className="h-10 w-72 mb-3 mx-auto" />
          <Skeleton className="h-5 w-96 max-w-2xl mx-auto" />
        </motion.div>
        <div className="relative z-10 mx-auto max-w-5xl space-y-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="overflow-hidden rounded-2xl border-0 shadow-lg">
              <Skeleton className="h-1.5 w-full" />
              <div className="p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
                  <div className="flex-1">
                    <Skeleton className="h-6 w-40 mb-2" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                </div>
                <Skeleton className="h-2 w-full mb-4" />
                {[...Array(2)].map((_, j) => (
                  <Skeleton key={j} className="h-12 w-full rounded-lg mb-2" />
                ))}
              </div>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen w-full px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-80 w-80 rounded-full bg-[#F7DF1E]/5 blur-3xl" />
        <div className="absolute -right-40 bottom-40 h-96 w-96 rounded-full bg-[#38BDF8]/5 blur-3xl" />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 mb-10 text-center"
      >
        <Badge
          className="mb-4 border-[#F7DF1E]/30 bg-[#F7DF1E]/10 text-[#F7DF1E] hover:bg-[#F7DF1E]/20"
        >
          <BookOpen className="mr-1 h-3 w-3" />
          Learning Paths
        </Badge>
        <h1 className="gradient-text mb-3 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
          JavaScript Curriculum
        </h1>
        <p className="mx-auto max-w-2xl text-muted-foreground text-base sm:text-lg">
          Master JavaScript from fundamentals to expert-level patterns.
          Choose your level and start learning today.
        </p>
        {!user && (
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button
              className="bg-js-yellow text-js-darker hover:bg-js-yellow/90 font-bold rounded-xl"
              onClick={() => setCurrentView("login")}
            >
              <LogIn className="h-4 w-4 mr-2" />
              Sign In to Track Progress
            </Button>
          </div>
        )}
      </motion.div>

      {/* Level cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto max-w-5xl space-y-6"
      >
        {courseData.map((level, levelIndex) => {
          const config = LEVEL_CONFIG[level.id] ?? LEVEL_CONFIG["level-1"];
          const LevelIcon = config.icon;
          const totalLessonsCount = getTotalLessons(level);
          const totalDuration = getTotalDuration(level);
          const levelCompleted = getLevelCompletedCount(level);
          const levelPct = totalLessonsCount > 0 ? Math.round((levelCompleted / totalLessonsCount) * 100) : 0;

          return (
            <motion.div key={level.id} variants={cardVariants}>
              <Card
                className={cn(
                  "glass-card group overflow-hidden rounded-2xl border-0 shadow-lg transition-shadow duration-300",
                  config.bgGlow,
                  "hover:shadow-xl"
                )}
              >
                {/* Level header strip */}
                <div
                  className="h-1.5 w-full"
                  style={{
                    background: `linear-gradient(90deg, ${config.color}, ${config.color}88, transparent)`,
                  }}
                />

                <div className="p-4 sm:p-6">
                  {/* Level info */}
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                        style={{
                          backgroundColor: `${config.color}18`,
                          border: `1px solid ${config.color}30`,
                        }}
                      >
                        <LevelIcon
                          className="h-6 w-6"
                          style={{ color: config.color }}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg font-bold sm:text-xl">{level.title}</h2>
                          <Badge
                            variant="outline"
                            className="text-[10px] font-semibold"
                            style={{
                              borderColor: `${config.color}40`,
                              color: config.color,
                            }}
                          >
                            Level {level.order}
                          </Badge>
                        </div>
                        <p className="mt-0.5 text-sm text-muted-foreground leading-snug">
                          {level.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Layers className="h-4 w-4" />
                        <span>
                          {level.modules.length} module{level.modules.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FileText className="h-4 w-4" />
                        <span>{totalLessonsCount} lessons</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        <span>{totalDuration}</span>
                      </div>
                    </div>
                  </div>

                  {/* Overall level progress */}
                  <div className="mb-4 flex items-center gap-3">
                    <Progress value={levelPct} className="h-2 flex-1" />
                    <span className="text-xs font-medium text-muted-foreground">
                      {levelPct}%
                    </span>
                  </div>

                  {/* Modules accordion */}
                  <Accordion type="multiple" className="w-full">
                    {level.modules.map((mod, modIndex) => {
                      const modCompleted = getModuleCompletedCount(mod);
                      const modTotal = mod.lessons.length;
                      const modPct = modTotal > 0 ? Math.round((modCompleted / modTotal) * 100) : 0;

                      return (
                        <AccordionItem
                          key={mod.id}
                          value={mod.id}
                          className="border-border/50 rounded-lg px-1 transition-colors data-[state=open]:bg-muted/30"
                        >
                          <AccordionTrigger className="hover:no-underline py-3">
                            <div className="flex flex-1 items-center gap-3 text-left">
                              <div
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                                style={{ backgroundColor: config.color }}
                              >
                                {mod.order}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-sm truncate">
                                  {mod.title}
                                </div>
                                <div className="mt-0.5 text-xs text-muted-foreground truncate">
                                  {mod.description}
                                </div>
                              </div>
                              <div className="hidden sm:flex items-center gap-2 mr-2">
                                <span className="text-xs text-muted-foreground">
                                  {modCompleted}/{modTotal} lessons
                                </span>
                                <Progress
                                  value={modPct}
                                  className="h-1.5 w-20"
                                />
                              </div>
                            </div>
                          </AccordionTrigger>

                          <AccordionContent className="pb-2">
                            <motion.div
                              initial="hidden"
                              animate="visible"
                              variants={{
                                hidden: {},
                                visible: { transition: { staggerChildren: 0.04 } },
                              }}
                              className="space-y-1 pl-4 sm:pl-11"
                            >
                              {mod.lessons.map((lesson, lesIndex) => {
                                const status = progressMap.get(lesson.id) ?? "not_started";
                                const unlocked = isLessonUnlocked(lesson.id);
                                const isCompleted = status === "completed";
                                const isInProgress = status === "in_progress";

                                return (
                                  <motion.div
                                    key={lesson.id}
                                    variants={lessonItemVariants}
                                  >
                                    <Button
                                      variant="ghost"
                                      className={cn(
                                        "group/btn w-full justify-start gap-3 rounded-lg px-3 py-2.5 h-auto text-left hover:bg-accent/60",
                                        !unlocked && "opacity-50 cursor-not-allowed hover:bg-transparent"
                                      )}
                                      onClick={() =>
                                        handleLessonClick(lesson, mod, level)
                                      }
                                      disabled={!unlocked}
                                    >
                                      <span
                                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-bold transition-colors"
                                        style={{
                                          backgroundColor: unlocked ? `${config.color}15` : "transparent",
                                          color: unlocked ? config.color : "hsl(var(--muted-foreground))",
                                        }}
                                      >
                                        {unlocked ? (
                                          isCompleted ? (
                                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                          ) : isInProgress ? (
                                            <Circle className="h-4 w-4 text-js-sky" />
                                          ) : (
                                            lesIndex + 1
                                          )
                                        ) : (
                                          <Lock className="h-3.5 w-3.5" />
                                        )}
                                      </span>
                                      <span className={cn(
                                        "flex-1 truncate text-sm font-medium",
                                        !unlocked && "text-muted-foreground"
                                      )}>
                                        {lesson.title}
                                      </span>
                                      {unlocked && (
                                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover/btn:opacity-100" />
                                      )}
                                    </Button>
                                  </motion.div>
                                );
                              })}
                            </motion.div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}