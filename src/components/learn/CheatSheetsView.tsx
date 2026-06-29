"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { BookMarked, Search, Copy, Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CheatItem {
  title: string;
  code: string;
}

interface CheatTopic {
  id: string;
  label: string;
  items: CheatItem[];
}

const topics: CheatTopic[] = [
  {
    id: "variables",
    label: "Variables & Types",
    items: [
      { title: "Declaration", code: "let x = 10;\nconst PI = 3.14;\nvar old = 'avoid';" },
      { title: "Type checking", code: "typeof 'hello'    // 'string'\ntypeof 42         // 'number'\ntypeof true       // 'boolean'\ntypeof undefined // 'undefined'\ntypeof null       // 'object'\nArray.isArray([]) // true" },
      { title: "Type coercion", code: "'5' + 3    // '53'\n'5' - 3    // 2\n'5' == 5   // true\n'5' === 5  // false\nBoolean(0)  // false\nBoolean('') // false\nBoolean([]) // true (!)" },
      { title: "Conversion", code: "Number('42')       // 42\nString(42)         // '42'\nparseInt('42px')   // 42\nparseFloat('3.14') // 3.14\nBoolean(1)         // true" },
    ],
  },
  {
    id: "strings",
    label: "String Methods",
    items: [
      { title: "Search & Extract", code: "'hello world'.includes('world')   // true\n'hello'.startsWith('he')         // true\n'hello'.endsWith('lo')            // true\n'hello'.indexOf('l')             // 2\n'hello'.lastIndexOf('l')         // 3\n'hello world'.slice(0, 5)       // 'hello'\n'hello'.substring(1, 3)        // 'el'\n'hello'.charAt(0)               // 'h'" },
      { title: "Transform", code: "'hello'.toUpperCase()  // 'HELLO'\n'HELLO'.toLowerCase()  // 'hello'\n'  hello  '.trim()      // 'hello'\n'hello'.repeat(3)        // 'hellohellohello'\n'hello'.replace('l', 'L') // 'heLlo'\n'hello'.replaceAll('l','L') // 'heLLo'" },
      { title: "Split & Join", code: "'a,b,c'.split(',')       // ['a','b','c']\n['a','b','c'].join('-')   // 'a-b-c'\n'hello'.split('')          // ['h','e','l','l','o']" },
      { title: "Template Literals", code: "const name = 'World';\n`Hello, ${name}!`\n`2 + 2 = ${2 + 2}`  // '2 + 2 = 4'\n`Result: ${true ? 'yes' : 'no'}`" },
      { title: "Padding", code: "'5'.padStart(3, '0')   // '005'\n'5'.padEnd(3, '.')     // '5..'\n'hello'.padStart(10, '-')  // '-----hello'" },
    ],
  },
  {
    id: "arrays",
    label: "Array Methods",
    items: [
      { title: "Add / Remove", code: "const arr = [1, 2, 3];\narr.push(4);        // [1,2,3,4]\narr.pop();           // 4 -> [1,2,3]\narr.unshift(0);      // [0,1,2,3]\narr.shift();         // 0 -> [1,2,3]\narr.splice(1, 1, 'a'); // [1,'a',3]" },
      { title: "Transform", code: "[1,2,3].map(x => x * 2);        // [2,4,6]\n[1,2,3,4].filter(x => x > 2);   // [3,4]\n[1,2,3].reduce((a,b) => a+b, 0); // 6\n[1,2,3].find(x => x > 1);       // 2\n[1,2,3].findIndex(x => x > 1);   // 1" },
      { title: "Check", code: "[1,2,3].includes(2);        // true\n[1,2,3].some(x => x > 2);   // true\n[1,2,3].every(x => x > 0);  // true\n[1,2,3].indexOf(2);          // 1\n[1,2,3].at(-1);              // 3" },
      { title: "Iterate", code: "[1,2,3].forEach(x => console.log(x));\nfor (const x of [1,2,3]) console.log(x);\nfor (const [i, x] of [1,2,3].entries())\n  console.log(i, x);\n[1,2,3].keys()    // iterator 0,1,2\n[1,2,3].values()  // iterator 1,2,3\n[1,2,3].entries() // iterator [0,1],[1,2],[2,3]" },
      { title: "Flat & Sort", code: "[1,[2,[3]]].flat(Infinity); // [1,2,3]\n[1,2,3].flatMap(x => [x, x*2]); // [1,2,2,4,3,6]\n[3,1,2].sort();           // [1,2,3]\n[3,1,2].sort((a,b) => b-a); // [3,2,1]\n[3,1,2].reverse();        // [2,1,3]" },
      { title: "Create", code: "Array.of(1,2,3);         // [1,2,3]\nArray.from({length:3}, (_,i) => i); // [0,1,2]\nArray.from('abc');       // ['a','b','c']\n[...new Set([1,2,2,3])]; // [1,2,3]" },
    ],
  },
  {
    id: "objects",
    label: "Object Methods",
    items: [
      { title: "Destructuring", code: "const {name, age = 0} = user;\nconst {name: n, ...rest} = user;\nconst [first, ...rest] = [1,2,3];" },
      { title: "Spread & Merge", code: "const copy = {...original};\nconst merged = {...defaults, ...userPrefs};\nconst arr2 = [...arr1, 4, 5];" },
      { title: "Static Methods", code: "Object.keys(obj)    // ['a','b']\nObject.values(obj)  // [1,2]\nObject.entries(obj) // [['a',1],['b',2]]\nObject.assign({}, src);\nObject.freeze(obj);\nObject.seal(obj);" },
      { title: "Optional Chaining", code: "user?.name?.first\nuser?.getAddress?.()\nconst x = data?.items?.[0]?.name ?? 'default'" },
      { title: "Property Shorthands", code: "const name = 'Alice';\nconst obj = { name, age: 25 };\n// Same as: { name: name, age: 25 }\n\n// Computed property\nconst key = 'color';\nconst obj = { [key]: 'red' }; // { color: 'red' }" },
    ],
  },
  {
    id: "functions",
    label: "Functions",
    items: [
      { title: "Arrow Functions", code: "const add = (a, b) => a + b;\nconst square = x => x * x;\nconst greet = () => 'hello';\nconst obj = {\n  name: 'test',\n  fn: () => console.log(this.name), // undefined!\n  fnRegular() { console.log(this.name); } // 'test'\n};" },
      { title: "Default & Rest", code: "function greet(name = 'World', ...args) {}\ngreet('Alice', 1, 2); // name='Alice', args=[1,2]" },
      { title: "IIFE", code: "(function() {\n  const private = 'secret';\n  console.log(private);\n})();\n\n// Arrow IIFE\n(() => {\n  console.log('immediate');\n})();" },
      { title: "Closures", code: "function counter() {\n  let count = 0;\n  return () => ++count;\n}\nconst inc = counter();\ninc(); // 1\ninc(); // 2" },
      { title: "Callback & Higher-Order", code: "[1,2,3].map(n => n * 2);\nfunction apply(fn, val) { return fn(val); }\napply(x => x + 1, 5); // 6" },
    ],
  },
  {
    id: "dom",
    label: "DOM Manipulation",
    items: [
      { title: "Select Elements", code: "document.getElementById('app');\ndocument.querySelector('.class');\ndocument.querySelectorAll('div.item');\ndocument.getElementsByClassName('c');\ndocument.getElementsByTagName('p');" },
      { title: "Create & Modify", code: "const el = document.createElement('div');\nel.textContent = 'Hello';\nel.innerHTML = '<strong>Hello</strong>';\nel.classList.add('active');\nel.classList.toggle('hidden');\nparent.appendChild(el);\nparent.removeChild(el);\nparent.insertBefore(newEl, refEl);" },
      { title: "Events", code: "el.addEventListener('click', handler, { once: true });\nel.removeEventListener('click', handler);\n\n// Event object\nfunction handler(e) {\n  e.preventDefault();\n  e.stopPropagation();\n  e.target;\n  e.currentTarget;\n}" },
      { title: "Event Delegation", code: "document.querySelector('.list').addEventListener(\n  'click', (e) => {\n    const item = e.target.closest('.item');\n    if (item) handleClick(item);\n  }\n);" },
      { title: "Styles & Attributes", code: "el.style.color = 'red';\nel.setAttribute('data-id', '123');\nel.getAttribute('data-id');\nel.dataset.id; // '123'\nel.classList.add/remove/toggle/contains('cls');" },
    ],
  },
  {
    id: "async",
    label: "Async/Await & Promises",
    items: [
      { title: "Promise Basics", code: "const p = new Promise((resolve, reject) => {\n  setTimeout(() => resolve('done'), 1000);\n});\np.then(val => console.log(val));\np.catch(err => console.error(err));" },
      { title: "Async/Await", code: "async function getData() {\n  try {\n    const res = await fetch(url);\n    const data = await res.json();\n    return data;\n  } catch (err) {\n    console.error(err);\n  }\n}" },
      { title: "Promise Combinators", code: "Promise.all([p1, p2, p3]);       // all resolve\nPromise.race([p1, p2, p3]);       // first settles\nPromise.allSettled([p1, p2, p3]); // all results\nPromise.any([p1, p2, p3]);        // first success" },
      { title: "Utility Patterns", code: "const sleep = ms => new Promise(r => setTimeout(r, ms));\nawait sleep(1000);\n\n// Retry\nasync function retry(fn, n = 3) {\n  for (let i = 0; i < n; i++) {\n    try { return await fn(); }\n    catch (e) { if (i === n-1) throw e; }\n  }\n}" },
    ],
  },
  {
    id: "es6",
    label: "ES6+ Features",
    items: [
      { title: "Destructuring", code: "// Array\nconst [a, b, ...rest] = [1, 2, 3, 4];\n// Object\nconst { x, y = 5, ...z } = { x: 1, y: 2, z: 3 };\n// Rename\nconst { name: n } = { name: 'Alice' };" },
      { title: "Spread & Rest", code: "const arr = [1, 2, 3];\nconst copy = [...arr];\nconst merged = [...arr1, ...arr2];\nfunction sum(...nums) {\n  return nums.reduce((a, b) => a + b, 0);\n}" },
      { title: "Optional Chaining & Nullish", code: "user?.address?.city?.name ?? 'Unknown'\n0 ?? 42    // 0\n'' ?? 'hi' // ''\nnull ?? 42  // 42" },
      { title: "Map & Set", code: "const map = new Map();\nmap.set('key', 'value');\nmap.get('key'); // 'value'\nmap.has('key'); // true\nmap.size;\n\nconst set = new Set([1, 2, 2, 3]); // Set{1,2,3}\nset.add(4);\nset.has(2); // true\nset.size;" },
      { title: "Modules", code: "// export.js\nexport const PI = 3.14;\nexport default function main() {}\n\n// import.js\nimport main, { PI } from './export.js';\nimport * as math from './export.js';" },
    ],
  },
  {
    id: "errors",
    label: "Error Handling",
    items: [
      { title: "Try/Catch/Finally", code: "try {\n  JSON.parse('invalid');\n} catch (err) {\n  console.error(err.message);\n} finally {\n  // always runs\n}" },
      { title: "Custom Errors", code: "class AppError extends Error {\n  constructor(message, code) {\n    super(message);\n    this.name = 'AppError';\n    this.code = code;\n  }\n}\nthrow new AppError('Not found', 404);" },
      { title: "Error Types", code: "new Error('generic');\nnew TypeError('wrong type');\nnew ReferenceError('not defined');\nnew RangeError('out of range');\nnew SyntaxError('parse error');" },
    ],
  },
  {
    id: "json",
    label: "JSON",
    items: [
      { title: "Parse & Stringify", code: "JSON.parse('{\"a\":1}');   // {a:1}\nJSON.stringify({a:1});   // '{\"a\":1}'\nJSON.stringify(obj, null, 2); // pretty print\nJSON.stringify(obj, ['a']); // only 'a' key" },
      { title: "Deep Clone", code: "const clone = JSON.parse(JSON.stringify(obj));\n// Note: loses functions, undefined, Dates, Map, Set" },
    ],
  },
  {
    id: "math",
    label: "Math & Numbers",
    items: [
      { title: "Math Methods", code: "Math.round(4.7)   // 5\nMath.floor(4.7)   // 4\nMath.ceil(4.2)    // 5\nMath.abs(-5)      // 5\nMath.max(1,2,3)   // 3\nMath.min(1,2,3)   // 1\nMath.random()     // 0-1\nMath.pow(2,3)     // 8\nMath.sqrt(16)     // 4" },
      { title: "Number Methods", code: "(42).toFixed(2)     // '42.00'\n(42).toString(16)    // '2a'\n(Number('123')).toFixed(2); // '123.00'\nNumber.isNaN(NaN)    // true\nNumber.isFinite(42)  // true\nparseInt('0xFF', 16) // 255" },
    ],
  },
  {
    id: "dates",
    label: "Date & Time",
    items: [
      { title: "Create Dates", code: "new Date();\nnew Date('2024-01-15');\nnew Date(2024, 0, 15, 12, 30);\nDate.now(); // ms since epoch" },
      { title: "Get / Set", code: "const d = new Date();\nd.getFullYear(); // 2024\nd.getMonth();    // 0-11\nd.getDate();     // 1-31\nd.getDay();      // 0-6 (Sun-Sat)\nd.getHours();\nd.getMinutes();\nd.setHours(12);" },
      { title: "Format", code: "d.toISOString();       // '2024-01-15T...'\nd.toLocaleDateString(); // '1/15/2024'\nd.toLocaleString();    // full date+time\nd.toDateString();      // 'Mon Jan 15 2024'\nd.toTimeString();      // '12:30:00 GMT...'" },
    ],
  },
  {
    id: "regex",
    label: "Regular Expressions",
    items: [
      { title: "Patterns", code: "/hello/.test('hello world'); // true\n/^hello/.test('say hello');    // false\n/world$/.test('hello world');  // true\n/h.llo/.test('hello');        // true\n/hello/i.test('HELLO');       // true (case-insensitive)" },
      { title: "Match & Replace", code: "'hello123world456'.match(/\\d+/g); // ['123','456']\n'hello world'.replace(/world/, 'JS'); // 'hello JS'\n'aaa bbb ccc'.replace(/\\b\\w+\\b/g, w => w[0].toUpperCase() + w.slice(1));" },
      { title: "Groups", code: "const re = /(\\d{4})-(\\d{2})-(\\d{2})/;\nconst m = '2024-01-15'.match(re);\nm[1]; // '2024'\nm[2]; // '01'\nm[3]; // '15'" },
    ],
  },
  {
    id: "patterns",
    label: "Design Patterns",
    items: [
      { title: "Debounce", code: "function debounce(fn, ms) {\n  let timer;\n  return (...args) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), ms);\n  };\n}" },
      { title: "Throttle", code: "function throttle(fn, ms) {\n  let last = 0;\n  return (...args) => {\n    const now = Date.now();\n    if (now - last >= ms) {\n      last = now;\n      fn(...args);\n    }\n  };\n}" },
      { title: "Memoize", code: "function memoize(fn) {\n  const cache = new Map();\n  return (...args) => {\n    const key = JSON.stringify(args);\n    if (!cache.has(key)) cache.set(key, fn(...args));\n    return cache.get(key);\n  };\n}" },
      { title: "Curry", code: "function curry(fn) {\n  return function curried(...args) {\n    if (args.length >= fn.length) return fn(...args);\n    return (...more) => curried(...args, ...more);\n  };\n}\nconst add = curry((a, b, c) => a + b + c);\nadd(1)(2)(3); // 6" },
    ],
  },
];

function CodeBlock({ code, isDark }: { code: string; isDark: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <div className="group/code relative overflow-hidden rounded-lg border border-border/50">
      <div className="flex items-center justify-between border-b border-border/50 bg-muted/40 px-3 py-1.5">
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          JavaScript
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 gap-1 px-1.5 text-[10px] text-muted-foreground opacity-0 transition-opacity group-hover/code:opacity-100"
          onClick={handleCopy}
        >
          {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <SyntaxHighlighter
        language="javascript"
        style={isDark ? oneDark : oneLight}
        customStyle={{ margin: 0, padding: "0.75rem", fontSize: "0.8rem", lineHeight: "1.6", background: isDark ? "#1a1a2e" : "#fafafa" }}
        codeTagProps={{ className: "code-editor" }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

export function CheatSheetsView() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [activeTopic, setActiveTopic] = useState(topics[0]?.id || "");
  const [search, setSearch] = useState("");
  const [mobileTopicOpen, setMobileTopicOpen] = useState(false);

  const topic = topics.find((t) => t.id === activeTopic);

  const filteredItems = useMemo(() => {
    if (!topic) return [];
    if (!search.trim()) return topic.items;
    const q = search.toLowerCase();
    return topic.items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q)
    );
  }, [topic, search]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mx-auto w-full max-w-6xl p-4 sm:p-6"
    >
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-js-yellow/15">
            <BookMarked className="size-5 text-js-yellow" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Cheat Sheets</h2>
            <p className="text-xs text-muted-foreground">
              {topics.length} topics · Quick JavaScript reference
            </p>
          </div>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search cheats..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Mobile topic selector */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-2 lg:hidden">
        {topics.map((t) => (
          <Button
            key={t.id}
            size="sm"
            variant={activeTopic === t.id ? "default" : "outline"}
            className={
              activeTopic === t.id
                ? "shrink-0 bg-js-yellow text-js-darker hover:bg-js-yellow/90 text-xs"
                : "shrink-0 text-xs"
            }
            onClick={() => setActiveTopic(t.id)}
          >
            {t.label}
          </Button>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Sidebar - desktop only */}
        <aside className="hidden w-52 shrink-0 lg:block">
          <div className="sticky top-24 space-y-1">
            {topics.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTopic(t.id)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  activeTopic === t.id
                    ? "bg-js-yellow/10 text-js-yellow font-medium"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <ChevronRight
                  className={`size-3.5 transition-transform ${activeTopic === t.id ? "rotate-90" : ""}`}
                />
                {t.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <div className="min-w-0 flex-1">
          <AnimatePresence mode="wait">
            {topic && (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-bold">{topic.label}</h3>

                {filteredItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No matching items.</p>
                ) : (
                  filteredItems.map((item, i) => (
                    <div key={i} className="space-y-2">
                      <h4 className="text-sm font-semibold text-foreground/80">{item.title}</h4>
                      <CodeBlock code={item.code} isDark={isDark} />
                    </div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}