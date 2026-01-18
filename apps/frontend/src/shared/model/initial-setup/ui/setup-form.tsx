import { bindField, reatomComponent } from '@reatom/react';
import { setupRoute } from '@/shared/model';
import {
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Input,
	Label,
} from '@/shared/ui';

export const SetupForm = reatomComponent(() => {
	const data = setupRoute.loader.data();
	const ready = setupRoute.loader.ready();
	if (!ready || !data) return <div>Loading setup page...</div>;

	const { submit, fields } = data.setupForm;

	return (
		<Card className="w-full">
			<CardHeader className="text-center">
				<CardTitle className="text-2xl">Welcome to Qwertix</CardTitle>
				<CardDescription>
					Create the administrator account to get started.
				</CardDescription>
			</CardHeader>
			<CardContent>
				{submit.error() && (
					<div className="p-3 mb-4 text-sm text-destructive bg-destructive/10 rounded-md">
						{submit.error()?.message}
					</div>
				)}
				<form
					onSubmit={(e) => {
						e.preventDefault();
						submit();
					}}
					className="space-y-4"
				>
					<div className="space-y-2">
						<Label htmlFor="username">Username</Label>
						<Input id="username" type="text" {...bindField(fields.username)} />
						{fields.username.validation().error && (
							<span className="text-xs text-destructive">
								{fields.username.validation().error}
							</span>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input id="email" type="email" {...bindField(fields.email)} />
						{fields.email.validation().error && (
							<span className="text-xs text-destructive">
								{fields.email.validation().error}
							</span>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="password">Password</Label>
						<Input
							id="password"
							type="password"
							{...bindField(fields.password)}
						/>
						{fields.password.validation().error && (
							<span className="text-xs text-destructive">
								{fields.password.validation().error}
							</span>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="confirmPassword">Confirm Password</Label>
						<Input
							id="confirmPassword"
							type="password"
							{...bindField(fields.confirmPassword)}
						/>
						{fields.confirmPassword.validation().error && (
							<span className="text-xs text-destructive">
								{fields.confirmPassword.validation().error}
							</span>
						)}
					</div>

					<Button type="submit" disabled={!submit.ready()} className="w-full">
						{!submit.ready() ? 'Creating...' : 'Create Administrator'}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
});
