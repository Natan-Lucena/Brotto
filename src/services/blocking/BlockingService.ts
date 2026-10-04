export type PermissionStatus = 'not-determined' | 'granted' | 'denied' | 'unavailable';
export interface SelectedApp {
  id: string;
  platformRef: string;
  label: string;
  enabled: boolean;
}
export interface AppSelection {
  apps: SelectedApp[];
}
export interface Schedule {
  id: string;
  name: string;
  days: number[];
  startMin: number;
  endMin: number;
  enabled: boolean;
  apps: string[];
}
export interface BlockingService {
  requestPermissions(): Promise<PermissionStatus>;
  getPermissionStatus(): Promise<PermissionStatus>;
  selectApps(): Promise<AppSelection>;
  blockNow(selection: AppSelection): Promise<void>;
  unblock(): Promise<void>;
  startFocusBlock(selection: AppSelection, endsAt: string | Date): Promise<void>;
  setSchedules(schedules: Schedule[]): Promise<void>;
  releaseAppUntilMidnight(appId: string): Promise<string>;
}
export class MockBlockingService implements BlockingService {
  private permission: PermissionStatus = 'unavailable';
  private selected: AppSelection = { apps: [] };
  private schedules: Schedule[] = [];
  private blocking = false;
  async requestPermissions() {
    return this.permission;
  }
  async getPermissionStatus() {
    return this.permission;
  }
  async selectApps() {
    return this.selected;
  }
  async blockNow(selection: AppSelection) {
    this.selected = selection;
    this.blocking = true;
  }
  async unblock() {
    this.blocking = false;
  }
  async startFocusBlock(selection: AppSelection, _endsAt: string | Date) {
    await this.blockNow(selection);
  }
  async setSchedules(schedules: Schedule[]) {
    this.schedules = schedules;
  }
  async releaseAppUntilMidnight(_appId: string) {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
  }
}
export const blockingService: BlockingService = new MockBlockingService();
