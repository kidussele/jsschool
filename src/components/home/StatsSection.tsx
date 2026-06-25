"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  FolderKanban,
  HelpCircle,
  GraduationCap,
  Award,
  Trophy,
} from "lucide-react";

const stats = [
  {
    label: "Interactive Lessons",
    value: "100+",
    icon: BookOpen,
    color: "text-js-yellow",
    bgColor: "bg-js-yellow/10",
  },
  {
    label: "Real-World Projects",
    value: "20+",
    icon: FolderKanban,
    color: "text-js-sky",
    bgColor: "bg-js-sky/10",
  },
  {
    label: "Practice Quizzes",
    value: "50+",
    icon: HelpCircle,
    color: "text-js-violet",
    bgColor: "bg-js-violet/10",
  },
  {
    label: "Beginner to Advanced",
    value: "4 Levels",
    icon: GraduationCap,
    color: "text-js-emerald",
    bgColor: "bg-js-emerald/10",
  },
  {
    label: "Certificate Included",
    value: "✓",
    icon: Award,
    color: "text-js-orange",
    bgColor: "bg-js-orange/10",
  },
  {
    label: "Coding Challenges",
    value: "Daily",
    icon: Trophy,
    color: "text-js-rose",
    bgColor: "bg-js-rose/10",
  },
];

export function StatsSection() {
  return (
    <section className="py-16 sm:py-20 border-y bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="text-center p-4 sm:p-6 rounded-2xl bg-card border border-border hover:border-js-yellow/30 transition-colors group"
            >
              <div
                className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${stat.bgColor} mb-3 group-hover:scale-110 transition-transform`}
              >
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className={`text-2xl sm:text-3xl font-extrabold ${stat.color} mb-1`}>
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}