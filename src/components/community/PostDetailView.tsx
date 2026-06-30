"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAppStore } from "@/lib/store";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Clock,
  Eye,
  Share2,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface Post {
  id: string;
  title: string;
  content: string;
  authorName?: string;
  tags?: string;
  likes?: number;
  views?: number;
  type?: string;
  createdAt?: string;
  replies?: Reply[];
}

interface Reply {
  id: string;
  content: string;
  authorName?: string;
  createdAt?: string;
}

export function PostDetailView() {
  const { currentPostId, navigateTo, user } = useAppStore();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  useEffect(() => {
    if (!currentPostId) {
      setLoading(false);
      return;
    }

    async function fetchPost() {
      setLoading(true);
      try {
        const res = await fetch(`/api/community/${currentPostId}`);
        if (res.ok) {
          const data = await res.json();
          setPost(data);
        } else {
          toast.error("Post not found");
        }
      } catch {
        toast.error("Failed to load post");
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [currentPostId]);

  const handleLike = async () => {
    if (!user || !currentPostId) return;
    try {
      const res = await fetch(`/api/community/${currentPostId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setPost((prev) => prev ? { ...prev, likes: data.likes } : null);
      }
    } catch {
      toast.error("Failed to like post");
    }
  };

  const handleReply = async () => {
    if (!user || !currentPostId || !replyContent.trim()) return;
    setSubmittingReply(true);
    try {
      const res = await fetch(`/api/community/${currentPostId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, content: replyContent }),
      });
      if (res.ok) {
        setReplyContent("");
        // Re-fetch post to get updated replies
        const postRes = await fetch(`/api/community/${currentPostId}`);
        if (postRes.ok) {
          const data = await postRes.json();
          setPost(data);
        }
        toast.success("Reply posted!");
      }
    } catch {
      toast.error("Failed to post reply");
    } finally {
      setSubmittingReply(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <MessageCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-muted-foreground mb-4">Post not found</p>
        <Button variant="outline" onClick={() => navigateTo("community")}>
          Back to Community
        </Button>
      </div>
    );
  }

  const tags = post.tags ? post.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Back */}
        <button
          onClick={() => navigateTo("community")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />Back to Community
        </button>

        {/* Post */}
        <Card className="mb-6">
          <CardContent className="p-6 sm:p-8">
            {/* Author */}
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-js-yellow/10 text-js-yellow font-bold text-sm">
                  {(post.authorName || "U").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold">{post.authorName || "Anonymous"}</p>
                {post.createdAt && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            {/* Title */}
            <h1 className="text-xl sm:text-2xl font-extrabold mb-4">{post.title}</h1>

            {/* Content */}
            <div className="prose prose-sm dark:prose-invert max-w-none mb-6 whitespace-pre-wrap leading-relaxed text-muted-foreground">
              {post.content}
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[10px]">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4 pt-4 border-t">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={handleLike}
              >
                <Heart className="h-4 w-4" />{post.likes || 0}
              </Button>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MessageCircle className="h-4 w-4" />{post.replies?.length || 0} replies
              </span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Eye className="h-4 w-4" />{post.views || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Replies */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold">Replies</h2>

          {user && (
            <Card>
              <CardContent className="p-4">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  className="w-full min-h-[80px] bg-transparent text-sm resize-none outline-none mb-3"
                />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    className="bg-js-yellow text-js-darker hover:bg-js-yellow/90 font-bold text-xs"
                    onClick={handleReply}
                    disabled={submittingReply || !replyContent.trim()}
                  >
                    {submittingReply ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                    Post Reply
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {post.replies && post.replies.length > 0 ? (
            post.replies.map((reply) => (
              <Card key={reply.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-js-yellow/10 text-js-yellow text-[10px] font-bold">
                        {(reply.authorName || "U").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{reply.authorName || "Anonymous"}</span>
                        {reply.createdAt && (
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(reply.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                        {reply.content}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No replies yet. Be the first to respond!</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}