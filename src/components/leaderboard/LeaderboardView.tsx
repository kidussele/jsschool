"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Trophy, Medal, Zap, Crown, Star, TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

const leaderboardData = [
  { rank: 1, name: "Alex Developer", xp: 12450, level: 25, streak: 42, initials: "AD", badge: "bg-yellow-500/10 text-yellow-500" },
  { rank: 2, name: "Sarah Chen", xp: 11200, level: 23, streak: 38, initials: "SC", badge: "bg-slate-400/10 text-slate-400" },
  { rank: 3, name: "Marcus Johnson", xp: 10800, level: 22, streak: 35, initials: "MJ", badge: "bg-amber-600/10 text-amber-600" },
  { rank: 4, name: "Priya Patel", xp: 9650, level: 20, streak: 28, initials: "PP", badge: "" },
  { rank: 5, name: "Jordan Rivera", xp: 8900, level: 18, streak: 31, initials: "JR", badge: "" },
  { rank: 6, name: "Emma Liu", xp: 8200, level: 17, streak: 24, initials: "EL", badge: "" },
  { rank: 7, name: "Kai Nakamura", xp: 7600, level: 16, streak: 20, initials: "KN", badge: "" },
  { rank: 8, name: "Olivia Brown", xp: 7100, level: 15, streak: 19, initials: "OB", badge: "" },
  { rank: 9, name: "Liam Wilson", xp: 6500, level: 14, streak: 15, initials: "LW", badge: "" },
  { rank: 10, name: "Zara Ahmed", xp: 5900, level: 12, streak: 12, initials: "ZA", badge: "" },
  { rank: 11, name: "Noah Garcia", xp: 5300, level: 11, streak: 10, initials: "NG", badge: "" },
  { rank: 12, name: "Mia Taylor", xp: 4800, level: 10, streak: 9, initials: "MT", badge: "" },
  { rank: 13, name: "Chris Lee", xp: 4200, level: 9, streak: 7, initials: "CL", badge: "" },
  { rank: 14, name: "Ava Martinez", xp: 3600, level: 8, streak: 5, initials: "AM", badge: "" },
  { rank: 15, name: "James Kim", xp: 3000, level: 7, streak: 4, initials: "JK", badge: "" },
];

export function LeaderboardView() {
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

      {/* Top 3 Podium */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex items-end justify-center gap-3 sm:gap-5 mb-8 px-4">
        {/* 2nd Place */}
        <div className="text-center flex-1 max-w-[160px]">
          <div className="relative inline-block mb-3">
            <Avatar className="h-14 w-14 sm:h-16 sm:w-16 mx-auto border-2 border-slate-400">
              <AvatarFallback className="bg-slate-400/10 text-slate-400 font-bold">{leaderboardData[1].initials}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-slate-400 text-white flex items-center justify-center text-[10px] font-bold shadow">2</div>
          </div>
          <div className="font-bold text-sm truncate">{leaderboardData[1].name}</div>
          <div className="text-xs text-muted-foreground">{leaderboardData[1].xp.toLocaleString()} XP</div>
          <div className="h-20 sm:h-24 bg-gradient-to-t from-slate-400/20 to-transparent rounded-t-xl mt-3" />
        </div>

        {/* 1st Place */}
        <div className="text-center flex-1 max-w-[180px]">
          <div className="relative inline-block mb-3">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2">
              <Crown className="h-6 w-6 text-yellow-500" />
            </div>
            <Avatar className="h-18 w-18 sm:h-20 sm:w-20 mx-auto border-2 border-yellow-500 shadow-lg shadow-yellow-500/20">
              <AvatarFallback className="bg-yellow-500/10 text-yellow-500 font-bold text-lg">{leaderboardData[0].initials}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-yellow-500 text-white flex items-center justify-center text-xs font-bold shadow-lg">1</div>
          </div>
          <div className="font-bold text-base truncate">{leaderboardData[0].name}</div>
          <div className="text-sm font-semibold text-yellow-500">{leaderboardData[0].xp.toLocaleString()} XP</div>
          <div className="h-28 sm:h-32 bg-gradient-to-t from-yellow-500/20 to-transparent rounded-t-xl mt-3" />
        </div>

        {/* 3rd Place */}
        <div className="text-center flex-1 max-w-[160px]">
          <div className="relative inline-block mb-3">
            <Avatar className="h-14 w-14 sm:h-16 sm:w-16 mx-auto border-2 border-amber-600">
              <AvatarFallback className="bg-amber-600/10 text-amber-600 font-bold">{leaderboardData[2].initials}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-bold shadow">3</div>
          </div>
          <div className="font-bold text-sm truncate">{leaderboardData[2].name}</div>
          <div className="text-xs text-muted-foreground">{leaderboardData[2].xp.toLocaleString()} XP</div>
          <div className="h-16 sm:h-20 bg-gradient-to-t from-amber-600/20 to-transparent rounded-t-xl mt-3" />
        </div>
      </motion.div>

      {/* Rest of Leaderboard */}
      <Card>
        <div className="divide-y">
          {leaderboardData.slice(3).map((user, i) => (
            <motion.div
              key={user.rank}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.03 }}
              className="flex items-center gap-3 px-4 sm:px-5 py-3.5 hover:bg-muted/30 transition-colors"
            >
              <span className="w-8 text-center text-sm font-bold text-muted-foreground">{user.rank}</span>
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-muted text-xs font-bold">{user.initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{user.name}</div>
                <div className="text-[11px] text-muted-foreground">Level {user.level} • {user.streak} day streak</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-js-yellow">{user.xp.toLocaleString()}</div>
                <div className="text-[10px] text-muted-foreground">XP</div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
}