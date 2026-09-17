import React, { useCallback, useState } from 'react';
import { View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenContainer } from '../components/ScreenContainer';
import { AppText } from '../components/AppText';
import { AppButton, Card } from '../components/UI';
import { OrnamentalHeader, EightPointStar } from '../components/PersianOrnament';
import { DomainFilterPicker } from '../components/DomainFilterPicker';
import { useApp } from '../context/AppContext';
import { domainFilterKey, getBestStreak } from '../db/queries';
import { toFaDigits } from '../theme/theme';
import { ExamStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<ExamStackParamList, 'ExamSetup'>;

export function ExamSetupScreen() {
  const { theme } = useApp();
  const navigation = useNavigation<Nav>();
  const [filter, setFilter] = useState<'all' | number[]>('all');
  const [best, setBest] = useState(0);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const key = await domainFilterKey(filter);
        setBest(await getBestStreak(key));
      })();
    }, [filter])
  );

  return (
    <ScreenContainer>
      <OrnamentalHeader color={theme.color.gold} style={{ marginBottom: 12 }} />
      <AppText weight="display" size={24} center style={{ marginBottom: 4 }}>
        حالت آزمون و رکورد
      </AppText>
      <AppText size={13.5} center color={theme.color.textMuted} style={{ marginBottom: 18 }}>
        سؤالات تصادفی پشت‌سرهم می‌آیند تا اولین جواب غلط — ببین چقدر می‌تونی جلو بری
      </AppText>

      <Card>
        <DomainFilterPicker value={filter} onChange={setFilter} label="حوزه آزمون" />
      </Card>

      <Card accentColor={theme.color.gold}>
        <AppText color={theme.color.textMuted} style={{ marginBottom: 4 }}>
          بهترین رکورد تو برای این انتخاب
        </AppText>
        <View style={{ flexDirection: 'row-reverse', alignItems: 'center' }}>
          <EightPointStar size={18} color={theme.color.gold} filled />
          <AppText weight="display" size={30} color={theme.color.gold} style={{ marginRight: 8 }}>
            {toFaDigits(best)}
          </AppText>
        </View>
      </Card>

      <AppButton ornament label="شروع آزمون" onPress={() => navigation.navigate('ExamRun', { domainFilter: filter })} />
    </ScreenContainer>
  );
}
