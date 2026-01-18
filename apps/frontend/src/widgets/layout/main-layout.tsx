import { reatomComponent } from '@reatom/react';
import type { ReactNode } from 'react';

export const MainLayout = reatomComponent(
	({ children, header }: { children: ReactNode; header?: ReactNode }) => {
		return (
			<div className="dark min-h-screen bg-background font-sans antialiased selection:bg-primary/30">
				{header}
				<main className="container max-w-5xl mx-auto py-20 px-6 min-h-[calc(100vh-3.5rem)] flex flex-col items-center">
					{children}
				</main>
			</div>
		);
	},
);
