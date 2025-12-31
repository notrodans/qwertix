import { RaceModeEnum } from '@qwertix/room-contracts';
import type { RoomConfig } from '@/entities/room';

interface LobbySettingsProps {
	config: RoomConfig;
	isHost: boolean;
	onUpdateSettings: (config: RoomConfig) => void;
}

export function LobbySettings({
	config,
	isHost,
	onUpdateSettings,
}: LobbySettingsProps) {
	return (
		<div className="bg-gray-800 p-4 rounded-lg">
			<h2 className="text-xl mb-4 font-bold">Room Settings</h2>

			<div className="space-y-6">
				<div>
					<label className="block text-xs text-gray-500 uppercase mb-2">
						Mode
					</label>

					<div className="flex gap-2">
						{['WORDS', 'TIME'].map((m) => (
							<button
								key={m}
								disabled={!isHost}
								onClick={() => {
									const mode =
										m === 'TIME' ? RaceModeEnum.TIME : RaceModeEnum.WORDS;
									onUpdateSettings(
										mode === RaceModeEnum.TIME
											? {
													mode: RaceModeEnum.TIME,
													duration: 30,
												}
											: {
													mode: RaceModeEnum.WORDS,
													wordCount: 30,
												},
									);
								}}
								className={`px-4 py-2 rounded text-sm font-bold transition-all ${
									(config.mode === RaceModeEnum.TIME && m === 'TIME') ||
									(config.mode === RaceModeEnum.WORDS && m === 'WORDS')
										? 'bg-yellow-500 text-black shadow-lg shadow-yellow-900/20'
										: 'bg-gray-700 text-gray-400 hover:bg-gray-600'
								}`}
							>
								{m}
							</button>
						))}
					</div>
				</div>

				{config.mode === RaceModeEnum.WORDS && (
					<div className="animate-in fade-in slide-in-from-top-2">
						<label className="block text-xs text-gray-500 uppercase mb-2">
							Word Count
						</label>

						<div className="flex gap-2">
							{[10, 25, 50, 100].map((count) => (
								<button
									key={count}
									disabled={!isHost}
									onClick={() =>
										onUpdateSettings({
											mode: RaceModeEnum.WORDS,
											wordCount: count,
										})
									}
									className={`w-10 h-10 rounded-full text-xs font-bold transition-all ${
										config.mode === RaceModeEnum.WORDS &&
										config.wordCount === count
											? 'bg-emerald-500 text-black'
											: 'bg-gray-700 text-gray-400 hover:bg-gray-600'
									}`}
								>
									{count}
								</button>
							))}
						</div>
					</div>
				)}

				{config.mode === RaceModeEnum.TIME && (
					<div className="animate-in fade-in slide-in-from-top-2">
						<label className="block text-xs text-gray-500 uppercase mb-2">
							Time Limit (seconds)
						</label>

						<div className="flex gap-2">
							{[15, 30, 60, 120].map((seconds) => (
								<button
									key={seconds}
									disabled={!isHost}
									onClick={() =>
										onUpdateSettings({
											mode: RaceModeEnum.TIME,

											duration: seconds,
										})
									}
									className={`w-10 h-10 rounded-full text-xs font-bold transition-all ${
										config.mode === RaceModeEnum.TIME &&
										config.duration === seconds
											? 'bg-emerald-500 text-black'
											: 'bg-gray-700 text-gray-400 hover:bg-gray-600'
									}`}
								>
									{seconds}s
								</button>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
