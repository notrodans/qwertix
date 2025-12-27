interface TypingConfigSummaryProps {
	language?: string;
	mode?: string;
}

export function TypingConfigSummary({
	language = 'English',
	mode = 'words',
}: TypingConfigSummaryProps) {
	return (
		<div className="flex gap-4 text-[#646669] text-sm">
			<span>{language}</span>
			<span>•</span>
			<span>{mode}</span>
		</div>
	);
}
