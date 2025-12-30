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
		<div className="container mx-auto px-4 py-8">
			{error}
			{loading}
			{lobby}
			{board}
			{results}
		</div>
	);
}
