interface TypingConfigSummaryProps {
	language?: string;
	mode?: string;
}

export function TypingConfigSummary({
	language = 'English',
	mode = 'words',
}: TypingConfigSummaryProps) {
	return (
		<div className="flex gap-4 text-muted-foreground text-sm">
			<span>{language}</span>
			<span>•</span>
			<span>{mode}</span>
		</div>
	);
}
