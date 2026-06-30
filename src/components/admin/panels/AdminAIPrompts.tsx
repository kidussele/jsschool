"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
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
} from "@/components/ui/dialog";

interface AIPrompt {
  id: string;
  name: string;
  description: string | null;
  systemPrompt: string;
  category: string;
  isActive: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES = ["All", "general", "tutoring", "code_review", "quiz_generation", "lesson_content"] as const;

const categoryColors: Record<string, string> = {
  general: "",
  tutoring: "bg-js-sky/10 text-js-sky border-js-sky/20",
  code_review: "bg-js-emerald/10 text-js-emerald border-js-emerald/20",
  quiz_generation: "bg-js-violet/10 text-js-violet border-js-violet/20",
  lesson_content: "bg-js-orange/10 text-js-orange border-js-orange/20",
};

const categoryLabels: Record<string, string> = {
  general: "General",
  tutoring: "Tutoring",
  code_review: "Code Review",
  quiz_generation: "Quiz Generation",
  lesson_content: "Lesson Content",
};

const emptyForm = {
  name: "",
  description: "",
  systemPrompt: "",
  category: "general",
  isActive: true,
};

export function AdminAIPrompts() {
  const [prompts, setPrompts] = useState<AIPrompt[]>([]);
  const [total, setTotal] = useState(0);
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchPrompts = useCallback(async () => {
    setLoading(true);
    try {
      const catParam = category === "All" ? "" : `&category=${category}`;
      const res = await fetch(`/api/admin/ai-prompts?page=1&limit=50${catParam}`);
      if (!res.ok) throw new Error("Failed to fetch prompts");
      const data = await res.json();
      setPrompts(data.prompts || []);
      setTotal(data.total || 0);
    } catch {
      toast.error("Failed to load AI prompts");
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (prompt: AIPrompt) => {
    setEditingId(prompt.id);
    setForm({
      name: prompt.name,
      description: prompt.description || "",
      systemPrompt: prompt.systemPrompt,
      category: prompt.category,
      isActive: prompt.isActive,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!form.systemPrompt.trim()) {
      toast.error("System prompt is required");
      return;
    }

    setSaving(true);
    try {
      const url = "/api/admin/ai-prompts";
      const method = editingId ? "PUT" : "POST";
      const body = editingId
        ? { id: editingId, ...form }
        : form;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Save failed");
      toast.success(editingId ? "Prompt updated" : "Prompt created");
      setDialogOpen(false);
      fetchPrompts();
    } catch {
      toast.error("Failed to save prompt");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/admin/ai-prompts?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast.success(`Deleted "${name}"`);
      setPrompts((prev) => prev.filter((p) => p.id !== id));
      setTotal((prev) => prev - 1);
    } catch {
      toast.error(`Failed to delete "${name}"`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Create button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat}
              variant={category === cat ? "default" : "outline"}
              size="sm"
              className={cn(
                category === cat && "bg-js-yellow text-js-dark hover:bg-js-yellow/90"
              )}
              onClick={() => setCategory(cat)}
            >
              {cat === "All" ? "All" : categoryLabels[cat] || cat}
            </Button>
          ))}
        </div>
        <Button onClick={openCreate} className="gap-2 bg-js-yellow text-js-dark hover:bg-js-yellow/90">
          <Plus className="h-4 w-4" />
          Create New Prompt
        </Button>
      </motion.div>

      {/* Prompt List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      ) : prompts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <Sparkles className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-muted-foreground">No AI prompts found</p>
          <p className="text-xs text-muted-foreground mt-1">Create your first prompt template</p>
        </motion.div>
      ) : (
        <div className="grid gap-3">
          {prompts.map((prompt, i) => (
            <motion.div
              key={prompt.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.2 }}
            >
              <Card className="glass-card">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm">{prompt.name}</h3>
                        <Badge
                          variant="outline"
                          className={cn("text-[10px] px-1.5 py-0", categoryColors[prompt.category])}
                        >
                          {categoryLabels[prompt.category] || prompt.category}
                        </Badge>
                        <div className="flex items-center gap-1.5">
                          <div
                            className={cn(
                              "h-2 w-2 rounded-full",
                              prompt.isActive ? "bg-green-500" : "bg-gray-400"
                            )}
                          />
                          <span className="text-[10px] text-muted-foreground">
                            {prompt.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                      {prompt.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {prompt.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span>{prompt.usageCount} uses</span>
                        <span>
                          {new Date(prompt.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEdit(prompt)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(prompt.id, prompt.name)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Prompt" : "Create New Prompt"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update the AI system prompt template."
                : "Define a new AI system prompt template."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="prompt-name">Name</Label>
              <Input
                id="prompt-name"
                placeholder="e.g., JavaScript Tutoring Assistant"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prompt-desc">Description</Label>
              <Textarea
                id="prompt-desc"
                placeholder="Brief description of this prompt's purpose..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prompt-system">System Prompt</Label>
              <Textarea
                id="prompt-system"
                placeholder="You are a JavaScript tutoring assistant..."
                value={form.systemPrompt}
                onChange={(e) => setForm({ ...form, systemPrompt: e.target.value })}
                className="font-mono text-xs min-h-[200px]"
                rows={10}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(val) => setForm({ ...form, category: val })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {categoryLabels[cat]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-3 pt-6">
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
                />
                <Label className="text-sm">
                  {form.isActive ? "Active" : "Inactive"}
                </Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-js-yellow text-js-dark hover:bg-js-yellow/90"
            >
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingId ? "Update" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}