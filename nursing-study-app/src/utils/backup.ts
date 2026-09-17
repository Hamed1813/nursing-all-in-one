import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { exportAllData } from '../db/queries';

export async function exportBackupAndShare(): Promise<void> {
  const json = await exportAllData();
  const fileUri = `${FileSystem.cacheDirectory}nursing-app-backup-${Date.now()}.json`;
  await FileSystem.writeAsStringAsync(fileUri, json, { encoding: 'utf8' });

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(fileUri, {
      mimeType: 'application/json',
      dialogTitle: 'ذخیره پشتیبان پیشرفت مطالعه',
    });
  }
}
