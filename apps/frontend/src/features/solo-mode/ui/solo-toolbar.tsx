import { RaceModeEnum } from '@qwertix/room-contracts';
import { reatomComponent } from '@reatom/react';
import { setDuration, setMode, setWordCount } from '../model/solo-model';
import type { Durations, WordCounts } from '../model/store';
import { durationAtom, modeAtom, wordCountAtom } from '../model/store';

export const SoloToolbar = reatomComponent(
	({ className }: { className?: string }) => {
		const mode = modeAtom();
		const duration = durationAtom();
		const wordCount = wordCountAtom();

		return (
			<div
				className={`flex bg-zinc-900/50 p-2 rounded-lg gap-8 items-center text-sm font-bold text-zinc-500 transition-opacity duration-300 ${className}`}
			>
				{/* Mode Selection */}
				<div className="flex gap-4 border-r border-zinc-800 pr-8">
					<button
						onClick={() => setMode(RaceModeEnum.TIME)}
						className={`hover:text-zinc-200 transition-colors flex items-center gap-2 ${mode === RaceModeEnum.TIME ? 'text-yellow-400' : ''}`}
					>
						<span className="text-xs">🕒</span> time
					</button>
					<button
						onClick={() => setMode(RaceModeEnum.WORDS)}
						className={`hover:text-zinc-200 transition-colors flex items-center gap-2 ${mode === RaceModeEnum.WORDS ? 'text-yellow-400' : ''}`}
					>
						<span className="text-xs">A</span> words
					</button>
				</div>

				{/* Sub-options Selection */}
				<div className="flex gap-4">
					{mode === RaceModeEnum.TIME
						? // TODO: Rewrite
							([15, 30, 60, 120] as unknown as Durations[]).map((v) => (
								<button
									key={v}
									onClick={() => setDuration(v)}
									className={`hover:text-zinc-200 transition-colors ${duration === v ? 'text-yellow-400' : ''}`}
								>
									{v}
								</button>
							))
						: // TODO: Rewrite
							([10, 25, 50, 100] as unknown as WordCounts[]).map((v) => (
								<button
									key={v}
									onClick={() => setWordCount(v)}
									className={`hover:text-zinc-200 transition-colors ${wordCount === v ? 'text-yellow-400' : ''}`}
								>
									{v}
								</button>
							))}
				</div>
			</div>
		);
	},
);
