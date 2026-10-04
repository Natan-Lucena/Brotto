import { describe, expect, it } from 'vitest';
import {
  breakStreak,
  calculateEligibleFocusMinutes,
  calculateProtectedMinutes,
  getDayKey,
  getStageForDays,
  isDayWatered,
} from '../rules';
import type {
  DayWateringInput,
  FocusSessionFixture,
  StreakState,
} from '../test-contract';

const session = (
  completedMinutes: number,
  options: Partial<FocusSessionFixture> = {},
): FocusSessionFixture => ({
  status: 'completed',
  completedMinutes,
  startedAt: new Date('2026-04-08T09:00:00Z'),
  endedAt: new Date('2026-04-08T09:00:00Z'),
  ...options,
});

const day = (overrides: Partial<DayWateringInput> = {}): DayWateringInput => ({
  sessions: [],
  activeSchedules: [],
  hasRelease: false,
  ...overrides,
});

describe('streak rules', () => {
  describe('eligible focus minutes', () => {
    it('sums completed qualifying sessions toward the 25-minute watering goal', () => {
      expect(calculateEligibleFocusMinutes([session(12), session(13)])).toBe(25);
      expect(isDayWatered(day({ sessions: [session(12), session(13)] }))).toBe(true);
    });

    it('ignores sessions shorter than five minutes and cancelled sessions', () => {
      expect(
        calculateEligibleFocusMinutes([
          session(4),
          session(5),
          session(30, { status: 'cancelled' }),
        ]),
      ).toBe(5);
    });

    it('does not water the day with only 24 eligible focus minutes', () => {
      expect(isDayWatered(day({ sessions: [session(24)] }))).toBe(false);
    });
  });

  describe('schedule watering', () => {
    it('waters the day when every active schedule is completed without a release', () => {
      expect(
        isDayWatered(
          day({ activeSchedules: [{ completed: true }, { completed: true }] }),
        ),
      ).toBe(true);
    });

    it('does not water from the schedule criterion when there are no active schedules', () => {
      expect(isDayWatered(day())).toBe(false);
    });

    it('does not water from the schedule criterion when an active schedule is incomplete', () => {
      expect(
        isDayWatered(
          day({ activeSchedules: [{ completed: true }, { completed: false }] }),
        ),
      ).toBe(false);
    });

    it('lets focus water the day even when a release invalidates schedule watering', () => {
      expect(
        isDayWatered(
          day({
            sessions: [session(25)],
            activeSchedules: [{ completed: true }],
            hasRelease: true,
          }),
        ),
      ).toBe(true);
    });
  });

  describe('plant stages', () => {
    it.each([
      [0, 0],
      [1, 1],
      [6, 1],
      [7, 2],
      [29, 2],
      [30, 3],
      [59, 3],
      [60, 4],
      [99, 4],
      [100, 5],
    ])('maps %i days to stage %i', (days, expectedStage) => {
      expect(getStageForDays(days, 0)).toBe(expectedStage);
    });

    it('never regresses below a previously reached maximum stage', () => {
      expect(getStageForDays(6, 5)).toBe(5);
      expect(getStageForDays(0, 4)).toBe(4);
    });
  });

  it('breaks only the current streak while preserving best streak and maximum stage', () => {
    const state: StreakState = { current: 31, best: 60, maxStage: 4 };

    expect(breakStreak(state)).toEqual({ current: 0, best: 60, maxStage: 4 });
  });

  it('keys dates in the supplied time zone around the Sao Paulo midnight boundary', () => {
    const beforeMidnight = new Date('2026-04-09T02:59:59Z');
    const atMidnight = new Date('2026-04-09T03:00:00Z');

    expect(getDayKey(beforeMidnight, 'America/Sao_Paulo')).toBe('2026-04-08');
    expect(getDayKey(atMidnight, 'America/Sao_Paulo')).toBe('2026-04-09');
    expect(getDayKey(beforeMidnight, 'UTC')).toBe('2026-04-09');
  });

  it('unions simultaneous protected-time intervals and ignores ineligible sessions', () => {
    expect(
      calculateProtectedMinutes([
        session(20, {
          startedAt: new Date('2026-04-08T09:00:00Z'),
          endedAt: new Date('2026-04-08T09:20:00Z'),
        }),
        session(30, {
          startedAt: new Date('2026-04-08T09:10:00Z'),
          endedAt: new Date('2026-04-08T09:40:00Z'),
        }),
        session(5, {
          startedAt: new Date('2026-04-08T09:40:00Z'),
          endedAt: new Date('2026-04-08T09:45:00Z'),
        }),
        session(4, {
          startedAt: new Date('2026-04-08T10:00:00Z'),
          endedAt: new Date('2026-04-08T10:04:00Z'),
        }),
        session(30, {
          status: 'cancelled',
          startedAt: new Date('2026-04-08T10:00:00Z'),
          endedAt: new Date('2026-04-08T10:30:00Z'),
        }),
      ]),
    ).toBe(45);
  });
});
