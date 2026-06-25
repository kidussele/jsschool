export interface Quiz {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  moduleId?: string;
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: "multiple_choice" | "code_challenge" | "fill_blank";
  options?: string[];
  correctAnswer: string;
  explanation: string;
  codeSnippet?: string;
  points: number;
}

export const quizData: Quiz[] = [
  {
    id: "quiz-1",
    title: "JavaScript Fundamentals",
    description: "Test your knowledge of JavaScript basics - variables, data types, and operators.",
    difficulty: "easy",
    moduleId: "mod-1-2",
    questions: [
      {
        id: "q1-1",
        question: "Which keyword declares a block-scoped variable that cannot be reassigned?",
        type: "multiple_choice",
        options: ["var", "let", "const", "function"],
        correctAnswer: "const",
        explanation: "const declares a block-scoped variable that cannot be reassigned after initialization. It's the preferred way to declare variables in modern JavaScript.",
        points: 10,
      },
      {
        id: "q1-2",
        question: "What is the output of: typeof null?",
        type: "multiple_choice",
        options: ['"null"', '"undefined"', '"object"', '"boolean"'],
        correctAnswer: '"object"',
        explanation: 'typeof null returns "object" - this is a famous bug in JavaScript that has existed since the first version. It was never fixed for backward compatibility reasons.',
        points: 10,
      },
      {
        id: "q1-3",
        question: "Which operator is used for strict equality comparison?",
        type: "multiple_choice",
        options: ["==", "===", "!=", "="],
        correctAnswer: "===",
        explanation: "=== is the strict equality operator. It checks both value AND type without type coercion. Always prefer === over == to avoid unexpected type conversion bugs.",
        points: 10,
      },
      {
        id: "q1-4",
        question: 'What is the output of: console.log(5 + "5")?',
        type: "multiple_choice",
        options: ["10", '"55"', "NaN", "Error"],
        correctAnswer: '"55"',
        explanation: 'When the + operator is used with a string, JavaScript performs string concatenation. The number 5 is converted to "5" and concatenated with "5", resulting in "55".',
        points: 10,
      },
      {
        id: "q1-5",
        question: "Which value is NOT falsy in JavaScript?",
        type: "multiple_choice",
        options: ["0", '"" (empty string)', "[] (empty array)", "null"],
        correctAnswer: "[] (empty array)",
        explanation: "Empty arrays [] are truthy in JavaScript! The falsy values are: false, 0, -0, 0n, \"\", null, undefined, and NaN. Everything else, including empty arrays and objects, is truthy.",
        points: 10,
      },
      {
        id: "q1-6",
        question: "Complete the code: const greeting = `Hello, ${___}!`;",
        type: "fill_blank",
        correctAnswer: "name",
        explanation: "Template literals use ${expression} syntax to embed expressions inside strings. This is called template string interpolation.",
        codeSnippet: "const name = 'Hero';\nconst greeting = `Hello, ${name}!`;\nconsole.log(greeting); // 'Hello, Hero!'",
        points: 10,
      },
    ],
  },
  {
    id: "quiz-2",
    title: "Arrays & Objects",
    description: "Challenge your understanding of JavaScript arrays and objects.",
    difficulty: "easy",
    moduleId: "mod-2-1",
    questions: [
      {
        id: "q2-1",
        question: "Which array method creates a new array by transforming each element?",
        type: "multiple_choice",
        options: ["forEach()", "map()", "filter()", "reduce()"],
        correctAnswer: "map()",
        explanation: "map() creates a new array with the results of calling a function for every element. Unlike forEach(), it returns the transformed array.",
        points: 10,
      },
      {
        id: "q2-2",
        question: 'What does Object.keys({a: 1, b: 2, c: 3}) return?',
        type: "multiple_choice",
        options: ["[1, 2, 3]", '["a", "b", "c"]', "[{a: 1}, {b: 2}, {c: 3}]", "undefined"],
        correctAnswer: '["a", "b", "c"]',
        explanation: "Object.keys() returns an array of the object's own enumerable property names (keys), not values.",
        points: 10,
      },
      {
        id: "q2-3",
        question: "What is the output of: [1,2,3].reduce((a,b) => a+b, 0)?",
        type: "multiple_choice",
        options: ["[1,2,3]", "6", "123", "0"],
        correctAnswer: "6",
        explanation: "reduce() accumulates array elements into a single value. Starting from 0, it adds each element: 0+1=1, 1+2=3, 3+3=6.",
        points: 10,
      },
      {
        id: "q2-4",
        question: "How do you create a shallow copy of an array?",
        type: "multiple_choice",
        options: ["const copy = arr", "const copy = [...arr]", "const copy = arr.copy()", "const copy = Array.from(arr)"],
        correctAnswer: "const copy = [...arr]",
        explanation: "The spread operator (...) creates a shallow copy of an array. Array.from(arr) also works, but [...arr] is more commonly used in modern code.",
        points: 10,
      },
      {
        id: "q2-5",
        question: "Which method removes the last element from an array and returns it?",
        type: "multiple_choice",
        options: ["shift()", "pop()", "remove()", "splice()"],
        correctAnswer: "pop()",
        explanation: "pop() removes and returns the last element. shift() removes from the beginning. splice() can remove from any position.",
        points: 10,
      },
    ],
  },
  {
    id: "quiz-3",
    title: "Async JavaScript",
    description: "Test your knowledge of Promises, async/await, and the Fetch API.",
    difficulty: "medium",
    moduleId: "mod-3-2",
    questions: [
      {
        id: "q3-1",
        question: "What does a Promise represent?",
        type: "multiple_choice",
        options: ["A synchronous value", "A future value or failure", "A callback function", "A data type"],
        correctAnswer: "A future value or failure",
        explanation: "A Promise represents the eventual completion (or failure) of an asynchronous operation and its resulting value. It can be in one of three states: pending, fulfilled, or rejected.",
        points: 15,
      },
      {
        id: "q3-2",
        question: "What is the correct way to handle errors with async/await?",
        type: "multiple_choice",
        options: [
          "if (error) catch(error)",
          "try { await ... } catch(e) { ... }",
          "await ... .catch()",
          "error await ..."
        ],
        correctAnswer: "try { await ... } catch(e) { ... }",
        explanation: "Use try/catch blocks with async/await for error handling. The try block contains the awaited async operations, and the catch block handles any errors that occur.",
        points: 15,
      },
      {
        id: "q3-3",
        question: "What does Promise.all() do?",
        type: "multiple_choice",
        options: [
          "Resolves with the first promise to resolve",
          "Resolves when ALL promises resolve",
          "Rejects with the first promise to reject",
          "Runs promises sequentially"
        ],
        correctAnswer: "Resolves when ALL promises resolve",
        explanation: "Promise.all() takes an array of promises and resolves when ALL of them resolve. If any promise rejects, it immediately rejects with that reason. It's useful for parallel async operations.",
        points: 15,
      },
      {
        id: "q3-4",
        question: "What HTTP status code indicates a successful GET request?",
        type: "multiple_choice",
        options: ["200", "201", "301", "404"],
        correctAnswer: "200",
        explanation: "200 OK indicates a successful request. 201 is Created (for POST), 301 is Moved Permanently, and 404 is Not Found.",
        points: 15,
      },
      {
        id: "q3-5",
        question: "What does 'response.ok' check in the Fetch API?",
        type: "multiple_choice",
        options: [
          "If the response is JSON",
          "If the status is in the 200-299 range",
          "If the response has data",
          "If the request was cached"
        ],
        correctAnswer: "If the status is in the 200-299 range",
        explanation: "response.ok is a convenience boolean that returns true if the HTTP status code is in the successful range (200-299). It's equivalent to checking response.status >= 200 && response.status < 300.",
        points: 15,
      },
    ],
  },
  {
    id: "quiz-4",
    title: "ES6+ Advanced",
    description: "Advanced questions on modern JavaScript features.",
    difficulty: "medium",
    moduleId: "mod-3-1",
    questions: [
      {
        id: "q4-1",
        question: "What is the difference between spread and rest operators?",
        type: "multiple_choice",
        options: [
          "No difference, they're the same",
          "Spread expands, Rest collects",
          "Spread is for arrays, Rest is for objects",
          "Spread is faster than Rest"
        ],
        correctAnswer: "Spread expands, Rest collects",
        explanation: "Both use ... syntax, but Spread expands an iterable into individual elements (e.g., [...arr, 1, 2]), while Rest collects remaining elements into an array (e.g., function(first, ...rest)).",
        points: 15,
      },
      {
        id: "q4-2",
        question: "What does the 'super' keyword do in a class?",
        type: "multiple_choice",
        options: [
          "Creates a new class",
          "Calls the parent class constructor/method",
          "Declares a super variable",
          "Imports a parent module"
        ],
        correctAnswer: "Calls the parent class constructor/method",
        explanation: "super() calls the parent class constructor in a derived class. super.method() calls a method from the parent class. It must be called before using 'this' in the constructor.",
        points: 15,
      },
      {
        id: "q4-3",
        question: 'What is the output of: const {a: b} = {a: 1}; console.log(b);',
        type: "multiple_choice",
        options: ["undefined", "1", "a", "Error"],
        correctAnswer: "1",
        explanation: "This is destructuring with renaming. {a: b} means: take the 'a' property from the object and assign it to a variable named 'b'. So b = 1.",
        points: 15,
      },
    ],
  },
  {
    id: "quiz-5",
    title: "Expert JavaScript Challenge",
    description: "Hard questions for expert-level JavaScript developers.",
    difficulty: "hard",
    moduleId: "mod-4-1",
    questions: [
      {
        id: "q5-1",
        question: 'What is the output of: console.log(0.1 + 0.2 === 0.3)?',
        type: "multiple_choice",
        options: ["true", "false", "undefined", "NaN"],
        correctAnswer: "false",
        explanation: "Due to floating-point precision in IEEE 754, 0.1 + 0.2 equals 0.30000000000000004, not exactly 0.3. Use Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON for comparison.",
        points: 20,
      },
      {
        id: "q5-2",
        question: "Which data structure uses LIFO (Last In, First Out) ordering?",
        type: "multiple_choice",
        options: ["Queue", "Stack", "Linked List", "Tree"],
        correctAnswer: "Stack",
        explanation: "A Stack follows LIFO ordering - the last element pushed is the first one popped. Think of a stack of plates. JavaScript's call stack is a classic example.",
        points: 20,
      },
      {
        id: "q5-3",
        question: "What is the time complexity of binary search?",
        type: "multiple_choice",
        options: ["O(n)", "O(n²)", "O(log n)", "O(1)"],
        correctAnswer: "O(log n)",
        explanation: "Binary search divides the search space in half with each step, giving it O(log n) time complexity. For 1 million elements, it takes at most ~20 comparisons.",
        points: 20,
      },
      {
        id: "q5-4",
        question: "Which design pattern ensures a class has only one instance?",
        type: "multiple_choice",
        options: ["Observer", "Factory", "Singleton", "Strategy"],
        correctAnswer: "Singleton",
        explanation: "The Singleton pattern restricts a class to a single instance and provides a global point of access to it. Common in logging, configuration, and connection pool management.",
        points: 20,
      },
      {
        id: "q5-5",
        question: "What does the 'private' field syntax # mean in JavaScript classes?",
        type: "multiple_choice",
        options: [
          "A comment",
          "A truly private class field",
          "A static field",
          "A protected field"
        ],
        correctAnswer: "A truly private class field",
        explanation: "The # prefix declares a truly private class field (also called 'hard private'). It cannot be accessed outside the class, not even by subclasses. This is different from the convention of using _ prefix.",
        points: 20,
      },
    ],
  },
];

export const dailyChallenges = [
  {
    id: "dc-1",
    title: "Reverse a String",
    description: "Write a function that reverses a given string without using the built-in .reverse() method.",
    difficulty: "easy",
    codeTemplate: `function reverseString(str) {
  // Your code here
  
}

// Test cases
console.log(reverseString("hello"));     // "olleh"
console.log(reverseString("JavaScript")); // "tpircSavaJ"
console.log(reverseString("JS Hero"));    // "oreH SJ"`,
    testCases: [
      { input: "hello", expected: "olleh" },
      { input: "JavaScript", expected: "tpircSavaJ" },
    ],
    solution: `function reverseString(str) {
  let reversed = "";
  for (let i = str.length - 1; i >= 0; i--) {
    reversed += str[i];
  }
  return reversed;
}`,
    xpReward: 50,
  },
  {
    id: "dc-2",
    title: "FizzBuzz",
    description: "Print numbers 1-100. For multiples of 3 print 'Fizz', for 5 print 'Buzz', for both print 'FizzBuzz'.",
    difficulty: "easy",
    codeTemplate: `function fizzBuzz(n) {
  // Your code here
  
}

fizzBuzz(20);`,
    testCases: [{ input: "15", expected: "FizzBuzz" }],
    solution: `function fizzBuzz(n) {
  for (let i = 1; i <= n; i++) {
    if (i % 15 === 0) console.log("FizzBuzz");
    else if (i % 3 === 0) console.log("Fizz");
    else if (i % 5 === 0) console.log("Buzz");
    else console.log(i);
  }
}`,
    xpReward: 50,
  },
  {
    id: "dc-3",
    title: "Flatten Nested Array",
    description: "Write a function to flatten a deeply nested array without using Array.flat().",
    difficulty: "medium",
    codeTemplate: `function flatten(arr) {
  // Your code here
  
}

// Test
console.log(flatten([1, [2, [3, [4]], 5]])); // [1, 2, 3, 4, 5]`,
    solution: `function flatten(arr) {
  const result = [];
  for (const item of arr) {
    if (Array.isArray(item)) {
      result.push(...flatten(item));
    } else {
      result.push(item);
    }
  }
  return result;
}`,
    xpReward: 100,
  },
];