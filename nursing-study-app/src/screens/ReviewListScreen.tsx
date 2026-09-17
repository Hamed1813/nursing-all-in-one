import React, { useCallback, useState } from 'react';
import { View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenContainer } from '../components/ScreenContainer';
import { AppText } from '../components/AppText';
import { Card } from '../components/UI';
import { DomainFilterPicker } from '../components/DomainFilterPicker';
import { BotehMotif, OrnamentalHeader } from '../components/PersianOrnament';
import { useApp } from '../context/AppContext';
import { getDuePages } from '../db/queries';
import { LeitnerCard, PageWithDomain } from '../types';
import { toFaDigits, spacing } from '../theme/theme';
import { relativeDayLabel } from '../utils/jalali';
import { ReviewStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<ReviewStackParamList, 'ReviewList'>;

/** جعبه لایتنر — five filled/empty pips showing which box a page sits in. */
function BoxIndicator({ box, color }: { box: number; color: string }) {
  const { theme } = useApp();
  return (
    <View style={{ flexDirection: 'row-reverse', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <View
          key={n}
          style={{
            width: 7,
            height: 7,
            borderRadius: 2,
            marginLeft: 3,
            transform: [{ rotate: '45deg' }],
            backgroundColor: n <= box ? color : 'transparent',
            borderWidth: n <= box ? 0 : 1,
            borderColor: theme.color.hairline,
          }}
        />
      ))}
    </View>
  );
}

export function ReviewListScreen() {
  const { theme } = useApp();
  const navigation = useNavigation<Nav>();
  const [filter, setFilter] = useState<'all' | number[]>('all');
  const [duePages, setDuePages] = useState<Array<PageWithDomain & LeitnerCard>>([]);

  useFocusEffect(
    useCallback(() => {
      getDuePages(filter).then(setDuePages);
    }, [filter])
  );

  return (
    <ScreenContainer>
      <OrnamentalHeader color={theme.color.due} style={{ marginBottom: spacing.md }} />

      <AppText weight="display" size={24} center style={{ marginBottom: spacing.xs }}>
        بازخوانی زمان‌بندی‌شده
      </AppText>
      <AppText size={13.5} center color={theme.color.textMuted} style={{ marginBottom: spacing.lg }}>
        صفحاتی که طبق جعبه لایتنر امروز موعد مرورشان است
      </AppText>

      <DomainFilterPicker value={filter} onChange={setFilter} />

      <View style={{ height: spacing.md }} />

      {duePages.length === 0 ? (
        <Card>
          <View style={{ alignItems: 'center', paddingVertical: spacing.lg }}>
            <BotehMotif size={64} color={theme.color.primary} opacity={0.3} />
            <AppText color={theme.color.textMuted} center size={14.5} style={{ marginTop: spacing.lg }}>
              چیزی برای بازخوانی امروز نیست.
            </AppText>
            <AppText color={theme.color.textMuted} center size={13.5} style={{ marginTop: spacing.xs }}>
              بعد از خواندن صفحات جدید و پاسخ به سؤالاتشان، طبق جدول زمانی اینجا برمی‌گردند.
            </AppText>
          </View>
        </Card>
      ) : (
        <>
          <AppText size={13} color={theme.color.due} style={{ marginBottom: spacing.sm }}>
            {`${toFaDigits(duePages.length)} صفحه آماده مرور`}
          </AppText>

          {duePages.map((p) => (
            <Card
              key={p.page_id}
              accentColor={p.domain_color}
              onPress={() => navigation.navigate('PageReader', { pageId: p.page_id })}
            >
              <View
                style={{
                  flexDirection: 'row-reverse',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: spacing.sm,
                }}
              >
                <AppText size={12.5} color={theme.color.textMuted}>
                  {p.domain_name}
                </AppText>
                <BoxIndicator box={p.box} color={p.domain_color} />
              </View>

              <AppText weight="semibold" size={16} style={{ marginBottom: spacing.xs }}>
                {p.title}
              </AppText>

              <AppText size={12.5} color={theme.color.due}>
                {`موعد: ${relativeDayLabel(new Date(p.next_review_at))}`}
              </AppText>
            </Card>
          ))}
        </>
      )}
    </ScreenContainer>
  );
}
