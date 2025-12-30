import { describe, expect, it } from 'vitest';
import { calculateCursorIndex, checkWordCompletion } from './typing-engine';

describe('typing-engine', () => {
	describe('calculateCursorIndex', () => {
		it('should return 0 for empty input', () => {
			expect(calculateCursorIndex('hello', '')).toBe(0);
		});

		it('should track index within first word', () => {
			expect(calculateCursorIndex('hello', 'he')).toBe(2);
		});

		it('should jump to next word when skipping incomplete word', () => {
			const target = 'hello world';
			const typed = 'hel '; // user typed "hel" then space

			// Visual length of "hel" (incomplete) is handled as:
			// "hello" has length 5.
			// Logic: max("hello".length, "hel".length) = 5.
			// Plus space = 6.
			// Cursor should be at 6 (start of "world").

			// Wait, let's trace the loop:
			// i=0 (word 'hello', user 'hel'): max(5,3) = 5.
			// Plus space = 6.
			// activeWordIndex = 1 ("world" slot is empty).
			// activeWordChars = 0.
			// Total = 6.

			expect(calculateCursorIndex(target, typed)).toBe(6);
		});

		it('should jump to next word when skipping incorrect word (extras)', () => {
			const target = 'abc def';
			const typed = 'abxxx '; // len 6 (5 chars + space)

			// i=0 ('abc', 'abxxx'): max(3, 5) = 5.
			// Plus space = 6.
			// activeWordIndex = 1.
			// Total = 6.

			expect(calculateCursorIndex(target, typed)).toBe(6);
		});

		it('should position cursor inside second word correctly', () => {
			const target = 'abc def';
			const typed = 'abc d';

			// i=0 ('abc', 'abc'): max(3,3)=3.
			// Plus space = 4.
			// i=1: active word 'd'. len 1.
			// Total = 5.

			expect(calculateCursorIndex(target, typed)).toBe(5);
		});

		it('should handle multiple skips', () => {
			const target = 'one two three';
			const typed = 'o t th'; // "one"->o(skip), "two"->t(skip), "three"->th

			// i=0 ('one', 'o'): max(3,1)=3 + 1(space) = 4.
			// i=1 ('two', 't'): max(3,1)=3 + 1(space) = 4.
			// i=2 (active): 'th'. len 2.
			// Total = 4 + 4 + 2 = 10.

			expect(calculateCursorIndex(target, typed)).toBe(10);
		});
	});

	describe('checkWordCompletion', () => {
		it('should NOT lock (return null) when incomplete word is skipped via space', () => {
			const target = 'hello world';
			// User types "hel " (incomplete)
			const typed = 'hel ';

			// Should NOT confirm because it's incomplete
			const result = checkWordCompletion(typed, target);
			expect(result).toBeNull();
		});

		it('should NOT lock (return null) when incorrect word is skipped via space', () => {
			const target = 'hello world';
			// User types "hexx " (incorrect)
			const typed = 'hexx ';

			// Should NOT confirm
			const result = checkWordCompletion(typed, target);
			expect(result).toBeNull();
		});

		it('should LOCK (return index) when word is typed CORRECTLY', () => {
			const target = 'hello world';
			const typed = 'hello ';

			// Should confirm "hello "
			const result = checkWordCompletion(typed, target);
			expect(result).toBe(6);
		});

		it('should LOCK past previous incomplete/incorrect words when a SUBSEQUENT word is correct', () => {
			const target = 'one two three';
			// "on " (inc) + "two " (correct)
			const typed = 'on two ';

			// checkWordCompletion checks the LAST completed word (which is "two").
			// "two" matches target "two".
			// So it should confirm the WHOLE string 'on two '

			const result = checkWordCompletion(typed, target);

			expect(result).toBe(7); // Length of "on two "
		});

		it('should NOT lock if subsequent word is ALSO incorrect', () => {
			const target = 'one two three';
			// "on " (inc) + "tww " (inc)
			const typed = 'on tww ';

			const result = checkWordCompletion(typed, target);

			expect(result).toBeNull();
		});
	});
});
