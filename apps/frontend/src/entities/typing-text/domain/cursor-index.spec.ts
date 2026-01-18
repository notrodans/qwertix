import { describe, expect, it } from 'vitest';
import { calculateCursorIndex } from './typing-engine';

describe('calculateCursorIndex - Skipping Scenarios', () => {
	it('should handle skipping characters in the first word', () => {
		const target = 'hello world';
		const typed = 'hl '; // skipped 'e', 'l', 'o'
		// "hello" (5) vs "hl" (2). Max 5.
		// Space (1).
		// Next word start: 6.
		expect(calculateCursorIndex(target, typed)).toBe(6);
	});

	it('should handle skipping the entire first word', () => {
		const target = 'hello world';
		const typed = ' '; // skipped "hello"
		// "hello" (5) vs "" (0). Max 5.
		// Space (1).
		// Next word start: 6.
		expect(calculateCursorIndex(target, typed)).toBe(6);
	});

	it('should handle skipping multiple words', () => {
		const target = 'one two three';
		const typed = '  '; // skipped "one", "two"
		// "one" (3) + space (1) = 4.
		// "two" (3) + space (1) = 4.
		// "three" start: 8.
		expect(calculateCursorIndex(target, typed)).toBe(8);
	});

	it('should handle skipping characters in the last word', () => {
		const target = 'hello world';
		const typed = 'hello w'; // skipped "orld"
		// "hello" (5) + space (1) = 6.
		// "world" (5) vs "w" (1). Max 5.
		// activeWordChars = 1 ('w').
		// Wait. activeWordIndex = 1.
		// i=0. Max 5 + 1 = 6.
		// activeWordChars = 1.
		// Result 7.
		expect(calculateCursorIndex(target, typed)).toBe(7);
	});

	it('should handle skipping the last word completely (trailing space)', () => {
		const target = 'hello world';
		const typed = 'hello  '; // skipped "world"
		// "hello" (5) + space (1) = 6.
		// "world" (5) + space (0).
		// activeWordIndex = 2.
		// i=0. Max 5 + 1 = 6.
		// i=1. Target "world". User "". Max 5. Space? No (last word).
		// Result 6 + 5 = 11.
		expect(calculateCursorIndex(target, typed)).toBe(11);
	});

	it('should handle extra characters in skipped words', () => {
		const target = 'hello world';
		const typed = 'hex '; // "hello" -> "hex" (skipped 'l', 'l', 'o', but added 'x')
		// "hello" (5) vs "hex" (3). Max 5.
		// Space (1).
		// Result 6.
		expect(calculateCursorIndex(target, typed)).toBe(6);
	});

	it('should handle massive skips', () => {
		const target = 'a b c d e f';
		const typed = '     '; // skipped a, b, c, d, e
		// 5 words * (1 char + 1 space) = 10.
		// 'f' start at 10.
		expect(calculateCursorIndex(target, typed)).toBe(10);
	});
});
