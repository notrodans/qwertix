import { expect, test } from '@playwright/test';

test.describe('Multiplayer Room Lifecycle', () => {
	test.beforeEach(async ({ page }) => {
		// Predictable guest name: Guest-123
		await page.addInitScript(() => {
			Math.random = () => 0.12345;

			// Mock WebSocket
			// biome-ignore lint/suspicious/noExplicitAny: E2E mock
			(window as any).WebSocket = class extends EventTarget {
				static OPEN = 1;
				static CLOSED = 3;
				readyState = 1; // OPEN
				onmessage: ((ev: MessageEvent) => void) | null = null;
				onopen: (() => void) | null = null;

				constructor() {
					super();
					setTimeout(() => {
						if (this.onopen) this.onopen();
						this.dispatchEvent(new Event('open'));
					}, 0);
				}

				send(data: string) {
					const msg = JSON.parse(data);
					console.log('E2E WS SENT:', msg.type);

					const dispatch = (type: string, payload: unknown) => {
						const eventData = JSON.stringify({ type, payload });
						if (this.onmessage) {
							this.onmessage({ data: eventData } as MessageEvent);
						}
						this.dispatchEvent(
							new MessageEvent('message', { data: eventData }),
						);
					};

					// Using string literals here inside initScript because imports are not available in browser context scope without complex setup.
					// However, the test logic below matches against real contract usage in the app.
					// The app sends SocketActionEnum values.

					if (msg.type === 'JOIN_ROOM') {
						setTimeout(
							() =>
								dispatch('ROOM_STATE', {
									id: 'TEST12',
									status: 0, // LOBBY
									participants: [
										{
											socketId: 'host-id',
											username: 'Guest-123',
											isHost: true,
											progress: 0,
											wpm: 0,
											accuracy: 0,
											rank: null,
											finishedAt: null,
										},
									],
									config: { mode: 1, wordCount: 3 }, // WORDS
									text: ['multiplayer', 'test', 'room'],
								}),
							50,
						);
					}

					if (msg.type === 'START_RACE') {
						console.log('E2E: START_RACE received by mock');
						setTimeout(
							() => dispatch('COUNTDOWN_START', { startTime: Date.now() }),
							100,
						);
						setTimeout(() => dispatch('RACE_START', {}), 500);
					}

					if (msg.type === 'UPDATE_PROGRESS' && msg.payload.typedLength >= 21) {
						setTimeout(() => {
							dispatch('RACE_FINISHED', {
								leaderboard: [
									{
										socketId: 'host-id',
										username: 'Guest-123',
										isHost: true,
										progress: 100,
										wpm: 100,
										accuracy: 100,
										rank: 1,
										finishedAt: Date.now(),
									},
								],
							});
						}, 100);
					}
				}
				close() {}
			};
		});

		// Mock the backend API
		await page.route('**/api/words*', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify(['multiplayer', 'test', 'room']),
			});
		});

		await page.route('**/api/auth/setup-status', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({ isSetupRequired: false }),
			});
		});

		// Mock room creation
		await page.route('**/api/rooms', async (route) => {
			if (route.request().method() === 'POST') {
				console.log('E2E: Mocking POST /api/rooms');
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify({ roomId: 'TEST12' }),
				});
			} else {
				await route.continue();
			}
		});

		// Mock room GET
		await page.route('**/api/rooms/TEST12', async (route) => {
			console.log('E2E: Mocking GET /api/rooms/TEST12');
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					id: 'TEST12',
					status: 0, // LOBBY
					participants: [
						{
							socketId: 'host-id',
							username: 'Guest-123',
							isHost: true,
							progress: 0,
							wpm: 0,
							accuracy: 0,
							rank: null,
							finishedAt: null,
						},
					],
					config: { mode: 1, wordCount: 3 }, // WORDS
					text: ['multiplayer', 'test', 'room'],
				}),
			});
		});
	});

	test('should create and navigate to room lobby', async ({ page }) => {
		page.on('console', (msg) => console.log('BROWSER LOG:', msg.text()));

		await page.goto('/');

		// Create room
		const createButton = page.getByTestId('create-room-button');
		await createButton.click();

		// Should navigate to room page
		await expect(page).toHaveURL(/\/room\/TEST12/, { timeout: 10000 });

		// Wait for Loading Room... to disappear
		await expect(page.getByTestId('loading-room')).toBeHidden({
			timeout: 10000,
		});

		// Should show room details from HTTP initial data
		await expect(page.getByTestId('room-id')).toContainText('TEST12', {
			timeout: 10000,
		});

		// Start button should be available (we are recognized as Guest-123 host)
		await expect(page.getByTestId('start-race-button')).toBeVisible();
	});

	test('should run a full multiplayer race', async ({ page }) => {
		page.on('console', (msg) => console.log('BROWSER LOG:', msg.text()));

		await page.goto('/');
		await page.getByTestId('create-room-button').click();

		// Wait for Lobby
		await expect(page.getByTestId('room-id')).toBeVisible();

		// Wait for our name in participants list (LobbyPlayerList renders names)
		await expect(page.getByTestId('player-Guest-123')).toBeVisible({
			timeout: 5000,
		});

		// Start Race
		const startButton = page.getByTestId('start-race-button');
		await startButton.waitFor({ state: 'visible' });
		await startButton.click({ force: true });

		// Wait for board
		await expect(page.getByTestId('typing-board')).toBeVisible({
			timeout: 10000,
		});

		// Type everything correctly
		await page.keyboard.type('multiplayer test room');

		// Results should appear
		await expect(page.getByTestId('return-to-lobby-button')).toBeVisible({
			timeout: 10000,
		});
		await expect(page.getByTestId('stat-wpm').first()).toBeVisible();
		await expect(page.getByTestId('stat-acc').first()).toBeVisible();

		// Can return to lobby
		await page.getByTestId('return-to-lobby-button').click();
		await expect(page.getByTestId('room-id')).toBeVisible();
	});
});
