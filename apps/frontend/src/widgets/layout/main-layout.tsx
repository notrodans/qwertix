import { reatomComponent } from '@reatom/react';
import type { ReactNode } from 'react';

export const MainLayout = reatomComponent(
	({ children, header }: { children: ReactNode; header?: ReactNode }) => {
		return (
			<div className="dark h-screen bg-background font-sans antialiased selection:bg-primary/30 flex flex-col overflow-hidden">
				{header}
				<main className="flex-1 container max-w-5xl mx-auto py-8 px-6 flex flex-col items-center justify-center overflow-y-auto">
					{children}
				</main>
			</div>
		);
	},
);
