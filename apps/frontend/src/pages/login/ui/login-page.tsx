import { bindField, reatomComponent } from '@reatom/react';
import { loginRoute } from '@/shared/model';
import {
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Input,
	Label,
} from '@/shared/ui';

export const LoginPage = reatomComponent(() => {
	const data = loginRoute.loader.data();
	const ready = loginRoute.loader.ready();
	if (!ready || !data) return <div>Loading...</div>;

	const { submit, fields } = data.loginForm;

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle className="text-2xl font-bold text-center text-primary">
						Login to Qwertix
					</CardTitle>
				</CardHeader>
				<CardContent>
					{submit.error() && (
						<div className="text-red-500 text-center mb-4 text-sm bg-red-950/20 p-2 rounded">
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
							<Label htmlFor="email">Email</Label>
							<Input id="email" type="email" {...bindField(fields.email)} />
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								type="password"
								{...bindField(fields.password)}
							/>
						</div>
						<Button type="submit" disabled={!submit.ready()} className="w-full">
							{submit.ready() ? 'Login' : 'Logging in...'}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
});

export default LoginPage;
