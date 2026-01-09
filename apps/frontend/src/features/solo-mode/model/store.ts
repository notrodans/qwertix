import { RaceModeEnum } from '@qwertix/room-contracts';
import { action, atom } from '@reatom/core';

export enum SoloStatusEnum {
	OFF,
	START,
	TYPING,
	IDLE,
	RESULT,
}

export type Durations = 15 | 30 | 60 | 120;
export type WordCounts = 10 | 25 | 50 | 100;

export const modeAtom = atom<RaceModeEnum>(RaceModeEnum.WORDS, 'solo.mode');
export const durationAtom = atom<Durations>(30, 'solo.duration');
export const wordCountAtom = atom<WordCounts>(25, 'solo.wordCount');
export const statusAtom = atom<SoloStatusEnum>(
	SoloStatusEnum.OFF,
	'solo.status',
);

export const setStatus = action((status: SoloStatusEnum) => {
	statusAtom.set(status);
}, 'solo.setStatus');
