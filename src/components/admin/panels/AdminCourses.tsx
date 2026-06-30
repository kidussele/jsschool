"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Layers,
  FileText,
  Clock,
  Code2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface LessonData {
  id: string;
  title: string;
  duration: string;
  type: string;
  hasCodeExamples: boolean;
  contentLength: number;
}

interface ModuleData {
  id: string;
  title: string;
  lessonCount: number;
  lessons: LessonData[];
}

interface CourseData {
  id: string;
  title: string;
  description: string;
  icon: string;
  difficulty: string;
  totalLessons: number;
  totalModules: number;
  modules: ModuleData[];
}

const difficultyStyles: Record<string, string> = {
  beginner: "bg-js-emerald/10 text-js-emerald",
  intermediate: "bg-js-yellow/10 text-js-yellow",
  advanced: "bg-js-rose/10 text-js-rose",
};

const difficultyLabel: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

const typeStyles: Record<string, string> = {
  lesson: "",
  exercise: "bg-js-sky/10 text-js-sky",
  quiz: "bg-js-violet/10 text-js-violet",
};

const typeLabel: Record<string, string> = {
  lesson: "Lesson",
  exercise: "Exercise",
  quiz: "Quiz",
};

export function AdminCourses() {
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/courses");
      if (!res.ok) throw new Error("Failed to fetch courses");
      const data = await res.json();
      setCourses(data.courses || []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
      toast.error("Failed to load courses", { description: msg });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const toggleCourse = (courseId: string) => {
    setExpandedCourses((prev) => {
      const next = new Set(prev);
      if (next.has(courseId)) {
        next.delete(courseId);
      } else {
        next.add(courseId);
      }
      return next;
    });
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-js-yellow" />
        <span className="ml-3 text-muted-foreground">Loading courses...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="h-10 w-10 text-destructive mb-4" />
        <p className="text-muted-foreground mb-2">Failed to load courses</p>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <button
          onClick={fetchCourses}
          className="text-sm text-js-yellow hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Course count */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <BookOpen className="h-4 w-4" />
        <span>
          {filteredCourses.length} course{filteredCourses.length !== 1 ? "s" : ""}
        </span>
        {search && (
          <span>
            {" "}
            (filtered from {courses.length})
          </span>
        )}
      </div>

      {/* Course list */}
      {filteredCourses.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">No courses found</p>
          {search && (
            <p className="text-sm text-muted-foreground mt-1">
              Try a different search term
            </p>
          )}
        </motion.div>
      ) : (
        <div className="space-y-4">
          {filteredCourses.map((course, idx) => {
            const isExpanded = expandedCourses.has(course.id);
            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="glass-card overflow-hidden" style={{ gap: 0, padding: 0 }}>
                  {/* Course header */}
                  <button
                    onClick={() => toggleCourse(course.id)}
                    className="w-full flex items-center gap-4 p-4 sm:p-6 text-left hover:bg-accent/30 transition-colors cursor-pointer"
                  >
                    <span className="text-2xl shrink-0">{course.icon}</span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm sm:text-base">
                          {course.title}
                        </h3>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-[10px] font-medium border-0",
                            difficultyStyles[course.difficulty] || ""
                          )}
                        >
                          {difficultyLabel[course.difficulty] || course.difficulty}
                        </Badge>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 line-clamp-1">
                        {course.description}
                      </p>
                    </div>

                    <div className="hidden sm:flex items-center gap-4 shrink-0 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Layers className="h-3.5 w-3.5" />
                        {course.totalModules} module{course.totalModules !== 1 ? "s" : ""}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" />
                        {course.totalLessons} lesson{course.totalLessons !== 1 ? "s" : ""}
                      </span>
                    </div>

                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="shrink-0"
                    >
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    </motion.div>
                  </button>

                  {/* Expanded content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-border">
                          {/* Mobile stats */}
                          <div className="flex items-center gap-4 px-4 sm:px-6 py-3 sm:hidden text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Layers className="h-3.5 w-3.5" />
                              {course.totalModules} module{course.totalModules !== 1 ? "s" : ""}
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="h-3.5 w-3.5" />
                              {course.totalLessons} lesson{course.totalLessons !== 1 ? "s" : ""}
                            </span>
                          </div>

                          {/* Modules */}
                          <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-3">
                            {course.modules.map((mod) => {
                              const isModExpanded = expandedModules.has(
                                `${course.id}-${mod.id}`
                              );
                              return (
                                <div
                                  key={mod.id}
                                  className="rounded-lg border border-border/60 bg-background/50 overflow-hidden"
                                >
                                  {/* Module header */}
                                  <button
                                    onClick={() =>
                                      toggleModule(`${course.id}-${mod.id}`)
                                    }
                                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-accent/20 transition-colors cursor-pointer"
                                  >
                                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-js-sky/10 shrink-0">
                                      <Layers className="h-3.5 w-3.5 text-js-sky" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <span className="text-sm font-medium">
                                        {mod.title}
                                      </span>
                                    </div>
                                    <span className="text-xs text-muted-foreground shrink-0">
                                      {mod.lessonCount} lesson{mod.lessonCount !== 1 ? "s" : ""}
                                    </span>
                                    <motion.div
                                      animate={{
                                        rotate: isModExpanded ? 180 : 0,
                                      }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                    </motion.div>
                                  </button>

                                  {/* Module lessons */}
                                  <AnimatePresence>
                                    {isModExpanded && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{
                                          duration: 0.25,
                                          ease: "easeInOut",
                                        }}
                                        className="overflow-hidden"
                                      >
                                        <div className="border-t border-border/40 px-4 py-2 space-y-1">
                                          {mod.lessons.map((lesson, lIdx) => (
                                            <motion.div
                                              key={lesson.id}
                                              initial={{ opacity: 0, x: -8 }}
                                              animate={{ opacity: 1, x: 0 }}
                                              transition={{ delay: lIdx * 0.03 }}
                                              className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-accent/20 transition-colors"
                                            >
                                              <span className="text-xs text-muted-foreground w-5 text-right shrink-0">
                                                {lIdx + 1}.
                                              </span>
                                              <div className="flex-1 min-w-0">
                                                <p className="text-sm truncate">
                                                  {lesson.title}
                                                </p>
                                              </div>
                                              <div className="flex items-center gap-2 shrink-0">
                                                {lesson.hasCodeExamples && (
                                                  <Code2 className="h-3.5 w-3.5 text-js-yellow" />
                                                )}
                                                <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                                                  <Clock className="h-3 w-3" />
                                                  {lesson.duration}
                                                </span>
                                                <Badge
                                                  variant="secondary"
                                                  className={cn(
                                                    "text-[10px] border-0 px-1.5 py-0",
                                                    typeStyles[lesson.type] || ""
                                                  )}
                                                >
                                                  {typeLabel[lesson.type] ||
                                                    lesson.type}
                                                </Badge>
                                                <span className="text-[10px] text-muted-foreground hidden sm:inline">
                                                  {lesson.contentLength.toLocaleString()} chars
                                                </span>
                                              </div>
                                            </motion.div>
                                          ))}
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}