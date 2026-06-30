"use client";

import { motion } from "framer-motion";
import {
  Code2,
  Brain,
  Trophy,
  Award,
  Users,
  Zap,
  BookOpen,
  MessageCircle,
  BarChart3,
  Shield,
  Smartphone,
} from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Interactive Lessons",
    description: "Learn by doing with hands-on code examples, exercises, and real-time feedback on every lesson.",
    color: "bg-js-yellow/10 text-js-yellow",
  },
  {
    icon: Code2,
    title: "Built-in Code Playground",
    description: "Write, test, and run JavaScript code directly in your browser with our powerful code editor.",
    color: "bg-js-sky/10 text-js-sky",
  },
  {
    icon: Brain,
    title: "AI Learning Assistant",
    description: "Get instant help from our AI tutor. Explain code, fix errors, and get personalized guidance.",
    color: "bg-js-violet/10 text-js-violet",
  },
  {
    icon: Trophy,
    title: "Daily Coding Challenges",
    description: "Sharpen your skills with daily, weekly, and monthly coding challenges with XP rewards.",
    color: "bg-js-rose/10 text-js-rose",
  },
  {
    icon: BarChart3,
    title: "Progress Analytics",
    description: "Track your learning journey with detailed analytics, XP points, streaks, and achievements.",
    color: "bg-js-emerald/10 text-js-emerald",
  },
  {
    icon: Users,
    title: "Community Learning",
    description: "Join discussions, share projects, and learn together with fellow JavaScript learners.",
    color: "bg-js-orange/10 text-js-orange",
  },
  {
    icon: Award,
    title: "Certificates",
    description: "Earn professional certificates as you complete each level to showcase your achievements.",
    color: "bg-js-sky/10 text-js-sky",
  },
  {
    icon: Shield,
    title: "Interview Prep",
    description: "Prepare for JavaScript interviews with algorithm practice, design patterns, and mock tests.",
    color: "bg-js-violet/10 text-js-violet",
  },
  {
    icon: Smartphone,
    title: "Learn Anywhere",
    description: "Fully responsive design lets you learn on your phone, tablet, or desktop seamlessly.",
    color: "bg-js-emerald/10 text-js-emerald",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-16 sm:py-24 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
            Everything You Need to{" "}
            <span className="gradient-text">Become a Hero</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Our platform combines the best learning tools into one seamless experience.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-js-yellow/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-js-yellow/5"
            >
              <div
                className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${feature.color} mb-4 group-hover:scale-110 transition-transform`}
              >
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-base mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}