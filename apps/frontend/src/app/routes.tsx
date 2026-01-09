import { reatomRoute } from '@reatom/core';
import { Fragment, lazy, Suspense } from 'react';
import { z } from 'zod';
import { Header } from '@/widgets/header';
import { MainLayout } from '@/widgets/layout';

export const mainRouter = reatomRoute({
	render({ outlet }) {
		return (
			<MainLayout header={<Header />}>
				{outlet().map((child) => child)}
			</MainLayout>
		);
	},
});

const Home = lazy(() => import('@/pages/home/ui/home-page'));
export const homeRoute = mainRouter.reatomRoute({
	path: '',
	render: () => {
		if (!homeRoute.exact()) return <Fragment />;
		return (
			<Suspense fallback={<div>Loading...</div>}>
				<Home />
			</Suspense>
		);
	},
});

const Login = lazy(() => import('@/pages/login/ui/login-page'));
export const loginRoute = mainRouter.reatomRoute({
	path: 'login',
	render: () => {
		return (
			<Suspense fallback={<div>Loading...</div>}>
				<Login />
			</Suspense>
		);
	},
});

const Profile = lazy(() => import('@/pages/profile/ui/profile-page'));
export const profileRoute = mainRouter.reatomRoute({
	path: 'profile',
	render: () => {
		return (
			<Suspense fallback={<div>Loading...</div>}>
				<Profile />
			</Suspense>
		);
	},
});

const Result = lazy(() => import('@/pages/result/ui/result-page'));
export const resultRoute = mainRouter.reatomRoute({
	path: 'result/:resultId',
	params: z.object({ resultId: z.string() }),
	render: () => {
		return (
			<Suspense fallback={<div>Loading...</div>}>
				<Result resultId={resultRoute()?.resultId || ''} />
			</Suspense>
		);
	},
});

const Room = lazy(() => import('@/pages/room/ui/room-page'));
export const roomRoute = mainRouter.reatomRoute({
	path: 'room/:roomId',
	params: z.object({ roomId: z.string() }),
	render: () => {
		return (
			<Suspense fallback={<div>Loading...</div>}>
				<Room roomId={roomRoute()?.roomId || ''} />
			</Suspense>
		);
	},
});

const Sandbox = lazy(() => import('@/pages/sandbox/ui/sandbox-page'));
export const sandboxRoute = mainRouter.reatomRoute({
	path: 'sandbox/:component',
	params: z.object({ component: z.string() }),
	render: () => {
		return (
			<Suspense fallback={<div>Loading...</div>}>
				<Sandbox component={sandboxRoute()?.component || ''} />
			</Suspense>
		);
	},
});

const Admin = lazy(() => import('@/pages/admin/ui/admin-page'));
export const adminRoute = mainRouter.reatomRoute({
	path: 'admin',
	render: () => {
		return (
			<Suspense fallback={<div>Loading...</div>}>
				<Admin />
			</Suspense>
		);
	},
});

const Setup = lazy(() => import('@/pages/setup/ui/setup-page'));
export const setupRoute = mainRouter.reatomRoute({
	path: 'setup',
	render: () => {
		return (
			<Suspense fallback={<div>Loading...</div>}>
				<Setup />
			</Suspense>
		);
	},
});
