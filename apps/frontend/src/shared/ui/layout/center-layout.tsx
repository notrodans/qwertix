import type { ReactNode } from 'react';

interface CenterLayoutProps {
	children: ReactNode;
}

export function CenterLayout({ children }: CenterLayoutProps) {
	return (
		<main className="flex min-h-screen w-full flex-col items-center justify-center p-8">
			<div className="w-full max-w-250 flex flex-col items-center">
				{children}
			</div>
		</main>
	);
}
