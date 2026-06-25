"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { Rocket, Star, ArrowRight, Quote } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Frontend Developer at Google",
    initials: "SC",
    text: "JavaScript Hero Academy took me from knowing nothing about code to landing my dream job. The interactive lessons and real projects made all the difference.",
    stars: 5,
  },
  {
    name: "Marcus Johnson",
    role: "Full-Stack Engineer",
    initials: "MJ",
    text: "The AI tutor is a game-changer. It's like having a personal mentor available 24/7. I went from beginner to building full applications in just 3 months.",
    stars: 5,
  },
  {
    name: "Priya Patel",
    role: "Freelance Developer",
    initials: "PP",
    text: "The structured curriculum and daily challenges kept me motivated. The certificate I earned helped me get my first freelance clients immediately.",
    stars: 5,
  },
];

export function TestimonialsAndCTA() {
  const { navigateTo } = useAppStore();

  return (
    <>
      {/* Testimonials */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
              Loved by <span className="gradient-text">Thousands</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Join our community of successful JavaScript developers
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-card border border-border"
              >
                <Quote className="h-8 w-8 text-js-yellow/30 mb-3" />
                <p className="text-sm leading-relaxed mb-4">{t.text}</p>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-js-yellow/10 text-js-yellow font-bold text-xs">
                      {t.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {t.role}
                    </div>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <Star
                        key={j}
                        className="h-3.5 w-3.5 text-js-yellow fill-js-yellow"
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-js-yellow/5 via-js-sky/5 to-js-violet/5" />
        <div className="absolute inset-0 dot-pattern opacity-20" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-js-yellow/10 mb-6">
            <Rocket className="h-8 w-8 text-js-yellow" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold mb-6">
            Ready to Become a{" "}
            <span className="gradient-text">JavaScript Hero?</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Start your journey today. No credit card required. Learn at your own pace with interactive lessons and real-world projects.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigateTo("courses")}
              size="lg"
              className="bg-js-yellow text-js-darker hover:bg-js-yellow/90 gap-2 text-base font-bold px-8 h-12 rounded-xl shadow-lg shadow-js-yellow/20"
            >
              Start Free Now
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button
              onClick={() => navigateTo("ai-tutor")}
              variant="outline"
              size="lg"
              className="gap-2 text-base font-semibold px-8 h-12 rounded-xl"
            >
              Try AI Tutor
            </Button>
          </div>
        </motion.div>
      </section>
    </>
  );
}