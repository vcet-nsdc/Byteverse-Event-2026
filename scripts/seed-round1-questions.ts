import { db } from "../src/lib/db";

const EVENT_ID = process.env.NEXT_PUBLIC_EVENT_ID ?? "byteverse-2026";

const SET_A_QUESTIONS = [
  {
    sequence: 1,
    title: "Q1: The Post-Increment Trap & Reference Equality",
    statement: "What will be the exact output of the following snippet?",
    correctOption: "B",
    starterCodes: {
      c: "int i = 0;\nwhile (i++ < 3) {\n    printf(\"%d \", i);\n}",
      cpp: "int i = 0;\nwhile (i++ < 3) {\n    std::cout << i << \" \";\n}",
      java: "String s1 = \"ByteVerse\";\nString s2 = new String(\"ByteVerse\");\nSystem.out.println((s1 == s2) + \" \" + s1.equals(s2));",
      python: "a = [1, 2]\nb = a\nb.append(3)\nprint(a)",
    },
    options: {
      c: { A: "0 1 2", B: "1 2 3", C: "0 1 2 3", D: "1 2 3 4" },
      cpp: { A: "0 1 2", B: "1 2 3", C: "0 1 2 3", D: "1 2 3 4" },
      java: { A: "true true", B: "false true", C: "true false", D: "false false" },
      python: { A: "[1, 2]", B: "[1, 2, 3]", C: "[3]", D: "TypeError" },
    },
  },
  {
    sequence: 2,
    title: "Q2: Variable Scope Shadowing & Mutability",
    statement: "What will be the exact output of the following snippet?",
    correctOption: "A",
    starterCodes: {
      c: "int x = 10;\nint main() {\n    int x = 20;\n    {\n        int x = 30;\n        printf(\"%d \", x);\n    }\n    printf(\"%d\", x);\n    return 0;\n}",
      cpp: "int x = 10;\nint main() {\n    int x = 20;\n    {\n        int x = 30;\n        std::cout << x << \" \";\n    }\n    std::cout << x;\n    return 0;\n}",
      java: "public static void modify(int[] arr) {\n    arr[0] = 99;\n}\npublic static void main(String[] args) {\n    int[] nums = {1, 2, 3};\n    modify(nums);\n    System.out.print(nums[0]);\n}",
      python: "def add_item(item, lst=[]):\n    lst.append(item)\n    return lst\n\nadd_item(1)\nprint(add_item(2))",
    },
    options: {
      c: { A: "30 20", B: "10 30", C: "10 20", D: "30 10" },
      cpp: { A: "30 20", B: "10 30", C: "10 20", D: "30 10" },
      java: { A: "99", B: "1", C: "0", D: "Compilation Error" },
      python: { A: "[1, 2]", B: "[2]", C: "[[1], 2]", D: "TypeError" },
    },
  },
  {
    sequence: 3,
    title: "Q3: The Missing Break & Loop Clauses",
    statement: "What will be the exact output of the following snippet?",
    correctOption: "B",
    starterCodes: {
      c: "int val = 1;\nswitch(val) {\n    case 1: printf(\"One\");\n    case 2: printf(\"Two\"); break;\n    default: printf(\"Default\");\n}",
      cpp: "int val = 1;\nswitch(val) {\n    case 1: std::cout << \"One\";\n    case 2: std::cout << \"Two\"; break;\n    default: std::cout << \"Default\";\n}",
      java: "boolean flag = false;\nif (flag = true) {\n    System.out.print(\"True \");\n}\nSystem.out.print(flag);",
      python: "for i in range(3):\n    if i == 5:\n        break\nelse:\n    print(\"Done\")",
    },
    options: {
      c: { A: "One", B: "OneTwo", C: "OneTwoDefault", D: "Compilation Error" },
      cpp: { A: "One", B: "OneTwo", C: "OneTwoDefault", D: "Compilation Error" },
      java: { A: "True false", B: "True true", C: "false", D: "Compilation Error" },
      python: { A: "Nothing", B: "Done", C: "0 1 2 Done", D: "SyntaxError" },
    },
  },
  {
    sequence: 4,
    title: "Q4: Assignment in Conditional & Sequence Slicing",
    statement: "What gets printed to the console?",
    correctOption: "B",
    starterCodes: {
      c: "int a = 5;\nif (a = 0) {\n    printf(\"Zero\");\n} else {\n    printf(\"Not Zero\");\n}",
      cpp: "int a = 5;\nif (a = 0) {\n    std::cout << \"Zero\";\n} else {\n    std::cout << \"Not Zero\";\n}",
      java: "int x;\nif (true) { x = 10; }\nSystem.out.print(x);",
      python: "s = \"Python\"\nprint(s[10:])",
    },
    options: {
      c: { A: "Zero", B: "Not Zero", C: "Compilation Error", D: "Runtime Error" },
      cpp: { A: "Zero", B: "Not Zero", C: "Compilation Error", D: "Runtime Error" },
      java: { A: "0", B: "10", C: "Garbage Value", D: "Compilation Error" },
      python: { A: "IndexError", B: "'' (Empty String)", C: "'n'", D: "'Python'" },
    },
  },
  {
    sequence: 5,
    title: "Q5: The Comma Operator & Boolean Evaluation",
    statement: "What will be the output of this code snippet?",
    correctOption: "B",
    starterCodes: {
      c: "int i, j;\nfor (i = 0, j = 0; i < 2, j < 3; i++, j++) {\n    printf(\"%d \", i);\n}",
      cpp: "int i, j;\nfor (i = 0, j = 0; i < 2, j < 3; i++, j++) {\n    std::cout << i << \" \";\n}",
      java: "int day = 2;\nswitch(day) {\n    case 1: System.out.print(\"M\");\n    case 2: System.out.print(\"T\");\n    case 3: System.out.print(\"W\"); break;\n    default: System.out.print(\"X\");\n}",
      python: "x = 0 or 5\ny = 2 and 3\nprint(x, y)",
    },
    options: {
      c: { A: "0 1", B: "0 1 2", C: "0 1 2 3", D: "Infinite Loop" },
      cpp: { A: "0 1", B: "0 1 2", C: "0 1 2 3", D: "Infinite Loop" },
      java: { A: "T", B: "TW", C: "TWX", D: "Compilation Error" },
      python: { A: "True True", B: "5 3", C: "0 2", D: "5 2" },
    },
  },
  {
    sequence: 6,
    title: "Q6: Pointer Arithmetic & Integer Division Math",
    statement: "What are the final values printed?",
    correctOption: "C",
    starterCodes: {
      c: "int a = 10;\nint *p = &a;\n*p = 20;\nint b = a++;\nprintf(\"%d %d\", b, a);",
      cpp: "int a = 10;\nint *p = &a;\n*p = 20;\nint b = a++;\nstd::cout << b << \" \" << a;",
      java: "double d = 5 / 2 * 3.0;\nSystem.out.println(d);",
      python: "x = 5 // 2 * 3.0\nprint(x)",
    },
    options: {
      c: { A: "20 20", B: "21 21", C: "20 21", D: "21 20" },
      cpp: { A: "20 20", B: "21 21", C: "20 21", D: "21 20" },
      java: { A: "7.5", B: "6.5", C: "6.0", D: "7.0" },
      python: { A: "7.5", B: "7.0", C: "6.0", D: "TypeError" },
    },
  },
  {
    sequence: 7,
    title: "Q7: Array Initialization & Type Comparisons",
    statement: "What is the output of the following execution?",
    correctOption: "D",
    starterCodes: {
      c: "int arr[5] = {1, 2};\nprintf(\"%d\", arr[3]);",
      cpp: "int arr[5] = {1, 2};\nstd::cout << arr[3];",
      java: "int a = 10, b = 10;\nif (a == 5 && ++b == 11) {\n    System.out.print(\"Yes \");\n}\nSystem.out.print(b);",
      python: "t1 = (1)\nt2 = (1,)\nprint(type(t1) == type(t2))",
    },
    options: {
      c: { A: "1", B: "2", C: "Garbage Value", D: "0" },
      cpp: { A: "1", B: "2", C: "Garbage Value", D: "0" },
      java: { A: "11", B: "Yes 11", C: "Compilation Error", D: "10" },
      python: { A: "True", B: "TypeError", C: "SyntaxError", D: "False" },
    },
  },
  {
    sequence: 8,
    title: "Q8: Integer Division Truncation & Local Scoping",
    statement: "What will be the exact value printed?",
    correctOption: "B",
    starterCodes: {
      c: "float x = 5 / 2 * 3.0;\nprintf(\"%.1f\", x);",
      cpp: "float x = 5 / 2 * 3.0;\nstd::cout << x;",
      java: "int[] arr = new int[5];\narr[0] = 10;\nSystem.out.print(arr[3]);",
      python: "x = 10\ndef change():\n    x = 20\nchange()\nprint(x)",
    },
    options: {
      c: { A: "7.5", B: "6.0", C: "7.0", D: "Compilation Error" },
      cpp: { A: "7.5", B: "6", C: "7.0", D: "Compilation Error" },
      java: { A: "Garbage Value", B: "0", C: "10", D: "NullPointerException" },
      python: { A: "20", B: "10", C: "UnboundLocalError", D: "None" },
    },
  },
  {
    sequence: 9,
    title: "Q9: Boolean Short-Circuiting & Dict Key Overwrite",
    statement: "What is the final value printed to the console?",
    correctOption: "B",
    starterCodes: {
      c: "int a = 5, b = 5;\nif (a == 6 && ++b == 6) {\n    printf(\"Yes \");\n}\nprintf(\"%d\", b);",
      cpp: "int a = 5, b = 5;\nif (a == 6 && ++b == 6) {\n    std::cout << \"Yes \";\n}\nstd::cout << b;",
      java: "int i = 0;\nwhile (i++ < 3) {\n    System.out.print(i + \" \");\n}",
      python: "d = {1: \"A\", True: \"B\"}\nprint(d[1])",
    },
    options: {
      c: { A: "Yes 6", B: "5", C: "6", D: "Yes 5" },
      cpp: { A: "Yes 6", B: "5", C: "6", D: "Yes 5" },
      java: { A: "0 1 2", B: "1 2 3", C: "1 2 3 4", D: "0 1 2 3" },
      python: { A: "A", B: "B", C: "KeyError", D: "[A, B]" },
    },
  },
  {
    sequence: 10,
    title: "Q10: The Static Keyword & Integer Caching",
    statement: "What will be printed to the screen?",
    correctOption: "B",
    starterCodes: {
      c: "void func() {\n    static int count = 0;\n    count++;\n    printf(\"%d \", count);\n}\nint main() {\n    func(); \n    func();\n    return 0;\n}",
      cpp: "void func() {\n    static int count = 0;\n    count++;\n    std::cout << count << \" \";\n}\nint main() {\n    func(); \n    func();\n    return 0;\n}",
      java: "outer: for(int i=0; i<2; i++) {\n    for(int j=0; j<2; j++) {\n        if(i==1) break outer;\n        System.out.print(i + \"\" + j + \" \");\n    }\n}",
      python: "a = 256\nb = 256\nprint(a is b, a == b)",
    },
    options: {
      c: { A: "1 1", B: "1 2", C: "0 1", D: "Garbage Value" },
      cpp: { A: "1 1", B: "1 2", C: "0 1", D: "Garbage Value" },
      java: { A: "00 01 10 11", B: "00 01", C: "00", D: "Compilation Error" },
      python: { A: "False True", B: "True True", C: "True False", D: "False False" },
    },
  },
];

const SET_B_QUESTIONS = [
  {
    sequence: 1,
    title: "Q1: The Post-Decrement Trap & String Pool",
    statement: "What will be the exact output?",
    correctOption: "B",
    starterCodes: {
      c: "int i = 5;\nwhile (i-- > 3) {\n    printf(\"%d \", i);\n}",
      cpp: "int i = 5;\nwhile (i-- > 3) {\n    std::cout << i << \" \";\n}",
      java: "String s1 = \"Code\";\nString s2 = \"Code\";\nSystem.out.println((s1 == s2) + \" \" + s1.equals(s2));",
      python: "a = [1, 2]\nb = a[:]\nb.append(3)\nprint(a)",
    },
    options: {
      c: { A: "5 4", B: "4 3", C: "5 4 3", D: "4 3 2" },
      cpp: { A: "5 4", B: "4 3", C: "5 4 3", D: "4 3 2" },
      java: { A: "false true", B: "true true", C: "true false", D: "false false" },
      python: { A: "[1, 2, 3]", B: "[1, 2]", C: "[3]", D: "TypeError" },
    },
  },
  {
    sequence: 2,
    title: "Q2: Variable Scope Shadowing & Method References",
    statement: "What will be the output?",
    correctOption: "A",
    starterCodes: {
      c: "int y = 5;\nint main() {\n    int y = 15;\n    {\n        int y = 25;\n        printf(\"%d \", y);\n    }\n    printf(\"%d\", y);\n    return 0;\n}",
      cpp: "int y = 5;\nint main() {\n    int y = 15;\n    {\n        int y = 25;\n        std::cout << y << \" \";\n    }\n    std::cout << y;\n    return 0;\n}",
      java: "public static void change(int[] arr) {\n    arr = new int[]{99, 99};\n}\npublic static void main(String[] args) {\n    int[] nums = {1, 2};\n    change(nums);\n    System.out.print(nums[0]);\n}",
      python: "def add_item(item, lst=None):\n    if lst is None:\n        lst = []\n    lst.append(item)\n    return lst\n\nadd_item(1)\nprint(add_item(2))",
    },
    options: {
      c: { A: "25 15", B: "15 5", C: "25 5", D: "5 25" },
      cpp: { A: "25 15", B: "15 5", C: "25 5", D: "5 25" },
      java: { A: "1", B: "99", C: "0", D: "Compilation Error" },
      python: { A: "[2]", B: "[1, 2]", C: "[[1], 2]", D: "TypeError" },
    },
  },
  {
    sequence: 3,
    title: "Q3: The Missing Break & Boolean Assignment",
    statement: "What gets printed?",
    correctOption: "B",
    starterCodes: {
      c: "int val = 2;\nswitch(val) {\n    case 1: printf(\"A\"); break;\n    case 2: printf(\"B\");\n    case 3: printf(\"C\"); break;\n    default: printf(\"D\");\n}",
      cpp: "int val = 2;\nswitch(val) {\n    case 1: std::cout << \"A\"; break;\n    case 2: std::cout << \"B\";\n    case 3: std::cout << \"C\"; break;\n    default: std::cout << \"D\";\n}",
      java: "boolean active = true;\nif (active = false) {\n    System.out.print(\"A\");\n} else {\n    System.out.print(\"B\");\n}",
      python: "for i in range(3):\n    if i == 1:\n        break\nelse:\n    print(\"Done\")\nprint(\"End\")",
    },
    options: {
      c: { A: "B", B: "BC", C: "BCD", D: "Compilation Error" },
      cpp: { A: "B", B: "BC", C: "BCD", D: "Compilation Error" },
      java: { A: "A", B: "B", C: "Compilation Error", D: "AB" },
      python: { A: "Done End", B: "End", C: "Done", D: "SyntaxError" },
    },
  },
  {
    sequence: 4,
    title: "Q4: Assignment Evaluation & Slicing Reversal",
    statement: "What gets printed to the console?",
    correctOption: "A",
    starterCodes: {
      c: "int p = 10;\nif (p = 1) {\n    printf(\"One\");\n} else {\n    printf(\"Not One\");\n}",
      cpp: "int p = 10;\nif (p = 1) {\n    std::cout << \"One\";\n} else {\n    std::cout << \"Not One\";\n}",
      java: "int x;\nboolean flag = true;\nif (flag) { x = 10; }\nSystem.out.print(x);",
      python: "s = \"Code\"\nprint(s[::-1])",
    },
    options: {
      c: { A: "One", B: "Not One", C: "Compilation Error", D: "Runtime Error" },
      cpp: { A: "One", B: "Not One", C: "Compilation Error", D: "Runtime Error" },
      java: { A: "Compilation Error", B: "10", C: "0", D: "Garbage Value" },
      python: { A: "edoC", B: "Code", C: "IndexError", D: "C" },
    },
  },
  {
    sequence: 5,
    title: "Q5: The Comma Operator & Switch Fall-Through",
    statement: "What will be the output?",
    correctOption: "B",
    starterCodes: {
      c: "int x, y;\nfor (x = 1, y = 1; x < 4, y < 2; x++, y++) {\n    printf(\"%d \", x);\n}",
      cpp: "int x, y;\nfor (x = 1, y = 1; x < 4, y < 2; x++, y++) {\n    std::cout << x << \" \";\n}",
      java: "int level = 1;\nswitch(level) {\n    case 1: System.out.print(\"A\");\n    case 2: System.out.print(\"B\"); break;\n    case 3: System.out.print(\"C\");\n}",
      python: "x = 10 and 0\ny = [] or [1]\nprint(x, y)",
    },
    options: {
      c: { A: "1 2 3", B: "1", C: "1 2", D: "Infinite Loop" },
      cpp: { A: "1 2 3", B: "1", C: "1 2", D: "Infinite Loop" },
      java: { A: "A", B: "AB", C: "ABC", D: "Compilation Error" },
      python: { A: "10 []", B: "0 [1]", C: "True True", D: "False True" },
    },
  },
  {
    sequence: 6,
    title: "Q6: Pre-Increment Pointers & True Division",
    statement: "What are the final values of the expression?",
    correctOption: "A",
    starterCodes: {
      c: "int val = 50;\nint *ptr = &val;\n*ptr = 100;\nint res = ++val;\nprintf(\"%d %d\", res, val);",
      cpp: "int val = 50;\nint *ptr = &val;\n*ptr = 100;\nint res = ++val;\nstd::cout << res << \" \" << val;",
      java: "double value = 7 / 3 * 2.5;\nSystem.out.println(value);",
      python: "x = 7 / 2 + 1\nprint(x)",
    },
    options: {
      c: { A: "101 101", B: "100 101", C: "101 100", D: "51 51" },
      cpp: { A: "101 101", B: "100 101", C: "101 100", D: "51 51" },
      java: { A: "5.0", B: "5.83", C: "6.0", D: "5.5" },
      python: { A: "4.5", B: "4", C: "3", D: "3.5" },
    },
  },
  {
    sequence: 7,
    title: "Q7: Array Initialization & Tuple Immutability",
    statement: "What is the output?",
    correctOption: "C",
    starterCodes: {
      c: "int nums[4] = {10};\nprintf(\"%d\", nums[2]);",
      cpp: "int nums[4] = {10};\nstd::cout << nums[2];",
      java: "int x = 2, y = 2;\nif (x == 2 || ++y == 3) {\n    System.out.print(\"True \");\n}\nSystem.out.print(y);",
      python: "t = (1, 2)\nt[0] = 3\nprint(t)",
    },
    options: {
      c: { A: "10", B: "Garbage Value", C: "0", D: "Compilation Error" },
      cpp: { A: "10", B: "Garbage Value", C: "0", D: "Compilation Error" },
      java: { A: "3", B: "2", C: "True 2", D: "True 3" },
      python: { A: "(3, 2)", B: "(1, 2)", C: "TypeError", D: "SyntaxError" },
    },
  },
  {
    sequence: 8,
    title: "Q8: Division Truncation & Global Scope",
    statement: "What will be the final value printed?",
    correctOption: "B",
    starterCodes: {
      c: "float f = 7 / 3 * 2.5;\nprintf(\"%.1f\", f);",
      cpp: "float f = 7 / 3 * 2.5;\nstd::cout << f;",
      java: "boolean[] bools = new boolean[3];\nbools[0] = true;\nSystem.out.print(bools[1]);",
      python: "x = 10\ndef change():\n    global x\n    x = 20\nchange()\nprint(x)",
    },
    options: {
      c: { A: "5.8", B: "5.0", C: "6.0", D: "Compilation Error" },
      cpp: { A: "5.8", B: "5", C: "6.0", D: "Compilation Error" },
      java: { A: "true", B: "false", C: "null", D: "Compilation Error" },
      python: { A: "10", B: "20", C: "UnboundLocalError", D: "None" },
    },
  },
  {
    sequence: 9,
    title: "Q9: Short-Circuit OR & Dict Overwrites",
    statement: "What is the final value printed?",
    correctOption: "B",
    starterCodes: {
      c: "int x = 2, y = 2;\nif (x == 2 || ++y == 3) {\n    printf(\"True \");\n}\nprintf(\"%d\", y);",
      cpp: "int x = 2, y = 2;\nif (x == 2 || ++y == 3) {\n    std::cout << \"True \";\n}\nstd::cout << y;",
      java: "int i = 5;\nwhile (i-- > 3) {\n    System.out.print(i + \" \");\n}",
      python: "d = {0: \"A\", False: \"B\"}\nprint(d[0])",
    },
    options: {
      c: { A: "True 3", B: "True 2", C: "3", D: "2" },
      cpp: { A: "True 3", B: "True 2", C: "3", D: "2" },
      java: { A: "5 4", B: "4 3", C: "5 4 3", D: "4 3 2" },
      python: { A: "A", B: "B", C: "KeyError", D: "[A, B]" },
    },
  },
  {
    sequence: 10,
    title: "Q10: Static Decrement & Object Identity",
    statement: "What will be printed to the screen?",
    correctOption: "C",
    starterCodes: {
      c: "void display() {\n    static int num = 5;\n    num--;\n    printf(\"%d \", num);\n}\nint main() {\n    display(); \n    display();\n    return 0;\n}",
      cpp: "void display() {\n    static int num = 5;\n    num--;\n    std::cout << num << \" \";\n}\nint main() {\n    display(); \n    display();\n    return 0;\n}",
      java: "outer: for(int i=0; i<2; i++) {\n    for(int j=0; j<2; j++) {\n        if(j==1) continue outer;\n        System.out.print(i + \"\" + j + \" \");\n    }\n}",
      python: "a = 1000\nb = 1000\nprint(a is b, a == b)",
    },
    options: {
      c: { A: "4 4", B: "5 4", C: "4 3", D: "Garbage Value" },
      cpp: { A: "4 4", B: "5 4", C: "4 3", D: "Garbage Value" },
      java: { A: "00 01 10 11", B: "00 01", C: "00 10", D: "Compilation Error" },
      python: { A: "True True", B: "True False", C: "False True", D: "False False" },
    },
  },
];

async function main() {
  console.log(`Starting Round 1 Question Population for event: ${EVENT_ID}...`);

  const round1 = await db.round.findFirst({
    where: { eventId: EVENT_ID, sequence: 1 },
  });

  if (!round1) {
    throw new Error(`Round 1 not found for eventId ${EVENT_ID}. Please run seed first.`);
  }

  console.log(`Found Round 1: ${round1.id} (${round1.name})`);

  // Delete existing submissions, test cases, and problems in Round 1 to start fresh
  await db.submission.deleteMany({
    where: { roundId: round1.id },
  });
  await db.testCase.deleteMany({
    where: { problem: { roundId: round1.id } },
  });
  await db.problem.deleteMany({
    where: { roundId: round1.id },
  });
  console.log("Cleared existing Round 1 problems and submissions.");

  // Insert SET A Questions
  for (const q of SET_A_QUESTIONS) {
    await db.problem.create({
      data: {
        roundId: round1.id,
        title: q.title,
        statement: q.statement,
        set: "A",
        sequence: q.sequence,
        correctOption: q.correctOption,
        starterCodes: q.starterCodes,
        options: q.options,
        allowedLangs: ["cpp", "c", "java", "python"],
        isPublished: true,
      },
    });
  }
  console.log("Successfully seeded 10 Set A questions for Round 1!");

  // Insert SET B Questions
  for (const q of SET_B_QUESTIONS) {
    await db.problem.create({
      data: {
        roundId: round1.id,
        title: q.title,
        statement: q.statement,
        set: "B",
        sequence: q.sequence,
        correctOption: q.correctOption,
        starterCodes: q.starterCodes,
        options: q.options,
        allowedLangs: ["cpp", "c", "java", "python"],
        isPublished: true,
      },
    });
  }
  console.log("Successfully seeded 10 Set B questions for Round 1!");
  console.log("Total: 20 Questions (Set A & Set B) populated with C, Java, and Python snippets!");
}

main()
  .catch((e) => {
    console.error("Error populating questions:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
