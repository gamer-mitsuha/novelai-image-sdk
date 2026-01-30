import { describe, it, expect } from 'vitest';
import {
  validateResolution,
  validateSteps,
  validateScale,
  validateSeed,
} from '../src/utils/Validators';

describe('validateResolution', () => {
  it('should accept valid dimensions (multiples of 64)', () => {
    expect(() => validateResolution(832, 1216)).not.toThrow();
    expect(() => validateResolution(1024, 1024)).not.toThrow();
    expect(() => validateResolution(64, 64)).not.toThrow();
    expect(() => validateResolution(1280, 768)).not.toThrow();
  });

  it('should reject dimensions not divisible by 64', () => {
    expect(() => validateResolution(833, 1216)).toThrow('multiple of 64');
    expect(() => validateResolution(832, 1217)).toThrow('multiple of 64');
    expect(() => validateResolution(100, 100)).toThrow('multiple of 64');
  });

  it('should reject non-integer dimensions', () => {
    expect(() => validateResolution(832.5, 1216)).toThrow('integers');
    expect(() => validateResolution(832, 1216.5)).toThrow('integers');
  });

  it('should reject non-positive dimensions', () => {
    expect(() => validateResolution(0, 1216)).toThrow('positive');
    expect(() => validateResolution(832, -64)).toThrow('positive');
  });
});

describe('validateSteps', () => {
  it('should accept valid step counts (1-50)', () => {
    expect(() => validateSteps(1)).not.toThrow();
    expect(() => validateSteps(28)).not.toThrow();
    expect(() => validateSteps(50)).not.toThrow();
  });

  it('should reject steps out of range', () => {
    expect(() => validateSteps(0)).toThrow('between 1 and 50');
    expect(() => validateSteps(51)).toThrow('between 1 and 50');
    expect(() => validateSteps(-1)).toThrow('between 1 and 50');
  });

  it('should reject non-integer steps', () => {
    expect(() => validateSteps(28.5)).toThrow('integer');
  });
});

describe('validateScale', () => {
  it('should accept valid scale values (0-10)', () => {
    expect(() => validateScale(0)).not.toThrow();
    expect(() => validateScale(5)).not.toThrow();
    expect(() => validateScale(10)).not.toThrow();
    expect(() => validateScale(7.5)).not.toThrow();
  });

  it('should reject scale out of range', () => {
    expect(() => validateScale(-1)).toThrow('between 0 and 10');
    expect(() => validateScale(11)).toThrow('between 0 and 10');
  });

  it('should reject NaN', () => {
    expect(() => validateScale(NaN)).toThrow('must be a number');
  });
});

describe('validateSeed', () => {
  it('should accept valid seeds (0 to 2^32-1)', () => {
    expect(() => validateSeed(0)).not.toThrow();
    expect(() => validateSeed(12345)).not.toThrow();
    expect(() => validateSeed(4294967295)).not.toThrow();
  });

  it('should reject seeds out of range', () => {
    expect(() => validateSeed(-1)).toThrow('between 0 and 2^32-1');
    expect(() => validateSeed(4294967296)).toThrow('between 0 and 2^32-1');
  });

  it('should reject non-integer seeds', () => {
    expect(() => validateSeed(123.45)).toThrow('integer');
  });
});
