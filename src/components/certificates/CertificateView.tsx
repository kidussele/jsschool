"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import {
  Award, Download, CheckCircle2, Shield, Calendar,
  ExternalLink,
} from "lucide-react";

const certificates = [
  {
    id: "CERT-2024-001",
    title: "JavaScript Fundamentals",
    level: "Beginner",
    date: "2024-01-15",
    status: "earned" as const,
    skills: ["Variables", "Functions", "DOM", "Events"],
  },
  {
    id: "CERT-2024-002",
    title: "Intermediate JavaScript",
    level: "Intermediate",
    date: "2024-03-20",
    status: "earned" as const,
    skills: ["Arrays", "Objects", "Fetch API", "Async/Await"],
  },
  {
    id: "CERT-2024-003",
    title: "Advanced JavaScript & ES6+",
    level: "Advanced",
    date: "",
    status: "locked" as const,
    skills: ["Classes", "Modules", "Promises", "Generators"],
  },
  {
    id: "CERT-2024-004",
    title: "JavaScript Expert",
    level: "Expert",
    date: "",
    status: "locked" as const,
    skills: ["OOP", "Algorithms", "Design Patterns", "Performance"],
  },
];

export function CertificateView() {
  const { user, navigateTo } = useAppStore();

  const earnedCerts = certificates.filter((c) => c.status === "earned");
  const lockedCerts = certificates.filter((c) => c.status === "locked");

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-js-orange/10">
            <Award className="h-5 w-5 text-js-orange" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">Certificates</h1>
            <p className="text-sm text-muted-foreground">Earn certificates as you complete each learning level</p>
          </div>
        </div>
      </motion.div>

      {/* Earned Certificates */}
      {earnedCerts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Earned Certificates</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {earnedCerts.map((cert, i) => (
              <motion.div key={cert.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.08 }}>
                <Card className="overflow-hidden hover:border-js-yellow/30 transition-colors">
                  <div className="h-1.5 bg-gradient-to-r from-js-yellow via-js-orange to-js-yellow" />
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        <span className="text-xs font-medium text-emerald-500">Completed</span>
                      </div>
                      <Button size="sm" variant="ghost" className="text-xs gap-1 text-js-yellow hover:bg-js-yellow/10">
                        <Download className="h-3.5 w-3.5" />Download
                      </Button>
                    </div>
                    <h3 className="font-bold text-base mb-1">{cert.title}</h3>
                    <p className="text-xs text-muted-foreground mb-3">Issued: {cert.date} • ID: {cert.id}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {cert.skills.map((s) => (
                        <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-js-yellow/10 text-js-yellow font-medium">{s}</span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Locked Certificates */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Locked Certificates</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {lockedCerts.map((cert, i) => (
            <motion.div key={cert.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }}>
              <Card className="opacity-50">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="h-5 w-5 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">Locked</span>
                  </div>
                  <h3 className="font-bold text-base mb-1">{cert.title}</h3>
                  <p className="text-xs text-muted-foreground mb-3">Complete all {cert.level.toLowerCase()} level modules to unlock</p>
                  <div className="flex flex-wrap gap-1.5">
                    {cert.skills.map((s) => (
                      <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{s}</span>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-4 w-full text-xs"
                    onClick={() => navigateTo("courses")}
                  >
                    Start Learning to Unlock
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Certificate Preview */}
      {earnedCerts.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-8">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-gradient-to-br from-js-darker to-js-dark p-8 sm:p-12 text-center relative overflow-hidden">
                <div className="absolute inset-0 dot-pattern opacity-5" />
                <div className="relative">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-js-yellow mb-6 shadow-lg shadow-js-yellow/20">
                    <span className="text-js-darker font-extrabold text-2xl">JS</span>
                  </div>
                  <h3 className="text-xs uppercase tracking-widest text-js-yellow/80 mb-2">Certificate of Completion</h3>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
                    JavaScript Fundamentals
                  </h2>
                  <p className="text-muted-foreground mb-1">This certifies that</p>
                  <p className="text-xl font-bold text-white mb-1">
                    {user?.name || "JavaScript Hero"}
                  </p>
                  <p className="text-sm text-muted-foreground mb-6">
                    has successfully completed all requirements for the {earnedCerts[0].level} level
                  </p>
                  <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{earnedCerts[0].date}</span>
                    <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5" />{earnedCerts[0].id}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}