/** Inclusive integer randomization. */
export function randomInt(min: number, max: number): number {
  if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max) || min > max) {
    throw new RangeError('Expected safe integer bounds with min <= max');
  }
  return min + Math.floor(Math.random() * (max - min + 1));
}

/** Fisher-Yates shuffle; returns a new array and does not mutate the original. */
export function shuffleArray<T>(values: readonly T[]): T[] {
  const shuffled = [...values];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

let fallbackCounter = 0;
export function createUniqueId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  fallbackCounter += 1;
  return `${Date.now()}-${fallbackCounter}-${Math.random().toString(36).slice(2)}`;
}
