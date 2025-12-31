interface LobbyHeaderProps {
	roomId: string;
	isHost: boolean;
}

export function LobbyHeader({ roomId, isHost }: LobbyHeaderProps) {
	return (
		<>
			<h1 className="text-3xl font-bold">Room: {roomId}</h1>
			{isHost && (
				<div className="bg-emerald-900/20 border border-emerald-500/50 p-4 rounded-lg w-full text-center text-emerald-400 font-bold animate-pulse">
					You are the Host
				</div>
			)}
		</>
	);
}
