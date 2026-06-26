"use client";

import { useMemo, useCallback, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Play,
  Copy,
  Check,
  BookOpen,
  FileCode,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Loader2,
  PanelLeftClose,
  PanelLeftOpen,
  Clock,
  StickyNote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useAppStore } from "@/lib/store";
import {
  courseData,
  type CourseLevel,
  type CourseModule,
  type CourseLesson,
} from "@/lib/course-data";
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────
interface LessonProgress {
  id: string;
  lessonId: string;
  status: string;
  xpEarned: number;
  timeSpent: number;
  completedAt: string | null;
}

interface BookmarkItem {
  id: string;
  lessonId: string | null;
  postId: string | null;
  createdAt: string;
}

// ── Helpers ──────────────────────────────────────────────────

/** Flatten every lesson with its parent references into a lookup map */
function buildLessonMap() {
  const map = new Map<
    string,
    { lesson: CourseLesson; module: CourseModule; level: CourseLevel }
  >();
  for (const level of courseData) {
    for (const mod of level.modules) {
      for (const lesson of mod.lessons) {
        map.set(lesson.id, { lesson, module: mod, level });
      }
    }
  }
  return map;
}

/** Get a sorted array of all lesson IDs for prev/next navigation */
function buildOrderedLessonIds(): {
  ids: string[];
  data: { lesson: CourseLesson; module: CourseModule; level: CourseLevel }[];
} {
  const result: {
    ids: string[];
    data: {
      lesson: CourseLesson;
      module: CourseModule;
      level: CourseLevel;
    }[];
  } = { ids: [], data: [] };
  for (const level of courseData) {
    for (const mod of level.modules) {
      const sorted = [...mod.lessons].sort((a, b) => a.order - b.order);
      for (const les of sorted) {
        result.ids.push(les.id);
        result.data.push({ lesson: les, module: mod, level });
      }
    }
  }
  return result;
}

const lessonMap = buildLessonMap();
const { ids: orderedIds, data: orderedLessons } = buildOrderedLessonIds();

// ── Code block renderer ──────────────────────────────────────
function CodeBlock({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement> & { children?: string }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const lang = match ? match[1] : "javascript";
  const code = String(children).replace(/\n$/, "");

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <div className="group/code relative my-4 overflow-hidden rounded-xl border border-border/50">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-border/50 bg-muted/40 px-4 py-2">
        <div className="flex items-center gap-2">
          <FileCode className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {lang}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 px-2 text-xs text-muted-foreground opacity-0 transition-opacity group-hover/code:opacity-100"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-500" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              Copy
            </>
          )}
        </Button>
      </div>
      <SyntaxHighlighter
        language={lang}
        style={isDark ? oneDark : oneLight}
        PreTag="div"
        customStyle={{
          margin: 0,
          padding: "1rem 1.25rem",
          fontSize: "0.85rem",
          lineHeight: "1.65",
          background: isDark ? "#1a1a2e" : "#fafafa",
        }}
        codeTagProps={{
          className: "code-editor",
        }}
        {...props}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

// ── Markdown components override ──────────────────────────────
const markdownComponents = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      className="mb-4 mt-8 text-2xl font-extrabold tracking-tight sm:text-3xl first:mt-0"
      {...props}
    />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className="mb-3 mt-7 flex items-center gap-2 text-xl font-bold sm:text-2xl"
      {...props}
    />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="mb-2 mt-5 text-lg font-semibold" {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="mb-4 leading-relaxed text-foreground/90" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="mb-4 list-disc space-y-1.5 pl-6" {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="mb-4 list-decimal space-y-1.5 pl-6" {...props} />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="text-foreground/85 leading-relaxed" {...props} />
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-bold text-foreground" {...props} />
  ),
  em: (props: React.HTMLAttributes<HTMLElement>) => (
    <em className="italic text-foreground/80" {...props} />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      className="font-medium text-[#F7DF1E] underline decoration-[#F7DF1E]/40 underline-offset-4 transition-colors hover:text-[#F7DF1E]/80 hover:decoration-[#F7DF1E]/60"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="my-4 border-l-4 border-[#F7DF1E]/50 bg-[#F7DF1E]/5 py-3 pl-4 pr-4 rounded-r-lg italic text-foreground/80"
      {...props}
    />
  ),
  table: (props: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="my-4 overflow-x-auto rounded-lg border border-border/50">
      <table className="w-full text-sm" {...props} />
    </div>
  ),
  thead: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className="border-b border-border/50 bg-muted/30" {...props} />
  ),
  th: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th
      className="px-4 py-2.5 text-left font-semibold text-foreground/80"
      {...props}
    />
  ),
  td: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td className="border-t border-border/30 px-4 py-2" {...props} />
  ),
  hr: () => <hr className="my-6 border-border/30" />,
  code: ({
    className,
    children,
    ...props
  }: React.HTMLAttributes<HTMLElement> & { children?: string }) => {
    if (className && /language-/.test(className)) {
      return <CodeBlock className={className} {...props}>{children}</CodeBlock>;
    }
    return (
      <code
        className="rounded-md bg-muted/60 px-1.5 py-0.5 text-[0.85em] font-mono text-foreground/90 border border-border/30"
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => {
    return <>{props.children}</>;
  },
};

// ── Component ────────────────────────────────────────────────────
export function LessonView() {
  const { user, currentLesson, navigateTo, setCurrentLesson, setCurrentView, setUser } =
    useAppStore();

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);

  // Backend state
  const [progressList, setProgressList] = useState<LessonProgress[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(true);

  // Timer
  const startTimeRef = useRef<number>(Date.now());
  const [timeSpentDisplay, setTimeSpentDisplay] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Resolve current lesson data
  const lessonData = useMemo(() => {
    if (!currentLesson) return null;
    return lessonMap.get(currentLesson.id) ?? null;
  }, [currentLesson]);

  // Prev / next navigation
  const { prevLesson, nextLesson } = useMemo(() => {
    if (!currentLesson) return { prevLesson: null, nextLesson: null };
    const idx = orderedIds.indexOf(currentLesson.id);
    const prev =
      idx > 0 ? orderedLessons[idx - 1] ?? null : null;
    const next =
      idx < orderedLessons.length - 1 ? orderedLessons[idx + 1] ?? null : null;
    return { prevLesson: prev, nextLesson: next };
  }, [currentLesson]);

  // ── Fetch progress, bookmarks, notes on mount / lesson change ──
  useEffect(() => {
    if (!currentLesson || !user) {
      setLoadingProgress(false);
      return;
    }

    const lessonId = currentLesson.id;
    const userId = user.id;
    let cancelled = false;

    async function fetchLessonData() {
      setLoadingProgress(true);
      try {
        const [progressRes, bookmarksRes, notesRes] = await Promise.allSettled([
          fetch(`/api/progress?userId=${userId}`),
          fetch(`/api/bookmarks?userId=${userId}`),
          fetch(`/api/progress/notes?userId=${userId}&lessonId=${lessonId}`),
        ]);

        if (cancelled) return;

        // Process progress
        if (progressRes.status === "fulfilled" && progressRes.value.ok) {
          const pData = await progressRes.value.json();
          const list: LessonProgress[] = pData.progress || [];
          setProgressList(list);
          const current = list.find((p: LessonProgress) => p.lessonId === lessonId);
          setIsCompleted(current?.status === "completed" || false);
        }

        // Process bookmarks
        if (bookmarksRes.status === "fulfilled" && bookmarksRes.value.ok) {
          const bData = await bookmarksRes.value.json();
          const bmList: BookmarkItem[] = bData.bookmarks || [];
          const found = bmList.find((b) => b.lessonId === lessonId);
          if (found) {
            setIsBookmarked(true);
            setBookmarkId(found.id);
          } else {
            setIsBookmarked(false);
            setBookmarkId(null);
          }
        }

        // Process notes
        if (notesRes.status === "fulfilled" && notesRes.value.ok) {
          const nData = await notesRes.value.json();
          if (nData.note) {
            setNoteContent(nData.note.content || "");
          } else {
            setNoteContent("");
          }
        }
      } catch {
        // Silently fail
      } finally {
        if (!cancelled) setLoadingProgress(false);
      }
    }

    fetchLessonData();

    // Auto-save as in_progress
    fetch(`/api/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        lessonId,
        status: "in_progress",
        xpEarned: 0,
        timeSpent: 0,
      }),
    }).catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [currentLesson, user]);

  // ── Time tracking ──────────────────────────────────────────
  useEffect(() => {
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setTimeSpentDisplay(elapsed);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      // Save time spent on unmount
      if (user && currentLesson) {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        if (elapsed > 0) {
          fetch(`/api/progress`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user.id,
              lessonId: currentLesson.id,
              status: isCompleted ? "completed" : "in_progress",
              xpEarned: 0,
              timeSpent: elapsed,
            }),
          }).catch(() => {});
        }
      }
    };
  }, [currentLesson, user]);

  // ── Actions ────────────────────────────────────────────────
  const saveNote = useCallback(async () => {
    if (!user || !currentLesson || savingNote) return;
    setSavingNote(true);
    try {
      await fetch("/api/progress/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          lessonId: currentLesson.id,
          content: noteContent,
        }),
      });
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 2000);
    } catch {
      // Silent fail
    } finally {
      setSavingNote(false);
    }
  }, [user, currentLesson, noteContent, savingNote]);

  const toggleBookmark = useCallback(async () => {
    if (!user || !currentLesson) return;
    try {
      if (isBookmarked && bookmarkId) {
        await fetch("/api/bookmarks", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookmarkId }),
        });
        setIsBookmarked(false);
        setBookmarkId(null);
      } else {
        const res = await fetch("/api/bookmarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            lessonId: currentLesson.id,
          }),
        });
        const data = await res.json();
        if (data.bookmark) {
          setIsBookmarked(true);
          setBookmarkId(data.bookmark.id);
        }
      }
    } catch {
      // Silent fail
    }
  }, [user, currentLesson, isBookmarked, bookmarkId]);

  const handleMarkComplete = useCallback(async () => {
    if (!user || !currentLesson || completing) return;
    setCompleting(true);
    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          lessonId: currentLesson.id,
          status: "completed",
          xpEarned: 25,
          timeSpent: elapsed,
        }),
      });
      const data = await res.json();
      setIsCompleted(true);
      if (data.xpAwarded || true) {
        setUser({ ...user, xp: user.xp + 25 });
      }
      // Update progress list
      setProgressList((prev) => {
        const idx = prev.findIndex((p) => p.lessonId === currentLesson.id);
        const entry: LessonProgress = {
          id: prev[idx]?.id || "",
          lessonId: currentLesson.id,
          status: "completed",
          xpEarned: 25,
          timeSpent: elapsed,
          completedAt: new Date().toISOString(),
        };
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = entry;
          return copy;
        }
        return [...prev, entry];
      });
    } catch {
      // Silent fail
    } finally {
      setCompleting(false);
    }
  }, [user, currentLesson, completing, setUser]);

  const goToLesson = useCallback(
    (
      target: {
        lesson: CourseLesson;
        module: CourseModule;
        level: CourseLevel;
      } | null
    ) => {
      if (!target) return;
      setCurrentLesson({
        id: target.lesson.id,
        title: target.lesson.title,
        moduleId: target.module.id,
        levelId: target.level.id,
        order: target.lesson.order,
      });
      setNotesOpen(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [setCurrentLesson]
  );

  const handleRunInPlayground = useCallback(() => {
    navigateTo("playground");
  }, [navigateTo]);

  const handleBackToCourses = useCallback(() => {
    setCurrentView("courses");
  }, [setCurrentView]);

  // ── Not found state ────────────────────────────────────────
  if (!currentLesson || !lessonData) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <BookOpen className="h-16 w-16 text-muted-foreground/30" />
        <h2 className="text-xl font-bold text-muted-foreground">
          No lesson selected
        </h2>
        <p className="max-w-md text-sm text-muted-foreground/70">
          Go back to the course list and pick a lesson to start learning.
        </p>
        <Button onClick={handleBackToCourses} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Courses
        </Button>
      </div>
    );
  }

  const { lesson, module: mod, level } = lessonData;
  const levelColor =
    level.color === "#10B981"
      ? "#10B981"
      : level.color === "#38BDF8"
        ? "#38BDF8"
        : level.color === "#8B5CF6"
          ? "#8B5CF6"
          : "#F43F5E";

  function formatTimer(s: number) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  // Build completed lesson IDs set for sidebar
  const completedIds = new Set(progressList.filter((p) => p.status === "completed").map((p) => p.lessonId));

  return (
    <AnimatePresence mode="wait">
      <motion.section
        key={lesson.id}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative min-h-screen w-full"
      >
        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute -left-32 top-0 h-72 w-72 rounded-full opacity-[0.07] blur-3xl"
            style={{ backgroundColor: levelColor }}
          />
          <div className="absolute -right-32 bottom-20 h-80 w-80 rounded-full bg-[#F7DF1E]/[0.04] blur-3xl" />
        </div>

        <div className="relative z-10 flex">
          {/* ── Sidebar (lesson list) ──────────────────────── */}
          {/* Mobile overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <aside
            className={cn(
              "fixed top-0 left-0 z-50 h-full w-72 border-r border-border/50 bg-background overflow-y-auto custom-scrollbar transition-transform duration-300 lg:relative lg:z-auto lg:translate-x-0 lg:border-r lg:bg-card/30",
              sidebarOpen
                ? "translate-x-0"
                : "-translate-x-full"
            )}
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-border/50 bg-background px-4 py-3 lg:bg-card/30">
              <span className="text-sm font-semibold">Lessons</span>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <PanelLeftClose className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-3">
              {orderedLessons.map((item, idx) => {
                const isActive = item.lesson.id === lesson.id;
                const done = completedIds.has(item.lesson.id);
                return (
                  <button
                    key={item.lesson.id}
                    onClick={() => goToLesson(item)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                      isActive
                        ? "bg-js-yellow/10 text-foreground font-medium"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                        done
                          ? "bg-emerald-500/20 text-emerald-500"
                          : isActive
                            ? "bg-js-yellow text-js-darker"
                            : "bg-muted text-muted-foreground"
                      )}
                    >
                      {done ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        idx + 1
                      )}
                    </span>
                    <span className="line-clamp-1">{item.lesson.title}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* ── Main content ─────────────────────────────── */}
          <div className="flex-1 min-w-0">
            <div className="mx-auto max-w-4xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
              {/* ── Top bar ─────────────────────────────── */}
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="lg:hidden gap-1 text-muted-foreground"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                  >
                    {sidebarOpen ? (
                      <PanelLeftClose className="h-4 w-4" />
                    ) : (
                      <PanelLeftOpen className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-muted-foreground hover:text-foreground"
                    onClick={handleBackToCourses}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Back to Courses</span>
                    <span className="sm:hidden">Back</span>
                  </Button>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Timer */}
                  <Badge variant="outline" className="gap-1.5 font-mono tabular-nums text-xs">
                    <Clock className="h-3 w-3" />
                    {formatTimer(timeSpentDisplay)}
                  </Badge>

                  {/* Bookmark toggle */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "gap-1.5",
                      isBookmarked
                        ? "text-js-yellow"
                        : "text-muted-foreground"
                    )}
                    onClick={toggleBookmark}
                  >
                    {isBookmarked ? (
                      <BookmarkCheck className="h-4 w-4" />
                    ) : (
                      <Bookmark className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline text-xs">
                      {isBookmarked ? "Bookmarked" : "Bookmark"}
                    </span>
                  </Button>

                  {/* Notes toggle */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "gap-1.5",
                      notesOpen
                        ? "text-js-sky"
                        : "text-muted-foreground"
                    )}
                    onClick={() => setNotesOpen(!notesOpen)}
                  >
                    <StickyNote className="h-4 w-4" />
                    <span className="hidden sm:inline text-xs">Notes</span>
                  </Button>

                  {lesson.codeExample && (
                    <Button
                      onClick={handleRunInPlayground}
                      className="gap-2 bg-[#F7DF1E] text-[#1E293B] font-semibold hover:bg-[#F7DF1E]/90 shadow-[0_0_20px_rgba(247,223,30,0.2)] transition-shadow hover:shadow-[0_0_30px_rgba(247,223,30,0.35)]"
                    >
                      <Play className="h-4 w-4" />
                      <span className="hidden sm:inline">Run in Playground</span>
                      <span className="sm:hidden">Run</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* ── Breadcrumbs ──────────────────────────── */}
              <Breadcrumb className="mb-6">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      className="cursor-pointer"
                      onClick={handleBackToCourses}
                    >
                      {level.title}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      className="cursor-pointer"
                      onClick={handleBackToCourses}
                    >
                      {mod.title}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="font-medium">
                      {lesson.title}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>

              {/* ── Lesson header ───────────────────────── */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="mb-8"
              >
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge
                    variant="outline"
                    className="text-xs"
                    style={{
                      borderColor: `${levelColor}40`,
                      color: levelColor,
                    }}
                  >
                    {level.title}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    Lesson {lesson.order} of {mod.lessons.length}
                  </Badge>
                  {isCompleted && (
                    <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Completed
                    </Badge>
                  )}
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
                  {lesson.title}
                </h1>
                <p className="mt-2 text-muted-foreground">
                  Module: {mod.title} — {mod.description}
                </p>
              </motion.div>

              {/* ── Notes panel ─────────────────────────── */}
              <AnimatePresence>
                {notesOpen && user && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6"
                  >
                    <Card className="border-js-sky/20">
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2 text-sm font-semibold">
                            <StickyNote className="h-4 w-4 text-js-sky" />
                            My Notes
                          </div>
                          <div className="flex items-center gap-2">
                            {noteSaved && (
                              <span className="text-xs text-emerald-500">
                                Saved
                              </span>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs gap-1"
                              onClick={saveNote}
                              disabled={savingNote}
                            >
                              {savingNote ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Check className="h-3 w-3" />
                              )}
                              Save
                            </Button>
                          </div>
                        </div>
                        <Textarea
                          value={noteContent}
                          onChange={(e) => setNoteContent(e.target.value)}
                          placeholder="Write your notes for this lesson..."
                          className="min-h-[100px] text-sm resize-y"
                        />
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Lesson content ──────────────────────── */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="glass-card rounded-2xl p-5 sm:p-8"
              >
                {loadingProgress ? (
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                  </div>
                ) : (
                  <article className="prose-custom max-w-none">
                    <ReactMarkdown components={markdownComponents}>
                      {lesson.content}
                    </ReactMarkdown>
                  </article>
                )}
              </motion.div>

              {/* ── Code Example (if separate) ────────────── */}
              {lesson.codeExample && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                  className="mt-8"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <Play className="h-4 w-4 text-[#F7DF1E]" />
                    <h3 className="text-lg font-bold">Try It Yourself</h3>
                  </div>
                  <div className="rounded-xl border border-border/50 overflow-hidden">
                    <div className="flex items-center justify-between border-b border-border/50 bg-muted/40 px-4 py-2">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        playground.js
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 gap-1.5 px-2 text-xs text-[#F7DF1E] hover:text-[#F7DF1E]/80"
                        onClick={handleRunInPlayground}
                      >
                        <Play className="h-3 w-3" />
                        Run
                      </Button>
                    </div>
                    <SyntaxHighlighter
                      language="javascript"
                      style={oneDark}
                      PreTag="div"
                      customStyle={{
                        margin: 0,
                        padding: "1.25rem",
                        fontSize: "0.85rem",
                        lineHeight: "1.65",
                        background: "#1a1a2e",
                      }}
                      codeTagProps={{ className: "code-editor" }}
                    >
                      {lesson.codeExample}
                    </SyntaxHighlighter>
                  </div>
                  <Button
                    className="mt-4 gap-2 bg-[#F7DF1E] text-[#1E293B] font-semibold hover:bg-[#F7DF1E]/90 shadow-[0_0_20px_rgba(247,223,30,0.2)] transition-shadow hover:shadow-[0_0_30px_rgba(247,223,30,0.35)]"
                    onClick={handleRunInPlayground}
                  >
                    <Play className="h-4 w-4" />
                    Open in Playground
                  </Button>
                </motion.div>
              )}

              {/* ── Mark Complete ───────────────────────── */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.32, duration: 0.3 }}
                className="mt-8 flex justify-center"
              >
                {!isCompleted && user ? (
                  <Button
                    onClick={handleMarkComplete}
                    disabled={completing}
                    className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 shadow-lg shadow-emerald-500/20"
                  >
                    {completing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    Mark Complete (+25 XP)
                  </Button>
                ) : isCompleted ? (
                  <Badge className="gap-1.5 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 px-4 py-2 text-sm">
                    <CheckCircle2 className="h-4 w-4" />
                    Lesson Completed
                  </Badge>
                ) : null}
              </motion.div>

              {/* ── Navigation ──────────────────────────── */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.3 }}
                className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <Button
                  variant="outline"
                  className="gap-2"
                  disabled={!prevLesson}
                  onClick={() => prevLesson && goToLesson(prevLesson)}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {prevLesson ? prevLesson.lesson.title : "Previous"}
                  </span>
                  <span className="sm:hidden">Previous</span>
                </Button>

                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {orderedIds.indexOf(lesson.id) + 1} of{" "}
                  {orderedIds.length} lessons
                </div>

                <Button
                  variant="outline"
                  className="gap-2"
                  disabled={!nextLesson}
                  onClick={() => nextLesson && goToLesson(nextLesson)}
                >
                  <span className="hidden sm:inline">
                    {nextLesson ? nextLesson.lesson.title : "Next"}
                  </span>
                  <span className="sm:hidden">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>
    </AnimatePresence>
  );
}