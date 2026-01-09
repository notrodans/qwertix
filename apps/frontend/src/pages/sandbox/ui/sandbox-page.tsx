import { reatomComponent } from '@reatom/react';
import { TypingBoard } from '@/widgets/typing-board';

const SandboxPage = reatomComponent(({ component }: { component: string }) => {
	return (
		<div className="container mx-auto p-8 flex flex-col items-center">
			<h1 className="text-3xl font-bold mb-8 text-zinc-500">
				Sandbox: {component}
			</h1>
			{component === 'typing-board' && <TypingBoard />}
		</div>
	);
});

const Component = SandboxPage;
export default Component;
