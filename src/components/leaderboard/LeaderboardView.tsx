"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/lib/store";
import { useState, useEffect, useCallback } from "react";
import {
  Trophy,
  Crown,
  Medal,
  Zap,
  Flame,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  avatar?: string | null;
  xp: number;
  streak: number;
  coins: number;
}

const topColors = [
  { border: "border-yellow-500", bg: "bg-yellow-500/10", text: "text-yellow-500", gradient: "from-yellow-500/20", medal: "#FFD700" },
  { border: "border-slate-400", bg: "bg-slate-400/10", text: "text-slate-400", gradient: "from-slate-400/20", medal: "#C0C0C0" },
  { border: "border-[#CD7F32]", bg: "bg-[#CD7F32]/10", text: "text-[#CD7F32]", gradient: "from-[#CD7F32]/20", medal: "#CD7F32" },
];

export function LeaderboardView() {
  const { user } = useAppStore();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/leaderboard?limit=50");
      const data = await res.json();
      if (data.leaderboard) {
        setEntries(data.leaderboard);
      }
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="space-y-1.5">
              <Skeleton className="h-7 w-40" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
        </motion.div>
        {/* Podium skeleton */}
        <div className="flex items-end justify-center gap-3 sm:gap-5 mb-8 px-4">
          {[120, 160, 100].map((h, i) => (
            <div key={i} className="text-center flex-1 max-w-[160px]">
              <Skeleton className="h-14 w-14 sm:h-16 sm:w-16 mx-auto rounded-full mb-3" />
              <Skeleton className="h-4 w-24 mx-auto mb-1" />
              <Skeleton className="h-3 w-16 mx-auto mb-3" />
              <Skeleton className="h-24 mx-auto rounded-t-xl w-full" style={{ height: h }} />
            </div>
          ))}
        </div>
        {/* List skeleton */}
        <Card>
          <div className="divide-y">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 sm:px-5 py-3.5">
                <Skeleton className="w-6 h-5" />
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-js-yellow/10">
              <Trophy className="h-5 w-5 text-js-yellow" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold">Leaderboard</h1>
              <p className="text-sm text-muted-foreground">Top JavaScript Heroes ranked by XP</p>
            </div>
          </div>
        </motion.div>
        <div className="text-center py-16">
          <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">No leaderboard entries yet. Be the first to earn XP!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-js-yellow/10">
            <Trophy className="h-5 w-5 text-js-yellow" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">Leaderboard</h1>
            <p className="text-sm text-muted-foreground">Top JavaScript Heroes ranked by XP</p>
          </div>
        </div>
      </motion.div>

      {/* Top 3 Podium */}
      {top3.length >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-end justify-center gap-3 sm:gap-5 mb-8 px-4"
        >
          {/* 2nd Place */}
          <div className="text-center flex-1 max-w-[160px]">
            <div className="relative inline-block mb-3">
              <Avatar className="h-14 w-14 sm:h-16 sm:w-16 mx-auto border-2" style={{ borderColor: topColors[1].medal }}>
                <AvatarFallback className="font-bold" style={{ backgroundColor: `${topColors[1].medal}15`, color: topColors[1].medal }}>
                  {getInitials(top3[1].name)}
                </AvatarFallback>
              </Avatar>
              <div
                className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow text-white"
                style={{ backgroundColor: topColors[1].medal }}
              >
                2
              </div>
            </div>
            <div className="font-bold text-sm truncate">{top3[1].name}</div>
            <div className="text-xs text-muted-foreground">{top3[1].xp.toLocaleString()} XP</div>
            <div className="h-20 sm:h-24 rounded-t-xl mt-3" style={{ background: `linear-gradient(to top, ${topColors[1].medal}30, transparent)` }} />
          </div>

          {/* 1st Place */}
          <div className="text-center flex-1 max-w-[180px]">
            <div className="relative inline-block mb-3">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                <Crown className="h-6 w-6" style={{ color: topColors[0].medal }} />
              </div>
              <Avatar className="h-18 w-18 sm:h-20 sm:w-20 mx-auto border-2 shadow-lg" style={{ borderColor: topColors[0].medal, boxShadow: `0 4px 20px ${topColors[0].medal}40` }}>
                <AvatarFallback className="font-bold text-lg" style={{ backgroundColor: `${topColors[0].medal}15`, color: topColors[0].medal }}>
                  {getInitials(top3[0].name)}
                </AvatarFallback>
              </Avatar>
              <div
                className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shadow-lg text-white"
                style={{ backgroundColor: topColors[0].medal }}
              >
                1
              </div>
            </div>
            <div className="font-bold text-base truncate">{top3[0].name}</div>
            <div className="text-sm font-semibold" style={{ color: topColors[0].medal }}>
              {top3[0].xp.toLocaleString()} XP
            </div>
            <div className="h-28 sm:h-32 rounded-t-xl mt-3" style={{ background: `linear-gradient(to top, ${topColors[0].medal}30, transparent)` }} />
          </div>

          {/* 3rd Place */}
          <div className="text-center flex-1 max-w-[160px]">
            <div className="relative inline-block mb-3">
              <Avatar className="h-14 w-14 sm:h-16 sm:w-16 mx-auto border-2" style={{ borderColor: topColors[2].medal }}>
                <AvatarFallback className="font-bold" style={{ backgroundColor: `${topColors[2].medal}15`, color: topColors[2].medal }}>
                  {getInitials(top3[2].name)}
                </AvatarFallback>
              </Avatar>
              <div
                className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow text-white"
                style={{ backgroundColor: topColors[2].medal }}
              >
                3
              </div>
            </div>
            <div className="font-bold text-sm truncate">{top3[2].name}</div>
            <div className="text-xs text-muted-foreground">{top3[2].xp.toLocaleString()} XP</div>
            <div className="h-16 sm:h-20 rounded-t-xl mt-3" style={{ background: `linear-gradient(to top, ${topColors[2].medal}30, transparent)` }} />
          </div>
        </motion.div>
      )}

      {/* Rest of Leaderboard */}
      <Card>
        <div className="divide-y">
          {rest.map((entry, i) => {
            const isCurrentUser = user && user.id === entry.id;
            const lvl = Math.floor(entry.xp / 500) + 1;
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.03 }}
                className={cn(
                  "flex items-center gap-3 px-4 sm:px-5 py-3.5 transition-colors",
                  isCurrentUser ? "bg-js-yellow/5" : "hover:bg-muted/30"
                )}
              >
                <span className="w-8 text-center text-sm font-bold text-muted-foreground">
                  {entry.rank}
                </span>
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-muted text-xs font-bold">
                    {getInitials(entry.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm truncate">{entry.name}</span>
                    {isCurrentUser && (
                      <Badge className="bg-js-yellow/10 text-js-yellow border-js-yellow/20 text-[9px] h-4 px-1.5">
                        You
                      </Badge>
                    )}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Level {lvl} • {entry.streak} day streak
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-js-yellow">{entry.xp.toLocaleString()}</div>
                  <div className="text-[10px] text-muted-foreground">XP</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}