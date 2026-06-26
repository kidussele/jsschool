"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import { dailyChallenges } from "@/lib/quiz-data";
import { useState, useRef, useCallback, useEffect } from "react";
import {
  Swords,
  Code2,
  Zap,
  Play,
  CheckCircle2,
  XCircle,
  Loader2,
  Trophy,
  ArrowLeft,
  LogIn,
  RotateCcw,
  Terminal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface TestResult {
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
}

const difficultyColors: Record<string, string> = {
  easy: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  hard: "bg-rose-500/10 text-rose-500 border-rose-500/20",
};

const difficultyAccent: Record<string, string> = {
  easy: "#10B981",
  medium: "#F59E0B",
  hard: "#F43F5E",
};

export function ChallengesView() {
  const { user, navigateTo } = useAppStore();
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [testResults, setTestResults] = useState<TestResult[] | null>(null);
  const [running, setRunning] = useState(false);
  const [xpEarned, setXpEarned] = useState<number | null>(null);
  const [allPassed, setAllPassed] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const challenge = dailyChallenges.find((c) => c.id === selectedChallenge);

  const handleSelectChallenge = (id: string) => {
    const ch = dailyChallenges.find((c) => c.id === id);
    setSelectedChallenge(id);
    setCode(ch?.codeTemplate || "");
    setTestResults(null);
    setXpEarned(null);
    setAllPassed(false);
  };

  const handleRunTests = async () => {
    if (!user) {
      toast.error("Please sign in to submit challenges");
      return;
    }
    if (!selectedChallenge) return;

    setRunning(true);
    setTestResults(null);
    setXpEarned(null);
    setAllPassed(false);

    try {
      const res = await fetch("/api/challenges/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          challengeId: selectedChallenge,
          code,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setTestResults(data.testResults);
        setAllPassed(data.passed);
        setXpEarned(data.xpEarned);
        if (data.passed) {
          toast.success(`${data.message} +${data.xpEarned} XP`);
          // Update user XP in store
          if (user && data.xpEarned > 0) {
            useAppStore.getState().setUser({ ...user, xp: user.xp + data.xpEarned });
          }
        } else {
          toast.error(data.message);
        }
      } else {
        toast.error(data.error || "Failed to submit challenge");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setRunning(false);
    }
  };

  const handleReset = () => {
    if (challenge) {
      setCode(challenge.codeTemplate);
      setTestResults(null);
      setXpEarned(null);
      setAllPassed(false);
    }
  };

  // Sync line numbers scroll
  const handleScroll = useCallback(() => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, []);

  // Handle tab key in editor
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const updated = code.substring(0, start) + "  " + code.substring(end);
      setCode(updated);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  // Select first challenge on mount
  useEffect(() => {
    if (!selectedChallenge && dailyChallenges.length > 0) {
      handleSelectChallenge(dailyChallenges[0].id);
    }
  }, [selectedChallenge]);

  const lineCount = code.split("\n").length;

  // Not logged in prompt
  if (!user) {
    return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-js-rose/10">
              <Swords className="h-5 w-5 text-js-rose" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold">Coding Challenges</h1>
              <p className="text-sm text-muted-foreground">Sharpen your skills with hands-on challenges</p>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col items-center justify-center py-16 text-center">
          <LogIn className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-bold mb-2">Sign In Required</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Log in to submit challenges and earn XP
          </p>
          <Button className="bg-js-yellow text-js-darker hover:bg-js-yellow/90 font-bold" onClick={() => navigateTo("login")}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  // Challenge detail view
  if (selectedChallenge && challenge) {
    return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Back + Header */}
          <button
            onClick={() => {
              setSelectedChallenge(null);
              setTestResults(null);
              setXpEarned(null);
            }}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />All Challenges
          </button>

          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-js-rose/10">
                <Terminal className="h-5 w-5 text-js-rose" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-extrabold">{challenge.title}</h1>
                  <Badge variant="outline" className={cn("text-[10px]", difficultyColors[challenge.difficulty])}>
                    {challenge.difficulty}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{challenge.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-js-yellow/10 border border-js-yellow/20 shrink-0">
              <Zap className="h-3.5 w-3.5 text-js-yellow" />
              <span className="text-xs font-bold text-js-yellow">{challenge.xpReward} XP</span>
            </div>
          </div>

          {/* Code Editor */}
          <Card className="overflow-hidden mb-6">
            <div className="flex items-center justify-between px-4 py-2.5 border-b bg-js-darker/50">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <div className="w-3 h-3 rounded-full bg-green-500/70" />
                </div>
                <span className="text-xs text-muted-foreground ml-2 font-mono">solution.js</span>
              </div>
              <div className="flex gap-1.5">
                <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={handleReset}>
                  <RotateCcw className="h-3 w-3" />Reset
                </Button>
                <Button
                  size="sm"
                  className="h-7 text-xs font-bold gap-1.5 bg-js-yellow text-js-darker hover:bg-js-yellow/90"
                  onClick={handleRunTests}
                  disabled={running}
                >
                  {running ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Play className="h-3.5 w-3.5" />
                  )}
                  Run Tests
                </Button>
              </div>
            </div>
            <div className="flex">
              {/* Line numbers */}
              <div
                ref={lineNumbersRef}
                className="w-10 shrink-0 bg-js-darker py-3 text-right pr-2 select-none overflow-hidden custom-scrollbar"
                style={{ fontSize: "13px", lineHeight: "1.6" }}
              >
                {Array.from({ length: lineCount }, (_, i) => (
                  <div key={i} className="text-muted-foreground/40 font-mono">
                    {i + 1}
                  </div>
                ))}
              </div>
              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onScroll={handleScroll}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                className="flex-1 bg-js-darker text-foreground font-mono p-3 resize-none outline-none min-h-[200px] custom-scrollbar code-editor"
                style={{ fontSize: "13px", lineHeight: "1.6" }}
              />
            </div>
          </Card>

          {/* Test Results */}
          <AnimatePresence>
            {testResults && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card className={allPassed ? "border-emerald-500/30" : "border-destructive/30"}>
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        {allPassed ? (
                          <>
                            <Trophy className="h-5 w-5 text-js-yellow" />
                            <h3 className="font-bold text-sm">All Tests Passed! 🎉</h3>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-5 w-5 text-destructive" />
                            <h3 className="font-bold text-sm">Some Tests Failed</h3>
                          </>
                        )}
                      </div>
                      {xpEarned !== null && xpEarned > 0 && (
                        <Badge className="bg-js-yellow text-js-darker border-0 text-xs font-bold gap-1">
                          <Zap className="h-3 w-3" />+{xpEarned} XP
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2">
                      {testResults.map((tr, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "rounded-lg p-3 text-xs font-mono",
                            tr.passed ? "bg-emerald-500/5 border border-emerald-500/20" : "bg-destructive/5 border border-destructive/20"
                          )}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {tr.passed ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
                            )}
                            <span className={tr.passed ? "text-emerald-500" : "text-destructive"}>
                              Test {idx + 1}: {tr.passed ? "PASSED" : "FAILED"}
                            </span>
                          </div>
                          <div className="ml-5.5 space-y-0.5 text-muted-foreground">
                            <p>Input: <span className="text-foreground">{tr.input}</span></p>
                            <p>Expected: <span className="text-foreground">{tr.expected}</span></p>
                            <p>Actual: <span className={tr.passed ? "text-emerald-500" : "text-destructive"}>{tr.actual}</span></p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }

  // Challenge list view
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-js-rose/10">
            <Swords className="h-5 w-5 text-js-rose" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">Coding Challenges</h1>
            <p className="text-sm text-muted-foreground">Sharpen your skills with hands-on challenges</p>
          </div>
        </div>
      </motion.div>

      <div className="space-y-4">
        {dailyChallenges.map((ch, i) => (
          <motion.div key={ch.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card
              className="overflow-hidden border-border hover:border-js-yellow/30 transition-colors cursor-pointer group"
              onClick={() => handleSelectChallenge(ch.id)}
            >
              <div className="flex">
                <div className="w-1.5 shrink-0" style={{ background: `linear-gradient(to bottom, ${difficultyAccent[ch.difficulty]}, transparent)` }} />
                <CardContent className="p-5 sm:p-6 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2.5 mb-2">
                        <h3 className="font-bold text-base group-hover:text-js-yellow transition-colors">{ch.title}</h3>
                        <Badge variant="outline" className={cn("text-[10px]", difficultyColors[ch.difficulty])}>
                          {ch.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{ch.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Zap className="h-3.5 w-3.5 text-js-yellow" />{ch.xpReward} XP</span>
                        <span className="flex items-center gap-1"><Code2 className="h-3.5 w-3.5" />Code Challenge</span>
                        <span className="flex items-center gap-1"><Terminal className="h-3.5 w-3.5" />{ch.testCases.length} test cases</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="bg-js-yellow text-js-darker hover:bg-js-yellow/90 gap-1.5 text-xs font-bold rounded-lg shrink-0"
                    >
                      <Play className="h-3.5 w-3.5" />Start
                    </Button>
                  </div>
                </CardContent>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {dailyChallenges.length === 0 && (
        <div className="text-center py-16">
          <Swords className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">No challenges available right now.</p>
        </div>
      )}
    </div>
  );
}