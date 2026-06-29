"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  Activity,
  Play,
  SkipForward,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

// ═══════════════════════════════════════════════════════
// 1. ARRAY VISUALIZER
// ═══════════════════════════════════════════════════════

const ARRAY_COLORS = [
  "bg-js-yellow", "bg-js-sky", "bg-js-violet", "bg-js-emerald",
  "bg-js-orange", "bg-js-rose", "bg-pink-500", "bg-cyan-500",
];

function ArrayVisualizer() {
  const [input, setInput] = useState("[3, 1, 4, 1, 5, 9, 2, 6]");
  const [arr, setArr] = useState<number[]>([3, 1, 4, 1, 5, 9, 2, 6]);
  const [highlightIdx, setHighlightIdx] = useState<number | null>(null);
  const [actionLog, setActionLog] = useState<string[]>([]);

  const log = useCallback((msg: string) => {
    setActionLog((prev) => [msg, ...prev].slice(0, 20));
  }, []);

  const parseAndSet = useCallback(() => {
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed) && parsed.every((n) => typeof n === "number")) {
        setArr(parsed);
        log(`Array set to [${parsed.join(", ")}]`);
      } else {
        log("Error: Must be an array of numbers");
      }
    } catch {
      log("Error: Invalid JSON array");
    }
  }, [input, log]);

  const pushItem = useCallback(() => {
    const val = Math.floor(Math.random() * 10);
    const newArr = [...arr, val];
    setArr(newArr);
    setInput(JSON.stringify(newArr));
    setHighlightIdx(newArr.length - 1);
    log(`push(${val}) → length is now ${newArr.length}`);
    setTimeout(() => setHighlightIdx(null), 800);
  }, [arr, log]);

  const popItem = useCallback(() => {
    if (arr.length === 0) { log("Cannot pop from empty array"); return; }
    const removed = arr[arr.length - 1];
    const newArr = arr.slice(0, -1);
    setArr(newArr);
    setInput(JSON.stringify(newArr));
    log(`pop() → removed ${removed}`);
  }, [arr, log]);

  const shiftItem = useCallback(() => {
    if (arr.length === 0) { log("Cannot shift from empty array"); return; }
    const removed = arr[0];
    const newArr = arr.slice(1);
    setArr(newArr);
    setInput(JSON.stringify(newArr));
    setHighlightIdx(-1);
    log(`shift() → removed ${removed}`);
    setTimeout(() => setHighlightIdx(null), 800);
  }, [arr, log]);

  const unshiftItem = useCallback(() => {
    const val = Math.floor(Math.random() * 10);
    const newArr = [val, ...arr];
    setArr(newArr);
    setInput(JSON.stringify(newArr));
    setHighlightIdx(0);
    log(`unshift(${val}) → length is now ${newArr.length}`);
    setTimeout(() => setHighlightIdx(null), 800);
  }, [arr, log]);

  const sortArr = useCallback(() => {
    const newArr = [...arr].sort((a, b) => a - b);
    setArr(newArr);
    setInput(JSON.stringify(newArr));
    log(`sort() → [${newArr.join(", ")}]`);
  }, [arr, log]);

  const reverseArr = useCallback(() => {
    const newArr = [...arr].reverse();
    setArr(newArr);
    setInput(JSON.stringify(newArr));
    log(`reverse() → [${newArr.join(", ")}]`);
  }, [arr, log]);

  const mapArr = useCallback(() => {
    const newArr = arr.map((x) => x * 2);
    setArr(newArr);
    setInput(JSON.stringify(newArr));
    log(`map(x => x * 2) → [${newArr.join(", ")}]`);
  }, [arr, log]);

  const filterArr = useCallback(() => {
    const newArr = arr.filter((x) => x > 3);
    setArr(newArr);
    setInput(JSON.stringify(newArr));
    log(`filter(x => x > 3) → [${newArr.join(", ")}]`);
  }, [arr, log]);

  const maxVal = Math.max(...arr, 1);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="flex-1">
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Array Input
          </label>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="code-editor min-h-[80px] bg-js-darker text-sm"
            placeholder="[1, 2, 3, 4, 5]"
          />
          <Button size="sm" className="mt-2 gap-1.5 bg-js-yellow text-js-darker hover:bg-js-yellow/90" onClick={parseAndSet}>
            <Play className="size-3 fill-current" />
            Set Array
          </Button>
        </div>
        <div className="w-full lg:w-48 space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">Operations</p>
          {[
            ["push()", pushItem], ["pop()", popItem], ["shift()", shiftItem],
            ["unshift()", unshiftItem], ["sort()", sortArr], ["reverse()", reverseArr],
            ["map(x*2)", mapArr], ["filter(>3)", filterArr],
          ].map(([label, fn]) => (
            <Button key={String(label)} variant="outline" size="sm" className="w-full justify-start text-xs" onClick={fn as () => void}>
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Visual bars */}
      <div className="rounded-xl border border-border/50 bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Array Visualization</span>
          <Badge variant="outline" className="text-[10px]">length: {arr.length}</Badge>
        </div>
        {arr.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-muted-foreground text-sm">Empty array</div>
        ) : (
          <div className="flex items-end gap-2" style={{ height: 160 }}>
            <LayoutGroup>
              {arr.map((val, i) => (
                <motion.div
                  key={`${i}-${val}`}
                  layout
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="flex flex-1 flex-col items-center gap-1"
                >
                  <span className="text-xs font-bold text-foreground">{val}</span>
                  <motion.div
                    className={`w-full rounded-t-md ${ARRAY_COLORS[i % ARRAY_COLORS.length]} ${
                      highlightIdx === i ? "ring-2 ring-white ring-offset-1 ring-offset-js-darker" : ""
                    }`}
                    animate={{
                      height: `${Math.max((val / maxVal) * 120, 8)}px`,
                      opacity: highlightIdx === i ? 1 : 0.8,
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                  <span className="text-[10px] text-muted-foreground">[{i}]</span>
                </motion.div>
              ))}
            </LayoutGroup>
          </div>
        )}
      </div>

      {/* Log */}
      {actionLog.length > 0 && (
        <div className="rounded-xl border border-border/50 bg-js-darker p-3">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Console Log</p>
          <ScrollArea className="max-h-24">
            {actionLog.map((msg, i) => (
              <p key={i} className="text-xs leading-relaxed text-foreground/70 font-mono">
                <span className="text-js-emerald mr-1">→</span> {msg}
              </p>
            ))}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// 2. CALL STACK VISUALIZER
// ═══════════════════════════════════════════════════════

interface StackFrame {
  id: number;
  name: string;
  args?: string;
  line?: number;
  isHighlight?: boolean;
  isReturning?: boolean;
  returnValue?: string;
}

function CallStackVisualizer() {
  const [code, setCode] = useState(`function add(a, b) {
  return a + b;
}

function multiply(a, b) {
  return a * b;
}

function calculate() {
  const sum = add(3, 4);
  const product = multiply(sum, 2);
  console.log(product);
}

calculate();`);

  const [stack, setStack] = useState<StackFrame[]>([]);
  const [output, setOutput] = useState<string[]>([]);
  const [step, setStep] = useState(0);
  const [steps, setSteps] = useState<{ stack: StackFrame[]; output: string; desc: string }[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const generateSteps = useCallback((source: string) => {
    const s: { stack: StackFrame[]; output: string; desc: string }[] = [];
    const currentStack: StackFrame[] = [];
    let id = 0;

    // Simple parser for common patterns
    const funcRegex = /function\s+(\w+)\s*\(([^)]*)\)/g;
    const callRegex = /(\w+)\(([^)]*)\)/g;
    const logRegex = /console\.log\(([^)]*)\)/g;

    const funcs = new Map<string, string[]>();
    let m;
    while ((m = funcRegex.exec(source)) !== null) {
      funcs.set(m[1], m[2].split(",").map((a) => a.trim()));
    }

    // Parse function calls in order of appearance
    const lines = source.split("\n").filter((l) => l.trim() && !l.trim().startsWith("function") && !l.trim().startsWith("//"));
    
    // Default demo steps
    const defaultSteps = [
      { stack: [{ id: id++, name: "Global", isHighlight: true }], output: "", desc: "Global execution context created" },
      { stack: [{ id: 0, name: "Global" }, { id: id++, name: "calculate()", args: "", isHighlight: true }], output: "", desc: "Calling calculate()" },
      { stack: [{ id: 0, name: "Global" }, { id: 1, name: "calculate()" }, { id: id++, name: "add(3, 4)", args: "a=3, b=4", isHighlight: true }], output: "", desc: "Calling add(3, 4)" },
      { stack: [{ id: 0, name: "Global" }, { id: 1, name: "calculate()" }, { id: 2, name: "add(3, 4)", isReturning: true, returnValue: "7" }], output: "", desc: "add returns 7" },
      { stack: [{ id: 0, name: "Global" }, { id: 1, name: "calculate()", isHighlight: true }], output: "", desc: "Back to calculate(), sum = 7" },
      { stack: [{ id: 0, name: "Global" }, { id: 1, name: "calculate()" }, { id: id++, name: "multiply(7, 2)", args: "a=7, b=2", isHighlight: true }], output: "", desc: "Calling multiply(7, 2)" },
      { stack: [{ id: 0, name: "Global" }, { id: 1, name: "calculate()" }, { id: 3, name: "multiply(7, 2)", isReturning: true, returnValue: "14" }], output: "", desc: "multiply returns 14" },
      { stack: [{ id: 0, name: "Global" }, { id: 1, name: "calculate()", isHighlight: true }], output: "14", desc: "console.log(14) — output: 14" },
      { stack: [{ id: 0, name: "Global", isHighlight: true }], output: "14", desc: "calculate() returns. Stack is empty." },
    ];

    return defaultSteps;
  }, []);

  const handleRun = useCallback(() => {
    const s = generateSteps(code);
    setSteps(s);
    setStep(0);
    setStack(s[0]?.stack || []);
    setOutput(s[0]?.output ? [s[0].output] : []);
    setIsRunning(true);
  }, [code, generateSteps]);

  const handleNext = useCallback(() => {
    const next = step + 1;
    if (next < steps.length) {
      setStep(next);
      setStack(steps[next].stack);
      if (steps[next].output) {
        setOutput((prev) => [...prev, steps[next].output]);
      }
    } else {
      setIsRunning(false);
    }
  }, [step, steps]);

  const handleReset = useCallback(() => {
    setStack([]);
    setOutput([]);
    setStep(0);
    setSteps([]);
    setIsRunning(false);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="flex-1">
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Code</label>
          <Textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="code-editor min-h-[200px] bg-js-darker text-sm"
            disabled={isRunning}
          />
          <div className="mt-2 flex gap-2">
            <Button size="sm" className="gap-1.5 bg-js-yellow text-js-darker hover:bg-js-yellow/90" onClick={handleRun} disabled={isRunning}>
              <Play className="size-3 fill-current" /> Run
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={handleNext} disabled={!isRunning || step >= steps.length - 1}>
              <SkipForward className="size-3" /> Step
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={handleReset}>
              <RotateCcw className="size-3" /> Reset
            </Button>
          </div>
        </div>

        <div className="w-full lg:w-64 space-y-3">
          {/* Call Stack Visual */}
          <Card className="overflow-hidden border-border/50">
            <div className="border-b border-border/50 bg-muted/40 px-3 py-2">
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Call Stack</span>
              {isRunning && (
                <Badge variant="outline" className="ml-2 text-[10px]">Step {step + 1}/{steps.length}</Badge>
              )}
            </div>
            <div className="min-h-[200px] bg-js-darker p-2">
              {stack.length === 0 ? (
                <div className="flex h-full items-center justify-center text-muted-foreground text-xs">Stack is empty</div>
              ) : (
                <div className="flex flex-col-reverse gap-1.5">
                  {stack.map((frame, i) => (
                    <motion.div
                      key={frame.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`rounded-lg border px-3 py-2 text-xs font-mono ${
                        frame.isHighlight
                          ? "border-js-yellow bg-js-yellow/10 text-js-yellow"
                          : frame.isReturning
                          ? "border-js-emerald/50 bg-js-emerald/10 text-js-emerald"
                          : "border-border/30 bg-muted/30 text-foreground/70"
                      }`}
                    >
                      <div className="font-semibold">{frame.name}</div>
                      {frame.args && <div className="text-[10px] opacity-70">{frame.args}</div>}
                      {frame.returnValue && <div className="text-[10px] text-js-emerald">returns: {frame.returnValue}</div>}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Description */}
          {steps[step] && (
            <motion.div
              key={step}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-lg bg-js-yellow/5 border border-js-yellow/20 px-3 py-2 text-xs text-foreground/80"
            >
              {steps[step].desc}
            </motion.div>
          )}

          {/* Output */}
          {output.length > 0 && (
            <Card className="overflow-hidden border-border/50">
              <div className="border-b border-border/50 bg-muted/40 px-3 py-2">
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Console Output</span>
              </div>
              <div className="bg-js-darker p-2">
                {output.map((line, i) => (
                  <p key={i} className="text-xs font-mono text-foreground/70">
                    <span className="text-js-yellow mr-1">&gt;</span> {line}
                  </p>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// 3. EVENT LOOP VISUALIZER
// ═══════════════════════════════════════════════════════

interface ELStep {
  callStack: string[];
  webApis: string[];
  microQueue: string[];
  macroQueue: string[];
  console: string;
  desc: string;
  highlight: string;
}

function ELQueueBox({ title, items, color, highlightName, isHighlighted }: { title: string; items: string[]; color: string; highlightName: string; isHighlighted: boolean }) {
  return (
    <div className={`rounded-lg border px-3 py-2 transition-all ${
      isHighlighted ? "border-js-yellow ring-1 ring-js-yellow/30" : "border-border/50"
    }`}>
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
      <div className="min-h-[40px] space-y-1">
        {items.length === 0 ? (
          <p className="text-[10px] text-muted-foreground/50 italic">empty</p>
        ) : (
          items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`rounded px-2 py-1 text-[11px] font-mono ${color}`}
            >
              {item}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

function EventLoopVisualizer() {
  const defaultCode = `console.log("Start");

setTimeout(() => {
  console.log("Timeout");
}, 0);

Promise.resolve().then(() => {
  console.log("Promise 1");
}).then(() => {
  console.log("Promise 2");
});

console.log("End");`;

  const [code, setCode] = useState(defaultCode);
  const [step, setStep] = useState(0);
  const [steps, setSteps] = useState<ELStep[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const generateSteps = useCallback(() => {
    return [
      { callStack: [], webApis: [], microQueue: [], macroQueue: [], console: "", desc: "Program starts. The call stack is empty.", highlight: "stack" },
      { callStack: ['"Start"'], webApis: [], microQueue: [], macroQueue: [], console: "Start", desc: 'console.log("Start") executes synchronously.', highlight: "stack" },
      { callStack: [], webApis: ["setTimeout(cb, 0)"], microQueue: [], macroQueue: [], console: "Start", desc: "setTimeout is encountered. The callback is sent to Web APIs.", highlight: "webapi" },
      { callStack: [], webApis: ["setTimeout(cb, 0)"], microQueue: ["then: Promise 1"], macroQueue: [], console: "Start", desc: "Promise.resolve().then() — the callback goes to the Microtask Queue.", highlight: "micro" },
      { callStack: ['"End"'], webApis: ["setTimeout(cb, 0)"], microQueue: ["then: Promise 1"], macroQueue: [], console: "Start\nEnd", desc: 'console.log("End") executes synchronously.', highlight: "stack" },
      { callStack: [], webApis: [], microQueue: ["then: Promise 1"], macroQueue: ["setTimeout cb"], console: "Start\nEnd", desc: "Call stack is empty. Web APIs timer fires — callback moves to Macro Queue.", highlight: "macro" },
      { callStack: ['then: Promise 1'], webApis: [], microQueue: [], macroQueue: ["setTimeout cb"], console: "Start\nEnd\nPromise 1", desc: "Event loop checks Microtask Queue first. Promise 1 callback executes.", highlight: "micro" },
      { callStack: [], webApis: [], microQueue: ["then: Promise 2"], macroQueue: ["setTimeout cb"], console: "Start\nEnd\nPromise 1", desc: "Promise 1 returns a new Promise. then(Promise 2) goes to Microtask Queue.", highlight: "micro" },
      { callStack: ['then: Promise 2'], webApis: [], microQueue: [], macroQueue: ["setTimeout cb"], console: "Start\nEnd\nPromise 1\nPromise 2", desc: "Microtask Queue is processed again. Promise 2 callback executes.", highlight: "micro" },
      { callStack: ['setTimeout cb'], webApis: [], microQueue: [], macroQueue: [], console: "Start\nEnd\nPromise 1\nPromise 2\nTimeout", desc: "Microtask Queue empty. Event loop moves setTimeout callback from Macro Queue to Call Stack.", highlight: "macro" },
      { callStack: [], webApis: [], microQueue: [], macroQueue: [], console: "Start\nEnd\nPromise 1\nPromise 2\nTimeout", desc: "All queues empty. Program finishes.", highlight: "done" },
    ];
  }, []);

  const handleRun = useCallback(() => {
    const s = generateSteps();
    setSteps(s);
    setStep(0);
    setIsRunning(true);
  }, [generateSteps]);

  const handleNext = useCallback(() => {
    if (step < steps.length - 1) setStep((s) => s + 1);
    else setIsRunning(false);
  }, [step, steps.length]);

  const handleReset = useCallback(() => {
    setSteps([]);
    setStep(0);
    setIsRunning(false);
  }, []);

  const current = steps[step];

  const QueueBox = ({ title, items, color, highlightName }: { title: string; items: string[]; color: string; highlightName: string }) => (
    <div className={`rounded-lg border px-3 py-2 transition-all ${
      current?.highlight === highlightName ? "border-js-yellow ring-1 ring-js-yellow/30" : "border-border/50"
    }`}>
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
      <div className="min-h-[40px] space-y-1">
        {items.length === 0 ? (
          <p className="text-[10px] text-muted-foreground/50 italic">empty</p>
        ) : (
          items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`rounded px-2 py-1 text-[11px] font-mono ${color}`}
            >
              {item}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="flex-1">
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Code</label>
          <Textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="code-editor min-h-[180px] bg-js-darker text-sm"
            disabled={isRunning}
          />
          <div className="mt-2 flex gap-2">
            <Button size="sm" className="gap-1.5 bg-js-yellow text-js-darker hover:bg-js-yellow/90" onClick={handleRun} disabled={isRunning}>
              <Play className="size-3 fill-current" /> Run
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={handleNext} disabled={!isRunning || step >= (steps.length - 1)}>
              <SkipForward className="size-3" /> Step
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={handleReset}>
              <RotateCcw className="size-3" /> Reset
            </Button>
          </div>
        </div>

        <div className="w-full lg:w-80 space-y-3">
          {isRunning && (
            <Badge variant="outline" className="text-[10px]">Step {step + 1}/{steps.length}</Badge>
          )}

          <div className="grid grid-cols-2 gap-2">
            <ELQueueBox title="Call Stack" items={current?.callStack || []} color="bg-js-rose/15 text-js-rose" highlightName="stack" isHighlighted={current?.highlight === "stack"} />
            <ELQueueBox title="Web APIs" items={current?.webApis || []} color="bg-js-orange/15 text-js-orange" highlightName="webapi" isHighlighted={current?.highlight === "webapi"} />
            <ELQueueBox title="Microtask Q" items={current?.microQueue || []} color="bg-js-violet/15 text-js-violet" highlightName="micro" isHighlighted={current?.highlight === "micro"} />
            <ELQueueBox title="Callback Q" items={current?.macroQueue || []} color="bg-js-emerald/15 text-js-emerald" highlightName="macro" isHighlighted={current?.highlight === "macro"} />
          </div>

          {current && (
            <motion.div
              key={step}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-lg bg-js-yellow/5 border border-js-yellow/20 px-3 py-2 text-xs text-foreground/80"
            >
              {current.desc}
            </motion.div>
          )}

          {current?.console && (
            <div className="rounded-lg border border-border/50 bg-js-darker p-2">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Console</p>
              {current.console.split("\n").map((line, i) => (
                <p key={i} className="text-xs font-mono text-foreground/70"><span className="text-js-yellow mr-1">&gt;</span>{line}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// 4. PROMISE VISUALIZER
// ═══════════════════════════════════════════════════════

interface PromiseState {
  id: number;
  label: string;
  status: "pending" | "fulfilled" | "rejected";
  value?: string;
}

function PromiseVisualizer() {
  const [step, setStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const steps: { promises: PromiseState[]; timeline: string; desc: string }[] = [
    { promises: [
      { id: 1, label: "p1", status: "pending" },
      { id: 2, label: "p2", status: "pending" },
    ], timeline: "", desc: "Two promises created. Both are pending." },
    { promises: [
      { id: 1, label: "p1", status: "pending" },
      { id: 2, label: "p2", status: "fulfilled", value: "42" },
    ], timeline: "p2: fulfilled (42)", desc: "p2 resolves with value 42." },
    { promises: [
      { id: 1, label: "p1", status: "fulfilled", value: "hello" },
      { id: 2, label: "p2", status: "fulfilled", value: "42" },
    ], timeline: "p2: fulfilled (42)\np1: fulfilled (hello)", desc: "p1 resolves with value 'hello'." },
    { promises: [
      { id: 1, label: "p1", status: "fulfilled", value: "hello" },
      { id: 2, label: "p2", status: "fulfilled", value: "42" },
    ], timeline: "p2: fulfilled (42)\np1: fulfilled (hello)\n✅ Promise.all resolved: [hello, 42]", desc: "Promise.all resolves! Both promises fulfilled. Returns [hello, 42]." },
  ];

  const handleRun = useCallback(() => {
    setStep(0);
    setIsRunning(true);
  }, []);

  const handleNext = useCallback(() => {
    if (step < steps.length - 1) setStep((s) => s + 1);
    else setIsRunning(false);
  }, [step, steps.length]);

  const handleReset = useCallback(() => {
    setStep(0);
    setIsRunning(false);
  }, []);

  const current = steps[step];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        <Button size="sm" className="gap-1.5 bg-js-yellow text-js-darker hover:bg-js-yellow/90" onClick={handleRun} disabled={isRunning}>
          <Play className="size-3 fill-current" /> Run Promise.all Demo
        </Button>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={handleNext} disabled={!isRunning || step >= steps.length - 1}>
          <SkipForward className="size-3" /> Step
        </Button>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={handleReset}>
          <RotateCcw className="size-3" /> Reset
        </Button>
      </div>

      {isRunning && (
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Promises */}
          <div className="space-y-3">
            {current.promises.map((p) => (
              <motion.div
                key={p.id}
                animate={{
                  borderColor: p.status === "fulfilled" ? "#10B981" : p.status === "rejected" ? "#F43F5E" : "var(--border)",
                }}
                className="rounded-xl border-2 border-border/50 bg-card p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold font-mono">{p.label}</span>
                  <Badge
                    className={
                      p.status === "fulfilled"
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                        : p.status === "rejected"
                        ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30"
                        : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                    }
                    variant="outline"
                  >
                    {p.status}
                  </Badge>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: "0%" }}
                    animate={{
                      width: p.status === "pending" ? "30%" : "100%",
                      backgroundColor: p.status === "fulfilled" ? "#10B981" : p.status === "rejected" ? "#F43F5E" : "#F59E0B",
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                {p.value && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-xs font-mono text-muted-foreground">
                    Value: <span className="text-foreground">{p.value}</span>
                  </motion.p>
                )}
              </motion.div>
            ))}
          </div>

          {/* Timeline */}
          <div className="rounded-xl border border-border/50 bg-card p-4">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Timeline</p>
            <div className="space-y-2 font-mono text-xs">
              {current.timeline.split("\n").map((line, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`leading-relaxed ${line.startsWith("✅") ? "text-js-emerald font-semibold" : "text-foreground/70"}`}
                >
                  {line}
                </motion.p>
              ))}
            </div>
            {isRunning && (
              <Badge variant="outline" className="mt-3 text-[10px]">Step {step + 1}/{steps.length}</Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// MAIN VIEW
// ═══════════════════════════════════════════════════════

export function VisualizersView() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-js-yellow/15">
          <Activity className="size-5 text-js-yellow" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight">Interactive Visualizers</h2>
          <p className="text-xs text-muted-foreground">
            Watch JavaScript concepts come alive
          </p>
        </div>
      </div>

      <Tabs defaultValue="array" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="array" className="gap-1.5 data-[state=active]:bg-js-yellow/10 data-[state=active]:text-js-yellow">
            📊 Array
          </TabsTrigger>
          <TabsTrigger value="callstack" className="gap-1.5 data-[state=active]:bg-js-yellow/10 data-[state=active]:text-js-yellow">
            📚 Call Stack
          </TabsTrigger>
          <TabsTrigger value="eventloop" className="gap-1.5 data-[state=active]:bg-js-yellow/10 data-[state=active]:text-js-yellow">
            🔄 Event Loop
          </TabsTrigger>
          <TabsTrigger value="promise" className="gap-1.5 data-[state=active]:bg-js-yellow/10 data-[state=active]:text-js-yellow">
            ⚡ Promises
          </TabsTrigger>
        </TabsList>

        <TabsContent value="array" className="mt-4">
          <ArrayVisualizer />
        </TabsContent>
        <TabsContent value="callstack" className="mt-4">
          <CallStackVisualizer />
        </TabsContent>
        <TabsContent value="eventloop" className="mt-4">
          <EventLoopVisualizer />
        </TabsContent>
        <TabsContent value="promise" className="mt-4">
          <PromiseVisualizer />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}