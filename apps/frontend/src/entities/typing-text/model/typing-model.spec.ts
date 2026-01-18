import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
	cursorIndexAtom,
	handleKeydown,
	isTypingEnabledAtom,
	replayDataAtom,
	resetTyping,
	startTimeAtom,
	targetTextAtom,
	userTypedAtom,
	validLengthAtom,
} from './typing-model';

describe('typing-model', () => {
	beforeEach(() => {
		resetTyping();
		targetTextAtom.set('hello world');
		isTypingEnabledAtom.set(true);
		vi.useFakeTimers();
		vi.setSystemTime(new Date(2024, 0, 1, 0, 0, 0));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('should reset typing state', () => {
		userTypedAtom.set('abc');
		cursorIndexAtom.set(3);
		replayDataAtom.set([{ key: 'a', timestamp: 100 }]);
		startTimeAtom.set(123);
		validLengthAtom.set(1);

		resetTyping();

		expect(userTypedAtom()).toBe('');
		expect(cursorIndexAtom()).toBe(0);
		expect(replayDataAtom()).toEqual([]);
		expect(startTimeAtom()).toBeNull();
		expect(validLengthAtom()).toBe(0);
	});

	it('should start timer on first character', () => {
		const event = new KeyboardEvent('keydown', { key: 'h' });
		handleKeydown(event);

		expect(startTimeAtom()).toBe(Date.now());
		expect(userTypedAtom()).toBe('h');
	});

	it('should append characters and update cursor index', () => {
		handleKeydown(new KeyboardEvent('keydown', { key: 'h' }));
		handleKeydown(new KeyboardEvent('keydown', { key: 'e' }));

		expect(userTypedAtom()).toBe('he');
		expect(cursorIndexAtom()).toBe(2);
	});

	it('should record replay data with correct relative timestamps', () => {
		handleKeydown(new KeyboardEvent('keydown', { key: 'h' }));

		vi.advanceTimersByTime(100);
		handleKeydown(new KeyboardEvent('keydown', { key: 'e' }));

		const replay = replayDataAtom();
		expect(replay).toHaveLength(2);
		expect(replay[0]).toMatchObject({ key: 'h', timestamp: 0 });
		expect(replay[1]).toMatchObject({ key: 'e', timestamp: 100 });
	});

	it('should handle backspace', () => {
		handleKeydown(new KeyboardEvent('keydown', { key: 'h' }));
		handleKeydown(new KeyboardEvent('keydown', { key: 'e' }));
		handleKeydown(new KeyboardEvent('keydown', { key: 'Backspace' }));

		expect(userTypedAtom()).toBe('h');
		expect(cursorIndexAtom()).toBe(1);
	});

	it('should NOT allow backspace to delete confirmed text', () => {
		targetTextAtom.set('hello world');

		// Type 'hello ' correctly
		'hello '.split('').forEach((char) => {
			handleKeydown(new KeyboardEvent('keydown', { key: char }));
		});

		expect(validLengthAtom()).toBe(6);

		// Try to backspace into confirmed word
		handleKeydown(new KeyboardEvent('keydown', { key: 'Backspace' }));

		expect(userTypedAtom()).toBe('hello ');
		expect(cursorIndexAtom()).toBe(6);
	});

	it('should handle word completion and update validLength', () => {
		targetTextAtom.set('hello world');

		// Type 'hello '
		'hello '.split('').forEach((char) => {
			handleKeydown(new KeyboardEvent('keydown', { key: char }));
		});

		expect(userTypedAtom()).toBe('hello ');
		expect(validLengthAtom()).toBe(6); // 'hello ' length
	});

	it('should NOT update validLength if word is incorrect', () => {
		targetTextAtom.set('hello world');

		// Type 'hellp ' (mistake at the end)
		'hellp '.split('').forEach((char) => {
			handleKeydown(new KeyboardEvent('keydown', { key: char }));
		});

		expect(userTypedAtom()).toBe('hellp ');
		expect(validLengthAtom()).toBe(0);
	});

	it('should prevent default on Space and Backspace', () => {
		const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
		const backspaceEvent = new KeyboardEvent('keydown', { key: 'Backspace' });

		vi.spyOn(spaceEvent, 'preventDefault');
		vi.spyOn(backspaceEvent, 'preventDefault');

		handleKeydown(spaceEvent);
		handleKeydown(backspaceEvent);

		expect(spaceEvent.preventDefault).toHaveBeenCalled();
		expect(backspaceEvent.preventDefault).toHaveBeenCalled();
	});

	it('should ignore keys if typing is disabled', () => {
		isTypingEnabledAtom.set(false);
		handleKeydown(new KeyboardEvent('keydown', { key: 'h' }));

		expect(userTypedAtom()).toBe('');
	});

	it('should ignore Alt key', () => {
		handleKeydown(new KeyboardEvent('keydown', { key: 'h', altKey: true }));
		expect(userTypedAtom()).toBe('');
	});

	it('should ignore Ctrl+Key (except Backspace)', () => {
		handleKeydown(new KeyboardEvent('keydown', { key: 'c', ctrlKey: true }));
		expect(userTypedAtom()).toBe('');
	});

	it('should handle Ctrl+Backspace', () => {
		handleKeydown(new KeyboardEvent('keydown', { key: 'h' }));
		handleKeydown(new KeyboardEvent('keydown', { key: 'e' }));
		handleKeydown(new KeyboardEvent('keydown', { key: 'l' }));

		handleKeydown(
			new KeyboardEvent('keydown', { key: 'Backspace', ctrlKey: true }),
		);

		expect(userTypedAtom()).toBe('');
	});

	it('should record ctrlKey in replay data for Backspace', () => {
		handleKeydown(new KeyboardEvent('keydown', { key: 'h' }));
		handleKeydown(
			new KeyboardEvent('keydown', { key: 'Backspace', ctrlKey: true }),
		);

		const replay = replayDataAtom();
		expect(replay[1]).toMatchObject({
			key: 'Backspace',
			ctrlKey: true,
		});
	});

	it('should record confirmedIndex in replay data', () => {
		targetTextAtom.set('a b');
		handleKeydown(new KeyboardEvent('keydown', { key: 'a' }));
		handleKeydown(new KeyboardEvent('keydown', { key: ' ' }));

		const replay = replayDataAtom();
		expect(replay[1]).toMatchObject({
			key: ' ',
			confirmedIndex: 2, // 'a ' is confirmed
		});
	});
});
