import { RaceModeEnum } from '@qwertix/room-contracts';
import type { Participant, RoomConfig } from '@/entities/room';

interface LobbyProps {
	roomId: string;
	participants: Participant[];
	isHost: boolean;
	config: RoomConfig;
	onStart: () => void;
	onTransferHost: (targetId: string) => void;
	onUpdateSettings: (config: RoomConfig) => void;
}

export function Lobby({
	roomId,
	participants,
	isHost,
	config,
	onStart,
	onTransferHost,
	onUpdateSettings,
}: LobbyProps) {
	const shareUrl = `${window.location.origin}/room/${roomId}`;

	return (
		<div className="flex flex-col items-center justify-center p-8 space-y-6 w-full max-w-2xl mx-auto">
			<h1 className="text-3xl font-bold">Room: {roomId}</h1>

			{isHost && (
				<div className="bg-emerald-900/20 border border-emerald-500/50 p-4 rounded-lg w-full text-center text-emerald-400 font-bold animate-pulse">
					You are the Host
				</div>
			)}

			<div className="grid grid-cols-2 gap-8 w-full">
				<div className="space-y-6">
					<div className="bg-gray-800 p-4 rounded-lg">
						<p className="text-gray-400 text-sm mb-2">Invite friends:</p>
						<div className="flex gap-2">
							<input
								readOnly
								value={shareUrl}
								className="bg-gray-700 text-white px-3 py-1 rounded flex-1 text-xs"
							/>
							<button
								onClick={() => navigator.clipboard.writeText(shareUrl)}
								className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-white text-xs"
							>
								Copy
							</button>
						</div>
					</div>

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
				</div>

				<div className="bg-gray-800 p-4 rounded-lg">
					<h2 className="text-xl mb-4 font-bold">
						Players ({participants.length})
					</h2>
					<ul className="space-y-2">
						{participants.map((p) => (
							<li
								key={p.socketId}
								className="bg-gray-700/50 p-3 rounded flex justify-between items-center"
							>
								<div className="flex flex-col">
									<span className="font-bold">
										{p.username} {p.isHost ? '👑' : ''}
									</span>
								</div>
								{isHost && !p.isHost && (
									<button
										onClick={() => onTransferHost(p.socketId)}
										className="text-[10px] bg-gray-600 hover:bg-gray-500 px-2 py-1 rounded uppercase tracking-tighter"
									>
										Make Host
									</button>
								)}
							</li>
						))}
					</ul>
				</div>
			</div>

			{isHost ? (
				<button
					onClick={onStart}
					className="bg-green-600 hover:bg-green-500 px-12 py-4 rounded-xl text-2xl font-black text-white shadow-lg shadow-green-900/20 transition-all hover:scale-105 active:scale-95"
				>
					START RACE
				</button>
			) : (
				<div className="text-gray-500 font-bold italic animate-pulse">
					Waiting for host to start...
				</div>
			)}
		</div>
	);
}
