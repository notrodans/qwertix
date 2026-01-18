import { RaceModeEnum } from '@qwertix/room-contracts';
import { reatomComponent } from '@reatom/react';
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui';
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
				className={`flex bg-muted/30 border border-border p-1.5 rounded-xl gap-6 items-center text-sm font-medium text-muted-foreground transition-opacity duration-300 ${className}`}
			>
				{/* Mode Selection */}
				<div className="border-r border-border pr-6">
					<ToggleGroup
						type="single"
						variant="outline"
						value={mode === RaceModeEnum.TIME ? 'time' : 'words'}
						onValueChange={(val) => {
							if (val)
								setMode(
									val === 'time' ? RaceModeEnum.TIME : RaceModeEnum.WORDS,
								);
						}}
					>
						<ToggleGroupItem
							value="time"
							aria-label="Time Mode"
							className="rounded-lg border-none shadow-none"
						>
							<span className="mr-2 text-xs">🕒</span> time
						</ToggleGroupItem>
						<ToggleGroupItem
							value="words"
							aria-label="Words Mode"
							className="rounded-lg border-none shadow-none"
						>
							<span className="mr-2 text-xs">A</span> words
						</ToggleGroupItem>
					</ToggleGroup>
				</div>

				{/* Sub-options Selection */}
				<div>
					{mode === RaceModeEnum.TIME ? (
						<ToggleGroup
							type="single"
							variant="outline"
							value={String(duration)}
							onValueChange={(val) => {
								if (val) setDuration(Number(val) as Durations);
							}}
						>
							{[15, 30, 60, 120].map((v) => (
								<ToggleGroupItem
									key={v}
									value={String(v)}
									className="rounded-lg border-none shadow-none px-4"
								>
									{v}
								</ToggleGroupItem>
							))}
						</ToggleGroup>
					) : (
						<ToggleGroup
							type="single"
							variant="outline"
							value={String(wordCount)}
							onValueChange={(val) => {
								if (val) setWordCount(Number(val) as WordCounts);
							}}
						>
							{[10, 25, 50, 100].map((v) => (
								<ToggleGroupItem
									key={v}
									value={String(v)}
									className="rounded-lg border-none shadow-none px-4"
								>
									{v}
								</ToggleGroupItem>
							))}
						</ToggleGroup>
					)}
				</div>
			</div>
		);
	},
);
