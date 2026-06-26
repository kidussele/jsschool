"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { courseData } from "@/lib/course-data";
import {
  Award,
  Printer,
  Loader2,
  CheckCircle2,
  Lock,
  Calendar,
  Shield,
  Sparkles,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

interface Certificate {
  id: string;
  certificateId: string;
  courseName: string;
  levelName: string;
  createdAt: string;
}

interface LevelProgress {
  levelId: string;
  levelTitle: string;
  totalLessons: number;
  completedLessons: number;
  allCompleted: boolean;
  hasCertificate: boolean;
}

export function CertificateView() {
  const { user, navigateTo } = useAppStore();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [levelProgress, setLevelProgress] = useState<LevelProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Fetch existing certificates from DB
      const certRes = await fetch(`/api/progress?userId=${user.id}`);
      if (certRes.ok) {
        const { progress } = await certRes.json();
        const completedLessonIds = new Set(
          (progress || [])
            .filter((p: { status: string }) => p.status === "completed")
            .map((p: { lessonId: string }) => p.lessonId)
        );

        // Build level progress
        const lp: LevelProgress[] = courseData.map((level) => {
          const allLessons = level.modules.flatMap((mod) => mod.lessons);
          const completed = allLessons.filter((l) => completedLessonIds.has(l.id));
          return {
            levelId: level.id,
            levelTitle: level.title,
            totalLessons: allLessons.length,
            completedLessons: completed.length,
            allCompleted: completed.length === allLessons.length && allLessons.length > 0,
            hasCertificate: false,
          };
        });

        // Try to fetch actual certificates from the certificates table
        try {
          // We'll check by trying to generate or by seeing which levels already have certs
          setLevelProgress(lp);
        } catch {
          setLevelProgress(lp);
        }
      }
    } catch {
      // Fallback: build from courseData with no progress
      setLevelProgress(
        courseData.map((level) => ({
          levelId: level.id,
          levelTitle: level.title,
          totalLessons: level.modules.reduce((s, m) => s + m.lessons.length, 0),
          completedLessons: 0,
          allCompleted: false,
          hasCertificate: false,
        }))
      );
    }

    // Fetch existing certificates — we'll check progress API for now
    // The certificates will be stored locally until generated
    try {
      const stored = localStorage.getItem("js-hero-certificates");
      if (stored) {
        setCertificates(JSON.parse(stored));
      }
    } catch {
      // ignore
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleGenerate = async (level: LevelProgress) => {
    if (!user) return;
    setGenerating(level.levelId);
    try {
      const res = await fetch("/api/certificates/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          courseName: "JavaScript Hero Academy",
          levelName: level.levelTitle,
        }),
      });
      const data = await res.json();

      if (res.ok && data.certificate) {
        const newCert: Certificate = {
          id: data.certificate.id,
          certificateId: data.certificate.certificateId,
          courseName: data.certificate.courseName,
          levelName: data.certificate.levelName,
          createdAt: data.certificate.createdAt,
        };

        const updated = [...certificates, newCert];
        setCertificates(updated);
        localStorage.setItem("js-hero-certificates", JSON.stringify(updated));

        // Mark this level as having a certificate
        setLevelProgress((prev) =>
          prev.map((lp) =>
            lp.levelId === level.levelId ? { ...lp, hasCertificate: true } : lp
          )
        );

        toast.success("Certificate generated! 🎉");
      } else {
        if (res.status === 409) {
          toast.info("Certificate already generated for this level");
          setLevelProgress((prev) =>
            prev.map((lp) =>
              lp.levelId === level.levelId ? { ...lp, hasCertificate: true } : lp
            )
          );
        } else {
          toast.error(data.error || "Failed to generate certificate");
        }
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setGenerating(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const levelColors: Record<string, string> = {
    Beginner: "#10B981",
    Intermediate: "#38BDF8",
    Advanced: "#8B5CF6",
    Expert: "#F43F5E",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center px-4 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <Award className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Sign In Required</h2>
          <p className="text-sm text-muted-foreground mb-4">Log in to track your certificates</p>
          <Button className="bg-js-yellow text-js-darker hover:bg-js-yellow/90 font-bold" onClick={() => navigateTo("login")}>
            Sign In
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
            <Award className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">Certificates</h1>
            <p className="text-sm text-muted-foreground">Earn certificates as you complete each learning level</p>
          </div>
        </div>
      </motion.div>

      {/* Earned Certificates */}
      {certificates.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Earned Certificates</h2>
          <div className="space-y-6">
            {certificates.map((cert, i) => {
              const color = levelColors[cert.levelName] || "#F7DF1E";
              return (
                <motion.div
                  key={cert.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + i * 0.08 }}
                >
                  {/* Certificate Card */}
                  <Card className="overflow-hidden print:shadow-none print:border-2" id={`cert-${cert.id}`}>
                    <div className="relative bg-gradient-to-br from-js-darker to-js-dark p-6 sm:p-10 text-center overflow-hidden print:bg-white print:text-black">
                      {/* Decorative border */}
                      <div
                        className="absolute inset-2 sm:inset-4 border-2 rounded-xl pointer-events-none print:border-amber-600"
                        style={{ borderColor: `${color}40` }}
                      />
                      <div
                        className="absolute inset-3 sm:inset-5 border rounded-lg pointer-events-none print:border-amber-400"
                        style={{ borderColor: `${color}20` }}
                      />

                      {/* Corner ornaments */}
                      <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 rounded-tl-md print:border-amber-500" style={{ borderColor: color }} />
                      <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 rounded-tr-md print:border-amber-500" style={{ borderColor: color }} />
                      <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 rounded-bl-md print:border-amber-500" style={{ borderColor: color }} />
                      <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 rounded-br-md print:border-amber-500" style={{ borderColor: color }} />

                      <div className="relative z-10">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-js-yellow mb-4 shadow-lg shadow-js-yellow/20 print:shadow-none">
                          <span className="text-js-darker font-extrabold text-xl">JS</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <Sparkles className="h-4 w-4 text-js-yellow print:text-amber-500" />
                          <h3 className="text-xs uppercase tracking-[0.2em] text-js-yellow/80 print:text-amber-600 font-semibold">
                            Certificate of Completion
                          </h3>
                          <Sparkles className="h-4 w-4 text-js-yellow print:text-amber-500" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-3 print:text-black">
                          {cert.levelName} JavaScript
                        </h2>
                        <p className="text-sm text-muted-foreground mb-1 print:text-gray-600">
                          This certifies that
                        </p>
                        <p className="text-lg sm:text-xl font-bold text-white mb-1 print:text-black">
                          {user.name || "JavaScript Hero"}
                        </p>
                        <p className="text-sm text-muted-foreground mb-5 print:text-gray-600">
                          has successfully completed all requirements for the {cert.levelName} level
                        </p>
                        <div className="flex items-center justify-center gap-4 sm:gap-6 text-xs text-muted-foreground print:text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(cert.createdAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Shield className="h-3.5 w-3.5" />
                            {cert.certificateId}
                          </span>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span className="text-xs font-medium text-emerald-500">Completed</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs gap-1.5 text-muted-foreground hover:text-foreground print:hidden"
                        onClick={handlePrint}
                      >
                        <Printer className="h-3.5 w-3.5" />Print
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Level Progress — Generate Certificates */}
      {user && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            {certificates.length > 0 ? "Available Certificates" : "Your Progress"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {levelProgress.map((lp, i) => {
              const color = levelColors[lp.levelTitle] || "#F7DF1E";
              const hasCert = certificates.some((c) => c.levelName === lp.levelTitle);
              const canGenerate = lp.allCompleted && !hasCert;

              return (
                <motion.div
                  key={lp.levelId}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + i * 0.06 }}
                >
                  <Card className={hasCert ? "border-emerald-500/20" : lp.allCompleted ? "border-js-yellow/30" : "opacity-70"}>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-lg"
                          style={{ backgroundColor: `${color}15` }}
                        >
                          {hasCert ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          ) : lp.allCompleted ? (
                            <Award className="h-4 w-4" style={{ color }} />
                          ) : (
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-sm">{lp.levelTitle} Level</h3>
                          <p className="text-xs text-muted-foreground">
                            {lp.completedLessons}/{lp.totalLessons} lessons completed
                          </p>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-1.5 rounded-full bg-muted mb-4">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${lp.totalLessons > 0 ? (lp.completedLessons / lp.totalLessons) * 100 : 0}%`,
                            backgroundColor: color,
                          }}
                        />
                      </div>

                      {hasCert ? (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-emerald-500 font-medium flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />Certificate Earned
                          </span>
                        </div>
                      ) : canGenerate ? (
                        <Button
                          size="sm"
                          className="w-full bg-js-yellow text-js-darker hover:bg-js-yellow/90 font-bold gap-1.5 text-xs"
                          onClick={() => handleGenerate(lp)}
                          disabled={generating === lp.levelId}
                        >
                          {generating === lp.levelId ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Award className="h-3.5 w-3.5" />
                          )}
                          Generate Certificate
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-xs"
                          onClick={() => navigateTo("courses")}
                        >
                          {lp.completedLessons > 0 ? "Continue Learning" : "Start Learning"}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {certificates.length === 0 && !loading && (
        <div className="text-center py-12">
          <Award className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            Complete all lessons in a level to earn your first certificate!
          </p>
        </div>
      )}
    </div>
  );
}