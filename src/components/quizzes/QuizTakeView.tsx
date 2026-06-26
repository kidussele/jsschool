"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { quizData } from "@/lib/quiz-data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Trophy,
  RotateCcw,
  Star,
  Lightbulb,
  Sparkles,
  Clock,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────
interface SubmitResult {
  attempt: {
    id: string;
    score: number;
    totalPoints: number;
    correctCount: number;
    totalQuestions: number;
    timeTaken: number;
  };
  score: number;
  totalPoints: number;
  correctCount: number;
  totalQuestions: number;
  percentage: number;
  xpEarned: number;
  message: string;
}

// ── Constants ────────────────────────────────────────────────
const SECONDS_PER_QUESTION = 60;

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ── Component ────────────────────────────────────────────────────
export function QuizTakeView() {
  const { user, currentQuiz, navigateTo, setUser } = useAppStore();

  // State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerMap, setAnswerMap] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [finished, setFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);

  // Timer
  const timePerQuestion = SECONDS_PER_QUESTION;
  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_QUESTION);
  const [elapsedTotal, setElapsedTotal] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const globalStartRef = useRef<number>(Date.now());

  const quiz = useMemo(
    () => quizData.find((q) => q.id === currentQuiz?.id),
    [currentQuiz]
  );

  const questions = quiz?.questions ?? [];
  const question = questions[currentIndex];

  // Reset timer on question change
  useEffect(() => {
    if (finished || !question) return;
    setTimeLeft(timePerQuestion);
    startTimeRef.current = Date.now();
  }, [currentIndex, timePerQuestion, finished, question]);

  // Timer tick
  useEffect(() => {
    if (finished || !quiz) return;

    timerRef.current = setInterval(() => {
      const now = Date.now();
      const questionElapsed = Math.floor((now - startTimeRef.current) / 1000);
      const totalElapsed = Math.floor(
        (now - globalStartRef.current) / 1000
      );
      const remaining = Math.max(0, timePerQuestion - questionElapsed);

      setTimeLeft(remaining);
      setElapsedTotal(totalElapsed);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [finished, quiz, currentIndex, timePerQuestion]);

  const handleCheck = () => {
    if (!question) return;
    const currentAns = answerMap[question.id];
    if (!currentAns) return;
    setChecked(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setChecked(false);
    } else {
      // Finish quiz — submit to API
      finishQuiz();
    }
  };

  // ── Submit quiz to backend ────────────────────────────────
  const finishQuiz = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSubmitting(true);

    const elapsedSeconds = Math.floor(
      (Date.now() - globalStartRef.current) / 1000
    );

    if (user) {
      try {
        const res = await fetch("/api/quizzes/attempts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            quizId: quiz.id,
            answers: JSON.stringify(answerMap),
            timeTaken: elapsedSeconds,
          }),
        });

        const data = await res.json();
        if (res.ok) {
          setSubmitResult(data);
          if (data.xpEarned > 0) {
            setUser({ ...user, xp: user.xp + data.xpEarned });
          }
        }
      } catch {
        // Fall through to local calculation
      }
    }

    setSubmitting(false);
    setFinished(true);
  };

  // Calculate results (before any early returns to satisfy rules-of-hooks)
  const localScore = useMemo(() => {
    let pts = 0;
    let correct = 0;
    for (const q of questions) {
      const ans = answerMap[q.id];
      if (
        ans &&
        ans.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()
      ) {
        pts += q.points;
        correct++;
      }
    }
    return { pts, correct };
  }, [questions, answerMap]);

  const totalPoints = questions.reduce((a, q) => a + q.points, 0);
  const score = submitResult?.score ?? localScore.pts;
  const correctCount = submitResult?.correctCount ?? localScore.correct;
  const percentage =
    submitResult?.percentage ??
    (totalPoints > 0 ? Math.round((localScore.pts / totalPoints) * 100) : 0);
  const xpEarned = submitResult?.xpEarned ?? localScore.correct * 10;

  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const userAnswer = answerMap[question?.id ?? ""] ?? "";
  const isCorrect =
    question &&
    userAnswer.toLowerCase().trim() ===
      question.correctAnswer.toLowerCase().trim();
  const isLowTime = timeLeft <= 10;

  const handleSelect = (option: string) => {
    if (checked || !question) return;
    setAnswerMap((prev) => ({ ...prev, [question.id]: option }));
  };

  const handleFillChange = (value: string) => {
    if (checked || !question) return;
    setAnswerMap((prev) => ({ ...prev, [question.id]: value }));
  };

  // ── Not found ────────────────────────────────────────────
  if (!quiz) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h2 className="text-xl font-bold mb-4">Quiz not found</h2>
        <Button onClick={() => navigateTo("quizzes")}>Back to Quizzes</Button>
      </div>
    );
  }

  const handleRetake = () => {
    setCurrentIndex(0);
    setAnswerMap({});
    setChecked(false);
    setFinished(false);
    setSubmitting(false);
    setSubmitResult(null);
    setElapsedTotal(0);
    setTimeLeft(timePerQuestion);
    startTimeRef.current = Date.now();
    globalStartRef.current = Date.now();
  };

  const goToQuestion = (index: number) => {
    setCurrentIndex(index);
    setChecked(false);
  };

  // ── Submitting state ──────────────────────────────────────
  if (submitting) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 text-js-yellow animate-spin" />
        <p className="text-lg font-semibold">Submitting your quiz...</p>
        <p className="text-sm text-muted-foreground">
          Calculating your score
        </p>
      </div>
    );
  }

  // ── Finished / Results screen ─────────────────────────────
  if (finished) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-js-yellow/10 mb-6">
            <Trophy
              className={cn(
                "h-10 w-10",
                percentage >= 70 ? "text-js-yellow" : "text-muted-foreground"
              )}
            />
          </div>
          <h2 className="text-3xl font-extrabold mb-2">Quiz Complete!</h2>
          <p className="text-muted-foreground mb-8">{quiz.title}</p>

          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div
                    className={cn(
                      "text-3xl font-extrabold",
                      percentage >= 70 ? "text-js-emerald" : "text-js-rose"
                    )}
                  >
                    {percentage}%
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Score
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-extrabold text-js-yellow">
                    {score}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Points
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-extrabold text-js-sky">
                    {correctCount}/{questions.length}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Correct
                  </div>
                </div>
              </div>
              <Progress value={percentage} className="h-3" />

              {/* XP earned */}
              {xpEarned > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-js-yellow"
                >
                  <Zap className="h-4 w-4" />
                  +{xpEarned} XP earned
                </motion.div>
              )}

              {/* Time taken */}
              <p className="mt-2 text-xs text-muted-foreground text-center">
                Time taken: {formatTime(elapsedTotal)}
              </p>
            </CardContent>
          </Card>

          {/* Review answers with explanations */}
          <div className="space-y-3 mb-8 text-left max-h-96 overflow-y-auto custom-scrollbar">
            {questions.map((q, i) => {
              const ans = answerMap[q.id] || "(skipped)";
              const qCorrect =
                ans.toLowerCase().trim() ===
                q.correctAnswer.toLowerCase().trim();
              return (
                <Card
                  key={q.id}
                  className={cn(
                    "border",
                    qCorrect
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : "border-rose-500/30 bg-rose-500/5"
                  )}
                >
                  <CardContent className="py-3 px-4 flex items-start gap-3">
                    {qCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">
                        Q{i + 1}: {q.question}
                      </p>
                      {!qCorrect && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Your answer:{" "}
                          <span className="text-rose-400">{ans}</span> →{" "}
                          <span className="text-emerald-400">
                            {q.correctAnswer}
                          </span>
                        </p>
                      )}
                      {q.explanation && (
                        <p className="text-xs text-muted-foreground mt-1.5 flex items-start gap-1.5">
                          <Lightbulb className="h-3 w-3 text-js-yellow shrink-0 mt-0.5" />
                          {q.explanation}
                        </p>
                      )}
                    </div>
                    <span className="text-xs font-semibold shrink-0">
                      {qCorrect ? "+" : "0"} pts
                    </span>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex gap-3 justify-center">
            <Button
              onClick={handleRetake}
              variant="outline"
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Retake
            </Button>
            <Button
              onClick={() => navigateTo("quizzes")}
              className="gap-2 bg-js-yellow text-js-darker hover:bg-js-yellow/90 font-semibold"
            >
              All Quizzes
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Quiz question view ────────────────────────────────────
  if (!question) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h2 className="text-xl font-bold mb-4">Question not found</h2>
        <Button onClick={() => navigateTo("quizzes")}>Back to Quizzes</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateTo("quizzes")}
            className="gap-2 text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            {/* Timer */}
            <Badge
              variant="outline"
              className={cn(
                "gap-1.5 font-mono tabular-nums",
                isLowTime
                  ? "border-rose-500/60 text-rose-500 animate-pulse"
                  : "border-border text-muted-foreground"
              )}
            >
              <Clock className="h-3.5 w-3.5" />
              {formatTime(timeLeft)}
            </Badge>
            <Badge
              variant="outline"
              className={
                quiz.difficulty === "easy"
                  ? "border-emerald-500/30 text-emerald-500"
                  : quiz.difficulty === "medium"
                    ? "border-yellow-500/30 text-yellow-500"
                    : "border-rose-500/30 text-rose-500"
              }
            >
              {quiz.difficulty}
            </Badge>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          <span className="font-medium text-foreground">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 text-js-yellow" />
            {Object.entries(answerMap).reduce((acc, [qid, ans]) => {
              const q = questions.find((qq) => qq.id === qid);
              if (
                q &&
                ans.toLowerCase().trim() ===
                  q.correctAnswer.toLowerCase().trim()
              ) {
                return acc + q.points;
              }
              return acc;
            }, 0)}{" "}
            pts
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </motion.div>

      {/* Question Navigator (dots) */}
      <div className="flex items-center justify-center gap-1.5 mb-4 flex-wrap">
        {questions.map((q, i) => {
          const answered = !!answerMap[q.id];
          const isCurrent = i === currentIndex;
          return (
            <button
              key={q.id}
              onClick={() => goToQuestion(i)}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all",
                isCurrent
                  ? "bg-js-yellow text-js-darker scale-110"
                  : answered
                    ? "bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3 mb-4">
                <Badge
                  variant="secondary"
                  className="shrink-0 mt-0.5 text-xs"
                >
                  {question.points} pts
                </Badge>
                <h3 className="text-base sm:text-lg font-semibold leading-relaxed">
                  {question.question}
                </h3>
              </div>

              {/* Code snippet */}
              {question.codeSnippet && (
                <pre className="bg-js-darker rounded-lg p-4 mb-4 overflow-x-auto text-sm font-mono text-js-sky">
                  {question.codeSnippet}
                </pre>
              )}

              {/* Multiple Choice */}
              {question.type === "multiple_choice" && question.options && (
                <div className="space-y-2.5">
                  {question.options.map((option, i) => {
                    const letter = String.fromCharCode(65 + i);
                    const isSelected = userAnswer === option;
                    const isCorrectOption = option === question.correctAnswer;
                    let borderColor =
                      "border-border hover:border-js-yellow/40";
                    if (checked) {
                      if (isCorrectOption)
                        borderColor = "border-emerald-500 bg-emerald-500/10";
                      else if (isSelected && !isCorrectOption)
                        borderColor = "border-rose-500 bg-rose-500/10";
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => handleSelect(option)}
                        disabled={checked}
                        className={cn(
                          "w-full text-left flex items-center gap-3 p-3.5 rounded-xl border transition-all",
                          borderColor,
                          !checked ? "cursor-pointer" : "cursor-default"
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-7 w-7 items-center justify-center rounded-lg border text-xs font-bold shrink-0",
                            isSelected
                              ? "border-js-yellow bg-js-yellow text-js-darker"
                              : "border-border text-muted-foreground"
                          )}
                        >
                          {checked && isCorrectOption ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          ) : checked && isSelected && !isCorrectOption ? (
                            <XCircle className="h-4 w-4 text-rose-500" />
                          ) : (
                            letter
                          )}
                        </span>
                        <span className="text-sm font-medium">{option}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Fill in the blank */}
              {question.type === "fill_blank" && (
                <div>
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => handleFillChange(e.target.value)}
                    disabled={checked}
                    placeholder="Type your answer..."
                    className={cn(
                      "w-full h-12 px-4 rounded-xl border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-js-yellow/50 transition-colors",
                      checked && isCorrect
                        ? "border-emerald-500 bg-emerald-500/10"
                        : checked && !isCorrect
                          ? "border-rose-500 bg-rose-500/10"
                          : ""
                    )}
                  />
                </div>
              )}

              {/* Explanation */}
              <AnimatePresence>
                {checked && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4"
                  >
                    <div
                      className={cn(
                        "p-4 rounded-xl border text-sm leading-relaxed",
                        isCorrect
                          ? "border-emerald-500/30 bg-emerald-500/5"
                          : "border-rose-500/30 bg-rose-500/5"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-2 font-semibold">
                        {isCorrect ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            <span className="text-emerald-500">Correct!</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-rose-500" />
                            <span className="text-rose-500">
                              Not quite. Answer: {question.correctAnswer}
                            </span>
                          </>
                        )}
                      </div>
                      {question.explanation && (
                        <p className="text-muted-foreground flex items-start gap-2 mt-2">
                          <Lightbulb className="h-4 w-4 text-js-yellow shrink-0 mt-0.5" />
                          {question.explanation}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              disabled={currentIndex === 0}
              onClick={() => {
                setCurrentIndex((i) => i - 1);
                setChecked(false);
              }}
              className="gap-1 text-muted-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            {!checked ? (
              <Button
                onClick={handleCheck}
                disabled={
                  question.type === "fill_blank"
                    ? !userAnswer.trim()
                    : !userAnswer
                }
                className="gap-2 bg-js-yellow text-js-darker hover:bg-js-yellow/90 font-semibold px-8"
              >
                <Sparkles className="h-4 w-4" />
                Check Answer
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="gap-2 bg-js-yellow text-js-darker hover:bg-js-yellow/90 font-semibold px-8"
              >
                {currentIndex < questions.length - 1
                  ? "Next Question"
                  : "Finish Quiz"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              disabled={currentIndex === questions.length - 1}
              onClick={() => {
                setCurrentIndex((i) => i + 1);
                setChecked(false);
              }}
              className="gap-1 text-muted-foreground"
            >
              Skip
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}