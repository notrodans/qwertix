import { reatomRoute } from '@reatom/core';
import { Fragment, lazy, Suspense } from 'react';
import { z } from 'zod';
import { loginFormFactory } from '@/features/auth';
import { setupFormFactory, setupRequired } from '../initial-setup';

export const mainRouter = reatomRoute({
	render({ outlet }) {
		if (setupRequired()) {
			setupRoute.go();
		}

		return (
			<Suspense fallback={<Fragment />}>
				{outlet().map((child) => child)}
			</Suspense>
		);
	},
});

const Home = lazy(() => import('@/pages/home/ui/home-page'));
export const homeRoute = mainRouter.reatomRoute({
	path: '',
	render: () => {
		if (!homeRoute.exact()) return <Fragment />;
		return <Home />;
	},
});

const Login = lazy(() => import('@/pages/login/ui/login-page'));
export const loginRoute = mainRouter.reatomRoute({
	path: 'login',
	async loader() {
		const loginForm = loginFormFactory();
		return { loginForm };
	},
	render: () => {
		return <Login />;
	},
});

const Profile = lazy(() => import('@/pages/profile/ui/profile-page'));
export const profileRoute = mainRouter.reatomRoute({
	path: 'profile',
	render: () => {
		return <Profile />;
	},
});

const Result = lazy(() => import('@/pages/result/ui/result-page'));
export const resultRoute = mainRouter.reatomRoute({
	path: 'result/:resultId',
	params: z.object({ resultId: z.string() }),
	render() {
		return <Result />;
	},
});

const Room = lazy(() => import('@/pages/room/ui/room-page'));
export const roomRoute = mainRouter.reatomRoute({
	path: 'room/:roomId',
	params: z.object({ roomId: z.string() }),
	render: () => {
		return <Room roomId={roomRoute()?.roomId || ''} />;
	},
});

const Sandbox = lazy(() => import('@/pages/sandbox/ui/sandbox-page'));
export const sandboxRoute = mainRouter.reatomRoute({
	path: 'sandbox/:component',
	params: z.object({ component: z.string() }),
	render: () => {
		return <Sandbox component={sandboxRoute()?.component || ''} />;
	},
});

const Admin = lazy(() => import('@/pages/admin/ui/admin-page'));
export const adminRoute = mainRouter.reatomRoute({
	path: 'admin',
	render: () => {
		return <Admin />;
	},
});

const Setup = lazy(() => import('@/pages/setup/ui/setup-page'));
export const setupRoute = mainRouter.reatomRoute({
	path: 'setup',
	async loader() {
		const setupForm = setupFormFactory();
		return { setupForm };
	},
	render: () => {
		return <Setup />;
	},
});
