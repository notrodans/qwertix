import { describe, expect, it } from 'vitest';
import { checkWordCompletion } from './typing-engine';

describe('typing-engine', () => {
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
