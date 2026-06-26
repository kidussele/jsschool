"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import { dailyChallenges } from "@/lib/quiz-data";
import { useState } from "react";
import {
  Swords, Code2, Zap, Eye, EyeOff, Play,
} from "lucide-react";
import { cn } from "@/lib/utils";

const difficultyColors: Record<string, string> = {
  easy: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  hard: "bg-rose-500/10 text-rose-500 border-rose-500/20",
};

const difficultyAccent: Record<string, string> = {
  easy: "#10B981", medium: "#F59E0B", hard: "#F43F5E",
};

export function ChallengesView() {
  const { navigateTo } = useAppStore();
  const [filter, setFilter] = useState<"all" | "easy" | "medium" | "hard">("all");
  const [expandedSolution, setExpandedSolution] = useState<string | null>(null);

  const filtered = filter === "all"
    ? dailyChallenges
    : dailyChallenges.filter((c) => c.difficulty === filter);

  const handleOpenInPlayground = (code: string) => {
    localStorage.setItem("playground_js", code);
    navigateTo("playground");
  };

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

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex gap-2 mb-8 flex-wrap">
        {(["all", "easy", "medium", "hard"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer",
              filter === f ? "bg-js-yellow text-js-darker shadow-sm" : "bg-muted text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </motion.div>

      <div className="space-y-4">
        {filtered.map((challenge, i) => (
          <motion.div key={challenge.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="overflow-hidden border-border hover:border-js-yellow/30 transition-colors">
              <div className="flex">
                <div className="w-1.5 shrink-0" style={{ background: `linear-gradient(to bottom, ${difficultyAccent[challenge.difficulty]}, transparent)` }} />
                <CardContent className="p-5 sm:p-6 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2.5 mb-2">
                        <h3 className="font-bold text-base">{challenge.title}</h3>
                        <Badge variant="outline" className={cn("text-[10px]", difficultyColors[challenge.difficulty])}>
                          {challenge.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{challenge.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Zap className="h-3.5 w-3.5 text-js-yellow" />{challenge.xpReward} XP</span>
                        <span className="flex items-center gap-1"><Code2 className="h-3.5 w-3.5" />Code Challenge</span>
                      </div>
                    </div>
                    <div className="flex sm:flex-col gap-2 shrink-0">
                      <Button size="sm" className="bg-js-yellow text-js-darker hover:bg-js-yellow/90 gap-1.5 text-xs font-bold rounded-lg" onClick={() => handleOpenInPlayground(challenge.codeTemplate)}>
                        <Play className="h-3.5 w-3.5" />Open in Playground
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1.5 text-xs rounded-lg" onClick={() => setExpandedSolution(expandedSolution === challenge.id ? null : challenge.id)}>
                        {expandedSolution === challenge.id ? (<><EyeOff className="h-3.5 w-3.5" />Hide</>) : (<><Eye className="h-3.5 w-3.5" />Solution</>)}
                      </Button>
                    </div>
                  </div>
                  {expandedSolution === challenge.id && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4">
                      <div className="rounded-xl bg-js-darker border border-border p-4 overflow-x-auto">
                        <span className="text-xs text-muted-foreground font-medium mb-2 block">Solution</span>
                        <pre className="text-sm font-mono text-js-sky leading-relaxed whitespace-pre-wrap">{challenge.solution}</pre>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Swords className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">No challenges found for this difficulty.</p>
        </div>
      )}
    </div>
  );
}