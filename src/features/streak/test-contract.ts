export type FocusSessionFixture = {
  status: 'completed' | 'cancelled';
  completedMinutes: number;
  startedAt: Date;
  endedAt: Date;
};

export type ScheduleFixture = {
  completed: boolean;
};

export type DayWateringInput = {
  sessions: FocusSessionFixture[];
  activeSchedules: ScheduleFixture[];
  hasRelease: boolean;
};

export type StreakState = {
  current: number;
  best: number;
  maxStage: number;
};
