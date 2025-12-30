import type { ReactNode } from 'react';

export function MainLayout({
	children,
	header,
}: {
	children: ReactNode;
	header?: ReactNode;
}) {
	return (
		<div className="min-h-screen bg-zinc-950 text-zinc-200 font-mono">
			{header}
			<main className="flex flex-col items-center justify-center p-8 min-h-[calc(100vh-80px)]">
				<div className="w-full max-w-5xl flex flex-col items-center gap-8">
					{children}
				</div>
			</main>
		</div>
	);
}
