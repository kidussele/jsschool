"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "lucide-react";

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

type TabKey = "html" | "css" | "js";

function getLineCount(code: string): number {
  return code.split("\n").length;
}

function CodeTextarea({
  value,
  onChange,
  placeholder,
  lineNumbersRef,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  lineNumbersRef: React.RefObject<HTMLDivElement | null>;
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
    },
    [value, onChange]
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

export function PlaygroundView() {
  const { resolvedTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<TabKey>("html");
  const [htmlCode, setHtmlCode] = useState(DEFAULTS.html);
  const [cssCode, setCssCode] = useState(DEFAULTS.css);
  const [jsCode, setJsCode] = useState(DEFAULTS.js);
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const htmlLineNumbersRef = useRef<HTMLDivElement>(null);
  const cssLineNumbersRef = useRef<HTMLDivElement>(null);
  const jsLineNumbersRef = useRef<HTMLDivElement>(null);

  const lineNumbersRefMap: Record<TabKey, React.RefObject<HTMLDivElement | null>> = {
    html: htmlLineNumbersRef,
    css: cssLineNumbersRef,
    js: jsLineNumbersRef,
  };

  const getCodeForTab = useCallback(
    (tab: TabKey) => {
      switch (tab) {
        case "html":
          return htmlCode;
        case "css":
          return cssCode;
        case "js":
          return jsCode;
      }
    },
    [htmlCode, cssCode, jsCode]
  );

  const handleRun = useCallback(() => {
    if (!iframeRef.current) return;
    const srcdoc = `<!DOCTYPE html><html><head><style>${cssCode}</style></head><body>${htmlCode}<script>${jsCode}<\/script></body></html>`;
    iframeRef.current.srcdoc = srcdoc;
    setHasRun(true);
  }, [htmlCode, cssCode, jsCode]);

  const handleReset = useCallback(() => {
    setHtmlCode(DEFAULTS.html);
    setCssCode(DEFAULTS.css);
    setJsCode(DEFAULTS.js);
    setHasRun(false);
    if (iframeRef.current) {
      iframeRef.current.srcdoc = "";
    }
  }, []);

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

  // Ctrl+Enter keyboard shortcut to run code
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleRun();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleRun]);

  // Auto-run on first mount with default code
  useEffect(() => {
    const timer = setTimeout(() => {
      handleRun();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const tabsConfig: {
    key: TabKey;
    label: string;
    icon: typeof Code2;
  }[] = [
    { key: "html", label: "HTML", icon: Code2 },
    { key: "css", label: "CSS", icon: Palette },
    { key: "js", label: "JavaScript", icon: FileCode },
  ];

  const activeTabConfig = tabsConfig.find((t) => t.key === activeTab)!;

  const getActiveCode = () => {
    switch (activeTab) {
      case "html":
        return htmlCode;
      case "css":
        return cssCode;
      case "js":
        return jsCode;
    }
  };

  const getActiveSetter = () => {
    switch (activeTab) {
      case "html":
        return setHtmlCode;
      case "css":
        return setCssCode;
      case "js":
        return setJsCode;
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
    }
  };

  return (
    <TooltipProvider delayDuration={400}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex h-full flex-col gap-4"
      >
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-js-yellow/15">
              <Braces className="size-5 text-js-yellow" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Code Playground</h2>
              <p className="text-xs text-muted-foreground">
                Write HTML, CSS & JavaScript and see the result instantly
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
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

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="gap-1.5"
                >
                  <RotateCcw className="size-3.5" />
                  <span className="text-xs">Reset</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Clear all editors to defaults</p>
              </TooltipContent>
            </Tooltip>

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

        {/* Main Content: Editor + Preview */}
        <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
          {/* Editor Panel */}
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
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>

                  <span className="mr-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {activeTab.toUpperCase()}
                  </span>
                </div>

                {/* Editor Content */}
                <div className="relative min-h-0 flex-1 overflow-hidden bg-js-darker">
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
                        lineNumbersRef={lineNumbersRefMap[activeTab]}
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Preview Panel */}
          <motion.div
            layout
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
                    onClick={() => setIsPreviewFullscreen((prev) => !prev)}
                  >
                    {isPreviewFullscreen ? (
                      <Minimize2 className="size-3.5" />
                    ) : (
                      <Maximize2 className="size-3.5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isPreviewFullscreen ? "Exit fullscreen" : "Fullscreen preview"}</p>
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
        </div>

        {/* Keyboard Shortcut Hint */}
        <div className="flex items-center justify-center gap-1.5 pb-1">
          <kbd className="rounded border border-border/50 bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            Ctrl
          </kbd>
          <span className="text-[10px] text-muted-foreground">+</span>
          <kbd className="rounded border border-border/50 bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            Enter
          </kbd>
          <span className="text-[10px] text-muted-foreground">to run</span>
        </div>
      </motion.div>
    </TooltipProvider>
  );
}