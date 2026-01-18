import { reatomComponent } from '@reatom/react';
import { SetupForm, setupRoute } from '@/shared/model';

export const SetupPage = reatomComponent(() => {
	const data = setupRoute.loader.data();
	const ready = setupRoute.loader.ready();
	if (!ready || !data) return <div>Loading setup page...</div>;

	return (
		<div className="w-full max-w-xl flex items-center text-foreground">
			<SetupForm />
		</div>
	);
});

export default SetupPage;
