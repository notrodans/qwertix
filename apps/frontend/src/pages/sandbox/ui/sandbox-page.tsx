import { useParams } from 'react-router-dom';
import { TypingBoard } from '@/widgets/typing-board/pub';

export function SandboxPage() {
	const { component } = useParams<{ component: string }>();

	return (
		<div className="min-h-screen bg-zinc-950 p-8 flex flex-col items-center justify-center font-mono">
			<div className="w-full max-w-4xl border border-dashed border-zinc-800 p-8 rounded-xl">
				<div className="text-zinc-500 text-xs uppercase tracking-widest mb-8 border-b border-zinc-900 pb-2">
					Sandbox: {component}
				</div>
				{component === 'typing-board' && <TypingBoard />}
				{!component && (
					<div className="text-zinc-400">Select a component to test</div>
				)}
			</div>
		</div>
	);
}
