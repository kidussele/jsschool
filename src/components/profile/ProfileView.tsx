"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import { courseData } from "@/lib/course-data";
import { useState } from "react";
import {
  User, Settings, Zap, Trophy, Flame, Calendar,
  Edit3, Save, X, CheckCircle2, Star, BookOpen,
  Award, Target,
} from "lucide-react";

const totalLessons = courseData.reduce((a, l) => a + l.modules.reduce((b, m) => b + m.lessons.length, 0), 0);

export function ProfileView() {
  const { user, setUser, navigateTo } = useAppStore();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "JavaScript Hero");

  const xp = user?.xp ?? 0;
  const level = user?.level ?? 1;
  const streak = user?.streak ?? 0;

  const handleSave = () => {
    if (user) {
      setUser({ ...user, name });
    } else {
      setUser({ id: "demo-1", name, email: "hero@jshero.academy", xp: 0, streak: 7, level: 1 });
    }
    setEditing(false);
  };

  const handleDemoLogin = () => {
    setUser({
      id: "demo-1",
      name: "JavaScript Hero",
      email: "hero@jshero.academy",
      xp: 2450,
      streak: 7,
      level: 6,
    });
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="h-20 w-20 rounded-3xl bg-js-yellow/10 flex items-center justify-center mx-auto mb-6">
            <User className="h-10 w-10 text-js-yellow" />
          </div>
          <h1 className="text-2xl font-extrabold mb-2">Join JavaScript Hero Academy</h1>
          <p className="text-sm text-muted-foreground mb-8">Create your profile to start tracking progress and earning XP</p>
          <div className="space-y-3">
            <Button className="w-full bg-js-yellow text-js-darker hover:bg-js-yellow/90 font-bold rounded-xl h-12" onClick={handleDemoLogin}>
              Try Demo Account
            </Button>
            <p className="text-xs text-muted-foreground">This creates a local demo profile for you to explore</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <Card className="overflow-hidden">
          <div className="h-28 sm:h-36 bg-gradient-to-r from-js-yellow/20 via-js-sky/20 to-js-violet/20" />
          <CardContent className="p-6 -mt-12 sm:-mt-14">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-background shadow-lg">
                <AvatarFallback className="bg-js-yellow/20 text-js-yellow text-xl font-extrabold">
                  {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                {editing ? (
                  <div className="flex items-center gap-2 mb-1">
                    <Input value={name} onChange={(e) => setName(e.target.value)} className="h-9 max-w-xs font-bold" />
                    <Button size="sm" className="h-9 w-9 p-0 bg-emerald-500 hover:bg-emerald-600" onClick={handleSave}>
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-9 w-9 p-0" onClick={() => setEditing(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <h1 className="text-xl sm:text-2xl font-extrabold">{user.name}</h1>
                    <Badge className="bg-js-yellow/10 text-js-yellow border-js-yellow/20 text-xs">
                      Level {level}
                    </Badge>
                  </div>
                )}
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              {!editing && (
                <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => setEditing(true)}>
                  <Edit3 className="h-3.5 w-3.5" />Edit Profile
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total XP", value: xp.toLocaleString(), icon: Zap, color: "text-js-yellow", bg: "bg-js-yellow/10" },
          { label: "Level", value: level, icon: Trophy, color: "text-js-sky", bg: "bg-js-sky/10" },
          { label: "Day Streak", value: streak, icon: Flame, color: "text-js-rose", bg: "bg-js-rose/10" },
          { label: "Joined", value: "Today", icon: Calendar, color: "text-js-emerald", bg: "bg-js-emerald/10" },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
            <Card>
              <CardContent className="p-4 text-center">
                <div className={`inline-flex items-center justify-center h-10 w-10 rounded-xl ${stat.bg} mb-2`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className={`text-xl font-extrabold ${stat.color}`}>{stat.value}</div>
                <div className="text-[11px] text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Learning Progress & Achievements */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardContent className="p-5">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-js-sky" />Learning Progress
              </h3>
              <div className="space-y-3">
                {courseData.map((lvl) => {
                  const total = lvl.modules.reduce((a, m) => a + m.lessons.length, 0);
                  const done = Math.min(Math.floor((xp / 30) * (total / totalLessons)), total);
                  const pct = Math.round((done / total) * 100);
                  return (
                    <div key={lvl.id}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium">{lvl.title}</span>
                        <span className="text-muted-foreground">{pct}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: lvl.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card>
            <CardContent className="p-5">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                <Award className="h-4 w-4 text-js-yellow" />Achievements
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: "First Steps", icon: "🎯", done: xp > 0 },
                  { name: "Quick Learner", icon: "📚", done: xp >= 300 },
                  { name: "Quiz Master", icon: "🧠", done: xp >= 500 },
                  { name: "Streak King", icon: "🔥", done: streak >= 7 },
                  { name: "XP Hunter", icon: "💎", done: xp >= 1000 },
                  { name: "Halfway Hero", icon: "⭐", done: xp >= 2500 },
                ].map((a) => (
                  <div key={a.name} className={`p-2.5 rounded-lg border text-center ${a.done ? "bg-card border-js-yellow/20" : "opacity-40 bg-muted/30"}`}>
                    <div className="text-xl mb-0.5">{a.icon}</div>
                    <div className="text-[10px] font-medium">{a.name}</div>
                    {a.done && <CheckCircle2 className="h-3 w-3 text-emerald-500 mx-auto mt-1" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}