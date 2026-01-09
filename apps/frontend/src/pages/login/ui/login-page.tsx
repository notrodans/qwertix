import { bindField, reatomComponent } from '@reatom/react';
import { loginForm } from '../model/login-form';

const LoginPage = reatomComponent(() => {
	const { fields, submit } = loginForm;

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-zinc-200">
			<div className="w-full max-w-md p-8 space-y-6 bg-zinc-900 rounded-xl shadow-lg border border-zinc-800">
				<h1 className="text-2xl font-bold text-center text-emerald-400">
					Login to Qwertix
				</h1>
				{submit.error() && (
					<div className="text-red-500 text-center">
						{submit.error()?.message}
					</div>
				)}
				<form
					onSubmit={(e) => {
						e.preventDefault();
						loginForm.submit();
					}}
					className="space-y-4"
				>
					<div>
						<label className="block text-sm font-medium">Email</label>
						<input
							className="w-full px-4 py-2 mt-1 bg-zinc-800 border border-zinc-700 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
							{...bindField(fields.email)}
						/>
						{fields.email.validation().error && (
							<span className="text-xs text-red-500">
								{fields.email.validation().error}
							</span>
						)}
					</div>
					<div>
						<label className="block text-sm font-medium">Password</label>
						<input
							className="w-full px-4 py-2 mt-1 bg-zinc-800 border border-zinc-700 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
							{...bindField(fields.password)}
						/>
						{fields.password.validation().error && (
							<span className="text-xs text-red-500">
								{fields.password.validation().error}
							</span>
						)}
					</div>
					<button
						disabled={!submit.ready()}
						className="w-full py-2 font-bold text-zinc-950 bg-emerald-400 rounded-md hover:bg-emerald-300 transition-colors disabled:opacity-50"
					>
						{submit.ready() ? 'Login' : 'Logging in...'}
					</button>
				</form>
			</div>
		</div>
	);
});

const Component = LoginPage;
export default Component;
