import { db } from "../src/lib/db";

// Exact questions provided by user for Set A
const RAW_SET_A = [
  {
    sequence: 1,
    title: "Q1: The Post-Increment Trap",
    statement: "What will be the exact output of the following code snippet?",
    starterCodes: {
      c: "#include <stdio.h>\nint main() {\n  int i = 0;\n  while (i++ < 3) {\n    printf(\"%d \", i);\n  }\n  return 0;\n}",
      cpp: "#include <iostream>\nusing namespace std;\nint main() {\n  int i = 0;\n  while (i++ < 3) {\n    cout << i << \" \";\n  }\n  return 0;\n}",
      java: "public class Main {\n  public static void main(String[] args) {\n    int i = 0;\n    while (i++ < 3) {\n      System.out.print(i + \" \");\n    }\n  }\n}",
      python: "def main():\n  i = 0\n  while i < 3:\n    i += 1\n    print(i, end=\" \")\nif __name__ == '__main__':\n  main()"
    },
    options: {
      c: { "A": "0 1 2", "B": "1 2 3", "C": "0 1 2 3", "D": "1 2 3 4" },
      cpp: { "A": "0 1 2", "B": "1 2 3", "C": "0 1 2 3", "D": "1 2 3 4" },
      java: { "A": "0 1 2", "B": "1 2 3", "C": "0 1 2 3", "D": "1 2 3 4" },
      python: { "A": "0 1 2", "B": "1 2 3", "C": "0 1 2 3", "D": "1 2 3 4" }
    },
    correctOption: "B"
  },
  {
    sequence: 2,
    title: "Q2: Variable Scope & Shadowing",
    statement: "What will be the exact output of the following code snippet?",
    starterCodes: {
      c: "#include <stdio.h>\nint x = 10;\nint main() {\n  int x = 20;\n  {\n    int x = 30;\n    printf(\"%d \", x);\n  }\n  printf(\"%d\", x);\n  return 0;\n}",
      cpp: "#include <iostream>\nusing namespace std;\nint x = 10;\nint main() {\n  int x = 20;\n  {\n    int x = 30;\n    cout << x << \" \";\n  }\n  cout << x;\n  return 0;\n}",
      java: "public class Main {\n  static int x = 10;\n  public static void main(String[] args) {\n    int x = 20;\n    printInner(x);\n    System.out.print(x);\n  }\n  static void printInner(int x) {\n    int innerX = 30;\n    System.out.print(innerX + \" \");\n  }\n}",
      python: "x = 10\ndef main():\n  x = 20\n  def inner():\n    x = 30\n    print(x, end=\" \")\n  inner()\n  print(x)\nif __name__ == '__main__':\n  main()"
    },
    options: {
      c: { "A": "30 20", "B": "10 30", "C": "10 20", "D": "30 10" },
      cpp: { "A": "30 20", "B": "10 30", "C": "10 20", "D": "30 10" },
      java: { "A": "30 20", "B": "10 30", "C": "10 20", "D": "30 10" },
      python: { "A": "30 20", "B": "10 30", "C": "10 20", "D": "30 10" }
    },
    correctOption: "A"
  },
  {
    sequence: 3,
    title: "Q3: Assignment vs Equality",
    statement: "What will be the exact output of the following code snippet?",
    starterCodes: {
      c: "#include <stdio.h>\nint main() {\n  int a = 5;\n  if (a = 0) printf(\"Zero\");\n  else printf(\"Not Zero\");\n  return 0;\n}",
      cpp: "#include <iostream>\nusing namespace std;\nint main() {\n  int a = 5;\n  if (a = 0) cout << \"Zero\";\n  else cout << \"Not Zero\";\n  return 0;\n}",
      java: "public class Main {\n  public static void main(String[] args) {\n    boolean flag = false;\n    if (flag = true) System.out.print(\"True\");\n    else System.out.print(\"False\");\n  }\n}",
      python: "def main():\n  if (a := 0):\n    print(\"Zero\")\n  else:\n    print(\"Not Zero\")\nif __name__ == '__main__':\n  main()"
    },
    options: {
      c: { "A": "Zero", "B": "Not Zero", "C": "Compilation Error", "D": "Runtime Error" },
      cpp: { "A": "Zero", "B": "Not Zero", "C": "Compilation Error", "D": "Runtime Error" },
      java: { "A": "True", "B": "False", "C": "Compilation Error", "D": "Runtime Error" },
      python: { "A": "Zero", "B": "Not Zero", "C": "SyntaxError", "D": "TypeError" }
    },
    "correctOption": "B"
  },
  {
    sequence: 4,
    title: "Q4: Switch Fall-Through",
    statement: "What will be the exact output of the following code snippet?",
    starterCodes: {
      c: "#include <stdio.h>\nint main() {\n  int val = 1;\n  switch(val) {\n    case 1: printf(\"A\");\n    case 2: printf(\"B\"); break;\n    default: printf(\"C\");\n  }\n  return 0;\n}",
      cpp: "#include <iostream>\nusing namespace std;\nint main() {\n  int val = 1;\n  switch(val) {\n    case 1: cout << \"A\";\n    case 2: cout << \"B\"; break;\n    default: cout << \"C\";\n  }\n  return 0;\n}",
      java: "public class Main {\n  public static void main(String[] args) {\n    int val = 1;\n    switch(val) {\n      case 1: System.out.print(\"A\");\n      case 2: System.out.print(\"B\"); break;\n      default: System.out.print(\"C\");\n    }\n  }\n}",
      python: "def main():\n  val = 1\n  if val == 1:\n    print(\"A\", end=\"\")\n  if val <= 2:\n    print(\"B\", end=\"\")\nif __name__ == '__main__':\n  main()"
    },
    options: {
      c: { "A": "A", "B": "AB", "C": "ABC", "D": "Compilation Error" },
      cpp: { "A": "A", "B": "AB", "C": "ABC", "D": "Compilation Error" },
      java: { "A": "A", "B": "AB", "C": "ABC", "D": "Compilation Error" },
      python: { "A": "A", "B": "AB", "C": "ABC", "D": "SyntaxError" }
    },
    correctOption: "B"
  },
  {
    sequence: 5,
    title: "Q5: Boolean Short-Circuiting",
    statement: "What will be the exact output of the following code snippet?",
    starterCodes: {
      c: "#include <stdio.h>\nint main() {\n  int a = 5, b = 5;\n  if (a == 6 && ++b == 6) printf(\"Yes \");\n  printf(\"%d\", b);\n  return 0;\n}",
      cpp: "#include <iostream>\nusing namespace std;\nint main() {\n  int a = 5, b = 5;\n  if (a == 6 && ++b == 6) cout << \"Yes \";\n  cout << b;\n  return 0;\n}",
      java: "public class Main {\n  public static void main(String[] args) {\n    int a = 5, b = 5;\n    if (a == 6 && ++b == 6) System.out.print(\"Yes \");\n    System.out.print(b);\n  }\n}",
      python: "def increment_b():\n  global b\n  b += 1\n  return b == 6\ndef main():\n  global b\n  a, b = 5, 5\n  if a == 6 and increment_b():\n    print(\"Yes\", end=\" \")\n  print(b)\nif __name__ == '__main__':\n  main()"
    },
    options: {
      c: { "A": "Yes 6", "B": "5", "C": "6", "D": "Yes 5" },
      cpp: { "A": "Yes 6", "B": "5", "C": "6", "D": "Yes 5" },
      java: { "A": "Yes 6", "B": "5", "C": "6", "D": "Yes 5" },
      python: { "A": "Yes 6", "B": "5", "C": "6", "D": "Yes 5" }
    },
    correctOption: "B"
  },
  {
    sequence: 6,
    title: "Q6: Array Partial Initialization",
    statement: "What will be the exact output of the following code snippet?",
    starterCodes: {
      c: "#include <stdio.h>\nint main() {\n  int arr[5] = {1, 2};\n  printf(\"%d\", arr[3]);\n  return 0;\n}",
      cpp: "#include <iostream>\nusing namespace std;\nint main() {\n  int arr[5] = {1, 2};\n  cout << arr[3];\n  return 0;\n}",
      java: "public class Main {\n  public static void main(String[] args) {\n    int[] arr = new int[5];\n    arr[0] = 1; arr[1] = 2;\n    System.out.print(arr[3]);\n  }\n}",
      python: "def main():\n  arr = [0]*5\n  arr[0], arr[1] = 1, 2\n  print(arr[3])\nif __name__ == '__main__':\n  main()"
    },
    options: {
      c: { "A": "1", "B": "2", "C": "Garbage Value", "D": "0" },
      cpp: { "A": "1", "B": "2", "C": "Garbage Value", "D": "0" },
      java: { "A": "1", "B": "2", "C": "Null", "D": "0" },
      python: { "A": "1", "B": "2", "C": "None", "D": "0" }
    },
    correctOption: "D"
  },
  {
    sequence: 7,
    title: "Q7: Integer Division Truncation",
    statement: "What will be the exact output of the following code snippet?",
    starterCodes: {
      c: "#include <stdio.h>\nint main() {\n  float x = 5 / 2 * 3.0;\n  printf(\"%.1f\", x);\n  return 0;\n}",
      cpp: "#include <iostream>\nusing namespace std;\nint main() {\n  float x = 5 / 2 * 3.0;\n  cout << x;\n  return 0;\n}",
      java: "public class Main {\n  public static void main(String[] args) {\n    double x = 5 / 2 * 3.0;\n    System.out.print(x);\n  }\n}",
      python: "def main():\n  x = 5 // 2 * 3.0\n  print(x)\nif __name__ == '__main__':\n  main()"
    },
    options: {
      c: { "A": "7.5", "B": "6.0", "C": "7.0", "D": "Compilation Error" },
      cpp: { "A": "7.5", "B": "6", "C": "7", "D": "Compilation Error" },
      java: { "A": "7.5", "B": "6.0", "C": "7.0", "D": "Compilation Error" },
      python: { "A": "7.5", "B": "6.0", "C": "7.0", "D": "TypeError" }
    },
    correctOption: "B"
  },
  {
    sequence: 8,
    title: "Q8: Reference Mutability",
    statement: "What will be the exact output of the following code snippet?",
    starterCodes: {
      c: "#include <stdio.h>\nvoid modify(int *arr) { arr[0] = 99; }\nint main() {\n  int nums[] = {1, 2, 3};\n  modify(nums);\n  printf(\"%d\", nums[0]);\n  return 0;\n}",
      cpp: "#include <iostream>\n#include <vector>\nusing namespace std;\nvoid modify(vector<int>& arr) { arr[0] = 99; }\nint main() {\n  vector<int> nums = {1, 2, 3};\n  modify(nums);\n  cout << nums[0];\n  return 0;\n}",
      java: "public class Main {\n  public static void modify(int[] arr) { arr[0] = 99; }\n  public static void main(String[] args) {\n    int[] nums = {1, 2, 3};\n    modify(nums);\n    System.out.print(nums[0]);\n  }\n}",
      python: "def modify(arr):\n  arr[0] = 99\ndef main():\n  nums = [1, 2, 3]\n  modify(nums)\n  print(nums[0])\nif __name__ == '__main__':\n  main()"
    },
    options: {
      c: { "A": "1", "B": "99", "C": "0", "D": "Compilation Error" },
      cpp: { "A": "1", "B": "99", "C": "0", "D": "Compilation Error" },
      java: { "A": "1", "B": "99", "C": "0", "D": "Compilation Error" },
      python: { "A": "1", "B": "99", "C": "0", "D": "TypeError" }
    },
    correctOption: "B"
  },
  {
    sequence: 9,
    title: "Q9: Bitwise XOR",
    statement: "What will be the exact output of the following code snippet?",
    starterCodes: {
      c: "#include <stdio.h>\nint main() {\n  int a = 6;\n  int b = a >> 1;\n  int c = b ^ 5;\n  printf(\"%d\", c);\n  return 0;\n}",
      cpp: "#include <iostream>\nusing namespace std;\nint main() {\n  int a = 6;\n  int b = a >> 1;\n  int c = b ^ 5;\n  cout << c;\n  return 0;\n}",
      java: "public class Main {\n  public static void main(String[] args) {\n    int a = 6;\n    int b = a >> 1;\n    int c = b ^ 5;\n    System.out.print(c);\n  }\n}",
      python: "def main():\n  a = 6\n  b = a >> 1\n  c = b ^ 5\n  print(c)\nif __name__ == '__main__':\n  main()"
    },
    options: {
      c: { "A": "6", "B": "3", "C": "0", "D": "5" },
      cpp: { "A": "6", "B": "3", "C": "0", "D": "5" },
      java: { "A": "6", "B": "3", "C": "0", "D": "5" },
      python: { "A": "6", "B": "3", "C": "0", "D": "5" }
    },
    correctOption: "A"
  },
  {
    sequence: 10,
    title: "Q10: Static/Global Persistence",
    statement: "What will be the exact output of the following code snippet?",
    starterCodes: {
      c: "#include <stdio.h>\nvoid func() {\n  static int count = 0;\n  count++;\n  printf(\"%d \", count);\n}\nint main() {\n  func(); func();\n  return 0;\n}",
      cpp: "#include <iostream>\nusing namespace std;\nvoid func() {\n  static int count = 0;\n  count++;\n  cout << count << \" \";\n}\nint main() {\n  func(); func();\n  return 0;\n}",
      java: "public class Main {\n  static int count = 0;\n  public static void func() {\n    count++;\n    System.out.print(count + \" \");\n  }\n  public static void main(String[] args) {\n    func(); func();\n  }\n}",
      python: "count = 0\ndef func():\n  global count\n  count += 1\n  print(count, end=\" \")\ndef main():\n  func()\n  func()\nif __name__ == '__main__':\n  main()"
    },
    options: {
      c: { "A": "1 1", "B": "1 2", "C": "0 1", "D": "Garbage Value" },
      cpp: { "A": "1 1", "B": "1 2", "C": "0 1", "D": "Garbage Value" },
      java: { "A": "1 1", "B": "1 2", "C": "0 1", "D": "Garbage Value" },
      python: { "A": "1 1", "B": "1 2", "C": "0 1", "D": "Error" }
    },
    correctOption: "B"
  }
];

// Exact questions provided by user for Set B
const RAW_SET_B = [
  {
    sequence: 1,
    title: "Q1: The Post-Decrement Trap",
    statement: "What will be the exact output of the following code snippet?",
    starterCodes: {
      c: "#include <stdio.h>\nint main() {\n  int i = 5;\n  while (i-- > 3) {\n    printf(\"%d \", i);\n  }\n  return 0;\n}",
      cpp: "#include <iostream>\nusing namespace std;\nint main() {\n  int i = 5;\n  while (i-- > 3) {\n    cout << i << \" \";\n  }\n  return 0;\n}",
      java: "public class Main {\n  public static void main(String[] args) {\n    int i = 5;\n    while (i-- > 3) {\n      System.out.print(i + \" \");\n    }\n  }\n}",
      python: "def main():\n  i = 5\n  while i > 3:\n    i -= 1\n    print(i, end=\" \")\nif __name__ == '__main__':\n  main()"
    },
    options: {
      c: { "A": "5 4", "B": "4 3", "C": "5 4 3", "D": "4 3 2" },
      cpp: { "A": "5 4", "B": "4 3", "C": "5 4 3", "D": "4 3 2" },
      java: { "A": "5 4", "B": "4 3", "C": "5 4 3", "D": "4 3 2" },
      python: { "A": "5 4", "B": "4 3", "C": "5 4 3", "D": "4 3 2" }
    },
    correctOption: "B"
  },
  {
    sequence: 2,
    title: "Q2: Variable Scope & Shadowing",
    statement: "What will be the exact output of the following code snippet?",
    starterCodes: {
      c: "#include <stdio.h>\nint y = 5;\nint main() {\n  int y = 15;\n  {\n    int y = 25;\n    printf(\"%d \", y);\n  }\n  printf(\"%d\", y);\n  return 0;\n}",
      cpp: "#include <iostream>\nusing namespace std;\nint y = 5;\nint main() {\n  int y = 15;\n  {\n    int y = 25;\n    cout << y << \" \";\n  }\n  cout << y;\n  return 0;\n}",
      java: "public class Main {\n  static int y = 5;\n  public static void main(String[] args) {\n    int y = 15;\n    printInner(y);\n    System.out.print(y);\n  }\n  static void printInner(int y) {\n    int innerY = 25;\n    System.out.print(innerY + \" \");\n  }\n}",
      python: "y = 5\ndef main():\n  y = 15\n  def inner():\n    y = 25\n    print(y, end=\" \")\n  inner()\n  print(y)\nif __name__ == '__main__':\n  main()"
    },
    options: {
      c: { "A": "25 15", "B": "15 5", "C": "25 5", "D": "5 25" },
      cpp: { "A": "25 15", "B": "15 5", "C": "25 5", "D": "5 25" },
      java: { "A": "25 15", "B": "15 5", "C": "25 5", "D": "5 25" },
      python: { "A": "25 15", "B": "15 5", "C": "25 5", "D": "5 25" }
    },
    correctOption: "A"
  },
  {
    sequence: 3,
    title: "Q3: Assignment vs Equality",
    statement: "What will be the exact output of the following code snippet?",
    starterCodes: {
      c: "#include <stdio.h>\nint main() {\n  int p = 10;\n  if (p = 1) printf(\"One\");\n  else printf(\"Not One\");\n  return 0;\n}",
      cpp: "#include <iostream>\nusing namespace std;\nint main() {\n  int p = 10;\n  if (p = 1) cout << \"One\";\n  else cout << \"Not One\";\n  return 0;\n}",
      java: "public class Main {\n  public static void main(String[] args) {\n    boolean active = true;\n    if (active = false) System.out.print(\"A\");\n    else System.out.print(\"B\");\n  }\n}",
      python: "def main():\n  if (p := 1):\n    print(\"One\")\n  else:\n    print(\"Not One\")\nif __name__ == '__main__':\n  main()"
    },
    options: {
      c: { "A": "One", "B": "Not One", "C": "Compilation Error", "D": "Runtime Error" },
      cpp: { "A": "One", "B": "Not One", "C": "Compilation Error", "D": "Runtime Error" },
      java: { "A": "A", "B": "B", "C": "Compilation Error", "D": "Runtime Error" },
      python: { "A": "One", "B": "Not One", "C": "SyntaxError", "D": "TypeError" }
    },
    correctOption: "A"
  },
  {
    sequence: 4,
    title: "Q4: Switch Fall-Through",
    statement: "What will be the exact output of the following code snippet?",
    starterCodes: {
      c: "#include <stdio.h>\nint main() {\n  int val = 2;\n  switch(val) {\n    case 1: printf(\"A\"); break;\n    case 2: printf(\"B\");\n    case 3: printf(\"C\"); break;\n    default: printf(\"D\");\n  }\n  return 0;\n}",
      cpp: "#include <iostream>\nusing namespace std;\nint main() {\n  int val = 2;\n  switch(val) {\n    case 1: cout << \"A\"; break;\n    case 2: cout << \"B\";\n    case 3: cout << \"C\"; break;\n    default: cout << \"D\";\n  }\n  return 0;\n}",
      java: "public class Main {\n  public static void main(String[] args) {\n    int val = 2;\n    switch(val) {\n      case 1: System.out.print(\"A\"); break;\n      case 2: System.out.print(\"B\");\n      case 3: System.out.print(\"C\"); break;\n      default: System.out.print(\"D\");\n    }\n  }\n}",
      python: "def main():\n  val = 2\n  if val == 1:\n    print(\"A\", end=\"\")\n  if val == 2:\n    print(\"B\", end=\"\")\n  if val >= 2 and val <= 3:\n    print(\"C\", end=\"\")\nif __name__ == '__main__':\n  main()"
    },
    options: {
      c: { "A": "B", "B": "BC", "C": "BCD", "D": "Compilation Error" },
      cpp: { "A": "B", "B": "BC", "C": "BCD", "D": "Compilation Error" },
      java: { "A": "B", "B": "BC", "C": "BCD", "D": "Compilation Error" },
      python: { "A": "B", "B": "BC", "C": "BCD", "D": "SyntaxError" }
    },
    correctOption: "B"
  },
  {
    sequence: 5,
    title: "Q5: Boolean Short-Circuiting (OR)",
    statement: "What will be the exact output of the following code snippet?",
    starterCodes: {
      c: "#include <stdio.h>\nint main() {\n  int x = 2, y = 2;\n  if (x == 2 || ++y == 3) printf(\"True \");\n  printf(\"%d\", y);\n  return 0;\n}",
      cpp: "#include <iostream>\nusing namespace std;\nint main() {\n  int x = 2, y = 2;\n  if (x == 2 || ++y == 3) cout << \"True \";\n  cout << y;\n  return 0;\n}",
      java: "public class Main {\n  public static void main(String[] args) {\n    int x = 2, y = 2;\n    if (x == 2 || ++y == 3) System.out.print(\"True \");\n    System.out.print(y);\n  }\n}",
      python: "def increment_y():\n  global y\n  y += 1\n  return y == 3\ndef main():\n  global y\n  x, y = 2, 2\n  if x == 2 or increment_y():\n    print(\"True\", end=\" \")\n  print(y)\nif __name__ == '__main__':\n  main()"
    },
    options: {
      c: { "A": "True 3", "B": "True 2", "C": "3", "D": "2" },
      cpp: { "A": "True 3", "B": "True 2", "C": "3", "D": "2" },
      java: { "A": "True 3", "B": "True 2", "C": "3", "D": "2" },
      python: { "A": "True 3", "B": "True 2", "C": "3", "D": "2" }
    },
    correctOption: "B"
  },
  {
    sequence: 6,
    title: "Q6: Array Default Initialization",
    statement: "What will be the exact output of the following code snippet?",
    starterCodes: {
      c: "#include <stdio.h>\nint main() {\n  int nums[4] = {10};\n  printf(\"%d\", nums[2]);\n  return 0;\n}",
      cpp: "#include <iostream>\nusing namespace std;\nint main() {\n  int nums[4] = {10};\n  cout << nums[2];\n  return 0;\n}",
      java: "public class Main {\n  public static void main(String[] args) {\n    boolean[] bools = new boolean[3];\n    bools[0] = true;\n    System.out.print(bools[1]);\n  }\n}",
      python: "def main():\n  nums = [0]*4\n  nums[0] = 10\n  print(nums[2])\nif __name__ == '__main__':\n  main()"
    },
    options: {
      c: { "A": "10", "B": "Garbage Value", "C": "0", "D": "Compilation Error" },
      cpp: { "A": "10", "B": "Garbage Value", "C": "0", "D": "Compilation Error" },
      java: { "A": "true", "B": "false", "C": "null", "D": "Compilation Error" },
      python: { "A": "10", "B": "None", "C": "0", "D": "TypeError" }
    },
    correctOption: "C"
  },
  {
    sequence: 7,
    title: "Q7: Integer Division Math",
    statement: "What will be the exact output of the following code snippet?",
    starterCodes: {
      c: "#include <stdio.h>\nint main() {\n  float f = 7 / 3 * 2.5;\n  printf(\"%.1f\", f);\n  return 0;\n}",
      cpp: "#include <iostream>\nusing namespace std;\nint main() {\n  float f = 7 / 3 * 2.5;\n  cout << f;\n  return 0;\n}",
      java: "public class Main {\n  public static void main(String[] args) {\n    double f = 7 / 3 * 2.5;\n    System.out.print(f);\n  }\n}",
      python: "def main():\n  f = 7 // 3 * 2.5\n  print(f)\nif __name__ == '__main__':\n  main()"
    },
    options: {
      c: { "A": "5.8", "B": "5.0", "C": "6.0", "D": "Compilation Error" },
      cpp: { "A": "5.83", "B": "5", "C": "6", "D": "Compilation Error" },
      java: { "A": "5.83", "B": "5.0", "C": "6.0", "D": "Compilation Error" },
      python: { "A": "5.8", "B": "5.0", "C": "6.0", "D": "TypeError" }
    },
    correctOption: "B"
  },
  {
    sequence: 8,
    title: "Q8: Reference Mutability",
    statement: "What will be the exact output of the following code snippet?",
    starterCodes: {
      c: "#include <stdio.h>\n#include <stdlib.h>\nvoid modify(int **arr) { \n  *arr = malloc(sizeof(int)); \n  (*arr)[0] = 99; \n}\nint main() {\n  int *nums = malloc(sizeof(int)); nums[0]=1;\n  modify(&nums);\n  printf(\"%d\", nums[0]);\n  return 0;\n}",
      cpp: "#include <iostream>\n#include <vector>\nusing namespace std;\nvoid modify(vector<int> arr) { arr[0] = 99; }\nint main() {\n  vector<int> nums = {1, 2};\n  modify(nums);\n  cout << nums[0];\n  return 0;\n}",
      java: "public class Main {\n  public static void change(int[] arr) {\n    arr = new int[]{99, 99};\n  }\n  public static void main(String[] args) {\n    int[] nums = {1, 2};\n    change(nums);\n    System.out.print(nums[0]);\n  }\n}",
      python: "def modify(arr):\n  arr = [99, 99]\ndef main():\n  nums = [1, 2]\n  modify(nums)\n  print(nums[0])\nif __name__ == '__main__':\n  main()"
    },
    options: {
      c: { "A": "1", "B": "99", "C": "0", "D": "Garbage Value" },
      cpp: { "A": "1", "B": "99", "C": "0", "D": "Compilation Error" },
      java: { "A": "1", "B": "99", "C": "0", "D": "Compilation Error" },
      python: { "A": "1", "B": "99", "C": "0", "D": "TypeError" }
    },
    correctOption: "A"
  },
  {
    sequence: 9,
    title: "Q9: Bitwise Magic",
    statement: "What will be the exact output of the following code snippet?",
    starterCodes: {
      c: "#include <stdio.h>\nint main() {\n  int a = 4;\n  int b = a << 1;\n  int c = b ^ 3;\n  printf(\"%d\", c);\n  return 0;\n}",
      cpp: "#include <iostream>\nusing namespace std;\nint main() {\n  int a = 4;\n  int b = a << 1;\n  int c = b ^ 3;\n  cout << c;\n  return 0;\n}",
      java: "public class Main {\n  public static void main(String[] args) {\n    int a = 4;\n    int b = a << 1;\n    int c = b ^ 3;\n    System.out.print(c);\n  }\n}",
      python: "def main():\n  a = 4\n  b = a << 1\n  c = b ^ 3\n  print(c)\nif __name__ == '__main__':\n  main()"
    },
    options: {
      c: { "A": "11", "B": "8", "C": "3", "D": "15" },
      cpp: { "A": "11", "B": "8", "C": "3", "D": "15" },
      java: { "A": "11", "B": "8", "C": "3", "D": "15" },
      python: { "A": "11", "B": "8", "C": "3", "D": "15" }
    },
    correctOption: "A"
  },
  {
    sequence: 10,
    title: "Q10: Static/Global Persistence",
    statement: "What will be the exact output of the following code snippet?",
    starterCodes: {
      c: "#include <stdio.h>\nvoid display() {\n  static int num = 5;\n  num--;\n  printf(\"%d \", num);\n}\nint main() {\n  display(); display();\n  return 0;\n}",
      cpp: "#include <iostream>\nusing namespace std;\nvoid display() {\n  static int num = 5;\n  num--;\n  cout << num << \" \";\n}\nint main() {\n  display(); display();\n  return 0;\n}",
      java: "public class Main {\n  static int num = 5;\n  public static void display() {\n    num--;\n    System.out.print(num + \" \");\n  }\n  public static void main(String[] args) {\n    display(); display();\n  }\n}",
      python: "num = 5\ndef display():\n  global num\n  num -= 1\n  print(num, end=\" \")\ndef main():\n  display()\n  display()\nif __name__ == '__main__':\n  main()"
    },
    options: {
      c: { "A": "4 4", "B": "5 4", "C": "4 3", "D": "Garbage Value" },
      cpp: { "A": "4 4", "B": "5 4", "C": "4 3", "D": "Garbage Value" },
      java: { "A": "4 4", "B": "5 4", "C": "4 3", "D": "Garbage Value" },
      python: { "A": "4 4", "B": "5 4", "C": "4 3", "D": "Error" }
    },
    correctOption: "C"
  }
];

async function seedAll() {
  console.log("=== STARTING FULL DATABASE SYNC FOR SET A & SET B ===");

  const r1 = await db.round.findFirst({ where: { sequence: 1 } });
  const r2 = await db.round.findFirst({ where: { sequence: 2 } });
  const r3 = await db.round.findFirst({ where: { sequence: 3 } });
  const r4 = await db.round.findFirst({ where: { sequence: 4 } });
  const r5 = await db.round.findFirst({ where: { sequence: 5 } });

  if (!r1 || !r2 || !r3 || !r4 || !r5) {
    console.error("Missing one or more rounds (1-5)!");
    return;
  }

  // 1. SYNC ROUND 1 MCQS (Set A: 10, Set B: 10)
  console.log("Syncing Round 1 MCQs...");
  for (const q of RAW_SET_A) {
    let prob = await db.problem.findFirst({ where: { roundId: r1.id, set: "A", sequence: q.sequence } });
    if (prob) {
      await db.problem.update({
        where: { id: prob.id },
        data: {
          title: q.title,
          statement: q.statement,
          starterCodes: q.starterCodes,
          options: q.options,
          correctOption: q.correctOption,
          isPublished: true,
        },
      });
    } else {
      await db.problem.create({
        data: {
          roundId: r1.id,
          set: "A",
          sequence: q.sequence,
          title: q.title,
          statement: q.statement,
          starterCodes: q.starterCodes,
          options: q.options,
          correctOption: q.correctOption,
          isPublished: true,
        },
      });
    }
  }

  for (const q of RAW_SET_B) {
    let prob = await db.problem.findFirst({ where: { roundId: r1.id, set: "B", sequence: q.sequence } });
    if (prob) {
      await db.problem.update({
        where: { id: prob.id },
        data: {
          title: q.title,
          statement: q.statement,
          starterCodes: q.starterCodes,
          options: q.options,
          correctOption: q.correctOption,
          isPublished: true,
        },
      });
    } else {
      await db.problem.create({
        data: {
          roundId: r1.id,
          set: "B",
          sequence: q.sequence,
          title: q.title,
          statement: q.statement,
          starterCodes: q.starterCodes,
          options: q.options,
          correctOption: q.correctOption,
          isPublished: true,
        },
      });
    }
  }
  console.log("✓ Round 1 MCQs updated successfully!");

  // 2. SYNC ROUND 2 (Code Optimization)
  console.log("Syncing Round 2 Code Optimization...");
  // Titles: Set A: Q1: The Summation AI, Q2: The Sorted Checker AI, Q3: The Score Spread AI, Q4: Max Subarray Signal AI
  const r2TitlesA = [
    "Q1: The Summation AI",
    "Q2: The Sorted Checker AI",
    "Q3: The Score Spread AI",
    "Q4: Max Subarray Signal AI",
  ];
  const r2TitlesB = [
    "Q1: The Handshake AI",
    "Q2: The Uniform Array Checker",
    "Q3: The Largest Product AI",
    "Q4: Min Subarray Expense AI",
  ];

  for (let i = 0; i < 4; i++) {
    const pA = await db.problem.findFirst({ where: { roundId: r2.id, set: "A", sequence: i + 1 } });
    if (pA) {
      await db.problem.update({
        where: { id: pA.id },
        data: { title: r2TitlesA[i] },
      });
    }
    const pB = await db.problem.findFirst({ where: { roundId: r2.id, set: "B", sequence: i + 1 } });
    if (pB) {
      await db.problem.update({
        where: { id: pB.id },
        data: { title: r2TitlesB[i] },
      });
    }
  }
  console.log("✓ Round 2 problem titles updated!");

  // 3. SYNC ROUND 3 (Debugging)
  console.log("Syncing Round 3 Debugging...");
  const r3TitlesA = ["Q1: The Last Occurrence Search", "Q2: Max Sales Streak"];
  const r3TitlesB = ["Q1: The First Vowel Index", "Q2: Adjacent Duplicates Counter"];
  for (let i = 0; i < 2; i++) {
    const pA = await db.problem.findFirst({ where: { roundId: r3.id, set: "A", sequence: i + 1 } });
    if (pA) await db.problem.update({ where: { id: pA.id }, data: { title: r3TitlesA[i] } });
    const pB = await db.problem.findFirst({ where: { roundId: r3.id, set: "B", sequence: i + 1 } });
    if (pB) await db.problem.update({ where: { id: pB.id }, data: { title: r3TitlesB[i] } });
  }
  console.log("✓ Round 3 problem titles updated!");

  // 4. SYNC ROUND 4 (DSA Options)
  console.log("Syncing Round 4 DSA Options...");
  const r4TitlesA = [
    "Option 1: The Hackathon Bug Queue",
    "Option 2: The Unique Playlist",
    "Option 3: Next Highest Stock Price",
  ];
  const r4TitlesB = [
    "Option 1: The ER Triage Queue",
    "Option 2: The Distinct Art Gallery",
    "Option 3: Next Warmer Day",
  ];
  for (let i = 0; i < 3; i++) {
    const pA = await db.problem.findFirst({ where: { roundId: r4.id, set: "A", sequence: i + 1 } });
    if (pA) await db.problem.update({ where: { id: pA.id }, data: { title: r4TitlesA[i] } });
    const pB = await db.problem.findFirst({ where: { roundId: r4.id, set: "B", sequence: i + 1 } });
    if (pB) await db.problem.update({ where: { id: pB.id }, data: { title: r4TitlesB[i] } });
  }
  console.log("✓ Round 4 problem titles updated!");

  // 5. SYNC ROUND 5 (Human vs Machine Grand Challenges for Set A & Set B)
  console.log("Syncing Round 5 Challenges for Set A & Set B...");

  const R5_CHALLENGES_A = [
    {
      sequence: 1,
      title: "Challenge 1: The 'Valid Username' AI",
      statement: "A username is valid ONLY if it is >= 5 characters, contains only letters/numbers/underscores, and does NOT start or end with an underscore.\n\nWrite a robust program returning 1 if valid, 0 otherwise.",
      inputFormat: "Single string.",
      outputFormat: "1 or 0.",
      constraints: "Length <= 10,000",
      sampleInput: "user_123",
      sampleOutput: "1",
      timeLimitMs: 2000,
      starterCodes: {
        c: "#include <stdio.h>\n#include <string.h>\n#include <ctype.h>\nint main() {\n    char s[10005];\n    if (!fgets(s, sizeof(s), stdin)) return 0;\n    // Implement logic here\n    return 0;\n}",
        cpp: "#include <iostream>\n#include <string>\nusing namespace std;\nint main() {\n    string s;\n    if (!getline(cin, s)) return 0;\n    // Implement logic here\n    return 0;\n}",
        java: "import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextLine()) return;\n        String s = sc.nextLine();\n        // Implement logic here\n    }\n}",
        python: "import sys\ndef main():\n    s = sys.stdin.read().rstrip('\\r\\n')\n    # Implement logic here\nif __name__ == '__main__':\n    main()"
      },
      aiAnalysisReport: {
        model: "ByteVerse Neural Engine v2",
        cleanCodeNames: { score: 90, feedback: "Clear variable naming convention." },
        hiddenCasesPass: { ratio: "2/4", percentage: 50 },
        edgeCasesPass: { ratio: "0/2", percentage: 0 },
        commentFormat: { score: 85, feedback: "Contains header documentation." },
        syntaxFormat: { score: 95, feedback: "Complies with standard styling." },
        timeComplexity: { estimate: "O(N)", verdict: "Optimal" },
        spaceComplexity: { estimate: "O(1)", verdict: "Optimal" }
      },
      testCases: [
        { input: "user_123", expected: "1", isHidden: false, isEdgeCase: false },
        { input: "code", expected: "0", isHidden: false, isEdgeCase: false },
        { input: "user@name", expected: "0", isHidden: true, isEdgeCase: false },
        { input: "hello_world", expected: "1", isHidden: true, isEdgeCase: false },
        { input: "_admin", expected: "0", isHidden: true, isEdgeCase: false },
        { input: "admin_", expected: "0", isHidden: true, isEdgeCase: false },
        { input: "", expected: "0", isHidden: true, isEdgeCase: true },
        { input: "a", expected: "0", isHidden: true, isEdgeCase: true }
      ]
    },
    {
      sequence: 2,
      title: "Challenge 2: The 'Average Class Score' AI",
      statement: "Given an array of integer test scores, calculate the average (mean) score formatted to exactly 1 decimal place. If the array is empty (N = 0), output 0.0.\n\nTake care to handle large scores without integer overflow.",
      inputFormat: "First line: integer N. Second line: N space-separated integers.",
      outputFormat: "Float formatted to 1 decimal place.",
      constraints: "0 <= N <= 100,000, 0 <= Scores <= 10^9",
      sampleInput: "3\n10 20 30",
      sampleOutput: "20.0",
      timeLimitMs: 2000,
      starterCodes: {
        c: "#include <stdio.h>\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 0;\n    // Implement logic here\n    return 0;\n}",
        cpp: "#include <iostream>\n#include <vector>\n#include <iomanip>\nusing namespace std;\nint main() {\n    int n;\n    if (!(cin >> n)) return 0;\n    // Implement logic here\n    return 0;\n}",
        java: "import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement logic here\n    }\n}",
        python: "import sys\ndef main():\n    data = sys.stdin.read().split()\n    # Implement logic here\nif __name__ == '__main__':\n    main()"
      },
      aiAnalysisReport: {
        model: "ByteVerse Neural Engine v2",
        cleanCodeNames: { score: 90, feedback: "Clear variable naming convention." },
        hiddenCasesPass: { ratio: "2/4", percentage: 50 },
        edgeCasesPass: { ratio: "0/2", percentage: 0 },
        commentFormat: { score: 85, feedback: "Contains header documentation." },
        syntaxFormat: { score: 95, feedback: "Complies with standard styling." },
        timeComplexity: { estimate: "O(N)", verdict: "Optimal" },
        spaceComplexity: { estimate: "O(1)", verdict: "Optimal" }
      },
      testCases: [
        { input: "3\n10 20 30", expected: "20.0", isHidden: false, isEdgeCase: false },
        { input: "4\n1 2 3 5", expected: "2.8", isHidden: false, isEdgeCase: false },
        { input: "5\n10 20 30 40 50", expected: "30.0", isHidden: true, isEdgeCase: false },
        { input: "1\n99", expected: "99.0", isHidden: true, isEdgeCase: false },
        { input: "4\n100 100 100 100", expected: "100.0", isHidden: true, isEdgeCase: false },
        { input: "3\n5 15 25", expected: "15.0", isHidden: true, isEdgeCase: false },
        { input: "0\n", expected: "0.0", isHidden: true, isEdgeCase: true },
        { input: "2\n1000000000 1000000000", expected: "1000000000.0", isHidden: true, isEdgeCase: true }
      ]
    },
    {
      sequence: 3,
      title: "Challenge 3: The 'Title Case' AI",
      statement: "Convert a string to Title Case where the first letter of each word is capitalized, and all subsequent letters in the word are lowercase. Words are separated by one or more spaces. Preserve single spaces between words in output.",
      inputFormat: "A single line of text.",
      outputFormat: "Title-cased string.",
      constraints: "Length <= 10,000",
      sampleInput: "hello world",
      sampleOutput: "Hello World",
      timeLimitMs: 2000,
      starterCodes: {
        c: "#include <stdio.h>\n#include <string.h>\n#include <ctype.h>\nint main() {\n    char s[10005];\n    if (!fgets(s, sizeof(s), stdin)) return 0;\n    // Implement logic here\n    return 0;\n}",
        cpp: "#include <iostream>\n#include <string>\nusing namespace std;\nint main() {\n    string s;\n    if (!getline(cin, s)) return 0;\n    // Implement logic here\n    return 0;\n}",
        java: "import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextLine()) return;\n        String s = sc.nextLine();\n        // Implement logic here\n    }\n}",
        python: "import sys\ndef main():\n    s = sys.stdin.read().rstrip('\\r\\n')\n    # Implement logic here\nif __name__ == '__main__':\n    main()"
      },
      aiAnalysisReport: {
        model: "ByteVerse Neural Engine v2",
        cleanCodeNames: { score: 90, feedback: "Clear variable naming convention." },
        hiddenCasesPass: { ratio: "2/4", percentage: 50 },
        edgeCasesPass: { ratio: "0/2", percentage: 0 },
        commentFormat: { score: 85, feedback: "Contains header documentation." },
        syntaxFormat: { score: 95, feedback: "Complies with standard styling." },
        timeComplexity: { estimate: "O(N)", verdict: "Optimal" },
        spaceComplexity: { estimate: "O(N)", verdict: "Optimal" }
      },
      testCases: [
        { input: "hello world", expected: "Hello World", isHidden: false, isEdgeCase: false },
        { input: "apple", expected: "Apple", isHidden: false, isEdgeCase: false },
        { input: "the quick brown fox", expected: "The Quick Brown Fox", isHidden: true, isEdgeCase: false },
        { input: "byteverse 2026", expected: "Byteverse 2026", isHidden: true, isEdgeCase: false },
        { input: "code logic challenge", expected: "Code Logic Challenge", isHidden: true, isEdgeCase: false },
        { input: "single", expected: "Single", isHidden: true, isEdgeCase: false },
        { input: "hello   world", expected: "Hello World", isHidden: true, isEdgeCase: true },
        { input: "   ", expected: "", isHidden: true, isEdgeCase: true }
      ]
    },
    {
      sequence: 4,
      title: "Challenge 4: The 'Safe Password' AI",
      statement: "A password is safe if and only if:\n1. Length >= 8 characters\n2. Contains at least 1 numeric digit\n3. Contains at least 1 uppercase letter\n4. Contains NO adjacent duplicate characters (case-insensitive, e.g. 'vV' or 'aa' is invalid)\n\nOutput 1 if safe, 0 otherwise.",
      inputFormat: "A single string without spaces.",
      outputFormat: "1 or 0.",
      constraints: "Length <= 1,000",
      sampleInput: "Pass1234",
      sampleOutput: "0",
      timeLimitMs: 2000,
      starterCodes: {
        c: "#include <stdio.h>\n#include <string.h>\n#include <ctype.h>\nint main() {\n    char s[1005];\n    if (scanf(\"%s\", s) != 1) return 0;\n    // Implement logic here\n    return 0;\n}",
        cpp: "#include <iostream>\n#include <string>\nusing namespace std;\nint main() {\n    string s;\n    if (!(cin >> s)) return 0;\n    // Implement logic here\n    return 0;\n}",
        java: "import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNext()) return;\n        String s = sc.next();\n        // Implement logic here\n    }\n}",
        python: "import sys\ndef main():\n    s = sys.stdin.read().strip()\n    # Implement logic here\nif __name__ == '__main__':\n    main()"
      },
      aiAnalysisReport: {
        model: "ByteVerse Neural Engine v2",
        cleanCodeNames: { score: 90, feedback: "Clear variable naming convention." },
        hiddenCasesPass: { ratio: "2/4", percentage: 50 },
        edgeCasesPass: { ratio: "0/2", percentage: 0 },
        commentFormat: { score: 85, feedback: "Contains header documentation." },
        syntaxFormat: { score: 95, feedback: "Complies with standard styling." },
        timeComplexity: { estimate: "O(N)", verdict: "Optimal" },
        spaceComplexity: { estimate: "O(1)", verdict: "Optimal" }
      },
      testCases: [
        { input: "Pass1234", expected: "0", isHidden: false, isEdgeCase: false },
        { input: "Valid123", expected: "1", isHidden: false, isEdgeCase: false },
        { input: "HelloWorld1", expected: "1", isHidden: true, isEdgeCase: false },
        { input: "nouppercase123", expected: "0", isHidden: true, isEdgeCase: false },
        { input: "NODIGITPASS", expected: "0", isHidden: true, isEdgeCase: false },
        { input: "Abc12345", expected: "1", isHidden: true, isEdgeCase: false },
        { input: "vV123456", expected: "0", isHidden: true, isEdgeCase: true },
        { input: "short1A", expected: "0", isHidden: true, isEdgeCase: true }
      ]
    }
  ];

  const R5_CHALLENGES_B = [
    {
      sequence: 1,
      title: "Challenge 1: The 'Valid Email' AI",
      statement: "An email is valid if and only if:\n1. It contains exactly one '@' symbol\n2. It contains at least one '.' dot after the '@'\n3. There is at least 1 non-whitespace character before the '@', between '@' and '.', and after the last '.'\n\nOutput 1 if valid, 0 otherwise.",
      inputFormat: "Single string.",
      outputFormat: "1 or 0.",
      constraints: "Length <= 10,000",
      sampleInput: "user@gmail.com",
      sampleOutput: "1",
      timeLimitMs: 2000,
      starterCodes: {
        c: "#include <stdio.h>\n#include <string.h>\nint main() {\n    char s[10005];\n    if (scanf(\"%s\", s) != 1) return 0;\n    // Implement logic here\n    return 0;\n}",
        cpp: "#include <iostream>\n#include <string>\nusing namespace std;\nint main() {\n    string s;\n    if (!(cin >> s)) return 0;\n    // Implement logic here\n    return 0;\n}",
        java: "import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNext()) return;\n        String s = sc.next();\n        // Implement logic here\n    }\n}",
        python: "import sys\ndef main():\n    s = sys.stdin.read().strip()\n    # Implement logic here\nif __name__ == '__main__':\n    main()"
      },
      aiAnalysisReport: {
        model: "ByteVerse Neural Engine v2",
        cleanCodeNames: { score: 90, feedback: "Clear variable naming convention." },
        hiddenCasesPass: { ratio: "2/4", percentage: 50 },
        edgeCasesPass: { ratio: "0/2", percentage: 0 },
        commentFormat: { score: 85, feedback: "Contains header documentation." },
        syntaxFormat: { score: 95, feedback: "Complies with standard styling." },
        timeComplexity: { estimate: "O(N)", verdict: "Optimal" },
        spaceComplexity: { estimate: "O(1)", verdict: "Optimal" }
      },
      testCases: [
        { input: "user@gmail.com", expected: "1", isHidden: false, isEdgeCase: false },
        { input: "invalidemail", expected: "0", isHidden: false, isEdgeCase: false },
        { input: "@gmail.com", expected: "0", isHidden: true, isEdgeCase: false },
        { input: "user@gmail.", expected: "0", isHidden: true, isEdgeCase: false },
        { input: "user@.com", expected: "0", isHidden: true, isEdgeCase: false },
        { input: "admin@byteverse.dev", expected: "1", isHidden: true, isEdgeCase: false },
        { input: "a@b.c", expected: "1", isHidden: true, isEdgeCase: true },
        { input: "a@@b.com", expected: "0", isHidden: true, isEdgeCase: true }
      ]
    },
    {
      sequence: 2,
      title: "Challenge 2: The 'Median Score' AI",
      statement: "Given an array of integer scores, find the median value formatted to 1 decimal place.\nThe median is the middle element of the sorted array if N is odd, or the average of the two middle elements if N is even. If N = 0, output 0.0.",
      inputFormat: "First line: integer N. Second line: N space-separated integers.",
      outputFormat: "Float formatted to 1 decimal place.",
      constraints: "0 <= N <= 100,000, 0 <= Scores <= 10^9",
      sampleInput: "3\n10 20 30",
      sampleOutput: "20.0",
      timeLimitMs: 2000,
      starterCodes: {
        c: "#include <stdio.h>\n#include <stdlib.h>\nint cmp(const void *a, const void *b) {\n    long long diff = (*(long long*)a - *(long long*)b);\n    return (diff > 0) - (diff < 0);\n}\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 0;\n    // Implement logic here\n    return 0;\n}",
        cpp: "#include <iostream>\n#include <vector>\n#include <algorithm>\n#include <iomanip>\nusing namespace std;\nint main() {\n    int n;\n    if (!(cin >> n)) return 0;\n    // Implement logic here\n    return 0;\n}",
        java: "import java.util.Scanner;\nimport java.util.Arrays;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement logic here\n    }\n}",
        python: "import sys\ndef main():\n    data = sys.stdin.read().split()\n    # Implement logic here\nif __name__ == '__main__':\n    main()"
      },
      aiAnalysisReport: {
        model: "ByteVerse Neural Engine v2",
        cleanCodeNames: { score: 90, feedback: "Clear variable naming convention." },
        hiddenCasesPass: { ratio: "2/4", percentage: 50 },
        edgeCasesPass: { ratio: "0/2", percentage: 0 },
        commentFormat: { score: 85, feedback: "Contains header documentation." },
        syntaxFormat: { score: 95, feedback: "Complies with standard styling." },
        timeComplexity: { estimate: "O(N log N)", verdict: "Optimal" },
        spaceComplexity: { estimate: "O(N)", verdict: "Optimal" }
      },
      testCases: [
        { input: "3\n10 20 30", expected: "20.0", isHidden: false, isEdgeCase: false },
        { input: "4\n1 2 3 4", expected: "2.5", isHidden: false, isEdgeCase: false },
        { input: "5\n5 1 4 2 3", expected: "3.0", isHidden: true, isEdgeCase: false },
        { input: "1\n42", expected: "42.0", isHidden: true, isEdgeCase: false },
        { input: "6\n10 20 30 40 50 60", expected: "35.0", isHidden: true, isEdgeCase: false },
        { input: "4\n100 200 300 400", expected: "250.0", isHidden: true, isEdgeCase: false },
        { input: "0\n", expected: "0.0", isHidden: true, isEdgeCase: true },
        { input: "2\n10 20", expected: "15.0", isHidden: true, isEdgeCase: true }
      ]
    },
    {
      sequence: 3,
      title: "Challenge 3: The 'Word Counter' AI",
      statement: "Given a string of text, count the total number of words in the string. Words are separated by one or more whitespace characters. Consecutive spaces, leading spaces, and trailing spaces do not count as extra words.",
      inputFormat: "A single line of text.",
      outputFormat: "Single integer.",
      constraints: "Length <= 10,000",
      sampleInput: "hello world",
      sampleOutput: "2",
      timeLimitMs: 2000,
      starterCodes: {
        c: "#include <stdio.h>\n#include <string.h>\n#include <ctype.h>\nint main() {\n    char s[10005];\n    if (!fgets(s, sizeof(s), stdin)) return 0;\n    // Implement logic here\n    return 0;\n}",
        cpp: "#include <iostream>\n#include <string>\n#include <sstream>\nusing namespace std;\nint main() {\n    string s;\n    if (!getline(cin, s)) return 0;\n    // Implement logic here\n    return 0;\n}",
        java: "import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextLine()) return;\n        String s = sc.nextLine();\n        // Implement logic here\n    }\n}",
        python: "import sys\ndef main():\n    s = sys.stdin.read()\n    # Implement logic here\nif __name__ == '__main__':\n    main()"
      },
      aiAnalysisReport: {
        model: "ByteVerse Neural Engine v2",
        cleanCodeNames: { score: 90, feedback: "Clear variable naming convention." },
        hiddenCasesPass: { ratio: "2/4", percentage: 50 },
        edgeCasesPass: { ratio: "0/2", percentage: 0 },
        commentFormat: { score: 85, feedback: "Contains header documentation." },
        syntaxFormat: { score: 95, feedback: "Complies with standard styling." },
        timeComplexity: { estimate: "O(N)", verdict: "Optimal" },
        spaceComplexity: { estimate: "O(1)", verdict: "Optimal" }
      },
      testCases: [
        { input: "hello world", expected: "2", isHidden: false, isEdgeCase: false },
        { input: "byteverse", expected: "1", isHidden: false, isEdgeCase: false },
        { input: "the quick brown fox jumps", expected: "5", isHidden: true, isEdgeCase: false },
        { input: "coding competition round 5", expected: "4", isHidden: true, isEdgeCase: false },
        { input: "one two three", expected: "3", isHidden: true, isEdgeCase: false },
        { input: "a", expected: "1", isHidden: true, isEdgeCase: false },
        { input: "hello    world", expected: "2", isHidden: true, isEdgeCase: true },
        { input: "   ", expected: "0", isHidden: true, isEdgeCase: true }
      ]
    },
    {
      sequence: 4,
      title: "Challenge 4: The 'Anagram Checker' AI",
      statement: "An anagram is a word or phrase formed by rearranging the letters of a different word or phrase. Given two strings, determine if they are anagrams of each other. The check must be case-insensitive and ignore all spaces and punctuation.\n\nOutput 1 if anagrams, 0 otherwise.",
      inputFormat: "First line: String A. Second line: String B.",
      outputFormat: "1 or 0.",
      constraints: "Length <= 1,000",
      sampleInput: "Listen\nSilent",
      sampleOutput: "1",
      timeLimitMs: 2000,
      starterCodes: {
        c: "#include <stdio.h>\n#include <string.h>\n#include <ctype.h>\nint main() {\n    char a[1005], b[1005];\n    if (!fgets(a, sizeof(a), stdin)) return 0;\n    if (!fgets(b, sizeof(b), stdin)) return 0;\n    // Implement logic here\n    return 0;\n}",
        cpp: "#include <iostream>\n#include <string>\n#include <algorithm>\nusing namespace std;\nint main() {\n    string a, b;\n    if (!getline(cin, a)) return 0;\n    if (!getline(cin, b)) return 0;\n    // Implement logic here\n    return 0;\n}",
        java: "import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextLine()) return;\n        String a = sc.nextLine();\n        if (!sc.hasNextLine()) return;\n        String b = sc.nextLine();\n        // Implement logic here\n    }\n}",
        python: "import sys\ndef main():\n    lines = sys.stdin.read().splitlines()\n    # Implement logic here\nif __name__ == '__main__':\n    main()"
      },
      aiAnalysisReport: {
        model: "ByteVerse Neural Engine v2",
        cleanCodeNames: { score: 90, feedback: "Clear variable naming convention." },
        hiddenCasesPass: { ratio: "2/4", percentage: 50 },
        edgeCasesPass: { ratio: "0/2", percentage: 0 },
        commentFormat: { score: 85, feedback: "Contains header documentation." },
        syntaxFormat: { score: 95, feedback: "Complies with standard styling." },
        timeComplexity: { estimate: "O(N log N)", verdict: "Optimal" },
        spaceComplexity: { estimate: "O(N)", verdict: "Optimal" }
      },
      testCases: [
        { input: "Listen\nSilent", expected: "1", isHidden: false, isEdgeCase: false },
        { input: "hello\nworld", expected: "0", isHidden: false, isEdgeCase: false },
        { input: "evil\nvile", expected: "1", isHidden: true, isEdgeCase: false },
        { input: "triangle\nintegral", expected: "1", isHidden: true, isEdgeCase: false },
        { input: "apple\npale", expected: "0", isHidden: true, isEdgeCase: false },
        { input: "test\ntestt", expected: "0", isHidden: true, isEdgeCase: false },
        { input: "School master\nThe classroom", expected: "1", isHidden: true, isEdgeCase: true },
        { input: "Dormitory\nDirty room", expected: "1", isHidden: true, isEdgeCase: true }
      ]
    }
  ];

  // Seed Set A in Round 5
  for (const c of R5_CHALLENGES_A) {
    let prob = await db.problem.findFirst({ where: { roundId: r5.id, set: "A", sequence: c.sequence } });
    if (!prob) {
      prob = await db.problem.create({
        data: {
          roundId: r5.id,
          set: "A",
          sequence: c.sequence,
          title: c.title,
          statement: c.statement,
          inputFormat: c.inputFormat,
          outputFormat: c.outputFormat,
          constraints: c.constraints,
          sampleInput: c.sampleInput,
          sampleOutput: c.sampleOutput,
          timeLimitMs: c.timeLimitMs,
          starterCodes: c.starterCodes,
          aiAnalysisReport: c.aiAnalysisReport,
          isPublished: true,
        },
      });
    } else {
      await db.problem.update({
        where: { id: prob.id },
        data: {
          title: c.title,
          statement: c.statement,
          inputFormat: c.inputFormat,
          outputFormat: c.outputFormat,
          constraints: c.constraints,
          sampleInput: c.sampleInput,
          sampleOutput: c.sampleOutput,
          timeLimitMs: c.timeLimitMs,
          starterCodes: c.starterCodes,
          aiAnalysisReport: c.aiAnalysisReport,
          isPublished: true,
        },
      });
      await db.testCase.deleteMany({ where: { problemId: prob.id } });
    }

    for (let idx = 0; idx < c.testCases.length; idx++) {
      const tc = c.testCases[idx];
      await db.testCase.create({
        data: {
          problemId: prob.id,
          input: tc.input,
          expected: tc.expected,
          isHidden: tc.isHidden,
          isEdgeCase: tc.isEdgeCase,
          sequence: idx + 1,
        },
      });
    }
  }

  // Seed Set B in Round 5
  for (const c of R5_CHALLENGES_B) {
    let prob = await db.problem.findFirst({ where: { roundId: r5.id, set: "B", sequence: c.sequence } });
    if (!prob) {
      prob = await db.problem.create({
        data: {
          roundId: r5.id,
          set: "B",
          sequence: c.sequence,
          title: c.title,
          statement: c.statement,
          inputFormat: c.inputFormat,
          outputFormat: c.outputFormat,
          constraints: c.constraints,
          sampleInput: c.sampleInput,
          sampleOutput: c.sampleOutput,
          timeLimitMs: c.timeLimitMs,
          starterCodes: c.starterCodes,
          aiAnalysisReport: c.aiAnalysisReport,
          isPublished: true,
        },
      });
    } else {
      await db.problem.update({
        where: { id: prob.id },
        data: {
          title: c.title,
          statement: c.statement,
          inputFormat: c.inputFormat,
          outputFormat: c.outputFormat,
          constraints: c.constraints,
          sampleInput: c.sampleInput,
          sampleOutput: c.sampleOutput,
          timeLimitMs: c.timeLimitMs,
          starterCodes: c.starterCodes,
          aiAnalysisReport: c.aiAnalysisReport,
          isPublished: true,
        },
      });
      await db.testCase.deleteMany({ where: { problemId: prob.id } });
    }

    for (let idx = 0; idx < c.testCases.length; idx++) {
      const tc = c.testCases[idx];
      await db.testCase.create({
        data: {
          problemId: prob.id,
          input: tc.input,
          expected: tc.expected,
          isHidden: tc.isHidden,
          isEdgeCase: tc.isEdgeCase,
          sequence: idx + 1,
        },
      });
    }
  }
  console.log("✓ Round 5 challenges for Set A and Set B updated with full test suites!");

  console.log("=== ALL SET A & SET B QUESTIONS SEEDED & SYNCED SUCCESSFULLY! ===");
  process.exit(0);
}

seedAll();
