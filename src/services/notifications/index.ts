import * as Notifications from 'expo-notifications';
export async function requestNotificationPermission() {
  return Notifications.requestPermissionsAsync();
}
export async function cancelNotification(id: string) {
  return Notifications.cancelScheduledNotificationAsync(id);
}
