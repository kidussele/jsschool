export interface CourseLevel {
  id: string;
  title: string;
  description: string;
  order: number;
  color: string;
  icon: string;
  modules: CourseModule[];
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: CourseLesson[];
}

export interface CourseLesson {
  id: string;
  title: string;
  order: number;
  content: string;
  codeExample?: string;
}

export const courseData: CourseLevel[] = [
  {
    id: "level-1",
    title: "Beginner",
    description: "Start your JavaScript journey from scratch. Learn the fundamentals that every developer needs.",
    order: 1,
    color: "#10B981",
    icon: " Sprout",
    modules: [
      {
        id: "mod-1-1",
        title: "Introduction to JavaScript",
        description: "Understand what JavaScript is and how it powers the web",
        order: 1,
        lessons: [
          {
            id: "les-1-1-1",
            title: "What is JavaScript?",
            order: 1,
            content: `# What is JavaScript?

JavaScript is a **high-level**, **dynamic**, and **interpreted** programming language. It is one of the three core technologies of the World Wide Web, alongside HTML and CSS.

## Why Learn JavaScript?

- 🌐 **Universal** - Runs in every web browser
- 💼 **In-Demand** - Used by 98% of websites
- 🚀 **Versatile** - Frontend, backend, mobile, desktop
- 💰 **Lucrative** - Average salary: $95K-$120K

## A Quick Example

\`\`\`javascript
// Your first JavaScript program
console.log("Hello, JavaScript Hero!");
\`\`\`

## How JavaScript Works

1. You write JavaScript code in a \`.js\` file
2. The browser's **JavaScript engine** (like V8) reads and executes it
3. The engine converts your code to machine instructions
4. Results appear on the webpage

> **Fun Fact:** JavaScript was created in just 10 days by Brendan Eich in 1995!

## JavaScript Engines

| Engine | Browser | Company |
|--------|---------|---------|
| V8 | Chrome, Edge, Node.js | Google |
| SpiderMonkey | Firefox | Mozilla |
| JavaScriptCore | Safari | Apple |`,
            codeExample: `// Your first JavaScript program\nconsole.log("Hello, JavaScript Hero!");\n\n// Variables store data\nlet name = "Hero";\nconsole.log("Welcome, " + name + "!");\n\n// Functions reuse code\nfunction greet(person) {\n  return "Hello, " + person + "!";\n}\nconsole.log(greet("World"));`,
          },
          {
            id: "les-1-1-2",
            title: "How JavaScript Works",
            order: 2,
            content: `# How JavaScript Works

Understanding the JavaScript runtime is key to becoming a better developer.

## The JavaScript Runtime

\`\`\`
┌─────────────────────────────────┐
│       JavaScript Runtime         │
│  ┌───────────┐  ┌────────────┐  │
│  │  Memory   │  │   Call     │  │
│  │  Heap     │  │   Stack    │  │
│  └───────────┘  └────────────┘  │
│  ┌───────────────────────────┐  │
│  │      Web APIs             │  │
│  │  DOM, Timer, Fetch, etc.  │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
\`\`\`

## Call Stack

The call stack is a **LIFO** (Last In, First Out) data structure that tracks function calls:

\`\`\`javascript
function first() {
  console.log("First function");
  second();  // Calls second
  console.log("Back to first");
}

function second() {
  console.log("Second function");
}

first();
// Output:
// "First function"
// "Second function"  
// "Back to first"
\`\`\`

## The Event Loop

JavaScript is **single-threaded** but non-blocking thanks to the event loop:

1. **Synchronous code** runs first (call stack)
2. **Web APIs** handle async operations (setTimeout, fetch)
3. **Callback Queue** stores waiting callbacks
4. **Event Loop** moves callbacks to the stack when it's empty

> **Key Insight:** This is why JavaScript can handle many tasks despite being single-threaded!`,
            codeExample: `// Synchronous execution\nconsole.log("1 - Start");\nconsole.log("2 - Middle");\nconsole.log("3 - End");\n\n// Asynchronous with callback\nconsole.log("1 - Start");\nsetTimeout(() => {\n  console.log("3 - This runs later!");\n}, 1000);\nconsole.log("2 - This runs next");\n\n// The event loop allows "2" to print before "3"\n// even though setTimeout was called first!`,
          },
          {
            id: "les-1-1-3",
            title: "Setting Up Your Environment",
            order: 3,
            content: `# Setting Up Your Environment

Let's get your development environment ready for JavaScript coding!

## Option 1: Browser Console (Quickest)

Open any browser and press **F12** or **Ctrl+Shift+I** to open DevTools. Navigate to the **Console** tab.

\`\`\`javascript
// Try this right in your browser console!
console.log("I'm coding JavaScript!");
alert("Welcome to JS Hero Academy!");
\`\`\`

## Option 2: Code Editor + Browser

1. **Install VS Code** (free from code.visualstudio.com)
2. **Install Live Server** extension
3. Create a file: \`index.html\`
4. Add a \`<script>\` tag

\`\`\`html
<!DOCTYPE html>
<html>
<head><title>My First JS</title></head>
<body>
  <h1 id="demo">Hello</h1>
  <script>
    document.getElementById("demo").textContent = 
      "JavaScript is working!";
  </script>
</body>
</html>
\`\`\`

## Option 3: Node.js (For Backend)

\`\`\`bash
# Install Node.js from nodejs.org
# Then run:
node --version    # Check version
node hello.js     # Run a file
\`\`\`

## Try It Now!

Use our built-in **Code Playground** to write and run JavaScript right in your browser!`,
            codeExample: `// Try running these in the playground!\n\n// 1. Console output\nconsole.log("Hello from the playground!");\n\n// 2. HTML manipulation\ndocument.getElementById("output").innerHTML = \n  "<h2 style='color: #F7DF1E'>JS Hero!</h2>";\n\n// 3. Math operations\nconsole.log(2 + 2);        // 4\nconsole.log(10 / 3);       // 3.333...\nconsole.log(Math.PI);      // 3.14159...\nconsole.log(Math.random()); // Random number`,
          },
        ],
      },
      {
        id: "mod-1-2",
        title: "Variables & Data Types",
        description: "Learn how to store and manipulate data in JavaScript",
        order: 2,
        lessons: [
          {
            id: "les-1-2-1",
            title: "Variables: var, let, const",
            order: 1,
            content: `# Variables: var, let, const

Variables are **containers** for storing data values.

## Three Ways to Declare Variables

### var (Old way - avoid in modern JS)
\`\`\`javascript
var name = "JavaScript";  // Function-scoped
\`\`\`

### let (Modern - reassignable)
\`\`\`javascript
let score = 0;
score = 100;  // ✅ Can reassign
\`\`\`

### const (Modern - cannot reassign)
\`\`\`javascript
const PI = 3.14159;
PI = 3.14;   // ❌ TypeError!
\`\`\`

## Key Differences

| Feature | var | let | const |
|---------|-----|-----|-------|
| Scope | Function | Block | Block |
| Reassign | ✅ | ✅ | ❌ |
| Hoisted | ✅ | ❌ | ❌ |
| Modern | ❌ | ✅ | ✅ |

## Best Practices

> **Use \`const\` by default. Use \`let\` when you need to reassign. Avoid \`var\`.**

\`\`\`javascript
// ✅ Good
const API_URL = "https://api.example.com";
let counter = 0;
counter++;

// ❌ Bad
var x = 1;
\`\`\``,
            codeExample: `// Variable declarations\nconst APP_NAME = "JS Hero Academy"; // Cannot change\nlet userScore = 0;                    // Can change\nvar oldStyle = "avoid this";          // Old style\n\n// Using variables\nconsole.log(APP_NAME);\nconsole.log("Score:", userScore);\n\n// Reassigning let\nuserScore = 100;\nconsole.log("New Score:", userScore);\n\n// Block scope demo\nif (true) {\n  let blockVar = "I'm block-scoped";\n  const blockConst = "Me too!";\n  console.log(blockVar);    // Works here\n}\n// console.log(blockVar);  // ❌ ReferenceError!`,
          },
          {
            id: "les-1-2-2",
            title: "Data Types",
            order: 2,
            content: `# Data Types in JavaScript

JavaScript has **7 primitive types** and **1 reference type**.

## Primitive Types

### 1. String - Text data
\`\`\`javascript
let name = "JavaScript Hero";
let greeting = \`Hello, \${name}!\`;  // Template literal
\`\`\`

### 2. Number - Integers and decimals
\`\`\`javascript
let age = 25;
let price = 9.99;
let infinity = Infinity;
let notANumber = NaN;
\`\`\`

### 3. Boolean - True or False
\`\`\`javascript
let isActive = true;
let isComplete = false;
\`\`\`

### 4. Null - Intentional empty value
\`\`\`javascript
let data = null;  // "I know this is empty"
\`\`\`

### 5. Undefined - Uninitialized variable
\`\`\`javascript
let x;  // undefined
\`\`\`

### 6. BigInt - Very large numbers
\`\`\`javascript
let big = 9007199254740991n;
\`\`\`

### 7. Symbol - Unique identifiers
\`\`\`javascript
let sym = Symbol("unique");
\`\`\`

## Reference Type

### Object - Collection of key-value pairs
\`\`\`javascript
let student = {
  name: "Hero",
  level: 1,
  xp: 500
};
\`\`\`

## Type Checking
\`\`\`javascript
typeof "hello"    // "string"
typeof 42         // "number"
typeof true       // "boolean"
typeof undefined  // "undefined"
typeof null       // "object" (famous JS bug!)
typeof {}         // "object"
\`\`\``,
            codeExample: `// All data types in action\nconst str = "JavaScript";        // String\nconst num = 42;                   // Number\nconst float = 3.14;               // Number\nconst bool = true;                // Boolean\nconst empty = null;               // Null\nlet notSet;                       // Undefined\nconst bigNum = 123456789012345n;  // BigInt\nconst unique = Symbol("id");      // Symbol\nconst obj = { name: "JS" };       // Object\n\n// Type checking\nconsole.log(typeof str);     // "string"\nconsole.log(typeof num);     // "number"\nconsole.log(typeof bool);    // "boolean"\nconsole.log(typeof empty);   // "object" (JS quirk!)\nconsole.log(typeof notSet);  // "undefined"\nconsole.log(typeof obj);     // "object"\n\n// Template literals\nconst hero = "Hero";\nconsole.log(\`Welcome, \${hero}! Level \${num}\`);`,
          },
        ],
      },
      {
        id: "mod-1-3",
        title: "Operators & Expressions",
        description: "Master arithmetic, comparison, and logical operators",
        order: 3,
        lessons: [
          {
            id: "les-1-3-1",
            title: "Operators",
            order: 1,
            content: `# Operators & Expressions

Operators perform operations on values and variables.

## Arithmetic Operators
\`\`\`javascript
+   // Addition: 5 + 3 = 8
-   // Subtraction: 5 - 3 = 2
*   // Multiplication: 5 * 3 = 15
/   // Division: 10 / 3 = 3.333
%   // Modulus (remainder): 10 % 3 = 1
**  // Exponent: 2 ** 3 = 8
++  // Increment: x++
--  // Decrement: x--
\`\`\`

## Comparison Operators
\`\`\`javascript
==   // Loose equality: 5 == "5" → true
===  // Strict equality: 5 === "5" → false
!=   // Not equal (loose)
!==  // Not equal (strict)
>    // Greater than
<    // Less than
>=   // Greater or equal
<=   // Less or equal
\`\`\`

## Logical Operators
\`\`\`javascript
&&   // AND: true && false → false
||   // OR: true || false → true
!    // NOT: !true → false
\`\`\`

## Assignment Operators
\`\`\`javascript
=    // Assign: x = 5
+=   // Add and assign: x += 3 → x = x + 3
-=   // Subtract and assign
*=   // Multiply and assign
/=   // Divide and assign
%=   // Modulus and assign
\`\`\`

> **Pro Tip:** Always use \`===\` instead of \`==\` to avoid type coercion bugs!`,
            codeExample: `// Arithmetic\nconsole.log(10 + 5);     // 15\nconsole.log(10 - 5);     // 5\nconsole.log(10 * 5);     // 50\nconsole.log(10 / 3);     // 3.333...\nconsole.log(10 % 3);     // 1 (remainder)\nconsole.log(2 ** 10);    // 1024\n\n// Comparison (use === always!)\nconsole.log(5 === 5);    // true\nconsole.log(5 === "5");  // false (strict!)\nconsole.log(5 == "5");   // true (loose - avoid!)\nconsole.log(5 !== "5");  // true\n\n// Logical\nconsole.log(true && false);  // false\nconsole.log(true || false);  // true\nconsole.log(!true);          // false\n\n// Assignment shortcuts\nlet xp = 100;\nxp += 50;   // xp is now 150\nxp *= 2;    // xp is now 300\nconsole.log("Total XP:", xp);`,
          },
        ],
      },
      {
        id: "mod-1-4",
        title: "Control Flow",
        description: "Make decisions and repeat actions with conditions and loops",
        order: 4,
        lessons: [
          {
            id: "les-1-4-1",
            title: "Conditional Statements",
            order: 1,
            content: `# Conditional Statements

Control flow lets your code make decisions!

## if / else if / else
\`\`\`javascript
let score = 85;

if (score >= 90) {
  console.log("Grade: A");
} else if (score >= 80) {
  console.log("Grade: B");
} else if (score >= 70) {
  console.log("Grade: C");
} else {
  console.log("Grade: F");
}
\`\`\`

## Ternary Operator
\`\`\`javascript
// condition ? valueIfTrue : valueIfFalse
let status = score >= 60 ? "Pass" : "Fail";
\`\`\`

## Switch Statement
\`\`\`javascript
let day = "Monday";

switch (day) {
  case "Monday":
    console.log("Start of the week!");
    break;
  case "Friday":
    console.log("Almost weekend!");
    break;
  default:
    console.log("Regular day");
}
\`\`\`

## Truthy & Falsy Values

**Falsy:** \`false\`, \`0\`, \`""\`, \`null\`, \`undefined\`, \`NaN\`

**Truthy:** Everything else (including empty objects and arrays!)`,
            codeExample: `// if/else example\nconst level = 3;\n\nif (level >= 4) {\n  console.log("You're an Expert!");\n} else if (level >= 3) {\n  console.log("You're Advanced!");\n} else if (level >= 2) {\n  console.log("You're Intermediate!");\n} else {\n  console.log("You're a Beginner!");\n}\n\n// Ternary operator\nconst xp = 750;\nconst rank = xp >= 1000 ? "Master" : xp >= 500 ? "Hero" : "Learner";\nconsole.log("Your rank:", rank);\n\n// Switch statement\nconst day = 3;\nswitch(day) {\n  case 1: console.log("Monday"); break;\n  case 2: console.log("Tuesday"); break;\n  case 3: console.log("Wednesday"); break;\n  case 4: console.log("Thursday"); break;\n  case 5: console.log("Friday"); break;\n  default: console.log("Weekend!"); break;\n}`,
          },
          {
            id: "les-1-4-2",
            title: "Loops",
            order: 2,
            content: `# Loops

Loops let you repeat code multiple times.

## for Loop
\`\`\`javascript
for (let i = 1; i <= 5; i++) {
  console.log("Iteration:", i);
}
\`\`\`

## while Loop
\`\`\`javascript
let count = 0;
while (count < 5) {
  console.log("Count:", count);
  count++;
}
\`\`\`

## do...while Loop
\`\`\`javascript
let num = 1;
do {
  console.log("Number:", num);
  num++;
} while (num <= 5);
\`\`\`

## for...of Loop (for arrays)
\`\`\`javascript
const fruits = ["Apple", "Banana", "Cherry"];
for (const fruit of fruits) {
  console.log(fruit);
}
\`\`\`

## for...in Loop (for objects)
\`\`\`javascript
const user = { name: "Hero", level: 1 };
for (const key in user) {
  console.log(key + ":", user[key]);
}
\`\`\`

## break and continue
\`\`\`javascript
for (let i = 0; i < 10; i++) {
  if (i === 3) continue; // Skip 3
  if (i === 7) break;    // Stop at 7
  console.log(i);
}
\`\`\``,
            codeExample: `// for loop\nfor (let i = 1; i <= 5; i++) {\n  console.log(\`Count: \${i}\`);\n}\n\n// while loop\nlet countdown = 5;\nwhile (countdown > 0) {\n  console.log(\`T-minus \${countdown}...\`);\n  countdown--;\n}\nconsole.log("Liftoff! 🚀");\n\n// for...of with array\nconst skills = ["HTML", "CSS", "JavaScript", "React"];\nfor (const skill of skills) {\n  console.log(\`Learning: \${skill}\`);\n}\n\n// Nested loops - multiplication table\nfor (let i = 1; i <= 3; i++) {\n  for (let j = 1; j <= 3; j++) {\n    console.log(\`\${i} × \${j} = \${i * j}\`);\n  }\n}`,
          },
        ],
      },
      {
        id: "mod-1-5",
        title: "Functions",
        description: "Write reusable blocks of code with functions",
        order: 5,
        lessons: [
          {
            id: "les-1-5-1",
            title: "Function Declarations & Arrow Functions",
            order: 1,
            content: `# Functions

Functions are reusable blocks of code that perform a specific task.

## Function Declaration
\`\`\`javascript
function greet(name) {
  return "Hello, " + name + "!";\}
console.log(greet("Hero")); // "Hello, Hero!"
\`\`\`

## Function Expression
\`\`\`javascript
const greet = function(name) {
  return "Hello, " + name + "!";
};
\`\`\`

## Arrow Function (Modern)
\`\`\`javascript
const greet = (name) => "Hello, " + name + "!";
\`\`\`

## Parameters & Default Values
\`\`\`javascript
function createUser(name, role = "student") {
  return { name, role };
}
createUser("Hero");        // { name: "Hero", role: "student" }
createUser("Admin", "admin"); // { name: "Admin", role: "admin" }
\`\`\`

## Rest Parameters
\`\`\`javascript
function sum(...numbers) {
  return numbers.reduce((a, b) => a + b, 0);
}
sum(1, 2, 3, 4, 5); // 15
\`\`\`

## Key Differences: Regular vs Arrow

| Feature | Regular | Arrow |
|---------|---------|-------|
| Own \`this\` | ✅ | ❌ |
| Can be constructor | ✅ | ❌ |
| Arguments object | ✅ | ❌ |
| Concise syntax | ❌ | ✅ |`,
            codeExample: `// Function declaration\nfunction add(a, b) {\n  return a + b;\n}\nconsole.log("Add:", add(5, 3));\n\n// Arrow function\nconst multiply = (a, b) => a * b;\nconsole.log("Multiply:", multiply(4, 6));\n\n// Default parameters\nfunction greet(name = "Hero", greeting = "Hello") {\n  return \`\${greeting}, \${name}!\`;\n}\nconsole.log(greet());           // "Hello, Hero!"\nconsole.log(greet("Alice"));    // "Hello, Alice!"\nconsole.log(greet("Bob", "Hi")); // "Hi, Bob!"\n\n// Rest parameters\nfunction sum(...numbers) {\n  return numbers.reduce((total, n) => total + n, 0);\n}\nconsole.log("Sum:", sum(1, 2, 3, 4, 5));\n\n// Arrow with logic\nconst isEven = (n) => n % 2 === 0;\nconsole.log("4 even?", isEven(4));\nconsole.log("7 even?", isEven(7));`,
          },
        ],
      },
    ],
  },
  {
    id: "level-2",
    title: "Intermediate",
    description: "Build real-world skills with DOM manipulation, events, and data structures.",
    order: 2,
    color: "#38BDF8",
    icon: " BookOpen",
    modules: [
      {
        id: "mod-2-1",
        title: "Arrays & Objects",
        description: "Master JavaScript's most important data structures",
        order: 1,
        lessons: [
          {
            id: "les-2-1-1",
            title: "Arrays & Array Methods",
            order: 1,
            content: `# Arrays & Array Methods

Arrays are ordered collections of values.

## Creating Arrays
\`\`\`javascript
const fruits = ["Apple", "Banana", "Cherry"];
const numbers = [1, 2, 3, 4, 5];
const mixed = [1, "hello", true, null];
\`\`\`

## Essential Array Methods

### Adding/Removing
\`\`\`javascript
arr.push(item)     // Add to end
arr.pop()          // Remove from end
arr.unshift(item)  // Add to start
arr.shift()        // Remove from start
arr.splice(start, count) // Remove/insert at index
\`\`\`

### Iteration
\`\`\`javascript
arr.forEach((item) => console.log(item));
arr.map((item) => item * 2);     // Transform each
arr.filter((item) => item > 3);  // Keep matching
arr.find((item) => item > 3);    // First match
arr.reduce((acc, item) => acc + item, 0); // Accumulate
\`\`\`

### Checking
\`\`\`javascript
arr.includes(item)   // Exists?
arr.some((x) => x > 3)  // Any match?
arr.every((x) => x > 0) // All match?
arr.indexOf(item)    // First index
\`\`\`

## Chaining Methods
\`\`\`javascript
const result = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  .filter(n => n % 2 === 0)  // [2, 4, 6, 8, 10]
  .map(n => n * 2)           // [4, 8, 12, 16, 20]
  .reduce((a, b) => a + b, 0); // 60
\`\`\``,
            codeExample: `// Array basics\nconst nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];\n\n// map - transform each element\nconst doubled = nums.map(n => n * 2);\nconsole.log("Doubled:", doubled);\n\n// filter - keep elements that pass test\nconst evens = nums.filter(n => n % 2 === 0);\nconsole.log("Evens:", evens);\n\n// reduce - accumulate into single value\nconst sum = nums.reduce((acc, n) => acc + n, 0);\nconsole.log("Sum:", sum);\n\n// find - first match\nconst found = nums.find(n => n > 7);\nconsole.log("First > 7:", found);\n\n// Method chaining\nconst result = nums\n  .filter(n => n % 2 === 0)\n  .map(n => n ** 2)\n  .reduce((a, b) => a + b, 0);\nconsole.log("Sum of squared evens:", result);\n\n// Destructuring\nconst [first, second, ...rest] = nums;\nconsole.log(first, second, rest.length);`,
          },
          {
            id: "les-2-1-2",
            title: "Objects & Object Methods",
            order: 2,
            content: `# Objects

Objects are collections of key-value pairs - the backbone of JavaScript.

## Creating Objects
\`\`\`javascript
const student = {\  name: "Hero",
  level: 1,
  xp: 500,
  skills: ["HTML", "CSS", "JS"],
  greet() {
    return \`Hi, I'm \${this.name}!\`;
  }
};
\`\`\`

## Accessing Properties
\`\`\`javascript
student.name          // Dot notation
student["name"]       // Bracket notation
const key = "level";\nstudent[key]         // Dynamic access
\`\`\`

## Object Methods
\`\`\`javascript
Object.keys(obj)      // Array of keys
Object.values(obj)    // Array of values
Object.entries(obj)   // Array of [key, value] pairs
Object.assign({}, obj) // Shallow copy
Object.freeze(obj)    // Make immutable
\`\`\`

## Destructuring
\`\`\`javascript
const { name, level, xp } = student;
const { name: heroName, ...rest } = student;
\`\`\`

## Spread Operator with Objects
\`\`\`javascript
const updated = { ...student, level: 2, xp: 1000 };
\`\`\`

## Optional Chaining
\`\`\`javascript
student?.address?.city  // undefined if any link is null
\`\`\``,
            codeExample: `// Object creation and usage\nconst hero = {\n  name: "JavaScript Hero",\n  level: 1,\n  xp: 500,\n  skills: ["Variables", "Functions", "Loops"],\n  addXp(amount) {\n    this.xp += amount;\n    return this;\n  },\n  getLevel() {\n    return Math.floor(this.xp / 500) + 1;\n  }\n};\n\n// Accessing\nconsole.log("Name:", hero.name);\nconsole.log("Skills:", hero.skills.join(", "));\n\n// Destructuring\nconst { name, level, xp, skills } = hero;\nconsole.log(\`\${name} - Level \${level}, XP: \${xp}\`);\n\n// Spread operator\nconst updatedHero = {\n  ...hero,\n  xp: hero.xp + 250,\n  skills: [...hero.skills, "Arrays"]\n};\nconsole.log("Updated XP:", updatedHero.xp);\n\n// Object methods\nconsole.log("Keys:", Object.keys(hero));\nconsole.log("Values:", Object.values(hero));\n\n// Chaining methods\nhero.addXp(500).addXp(300);\nconsole.log("New level:", hero.getLevel());`,
          },
        ],
      },
      {
        id: "mod-2-2",
        title: "DOM Manipulation",
        description: "Interact with web pages using the Document Object Model",
        order: 2,
        lessons: [
          {
            id: "les-2-2-1",
            title: "Selecting & Modifying Elements",
            order: 1,
            content: `# DOM Manipulation

The DOM (Document Object Model) lets JavaScript interact with HTML elements.

## Selecting Elements
\`\`\`javascript
document.getElementById("myId");
document.querySelector(".myClass");
document.querySelectorAll("li");
document.getElementsByTagName("div");
\`\`\`

## Modifying Content
\`\`\`javascript
element.textContent = "New text";
element.innerHTML = "<strong>Bold</strong> text";
element.setAttribute("class", "active");
element.style.color = "#F7DF1E";
\`\`\`

## Creating & Removing Elements
\`\`\`javascript
const div = document.createElement("div");
div.textContent = "New element";
document.body.appendChild(div);\n
element.remove();
parentElement.removeChild(child);
\`\`\`

## Classes
\`\`\`javascript
element.classList.add("active");
element.classList.remove("hidden");
element.classList.toggle("dark-mode");
element.classList.contains("active"); // true/false
\`\`\`

## Events
\`\`\`javascript
element.addEventListener("click", (e) => {
  console.log("Clicked!", e.target);
});
\`\`\`

> **Tip:** Try these in the Code Playground! Add HTML elements and manipulate them with JavaScript.`,
            codeExample: `// DOM Manipulation in the playground\n\n// Create elements\nconst container = document.createElement("div");\ncontainer.style.padding = "20px";\ncontainer.style.fontFamily = "sans-serif";\n\n// Add a heading\nconst heading = document.createElement("h2");\nheading.textContent = "DOM Manipulation Demo";\nheading.style.color = "#F7DF1E";\nheading.style.marginBottom = "10px";\ncontainer.appendChild(heading);\n\n// Add a counter\nlet count = 0;\nconst counter = document.createElement("div");\ncounter.textContent = \`Count: \${count}\`;\ncounter.style.fontSize = "24px";\ncounter.style.margin = "10px 0";\ncontainer.appendChild(counter);\n\n// Add a button\nconst btn = document.createElement("button");\nbtn.textContent = "Click Me!";\nbtn.style.padding = "10px 20px";\nbtn.style.background = "#F7DF1E";\nbtn.style.border = "none";\nbtn.style.borderRadius = "8px";\nbtn.style.cursor = "pointer";\nbtn.style.fontWeight = "bold";\nbtn.addEventListener("click", () => {\n  count++;\n  counter.textContent = \`Count: \${count}\`;\n});\ncontainer.appendChild(btn);\n\n// Render\ndocument.getElementById("output").innerHTML = "";\ndocument.getElementById("output").appendChild(container);`,
          },
        ],
      },
      {
        id: "mod-2-3",
        title: "Events & Forms",
        description: "Handle user interactions and form validation",
        order: 3,
        lessons: [
          {
            id: "les-2-3-1",
            title: "Event Handling",
            order: 1,
            content: `# Event Handling

Events are actions that happen in the browser - clicks, key presses, form submissions, etc.

## Adding Event Listeners
\`\`\`javascript
// Basic click handler\nelement.addEventListener("click", function(event) {\n  console.log("Element clicked!", event.target);\n});

// Arrow function\nelement.addEventListener("click", (e) => {\n  e.preventDefault(); // Stop default behavior\n  console.log("Prevented default!");\n});
\`\`\`

## Common Events
\`\`\`javascript
"click"          // Mouse click\n"dblclick"       // Double click\n"mouseenter"     // Mouse enters element\n"mouseleave"     // Mouse leaves\n"keydown"        // Key pressed\n"keyup"          // Key released\n"input"          // Input value changed\n"change"         // Form element changed\n"submit"         // Form submitted\n"scroll"         // Page scrolled\n"load"           // Page loaded\n\`\`\`

## Event Delegation
\`\`\`javascript
// Instead of adding listeners to each item\ndocument.querySelector("ul").addEventListener("click", (e) => {\n  if (e.target.tagName === "LI") {\n    console.log("Clicked:", e.target.textContent);\n  }\n});
\`\`\`

## Removing Events
\`\`\`javascript
const handler = () => console.log("Clicked!");\nelement.addEventListener("click", handler);\nelement.removeEventListener("click", handler);\n\`\`\``,
            codeExample: `// Event handling demo\nconst output = document.getElementById("output");\n\n// Create interactive demo\nconst container = document.createElement("div");\ncontainer.style.padding = "20px";\ncontainer.style.fontFamily = "sans-serif";\n\n// Mouse tracker\nconst tracker = document.createElement("div");\ntracker.textContent = "Move your mouse over me!";\ntracker.style.padding = "30px";\ntracker.style.background = "#1E293B";\ntracker.style.color = "white";\ntracker.style.borderRadius = "12px";\ntracker.style.textAlign = "center";\ntracker.style.margin = "10px 0";\n\nconst coords = document.createElement("p");\ncoords.textContent = "x: 0, y: 0";\ncoords.style.fontSize = "20px";\ncoords.style.color = "#F7DF1E";\ntracker.appendChild(coords);\n\ntracker.addEventListener("mousemove", (e) => {\n  const rect = tracker.getBoundingClientRect();\n  const x = Math.round(e.clientX - rect.left);\n  const y = Math.round(e.clientY - rect.top);\n  coords.textContent = \`x: \${x}, y: \${y}\`;\n});\n\ncontainer.appendChild(tracker);\noutput.innerHTML = "";\noutput.appendChild(container);`,
          },
        ],
      },
      {
        id: "mod-2-4",
        title: "Local Storage & JSON",
        description: "Persist data and work with JSON format",
        order: 4,
        lessons: [
          {
            id: "les-2-4-1",
            title: "Local Storage & JSON",
            order: 1,
            content: `# Local Storage & JSON

Store data in the browser and work with JSON format.

## localStorage API
\`\`\`javascript
// Store data\nlocalStorage.setItem("name", "Hero");\nlocalStorage.setItem("xp", "500");\n\n// Read data\nconst name = localStorage.getItem("name"); // "Hero"\n\n// Remove specific item\nlocalStorage.removeItem("name");\n\n// Clear all\nlocalStorage.clear();\n\n// Check storage\nconsole.log(localStorage.length);\nconsole.log(localStorage.key(0));\n\`\`\`

## Working with JSON
\`\`\`javascript
// Object to JSON string\nconst user = { name: "Hero", level: 1 };\nconst json = JSON.stringify(user);\n// '{"name":"Hero","level":1}'\n\n// JSON string to object\nconst parsed = JSON.parse(json);\n// { name: "Hero", level: 1 }\n\`\`\`

## Storing Complex Data
\`\`\`javascript
// Save array of objects\nconst todos = [\n  { id: 1, text: "Learn JS", done: true },\n  { id: 2, text: "Build projects", done: false }\n];\nlocalStorage.setItem("todos", JSON.stringify(todos));\n\n// Load them back\nconst saved = JSON.parse(localStorage.getItem("todos"));\n\`\`\`

## sessionStorage
Same API as localStorage but data is cleared when the tab closes.`,
            codeExample: `// Local Storage Demo\nconst output = document.getElementById("output");\n\n// Save user data\nconst userData = {\n  name: "JavaScript Hero",\n  level: 1,\n  xp: 500,\n  skills: ["Variables", "Functions", "Arrays"],\n  lastLogin: new Date().toISOString()\n};\n\n// Save to localStorage\nlocalStorage.setItem("jsHeroUser", JSON.stringify(userData));\n\n// Read from localStorage\nconst saved = JSON.parse(localStorage.getItem("jsHeroUser"));\n\n// Display\nconst container = document.createElement("div");\ncontainer.style.padding = "20px";\ncontainer.style.fontFamily = "sans-serif";\n\ncontainer.innerHTML = \`\n  <h3 style="color: #F7DF1E">localStorage Demo</h3>\n  <p><strong>Name:</strong> \${saved.name}</p>\n  <p><strong>Level:</strong> \${saved.level}</p>\n  <p><strong>XP:</strong> \${saved.xp}</p>\n  <p><strong>Skills:</strong> \${saved.skills.join(", ")}</p>\n  <p><strong>Items in storage:</strong> \${localStorage.length}</p>\n\`;\n\noutput.innerHTML = "";\noutput.appendChild(container);`,
          },
        ],
      },
    ],
  },
  {
    id: "level-3",
    title: "Advanced",
    description: "Master ES6+ features, async programming, and modern JavaScript patterns.",
    order: 3,
    color: "#8B5CF6",
    icon: " Zap",
    modules: [
      {
        id: "mod-3-1",
        title: "ES6+ Features",
        description: "Modern JavaScript syntax and features",
        order: 1,
        lessons: [
          {
            id: "les-3-1-1",
            title: "Destructuring, Spread & Rest",
            order: 1,
            content: `# Destructuring, Spread & Rest Operators

## Destructuring Assignment

### Array Destructuring
\`\`\`javascript
const [a, b, ...rest] = [1, 2, 3, 4, 5];\n// a = 1, b = 2, rest = [3, 4, 5]\n\n// Skip elements\nconst [first, , third] = [1, 2, 3];\n// first = 1, third = 3\n\n// Swap variables\nlet x = 1, y = 2;\n[x, y] = [y, x];\n\`\`\`

### Object Destructuring
\`\`\`javascript
const { name, age, city = "Unknown" } = {\n  name: "Hero", age: 25\n};\n// city defaults to "Unknown"\n\n// Rename variables\nconst { name: heroName } = { name: "Hero" };\n\`\`\`

## Spread Operator (...)
\`\`\`javascript
// Copy arrays\nconst copy = [...original];\n\n// Merge arrays\nconst merged = [...arr1, ...arr2];\n\n// Copy objects\nconst clone = { ...original };\n\n// Merge objects\nconst merged = { ...defaults, ...userConfig };\n\`\`\`

## Rest Operator
\`\`\`javascript
function sum(first, ...numbers) {\n  return numbers.reduce((a, b) => a + b, 0);\n}\nsum(0, 1, 2, 3, 4); // 10\n\`\`\``,
            codeExample: `// Destructuring\nconst [head, ...tail] = [1, 2, 3, 4, 5];\nconsole.log("Head:", head, "Tail:", tail);\n\nconst user = { name: "Hero", level: 5, xp: 2500, rank: "Gold" };\nconst { name, level, ...stats } = user;\nconsole.log(\`\${name} is level \${level}\`);\nconsole.log("Stats:", stats);\n\n// Spread operator\nconst arr1 = [1, 2, 3];\nconst arr2 = [4, 5, 6];\nconst combined = [...arr1, ...arr2];\nconsole.log("Combined:", combined);\n\nconst defaults = { theme: "dark", lang: "en", fontSize: 16 };\nconst userPrefs = { theme: "light", fontSize: 18 };\nconst config = { ...defaults, ...userPrefs };\nconsole.log("Config:", config);\n\n// Rest parameters\nfunction calculate(operation, ...numbers) {\n  return {\n    operation,\n    result: numbers.reduce((a, b) => a + b, 0),\n    count: numbers.length\n  };\n}\nconsole.log(calculate("sum", 10, 20, 30, 40));`,
          },
          {
            id: "les-3-1-2",
            title: "Classes & Modules",
            order: 2,
            content: `# Classes & Modules

## Classes (ES6)

\`\`\`javascript\nclass Animal {\n  constructor(name) {\n    this.name = name;\n  }\n  speak() {\n    return \`\${this.name} makes a sound.\`;\n  }\n}\n\nclass Dog extends Animal {\n  constructor(name, breed) {\n    super(name);\n    this.breed = breed;\n  }\n  speak() {\n    return \`\${this.name} barks!\`;\n  }\n}\n\`\`\`

## Getters & Setters
\`\`\`javascript\nclass User {\n  constructor(name) {\n    this._name = name;\n  }\n  get name() { return this._name.toUpperCase(); }\n  set name(value) { this._name = value.trim(); }\n}\n\`\`\`

## Static Methods
\`\`\`javascript\nclass MathHelper {\n  static add(a, b) { return a + b; }\n  static multiply(a, b) { return a * b; }\n}\nMathHelper.add(2, 3); // 5\n\`\`\`

## ES Modules
\`\`\`javascript
// export.js\nexport const PI = 3.14;\nexport default class Calculator { ... }\n\n// import.js\nimport Calculator, { PI } from './export.js';\n\`\`\``,
            codeExample: `// Classes\nclass Character {\n  constructor(name, type) {\n    this.name = name;\n    this.type = type;\n    this.level = 1;\n    this.xp = 0;\n  }\n  \n  gainXp(amount) {\n    this.xp += amount;\n    if (this.xp >= this.level * 100) {\n      this.level++;\n      this.xp = 0;\n      console.log(\`\${this.name} leveled up to \${this.level}!\`);\n    }\n  }\n  \n  get status() {\n    return \`\${this.name} [Lv.\${this.level} \${this.type}] - XP: \${this.xp}/\${this.level * 100}\`;\n  }\n}\n\nclass Warrior extends Character {\n  constructor(name) {\n    super(name, "Warrior");\n    this.strength = 10;\n  }\n  \n  attack() {\n    return \`\${this.name} attacks for \${this.strength} damage!\`;\n  }\n}\n\nconst hero = new Warrior("JavaScript Hero");\nconsole.log(hero.status);\nhero.gainXp(50);\nhero.gainXp(60);  // Should level up!\nconsole.log(hero.status);\nconsole.log(hero.attack());`,
          },
        ],
      },
      {
        id: "mod-3-2",
        title: "Asynchronous JavaScript",
        description: "Master Promises, async/await, and the Fetch API",
        order: 2,
        lessons: [
          {
            id: "les-3-2-1",
            title: "Promises & Async/Await",
            order: 1,
            content: `# Asynchronous JavaScript

JavaScript is non-blocking by nature. Async programming lets you handle tasks that take time.

## Callbacks (Old Way)
\`\`\`javascript
function fetchData(callback) {\n  setTimeout(() => {\n    callback({ data: "Hello" });\n  }, 1000);\n}\n\`\`\`

## Promises
\`\`\`javascript
const promise = new Promise((resolve, reject) => {\n  // async work\n  const success = true;\n  if (success) resolve({ data: "Success!" });\n  else reject(new Error("Failed!"));\n});\n\npromise\n  .then(result => console.log(result))\n  .catch(error => console.error(error));\n\`\`\`

## Async/Await (Modern Way)
\`\`\`javascript
async function fetchData() {\n  try {\n    const response = await fetch(url);\n    const data = await response.json();\n    return data;\n  } catch (error) {\n    console.error("Error:", error);\n  }\n}\n\`\`\`

## Promise Methods
\`\`\`javascript\nPromise.all([p1, p2, p3])        // Wait for all\nPromise.race([p1, p2, p3])        // First to resolve\nPromise.allSettled([p1, p2, p3])  // All results\nPromise.any([p1, p2, p3])         // First success\n\`\`\``,
            codeExample: `// Promise examples\n\n// Creating a promise\nfunction delay(ms) {\n  return new Promise(resolve => setTimeout(resolve, ms));\n}\n\n// Async/await\nasync function demo() {\n  console.log("Starting...");\n  \n  await delay(500);\n  console.log("After 500ms");\n  \n  await delay(500);\n  console.log("After 1000ms total");\n  \n  // Promise.all - run in parallel\n  const results = await Promise.all([\n    delay(300).then(() => "Task 1 done"),\n    delay(200).then(() => "Task 2 done"),\n    delay(100).then(() => "Task 3 done"),\n  ]);\n  console.log("All tasks:", results);\n  \n  // Simulating API call\n  function fakeAPI(endpoint) {\n    return new Promise((resolve) => {\n      setTimeout(() => {\n        resolve({ endpoint, status: 200, data: { message: "Success" } });\n      }, 300);\n    });\n  }\n  \n  const response = await fakeAPI("/api/users");\n  console.log("API Response:", JSON.stringify(response));\n}\n\ndemo();`,
          },
          {
            id: "les-3-2-2",
            title: "Fetch API & Working with APIs",
            order: 2,
            content: `# Fetch API

The Fetch API is the modern way to make HTTP requests in JavaScript.

## Basic GET Request
\`\`\`javascript
const response = await fetch("https://api.example.com/data");\nconst data = await response.json();\n\`\`\`

## POST Request
\`\`\`javascript
const response = await fetch("https://api.example.com/users", {\n  method: "POST",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify({ name: "Hero", level: 1 })\n});\n\`\`\`

## Error Handling
\`\`\`javascript
try {\n  const response = await fetch(url);\n  if (!response.ok) throw new Error(\`HTTP \${response.status}\`);\n  const data = await response.json();\n} catch (error) {\n  console.error("Fetch failed:", error);\n}\n\`\`\`

## REST API Methods
| Method | Purpose |
|--------|---------|
| GET | Read data |
| POST | Create data |
| PUT | Update data (full) |
| PATCH | Update data (partial) |
| DELETE | Delete data |

## JSONPlaceholder (Free test API)
\`\`\`javascript
// These endpoints work! Try them:\n// https://jsonplaceholder.typicode.com/posts\n// https://jsonplaceholder.typicode.com/users\n// https://jsonplaceholder.typicode.com/todos\n\`\`\``,
            codeExample: `// Fetch API Demo using a free API\nasync function fetchDemo() {\n  const output = document.getElementById("output");\n  const container = document.createElement("div");\n  container.style.padding = "16px";\n  container.style.fontFamily = "sans-serif";\n  \n  container.innerHTML = "<p>Loading users...</p>";\n  output.innerHTML = "";\n  output.appendChild(container);\n  \n  try {\n    // Fetch from free API\n    const res = await fetch("https://jsonplaceholder.typicode.com/users?_limit=5");\n    const users = await res.json();\n    \n    let html = "<h3 style='color:#F7DF1E;margin-bottom:12px'>Users from API:</h3>";\n    users.forEach(user => {\n      html += \`\n        <div style="padding:10px;margin:8px 0;background:#1E293B;border-radius:8px;color:white">\n          <strong>\${user.name}</strong><br>\n          <span style="color:#38BDF8">\${user.email}</span>\n        </div>\n      \`;\n    });\n    container.innerHTML = html;\n  } catch (err) {\n    container.innerHTML = \`<p style="color:red">Error: \${err.message}</p>\`;\n  }\n}\n\nfetchDemo();`,
          },
        ],
      },
    ],
  },
  {
    id: "level-4",
    title: "Expert",
    description: "Deep dive into OOP, data structures, algorithms, and design patterns.",
    order: 4,
    color: "#F43F5E",
    icon: " Trophy",
    modules: [
      {
        id: "mod-4-1",
        title: "OOP & Design Patterns",
        description: "Object-oriented programming principles and common patterns",
        order: 1,
        lessons: [
          {
            id: "les-4-1-1",
            title: "OOP Principles",
            order: 1,
            content: `# Object-Oriented Programming

## The 4 Pillars of OOP

### 1. Encapsulation
Bundle data and methods that operate on that data:
\`\`\`javascript\nclass BankAccount {\n  #balance = 0;  // Private field\n  \n  deposit(amount) {\n    if (amount > 0) this.#balance += amount;\n  }\n  \n  getBalance() {\n    return this.#balance;\n  }\n}\n\`\`\`

### 2. Abstraction
Hide complexity, show only essentials:
\`\`\`javascript\nclass Database {\n  #connect() { /* complex connection logic */ }\n  #query() { /* complex query logic */ }\n  \n  async findUser(id) {\n    this.#connect();\n    return this.#query("SELECT * FROM users WHERE id = ?", [id]);\n  }\n}\n\`\`\`

### 3. Inheritance
Classes inherit from other classes:
\`\`\`javascript\nclass Vehicle { move() {} }\nclass Car extends Vehicle { drive() {} }\n\`\`\`

### 4. Polymorphism
Same interface, different implementations:
\`\`\`javascript\nclass Shape { area() { return 0; } }\nclass Circle extends Shape { area() { return Math.PI * this.r ** 2; } }\nclass Square extends Shape { area() { return this.s ** 2; } }\n\`\`\``,
            codeExample: `// OOP Demo\nclass EventEmitter {\n  #events = {};\n  \n  on(event, callback) {\n    if (!this.#events[event]) this.#events[event] = [];\n    this.#events[event].push(callback);\n    return this;\n  }\n  \n  emit(event, ...args) {\n    const callbacks = this.#events[event] || [];\n    callbacks.forEach(cb => cb(...args));\n    return this;\n  }\n  \n  off(event, callback) {\n    this.#events[event] = (this.#events[event] || []).filter(cb => cb !== callback);\n    return this;\n  }\n}\n\n// Usage\nconst emitter = new EventEmitter();\n\nemitter.on("login", (user) => {\n  console.log(\`\${user} logged in!\`);\n});\n\nemitter.on("login", (user) => {\n  console.log(\`Sending welcome email to \${user}\`);\n});\n\nemitter.emit("login", "JavaScript Hero");\n// Both handlers fire!\n\nconsole.log("EventEmitter pattern - used in Node.js, React, etc!");`,
          },
        ],
      },
      {
        id: "mod-4-2",
        title: "Data Structures & Algorithms",
        description: "Implement fundamental data structures and algorithms",
        order: 2,
        lessons: [
          {
            id: "les-4-2-1",
            title: "Linked Lists, Stacks & Queues",
            order: 1,
            content: `# Data Structures

## Linked List
\`\`\`javascript\nclass Node {\n  constructor(value) {\n    this.value = value;\n    this.next = null;\n  }\n}\n\nclass LinkedList {\n  constructor() { this.head = null; this.size = 0; }\n  \n  append(value) {\n    const node = new Node(value);\n    if (!this.head) { this.head = node; }\n    else {\n      let current = this.head;\n      while (current.next) current = current.next;\n      current.next = node;\n    }\n    this.size++;\n  }\n  \n  toArray() {\n    const arr = [];\n    let current = this.head;\n    while (current) {\n      arr.push(current.value);\n      current = current.next;\n    }\n    return arr;\n  }\n}\n\`\`\`

## Stack (LIFO)
\`\`\`javascript\nclass Stack {\n  #items = [];\n  push(item) { this.#items.push(item); }\n  pop() { return this.#items.pop(); }\n  peek() { return this.#items[this.#items.length - 1]; }\n  get size() { return this.#items.length; }\n}\n\`\`\`

## Queue (FIFO)
\`\`\`javascript\nclass Queue {\n  #items = [];\n  enqueue(item) { this.#items.push(item); }\n  dequeue() { return this.#items.shift(); }\n  get size() { return this.#items.length; }\n}\n\`\`\``,
            codeExample: `// Stack implementation\nclass Stack {\n  #items = [];\n  push(item) { this.#items.push(item); return this; }\n  pop() { return this.#items.pop(); }\n  peek() { return this.#items[this.#items.length - 1]; }\n  get size() { return this.#items.length; }\n  isEmpty() { return this.#items.length === 0; }\n  toArray() { return [...this.#items]; }\n}\n\n// Use case: Check balanced parentheses\nfunction isBalanced(str) {\n  const stack = new Stack();\n  const pairs = { ")": "(", "]": "[", "}": "{" };\n  const opens = new Set(["(", "[", "{"]);\n  \n  for (const char of str) {\n    if (opens.has(char)) {\n      stack.push(char);\n    } else if (pairs[char]) {\n      if (stack.pop() !== pairs[char]) return false;\n    }\n  }\n  return stack.isEmpty();\n}\n\nconsole.log("() balanced:", isBalanced("()"));        // true\nconsole.log("([]){} balanced:", isBalanced("([]){}")); // true\nconsole.log("(] balanced:", isBalanced("(]"));          // false\nconsole.log("({[)]} balanced:", isBalanced("({[)]}")); // false\n\n// Queue demo\nclass Queue {\n  #items = [];\n  enqueue(item) { this.#items.push(item); return this; }\n  dequeue() { return this.#items.shift(); }\n  get size() { return this.#items.length; }\n  toArray() { return [...this.#items]; }\n}\n\nconst queue = new Queue();\nqueue.enqueue("Task 1").enqueue("Task 2").enqueue("Task 3");\nconsole.log("Queue:", queue.toArray());\nconsole.log("Process:", queue.dequeue());\nconsole.log("Queue now:", queue.toArray());`,
          },
          {
            id: "les-4-2-2",
            title: "Searching & Sorting Algorithms",
            order: 2,
            content: `# Algorithms

## Searching

### Linear Search - O(n)
\`\`\`javascript
function linearSearch(arr, target) {\n  for (let i = 0; i < arr.length; i++) {\n    if (arr[i] === target) return i;\n  }\n  return -1;\n}\n\`\`\`

### Binary Search - O(log n)
\`\`\`javascript
function binarySearch(arr, target) {\n  let left = 0, right = arr.length - 1;\n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}\n\`\`\`

## Sorting

### Bubble Sort - O(n²)
\`\`\`javascript
function bubbleSort(arr) {\n  for (let i = 0; i < arr.length; i++) {\n    for (let j = 0; j < arr.length - i - 1; j++) {\n      if (arr[j] > arr[j + 1]) {\n        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];\n      }\n    }\n  }\n  return arr;\n}\n\`\`\`

### Quick Sort - O(n log n) average
\`\`\`javascript
function quickSort(arr) {\n  if (arr.length <= 1) return arr;\n  const pivot = arr[0];\n  const left = arr.slice(1).filter(x => x <= pivot);\n  const right = arr.slice(1).filter(x => x > pivot);\n  return [...quickSort(left), pivot, ...quickSort(right)];\n}\n\`\`\`

## Recursion
\`\`\`javascript
function factorial(n) {\n  if (n <= 1) return 1;\  return n * factorial(n - 1);\n}\n\`\`\``,
            codeExample: `// Binary Search\nfunction binarySearch(arr, target) {\n  let left = 0, right = arr.length - 1;\n  let steps = 0;\n  \n  while (left <= right) {\n    steps++;\n    const mid = Math.floor((left + right) / 2);\n    if (arr[mid] === target) return { index: mid, steps };\n    if (arr[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return { index: -1, steps };\n}\n\nconst sorted = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];\nconsole.log("Array:", sorted);\nconsole.log("Find 23:", binarySearch(sorted, 23));\nconsole.log("Find 100:", binarySearch(sorted, 100));\n\n// Quick Sort\nfunction quickSort(arr) {\n  if (arr.length <= 1) return arr;\n  const pivot = arr[Math.floor(arr.length / 2)];\n  const left = arr.filter(x => x < pivot);\n  const mid = arr.filter(x => x === pivot);\n  const right = arr.filter(x => x > pivot);\n  return [...quickSort(left), ...mid, ...quickSort(right)];\n}\n\nconst unsorted = [38, 27, 43, 3, 9, 82, 10];\nconsole.log("Unsorted:", unsorted);\nconsole.log("Sorted:", quickSort(unsorted));\n\n// Recursion - Fibonacci\nfunction fibonacci(n, memo = {}) {\n  if (n in memo) return memo[n];\n  if (n <= 1) return n;\n  memo[n] = fibonacci(n - 1, memo) + fibonacci(n - 2, memo);\n  return memo[n];\n}\n\nconsole.log("Fib(10):", fibonacci(10));\nconsole.log("Fib(30):", fibonacci(30));`,
          },
        ],
      },
    ],
  },
];