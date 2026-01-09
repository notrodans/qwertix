import { UserRoleEnum } from '@qwertix/room-contracts';
import { bindField, reatomComponent } from '@reatom/react';
import { createUserForm } from '../model/create-user-form';

export const CreateUserForm = reatomComponent(() => {
	const { fields, submit, submitted, reset } = createUserForm;

	if (submitted()) {
		return (
			<div className="p-4 bg-emerald-900/50 border border-emerald-500 rounded text-emerald-200">
				<p>User created successfully!</p>
				<button
					onClick={() => reset()}
					className="mt-3 px-4 py-2 bg-emerald-500 text-zinc-950 font-bold rounded hover:bg-emerald-400"
				>
					Create Another
				</button>
			</div>
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
				<div className="p-3 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm">
					{submit.error()?.message}
				</div>
			)}

			<div>
				<label className="block text-sm font-medium text-zinc-400">
					Username
				</label>
				<input
					type="text"
					className="w-full px-3 py-2 mt-1 bg-zinc-800 border border-zinc-700 rounded focus:ring-2 focus:ring-emerald-500 outline-none text-zinc-200"
					{...bindField(fields.username)}
				/>
				{fields.username.validation().error && (
					<span className="text-xs text-red-500">
						{fields.username.validation().error}
					</span>
				)}
			</div>

			<div>
				<label className="block text-sm font-medium text-zinc-400">Email</label>
				<input
					type="email"
					className="w-full px-3 py-2 mt-1 bg-zinc-800 border border-zinc-700 rounded focus:ring-2 focus:ring-emerald-500 outline-none text-zinc-200"
					{...bindField(fields.email)}
				/>
				{fields.email.validation().error && (
					<span className="text-xs text-red-500">
						{fields.email.validation().error}
					</span>
				)}
			</div>

			<div>
				<label className="block text-sm font-medium text-zinc-400">
					Password
				</label>
				<input
					type="password"
					className="w-full px-3 py-2 mt-1 bg-zinc-800 border border-zinc-700 rounded focus:ring-2 focus:ring-emerald-500 outline-none text-zinc-200"
					{...bindField(fields.password)}
				/>
				{fields.password.validation().error && (
					<span className="text-xs text-red-500">
						{fields.password.validation().error}
					</span>
				)}
			</div>

			<div>
				<label className="block text-sm font-medium text-zinc-400">Role</label>
				<select
					className="w-full px-3 py-2 mt-1 bg-zinc-800 border border-zinc-700 rounded focus:ring-2 focus:ring-emerald-500 outline-none text-zinc-200"
					value={fields.role.value()}
					onChange={(e) =>
						// @ts-expect-error enum inference issue
						fields.role.change(e.target.value as UserRoleEnum)
					}
					onFocus={() => fields.role.focus.in()}
					onBlur={() => fields.role.focus.out()}
				>
					<option value={UserRoleEnum.USER}>User</option>
					<option value={UserRoleEnum.ADMIN}>Admin</option>
				</select>
			</div>

			<button
				type="submit"
				disabled={!submit.ready()}
				className="w-full py-2 font-bold text-zinc-950 bg-emerald-400 rounded hover:bg-emerald-300 transition-colors disabled:opacity-50"
			>
				{!submit.ready() ? 'Creating...' : 'Create User'}
			</button>
		</form>
	);
});
