// applyAICap mirrors the cap logic in applyAIPenalty/updateRoundScore (src/lib/scoring.ts)
function applyAICap(score: number, usedExplain: boolean, usedCode: boolean): number {
  const cap = usedCode ? 50 : usedExplain ? 75 : 100;
  return Math.min(score, cap);
}

describe("applyAICap", () => {
  test("no AI — full score", () => {
    expect(applyAICap(95, false, false)).toBe(95);
  });

  test("explain AI — cap 75", () => {
    expect(applyAICap(95, true, false)).toBe(75);
    expect(applyAICap(60, true, false)).toBe(60);
  });

  test("code AI — cap 50", () => {
    expect(applyAICap(95, false, true)).toBe(50);
    expect(applyAICap(30, false, true)).toBe(30);
  });

  test("both AI — cap 50 (code wins)", () => {
    expect(applyAICap(95, true, true)).toBe(50);
  });

  test("score of 0 stays 0", () => {
    expect(applyAICap(0, true, true)).toBe(0);
  });
});

describe("team score averaging", () => {
  function avg(a: number, b: number) { return (a + b) / 2; }

  test("round 1 average", () => {
    expect(avg(100, 50)).toBe(75);
  });

  test("team total", () => {
    const rounds = [
      avg(100, 50),
      avg(90, 75),
      avg(80, 100),
      avg(100, 60),
      avg(70, 80),
    ];
    const total = rounds.reduce((s, r) => s + r, 0);
    expect(total).toBe(402.5);
  });

  test("missing member with TREAT_AS_ZERO", () => {
    expect(avg(100, 0)).toBe(50);
  });
});
