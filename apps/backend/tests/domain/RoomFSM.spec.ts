import { RoomStatusEnum } from '@qwertix/room-contracts';
import { describe, expect, it } from 'vitest';
import { RoomFSM } from '@/domain/room/RoomFSM';
import { DomainException } from '@/exceptions/DomainException';

describe('RoomFSM', () => {
	it('should initialize with LOBBY state by default', () => {
		const fsm = new RoomFSM();
		expect(fsm.state).toBe(RoomStatusEnum.LOBBY);
	});

	it('should allow valid transition from LOBBY to COUNTDOWN', () => {
		const fsm = new RoomFSM(RoomStatusEnum.LOBBY);
		fsm.transitionTo(RoomStatusEnum.COUNTDOWN);
		expect(fsm.state).toBe(RoomStatusEnum.COUNTDOWN);
	});

	it('should NOT allow invalid transition from LOBBY to RACING', () => {
		const fsm = new RoomFSM(RoomStatusEnum.LOBBY);
		expect(() => fsm.transitionTo(RoomStatusEnum.RACING)).toThrow(
			DomainException,
		);
	});

	it('should allow valid transition from COUNTDOWN to RACING', () => {
		const fsm = new RoomFSM(RoomStatusEnum.COUNTDOWN);
		fsm.transitionTo(RoomStatusEnum.RACING);
		expect(fsm.state).toBe(RoomStatusEnum.RACING);
	});

	it('should allow valid transition from COUNTDOWN to LOBBY (cancellation)', () => {
		const fsm = new RoomFSM(RoomStatusEnum.COUNTDOWN);
		fsm.transitionTo(RoomStatusEnum.LOBBY);
		expect(fsm.state).toBe(RoomStatusEnum.LOBBY);
	});

	it('should allow valid transition from RACING to FINISHED', () => {
		const fsm = new RoomFSM(RoomStatusEnum.RACING);
		fsm.transitionTo(RoomStatusEnum.FINISHED);
		expect(fsm.state).toBe(RoomStatusEnum.FINISHED);
	});

	it('should allow valid transition from RACING to LOBBY (force stop)', () => {
		const fsm = new RoomFSM(RoomStatusEnum.RACING);
		fsm.transitionTo(RoomStatusEnum.LOBBY);
		expect(fsm.state).toBe(RoomStatusEnum.LOBBY);
	});

	it('should allow valid transition from FINISHED to LOBBY (play again)', () => {
		const fsm = new RoomFSM(RoomStatusEnum.FINISHED);
		fsm.transitionTo(RoomStatusEnum.LOBBY);
		expect(fsm.state).toBe(RoomStatusEnum.LOBBY);
	});

	it('should NOT allow invalid transition from FINISHED to RACING', () => {
		const fsm = new RoomFSM(RoomStatusEnum.FINISHED);
		expect(() => fsm.transitionTo(RoomStatusEnum.RACING)).toThrow(
			DomainException,
		);
	});

	it('should allow no-op transition (same state)', () => {
		const fsm = new RoomFSM(RoomStatusEnum.LOBBY);
		fsm.transitionTo(RoomStatusEnum.LOBBY);
		expect(fsm.state).toBe(RoomStatusEnum.LOBBY);
	});
});
