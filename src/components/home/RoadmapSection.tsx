"use client";

import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  Sprout,
  BookOpen,
  Zap,
  Trophy,
  ArrowRight,
  Code2,
  Database,
  Globe,
  Layers,
  Boxes,
  Cpu,
  Shield,
  Target,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const roadmapSteps = [
  { label: "Beginner", icon: Sprout, color: "#10B981" },
  { label: "Fundamentals", icon: Code2, color: "#38BDF8" },
  { label: "DOM Manipulation", icon: Globe, color: "#8B5CF6" },
  { label: "ES6+ Features", icon: Zap, color: "#F7DF1E" },
  { label: "Async JavaScript", icon: Layers, color: "#38BDF8" },
  { label: "APIs", icon: Database, color: "#10B981" },
  { label: "OOP", icon: Boxes, color: "#8B5CF6" },
  { label: "Data Structures", icon: Database, color: "#F43F5E" },
  { label: "Algorithms", icon: Cpu, color: "#F59E0B" },
  { label: "Advanced JS", icon: Shield, color: "#38BDF8" },
  { label: "Projects", icon: Target, color: "#10B981" },
  { label: "Interview Prep", icon: Trophy, color: "#F7DF1E" },
];

export function RoadmapSection() {
  const { navigateTo } = useAppStore();

  return (
    <section className="py-16 sm:py-24 relative overflow-hidden">
      <div className="absolute inset-0 dot-pattern opacity-30" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
            Your Learning <span className="gradient-text">Roadmap</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A structured path from absolute beginner to JavaScript expert. Each step builds on the last.
          </p>
        </motion.div>

        {/* Desktop Roadmap */}
        <div className="hidden lg:block">
          <div className="relative">
            {/* Connection Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 roadmap-line rounded-full" />

            <div className="space-y-4">
              {roadmapSteps.map((step, i) => {
                const isLeft = i % 2 === 0;
                return (
                  <motion.div
                    key={step.label}
                    initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.06 }}
                    className={cn(
                      "flex items-center gap-6",
                      isLeft ? "flex-row" : "flex-row-reverse"
                    )}
                  >
                    {/* Content Card */}
                    <div
                      className={cn(
                        "flex-1",
                        isLeft ? "text-right" : "text-left"
                      )}
                    >
                      <div className="inline-flex items-center gap-3 px-5 py-3.5 rounded-xl bg-card border border-border hover:border-opacity-60 transition-all group cursor-default"
                        style={{ borderColor: step.color + "30" }}
                      >
                        <step.icon
                          className="h-5 w-5 shrink-0"
                          style={{ color: step.color }}
                        />
                        <span className="font-semibold text-sm">
                          {step.label}
                        </span>
                        {i < 3 && (
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: step.color + "15",
                              color: step.color,
                            }}
                          >
                            Level 1
                          </span>
                        )}
                        {i >= 3 && i < 6 && (
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: step.color + "15",
                              color: step.color,
                            }}
                          >
                            Level 2
                          </span>
                        )}
                        {i >= 6 && i < 9 && (
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: step.color + "15",
                              color: step.color,
                            }}
                          >
                            Level 3
                          </span>
                        )}
                        {i >= 9 && (
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: step.color + "15",
                              color: step.color,
                            }}
                          >
                            Level 4
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Center Node */}
                    <div
                      className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 bg-background"
                      style={{ borderColor: step.color, color: step.color }}
                    >
                      <span className="text-xs font-bold">{i + 1}</span>
                    </div>

                    {/* Spacer */}
                    <div className="flex-1" />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile Roadmap */}
        <div className="lg:hidden space-y-3">
          {roadmapSteps.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="flex items-center gap-3"
            >
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 bg-background"
                style={{ borderColor: step.color, color: step.color }}
              >
                <span className="text-[10px] font-bold">{i + 1}</span>
              </div>
              <div
                className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border"
                style={{ borderColor: step.color + "30" }}
              >
                <step.icon className="h-4 w-4" style={{ color: step.color }} />
                <span className="text-sm font-medium">{step.label}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button
            onClick={() => navigateTo("courses")}
            size="lg"
            className="bg-js-yellow text-js-darker hover:bg-js-yellow/90 gap-2 font-bold rounded-xl"
          >
            Start the Journey
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}