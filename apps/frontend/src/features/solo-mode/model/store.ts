import { RaceModeEnum } from '@qwertix/room-contracts';
import { create } from 'zustand';

export enum SoloStatusEnum {
	START,
	TYPING,
	RESULT,
}

export type Durations = 15 | 30 | 60 | 120;
export type WordCounts = 10 | 25 | 50 | 100;

interface SoloModeState {
	mode: RaceModeEnum;
	duration: Durations;
	wordCount: WordCounts;
	status: SoloStatusEnum;

	// Actions
	setMode: (mode: RaceModeEnum) => void;
	setDuration: (seconds: Durations) => void;
	setWordCount: (count: WordCounts) => void;
	setStatus: (status: SoloStatusEnum) => void;
	reset: () => void;
}

export const useSoloModeStore = create<SoloModeState>((set) => ({
	mode: RaceModeEnum.WORDS,
	duration: 30,
	wordCount: 25,
	status: SoloStatusEnum.START,

	setMode: (mode) => set({ mode, status: SoloStatusEnum.START }),
	setDuration: (duration: Durations) =>
		set({ duration, status: SoloStatusEnum.START }),
	setWordCount: (wordCount: WordCounts) =>
		set({ wordCount, status: SoloStatusEnum.START }),
	setStatus: (status) => set({ status }),
	reset: () => set({ status: SoloStatusEnum.START }),
}));
