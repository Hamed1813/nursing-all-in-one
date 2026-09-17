import React, { useCallback, useState } from 'react';
import { View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenContainer } from '../components/ScreenContainer';
import { AppText } from '../components/AppText';
import { Card, ProgressBar, Badge } from '../components/UI';
import { OrnamentalHeader } from '../components/PersianOrnament';
import { useApp } from '../context/AppContext';
import { getDomainStats } from '../db/queries';
import { DomainStat } from '../types';
import { toFaDigits } from '../theme/theme';
import { BrowseStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<BrowseStackParamList, 'DomainList'>;

export function DomainListScreen() {
  const { theme } = useApp();
  const navigation = useNavigation<Nav>();
  const [domains, setDomains] = useState<DomainStat[]>([]);

  useFocusEffect(
    useCallback(() => {
      getDomainStats().then(setDomains);
    }, [])
  );

  return (
    <ScreenContainer>
      <OrnamentalHeader color={theme.color.accent} style={{ marginBottom: 12 }} />
      <AppText weight="display" size={24} center style={{ marginBottom: 4 }}>
        مرور بر اساس حوزه
      </AppText>
      <AppText size={13.5} center color={theme.color.textMuted} style={{ marginBottom: 20 }}>
        صفحه‌به‌صفحه در یک حوزه پیش برو
      </AppText>

      {domains.map((d) => {
        const readPct = d.total_pages > 0 ? d.read_pages / d.total_pages : 0;
        const isEmpty = d.total_pages === 0;
        return (
          <Card
            key={d.domain_id}
            accentColor={d.domain_color}
            onPress={
              isEmpty
                ? undefined
                : () =>
                    navigation.navigate('DomainPages', {
                      domainId: d.domain_id,
                      domainName: d.domain_name,
                      domainColor: d.domain_color,
                    })
            }
          >
            <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: 8 }}>
              <AppText weight="semibold" size={16.5}>
                {d.domain_name}
              </AppText>
              <AppText size={13} color={theme.color.textMuted}>
                {isEmpty ? 'به‌زودی' : `${toFaDigits(d.read_pages)}/${toFaDigits(d.total_pages)}`}
              </AppText>
            </View>
            {!isEmpty && <ProgressBar progress={readPct} color={d.domain_color} />}
          </Card>
        );
      })}
    </ScreenContainer>
  );
}
