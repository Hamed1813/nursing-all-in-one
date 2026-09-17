import React, { useCallback, useState } from 'react';
import { View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenContainer } from '../components/ScreenContainer';
import { AppText } from '../components/AppText';
import { AppButton, Card, StatTile, ProgressBar } from '../components/UI';
import { DomainFilterPicker } from '../components/DomainFilterPicker';
import { GirihBackdrop, OrnamentalHeader, EightPointStar } from '../components/PersianOrnament';
import { useApp } from '../context/AppContext';
import { getOverallStats, getRandomPage, parseDomainFilter, serializeDomainFilter } from '../db/queries';
import { toFaDigits, spacing } from '../theme/theme';
import { formatJalaliWithWeekday, culturalNote, seasonOf } from '../utils/jalali';
import { HomeStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'HomeRoot'>;

export function HomeScreen() {
  const { theme, settings, updateSetting } = useApp();
  const navigation = useNavigation<Nav>();
  const [stats, setStats] = useState({
    totalPages: 0,
    readPages: 0,
    totalAnswers: 0,
    correctAnswers: 0,
    dueToday: 0,
    bestStreakAll: 0,
  });
  const [loadingPick, setLoadingPick] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getOverallStats().then(setStats);
    }, [])
  );

  const filter = parseDomainFilter(settings.randomDomainFilter);
  const today = new Date();
  const note = culturalNote(today);
  const season = seasonOf(today);

  const handleDailyPick = async () => {
    setLoadingPick(true);
    try {
      const page = await getRandomPage(filter, true);
      if (page) navigation.navigate('PageReader', { pageId: page.id });
    } finally {
      setLoadingPick(false);
    }
  };

  const accuracyPct =
    stats.totalAnswers > 0 ? Math.round((stats.correctAnswers / stats.totalAnswers) * 100) : null;
  const readProgress = stats.totalPages > 0 ? stats.readPages / stats.totalPages : 0;

  return (
    <ScreenContainer contentStyle={{ paddingTop: 0 }}>
      {/* ── سربرگ / hero ───────────────────────────────── */}
      <View style={{ marginHorizontal: -spacing.lg, marginBottom: spacing.lg }}>
        <View style={{ paddingTop: spacing.xl, paddingBottom: spacing.lg, paddingHorizontal: spacing.lg }}>
          <GirihBackdrop height={230} opacity={theme.mode === 'dark' ? 0.1 : 0.08} />

          <OrnamentalHeader color={theme.color.gold} style={{ marginBottom: spacing.md }} />

          <AppText weight="display" size={30} center color={theme.color.primary}>
            دستیار مطالعه پرستاری
          </AppText>

          <AppText size={13} center color={theme.color.textMuted} style={{ marginTop: spacing.xs }}>
            {formatJalaliWithWeekday(today)}
          </AppText>

          {note ? (
            <View
              style={{
                flexDirection: 'row-reverse',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: spacing.md,
              }}
            >
              <EightPointStar size={13} color={theme.color.gold} filled />
              <AppText size={13.5} weight="medium" color={theme.color.gold} style={{ marginRight: 6 }}>
                {note}
              </AppText>
            </View>
          ) : (
            <AppText size={13} center color={theme.color.textMuted} style={{ marginTop: spacing.xs }}>
              {`${season} — امروز یک صفحه جلوتر برو`}
            </AppText>
          )}
        </View>
      </View>

      {/* ── کاشی‌های آمار ──────────────────────────────── */}
      <View style={{ flexDirection: 'row-reverse', marginBottom: spacing.lg, marginHorizontal: -4 }}>
        <StatTile
          value={toFaDigits(stats.readPages)}
          label="صفحه خوانده‌شده"
          color={theme.color.primary}
        />
        <StatTile
          value={toFaDigits(stats.dueToday)}
          label="بازخوانی امروز"
          color={stats.dueToday > 0 ? theme.color.due : theme.color.textMuted}
        />
        <StatTile
          value={accuracyPct === null ? '—' : `٪${toFaDigits(accuracyPct)}`}
          label="دقت پاسخ"
          color={theme.color.accent}
        />
      </View>

      {/* ── امروز چه بخوانم ────────────────────────────── */}
      <Card accentColor={theme.color.gold} elevated>
        <AppText weight="display" size={21} style={{ marginBottom: 6 }}>
          امروز چه بخوانم؟
        </AppText>
        <AppText color={theme.color.textMuted} size={14.5} style={{ marginBottom: spacing.lg }}>
          یک صفحه تصادفی از حوزه‌های انتخابی‌ات باز می‌شود؛ صفحه‌های خوانده‌نشده در اولویت‌اند.
        </AppText>

        <AppButton
          label={loadingPick ? 'در حال انتخاب…' : 'باز کردن صفحه تصادفی'}
          onPress={handleDailyPick}
          disabled={loadingPick}
          ornament
        />
        <AppButton
          label={filterOpen ? 'بستن انتخاب حوزه' : 'انتخاب حوزه‌های مطالعه'}
          onPress={() => setFilterOpen((o) => !o)}
          variant="secondary"
          style={{ marginTop: spacing.sm + 2 }}
        />

        {filterOpen && (
          <View style={{ marginTop: spacing.lg }}>
            <DomainFilterPicker
              value={filter}
              onChange={(v) => updateSetting('randomDomainFilter', serializeDomainFilter(v))}
            />
          </View>
        )}
      </Card>

      {/* ── پیشرفت کلی ─────────────────────────────────── */}
      <Card>
        <View
          style={{
            flexDirection: 'row-reverse',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: spacing.md,
          }}
        >
          <AppText weight="semibold" size={16.5}>
            پیشرفت کلی
          </AppText>
          <AppText size={13.5} color={theme.color.textMuted}>
            {`${toFaDigits(stats.readPages)} از ${toFaDigits(stats.totalPages)}`}
          </AppText>
        </View>

        <ProgressBar progress={readProgress} color={theme.color.primary} />

        <View
          style={{
            flexDirection: 'row-reverse',
            justifyContent: 'space-between',
            marginTop: spacing.lg,
          }}
        >
          <AppText size={13.5} color={theme.color.textMuted}>
            بهترین رکورد آزمون
          </AppText>
          <AppText weight="semibold" size={14} color={theme.color.gold}>
            {toFaDigits(stats.bestStreakAll)}
          </AppText>
        </View>

        <AppButton
          label="مشاهده آمار کامل"
          variant="secondary"
          onPress={() => navigation.navigate('Stats')}
          style={{ marginTop: spacing.lg }}
        />
      </Card>
    </ScreenContainer>
  );
}
