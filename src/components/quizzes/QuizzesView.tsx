"use client";

import { motion } from "framer-motion";
import {
  HelpCircle,
  Clock,
  Star,
  Zap,
  Trophy,
  ArrowRight,
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
import { useAppStore } from "@/lib/store";
import { quizData, dailyChallenges } from "@/lib/quiz-data";
import { cn } from "@/lib/utils";

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
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

// ── Component ────────────────────────────────────────────────────
export function QuizzesView() {
  const setCurrentQuiz = useAppStore((s) => s.setCurrentQuiz);
  const setCurrentView = useAppStore((s) => s.setCurrentView);
  const navigateTo = useAppStore((s) => s.navigateTo);

  const handleStartQuiz = (quiz: (typeof quizData)[number]) => {
    setCurrentQuiz({
      id: quiz.id,
      title: quiz.title,
      difficulty: quiz.difficulty,
    });
    setCurrentView("quiz-take");
  };

  const handleTryChallenge = () => {
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
        {quizData.map((quiz) => {
          const diff = DIFFICULTY_CONFIG[quiz.difficulty];
          const DiffIcon = diff.icon;
          const totalPoints = quiz.questions.reduce(
            (acc, q) => acc + q.points,
            0
          );

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
                    <Badge
                      variant="outline"
                      className={cn("shrink-0 text-[11px]", diff.className)}
                    >
                      <DiffIcon className="mr-1 h-3 w-3" />
                      {diff.label}
                    </Badge>
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
                </CardContent>

                <CardFooter className="pt-0">
                  <Button
                    onClick={() => handleStartQuiz(quiz)}
                    className="w-full gap-2 bg-js-yellow text-js-darker font-semibold hover:bg-js-yellow/90"
                  >
                    Start Quiz
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
          {dailyChallenges.map((challenge) => {
            const diff = DIFFICULTY_CONFIG[challenge.difficulty];
            const DiffIcon = diff.icon;

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
                      <CardTitle className="text-base leading-snug">
                        {challenge.title}
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className={cn("shrink-0 text-[11px]", diff.className)}
                      >
                        <DiffIcon className="mr-1 h-3 w-3" />
                        {diff.label}
                      </Badge>
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
                      onClick={handleTryChallenge}
                      variant="outline"
                      className="w-full gap-2 border-js-yellow/40 text-js-yellow hover:bg-js-yellow/10 hover:text-js-yellow"
                    >
                      Try Challenge
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