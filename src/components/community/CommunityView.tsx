"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";
import {
  Users, MessageCircle, Heart, Tag, Search, Plus, TrendingUp,
  ArrowUp, Clock, Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

const samplePosts = [
  {
    id: "1",
    author: "Sarah Chen",
    initials: "SC",
    title: "Best approach for debouncing in React?",
    content: "I'm building a search component and need to debounce the API calls. What's the best pattern in 2024?",
    tags: ["React", "Performance", "Debounce"],
    likes: 24,
    replies: 8,
    views: 156,
    time: "2h ago",
    hot: true,
  },
  {
    id: "2",
    author: "Marcus J",
    initials: "MJ",
    title: "Understanding JavaScript Event Loop - Visual Guide",
    content: "I created a visual guide explaining how the event loop works. Check it out and let me know if it helps!",
    tags: ["Event Loop", "Async", "Tutorial"],
    likes: 47,
    replies: 15,
    views: 342,
    time: "5h ago",
    hot: true,
  },
  {
    id: "3",
    author: "Priya P",
    initials: "PP",
    title: "TypeScript vs JavaScript for beginners?",
    content: "Should I learn TypeScript right away or master JavaScript first? Looking for opinions from experienced devs.",
    tags: ["TypeScript", "Beginners", "Discussion"],
    likes: 18,
    replies: 22,
    views: 289,
    time: "8h ago",
    hot: false,
  },
  {
    id: "4",
    author: "Alex K",
    initials: "AK",
    title: "Share: My first to-do app with localStorage!",
    content: "Just completed the to-do app project! It uses localStorage for persistence. Would love feedback on my code structure.",
    tags: ["Project", "Showcase", "LocalStorage"],
    likes: 31,
    replies: 6,
    views: 198,
    time: "1d ago",
    hot: false,
  },
  {
    id: "5",
    author: "Jordan R",
    initials: "JR",
    title: "Common mistakes in async/await - What to avoid",
    content: "After 3 years of JS, here are the async/await mistakes I see most often. Number 3 surprised even me!",
    tags: ["Async", "Best Practices", "Tips"],
    likes: 56,
    replies: 19,
    views: 467,
    time: "1d ago",
    hot: true,
  },
  {
    id: "6",
    author: "Emma L",
    initials: "EL",
    title: "How to prepare for JS interviews?",
    content: "I have a technical interview next week. What topics should I focus on? Any recommended resources?",
    tags: ["Interview", "Career", "Prep"],
    likes: 22,
    replies: 14,
    views: 234,
    time: "2d ago",
    hot: false,
  },
];

const popularTags = ["JavaScript", "React", "Async", "Beginners", "Projects", "Interview", "TypeScript", "DOM", "ES6+", "Algorithms"];

export function CommunityView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filtered = samplePosts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !activeTag || post.tags.includes(activeTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-js-emerald/10">
              <Users className="h-5 w-5 text-js-emerald" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold">Community</h1>
              <p className="text-sm text-muted-foreground">Learn together, grow together</p>
            </div>
          </div>
          <Button className="bg-js-yellow text-js-darker hover:bg-js-yellow/90 font-bold rounded-xl gap-1.5 text-sm">
            <Plus className="h-4 w-4" />New Post
          </Button>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search discussions..."
            className="pl-10 h-11 rounded-xl"
          />
        </div>
      </motion.div>

      {/* Tags */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="flex gap-2 mb-8 flex-wrap">
        {popularTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
              activeTag === tag
                ? "bg-js-yellow text-js-darker"
                : "bg-muted text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            {tag}
          </button>
        ))}
      </motion.div>

      {/* Posts */}
      <div className="space-y-3">
        {filtered.map((post, i) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.04 }}
          >
            <Card className="hover:border-js-yellow/20 transition-colors cursor-pointer group">
              <CardContent className="p-4 sm:p-5">
                <div className="flex gap-3">
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className="bg-js-yellow/10 text-js-yellow text-xs font-bold">{post.initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-sm group-hover:text-js-yellow transition-colors line-clamp-1">
                          {post.title}
                          {post.hot && (
                            <Badge variant="outline" className="ml-2 text-[9px] text-rose-500 border-rose-500/20 bg-rose-500/10">
                              🔥 Hot
                            </Badge>
                          )}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{post.content}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2.5 flex-wrap">
                      <span className="text-[11px] text-muted-foreground">{post.author}</span>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{post.time}</span>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1"><Eye className="h-3 w-3" />{post.views}</span>
                      <div className="flex items-center gap-3 ml-auto">
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1"><Heart className="h-3 w-3" />{post.likes}</span>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1"><MessageCircle className="h-3 w-3" />{post.replies}</span>
                      </div>
                    </div>
                    <div className="flex gap-1.5 mt-2">
                      {post.tags.map((tag) => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <MessageCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">No posts found. Start a new discussion!</p>
        </div>
      )}
    </div>
  );
}