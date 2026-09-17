import React, { useCallback, useState } from 'react';
import { View } from 'react-native';
import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenContainer } from '../components/ScreenContainer';
import { AppText } from '../components/AppText';
import { Card } from '../components/UI';
import { OrnamentalHeader } from '../components/PersianOrnament';
import { useApp } from '../context/AppContext';
import { getPagesReadStatusByDomain } from '../db/queries';
import { Page } from '../types';
import { toFaDigits } from '../theme/theme';
import { BrowseStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<BrowseStackParamList, 'DomainPages'>;
type R = RouteProp<BrowseStackParamList, 'DomainPages'>;

export function DomainPagesScreen() {
  const { theme } = useApp();
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const { domainId, domainName, domainColor } = route.params;
  const [pages, setPages] = useState<Array<Page & { is_read: number }>>([]);

  useFocusEffect(
    useCallback(() => {
      getPagesReadStatusByDomain(domainId).then(setPages);
    }, [domainId])
  );

  return (
    <ScreenContainer>
      <OrnamentalHeader color={domainColor} style={{ marginBottom: 12 }} />
      <AppText weight="display" size={24} center style={{ marginBottom: 20 }}>
        {domainName}
      </AppText>

      {pages.map((p, idx) => (
        <Card
          key={p.id}
          accentColor={domainColor}
          onPress={() => navigation.navigate('PageReader', { pageId: p.id })}
        >
          <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <AppText size={12.5} color={theme.color.textMuted} style={{ marginBottom: 4 }}>
                {`صفحه ${toFaDigits(idx + 1)}`}
              </AppText>
              <AppText weight="semibold" size={15.5}>
                {p.title}
              </AppText>
            </View>
            <AppText size={13} color={p.is_read ? theme.color.success : theme.color.textMuted}>
              {p.is_read ? 'خوانده‌شده' : 'نخوانده'}
            </AppText>
          </View>
        </Card>
      ))}
    </ScreenContainer>
  );
}
