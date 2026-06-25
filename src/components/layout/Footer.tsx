"use client";

import {
  GraduationCap,
  Heart,
  Github,
  Twitter,
  Youtube,
  Mail,
  ArrowUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";

export function Footer() {
  const { navigateTo } = useAppStore();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t bg-card/50 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-js-yellow text-js-darker font-bold text-sm">
                JS
              </div>
              <div>
                <h3 className="font-bold text-sm">JavaScript Hero</h3>
                <p className="text-[10px] text-muted-foreground">Academy</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Master JavaScript from beginner to hero level with interactive
              lessons, real-world projects, and expert guidance.
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-js-yellow/10 hover:text-js-yellow">
                <Github className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-js-yellow/10 hover:text-js-yellow">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-js-yellow/10 hover:text-js-yellow">
                <Youtube className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-js-yellow/10 hover:text-js-yellow">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Learning */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Learning</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Beginner Course", view: "courses" as const },
                { label: "Code Playground", view: "playground" as const },
                { label: "Quizzes", view: "quizzes" as const },
                { label: "Projects", view: "projects" as const },
                { label: "Challenges", view: "challenges" as const },
              ].map((item) => (
                <li key={item.view}>
                  <button
                    onClick={() => { navigateTo(item.view); scrollToTop(); }}
                    className="text-sm text-muted-foreground hover:text-js-yellow transition-colors cursor-pointer"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Community</h4>
            <ul className="space-y-2.5">
              {[
                { label: "AI Tutor", view: "ai-tutor" as const },
                { label: "Discussion Forum", view: "community" as const },
                { label: "Leaderboard", view: "leaderboard" as const },
                { label: "Certificates", view: "certificates" as const },
                { label: "Dashboard", view: "dashboard" as const },
              ].map((item) => (
                <li key={item.view}>
                  <button
                    onClick={() => { navigateTo(item.view); scrollToTop(); }}
                    className="text-sm text-muted-foreground hover:text-js-yellow transition-colors cursor-pointer"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Stay Updated</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Get weekly JavaScript tips and new content notifications.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-js-yellow/50"
              />
              <Button
                size="sm"
                className="bg-js-yellow text-js-darker hover:bg-js-yellow/90 h-9 px-3 rounded-lg font-semibold text-xs"
              >
                Join
              </Button>
            </div>
            <div className="mt-4 p-3 rounded-lg bg-js-yellow/5 border border-js-yellow/10">
              <p className="text-xs text-muted-foreground">
                <span className="text-js-yellow font-semibold">100+ Lessons</span> •{" "}
                <span className="text-js-sky font-semibold">20+ Projects</span> •{" "}
                <span className="text-js-emerald font-semibold">50+ Quizzes</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} JavaScript Hero Academy. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>Built with</span>
            <Heart className="h-3 w-3 text-js-rose fill-js-rose" />
            <span>and</span>
            <span className="text-js-yellow font-bold">JavaScript</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={scrollToTop}
            className="text-xs text-muted-foreground hover:text-js-yellow gap-1"
          >
            <ArrowUp className="h-3 w-3" />
            Back to top
          </Button>
        </div>
      </div>
    </footer>
  );
}