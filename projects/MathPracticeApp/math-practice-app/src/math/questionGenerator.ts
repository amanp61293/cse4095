import type { DifficultyLevel, MathOperation, Question } from '../types/question';
import { createUniqueId, randomInt } from '../utils/random';

const OPERATIONS: readonly MathOperation[] = ['addition', 'subtraction', 'multiplication', 'division'];
const DIFFICULTIES: readonly DifficultyLevel[] = [1, 2, 3, 4];

function makeQuestion(operation: MathOperation, difficulty: DifficultyLevel, firstOperand: number, secondOperand: number): Question {
  const symbols: Record<MathOperation, string> = { addition: '+', subtraction: '−', multiplication: '×', division: '÷' };
  const correctAnswer = operation === 'addition' ? firstOperand + secondOperand
    : operation === 'subtraction' ? firstOperand - secondOperand
    : operation === 'multiplication' ? firstOperand * secondOperand
    : firstOperand / secondOperand;
  return {
    id: createUniqueId(), operation, difficulty, firstOperand, secondOperand,
    displayText: `${firstOperand} ${symbols[operation]} ${secondOperand} = ?`,
    correctAnswer, choices: [], source: 'regular',
  };
}

export function generateAddition(difficulty: DifficultyLevel): Question {
  const max = [0, 10, 50, 100, 1000][difficulty];
  const a = randomInt(0, max);
  const b = randomInt(0, max);
  return makeQuestion('addition', difficulty, a, b);
}

export function generateSubtraction(difficulty: DifficultyLevel): Question {
  const max = [0, 10, 50, 100, 1000][difficulty];
  const a = randomInt(0, max);
  const b = randomInt(0, a); // No negative results at any level in initial release.
  return makeQuestion('subtraction', difficulty, a, b);
}

export function generateMultiplication(difficulty: DifficultyLevel): Question {
  if (difficulty <= 2) {
    const maxFactor = difficulty === 1 ? 5 : 10;
    return makeQuestion('multiplication', difficulty, randomInt(0, maxFactor), randomInt(0, maxFactor));
  }
  if (difficulty === 3) {
    // One digit by one digit OR one digit by two digits.
    const a = randomInt(0, 9);
    const b = randomInt(0, 1) === 0 ? randomInt(0, 9) : randomInt(10, 99);
    return makeQuestion('multiplication', difficulty, a, b);
  }
  // Advanced: two-digit by one-digit or two-digit by two-digit.
  const a = randomInt(10, 99);
  const b = randomInt(0, 1) === 0 ? randomInt(1, 9) : randomInt(10, 99);
  return makeQuestion('multiplication', difficulty, a, b);
}

export function generateDivision(difficulty: DifficultyLevel): Question {
  let divisor: number;
  let quotient: number;
  if (difficulty === 1) {
    divisor = randomInt(1, 5);
    quotient = randomInt(0, 5);
  } else if (difficulty === 2) {
    divisor = randomInt(1, 10);
    quotient = randomInt(0, 10);
  } else if (difficulty === 3) {
    divisor = randomInt(1, 12);
    quotient = randomInt(0, Math.floor(144 / divisor));
  } else {
    // Advanced spec allows larger dividends and 1-/2-digit divisors; no precise cap provided.
    divisor = randomInt(1, 99);
    quotient = randomInt(1, 30);
  }
  return makeQuestion('division', difficulty, divisor * quotient, divisor);
}

export function generateQuestion(operation: MathOperation, difficulty: DifficultyLevel): Question {
  if (!OPERATIONS.includes(operation) || !DIFFICULTIES.includes(difficulty)) {
    throw new RangeError('Unknown operation or difficulty');
  }
  const question = operation === 'addition' ? generateAddition(difficulty)
    : operation === 'subtraction' ? generateSubtraction(difficulty)
    : operation === 'multiplication' ? generateMultiplication(difficulty)
    : generateDivision(difficulty);
  if (!Number.isInteger(question.correctAnswer) || question.secondOperand === 0 && operation === 'division') {
    throw new Error('Generated an invalid question');
  }
  return question;
}

export function generateMixedQuestion(operations: readonly MathOperation[], difficulty: DifficultyLevel): Question {
  if (operations.length === 0 || operations.some((operation) => !OPERATIONS.includes(operation))) {
    throw new RangeError('Choose at least one valid operation');
  }
  return generateQuestion(operations[randomInt(0, operations.length - 1)], difficulty);
}
