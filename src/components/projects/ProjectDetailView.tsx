"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { projectData } from "@/lib/project-data";
import {
  ArrowLeft,
  Clock,
  Code2,
  CheckCircle2,
  Star,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

const diffConfig: Record<string, { color: string; bg: string; accent: string; label: string }> = {
  beginner: { color: "text-emerald-500", bg: "bg-emerald-500/10", accent: "#10B981", label: "Beginner" },
  intermediate: { color: "text-js-sky", bg: "bg-js-sky/10", accent: "#38BDF8", label: "Intermediate" },
  advanced: { color: "text-js-violet", bg: "bg-js-violet/10", accent: "#8B5CF6", label: "Advanced" },
  expert: { color: "text-js-rose", bg: "bg-js-rose/10", accent: "#F43F5E", label: "Expert" },
};

export function ProjectDetailView() {
  const { currentProjectId, navigateTo } = useAppStore();

  const project = projectData.find((p) => p.id === currentProjectId);

  if (!project) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <Code2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-muted-foreground mb-4">Project not found</p>
        <Button variant="outline" onClick={() => navigateTo("projects")}>
          Back to Projects
        </Button>
      </div>
    );
  }

  const cfg = diffConfig[project.difficulty];

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Back */}
        <button
          onClick={() => navigateTo("projects")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />Back to Projects
        </button>

        {/* Header Card */}
        <Card className="overflow-hidden mb-6">
          <div className="h-1.5" style={{ background: `linear-gradient(to right, ${cfg.accent}, transparent)` }} />
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold">{project.title}</h1>
                  <Badge variant="outline" className={cn("text-[10px] border", cfg.color, cfg.bg)}>
                    {cfg.label}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  className="bg-js-yellow text-js-darker hover:bg-js-yellow/90 font-bold gap-1.5 text-sm"
                  onClick={() => navigateTo("playground")}
                >
                  <ExternalLink className="h-4 w-4" />Open in Playground
                </Button>
              </div>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap mb-4">
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{project.duration}</span>
              <span className="flex items-center gap-1"><Code2 className="h-3.5 w-3.5" />{project.steps.length} steps</span>
              <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-js-yellow" />{project.category}</span>
            </div>

            {/* Skills */}
            <div className="flex flex-wrap gap-1.5">
              {project.skills.map((skill) => (
                <span key={skill} className="text-[10px] px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Steps */}
        <Card>
          <CardContent className="p-6 sm:p-8">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-js-yellow" />
              Project Steps
            </h2>
            <div className="space-y-4">
              {project.steps.map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + idx * 0.05 }}
                  className="flex gap-4"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-js-yellow/10 border border-js-yellow/20">
                    <span className="text-xs font-bold text-js-yellow">{idx + 1}</span>
                  </div>
                  <div className="flex-1 pt-0.5">
                    <p className="text-sm leading-relaxed">{step}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Code Preview */}
            {project.codePreview && (
              <div className="mt-8">
                <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-js-sky" />
                  Code Preview
                </h3>
                <div className="rounded-xl bg-js-darker border border-border p-4 overflow-x-auto">
                  <pre className="text-xs sm:text-sm font-mono text-js-sky leading-relaxed whitespace-pre-wrap">
                    {project.codePreview}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}