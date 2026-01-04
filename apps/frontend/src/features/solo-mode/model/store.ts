import { RaceModeEnum } from '@qwertix/room-contracts';
import { create } from 'zustand';

export enum SoloStatusEnum {
	START,
	TYPING,
	RESULT,
}

interface SoloModeState {
	mode: RaceModeEnum;
	duration: number; // 15, 30, 60, 120
	wordCount: number; // 10, 25, 50, 100
	status: SoloStatusEnum;

	// Actions
	setMode: (mode: RaceModeEnum) => void;
	setDuration: (seconds: number) => void;
	setWordCount: (count: number) => void;
	setStatus: (status: SoloStatusEnum) => void;
	reset: () => void;
}

export const useSoloModeStore = create<SoloModeState>((set) => ({
	mode: RaceModeEnum.WORDS,
	duration: 30,
	wordCount: 25,
	status: SoloStatusEnum.START,

	setMode: (mode) => set({ mode, status: SoloStatusEnum.START }),
	setDuration: (duration) => set({ duration, status: SoloStatusEnum.START }),
	setWordCount: (wordCount) => set({ wordCount, status: SoloStatusEnum.START }),
	setStatus: (status) => set({ status }),
	reset: () => set({ status: SoloStatusEnum.START }),
}));
