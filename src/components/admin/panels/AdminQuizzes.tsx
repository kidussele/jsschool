"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  GripVertical,
  ChevronUp,
  ChevronDown,
  HelpCircle,
  Eye,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface QuestionForm {
  question: string;
  type: "multiple_choice" | "fill_blank" | "code_challenge" | "multiple_answer";
  options: string[];
  correctAnswer: string;
  explanation: string;
  codeSnippet: string;
  points: number;
}

interface QuizListItem {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  moduleId: string | null;
  createdAt: string;
  _count: { questions: number; attempts: number };
}

interface QuizFull {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  moduleId: string | null;
  questions: {
    id: string;
    question: string;
    type: string;
    options: string | null;
    correctAnswer: string;
    explanation: string | null;
    codeSnippet: string | null;
    order: number;
    points: number;
  }[];
}

const emptyQuestion = (): QuestionForm => ({
  question: "",
  type: "multiple_choice",
  options: ["", "", "", ""],
  correctAnswer: "0",
  explanation: "",
  codeSnippet: "",
  points: 10,
});

const difficultyStyles: Record<string, string> = {
  easy: "bg-js-emerald/10 text-js-emerald",
  medium: "bg-js-yellow/10 text-js-yellow",
  hard: "bg-js-rose/10 text-js-rose",
};

const difficultyLabel: Record<string, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

const typeLabel: Record<string, string> = {
  multiple_choice: "Multiple Choice",
  fill_blank: "Fill in the Blank",
  code_challenge: "Code Challenge",
  multiple_answer: "Multiple Answer",
};

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export function AdminQuizzes() {
  /* ---- list state ---- */
  const [quizzes, setQuizzes] = useState<QuizListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<QuizFull | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  /* ---- dialog state ---- */
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  /* ---- form state ---- */
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDifficulty, setFormDifficulty] = useState("easy");
  const [formModuleId, setFormModuleId] = useState("");
  const [questions, setQuestions] = useState<QuestionForm[]>([emptyQuestion()]);

  /* ---- delete dialog ---- */
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  /* ------------------------------------------------------------------ */
  /*  Fetch quiz list                                                    */
  /* ------------------------------------------------------------------ */
  const fetchQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: "1", limit: "50" });
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/quizzes?${params}`);
      if (!res.ok) throw new Error("Failed to fetch quizzes");
      const data = await res.json();
      setQuizzes(data.quizzes || []);
      setTotal(data.total || 0);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error("Failed to load quizzes", { description: msg });
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  /* ------------------------------------------------------------------ */
  /*  Helpers for question array manipulation                             */
  /* ------------------------------------------------------------------ */
  const updateQuestion = (index: number, patch: Partial<QuestionForm>) => {
    setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, ...patch } : q)));
  };

  const addQuestion = () => {
    setQuestions((prev) => [...prev, emptyQuestion()]);
  };

  const removeQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const moveQuestion = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= questions.length) return;
    setQuestions((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const addOption = (qIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qIndex ? { ...q, options: [...q.options, ""] } : q))
    );
  };

  const removeOption = (qIndex: number, oIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        const opts = q.options.filter((_, oi) => oi !== oIndex);
        let ca = q.correctAnswer;
        // adjust correct answer index
        if (q.type === "multiple_choice") {
          const ci = parseInt(ca, 10);
          if (ci === oIndex) ca = "0";
          else if (ci > oIndex) ca = String(ci - 1);
        } else if (q.type === "multiple_answer") {
          const indices = ca
            .split(",")
            .map(Number)
            .filter((v) => v !== oIndex)
            .map((v) => (v > oIndex ? v - 1 : v));
          ca = indices.join(",");
        }
        return { ...q, options: opts, correctAnswer: ca };
      })
    );
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        const opts = [...q.options];
        opts[oIndex] = value;
        return { ...q, options: opts };
      })
    );
  };

  /* ------------------------------------------------------------------ */
  /*  Open dialog for create / edit                                      */
  /* ------------------------------------------------------------------ */
  const openCreate = () => {
    setEditingId(null);
    setFormTitle("");
    setFormDescription("");
    setFormDifficulty("easy");
    setFormModuleId("");
    setQuestions([emptyQuestion()]);
    setDialogOpen(true);
  };

  const openEdit = async (quiz: QuizListItem) => {
    try {
      setSaving(true);
      // fetch full quiz with questions
      const res = await fetch(
        `/api/admin/quizzes?questions=true&page=1&limit=1&search=${encodeURIComponent(quiz.id)}`
      );
      if (!res.ok) throw new Error("Failed to load quiz");
      const data = await res.json();
      const full: QuizFull = data.quizzes?.[0];
      if (!full) throw new Error("Quiz not found");

      setEditingId(full.id);
      setFormTitle(full.title);
      setFormDescription(full.description);
      setFormDifficulty(full.difficulty);
      setFormModuleId(full.moduleId || "");

      const qs: QuestionForm[] = (full.questions || []).map((q) => {
        let opts: string[] = [];
        try {
          opts = q.options ? JSON.parse(q.options) : [];
        } catch {
          opts = [];
        }
        return {
          question: q.question,
          type: q.type as QuestionForm["type"],
          options:
            q.type === "multiple_choice" || q.type === "multiple_answer"
              ? opts.length > 0
                ? opts
                : [""]
              : [],
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || "",
          codeSnippet: q.codeSnippet || "",
          points: q.points,
        };
      });
      setQuestions(qs.length > 0 ? qs : [emptyQuestion()]);
      setDialogOpen(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error("Failed to load quiz", { description: msg });
    } finally {
      setSaving(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /*  Save quiz                                                          */
  /* ------------------------------------------------------------------ */
  const handleSave = async () => {
    if (!formTitle.trim()) {
      toast.error("Title is required");
      return;
    }
    if (questions.length === 0) {
      toast.error("At least one question is required");
      return;
    }
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].question.trim()) {
        toast.error(`Question ${i + 1} text is required`);
        return;
      }
      const q = questions[i];
      if (q.type === "multiple_choice" || q.type === "multiple_answer") {
        if (q.options.filter((o) => o.trim()).length < 2) {
          toast.error(`Question ${i + 1} needs at least 2 options`);
          return;
        }
        if (q.type === "multiple_choice" && q.correctAnswer === "") {
          toast.error(`Question ${i + 1}: select a correct answer`);
          return;
        }
      }
      if ((q.type === "fill_blank" || q.type === "code_challenge") && !q.correctAnswer.trim()) {
        toast.error(`Question ${i + 1}: correct answer is required`);
        return;
      }
    }

    try {
      setSaving(true);
      const body = {
        title: formTitle.trim(),
        description: formDescription.trim(),
        difficulty: formDifficulty,
        moduleId: formModuleId.trim() || null,
        questions: questions.map((q) => ({
          question: q.question.trim(),
          type: q.type,
          options:
            q.type === "multiple_choice" || q.type === "multiple_answer"
              ? q.options.filter((o) => o.trim())
              : [],
          correctAnswer: q.correctAnswer,
          explanation: q.explanation.trim() || null,
          codeSnippet: q.type === "code_challenge" ? q.codeSnippet.trim() || null : null,
          points: q.points || 10,
        })),
      };

      const url = editingId
        ? "/api/admin/quizzes"
        : "/api/admin/quizzes";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { id: editingId, ...body } : body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || "Save failed");
      }

      toast.success(editingId ? "Quiz updated" : "Quiz created");
      setDialogOpen(false);
      fetchQuizzes();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error("Save failed", { description: msg });
    } finally {
      setSaving(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /*  Delete quiz                                                        */
  /* ------------------------------------------------------------------ */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/admin/quizzes?id=${encodeURIComponent(deleteTarget)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Quiz deleted");
      setDeleteTarget(null);
      fetchQuizzes();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error("Delete failed", { description: msg });
    } finally {
      setDeleting(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /*  Preview questions                                                  */
  /* ------------------------------------------------------------------ */
  const togglePreview = async (quizId: string) => {
    if (previewId === quizId) {
      setPreviewId(null);
      setPreviewData(null);
      return;
    }
    try {
      setPreviewLoading(true);
      setPreviewId(quizId);
      const res = await fetch(
        `/api/admin/quizzes?questions=true&page=1&limit=1&search=${encodeURIComponent(quizId)}`
      );
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setPreviewData(data.quizzes?.[0] || null);
    } catch {
      toast.error("Failed to load quiz questions");
      setPreviewId(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /*  Render                                                             */
  /* ------------------------------------------------------------------ */

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-js-violet" />
        <span className="ml-3 text-muted-foreground">Loading quizzes...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search quizzes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={openCreate} className="bg-js-violet text-white hover:bg-js-violet/90">
          <Plus className="h-4 w-4 mr-2" />
          Create New Quiz
        </Button>
      </div>

      {/* Count */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <HelpCircle className="h-4 w-4" />
        <span>
          {total} quiz{total !== 1 ? "zes" : ""}
        </span>
      </div>

      {/* Quiz list */}
      {quizzes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <HelpCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">No quizzes found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Create your first quiz to get started
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {quizzes.map((quiz, idx) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
            >
              <Card className="glass-card overflow-hidden" style={{ gap: 0, padding: 0 }}>
                <div className="flex items-center gap-4 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm truncate max-w-xs sm:max-w-md">
                        {quiz.title}
                      </h3>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[10px] font-medium border-0",
                          difficultyStyles[quiz.difficulty] || ""
                        )}
                      >
                        {difficultyLabel[quiz.difficulty] || quiz.difficulty}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {quiz._count.questions} question{quiz._count.questions !== 1 ? "s" : ""}
                      </Badge>
                      {quiz._count.attempts > 0 && (
                        <span className="text-[10px] text-muted-foreground">
                          {quiz._count.attempts} attempt{quiz._count.attempts !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-muted-foreground">
                        Created {new Date(quiz.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => togglePreview(quiz.id)}
                      title="Preview questions"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEdit(quiz)}
                      title="Edit quiz"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    <AlertDialog
                      open={deleteTarget === quiz.id}
                      onOpenChange={(open) => {
                        if (!open) setDeleteTarget(null);
                      }}
                    >
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(quiz.id)}
                          title="Delete quiz"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Quiz</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete &quot;{quiz.title}&quot;? This action
                            cannot be undone and will remove all associated questions and attempts.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDelete}
                            disabled={deleting}
                            className="bg-destructive text-white hover:bg-destructive/90"
                          >
                            {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                {/* Inline preview of questions */}
                <AnimatePresence>
                  {previewId === quiz.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-border px-4 py-3 max-h-96 overflow-y-auto custom-scrollbar">
                        {previewLoading ? (
                          <div className="flex items-center gap-2 py-6 justify-center">
                            <Loader2 className="h-5 w-5 animate-spin text-js-violet" />
                            <span className="text-sm text-muted-foreground">
                              Loading questions...
                            </span>
                          </div>
                        ) : previewData && previewData.questions.length > 0 ? (
                          <div className="space-y-2">
                            {previewData.questions.map((q, qi) => (
                              <div
                                key={q.id}
                                className="rounded-md border border-border/50 bg-accent/10 p-3 text-sm"
                              >
                                <div className="flex items-start gap-2">
                                  <span className="text-xs text-muted-foreground font-mono shrink-0 mt-0.5">
                                    Q{qi + 1}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium leading-snug">{q.question}</p>
                                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                      <Badge
                                        variant="secondary"
                                        className="text-[10px] border-0"
                                      >
                                        {typeLabel[q.type] || q.type}
                                      </Badge>
                                      <span className="text-[10px] text-muted-foreground">
                                        {q.points} pts
                                      </span>
                                      {(q.type === "multiple_choice" ||
                                        q.type === "multiple_answer") &&
                                        q.options && (
                                          <div className="text-[10px] text-muted-foreground">
                                            {(() => {
                                              try {
                                                const opts = JSON.parse(q.options);
                                                const ci = q.correctAnswer.split(",").map(Number);
                                                return opts.map((o: string, oi: number) => (
                                                  <span
                                                    key={oi}
                                                    className={cn(
                                                      "inline-flex items-center gap-1 mr-2",
                                                      ci.includes(oi) &&
                                                        "text-js-emerald font-medium"
                                                    )}
                                                  >
                                                    {ci.includes(oi) ? "✓" : "○"} {o}
                                                  </span>
                                                ));
                                              } catch {
                                                return null;
                                              }
                                            })()}
                                          </div>
                                        )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground py-4 text-center">
                            No questions found
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* ============================================================ */}
      {/*  Quiz Editor Dialog                                           */}
      {/* ============================================================ */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto custom-scrollbar p-0">
          <div className="sticky top-0 bg-background z-10 border-b border-border px-6 pt-6 pb-4">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Quiz" : "Create New Quiz"}
              </DialogTitle>
              <DialogDescription>
                {editingId
                  ? "Update the quiz details and questions below."
                  : "Fill in the quiz details and add questions."}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-6 pb-6 space-y-6">
            {/* Quiz details */}
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="quiz-title">Title *</Label>
                  <Input
                    id="quiz-title"
                    placeholder="e.g. JavaScript Basics Quiz"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="quiz-desc">Description</Label>
                  <Textarea
                    id="quiz-desc"
                    placeholder="Brief description of this quiz..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select value={formDifficulty} onValueChange={setFormDifficulty}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quiz-module">Module ID (optional)</Label>
                  <Input
                    id="quiz-module"
                    placeholder="e.g. mod-1-1"
                    value={formModuleId}
                    onChange={(e) => setFormModuleId(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Questions header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold">Questions</Label>
                <Badge variant="secondary" className="text-[10px]">
                  {questions.length}
                </Badge>
              </div>
            </div>

            {/* Questions list */}
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {questions.map((q, qIdx) => (
                  <motion.div
                    key={qIdx}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="rounded-lg border border-border p-4 space-y-3"
                  >
                    {/* Question header */}
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                      <span className="text-xs font-medium text-muted-foreground">
                        Q{qIdx + 1}
                      </span>
                      <Badge variant="outline" className="text-[10px] ml-auto">
                        {typeLabel[q.type] || q.type}
                      </Badge>
                      <div className="flex items-center gap-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => moveQuestion(qIdx, -1)}
                          disabled={qIdx === 0}
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => moveQuestion(qIdx, 1)}
                          disabled={qIdx === questions.length - 1}
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => removeQuestion(qIdx)}
                        disabled={questions.length <= 1}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    {/* Question text */}
                    <Textarea
                      placeholder="Enter the question..."
                      value={q.question}
                      onChange={(e) => updateQuestion(qIdx, { question: e.target.value })}
                      rows={2}
                    />

                    {/* Question type + points row */}
                    <div className="flex items-start gap-3 flex-wrap">
                      <div className="space-y-1 min-w-[180px]">
                        <Label className="text-xs text-muted-foreground">Type</Label>
                        <Select
                          value={q.type}
                          onValueChange={(v) =>
                            updateQuestion(qIdx, {
                              type: v as QuestionForm["type"],
                              options:
                                v === "multiple_choice" || v === "multiple_answer"
                                  ? q.options.length > 0
                                    ? q.options
                                    : ["", "", "", ""]
                                  : [],
                              correctAnswer:
                                v === "multiple_choice"
                                  ? "0"
                                  : v === "multiple_answer"
                                    ? ""
                                    : q.correctAnswer,
                            })
                          }
                        >
                          <SelectTrigger className="w-full h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                            <SelectItem value="multiple_answer">Multiple Answer</SelectItem>
                            <SelectItem value="fill_blank">Fill in the Blank</SelectItem>
                            <SelectItem value="code_challenge">Code Challenge</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1 w-20">
                        <Label className="text-xs text-muted-foreground">Points</Label>
                        <Input
                          type="number"
                          min={1}
                          value={q.points}
                          onChange={(e) =>
                            updateQuestion(qIdx, { points: parseInt(e.target.value, 10) || 10 })
                          }
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>

                    {/* Options for multiple_choice / multiple_answer */}
                    {(q.type === "multiple_choice" || q.type === "multiple_answer") && (
                      <div className="space-y-2 pl-1">
                        <Label className="text-xs text-muted-foreground">Options</Label>
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className="flex items-center gap-2">
                            {q.type === "multiple_choice" ? (
                              /* Radio for single correct */
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuestion(qIdx, { correctAnswer: String(oIdx) })
                                }
                                className="flex items-center justify-center"
                              >
                                <div
                                  className={cn(
                                    "h-4 w-4 rounded-full border-2 transition-colors",
                                    q.correctAnswer === String(oIdx)
                                      ? "border-js-violet bg-js-violet"
                                      : "border-muted-foreground/30"
                                  )}
                                >
                                  {q.correctAnswer === String(oIdx) && (
                                    <div className="h-1.5 w-1.5 rounded-full bg-white mx-auto mt-[1px]" />
                                  )}
                                </div>
                              </button>
                            ) : (
                              /* Checkbox for multiple correct */
                              <button
                                type="button"
                                onClick={() => {
                                  const indices = q.correctAnswer
                                    ? q.correctAnswer.split(",").map(Number)
                                    : [];
                                  const next = indices.includes(oIdx)
                                    ? indices.filter((v) => v !== oIdx)
                                    : [...indices, oIdx];
                                  updateQuestion(qIdx, {
                                    correctAnswer: next.sort((a, b) => a - b).join(","),
                                  });
                                }}
                                className="flex items-center justify-center"
                              >
                                <div
                                  className={cn(
                                    "h-4 w-4 rounded border-2 transition-colors flex items-center justify-center",
                                    q.correctAnswer
                                      .split(",")
                                      .map(Number)
                                      .includes(oIdx)
                                      ? "border-js-violet bg-js-violet"
                                      : "border-muted-foreground/30"
                                  )}
                                >
                                  {q.correctAnswer
                                    .split(",")
                                    .map(Number)
                                    .includes(oIdx) && (
                                    <svg
                                      className="h-3 w-3 text-white"
                                      viewBox="0 0 12 12"
                                      fill="none"
                                    >
                                      <path
                                        d="M2 6l3 3 5-5"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                  )}
                                </div>
                              </button>
                            )}
                            <Input
                              placeholder={`Option ${oIdx + 1}`}
                              value={opt}
                              onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                              className="h-8 text-xs flex-1"
                            />
                            {q.options.length > 2 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                                onClick={() => removeOption(qIdx, oIdx)}
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-muted-foreground"
                          onClick={() => addOption(qIdx)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add option
                        </Button>
                      </div>
                    )}

                    {/* Correct answer for fill_blank / code_challenge */}
                    {(q.type === "fill_blank" || q.type === "code_challenge") && (
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Correct Answer</Label>
                        <Input
                          placeholder="Enter the correct answer..."
                          value={q.correctAnswer}
                          onChange={(e) =>
                            updateQuestion(qIdx, { correctAnswer: e.target.value })
                          }
                          className="h-8 text-xs"
                        />
                      </div>
                    )}

                    {/* Code snippet for code_challenge */}
                    {q.type === "code_challenge" && (
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Code Snippet</Label>
                        <Textarea
                          placeholder="Paste or write the code snippet for this challenge..."
                          value={q.codeSnippet}
                          onChange={(e) =>
                            updateQuestion(qIdx, { codeSnippet: e.target.value })
                          }
                          rows={4}
                          className="font-mono text-xs"
                        />
                      </div>
                    )}

                    {/* Explanation */}
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        Explanation (optional)
                      </Label>
                      <Textarea
                        placeholder="Explain why this answer is correct..."
                        value={q.explanation}
                        onChange={(e) =>
                          updateQuestion(qIdx, { explanation: e.target.value })
                        }
                        rows={2}
                      />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Add question button */}
              <button
                type="button"
                onClick={addQuestion}
                className="w-full rounded-lg border-2 border-dashed border-muted-foreground/20 text-muted-foreground hover:border-js-violet hover:text-js-violet transition-colors py-4 flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Add Question
              </button>
            </div>
          </div>

          {/* Dialog footer */}
          <div className="sticky bottom-0 bg-background border-t border-border px-6 py-4">
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-js-violet text-white hover:bg-js-violet/90"
              >
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingId ? "Update Quiz" : "Create Quiz"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}