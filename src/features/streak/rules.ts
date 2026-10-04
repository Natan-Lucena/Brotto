export type FocusSession = {
  status: 'completed' | 'cancelled';
  completedMinutes: number;
  startedAt: Date;
  endedAt: Date;
};

export type Schedule = {
  completed: boolean;
};

export type DayWateringInput = {
  sessions: readonly FocusSession[];
  activeSchedules: readonly Schedule[];
  hasRelease: boolean;
};

export type StreakState = {
  current: number;
  best: number;
  maxStage: number;
};

const MINIMUM_SESSION_MINUTES = 5;
const WATERING_GOAL_MINUTES = 25;
const MAX_STAGE = 5;

const isEligibleSession = (session: FocusSession): boolean =>
  session.status === 'completed' &&
  Number.isFinite(session.completedMinutes) &&
  session.completedMinutes >= MINIMUM_SESSION_MINUTES;

const nonNegativeInteger = (value: number): number =>
  Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;

export const calculateEligibleFocusMinutes = (
  sessions: readonly FocusSession[],
): number =>
  sessions.reduce(
    (total, session) =>
      total + (isEligibleSession(session) ? session.completedMinutes : 0),
    0,
  );

export const isDayWatered = (input: DayWateringInput): boolean => {
  if (calculateEligibleFocusMinutes(input.sessions) >= WATERING_GOAL_MINUTES) {
    return true;
  }

  return (
    !input.hasRelease &&
    input.activeSchedules.length > 0 &&
    input.activeSchedules.every((schedule) => schedule.completed)
  );
};

export const getStageForDays = (days: number, previousMaxStage: number): number => {
  const normalizedDays = nonNegativeInteger(days);
  const previousStage = Math.min(nonNegativeInteger(previousMaxStage), MAX_STAGE);
  const stage =
    normalizedDays >= 100
      ? 5
      : normalizedDays >= 60
        ? 4
        : normalizedDays >= 30
          ? 3
          : normalizedDays >= 7
            ? 2
            : normalizedDays >= 1
              ? 1
              : 0;

  return Math.max(stage, previousStage);
};

export const breakStreak = (state: StreakState): StreakState => ({
  current: 0,
  best: nonNegativeInteger(state.best),
  maxStage: Math.min(nonNegativeInteger(state.maxStage), MAX_STAGE),
});

export const getDayKey = (instant: Date, timeZone: string): string => {
  if (!(instant instanceof Date) || Number.isNaN(instant.getTime())) {
    return '';
  }

  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(instant);
    const values = Object.fromEntries(
      parts
        .filter(({ type }) => type !== 'literal')
        .map(({ type, value }) => [type, value]),
    );

    return `${values.year ?? ''}-${values.month ?? ''}-${values.day ?? ''}`;
  } catch {
    return '';
  }
};

export const calculateProtectedMinutes = (
  sessions: readonly FocusSession[],
): number => {
  const intervals = sessions
    .filter(isEligibleSession)
    .map(({ startedAt, endedAt }) => ({
      start: startedAt.getTime(),
      end: endedAt.getTime(),
    }))
    .filter(
      ({ start, end }) => Number.isFinite(start) && Number.isFinite(end) && end > start,
    )
    .sort((left, right) => left.start - right.start);

  let protectedMilliseconds = 0;
  let currentStart: number | undefined;
  let currentEnd: number | undefined;

  for (const interval of intervals) {
    if (currentStart === undefined || currentEnd === undefined) {
      currentStart = interval.start;
      currentEnd = interval.end;
      continue;
    }

    if (interval.start <= currentEnd) {
      currentEnd = Math.max(currentEnd, interval.end);
      continue;
    }

    protectedMilliseconds += currentEnd - currentStart;
    currentStart = interval.start;
    currentEnd = interval.end;
  }

  if (currentStart !== undefined && currentEnd !== undefined) {
    protectedMilliseconds += currentEnd - currentStart;
  }

  return Math.floor(protectedMilliseconds / 60_000);
};
