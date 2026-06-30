"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Play,
  RotateCcw,
  Lightbulb,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Trophy,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Challenge {
  id: number;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  description: string;
  starterCode: string;
  solution: string;
  testCases: string;
  hint: string;
  category: string;
}

const challenges: Challenge[] = [
  { id: 1, title: "Reverse a String", difficulty: "easy", category: "Strings",
    description: "Write a function that takes a string and returns it reversed.",
    starterCode: "function reverseString(str) {\n  // Your code here\n  \n}\n\n// Test\nconsole.log(reverseString('hello'));\nconsole.log(reverseString('JavaScript'));",
    solution: "function reverseString(str) {\n  return str.split('').reverse().join('');\n}\n\nconsole.log(reverseString('hello'));\nconsole.log(reverseString('JavaScript'));",
    testCases: "reverseString('hello') === 'olleh'\nreverseString('abc') === 'cba'\nreverseString('') === ''",
    hint: "Split the string into an array of characters, reverse the array, then join it back." },
  { id: 2, title: "Find the Maximum", difficulty: "easy", category: "Arrays",
    description: "Write a function that returns the largest number in an array.",
    starterCode: "function findMax(arr) {\n  // Your code here\n  \n}\n\nconsole.log(findMax([3, 7, 2, 9, 1]));",
    solution: "function findMax(arr) {\n  return Math.max(...arr);\n}\n\nconsole.log(findMax([3, 7, 2, 9, 1]));",
    testCases: "findMax([1,2,3]) === 3\nfindMax([-1,-5,-3]) === -1\nfindMax([42]) === 42",
    hint: "Use Math.max with the spread operator." },
  { id: 3, title: "Flatten a Nested Array", difficulty: "medium", category: "Arrays",
    description: "Write a function that flattens a nested array of any depth.",
    starterCode: "function flatten(arr) {\n  // Your code here\n  \n}\n\nconsole.log(flatten([1, [2, [3, [4]], 5]]));",
    solution: "function flatten(arr) {\n  return arr.flat(Infinity);\n}\n\nconsole.log(flatten([1, [2, [3, [4]], 5]]));",
    testCases: "flatten([1,[2,[3]]]).join(',') === '1,2,3'\nflatten([[1],[2],[3]]).join(',') === '1,2,3'",
    hint: "Array.prototype.flat(Infinity) flattens to any depth." },
  { id: 4, title: "Debounce Function", difficulty: "medium", category: "Patterns",
    description: "Implement a debounce function that delays invoking fn until after wait ms have elapsed since the last call.",
    starterCode: "function debounce(fn, wait) {\n  // Your code here\n  \n}\n\n// Example:\nconst log = debounce((msg) => console.log(msg), 300);\nlog('a');\nlog('b');\n// Only 'b' should print after 300ms",
    solution: "function debounce(fn, wait) {\n  let timer;\n  return function(...args) {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn.apply(this, args), wait);\n  };\n}\n\nconst log = debounce((msg) => console.log(msg), 300);\nlog('a');\nlog('b');",
    testCases: "typeof debounce(() => {}, 100) === 'function'",
    hint: "Use clearTimeout and setTimeout. Store the timer in a closure variable." },
  { id: 5, title: "Deep Clone", difficulty: "medium", category: "Objects",
    description: "Write a function that creates a deep clone of an object (handles nested objects).",
    starterCode: "function deepClone(obj) {\n  // Your code here\n  \n}\n\nconst original = { a: 1, b: { c: 2 } };\nconst clone = deepClone(original);\nclone.b.c = 99;\nconsole.log(original.b.c); // should be 2\nconsole.log(clone.b.c);   // should be 99",
    solution: "function deepClone(obj) {\n  if (obj === null || typeof obj !== 'object') return obj;\n  if (Array.isArray(obj)) return obj.map(item => deepClone(item));\n  const clone = {};\n  for (const key in obj) {\n    if (obj.hasOwnProperty(key)) {\n      clone[key] = deepClone(obj[key]);\n    }\n  }\n  return clone;\n}\n\nconst original = { a: 1, b: { c: 2 } };\nconst clone = deepClone(original);\nclone.b.c = 99;\nconsole.log(original.b.c);\nconsole.log(clone.b.c);",
    testCases: "deepClone({a:1}).a === 1\ndeepClone([1,2,3]).length === 3",
    hint: "Recursively clone each property. Handle arrays and null checks." },
  { id: 6, title: "Pub/Sub Event Emitter", difficulty: "hard", category: "Patterns",
    description: "Implement a simple EventEmitter with on, off, and emit methods.",
    starterCode: "class EventEmitter {\n  // Your code here\n  \n}\n\nconst bus = new EventEmitter();\nbus.on('data', (msg) => console.log('Received:', msg));\nbus.emit('data', 'hello');\nbus.off('data');\nbus.emit('data', 'ignored');",
    solution: "class EventEmitter {\n  #events = {};\n  on(event, fn) {\n    (this.#events[event] ??= []).push(fn);\n    return this;\n  }\n  off(event, fn) {\n    if (!fn) {\n      delete this.#events[event];\n    } else {\n      this.#events[event] = (this.#events[event] || []).filter(f => f !== fn);\n    }\n    return this;\n  }\n  emit(event, ...args) {\n    (this.#events[event] || []).forEach(fn => fn(...args));\n    return this;\n  }\n}\n\nconst bus = new EventEmitter();\nbus.on('data', (msg) => console.log('Received:', msg));\nbus.emit('data', 'hello');\nbus.off('data');\nbus.emit('data', 'ignored');",
    testCases: "const e = new EventEmitter(); let called = false;\ne.on('test', () => called = true);\ne.emit('test');\ncalled === true",
    hint: "Use a Map or object to store event names mapped to arrays of callback functions." },
  { id: 7, title: "Memoization Function", difficulty: "hard", category: "Patterns",
    description: "Create a memoize function that caches results of expensive function calls.",
    starterCode: "function memoize(fn) {\n  // Your code here\n  \n}\n\nconst expensiveCalc = memoize((n) => {\n  console.log('Computing...');\n  return n * n;\n});\n\nconsole.log(expensiveCalc(5)); // Computing... 25\nconsole.log(expensiveCalc(5)); // 25 (cached!)\nconsole.log(expensiveCalc(3)); // Computing... 9",
    solution: "function memoize(fn) {\n  const cache = new Map();\n  return function(...args) {\n    const key = JSON.stringify(args);\n    if (cache.has(key)) return cache.get(key);\n    const result = fn.apply(this, args);\n    cache.set(key, result);\n    return result;\n  };\n}\n\nconst expensiveCalc = memoize((n) => {\n  console.log('Computing...');\n  return n * n;\n});\n\nconsole.log(expensiveCalc(5));\nconsole.log(expensiveCalc(5));\nconsole.log(expensiveCalc(3));",
    testCases: "const m = memoize(x => x * 2);\nm(5) === 10 && m(5) === 10",
    hint: "Use a Map to store results keyed by JSON.stringify(arguments)." },
  { id: 8, title: "Implement Promise.all", difficulty: "hard", category: "Async",
    description: "Implement your own version of Promise.all that takes an array of promises and returns a single promise.",
    starterCode: "function promiseAll(promises) {\n  // Your code here\n  \n}\n\n// Test\npromiseAll([\n  Promise.resolve(1),\n  Promise.resolve(2),\n  Promise.resolve(3)\n]).then(results => {\n  console.log(results); // [1, 2, 3]\n});",
    solution: "function promiseAll(promises) {\n  return new Promise((resolve, reject) => {\n    const results = [];\n    let completed = 0;\n    if (promises.length === 0) {\n      resolve([]);\n      return;\n    }\n    promises.forEach((promise, i) => {\n      Promise.resolve(promise).then(value => {\n        results[i] = value;\n        completed++;\n        if (completed === promises.length) resolve(results);\n      }).catch(reject);\n    });\n  });\n}\n\npromiseAll([\n  Promise.resolve(1),\n  Promise.resolve(2),\n  Promise.resolve(3)\n]).then(results => {\n  console.log(results);\n});",
    testCases: "promiseAll([]) instanceof Promise",
    hint: "Create a new Promise. Track completion count. Use Promise.resolve() to wrap each input." },
  { id: 9, title: "Count Character Frequency", difficulty: "easy", category: "Strings",
    description: "Write a function that returns an object with character frequencies.",
    starterCode: "function charFrequency(str) {\n  // Your code here\n  \n}\n\nconsole.log(charFrequency('hello'));\n// { h: 1, e: 1, l: 2, o: 1 }",
    solution: "function charFrequency(str) {\n  const freq = {};\n  for (const char of str) {\n    freq[char] = (freq[char] || 0) + 1;\n  }\n  return freq;\n}\n\nconsole.log(charFrequency('hello'));",
    testCases: "charFrequency('aa').a === 2\ncharFrequency('').constructor === Object",
    hint: "Iterate through the string and increment a counter in an object for each character." },
  { id: 10, title: "Remove Duplicates", difficulty: "easy", category: "Arrays",
    description: "Remove duplicate values from an array without using Set.",
    starterCode: "function removeDuplicates(arr) {\n  // Your code here (don't use Set!)\n  \n}\n\nconsole.log(removeDuplicates([1, 2, 2, 3, 3, 3, 4]));",
    solution: "function removeDuplicates(arr) {\n  return arr.filter((val, i) => arr.indexOf(val) === i);\n}\n\nconsole.log(removeDuplicates([1, 2, 2, 3, 3, 3, 4]));",
    testCases: "removeDuplicates([1,1,2]).join(',') === '1,2'\nremoveDuplicates([]).length === 0",
    hint: "Use filter with indexOf — keep only the first occurrence of each value." },
];

const STORAGE_KEY = "js-hero-daily-challenges";
const diffColor: Record<string, string> = {
  easy: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  medium: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  hard: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
};

function loadCompleted(): Set<number> {
  if (typeof window === "undefined") return new Set();
  try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")); } catch { return new Set(); }
}

function saveCompleted(set: Set<number>) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...set])); } catch { /* ignore */ }
}

export function DailyChallengeView() {
  const [code, setCode] = useState("");
  const [showSolution, setShowSolution] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [completed, setCompleted] = useState<Set<number>>(loadCompleted);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [hasRun, setHasRun] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const today = useMemo(() => {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    );
    return challenges[dayOfYear % challenges.length];
  }, []);

  useEffect(() => {
    setCode(today.starterCode);
    setShowSolution(false);
    setShowHint(false);
    setConsoleOutput([]);
    setHasRun(false);
  }, [today]);

  useEffect(() => {
    saveCompleted(completed);
  }, [completed]);

  // Console message listener
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "console") {
        const { method, args } = e.data;
        const line = args.map((a: string) => String(a)).join(" ");
        setConsoleOutput((prev) => [...prev, { method, line }]);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const handleRun = useCallback(() => {
    if (!iframeRef.current) return;
    const consoleInterceptor = `(function(){var o={};['log','error','warn','info'].forEach(function(m){o[m]=console[m];console[m]=function(){var a=Array.prototype.slice.call(arguments);o[m].apply(console,a);parent.postMessage({type:'console',method:m,args:a.map(function(x){try{return typeof x==='object'?JSON.stringify(x,null,2):String(x);}catch(e){return String(x);}})},'*');};});window.onerror=function(msg,url,line){parent.postMessage({type:'console',method:'error',args:[msg+(line?' (line '+line+')':'')]},'*');};})();`;
    const srcdoc = `<!DOCTYPE html><html><head><style>body{font-family:system-ui,sans-serif;padding:12px;background:#0F172A;color:#e2e8f0;font-size:13px;}</style></head><body><script>${consoleInterceptor}<\/script><script>${code}<\/script></body></html>`;
    iframeRef.current.srcdoc = srcdoc;
    setConsoleOutput([]);
    setHasRun(true);
  }, [code]);

  const handleMarkComplete = useCallback(() => {
    setCompleted((prev) => new Set([...prev, today.id]));
  }, [today]);

  const handleReset = useCallback(() => {
    setCode(today.starterCode);
    setShowSolution(false);
    setShowHint(false);
    setConsoleOutput([]);
    setHasRun(false);
  }, [today]);

  const handleNext = useCallback(() => {
    const idx = challenges.findIndex((c) => c.id === today.id);
    const next = challenges[(idx + 1) % challenges.length];
    setCode(next.starterCode);
    setShowSolution(false);
    setShowHint(false);
    setConsoleOutput([]);
    setHasRun(false);
  }, [today]);

  const progress = (completed.size / challenges.length) * 100;

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
            <Zap className="size-5 text-js-yellow" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Daily Challenge</h2>
            <p className="text-xs text-muted-foreground">
              {completed.size}/{challenges.length} completed · {Math.round(progress)}%
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Flame className="size-4 text-js-orange" />
          <span className="text-sm font-semibold">{completed.size} day streak</span>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-1.5">
        <Progress value={progress} className="h-2" />
      </div>

      {/* Challenge Card */}
      <Card className="overflow-hidden border-border/50">
        <CardContent className="p-4 sm:p-6">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold">{today.title}</h3>
            <Badge variant="outline" className={`text-xs ${diffColor[today.difficulty]}`}>
              {today.difficulty}
            </Badge>
            <Badge variant="outline" className="text-xs">{today.category}</Badge>
            {completed.has(today.id) && (
              <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs">
                <Trophy className="mr-1 size-3" /> Completed
              </Badge>
            )}
          </div>
          <p className="text-sm leading-relaxed text-foreground/85">{today.description}</p>
        </CardContent>
      </Card>

      {/* Editor + Output */}
      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Editor */}
        <div className="flex min-h-[300px] flex-1 flex-col overflow-hidden rounded-xl border border-border/50 bg-card">
          <div className="flex items-center justify-between border-b border-border/50 bg-muted/40 px-4 py-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              solution.js
            </span>
            <div className="flex gap-1.5">
              {showHint && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mr-2 rounded bg-js-yellow/10 px-3 py-1.5 text-xs text-js-yellow">
                  💡 {today.hint}
                </motion.div>
              )}
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowHint((s) => !s)}>
                <Lightbulb className="mr-1 size-3" /> {showHint ? "Hide" : "Hint"}
              </Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowSolution((s) => !s)}>
                {showSolution ? <EyeOff className="mr-1 size-3" /> : <Eye className="mr-1 size-3" />}
                {showSolution ? "Hide" : "Solution"}
              </Button>
            </div>
          </div>
          {showSolution ? (
            <pre className="flex-1 overflow-auto bg-js-darker p-4 text-sm text-foreground/90 code-editor">
              {today.solution}
            </pre>
          ) : (
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="code-editor custom-scrollbar flex-1 resize-none bg-js-darker p-4 text-sm text-foreground focus:outline-none"
              spellCheck={false}
            />
          )}
        </div>

        {/* Output */}
        <div className="flex min-h-[250px] flex-1 flex-col overflow-hidden rounded-xl border border-border/50 bg-card">
          <div className="flex items-center border-b border-border/50 bg-muted/40 px-4 py-2">
            <div className="flex gap-1.5">
              <div className="size-2.5 rounded-full bg-js-rose/70" />
              <div className="size-2.5 rounded-full bg-js-orange/70" />
              <div className="size-2.5 rounded-full bg-js-emerald/70" />
            </div>
            <span className="ml-2 text-xs font-medium text-muted-foreground">Output</span>
          </div>
          <div className="relative flex-1 bg-white">
            {!hasRun && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-js-darker text-muted-foreground">
                <Play className="size-8 text-js-yellow/40" />
                <p className="text-sm">Click &quot;Run&quot; to see output</p>
              </div>
            )}
            <iframe
              ref={iframeRef}
              title="Challenge Output"
              sandbox="allow-scripts"
              className="h-full w-full border-0"
              style={{ minHeight: "100%" }}
            />
          </div>
          {/* Console overlay */}
          {consoleOutput.length > 0 && (
            <div className="max-h-32 overflow-auto border-t border-border/50 bg-js-darker p-2 custom-scrollbar">
              {consoleOutput.map((entry, i) => (
                <p
                  key={i}
                  className={`text-xs font-mono leading-relaxed ${
                    entry.method === "error"
                      ? "text-js-rose"
                      : entry.method === "warn"
                      ? "text-js-yellow"
                      : "text-foreground/70"
                  }`}
                >
                  <span className="mr-1 opacity-50">{'>'}</span>
                  {entry.line}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button className="gap-1.5 bg-js-yellow text-js-darker hover:bg-js-yellow/90 font-semibold" onClick={handleRun}>
          <Play className="size-3.5 fill-current" /> Run Code
        </Button>
        <Button variant="outline" className="gap-1.5" onClick={handleReset}>
          <RotateCcw className="size-3.5" /> Reset
        </Button>
        <Button variant="outline" className="gap-1.5" onClick={handleNext}>
          Next Challenge
        </Button>
        {!completed.has(today.id) && (
          <Button
            className="gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white"
            onClick={handleMarkComplete}
          >
            <CheckCircle2 className="size-3.5" /> Mark Complete
          </Button>
        )}
      </div>
    </motion.div>
  );
}