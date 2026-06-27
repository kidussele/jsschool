"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  HelpCircle,
  Clock,
  Star,
  Zap,
  Trophy,
  ArrowRight,
  CheckCircle2,
  CalendarDays,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/lib/store";
import { quizData, dailyChallenges } from "@/lib/quiz-data";
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────
interface QuizAttemptInfo {
  bestScore: number;
  bestTotal: number;
  attemptCount: number;
  lastAttemptDate: string;
  completed: boolean; // >= 80%
}

interface ChallengeCompletion {
  [challengeId: string]: boolean;
}

// ── Difficulty config ────────────────────────────────────────────
const DIFFICULTY_CONFIG: Record<
  string,
  { label: string; className: string; icon: React.ElementType }
> = {
  easy: {
    label: "Easy",
    className:
      "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    icon: Star,
  },
  medium: {
    label: "Medium",
    className:
      "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/30",
    icon: Zap,
  },
  hard: {
    label: "Hard",
    className:
      "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
    icon: Trophy,
  },
};

// ── Animation variants ───────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

// ── Helpers ──────────────────────────────────────────────────────
function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

// ── Component ────────────────────────────────────────────────────
export function QuizzesView() {
  const { user, setCurrentQuiz, setCurrentView, navigateTo } = useAppStore();
  const [attemptMap, setAttemptMap] = useState<Record<string, QuizAttemptInfo>>({});
  const [challengeCompleted, setChallengeCompleted] = useState<ChallengeCompletion>({});
  const [loading, setLoading] = useState(true);

  // Fetch quiz attempts
  const fetchAttempts = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/quizzes/attempts?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        const map: Record<string, QuizAttemptInfo> = {};
        for (const attempt of data.attempts || []) {
          const qid = attempt.quizId;
          const pct =
            attempt.totalPoints > 0
              ? Math.round((attempt.score / attempt.totalPoints) * 100)
              : 0;
          const existing = map[qid];
          if (!existing || pct > Math.round((existing.bestScore / existing.bestTotal) * 100)) {
            map[qid] = {
              bestScore: attempt.score,
              bestTotal: attempt.totalPoints,
              attemptCount: (existing?.attemptCount || 0) + 1,
              lastAttemptDate: attempt.completedAt,
              completed: pct >= 80,
            };
          } else {
            map[qid] = {
              ...existing,
              attemptCount: existing.attemptCount + 1,
              lastAttemptDate: attempt.completedAt,
            };
          }
        }
        // Finalize completed flag based on best score
        for (const qid of Object.keys(map)) {
          const info = map[qid];
          const bestPct = Math.round((info.bestScore / info.bestTotal) * 100);
          info.completed = bestPct >= 80;
        }
        setAttemptMap(map);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch challenge completions
  const fetchChallengeStatus = useCallback(async () => {
    if (!user) return;
    try {
      // We check if there's a passed submission for today's challenge
      const today = new Date().toISOString().split("T")[0];
      const res = await fetch(`/api/quizzes/attempts?userId=${user.id}`);
      // We use a different approach - check via challenges
      // Since we don't have a dedicated endpoint for challenge status,
      // we'll fetch from the search or use a lightweight check
      const completed: ChallengeCompletion = {};
      for (const dc of dailyChallenges) {
        try {
          // Check if there's a submission for this challenge by looking at activity logs
          // For simplicity, we mark as not completed by default
          // The real check happens in challenges view
          completed[dc.id] = false;
        } catch {
          completed[dc.id] = false;
        }
      }
      setChallengeCompleted(completed);
    } catch {
      // silently fail
    }
  }, [user]);

  useEffect(() => {
    fetchAttempts();
    fetchChallengeStatus();
  }, [fetchAttempts, fetchChallengeStatus]);

  const handleStartQuiz = (quiz: (typeof quizData)[number]) => {
    setCurrentQuiz({
      id: quiz.id,
      title: quiz.title,
      difficulty: quiz.difficulty,
    });
    setCurrentView("quiz-take");
  };

  const handleTryChallenge = (challengeId?: string) => {
    if (challengeId) {
      useAppStore.getState().setCurrentChallengeId(challengeId);
    }
    navigateTo("challenges");
  };

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* ── Header ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="mb-2 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-js-yellow/20">
            <HelpCircle className="h-5 w-5 text-js-yellow" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Quizzes
          </h1>
          {user && (
            <Badge
              variant="outline"
              className="ml-auto hidden text-xs text-muted-foreground sm:flex"
            >
              {Object.keys(attemptMap).length} / {quizData.length} attempted
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground max-w-2xl text-sm sm:text-base">
          Test your JavaScript knowledge with interactive quizzes. Each quiz
          covers different topics and difficulty levels.
        </p>
      </motion.div>

      {/* ── Quiz Grid ──────────────────────────────────────── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {loading && user
          ? // Loading skeletons
            Array.from({ length: 5 }).map((_, i) => (
              <Card
                key={`skel-${i}`}
                className="border-border/60 bg-card/80 backdrop-blur-sm"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-14" />
                  </div>
                  <Skeleton className="mt-2 h-4 w-full" />
                </CardHeader>
                <CardContent className="flex flex-col gap-3 pb-3">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-3.5 w-16" />
                    <Skeleton className="h-3.5 w-16" />
                    <Skeleton className="h-3.5 w-16" />
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))
          : quizData.map((quiz) => {
              const diff = DIFFICULTY_CONFIG[quiz.difficulty];
              const DiffIcon = diff.icon;
              const totalPoints = quiz.questions.reduce(
                (acc, q) => acc + q.points,
                0
              );
              const attemptInfo = attemptMap[quiz.id];

              return (
                <motion.div key={quiz.id} variants={cardVariants}>
                  <Card className="group relative overflow-hidden border-border/60 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:border-js-yellow/40 hover:shadow-lg hover:shadow-js-yellow/5">
                    {/* Accent top bar */}
                    <div
                      className={cn(
                        "absolute inset-x-0 top-0 h-1 opacity-0 transition-opacity group-hover:opacity-100",
                        quiz.difficulty === "easy" && "bg-emerald-500",
                        quiz.difficulty === "medium" && "bg-yellow-500",
                        quiz.difficulty === "hard" && "bg-rose-500"
                      )}
                    />

                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base leading-snug">
                          {quiz.title}
                        </CardTitle>
                        <div className="flex shrink-0 items-center gap-1.5">
                          {attemptInfo?.completed && (
                            <Badge className="gap-1 border-emerald-500/30 bg-emerald-500/15 text-[11px] text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="h-3 w-3" />
                              Completed
                            </Badge>
                          )}
                          <Badge
                            variant="outline"
                            className={cn("text-[11px]", diff.className)}
                          >
                            <DiffIcon className="mr-1 h-3 w-3" />
                            {diff.label}
                          </Badge>
                        </div>
                      </div>
                      <CardDescription className="line-clamp-2 text-xs leading-relaxed sm:text-sm">
                        {quiz.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="flex flex-col gap-3 pb-3">
                      {/* Stats row */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <HelpCircle className="h-3.5 w-3.5" />
                          {quiz.questions.length} question
                          {quiz.questions.length !== 1 ? "s" : ""}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Star className="h-3.5 w-3.5" />
                          {totalPoints} pts
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          ~{Math.ceil(quiz.questions.length * 0.8)} min
                        </span>
                      </div>

                      {/* Attempt info (if user has attempts) */}
                      {attemptInfo && (
                        <div className="flex flex-wrap items-center gap-2 border-t border-border/30 pt-3">
                          <Badge
                            variant="secondary"
                            className="gap-1 text-[11px] font-semibold"
                          >
                            <Trophy className="h-3 w-3 text-js-yellow" />
                            Best:{" "}
                            {Math.round(
                              (attemptInfo.bestScore / attemptInfo.bestTotal) *
                                100
                            )}
                            %
                          </Badge>
                          <span className="text-[11px] text-muted-foreground">
                            {attemptInfo.attemptCount} attempt
                            {attemptInfo.attemptCount !== 1 ? "s" : ""}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            Last: {formatDate(attemptInfo.lastAttemptDate)}
                          </span>
                        </div>
                      )}
                    </CardContent>

                    <CardFooter className="pt-0">
                      <Button
                        onClick={() => handleStartQuiz(quiz)}
                        className="w-full gap-2 bg-js-yellow text-js-darker font-semibold hover:bg-js-yellow/90"
                      >
                        {attemptInfo ? "Retake Quiz" : "Start Quiz"}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
      </motion.div>

      {/* ── Daily Challenges ────────────────────────────────── */}
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.3 }}
        className="mt-12"
      >
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-js-yellow/20">
            <Zap className="h-5 w-5 text-js-yellow" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
              Daily Challenges
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Sharpen your skills with hands-on coding challenges
            </p>
          </div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {dailyChallenges.map((challenge, idx) => {
            const diff = DIFFICULTY_CONFIG[challenge.difficulty];
            const DiffIcon = diff.icon;
            const isToday = idx === 0;
            const isCompleted = challengeCompleted[challenge.id];

            return (
              <motion.div key={challenge.id} variants={cardVariants}>
                <Card className="group relative overflow-hidden border-border/60 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:border-js-yellow/40 hover:shadow-lg hover:shadow-js-yellow/5">
                  <div
                    className={cn(
                      "absolute inset-x-0 top-0 h-1 opacity-0 transition-opacity group-hover:opacity-100",
                      challenge.difficulty === "easy" && "bg-emerald-500",
                      challenge.difficulty === "medium" && "bg-yellow-500",
                      challenge.difficulty === "hard" && "bg-rose-500"
                    )}
                  />

                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {isToday && (
                          <Badge
                            variant="outline"
                            className="gap-1 border-js-yellow/40 text-[10px] text-js-yellow"
                          >
                            <CalendarDays className="h-3 w-3" />
                            Today
                          </Badge>
                        )}
                        <CardTitle className="text-base leading-snug">
                          {challenge.title}
                        </CardTitle>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        {isCompleted && (
                          <Badge className="gap-1 border-emerald-500/30 bg-emerald-500/15 text-[11px] text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" />
                            Done
                          </Badge>
                        )}
                        <Badge
                          variant="outline"
                          className={cn("text-[11px]", diff.className)}
                        >
                          <DiffIcon className="mr-1 h-3 w-3" />
                          {diff.label}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription className="line-clamp-2 text-xs leading-relaxed sm:text-sm">
                      {challenge.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pb-3">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Trophy className="h-3.5 w-3.5 text-js-yellow" />
                        {challenge.xpReward} XP
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        ~15 min
                      </span>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-0">
                    <Button
                      onClick={() => handleTryChallenge(challenge.id)}
                      variant="outline"
                      className={cn(
                        "w-full gap-2 hover:bg-js-yellow/10 hover:text-js-yellow",
                        isCompleted
                          ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                          : "border-js-yellow/40 text-js-yellow"
                      )}
                    >
                      {isCompleted ? "Try Again" : "Try Challenge"}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    </section>
  );
}