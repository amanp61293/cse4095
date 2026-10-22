import type { DifficultyLevel, MathOperation, Question } from '../types/question';
import type { MistakePattern } from '../types/mistake';
import { generateAnswerChoices } from './answerChoices';
import { createUniqueId, randomInt } from '../utils/random';

export function patternKey(value: Pick<MistakePattern, 'operation' | 'difficulty' | 'firstOperand' | 'secondOperand'>): string {
  return `${value.operation}:${value.difficulty}:${value.firstOperand}:${value.secondOperand}`;
}
export function recordMistake(patterns: MistakePattern[], question: Question, now = new Date().toISOString()): MistakePattern[] {
  const key = patternKey(question);
  const index = patterns.findIndex((pattern) => patternKey(pattern) === key);
  if (index < 0) return [...patterns, { id: createUniqueId(), operation: question.operation, firstOperand: question.firstOperand, secondOperand: question.secondOperand, correctAnswer: question.correctAnswer, difficulty: question.difficulty, incorrectCount: 1, similarCorrectCount: 0, lastIncorrectAt: now, mastered: false }];
  return patterns.map((pattern, i) => i === index ? { ...pattern, incorrectCount: pattern.incorrectCount + 1, similarCorrectCount: 0, lastIncorrectAt: now, mastered: false } : pattern);
}
export function recordReviewResult(patterns: MistakePattern[], patternId: string, correct: boolean, threshold: number, now = new Date().toISOString()): MistakePattern[] {
  return patterns.map((pattern) => {
    if (pattern.id !== patternId) return pattern;
    if (!correct) return { ...pattern, incorrectCount: pattern.incorrectCount + 1, similarCorrectCount: 0, mastered: false, lastIncorrectAt: now };
    const similarCorrectCount = pattern.similarCorrectCount + 1;
    return { ...pattern, similarCorrectCount, mastered: similarCorrectCount >= threshold };
  });
}
export function reviewPriority(pattern: MistakePattern, now = Date.now()): number {
  const ageDays = Math.max(0, (now - Date.parse(pattern.lastIncorrectAt)) / 86400000);
  return (pattern.mastered ? 0.05 : 1) * ((pattern.incorrectCount * 4) + 8 / (1 + ageDays) + 3 / (1 + pattern.similarCorrectCount));
}
export function chooseReviewPattern(patterns: MistakePattern[], operations: MathOperation[], difficulty: DifficultyLevel, previousId?: string): MistakePattern | undefined {
  const matching = patterns.filter((p) => !p.mastered && operations.includes(p.operation) && p.difficulty === difficulty);
  const pool = matching.length > 1 ? matching.filter((p) => p.id !== previousId) : matching;
  if (!pool.length) return undefined;
  const weights = pool.map((p) => reviewPriority(p));
  const sum = weights.reduce((a, b) => a + b, 0);
  let pick = Math.random() * sum;
  for (let i = 0; i < pool.length; i++) { pick -= weights[i]; if (pick <= 0) return pool[i]; }
  return pool[pool.length - 1];
}
function withinRange(operation: MathOperation, level: DifficultyLevel, a: number, b: number): boolean {
  if (!Number.isSafeInteger(a) || !Number.isSafeInteger(b) || a < 0 || b < 0) return false;
  const max = [0, 10, 50, 100, 1000][level];
  if (operation === 'addition') return a <= max && b <= max;
  if (operation === 'subtraction') return a <= max && b <= a;
  if (operation === 'multiplication') {
    if (level <= 2) return a <= (level === 1 ? 5 : 10) && b <= (level === 1 ? 5 : 10);
    if (level === 3) return (a <= 9 && b <= 99) || (b <= 9 && a <= 99);
    return (a >= 10 && a <= 99 && b >= 1 && b <= 99) || (b >= 10 && b <= 99 && a >= 1 && a <= 99);
  }
  if (b === 0 || a % b !== 0) return false;
  if (level === 1) return b <= 5 && a / b <= 5;
  if (level === 2) return b <= 10 && a / b <= 10;
  if (level === 3) return b <= 12 && a <= 144;
  return b <= 99 && a / b <= 30;
}
function candidatePairs(pattern: MistakePattern): [MathOperation, number, number][] {
  const { operation: op, firstOperand: a, secondOperand: b, correctAnswer: c } = pattern;
  const candidates: [MathOperation, number, number][] = [
    [op, a, b], [op, a + 1, b], [op, a, b + 1], [op, a - 1, b], [op, a, b - 1],
  ];
  if (op === 'addition' || op === 'multiplication') candidates.push([op, b, a]);
  if (op === 'addition') candidates.push(['subtraction', c, a], ['subtraction', c, b]);
  if (op === 'subtraction') candidates.push(['addition', c, b]);
  if (op === 'multiplication') candidates.push(['division', c, b], ['division', c, a]);
  if (op === 'division') candidates.push(['multiplication', b, c]);
  return candidates;
}
export function generateSimilarQuestion(pattern: MistakePattern, allowed: MathOperation[], previous?: Question): Question {
  const valid = candidatePairs(pattern).filter(([operation, a, b]) => allowed.includes(operation) && withinRange(operation, pattern.difficulty, a, b))
    .filter(([operation, a, b]) => !previous || operation !== previous.operation || a !== previous.firstOperand || b !== previous.secondOperand);
  if (!valid.length) throw new Error('No valid related question for this mistake pattern');
  const [operation, firstOperand, secondOperand] = valid[randomInt(0, valid.length - 1)];
  const symbols = { addition: '+', subtraction: '−', multiplication: '×', division: '÷' };
  const correctAnswer = operation === 'addition' ? firstOperand + secondOperand : operation === 'subtraction' ? firstOperand - secondOperand : operation === 'multiplication' ? firstOperand * secondOperand : firstOperand / secondOperand;
  const question: Question = { id: createUniqueId(), operation, difficulty: pattern.difficulty, firstOperand, secondOperand, correctAnswer, displayText: `${firstOperand} ${symbols[operation]} ${secondOperand} = ?`, source: 'mistake-review', mistakePatternId: pattern.id, choices: [] };
  question.choices = generateAnswerChoices(question);
  return question;
}
