import { describe, expect, it, vi } from 'vitest';
import { createUniqueId, randomInt, shuffleArray } from './random';

describe('general random utilities', () => {
  it('returns inclusive endpoints and rejects invalid bounds', () => {
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0.999999);
    expect(randomInt(3, 8)).toBe(3);
    expect(randomInt(3, 8)).toBe(8);
    vi.restoreAllMocks();
    expect(() => randomInt(9, 2)).toThrow(RangeError);
    expect(() => randomInt(0.5, 4)).toThrow(RangeError);
  });
  it('shuffles without mutating or losing values', () => {
    const original = [1, 2, 3, 4];
    expect(shuffleArray(original).sort()).toEqual(original);
    expect(original).toEqual([1, 2, 3, 4]);
  });
  it('creates unique IDs', () => {
    expect(new Set(Array.from({ length: 100 }, createUniqueId)).size).toBe(100);
  });
});
