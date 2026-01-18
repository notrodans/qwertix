import { Copy } from 'lucide-react';
import {
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Input,
} from '@/shared/ui';

interface LobbyInviteProps {
	shareUrl: string;
}

export function LobbyInvite({ shareUrl }: LobbyInviteProps) {
	return (
		<Card className="bg-card border-border">
			<CardHeader>
				<CardTitle>Invite Friends</CardTitle>
			</CardHeader>
			<CardContent className="flex gap-2">
				<Input
					readOnly
					value={shareUrl}
					className="bg-muted border-border text-foreground"
				/>
				<Button
					size="icon"
					variant="outline"
					onClick={() => navigator.clipboard.writeText(shareUrl)}
					className="border-border hover:bg-muted hover:text-foreground"
				>
					<Copy className="h-4 w-4" />
				</Button>
			</CardContent>
		</Card>
	);
}
