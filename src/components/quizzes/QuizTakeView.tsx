"use client";

import { useState, useMemo } from "react";
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
} from "lucide-react";

export function QuizTakeView() {
  const { currentQuiz, navigateTo } = useAppStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [fillAnswer, setFillAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<
    { questionId: string; selected: string; correct: string; isCorrect: boolean }[]
  >([]);
  const [finished, setFinished] = useState(false);

  const quiz = useMemo(
    () => quizData.find((q) => q.id === currentQuiz?.id),
    [currentQuiz]
  );

  const question = quiz?.questions[currentIndex];

  if (!quiz || !question) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h2 className="text-xl font-bold mb-4">Quiz not found</h2>
        <Button onClick={() => navigateTo("quizzes")}>Back to Quizzes</Button>
      </div>
    );
  }

  const progress = ((currentIndex + 1) / quiz.questions.length) * 100;
  const isCorrect =
    selectedAnswer?.toLowerCase().trim() ===
    question.correctAnswer.toLowerCase().trim();

  const handleSelect = (option: string) => {
    if (checked) return;
    setSelectedAnswer(option);
  };

  const handleCheck = () => {
    if (!selectedAnswer && !fillAnswer) return;
    setChecked(true);
    const userAnswer = question.type === "fill_blank" ? fillAnswer : selectedAnswer!;
    const correct =
      userAnswer.toLowerCase().trim() ===
      question.correctAnswer.toLowerCase().trim();
    if (correct) setScore((s) => s + question.points);
    setAnswers((a) => [
      ...a,
      {
        questionId: question.id,
        selected: userAnswer,
        correct: question.correctAnswer,
        isCorrect: correct,
      },
    ]);
  };

  const handleNext = () => {
    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setFillAnswer("");
      setChecked(false);
    } else {
      setFinished(true);
    }
  };

  const handleRetake = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setFillAnswer("");
    setChecked(false);
    setScore(0);
    setAnswers([]);
    setFinished(false);
  };

  const totalPoints = quiz.questions.reduce((a, q) => a + q.points, 0);
  const percentage = Math.round((score / totalPoints) * 100);

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
                    {answers.filter((a) => a.isCorrect).length}/
                    {quiz.questions.length}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Correct
                  </div>
                </div>
              </div>
              <Progress value={percentage} className="h-3" />
            </CardContent>
          </Card>

          {/* Review answers */}
          <div className="space-y-3 mb-8 text-left max-h-96 overflow-y-auto custom-scrollbar">
            {answers.map((a, i) => (
              <Card
                key={a.questionId}
                className={cn(
                  "border",
                  a.isCorrect
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-rose-500/30 bg-rose-500/5"
                )}
              >
                <CardContent className="py-3 px-4 flex items-start gap-3">
                  {a.isCorrect ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">
                      Q{i + 1}: {quiz.questions[i]?.question}
                    </p>
                    {!a.isCorrect && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Your answer: <span className="text-rose-400">{a.selected}</span> →{" "}
                        <span className="text-emerald-400">{a.correct}</span>
                      </p>
                    )}
                  </div>
                  <span className="text-xs font-semibold shrink-0">
                    {a.isCorrect ? "+" : "0"} pts
                  </span>
                </CardContent>
              </Card>
            ))}
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
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          <span className="font-medium text-foreground">
            Question {currentIndex + 1} of {quiz.questions.length}
          </span>
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 text-js-yellow" />
            {score} pts
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </motion.div>

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
                    const isSelected = selectedAnswer === option;
                    const isCorrectOption =
                      option === question.correctAnswer;
                    let borderColor = "border-border hover:border-js-yellow/40";
                    if (checked) {
                      if (isCorrectOption) borderColor = "border-emerald-500 bg-emerald-500/10";
                      else if (isSelected && !isCorrectOption)
                        borderColor = "border-rose-500 bg-rose-500/10";
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => handleSelect(option)}
                        disabled={checked}
                        className={cn(
                          "w-full text-left flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer",
                          borderColor,
                          !checked && "cursor-pointer",
                          checked && "cursor-default"
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
                    value={fillAnswer}
                    onChange={(e) => setFillAnswer(e.target.value)}
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
          <div className="flex justify-between">
            {!checked ? (
              <Button
                onClick={handleCheck}
                disabled={
                  question.type === "fill_blank"
                    ? !fillAnswer.trim()
                    : !selectedAnswer
                }
                className="ml-auto gap-2 bg-js-yellow text-js-darker hover:bg-js-yellow/90 font-semibold px-8"
              >
                <Sparkles className="h-4 w-4" />
                Check Answer
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="ml-auto gap-2 bg-js-yellow text-js-darker hover:bg-js-yellow/90 font-semibold px-8"
              >
                {currentIndex < quiz.questions.length - 1
                  ? "Next Question"
                  : "Finish Quiz"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}