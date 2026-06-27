"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/lib/store";
import { useState, useEffect, useCallback } from "react";
import {
  Users,
  MessageCircle,
  Heart,
  Search,
  Plus,
  Clock,
  X,
  LogIn,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PostAuthor {
  id: string;
  name: string;
  avatar?: string | null;
}

interface Post {
  id: string;
  title: string;
  content: string;
  tags: string | null;
  likes: number;
  replyCount: number;
  createdAt: string;
  user: PostAuthor;
}

export function CommunityView() {
  const { user, navigateTo, setCurrentPostId, setCurrentView } = useAppStore();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newTags, setNewTags] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const fetchPosts = useCallback(async (pageNum: number, search: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(pageNum), limit: "20" });
      if (search) params.set("search", search);
      const res = await fetch(`/api/community?${params}`);
      const data = await res.json();
      if (data.posts) {
        if (pageNum === 1) {
          setPosts(data.posts);
        } else {
          setPosts((prev) => [...prev, ...data.posts]);
        }
        setTotalPages(data.totalPages || 0);
      }
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(1, searchQuery);
    setPage(1);
  }, [fetchPosts, searchQuery]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const handleLike = async (postId: string) => {
    if (!user) return;
    if (likedPosts.has(postId)) return;
    setLikedPosts((prev) => new Set(prev).add(postId));
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likes: p.likes + 1 } : p))
    );
    try {
      await fetch(`/api/community/${postId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      // rollback
      setLikedPosts((prev) => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, likes: p.likes - 1 } : p))
      );
    }
  };

  const handleCreatePost = async () => {
    if (!user || !newTitle.trim() || !newContent.trim()) return;
    setSubmitting(true);
    try {
      const tags = newTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          title: newTitle.trim(),
          content: newContent.trim(),
          tags: JSON.stringify(tags),
        }),
      });
      const data = await res.json();
      if (data.post) {
        setNewTitle("");
        setNewContent("");
        setNewTags("");
        setShowNewPost(false);
        fetchPosts(1, searchQuery);
        setPage(1);
      }
    } catch {
      // silent fail
    } finally {
      setSubmitting(false);
    }
  };

  const openPost = (postId: string) => {
    setCurrentPostId(postId);
    setCurrentView("post-detail");
  };

  const formatDate = (dateStr: string) => {
    const now = new Date();
    const d = new Date(dateStr);
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  const parseTags = (tagsStr: string | null): string[] => {
    if (!tagsStr) return [];
    try {
      const parsed = JSON.parse(tagsStr);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return tagsStr.split(",").map((t) => t.trim()).filter(Boolean);
    }
  };

  // Login prompt
  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="h-20 w-20 rounded-3xl bg-js-emerald/10 flex items-center justify-center mx-auto mb-6">
            <Users className="h-10 w-10 text-js-emerald" />
          </div>
          <h1 className="text-2xl font-extrabold mb-2">Join the Community</h1>
          <p className="text-sm text-muted-foreground mb-8">
            Sign in to participate in discussions, share your code, and help others learn JavaScript.
          </p>
          <Button
            className="w-full bg-js-yellow text-js-darker hover:bg-js-yellow/90 font-bold rounded-xl h-12 gap-2"
            onClick={() => navigateTo("login")}
          >
            <LogIn className="h-4 w-4" />Sign In to Continue
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-js-emerald/10">
              <Users className="h-5 w-5 text-js-emerald" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold">Community</h1>
              <p className="text-sm text-muted-foreground">
                Learn together, grow together
              </p>
            </div>
          </div>
          <Button
            className="bg-js-yellow text-js-darker hover:bg-js-yellow/90 font-bold rounded-xl gap-1.5 text-sm"
            onClick={() => setShowNewPost(true)}
          >
            <Plus className="h-4 w-4" />
            New Post
          </Button>
        </div>
      </motion.div>

      {/* New Post Form */}
      {showNewPost && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="border-js-yellow/30">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm">Create New Post</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setShowNewPost(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Post title..."
                className="h-10 rounded-xl"
              />
              <Textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Write your post content... (supports markdown)"
                className="min-h-[120px] rounded-xl resize-none"
              />
              <Input
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                placeholder="Tags (comma-separated): React, Performance, Tutorial"
                className="h-10 rounded-xl"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNewPost(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="bg-js-yellow text-js-darker hover:bg-js-yellow/90 font-bold rounded-xl"
                  onClick={handleCreatePost}
                  disabled={submitting || !newTitle.trim() || !newContent.trim()}
                >
                  {submitting ? "Posting..." : "Post"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search discussions..."
            className="pl-10 h-11 rounded-xl"
          />
        </div>
      </motion.div>

      {/* Posts */}
      <div className="space-y-3">
        {loading && page === 1 ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 sm:p-5">
                <div className="flex gap-3">
                  <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2.5">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <MessageCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">
              No posts found. Start a new discussion!
            </p>
          </div>
        ) : (
          posts.map((post, i) => {
            const tags = parseTags(post.tags);
            const isLiked = likedPosts.has(post.id);
            return (
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
                        <AvatarFallback className="bg-js-yellow/10 text-js-yellow text-xs font-bold">
                          {post.user?.name
                            ? post.user.name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()
                            : "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div
                          className="cursor-pointer"
                          onClick={() => openPost(post.id)}
                        >
                          <h3 className="font-semibold text-sm group-hover:text-js-yellow transition-colors line-clamp-1">
                            {post.title}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {post.content}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 mt-2.5 flex-wrap">
                          <span className="text-[11px] text-muted-foreground">
                            {post.user?.name || "Anonymous"}
                          </span>
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(post.createdAt)}
                          </span>
                          <div className="flex items-center gap-3 ml-auto">
                            <button
                              className={cn(
                                "text-[11px] flex items-center gap-1 transition-colors cursor-pointer",
                                isLiked
                                  ? "text-rose-500"
                                  : "text-muted-foreground hover:text-rose-500"
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLike(post.id);
                              }}
                            >
                              <Heart
                                className={cn("h-3 w-3", isLiked && "fill-current")}
                              />
                              {post.likes}
                            </button>
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <MessageCircle className="h-3 w-3" />
                              {post.replyCount || 0}
                            </span>
                          </div>
                        </div>
                        {tags.length > 0 && (
                          <div className="flex gap-1.5 mt-2 flex-wrap">
                            {tags.slice(0, 4).map((tag) => (
                              <span
                                key={tag}
                                className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                              >
                                {tag}
                              </span>
                            ))}
                            {tags.length > 4 && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                +{tags.length - 4}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Load More */}
      {!loading && page < totalPages && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 text-center"
        >
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => {
              const nextPage = page + 1;
              setPage(nextPage);
              fetchPosts(nextPage, searchQuery);
            }}
            disabled={loading}
          >
            {loading ? "Loading..." : "Load More Posts"}
          </Button>
        </motion.div>
      )}

      {loading && page > 1 && (
        <div className="mt-6 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2.5">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}