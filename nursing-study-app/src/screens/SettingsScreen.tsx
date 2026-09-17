import React, { useState } from 'react';
import { Switch, TextInput, View } from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { AppText } from '../components/AppText';
import { AppButton, Card, Chip, Divider } from '../components/UI';
import { OrnamentalHeader } from '../components/PersianOrnament';
import { useApp } from '../context/AppContext';
import { toFaDigits } from '../theme/theme';
import { LeitnerIntervals } from '../types';
import { ensureNotificationPermission, scheduleDailyReminder, cancelDailyReminder } from '../utils/notifications';
import { exportBackupAndShare } from '../utils/backup';

const BOX_LABELS: Array<{ key: keyof LeitnerIntervals; label: string }> = [
  { key: 'box1', label: 'جعبه ۱' },
  { key: 'box2', label: 'جعبه ۲' },
  { key: 'box3', label: 'جعبه ۳' },
  { key: 'box4', label: 'جعبه ۴' },
  { key: 'box5', label: 'جعبه ۵' },
];

export function SettingsScreen() {
  const { theme, settings, updateSetting } = useApp();
  const [exporting, setExporting] = useState(false);

  const handleIntervalChange = (key: keyof LeitnerIntervals, text: string) => {
    const days = Math.max(1, parseInt(text || '1', 10) || 1);
    updateSetting('intervals', { ...settings.intervals, [key]: days });
  };

  const handleReminderToggle = async (value: boolean) => {
    if (value) {
      const granted = await ensureNotificationPermission();
      if (!granted) return;
      await scheduleDailyReminder(settings.reminderHour, settings.reminderMinute);
    } else {
      await cancelDailyReminder();
    }
    await updateSetting('reminderEnabled', value);
  };

  const handleReminderTimeChange = async (hour: number, minute: number) => {
    await updateSetting('reminderHour', hour);
    await updateSetting('reminderMinute', minute);
    if (settings.reminderEnabled) {
      await scheduleDailyReminder(hour, minute);
    }
  };

  return (
    <ScreenContainer>
      <OrnamentalHeader color={theme.color.primary} style={{ marginBottom: 12 }} />
      <AppText weight="display" size={24} center style={{ marginBottom: 20 }}>
        تنظیمات
      </AppText>

      <Card>
        <AppText weight="semibold" size={15.5} style={{ marginBottom: 10 }}>
          پوسته برنامه
        </AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          <Chip label="روشن" selected={settings.theme === 'light'} onPress={() => updateSetting('theme', 'light')} />
          <Chip label="تیره" selected={settings.theme === 'dark'} onPress={() => updateSetting('theme', 'dark')} />
        </View>
      </Card>

      <Card>
        <AppText weight="semibold" size={15.5} style={{ marginBottom: 10 }}>
          اندازه فونت
        </AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          <Chip label="کوچک" selected={settings.fontSize === 'small'} onPress={() => updateSetting('fontSize', 'small')} />
          <Chip label="متوسط" selected={settings.fontSize === 'medium'} onPress={() => updateSetting('fontSize', 'medium')} />
          <Chip label="بزرگ" selected={settings.fontSize === 'large'} onPress={() => updateSetting('fontSize', 'large')} />
        </View>
      </Card>

      <Card>
        <AppText weight="semibold" size={15.5} style={{ marginBottom: 4 }}>
          فاصله زمانی بازخوانی جعبه لایتنر (روز)
        </AppText>
        <AppText size={12.5} color={theme.color.textMuted} style={{ marginBottom: 12 }}>
          وقتی صفحه‌ای در سؤالاتش نمره کافی بیاره، به جعبه بعدی می‌ره و بعد از تعداد روزهای این جعبه دوباره نشونت داده می‌شه.
        </AppText>
        {BOX_LABELS.map(({ key, label }) => (
          <View key={key} style={{ flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <AppText color={theme.color.textMuted}>{label}</AppText>
            <TextInput
              value={String(settings.intervals[key])}
              onChangeText={(t) => handleIntervalChange(key, t)}
              keyboardType="number-pad"
              style={{
                borderWidth: 1,
                borderColor: theme.color.hairline,
                borderRadius: 8,
                paddingVertical: 6,
                paddingHorizontal: 14,
                minWidth: 60,
                textAlign: 'center',
                color: theme.color.text,
                fontFamily: 'Vazirmatn_500Medium',
              }}
            />
          </View>
        ))}
      </Card>

      <Card>
        <AppText weight="semibold" size={15.5} style={{ marginBottom: 4 }}>
          حد نمره قبولی برای پیشرفت در جعبه
        </AppText>
        <AppText size={12.5} color={theme.color.textMuted} style={{ marginBottom: 12 }}>
          حداقل چند سؤال درست از ۵ سؤال، صفحه رو به جعبه بعدی می‌بره
        </AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {[3, 4, 5].map((n) => (
            <Chip
              key={n}
              label={`${toFaDigits(n)} از ۵`}
              selected={settings.passThreshold === n}
              onPress={() => updateSetting('passThreshold', n)}
            />
          ))}
        </View>
      </Card>

      <Card>
        <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: settings.reminderEnabled ? 14 : 0 }}>
          <AppText weight="semibold" size={15.5}>
            یادآور مطالعه روزانه
          </AppText>
          <Switch value={settings.reminderEnabled} onValueChange={handleReminderToggle} />
        </View>
        {settings.reminderEnabled && (
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center' }}>
            <AppText color={theme.color.textMuted} style={{ marginLeft: 10 }}>
              ساعت یادآوری:
            </AppText>
            <TextInput
              value={String(settings.reminderHour)}
              onChangeText={(t) => handleReminderTimeChange(Math.min(23, Math.max(0, parseInt(t || '0', 10) || 0)), settings.reminderMinute)}
              keyboardType="number-pad"
              style={{
                borderWidth: 1,
                borderColor: theme.color.hairline,
                borderRadius: 8,
                paddingVertical: 6,
                paddingHorizontal: 14,
                minWidth: 50,
                textAlign: 'center',
                color: theme.color.text,
                fontFamily: 'Vazirmatn_500Medium',
              }}
            />
          </View>
        )}
      </Card>

      <Card>
        <AppText weight="semibold" size={15.5} style={{ marginBottom: 10 }}>
          پشتیبان‌گیری
        </AppText>
        <AppText size={12.5} color={theme.color.textMuted} style={{ marginBottom: 12 }}>
          خروجی از پیشرفت مطالعه، وضعیت جعبه لایتنر و رکوردهات بگیر تا موقع تعویض گوشی از دستش ندی.
        </AppText>
        <AppButton
          label={exporting ? 'در حال آماده‌سازی...' : 'گرفتن خروجی و اشتراک‌گذاری'}
          disabled={exporting}
          onPress={async () => {
            setExporting(true);
            try {
              await exportBackupAndShare();
            } finally {
              setExporting(false);
            }
          }}
        />
      </Card>

      <Divider />
      <AppText size={12} color={theme.color.textMuted} center>
        دستیار مطالعه پرستاری — کاملاً آفلاین
      </AppText>
    </ScreenContainer>
  );
}
