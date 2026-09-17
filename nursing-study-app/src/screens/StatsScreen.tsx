import React, { useCallback, useState } from 'react';
import { View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenContainer } from '../components/ScreenContainer';
import { AppText } from '../components/AppText';
import { Card, ProgressBar } from '../components/UI';
import { OrnamentalHeader } from '../components/PersianOrnament';
import { useApp } from '../context/AppContext';
import { getDomainStats, getBestStreak } from '../db/queries';
import { DomainStat } from '../types';
import { toFaDigits } from '../theme/theme';

export function StatsScreen() {
  const { theme } = useApp();
  const [domainStats, setDomainStats] = useState<DomainStat[]>([]);
  const [bestByDomain, setBestByDomain] = useState<Record<string, number>>({});

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const stats = await getDomainStats();
        setDomainStats(stats);
        const bests: Record<string, number> = {};
        for (const s of stats) {
          bests[s.domain_name] = await getBestStreak(s.domain_name);
        }
        setBestByDomain(bests);
      })();
    }, [])
  );

  return (
    <ScreenContainer>
      <OrnamentalHeader color={theme.color.accent} style={{ marginBottom: 12 }} />
      <AppText weight="display" size={24} center style={{ marginBottom: 20 }}>
        آمار به تفکیک حوزه
      </AppText>

      {domainStats.map((d) => {
        const readPct = d.total_pages > 0 ? d.read_pages / d.total_pages : 0;
        const accPct = d.total_answers > 0 ? Math.round((d.correct_answers / d.total_answers) * 100) : null;
        return (
          <Card key={d.domain_id} accentColor={d.domain_color}>
            <AppText weight="semibold" size={16} style={{ marginBottom: 6 }}>
              {d.domain_name}
            </AppText>
            {d.total_pages === 0 ? (
              <AppText color={theme.color.textMuted} size={13.5}>
                هنوز محتوایی برای این حوزه اضافه نشده
              </AppText>
            ) : (
              <>
                <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: 6 }}>
                  <AppText size={13.5} color={theme.color.textMuted}>
                    {`${toFaDigits(d.read_pages)} از ${toFaDigits(d.total_pages)} صفحه خوانده شده`}
                  </AppText>
                  <AppText size={13.5} color={theme.color.textMuted}>
                    {accPct === null ? 'بدون آزمون' : `دقت سؤالات: ٪${toFaDigits(accPct)}`}
                  </AppText>
                </View>
                <ProgressBar progress={readPct} color={d.domain_color} />
                <AppText size={12.5} color={theme.color.textMuted} style={{ marginTop: 8 }}>
                  {`بهترین رکورد آزمون این حوزه: ${toFaDigits(bestByDomain[d.domain_name] ?? 0)}`}
                </AppText>
              </>
            )}
          </Card>
        );
      })}
    </ScreenContainer>
  );
}
