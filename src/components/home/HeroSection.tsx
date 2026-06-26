"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import {
  Play,
  BookOpen,
  ArrowRight,
  Sparkles,
  Code2,
  Terminal,
} from "lucide-react";

export function HeroSection() {
  const { navigateTo } = useAppStore();

  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 grid-pattern opacity-40" />
      <div className="absolute top-20 left-1/4 w-72 h-72 bg-js-yellow/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-js-sky/8 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-js-violet/5 rounded-full blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-js-yellow/10 border border-js-yellow/20 text-js-yellow text-sm font-medium mb-8">
              <Sparkles className="h-4 w-4" />
              <span>100+ Interactive Lessons</span>
            </div>
          </motion.div>

          {/* JS Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-js-yellow js-glow animate-float">
              <span className="text-js-darker font-bold text-3xl sm:text-5xl">
                JS
              </span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight mb-6"
          >
            Master JavaScript{" "}
            <span className="gradient-text">From Beginner</span>
            <br />
            <span className="gradient-text">To Hero</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Learn JavaScript with interactive lessons, real-world projects, quizzes, and AI-powered tutoring. Go from zero to professional developer.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              onClick={() => navigateTo("courses")}
              size="lg"
              className="bg-js-yellow text-js-darker hover:bg-js-yellow/90 gap-2 text-base font-bold px-8 h-12 rounded-xl shadow-lg shadow-js-yellow/20"
            >
              <Play className="h-5 w-5" />
              Start Learning Free
            </Button>
            <Button
              onClick={() => navigateTo("courses")}
              variant="outline"
              size="lg"
              className="gap-2 text-base font-semibold px-8 h-12 rounded-xl border-border hover:border-js-yellow/50 hover:text-js-yellow"
            >
              <BookOpen className="h-5 w-5" />
              View Curriculum
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>

          {/* Quick Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-js-emerald" />
              <span>Beginner Friendly</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-js-sky" />
              <span>Interactive Code</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-js-violet" />
              <span>AI Tutor Included</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-js-yellow" />
              <span>Certificate on Completion</span>
            </div>
          </motion.div>
        </div>

        {/* Code Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 sm:mt-20 max-w-3xl mx-auto"
        >
          <div className="rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
            {/* Window bar */}
            <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="text-xs text-muted-foreground ml-2 font-mono">
                hero.js
              </span>
            </div>
            {/* Code */}
            <div className="p-5 sm:p-6 font-mono text-sm leading-relaxed overflow-x-auto">
              <div>
                <span className="text-js-violet">const</span>{" "}
                <span className="text-js-sky">hero</span>{" "}
                <span className="text-foreground">=</span> {"{"}
              </div>
              <div className="pl-4 sm:pl-6">
                <span className="text-js-emerald">name</span>
                <span className="text-muted-foreground">:</span>{" "}
                <span className="text-js-yellow">&quot;JavaScript Hero&quot;</span>
                <span className="text-muted-foreground">,</span>
              </div>
              <div className="pl-4 sm:pl-6">
                <span className="text-js-emerald">level</span>
                <span className="text-muted-foreground">:</span>{" "}
                <span className="text-js-sky">1</span>
                <span className="text-muted-foreground">,</span>
              </div>
              <div className="pl-4 sm:pl-6">
                <span className="text-js-emerald">xp</span>
                <span className="text-muted-foreground">:</span>{" "}
                <span className="text-js-sky">0</span>
                <span className="text-muted-foreground">,</span>
              </div>
              <div className="pl-4 sm:pl-6">
                <span className="text-js-violet">learn</span>
                <span className="text-muted-foreground">()</span> {"{"}
              </div>
              <div className="pl-8 sm:pl-12">
                <span className="text-js-violet">this</span>
                <span className="text-muted-foreground">.</span>
                <span className="text-js-emerald">xp</span> <span className="text-foreground">+=</span>{" "}
                <span className="text-js-sky">100</span>
                <span className="text-muted-foreground">;</span>
              </div>
              <div className="pl-8 sm:pl-12">
                <span className="text-js-violet">return</span> <span className="text-js-yellow">`</span>
                <span className="text-foreground">Level up! 🚀</span>
                <span className="text-js-yellow">`</span>
                <span className="text-muted-foreground">;</span>
              </div>
              <div className="pl-4 sm:pl-6">{"}"}</div>
              <div>{"}"};</div>
              <div className="mt-2">
                <span className="text-muted-foreground">{'// Start your journey →'}</span>
              </div>
              <div>
                <span className="text-js-sky">hero</span>
                <span className="text-muted-foreground">.</span>
                <span className="text-js-violet">learn</span>
                <span className="text-muted-foreground">();</span>{" "}
                <span className="text-muted-foreground">{'// "Level up! 🚀"'}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}