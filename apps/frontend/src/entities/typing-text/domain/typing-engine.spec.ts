import { describe, expect, it } from 'vitest';
import {
	appendCharacter,
	calculateCursorIndex,
	checkCompletion,
	checkWordCompletion,
	getIncorrectCharsCount,
} from './typing-engine';

describe('typing-engine', () => {
	describe('getIncorrectCharsCount', () => {
		it('should return 0 for correct prefix', () => {
			expect(getIncorrectCharsCount('hel', 'hello')).toBe(0);
		});

		it('should return 0 for exact match', () => {
			expect(getIncorrectCharsCount('hello', 'hello')).toBe(0);
		});

		it('should count mismatches', () => {
			// target: "hello"
			// user:   "hexxo"
			// index 2: x vs l
			// index 3: x vs l
			expect(getIncorrectCharsCount('hexxo', 'hello')).toBe(2);
		});

		it('should count extra characters', () => {
			expect(getIncorrectCharsCount('hello!!!', 'hello')).toBe(3);
		});

		it('should count both mismatches and extras', () => {
			// target: "abc"
			// user:   "axcyy"
			// index 1: x vs b (mismatch)
			// index 3: y (extra)
			// index 4: y (extra)
			// Total: 3
			expect(getIncorrectCharsCount('axcyy', 'abc')).toBe(3);
		});

		it('should only check the active word', () => {
			expect(getIncorrectCharsCount('correct word ', 'correct word next')).toBe(
				0,
			);
			expect(
				getIncorrectCharsCount('correct word nxxtt', 'correct word next'),
			).toBe(2);
		});
	});

	describe('appendCharacter', () => {
		it('should allow characters when limit is not reached', () => {
			const target = 'hello';
			let typed = '';
			typed = appendCharacter(typed, 'h', target, 2);
			typed = appendCharacter(typed, 'e', target, 2);
			typed = appendCharacter(typed, 'x', target, 2); // 1 incorrect
			expect(typed).toBe('hex');
		});

		it('should block characters when limit is exceeded', () => {
			const target = 'hello';
			const typed = 'hexx'; // 2 incorrect
			// trying to add another 'x' (3rd incorrect) with limit 2
			const next = appendCharacter(typed, 'x', target, 2);
			expect(next).toBe('hexx');
		});

		it('should allow space even if limit is reached', () => {
			const target = 'hello world';
			const typed = 'hexxxxxx'; // 6 incorrect, limit is 6 by default
			const next = appendCharacter(typed, ' ', target, 6);
			expect(next).toBe('hexxxxxx ');
		});

		it('should use default limit of 6 if not specified', () => {
			const target = 'hello';
			const typed = 'hexxxxxx'; // 6 incorrect
			const next = appendCharacter(typed, 'x', target); // try 7th
			expect(next).toBe('hexxxxxx');
		});
	});
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
		it('should NOT lock (return -1) when incomplete word is skipped via space', () => {
			const target = 'hello world';
			// User types "hel " (incomplete)
			const typed = 'hel ';

			// Should NOT confirm because it's incomplete
			const result = checkWordCompletion(typed, target);
			expect(result).toBe(-1);
		});

		it('should NOT lock (return -1) when incorrect word is skipped via space', () => {
			const target = 'hello world';
			// User types "hexx " (incorrect)
			const typed = 'hexx ';

			// Should NOT confirm
			const result = checkWordCompletion(typed, target);
			expect(result).toBe(-1);
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

			expect(result).toBe(-1);
		});
	});

	describe('checkCompletion', () => {
		it('should return false when user has fewer words than target', () => {
			const target = 'one two three';
			const typed = 'one two';
			expect(checkCompletion(typed, target)).toBe(false);
		});

		it('should return false when user is on the last word but it is shorter than target', () => {
			const target = 'one two three';
			const typed = 'one two th'; // incomplete last word
			expect(checkCompletion(typed, target)).toBe(false);
		});

		it('should return true when user matches target exactly', () => {
			const target = 'one two three';
			const typed = 'one two three';
			expect(checkCompletion(typed, target)).toBe(true);
		});

		it('should return true when user finishes last word with extras', () => {
			const target = 'one two three';
			const typed = 'one two threeee'; // extras
			expect(checkCompletion(typed, target)).toBe(true);
		});

		it('should return true when user finishes last word and adds a space', () => {
			const target = 'one two three';
			const typed = 'one two three '; // trailing space (moves to next 'ghost' word)
			expect(checkCompletion(typed, target)).toBe(true);
		});

		it('should return true if user typed MORE words than target', () => {
			const target = 'one two';
			const typed = 'one two three';
			expect(checkCompletion(typed, target)).toBe(true);
		});

		it('should return true even if previous words were incorrect (logic only checks counts/last word length)', () => {
			// Note: This function only checks *length/completion* criteria, not correctness.
			const target = 'one two';
			const typed = 'xxx yyy'; // same word count, last word same length
			expect(checkCompletion(typed, target)).toBe(true);
		});
	});
});
