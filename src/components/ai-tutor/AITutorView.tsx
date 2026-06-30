"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppStore } from "@/lib/store";
import { useState, useRef, useEffect } from "react";
import {
  MessageCircle, Send, Bot, User, Sparkles,
  Trash2, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const quickPrompts = [
  { label: "Explain closures", icon: "🔒" },
  { label: "Fix my async code", icon: "🔧" },
  { label: "Difference between == and ===", icon: "❓" },
  { label: "How does .map() work?", icon: "🗺️" },
  { label: "Explain Promises", icon: "✨" },
  { label: "Best practices for arrays", icon: "📋" },
];

export function AITutorView() {
  const { user } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const content = text || input.trim();
    if (!content || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply || "Sorry, I couldn't process that. Try again!",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm having trouble connecting right now. Please try again in a moment. 🔄",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => setMessages([]);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col" style={{ height: "calc(100vh - 4rem - 80px)", minHeight: 500 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-js-violet/10">
              <MessageCircle className="h-5 w-5 text-js-violet" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold">AI Tutor</h1>
              <p className="text-sm text-muted-foreground">Ask me anything about JavaScript</p>
            </div>
          </div>
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1" onClick={clearChat}>
              <Trash2 className="h-3.5 w-3.5" />Clear
            </Button>
          )}
        </div>
      </motion.div>

      {/* Messages */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-js-violet/20 to-js-sky/20 flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-js-violet" />
              </div>
              <h2 className="text-lg font-bold mb-2">Hi, {user?.name || "Hero"}! 👋</h2>
              <p className="text-sm text-muted-foreground mb-6 max-w-md">
                I&apos;m your AI JavaScript tutor. Ask me questions, get code help, or explore concepts.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-lg">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt.label}
                    onClick={() => sendMessage(prompt.label)}
                    className="p-3 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-js-violet/40 hover:bg-js-violet/5 transition-all cursor-pointer text-left"
                  >
                    <span className="mr-1.5">{prompt.icon}</span>{prompt.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "")}
                >
                  {msg.role === "assistant" && (
                    <div className="h-8 w-8 rounded-lg bg-js-violet/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="h-4 w-4 text-js-violet" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                      msg.role === "user"
                        ? "bg-js-yellow text-js-darker rounded-br-md"
                        : "bg-muted rounded-bl-md"
                    )}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                  {msg.role === "user" && (
                    <div className="h-8 w-8 rounded-lg bg-js-yellow/20 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="h-4 w-4 text-js-yellow" />
                    </div>
                  )}
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-lg bg-js-violet/10 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-js-violet" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 text-js-violet animate-spin" />
                      <span className="text-sm text-muted-foreground">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t p-3 sm:p-4">
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about JavaScript..."
                rows={1}
                className="w-full resize-none rounded-xl border border-input bg-background px-4 py-2.5 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-js-violet/30 max-h-32 custom-scrollbar"
                style={{ minHeight: 44 }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height = Math.min(target.scrollHeight, 128) + "px";
                }}
              />
            </div>
            <Button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              className="h-[44px] w-[44px] rounded-xl bg-js-violet hover:bg-js-violet/90 text-white p-0 shrink-0"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
            AI-powered JavaScript tutor • Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </Card>
    </div>
  );
}
