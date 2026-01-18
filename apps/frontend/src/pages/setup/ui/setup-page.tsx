import { reatomComponent } from '@reatom/react';
import { SetupForm, setupRoute } from '@/shared/model';

export const SetupPage = reatomComponent(() => {
	const data = setupRoute.loader.data();
	const ready = setupRoute.loader.ready();
	if (!ready || !data) return <div>Loading setup page...</div>;

	return (
		<div className="flex items-center justify-center min-h-screen bg-background text-foreground">
			<SetupForm />
		</div>
	);
});

export default SetupPage;
