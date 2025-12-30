import { RaceModeEnum } from '@qwertix/room-contracts';
import { useSoloModeStore } from '../model/store';

export function SoloToolbar() {
	const { mode, duration, wordCount, setMode, setDuration, setWordCount } =
		useSoloModeStore();

	return (
		<div className="flex bg-zinc-900/50 p-2 rounded-lg gap-8 items-center text-sm font-bold text-zinc-500">
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
			<div className="flex gap-4 animate-in fade-in slide-in-from-left-2">
				{mode === RaceModeEnum.TIME
					? [15, 30, 60, 120].map((v) => (
							<button
								key={v}
								onClick={() => setDuration(v)}
								className={`hover:text-zinc-200 transition-colors ${duration === v ? 'text-yellow-400' : ''}`}
							>
								{v}
							</button>
						))
					: [10, 25, 50, 100].map((v) => (
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
}
