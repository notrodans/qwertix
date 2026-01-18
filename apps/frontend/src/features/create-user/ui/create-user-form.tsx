import { UserRoleEnum } from '@qwertix/room-contracts';
import { bindField, reatomComponent } from '@reatom/react';
import {
	Alert,
	AlertDescription,
	AlertTitle,
	Button,
	Input,
	Label,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/shared/ui';
import { createUserForm } from '../model/create-user-form';

export const CreateUserForm = reatomComponent(() => {
	const { fields, submit, submitted, reset } = createUserForm;

	if (submitted()) {
		return (
			<Alert className="border-primary bg-primary/20 text-primary-foreground">
				<AlertTitle>Success</AlertTitle>
				<AlertDescription>
					User created successfully!
					<div className="mt-3">
						<Button
							onClick={() => reset()}
							className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
						>
							Create Another
						</Button>
					</div>
				</AlertDescription>
			</Alert>
		);
	}

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				submit();
			}}
			className="space-y-4"
		>
			{submit.error() && (
				<Alert variant="destructive">
					<AlertTitle>Error</AlertTitle>
					<AlertDescription>{submit.error()?.message}</AlertDescription>
				</Alert>
			)}

			<div className="space-y-2">
				<Label htmlFor="create-username">Username</Label>
				<Input
					id="create-username"
					type="text"
					{...bindField(fields.username)}
				/>
				{fields.username.validation().error && (
					<span className="text-xs text-destructive">
						{fields.username.validation().error}
					</span>
				)}
			</div>

			<div className="space-y-2">
				<Label htmlFor="create-email">Email</Label>
				<Input id="create-email" type="email" {...bindField(fields.email)} />
				{fields.email.validation().error && (
					<span className="text-xs text-destructive">
						{fields.email.validation().error}
					</span>
				)}
			</div>

			<div className="space-y-2">
				<Label htmlFor="create-password">Password</Label>
				<Input
					id="create-password"
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
				<Label htmlFor="create-role">Role</Label>
				<Select
					value={fields.role.value()}
					// @ts-expect-error - reatom types issue
					onValueChange={(val) => fields.role.change(val)}
				>
					<SelectTrigger id="create-role">
						<SelectValue placeholder="Select a role" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value={UserRoleEnum.USER}>User</SelectItem>
						<SelectItem value={UserRoleEnum.ADMIN}>Admin</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<Button
				type="submit"
				disabled={!submit.ready()}
				className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
			>
				{!submit.ready() ? 'Creating...' : 'Create User'}
			</Button>
		</form>
	);
});
