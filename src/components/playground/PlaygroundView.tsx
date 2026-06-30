"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Play,
  RotateCcw,
  Code2,
  Palette,
  FileCode,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Braces,
  Download,
  AlignLeft,
  Share2,
  X,
  Terminal,
  ArrowLeft,
  Trash2,
} from "lucide-react";
import { useAppStore } from "@/lib/store";

/* ──────────────────────────────────────────────────────────── */
/*  Console interceptor injected into iframe BEFORE user code  */
/* ──────────────────────────────────────────────────────────── */
const CONSOLE_INTERCEPTOR = `(function(){var o={};['log','error','warn','info'].forEach(function(m){o[m]=console[m];console[m]=function(){var a=Array.prototype.slice.call(arguments);o[m].apply(console,a);parent.postMessage({type:'console',method:m,args:a.map(function(x){try{return typeof x==='object'?JSON.stringify(x,null,2):String(x);}catch(e){return String(x);}})},'*');};});window.onerror=function(msg,url,line){parent.postMessage({type:'console',method:'error',args:[msg+(line?' (line '+line+')':'')]},'*');};window.addEventListener('unhandledrejection',function(e){parent.postMessage({type:'console',method:'error',args:['Unhandled Promise Rejection: '+e.reason]},'*');});})();`;

/* ──────────────────────────────────────────────────────────── */
/*  Defaults                                                  */
/* ──────────────────────────────────────────────────────────── */
const DEFAULT_HTML = `<div id="output">
  <h1 style="color: #F7DF1E">Hello, Hero!</h1>
  <p>Start coding here...</p>
</div>`;

const DEFAULT_CSS = `body {
  font-family: system-ui, sans-serif;
  padding: 20px;
  background: #0F172A;
  color: white;
}`;

const DEFAULT_JS = `// Write your JavaScript here
console.log("Hello from the playground!");

const el = document.getElementById("output");
el.innerHTML += "<p style='color: #38BDF8'>JavaScript is running!</p>";`;

const DEFAULTS = { html: DEFAULT_HTML, css: DEFAULT_CSS, js: DEFAULT_JS } as const;

/* ──────────────────────────────────────────────────────────── */
/*  Types                                                     */
/* ──────────────────────────────────────────────────────────── */
type TabKey = "html" | "css" | "js" | "console";

interface ConsoleMessage {
  id: number;
  method: "log" | "error" | "warn" | "info";
  args: string[];
  timestamp: string;
}

const CONSOLE_METHOD_COLORS: Record<ConsoleMessage["method"], string> = {
  log: "text-foreground",
  error: "text-red-400",
  warn: "text-yellow-400",
  info: "text-blue-400",
};

/* ──────────────────────────────────────────────────────────── */
/*  Helpers                                                   */
/* ──────────────────────────────────────────────────────────── */
function getLineCount(code: string): number {
  return code.split("\n").length;
}

let consoleMsgIdCounter = 0;

/* ──────────────────────────────────────────────────────────── */
/*  CodeTextarea (unchanged style, added find-replace trigger) */
/* ──────────────────────────────────────────────────────────── */
function CodeTextarea({
  value,
  onChange,
  placeholder,
  lineNumbersRef,
  onOpenFindReplace,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  lineNumbersRef: React.RefObject<HTMLDivElement | null>;
  onOpenFindReplace?: () => void;
}) {
  const lineCount = getLineCount(value || "\n");
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLTextAreaElement>) => {
      if (lineNumbersRef.current) {
        lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
      }
    },
    [lineNumbersRef]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const target = e.currentTarget;
        const start = target.selectionStart;
        const end = target.selectionEnd;
        const newValue = value.substring(0, start) + "  " + value.substring(end);
        onChange(newValue);
        requestAnimationFrame(() => {
          target.selectionStart = target.selectionEnd = start + 2;
        });
      }
      // Ctrl+F / Ctrl+H → open find & replace (prevent browser dialog)
      if ((e.ctrlKey || e.metaKey) && (e.key === "f" || e.key === "h")) {
        e.preventDefault();
        onOpenFindReplace?.();
      }
    },
    [value, onChange, onOpenFindReplace]
  );

  return (
    <div className="relative flex h-full overflow-hidden">
      {/* Line Numbers */}
      <div
        ref={lineNumbersRef}
        className="custom-scrollbar flex-shrink-0 select-none overflow-hidden border-r border-white/10 bg-black/30 py-3 pr-2 text-right font-mono text-xs leading-[20px] text-white/25"
        style={{ width: `${Math.max(3, String(lineCount).length) * 10 + 16}px` }}
        aria-hidden="true"
      >
        {lineNumbers.map((num) => (
          <div key={num}>{num}</div>
        ))}
      </div>

      {/* Textarea */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        spellCheck={false}
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        className="code-editor custom-scrollbar flex-1 resize-none bg-transparent p-3 text-sm text-foreground focus:outline-none"
        style={{ lineHeight: "20px", tabSize: 2 }}
      />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────── */
/*  PlaygroundView                                            */
/* ──────────────────────────────────────────────────────────── */
export function PlaygroundView() {
  const { resolvedTheme } = useTheme();

  /* ── Store ────────────────────────────────────────────────── */
  const clearPlaygroundPayload = useAppStore((s) => s.clearPlaygroundPayload);
  const navigateTo = useAppStore((s) => s.navigateTo);

  /* ── Editor state ─────────────────────────────────────────── */
  const [activeTab, setActiveTab] = useState<TabKey>("html");
  const [htmlCode, setHtmlCode] = useState<string>(DEFAULTS.html);
  const [cssCode, setCssCode] = useState<string>(DEFAULTS.css);
  const [jsCode, setJsCode] = useState<string>(DEFAULTS.js);

  /* ── UI state ─────────────────────────────────────────────── */
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false);
  const [isEditorFullscreen, setIsEditorFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  /* ── Console state ────────────────────────────────────────── */
  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([]);
  const [consoleUnread, setConsoleUnread] = useState(0);

  /* ── Find & Replace state ─────────────────────────────────── */
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");

  /* ── Lesson / payload state ───────────────────────────────── */
  const [lessonTitle, setLessonTitle] = useState<string | null>(null);
  const [lessonDescription, setLessonDescription] = useState<string | null>(null);
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [hasLessonCode, setHasLessonCode] = useState(false);
  const originalCodeRef = useRef<{ html: string; css: string; js: string } | null>(null);

  /* ── Refs ─────────────────────────────────────────────────── */
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const htmlLineNumbersRef = useRef<HTMLDivElement>(null);
  const cssLineNumbersRef = useRef<HTMLDivElement>(null);
  const jsLineNumbersRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  /* ──────────────────────────────────────────────────────────── */
  /*  Initialization: payload → localStorage → defaults          */
  /* ──────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    let finalHtml: string = DEFAULTS.html;
    let finalCss: string = DEFAULTS.css;
    let finalJs: string = DEFAULTS.js;

    const payload = useAppStore.getState().playgroundPayload;
    if (payload) {
      finalHtml = payload.html || DEFAULTS.html;
      finalCss = payload.css || DEFAULTS.css;
      finalJs = payload.js || DEFAULTS.js;
      originalCodeRef.current = { html: finalHtml, css: finalCss, js: finalJs };
      setHasLessonCode(true);
      setLessonTitle(payload.title ?? null);
      setLessonDescription(payload.description ?? null);
      setLessonId(payload.lessonId ?? null);
      clearPlaygroundPayload();
    } else {
      // Try localStorage with "default" key
      try {
        const saved = localStorage.getItem("js-hero-playground-default");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.html) finalHtml = parsed.html;
          if (parsed.css) finalCss = parsed.css;
          if (parsed.js) finalJs = parsed.js;
        }
      } catch {
        // ignore
      }
    }

    setHtmlCode(finalHtml);
    setCssCode(finalCss);
    setJsCode(finalJs);

    // Auto-run after initialization
    setTimeout(() => {
      if (iframeRef.current) {
        const srcdoc = `<!DOCTYPE html><html><head><style>${finalCss}</style></head><body>${finalHtml}<script>${CONSOLE_INTERCEPTOR}${finalJs}<\/script></body></html>`;
        iframeRef.current.srcdoc = srcdoc;
        setHasRun(true);
      }
    }, 300);
  }, []);

  /* ── Line numbers ref map ─────────────────────────────────── */
  const lineNumbersRefMap: Record<string, React.RefObject<HTMLDivElement | null>> = {
    html: htmlLineNumbersRef,
    css: cssLineNumbersRef,
    js: jsLineNumbersRef,
  };

  /* ── Code accessors ───────────────────────────────────────── */
  const getCodeForTab = useCallback(
    (tab: TabKey) => {
      switch (tab) {
        case "html":
          return htmlCode;
        case "css":
          return cssCode;
        case "js":
          return jsCode;
        case "console":
          return "";
      }
    },
    [htmlCode, cssCode, jsCode]
  );

  const getActiveCode = () => {
    switch (activeTab) {
      case "html":
        return htmlCode;
      case "css":
        return cssCode;
      case "js":
        return jsCode;
      case "console":
        return "";
    }
  };

  const getActiveSetter = (): ((val: string) => void) => {
    switch (activeTab) {
      case "html":
        return (val: string) => setHtmlCode(val);
      case "css":
        return (val: string) => setCssCode(val);
      case "js":
        return (val: string) => setJsCode(val);
      case "console":
        return () => {};
    }
  };

  const getPlaceholder = () => {
    switch (activeTab) {
      case "html":
        return "Write your HTML here...";
      case "css":
        return "Write your CSS here...";
      case "js":
        return "Write your JavaScript here...";
      case "console":
        return "";
    }
  };

  /* ──────────────────────────────────────────────────────────── */
  /*  Auto-save to localStorage every 5s                         */
  /* ──────────────────────────────────────────────────────────── */
  const performSave = useCallback(() => {
    const key = `js-hero-playground-${lessonId || "default"}`;
    localStorage.setItem(
      key,
      JSON.stringify({ html: htmlCode, css: cssCode, js: jsCode })
    );
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  }, [htmlCode, cssCode, jsCode, lessonId]);

  useEffect(() => {
    const timer = setInterval(() => {
      performSave();
    }, 5000);
    return () => clearInterval(timer);
  }, [performSave]);

  const forceSave = useCallback(() => {
    performSave();
  }, [performSave]);

  /* ──────────────────────────────────────────────────────────── */
  /*  Console: listen for postMessage from iframe                */
  /* ──────────────────────────────────────────────────────────── */
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === "console") {
        const { method, args } = event.data as {
          method: ConsoleMessage["method"];
          args: string[];
        };
        const msg: ConsoleMessage = {
          id: ++consoleMsgIdCounter,
          method,
          args,
          timestamp: new Date().toLocaleTimeString(),
        };
        setConsoleMessages((prev) => [...prev, msg]);
        setActiveTab((current) => {
          if (current !== "console") {
            setConsoleUnread((prev) => prev + 1);
          }
          return current;
        });
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  // Reset unread when console tab is active
  useEffect(() => {
    if (activeTab === "console") {
      setConsoleUnread(0);
    }
  }, [activeTab]);

  // Auto-scroll console to bottom
  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [consoleMessages]);

  /* ──────────────────────────────────────────────────────────── */
  /*  Actions                                                    */
  /* ──────────────────────────────────────────────────────────── */
  const handleRun = useCallback(() => {
    if (!iframeRef.current) return;
    const srcdoc = `<!DOCTYPE html><html><head><style>${cssCode}</style></head><body>${htmlCode}<script>${CONSOLE_INTERCEPTOR}${jsCode}<\/script></body></html>`;
    iframeRef.current.srcdoc = srcdoc;
    setHasRun(true);
    // Clear old console messages on new run
    setConsoleMessages([]);
    setConsoleUnread(0);
  }, [htmlCode, cssCode, jsCode]);

  const handleReset = useCallback(() => {
    if (hasLessonCode && originalCodeRef.current) {
      setHtmlCode(originalCodeRef.current.html);
      setCssCode(originalCodeRef.current.css);
      setJsCode(originalCodeRef.current.js);
      // Clear localStorage for this lesson
      const key = `js-hero-playground-${lessonId || "default"}`;
      localStorage.removeItem(key);
    } else {
      setHtmlCode(DEFAULTS.html);
      setCssCode(DEFAULTS.css);
      setJsCode(DEFAULTS.js);
      // Clear default localStorage
      localStorage.removeItem("js-hero-playground-default");
    }
    setHasRun(false);
    setConsoleMessages([]);
    setConsoleUnread(0);
    if (iframeRef.current) {
      iframeRef.current.srcdoc = "";
    }
  }, [hasLessonCode, lessonId]);

  const handleCopy = useCallback(async () => {
    const code = getCodeForTab(activeTab);
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [activeTab, getCodeForTab]);

  const handleDownload = useCallback(() => {
    const html = `<!DOCTYPE html>
<html>
<head>
  <style>${cssCode}</style>
</head>
<body>
${htmlCode}
<script>${jsCode}<\/script>
</body>
</html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "playground.html";
    a.click();
    URL.revokeObjectURL(url);
  }, [htmlCode, cssCode, jsCode]);

  const handleFormat = useCallback(() => {
    const setter = getActiveSetter();
    const code = getActiveCode();
    if (!code) return;

    const lines = code.split("\n");
    let indent = 0;
    const result: string[] = [];

    for (const line of lines) {
      const trimmed = line.trimEnd(); // keep leading whitespace for detection
      const stripped = trimmed.trim();

      if (!stripped) {
        result.push("");
        continue;
      }

      // Detect current line's leading whitespace for reference
      const currentIndent = (trimmed.match(/^(\s*)/)?.[1]?.length ?? 0) / 2;

      // Decrease indent before lines starting with closing delimiters
      if (/^[}\])]/.test(stripped)) {
        indent = Math.max(0, indent - 1);
      }

      result.push("  ".repeat(indent) + stripped);

      // Count net open braces
      const opens = (stripped.match(/[{[\(]/g) || []).length;
      const closes = (stripped.match(/[}\]\)]/g) || []).length;
      if (opens > closes) {
        indent += opens - closes;
      } else if (closes > opens) {
        // Already decreased above, don't double-count
      }
    }

    setter(result.join("\n"));
  }, [activeTab, htmlCode, cssCode, jsCode]);

  const handleShare = useCallback(async () => {
    const combined = `<!-- HTML -->\n${htmlCode}\n\n/* CSS */\n<style>\n${cssCode}\n</style>\n\n// JavaScript\n${jsCode}`;
    try {
      await navigator.clipboard.writeText(combined);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }, [htmlCode, cssCode, jsCode]);

  /* ── Find & Replace logic ─────────────────────────────────── */
  const matchCount = useMemo(() => {
    if (!findText || activeTab === "console") return 0;
    const code = getActiveCode();
    if (!findText) return 0;
    let count = 0;
    let pos = 0;
    const lowerCode = code.toLowerCase();
    const lowerFind = findText.toLowerCase();
    while ((pos = lowerCode.indexOf(lowerFind, pos)) !== -1) {
      count++;
      pos += 1;
    }
    return count;
  }, [findText, activeTab, htmlCode, cssCode, jsCode]);

  const handleReplace = useCallback(() => {
    if (!findText || activeTab === "console") return;
    const code = getActiveCode();
    const index = code.toLowerCase().indexOf(findText.toLowerCase());
    if (index !== -1) {
      const newCode =
        code.substring(0, index) +
        replaceText +
        code.substring(index + findText.length);
      getActiveSetter()(newCode);
    }
  }, [findText, replaceText, activeTab, htmlCode, cssCode, jsCode]);

  const handleReplaceAll = useCallback(() => {
    if (!findText || activeTab === "console") return;
    const code = getActiveCode();
    const escaped = findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "gi");
    const newCode = code.replace(regex, replaceText);
    getActiveSetter()(newCode);
  }, [findText, replaceText, activeTab, htmlCode, cssCode, jsCode]);

  /* ── Toggle line comment (Ctrl+/) ─────────────────────────── */
  const toggleLineComment = useCallback(
    (textarea: HTMLTextAreaElement) => {
      if (activeTab === "console") return;
      const setter = getActiveSetter();
      const value = textarea.value;
      const pos = textarea.selectionStart;

      // Find line boundaries
      let lineStart = value.lastIndexOf("\n", pos - 1) + 1;
      let lineEnd = value.indexOf("\n", pos);
      if (lineEnd === -1) lineEnd = value.length;

      const lineContent = value.substring(lineStart, lineEnd);
      const linePrefix = lineContent.match(/^(\s*)/)?.[1] ?? "";
      const afterPrefix = lineContent.slice(linePrefix.length);

      let newLine: string;
      let posShift = 0;

      if (afterPrefix.startsWith("// ")) {
        newLine = linePrefix + afterPrefix.slice(3);
        posShift = -3;
      } else if (afterPrefix.startsWith("//")) {
        newLine = linePrefix + afterPrefix.slice(2);
        posShift = -2;
      } else {
        newLine = linePrefix + "// " + afterPrefix;
        posShift = 3;
      }

      const newValue =
        value.substring(0, lineStart) + newLine + value.substring(lineEnd);
      setter(newValue);

      requestAnimationFrame(() => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = pos + posShift;
      });
    },
    [activeTab, getActiveSetter]
  );

  /* ──────────────────────────────────────────────────────────── */
  /*  Keyboard shortcuts                                         */
  /* ──────────────────────────────────────────────────────────── */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Enter → run code
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleRun();
      }
      // Ctrl+S → force save
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        forceSave();
      }
      // Ctrl+/ → toggle line comment (only when textarea is focused)
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        const target = document.activeElement;
        if (target instanceof HTMLTextAreaElement) {
          e.preventDefault();
          toggleLineComment(target);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleRun, forceSave, toggleLineComment]);

  /* ──────────────────────────────────────────────────────────── */
  /*  Tab configuration                                          */
  /* ──────────────────────────────────────────────────────────── */
  const tabsConfig: {
    key: TabKey;
    label: string;
    icon: typeof Code2;
  }[] = [
    { key: "html", label: "HTML", icon: Code2 },
    { key: "css", label: "CSS", icon: Palette },
    { key: "js", label: "JavaScript", icon: FileCode },
    { key: "console", label: "Console", icon: Terminal },
  ];

  const activeTabConfig = tabsConfig.find((t) => t.key === activeTab)!;

  /* ──────────────────────────────────────────────────────────── */
  /*  Render                                                     */
  /* ──────────────────────────────────────────────────────────── */
  return (
    <TooltipProvider delayDuration={400}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex h-full flex-col gap-4"
      >
        {/* ── Lesson Context Banner ──────────────────────────── */}
        <AnimatePresence>
          {lessonTitle && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-between rounded-lg border border-js-yellow/20 bg-js-yellow/5 px-4 py-2"
            >
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold text-js-yellow">
                  {lessonTitle}
                </h3>
                {lessonDescription && (
                  <p className="truncate text-xs text-muted-foreground">
                    {lessonDescription}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateTo("lesson")}
                className="ml-3 flex-shrink-0 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-3.5" />
                Back to Lesson
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-js-yellow/15">
              <Braces className="size-5 text-js-yellow" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                Code Playground
              </h2>
              <p className="text-xs text-muted-foreground">
                Write HTML, CSS &amp; JavaScript and see the result instantly
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Copy */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="gap-1.5"
                >
                  <AnimatePresence mode="wait">
                    {copied ? (
                      <motion.span
                        key="check"
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 90 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Check className="size-3.5 text-js-emerald" />
                      </motion.span>
                    ) : (
                      <motion.span
                        key="copy"
                        initial={{ scale: 0, rotate: 90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: -90 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Copy className="size-3.5" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <span className="text-xs">
                    {copied ? "Copied!" : `Copy ${activeTabConfig.label}`}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy current tab code to clipboard</p>
              </TooltipContent>
            </Tooltip>

            {/* Download */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="gap-1.5"
                >
                  <Download className="size-3.5" />
                  <span className="text-xs">Download</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Download as HTML file</p>
              </TooltipContent>
            </Tooltip>

            {/* Format */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFormat}
                  className="gap-1.5"
                >
                  <AlignLeft className="size-3.5" />
                  <span className="text-xs">Format</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Basic code formatting</p>
              </TooltipContent>
            </Tooltip>

            {/* Share */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="gap-1.5"
                >
                  <Share2 className="size-3.5" />
                  <span className="text-xs">Share</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy all code as combined snippet</p>
              </TooltipContent>
            </Tooltip>

            {/* Reset / Reset Example */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="gap-1.5"
                >
                  <RotateCcw className="size-3.5" />
                  <span className="text-xs">
                    {hasLessonCode ? "Reset Example" : "Reset"}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {hasLessonCode
                    ? "Reset to original lesson code"
                    : "Clear all editors to defaults"}
                </p>
              </TooltipContent>
            </Tooltip>

            {/* Editor Fullscreen Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  onClick={() => setIsEditorFullscreen((prev) => !prev)}
                >
                  {isEditorFullscreen ? (
                    <Minimize2 className="size-3.5" />
                  ) : (
                    <Maximize2 className="size-3.5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {isEditorFullscreen ? "Show preview" : "Editor fullscreen"}
                </p>
              </TooltipContent>
            </Tooltip>

            {/* Run Code */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  onClick={handleRun}
                  className="gap-1.5 bg-js-yellow text-js-darker font-semibold shadow-md shadow-js-yellow/20 transition-shadow hover:bg-js-yellow/90 hover:shadow-lg hover:shadow-js-yellow/30"
                >
                  <Play className="size-3.5 fill-current" />
                  <span className="text-xs">Run Code</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Execute code in the preview panel (Ctrl+Enter)</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* ── Main Content: Editor + Preview ─────────────────── */}
        <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
          {/* ── Editor Panel ──────────────────────────────────── */}
          <AnimatePresence mode="wait">
            {!isPreviewFullscreen && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex min-h-[300px] flex-1 flex-col overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm lg:min-h-0"
              >
                {/* Editor Tab Bar */}
                <div className="flex items-center justify-between border-b border-border/50 px-2">
                  <Tabs
                    value={activeTab}
                    onValueChange={(val) => setActiveTab(val as TabKey)}
                    className="w-full"
                  >
                    <TabsList className="h-10 gap-0.5 rounded-none border-0 bg-transparent p-0">
                      {tabsConfig.map(({ key, label, icon: Icon }) => (
                        <TabsTrigger
                          key={key}
                          value={key}
                          className="relative gap-1.5 rounded-md px-3 data-[state=active]:bg-js-yellow/10 data-[state=active]:text-js-yellow"
                        >
                          <Icon className="size-3.5" />
                          <span className="text-xs font-medium">{label}</span>
                          {key === "console" && consoleUnread > 0 && (
                            <Badge
                              variant="destructive"
                              className="ml-1 h-4 min-w-4 px-1 text-[10px] leading-4"
                            >
                              {consoleUnread > 99 ? "99+" : consoleUnread}
                            </Badge>
                          )}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>

                  <div className="flex items-center gap-2">
                    {/* Auto-save indicator */}
                    <AnimatePresence>
                      {showSaved && (
                        <motion.span
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.2 }}
                          className="text-[10px] font-medium text-js-emerald"
                        >
                          Saved ✓
                        </motion.span>
                      )}
                    </AnimatePresence>

                    {/* Console clear button or tab label */}
                    {activeTab === "console" ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setConsoleMessages([]);
                          setConsoleUnread(0);
                        }}
                        className="mr-2 h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <Trash2 className="size-3" />
                        Clear
                      </Button>
                    ) : (
                      <span className="mr-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        {activeTab.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Find & Replace Bar */}
                <AnimatePresence>
                  {showFindReplace && activeTab !== "console" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden border-b border-border/50"
                    >
                      <div className="flex items-center gap-2 bg-js-darker/80 px-3 py-2">
                        <div className="relative flex-1">
                          <Input
                            value={findText}
                            onChange={(e) => setFindText(e.target.value)}
                            placeholder="Find..."
                            className="h-7 border-white/10 bg-black/30 text-xs"
                            autoFocus
                          />
                        </div>
                        <span className="min-w-[50px] text-center text-[10px] text-muted-foreground">
                          {findText
                            ? `${matchCount} match${matchCount !== 1 ? "es" : ""}`
                            : ""}
                        </span>
                        <div className="relative flex-1">
                          <Input
                            value={replaceText}
                            onChange={(e) => setReplaceText(e.target.value)}
                            placeholder="Replace..."
                            className="h-7 border-white/10 bg-black/30 text-xs"
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleReplace}
                          disabled={!findText || matchCount === 0}
                          className="h-7 text-xs"
                        >
                          Replace
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleReplaceAll}
                          disabled={!findText || matchCount === 0}
                          className="h-7 text-xs"
                        >
                          All
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          onClick={() => {
                            setShowFindReplace(false);
                            setFindText("");
                            setReplaceText("");
                          }}
                        >
                          <X className="size-3.5" />
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Editor Content / Console Panel */}
                <div className="relative min-h-0 flex-1 overflow-hidden bg-js-darker">
                  {activeTab === "console" ? (
                    <div className="custom-scrollbar h-full overflow-auto p-3">
                      {consoleMessages.length === 0 ? (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                          <p className="text-sm">
                            Run code to see console output
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {consoleMessages.map((msg) => (
                            <div
                              key={msg.id}
                              className="flex gap-2 font-mono text-xs leading-relaxed"
                            >
                              <span className="flex-shrink-0 text-muted-foreground/50">
                                {msg.timestamp}
                              </span>
                              <span
                                className={
                                  CONSOLE_METHOD_COLORS[msg.method]
                                }
                              >
                                {msg.args.join(" ")}
                              </span>
                            </div>
                          ))}
                          <div ref={consoleEndRef} />
                        </div>
                      )}
                    </div>
                  ) : (
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="h-full"
                      >
                        <CodeTextarea
                          value={getActiveCode()}
                          onChange={getActiveSetter()}
                          placeholder={getPlaceholder()}
                          lineNumbersRef={
                            lineNumbersRefMap[activeTab] as React.RefObject<HTMLDivElement>
                          }
                          onOpenFindReplace={() => setShowFindReplace(true)}
                        />
                      </motion.div>
                    </AnimatePresence>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Preview Panel ─────────────────────────────────── */}
          <AnimatePresence mode="wait">
            {!isEditorFullscreen && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="flex min-h-[250px] flex-1 flex-col overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm"
              >
                {/* Preview Header */}
                <div className="flex items-center justify-between border-b border-border/50 px-4 py-2">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="size-2.5 rounded-full bg-js-rose/70" />
                      <div className="size-2.5 rounded-full bg-js-orange/70" />
                      <div className="size-2.5 rounded-full bg-js-emerald/70" />
                    </div>
                    <span className="ml-2 text-xs font-medium text-muted-foreground">
                      Preview
                    </span>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={() =>
                          setIsPreviewFullscreen((prev) => !prev)
                        }
                      >
                        {isPreviewFullscreen ? (
                          <Minimize2 className="size-3.5" />
                        ) : (
                          <Maximize2 className="size-3.5" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {isPreviewFullscreen
                          ? "Exit fullscreen"
                          : "Fullscreen preview"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                {/* Preview iframe */}
                <div className="relative flex-1 bg-white">
                  {!hasRun && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-js-darker text-muted-foreground">
                      <Play className="size-8 text-js-yellow/40" />
                      <p className="text-sm">
                        Click &quot;Run Code&quot; to see the preview
                      </p>
                    </div>
                  )}
                  <iframe
                    ref={iframeRef}
                    title="Code Preview"
                    sandbox="allow-scripts allow-modals"
                    className="h-full w-full border-0"
                    style={{ minHeight: "100%" }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Keyboard Shortcut Hints ─────────────────────────── */}
        <div className="flex flex-wrap items-center justify-center gap-3 pb-1">
          <div className="flex items-center gap-1.5">
            <kbd className="rounded border border-border/50 bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              Ctrl
            </kbd>
            <span className="text-[10px] text-muted-foreground">+</span>
            <kbd className="rounded border border-border/50 bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              Enter
            </kbd>
            <span className="text-[10px] text-muted-foreground">to run</span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="rounded border border-border/50 bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              Ctrl
            </kbd>
            <span className="text-[10px] text-muted-foreground">+</span>
            <kbd className="rounded border border-border/50 bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              S
            </kbd>
            <span className="text-[10px] text-muted-foreground">to save</span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="rounded border border-border/50 bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              Ctrl
            </kbd>
            <span className="text-[10px] text-muted-foreground">+</span>
            <kbd className="rounded border border-border/50 bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              /
            </kbd>
            <span className="text-[10px] text-muted-foreground">
              toggle comment
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="rounded border border-border/50 bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              Ctrl
            </kbd>
            <span className="text-[10px] text-muted-foreground">+</span>
            <kbd className="rounded border border-border/50 bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              F
            </kbd>
            <span className="text-[10px] text-muted-foreground">
              find &amp; replace
            </span>
          </div>
        </div>
      </motion.div>
    </TooltipProvider>
  );
}