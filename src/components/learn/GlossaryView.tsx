"use client";

import { useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { FileText, Search, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface GlossaryTerm {
  term: string;
  definition: string;
  category: string;
  example?: string;
}

const terms: GlossaryTerm[] = [
  { term: "Argument", definition: "A value passed to a function when it is called.", category: "Core Concepts", example: "greet('Alice') // 'Alice' is the argument" },
  { term: "Arrow Function", definition: "A concise function syntax using =>. Does not have its own this, arguments, super, or new.target.", category: "ES6+", example: "const add = (a, b) => a + b;" },
  { term: "Async/Await", definition: "Syntactic sugar over Promises. async makes a function return a Promise, await pauses execution until the Promise resolves.", category: "Async", example: "const data = await fetch(url);" },
  { term: "Block Scope", definition: "Variables declared with let/const are only accessible within the nearest curly braces {} block.", category: "Core Concepts", example: "if (true) { let x = 1; } // x not accessible here" },
  { term: "Callback", definition: "A function passed as an argument to another function to be executed later.", category: "Functions", example: "[1,2,3].map(n => n * 2); // arrow fn is the callback" },
  { term: "Closure", definition: "A function that retains access to its lexical scope variables even after the outer function has returned.", category: "Functions", example: "function counter() { let n=0; return ()=>++n; }" },
  { term: "Constructor", definition: "A special method called when creating an object with new. Initializes the object's properties.", category: "OOP", example: "class Dog { constructor(name) { this.name = name; } }" },
  { term: "Destructuring", definition: "Syntax to unpack values from arrays or properties from objects into distinct variables.", category: "ES6+", example: "const { name, age } = user;" },
  { term: "DOM", definition: "Document Object Model. A tree-structured representation of an HTML document that JavaScript can manipulate.", category: "DOM", example: "document.getElementById('app')" },
  { term: "Event Bubbling", definition: "Events propagate from the target element up through its ancestors in the DOM tree.", category: "DOM", example: "Child click -> Parent click -> Body click" },
  { term: "Event Delegation", definition: "Attaching a single event listener to a parent element to handle events from its children via bubbling.", category: "DOM" },
  { term: "Event Loop", definition: "The mechanism that checks if the call stack is empty and moves callbacks from the queue to the stack for execution.", category: "Async" },
  { term: "First-Class Function", definition: "Functions in JavaScript are treated as values — they can be assigned to variables, passed as arguments, and returned from functions.", category: "Functions", example: "const fn = function() {};" },
  { term: "Framer Motion", definition: "A React animation library that provides declarative animations and gesture support.", category: "Tools" },
  { term: "Function Expression", definition: "A function defined as part of an expression, typically assigned to a variable. Not hoisted.", category: "Functions", example: "const add = function(a, b) { return a + b; };" },
  { term: "Function Scope", definition: "Variables declared with var are accessible throughout the entire function where they are declared.", category: "Core Concepts" },
  { term: "Generator", definition: "A function that can be paused and resumed using the yield keyword. Returns an iterator.", category: "ES6+", example: "function* gen() { yield 1; yield 2; }" },
  { term: "Hoisting", definition: "JavaScript moves variable and function declarations to the top of their scope during compilation. Only declarations are hoisted, not assignments.", category: "Core Concepts", example: "console.log(x); // undefined (var hoisted)\nvar x = 5;" },
  { term: "IIFE", definition: "Immediately Invoked Function Expression. A function that runs as soon as it is defined.", category: "Functions", example: "(function() { console.log('now'); })();" },
  { term: "Inheritance", definition: "Objects can inherit properties and methods from other objects via the prototype chain or the class extends keyword.", category: "OOP", example: "class Dog extends Animal { }" },
  { term: "Iterator", definition: "An object that defines a next() method returning { value, done }. Used with for...of loops.", category: "ES6+" },
  { term: "JSON", definition: "JavaScript Object Notation. A lightweight data interchange format. String key-value pairs.", category: "Core Concepts", example: `{"name": "Alice", "age": 25}` },
  { term: "Lexical Scope", definition: "Scope determined by where functions and variables are written in the code. Inner functions have access to outer scope variables.", category: "Core Concepts" },
  { term: "Map", definition: "A collection of key-value pairs where keys can be any type. Maintains insertion order. Has size property.", category: "ES6+", example: "const m = new Map(); m.set('key', 'val');" },
  { term: "Microtask", definition: "Tasks from Promise callbacks (then/catch/finally) that execute before macrotasks (setTimeout) in the event loop.", category: "Async" },
  { term: "Nullish Coalescing", definition: "The ?? operator returns the right operand only when the left is null or undefined.", category: "ES6+", example: "0 ?? 42 // 0 (not 42 like ||)" },
  { term: "Object Destructuring", definition: "Extracting properties from objects into variables using {} syntax.", category: "ES6+", example: "const { name, age = 0 } = user;" },
  { term: "Optional Chaining", definition: "The ?. operator safely accesses nested properties. Returns undefined if any link is null/undefined.", category: "ES6+", example: "user?.address?.city" },
  { term: "Polyfill", definition: "Code that provides modern functionality in older browsers that don't support it natively.", category: "Tools" },
  { term: "Promise", definition: "An object representing the eventual completion or failure of an asynchronous operation.", category: "Async", example: "new Promise((resolve, reject) => { })" },
  { term: "Prototype", definition: "Every JavaScript object has a prototype, from which it inherits properties and methods.", category: "Core Concepts", example: "Object.getPrototypeOf(obj)" },
  { term: "Proxy", definition: "An object that wraps another object and intercepts fundamental operations like get, set, and delete.", category: "ES6+", example: "new Proxy(target, { get(t, p) { } })" },
  { term: "Recursion", definition: "A function that calls itself until it reaches a base case. Used for problems that can be broken into smaller sub-problems.", category: "Functions", example: "function fact(n) { return n <= 1 ? 1 : n * fact(n-1); }" },
  { term: "Rest Parameter", definition: "The ...args syntax collects remaining function arguments into an array.", category: "ES6+", example: "function sum(...nums) { return nums.reduce((a,b)=>a+b); }" },
  { term: "Set", definition: "A collection of unique values. Values of any type. Has size property and methods like add, delete, has.", category: "ES6+", example: "const s = new Set([1, 2, 2, 3]); // Set{1,2,3}" },
  { term: "Shadow DOM", definition: "Encapsulated DOM tree attached to an element, isolated from the main document's styles and scripts.", category: "DOM" },
  { term: "Spread Operator", definition: "The ... syntax expands an iterable into individual elements. Used for copying arrays/objects and passing arguments.", category: "ES6+", example: "const copy = [...arr]; const merged = {...a, ...b};" },
  { term: "Symbol", definition: "A primitive type that creates unique identifiers. Often used for object property keys that won't collide.", category: "ES6+", example: "const id = Symbol('unique');" },
  { term: "Template Literal", definition: "Strings using backticks that support embedded expressions ${} and multi-line text.", category: "ES6+", example: "`Hello, ${name}! You are ${age}.`" },
  { term: "This", definition: "A keyword that refers to the object that is executing the current function. Its value depends on how the function is called.", category: "Core Concepts", example: "const obj = { name: 'A', greet() { return this.name; } };" },
  { term: "Type Coercion", definition: "Automatic or implicit conversion of values from one type to another.", category: "Core Concepts", example: "'5' + 3 // '53' (string)\n'5' - 3 // 2 (number)" },
  { term: "WeakMap", definition: "Like Map but keys must be objects and entries are garbage-collected when the key is no longer referenced.", category: "ES6+" },
  { term: "WeakRef", definition: "A weak reference to an object that does not prevent garbage collection.", category: "ES6+" },
  { term: "Web API", definition: "Browser-provided APIs like setTimeout, fetch, DOM, console, localStorage, etc. Not part of the JS language itself.", category: "Core Concepts" },
  { term: "Yield", definition: "Pauses a generator function's execution and returns a value. The function resumes when next() is called.", category: "ES6+", example: "function* gen() { yield 1; yield 2; }" },
  { term: "Mutation", definition: "Changing an object or array in place. Contrast with immutable operations that return new copies.", category: "Patterns", example: "arr.push(1); // mutates\n[...arr, 1]; // immutable" },
  { term: "Purity", definition: "A pure function always returns the same output for the same input and has no side effects.", category: "Patterns" },
  { term: "Composition", definition: "Combining small, focused functions to build more complex behavior.", category: "Patterns", example: "const double = x => x * 2;\nconst add1 = x => x + 1;\nconst transform = x => add1(double(x));" },
  { term: "Higher-Order Function", definition: "A function that takes another function as an argument, returns a function, or both.", category: "Functions", example: "Array.map, Array.filter, Array.reduce" },
  { term: "Currying", definition: "Transforming a function that takes multiple arguments into a sequence of functions that each take a single argument.", category: "Patterns", example: "const add = a => b => a + b;\nadd(1)(2); // 3" },
  { term: "Memoization", definition: "Caching the results of expensive function calls and returning the cached result for repeated calls with the same arguments.", category: "Patterns" },
  { term: "Debounce", definition: "Delaying function execution until after a period of inactivity. Used for search inputs, resize handlers.", category: "Patterns" },
  { term: "Throttle", definition: "Limiting a function to run at most once per specified time interval. Used for scroll handlers.", category: "Patterns" },
  { term: "Observer Pattern", definition: "A pattern where an object (subject) maintains a list of dependents (observers) and notifies them of state changes.", category: "Patterns" },
  { term: "Singleton", definition: "A pattern ensuring a class has only one instance with a global point of access.", category: "Patterns" },
  { term: "Strict Mode", definition: "'use strict' enables stricter parsing and error handling. Prevents accidental globals, duplicate parameters, etc.", category: "Core Concepts" },
  { term: "Truthy / Falsy", definition: "Values coerced to true (truthy) or false (falsy) in boolean contexts. Falsy: 0, '', null, undefined, NaN, false.", category: "Core Concepts" },
  { term: "Ternary Operator", definition: "A concise conditional expression: condition ? valueIfTrue : valueIfFalse.", category: "Core Concepts", example: "const msg = age >= 18 ? 'adult' : 'minor';" },
  { term: "Void Operator", definition: "Evaluates an expression and returns undefined. Used with javascript: URLs or IIFEs.", category: "Core Concepts", example: "void 0 // undefined" },
  { term: "Window", definition: "The global object in browser environments. Represents the browser window and provides methods like setTimeout, alert, etc.", category: "DOM" },
  { term: "Document", definition: "Represents the entire HTML document. The entry point to the DOM tree.", category: "DOM", example: "document.querySelector('h1')" },
  { term: "RequestAnimationFrame", definition: "A method that tells the browser to execute a function before the next repaint. Used for smooth animations.", category: "DOM", example: "function animate() {\n  // update\n  requestAnimationFrame(animate);\n}" },
  { term: "IntersectionObserver", definition: "An API for asynchronously observing changes in the intersection of an element with an ancestor element or viewport.", category: "DOM" },
  { term: "MutationObserver", definition: "An API for watching changes to the DOM tree (attribute changes, node additions/removals).", category: "DOM" },
  { term: "Service Worker", definition: "A script that runs in the background, separate from the web page. Enables offline functionality, push notifications, and background sync.", category: "Tools" },
  { term: "Web Worker", definition: "A JavaScript that runs in a background thread without blocking the UI. Communicates with the main thread via postMessage.", category: "Tools" },
  { term: "LocalStorage", definition: "A Web API for storing key-value pairs persistently in the browser with no expiration.", category: "Tools", example: "localStorage.setItem('key', 'value');" },
  { term: "SessionStorage", definition: "Like localStorage but data is cleared when the tab/window is closed.", category: "Tools" },
  { term: "IndexedDB", definition: "A low-level API for storing large amounts of structured data, including files and blobs, in the browser.", category: "Tools" },
  { term: "Fetch API", definition: "A modern interface for making HTTP requests. Returns Promises. Replaces XMLHttpRequest.", category: "Async", example: "const res = await fetch('/api/data');" },
  { term: "AbortController", definition: "An API for aborting one or more web requests. Used with fetch to cancel in-flight requests.", category: "Async", example: "const ctrl = new AbortController();\nfetch(url, { signal: ctrl.signal });\nctrl.abort();" },
  { term: "WebSockets", definition: "A protocol providing full-duplex communication channels over a single TCP connection. Used for real-time apps.", category: "Async" },
  { term: "Tree Shaking", definition: "A build optimization that eliminates dead code (unused exports) from the final bundle.", category: "Tools" },
  { term: "Bundling", definition: "Combining multiple JavaScript files into a single file (or few files) for production. Tools: Webpack, Vite, esbuild.", category: "Tools" },
  { term: "Transpiling", definition: "Converting modern JavaScript (ES6+) to older versions (ES5) for browser compatibility. Tool: Babel.", category: "Tools" },
];

const categories = [...new Set(terms.map((t) => t.category))].sort();

// Build alphabet index
const alphabetIndex = (() => {
  const letters = new Set<string>();
  terms.forEach((t) => letters.add(t.term[0].toUpperCase()));
  return "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").filter((l) => letters.has(l));
})();

export function GlossaryView() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    let list = [...terms];
    if (activeCategory) list = list.filter((t) => t.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.term.toLowerCase().includes(q) ||
          t.definition.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => a.term.localeCompare(b.term));
  }, [activeCategory, search]);

  const scrollToLetter = useCallback((letter: string) => {
    const el = document.getElementById(`glossary-${letter}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mx-auto w-full max-w-4xl space-y-6 p-4 sm:p-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-js-yellow/15">
            <FileText className="size-5 text-js-yellow" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">JavaScript Glossary</h2>
            <p className="text-xs text-muted-foreground">
              {terms.length} terms · Quick definitions
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search terms..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Category pills */}
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
          <BookOpen className="mr-1 size-3" />
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
            onClick={() => setActiveCategory((prev) => (prev === cat ? null : cat))}
          >
            {cat}
          </Button>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Alphabet sidebar - desktop */}
        <aside className="hidden w-10 shrink-0 lg:block">
          <div className="sticky top-24 flex flex-col items-center gap-0.5">
            {alphabetIndex.map((letter) => (
              <button
                key={letter}
                onClick={() => scrollToLetter(letter)}
                className="flex size-7 items-center justify-center rounded text-xs font-medium text-muted-foreground transition-colors hover:bg-js-yellow/10 hover:text-js-yellow"
              >
                {letter}
              </button>
            ))}
          </div>
        </aside>

        {/* Terms */}
        <div ref={containerRef} className="min-w-0 flex-1 space-y-2">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <FileText className="mx-auto mb-3 size-10 opacity-30" />
              <p className="text-sm">No terms match your search.</p>
            </div>
          ) : (
            <Accordion type="multiple" className="space-y-1.5">
              {filtered.map((t, i) => (
                <AccordionItem
                  key={t.term + i}
                  value={t.term + i}
                  id={`glossary-${t.term[0].toUpperCase()}`}
                  className="rounded-lg border border-border/50 px-4 data-[state=open]:bg-muted/30"
                >
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center gap-3 text-left">
                      <span className="text-base font-semibold text-foreground">
                        {t.term}
                      </span>
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        {t.category}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <p className="mb-2 text-sm leading-relaxed text-foreground/85">
                      {t.definition}
                    </p>
                    {t.example && (
                      <pre className="rounded-lg bg-js-darker p-3 text-xs leading-relaxed text-foreground/80 code-editor overflow-x-auto">
                        {t.example}
                      </pre>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </div>
    </motion.div>
  );
}