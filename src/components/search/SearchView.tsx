"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useAppStore, type SearchResults } from "@/lib/store";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  BookOpen,
  HelpCircle,
  FolderKanban,
  MessageCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const groupConfig = [
  {
    key: "lessons" as const,
    label: "Lessons",
    icon: BookOpen,
    color: "text-js-sky",
    bg: "bg-js-sky/10",
    view: "courses" as const,
  },
  {
    key: "quizzes" as const,
    label: "Quizzes",
    icon: HelpCircle,
    color: "text-js-violet",
    bg: "bg-js-violet/10",
    view: "quizzes" as const,
  },
  {
    key: "projects" as const,
    label: "Projects",
    icon: FolderKanban,
    color: "text-js-emerald",
    bg: "bg-js-emerald/10",
    view: "projects" as const,
  },
  {
    key: "posts" as const,
    label: "Community Posts",
    icon: MessageCircle,
    color: "text-js-yellow",
    bg: "bg-js-yellow/10",
    view: "community" as const,
  },
];

export function SearchView() {
  const {
    searchQuery,
    searchResults,
    isSearching,
    performSearch,
    navigateTo,
    setCurrentPostId,
    setCurrentProjectId,
  } = useAppStore();
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(t);
  }, []);

  // Sync local query from store
  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  const debouncedSearch = useCallback(
    (value: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        performSearch(value);
      }, 300);
    },
    [performSearch]
  );

  const handleInputChange = (value: string) => {
    setLocalQuery(value);
    debouncedSearch(value);
  };

  const handleResultClick = (
    type: string,
    id: string,
    navigate: "courses" | "quizzes" | "projects" | "community"
  ) => {
    if (type === "post") {
      setCurrentPostId(id);
      navigateTo("post-detail");
    } else if (type === "project") {
      setCurrentProjectId(id);
      navigateTo("project-detail");
    } else {
      navigateTo(navigate);
    }
  };

  const hasResults =
    searchResults &&
    (searchResults.lessons.length > 0 ||
      searchResults.quizzes.length > 0 ||
      searchResults.projects.length > 0 ||
      searchResults.posts.length > 0);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateTo("home")}
            className="gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-js-yellow/10">
            <Search className="h-5 w-5 text-js-yellow" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">Search</h1>
            <p className="text-sm text-muted-foreground">
              Find lessons, quizzes, projects, and community posts
            </p>
          </div>
        </div>
      </motion.div>

      {/* Search Input */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <Card className="glass-card overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center gap-3 px-4 h-12 border-b">
              {isSearching ? (
                <Loader2 className="h-4 w-4 text-muted-foreground animate-spin shrink-0" />
              ) : (
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
              <input
                ref={inputRef}
                type="text"
                value={localQuery}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Type to search across all content..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              {localQuery && (
                <button
                  onClick={() => {
                    setLocalQuery("");
                    performSearch("");
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded bg-muted/50 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Results using Command component */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Command className="rounded-xl border bg-popover">
          <CommandList className="max-h-[60vh]">
            <CommandEmpty>
              <div className="py-12 text-center">
                {localQuery ? (
                  <>
                    <Search className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground font-medium">No results found</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      Try different keywords or check your spelling
                    </p>
                  </>
                ) : (
                  <>
                    <Search className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground font-medium">Start typing to search</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      Search lessons, quizzes, projects, and community posts
                    </p>
                  </>
                )}
              </div>
            </CommandEmpty>

            {searchResults && groupConfig.map((group) => {
              const items = searchResults[group.key];
              if (!items || items.length === 0) return null;

              return (
                <CommandGroup key={group.key} heading={
                  <span className="flex items-center gap-2">
                    <group.icon className={cn("h-3.5 w-3.5", group.color)} />
                    {group.label}
                    <span className="text-[10px] text-muted-foreground font-normal">
                      ({items.length})
                    </span>
                  </span>
                }>
                  {items.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={item.title}
                      onSelect={() =>
                        handleResultClick(item.type, item.id, group.view)
                      }
                      className="flex items-center gap-3 py-3 px-3 cursor-pointer"
                    >
                      <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg shrink-0", group.bg)}>
                        <group.icon className={cn("h-4 w-4", group.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.title}</p>
                        {"level" in item && (
                          <p className="text-[11px] text-muted-foreground truncate">
                            {(item as { level?: string; module?: string }).level}
                            {(item as { level?: string; module?: string }).module
                              ? ` / ${(item as { module: string }).module}`
                              : ""}
                          </p>
                        )}
                        {"difficulty" in item && (
                          <p className="text-[11px] text-muted-foreground capitalize">
                            {(item as { difficulty?: string }).difficulty || ""}
                          </p>
                        )}
                        {"description" in item && (
                          <p className="text-[11px] text-muted-foreground truncate">
                            {(item as { description?: string }).description || ""}
                          </p>
                        )}
                      </div>
                      <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", group.bg, group.color)}>
                        {group.label.replace("Community ", "")}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              );
            })}
          </CommandList>
        </Command>

        {/* Results count */}
        {hasResults && !isSearching && (
          <p className="text-xs text-muted-foreground text-center mt-4">
            Showing results for &ldquo;{searchQuery}&rdquo;
          </p>
        )}
      </motion.div>
    </div>
  );
}