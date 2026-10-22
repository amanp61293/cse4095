import type { Question } from '../types/question';
import { randomInt, shuffleArray } from '../utils/random';

/** Generate one correct answer and three unique, believable whole-number distractors. */
export function generateAnswerChoices(
  question: Pick<Question, 'operation' | 'firstOperand' | 'secondOperand' | 'correctAnswer' | 'difficulty'>,
): number[] {
  const { operation, firstOperand: a, secondOperand: b, correctAnswer: answer } = question;
  if (!Number.isSafeInteger(answer) || answer < 0 || !Number.isSafeInteger(a) || !Number.isSafeInteger(b)) {
    throw new RangeError('Question needs safe, nonnegative integer operands and answer');
  }
  const candidates: number[] = [];
  const add = (value: number) => {
    if (Number.isSafeInteger(value) && value >= 0 && value !== answer && !candidates.includes(value)) {
      candidates.push(value);
    }
  };

  if (operation === 'addition') {
    [answer - 1, answer + 1, answer - 2, answer + 2, answer - 10, answer + 10, a - b, b - a, a + b + a, a + b + b].forEach(add);
  } else if (operation === 'subtraction') {
    [answer - 1, answer + 1, answer - 2, answer + 2, a + b, b - a, answer + 10, answer - 10, a, b].forEach(add);
  } else if (operation === 'multiplication') {
    [a * (b - 1), a * (b + 1), (a - 1) * b, (a + 1) * b, answer - 1, answer + 1, a + b, answer - 10, answer + 10].forEach(add);
  } else if (operation === 'division') {
    [answer - 1, answer + 1, answer - 2, answer + 2, answer + b, answer - b,
      b > 0 ? Math.floor(a / (b + 1)) : -1, b > 1 ? Math.floor(a / (b - 1)) : -1].forEach(add);
  } else {
    throw new RangeError('Invalid math operation');
  }

  // Draw from operation-specific candidates first so options resemble common mistakes.
  const distractors = shuffleArray(candidates).slice(0, 3);
  const seen = new Set<number>([answer, ...distractors]);
  // Bounded random attempts, then a guaranteed finite deterministic fallback.
  for (let tries = 0; distractors.length < 3 && tries < 24; tries++) {
    const distance = randomInt(1, Math.max(5, Math.min(50, Math.ceil(answer * 0.1))));
    const value = answer + (randomInt(0, 1) === 0 ? -distance : distance);
    if (value >= 0 && !seen.has(value)) {
      distractors.push(value);
      seen.add(value);
    }
  }
  for (let offset = 1; distractors.length < 3; offset++) {
    const value = answer + offset;
    if (Number.isSafeInteger(value) && !seen.has(value)) {
      distractors.push(value);
      seen.add(value);
    }
    if (offset > 10 && distractors.length < 3) throw new Error('Could not generate answer choices');
  }
  return shuffleArray([answer, ...distractors]);
}
