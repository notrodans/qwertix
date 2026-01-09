import { reatomComponent } from '@reatom/react';
import { SetupForm } from '@/features/initial-setup';

const SetupPage = reatomComponent(() => {
	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-50">
			<SetupForm />
		</div>
	);
});

const Component = SetupPage;
export default Component;
