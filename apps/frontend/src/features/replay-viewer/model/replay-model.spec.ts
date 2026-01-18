import { describe, expect, it } from 'vitest';
import { createReplayModel } from './replay-model';

const mockReplay = {
	targetText: 'hello world',
	data: [
		{ key: 'h', timestamp: 100 },
		{ key: 'e', timestamp: 200 },
		{ key: 'l', timestamp: 300 },
		{ key: 'l', timestamp: 400 },
		{ key: 'o', timestamp: 500 },
	],
	hash: 'hash',
};

describe('replay-model', () => {
	it('should initialize with correct data', () => {
		const model = createReplayModel(mockReplay);

		expect(model.durationAtom()).toBe(1000); // Min duration 1000
		// At progress 0, time is 0. Since first event is at 100, text must be empty.
		expect(model.typedTextAtom()).toBe('');
		expect(model.progressAtom()).toBe(0);
	});

	it('should update typedText based on progress', () => {
		const model = createReplayModel(mockReplay);

		// Duration is 1000ms.
		// progress 0.25 -> 250ms -> events at 100, 200 are included.
		model.progressAtom.set(0.25);

		expect(model.typedTextAtom()).toBe('he');
	});

	it('should toggle play state', () => {
		const model = createReplayModel(mockReplay);

		model.togglePlay();
		expect(model.isPlayingAtom()).toBe(true);

		model.togglePlay();
		expect(model.isPlayingAtom()).toBe(false);
	});

	it('should reset progress when playing from end', () => {
		const model = createReplayModel(mockReplay);
		model.progressAtom.set(1);

		model.togglePlay();
		expect(model.progressAtom()).toBe(0);
		expect(model.isPlayingAtom()).toBe(true);
	});

	it('should stop playing on manual progress set', () => {
		const model = createReplayModel(mockReplay);
		model.togglePlay();

		expect(model.isPlayingAtom()).toBe(true);

		model.setProgressManual(0.5);

		expect(model.isPlayingAtom()).toBe(false);
		expect(model.progressAtom()).toBe(0.5);
	});
});
