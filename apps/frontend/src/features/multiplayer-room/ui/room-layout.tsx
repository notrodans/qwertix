import type { ReactNode } from 'react';

interface RoomLayoutProps {
	lobby?: ReactNode;
	board?: ReactNode;
	results?: ReactNode;
	error?: ReactNode;
	loading?: ReactNode;
}

export function RoomLayout({
	lobby,
	board,
	results,
	error,
	loading,
}: RoomLayoutProps) {
	return (
		<div className="w-full">
			{error}
			{loading}
			{lobby}
			{board}
			{results}
		</div>
	);
}
