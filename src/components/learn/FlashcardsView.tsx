"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, Shuffle, Search, CheckCircle2, RotateCcw, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { flashcardData, type Flashcard } from "@/lib/flashcard-data";

const STORAGE_KEY = "js-hero-known-cards";

function loadKnown(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

function saveKnown(set: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch { /* ignore */ }
}

const diffColor: Record<string, string> = {
  beginner: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  intermediate: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  advanced: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
};

const categories = [...new Set(flashcardData.map((c) => c.category))];

function FlipCard({
  card,
  isFlipped,
  isKnown,
  onFlip,
  onKnown,
}: {
  card: Flashcard;
  isFlipped: boolean;
  isKnown: boolean;
  onFlip: () => void;
  onKnown: () => void;
}) {
  return (
    <div
      className="group relative h-72 cursor-pointer [perspective:1000px]"
      onClick={onFlip}
      onKeyDown={(e) => e.key === "Enter" && onFlip()}
      role="button"
      tabIndex={0}
    >
      <motion.div
        className="relative h-full w-full [transform-style:preserve-3d]"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Front */}
        <div className="absolute inset-0 [backface-visibility:hidden] flex flex-col rounded-xl border border-border/50 bg-card p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Badge variant="outline" className="text-[10px]">
              {card.category}
            </Badge>
            <Badge variant="outline" className={`text-[10px] ${diffColor[card.difficulty]}`}>
              {card.difficulty}
            </Badge>
          </div>
          <div className="flex-1 flex items-center">
            <p className="text-sm font-medium leading-relaxed text-foreground/90">
              {card.front}
            </p>
          </div>
          <p className="mt-3 text-center text-[11px] text-muted-foreground">
            Click to reveal answer
          </p>
        </div>

        {/* Back */}
        <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col overflow-hidden rounded-xl border border-border/50 bg-card p-5 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <Badge variant="outline" className="text-[10px]">
              {card.category}
            </Badge>
            <Button
              size="sm"
              variant={isKnown ? "outline" : "ghost"}
              className={
                isKnown
                  ? "h-7 gap-1 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                  : "h-7 gap-1"
              }
              onClick={(e) => {
                e.stopPropagation();
                onKnown();
              }}
            >
              <CheckCircle2 className="size-3" />
              {isKnown ? "Known" : "Mark Known"}
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <p className="mb-3 text-sm leading-relaxed text-foreground/90">
              {card.back}
            </p>
            {card.code && (
              <pre className="rounded-lg bg-js-darker p-3 text-xs leading-relaxed text-foreground/80 code-editor overflow-x-auto">
                {card.code}
              </pre>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function FlashcardsView() {
  const [flipped, setFlipped] = useState<Set<string>>(new Set());
  const [known, setKnown] = useState<Set<string>>(loadKnown);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [shuffled, setShuffled] = useState(false);

  useEffect(() => {
    saveKnown(known);
  }, [known]);

  const toggleFlip = useCallback((id: string) => {
    setFlipped((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleKnown = useCallback((id: string) => {
    setKnown((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const filtered = useMemo(() => {
    let cards = [...flashcardData];
    if (activeCategory) cards = cards.filter((c) => c.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      cards = cards.filter(
        (c) =>
          c.front.toLowerCase().includes(q) ||
          c.back.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)
      );
    }
    if (shuffled) cards.sort(() => Math.random() - 0.5);
    return cards;
  }, [activeCategory, search, shuffled]);

  const progress = flashcardData.length > 0 ? (known.size / flashcardData.length) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-js-yellow/15">
            <Layers className="size-5 text-js-yellow" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Flashcards</h2>
            <p className="text-xs text-muted-foreground">
              {flashcardData.length} cards · {known.size} mastered
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => setShuffled((s) => !s)}
          >
            <Shuffle className="size-3.5" />
            Shuffle
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => setKnown(new Set())}
          >
            <RotateCcw className="size-3.5" />
            Reset
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span>{known.size}/{flashcardData.length} mastered</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-js-yellow to-js-emerald"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search flashcards..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Button
            size="sm"
            variant={activeCategory === null ? "default" : "outline"}
            className={
              activeCategory === null
                ? "bg-js-yellow text-js-darker hover:bg-js-yellow/90 text-xs"
                : "text-xs"
            }
            onClick={() => setActiveCategory(null)}
          >
            <Filter className="mr-1 size-3" />
            All
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              size="sm"
              variant={activeCategory === cat ? "default" : "outline"}
              className={
                activeCategory === cat
                  ? "bg-js-yellow text-js-darker hover:bg-js-yellow/90 text-xs"
                  : "text-xs"
              }
              onClick={() =>
                setActiveCategory((prev) => (prev === cat ? null : cat))
              }
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((card) => (
            <motion.div
              key={card.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <FlipCard
                card={card}
                isFlipped={flipped.has(card.id)}
                isKnown={known.has(card.id)}
                onFlip={() => toggleFlip(card.id)}
                onKnown={() => toggleKnown(card.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center text-muted-foreground">
          <Layers className="mx-auto mb-3 size-10 opacity-30" />
          <p className="text-sm">No flashcards match your search.</p>
        </div>
      )}
    </motion.div>
  );
}
