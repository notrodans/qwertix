import { RefreshIcon } from '@/shared/ui/icon/refresh-icon';

interface RestartButtonProps {
	onReset: () => void;
	className?: string;
}

export function RestartButton({ onReset, className }: RestartButtonProps) {
	return (
		<button
			type="button"
			onClick={onReset}
			data-testid="restart-button"
			className={`text-muted-foreground hover:text-foreground transition-colors p-4 rounded cursor-pointer ${className}`}
			aria-label="Restart Test"
		>
			<RefreshIcon className="w-6 h-6" />
		</button>
	);
}
