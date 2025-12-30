import type { Participant } from '@/entities/room';

interface LobbyProps {
	roomId: string;
	participants: Participant[];
	isHost: boolean;
	onStart: () => void;
}

export function Lobby({ roomId, participants, isHost, onStart }: LobbyProps) {
	const shareUrl = `${window.location.origin}/room/${roomId}`;

	return (
		<div className="flex flex-col items-center justify-center p-8 space-y-6">
			<h1 className="text-3xl font-bold">Room: {roomId}</h1>
			<div className="bg-gray-800 p-4 rounded-lg">
				<p className="text-gray-400 text-sm">Invite friends:</p>
				<div className="flex gap-2">
					<input
						readOnly
						value={shareUrl}
						className="bg-gray-700 text-white px-3 py-1 rounded w-64"
					/>
					<button
						onClick={() => navigator.clipboard.writeText(shareUrl)}
						className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-white"
					>
						Copy
					</button>
				</div>
			</div>

			<div className="w-full max-w-md">
				<h2 className="text-xl mb-4">Players ({participants.length})</h2>
				<ul className="space-y-2">
					{participants.map((p) => (
						<li
							key={p.socketId}
							className="bg-gray-700 p-3 rounded flex justify-between"
						>
							<span>
								{p.username} {p.isHost ? '(Host)' : ''}
							</span>
							<span
								className={
									p.progress === 100 ? 'text-green-400' : 'text-gray-400'
								}
							>
								{p.rank ? `#${p.rank}` : 'Ready'}
							</span>
						</li>
					))}
				</ul>
			</div>

			{isHost ? (
				<button
					onClick={onStart}
					className="bg-green-600 hover:bg-green-500 px-8 py-3 rounded-lg text-xl font-bold text-white transition-colors"
				>
					Start Race
				</button>
			) : (
				<div className="text-gray-400 animate-pulse">
					Waiting for host to start...
				</div>
			)}
		</div>
	);
}
