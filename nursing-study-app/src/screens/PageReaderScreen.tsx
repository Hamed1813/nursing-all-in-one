import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenContainer } from '../components/ScreenContainer';
import { AppText } from '../components/AppText';
import { AppButton, Badge } from '../components/UI';
import { OrnamentalHeader, OrnamentalDivider, EightPointStar } from '../components/PersianOrnament';
import { useApp } from '../context/AppContext';
import { getPageWithDomain, markPageRead } from '../db/queries';
import { PageWithDomain } from '../types';
import { spacing } from '../theme/theme';
import { SharedStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<SharedStackParamList, 'PageReader'>;
type R = RouteProp<SharedStackParamList, 'PageReader'>;

/**
 * Renders the page body. Lines that begin with a bullet are given a
 * Persian star marker instead of a plain dot, so the reading page
 * carries the same ornament vocabulary as the rest of the app.
 */
function PageBody({ body, accent }: { body: string; accent: string }) {
  const { theme } = useApp();
  const lines = body.split('\n');

  return (
    <View>
      {lines.map((line, i) => {
        const trimmed = line.trim();

        if (trimmed === '') return <View key={i} style={{ height: spacing.md }} />;

        if (trimmed.startsWith('•')) {
          return (
            <View key={i} style={{ flexDirection: 'row-reverse', marginBottom: spacing.sm, paddingRight: 2 }}>
              <View style={{ marginTop: 7, marginLeft: spacing.sm }}>
                <EightPointStar size={10} color={accent} filled />
              </View>
              <AppText size={16} style={{ flex: 1 }}>
                {trimmed.replace(/^•\s*/, '')}
              </AppText>
            </View>
          );
        }

        // numbered list item
        if (/^[۰-۹0-9]+[.)]/.test(trimmed)) {
          return (
            <View key={i} style={{ flexDirection: 'row-reverse', marginBottom: spacing.sm }}>
              <AppText size={16} weight="semibold" color={accent} style={{ marginLeft: spacing.sm }}>
                {trimmed.match(/^[۰-۹0-9]+/)?.[0]}
              </AppText>
              <AppText size={16} style={{ flex: 1 }}>
                {trimmed.replace(/^[۰-۹0-9]+[.)]\s*/, '')}
              </AppText>
            </View>
          );
        }

        return (
          <AppText key={i} size={16} style={{ marginBottom: spacing.sm }}>
            {trimmed}
          </AppText>
        );
      })}
    </View>
  );
}

export function PageReaderScreen() {
  const { theme } = useApp();
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const { pageId } = route.params;
  const [page, setPage] = useState<PageWithDomain | null>(null);

  useEffect(() => {
    (async () => {
      const p = await getPageWithDomain(pageId);
      setPage(p);
      await markPageRead(pageId);
    })();
  }, [pageId]);

  if (!page) {
    return (
      <ScreenContainer>
        <AppText color={theme.color.textMuted}>در حال بارگذاری…</AppText>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={{ alignItems: 'flex-end', marginBottom: spacing.md }}>
        <Badge label={page.domain_name} color={page.domain_color} />
      </View>

      <OrnamentalHeader color={page.domain_color} style={{ marginBottom: spacing.md }} />

      <AppText weight="display" size={24} center style={{ marginBottom: spacing.xs }}>
        {page.title}
      </AppText>

      <OrnamentalDivider color={page.domain_color} />

      <View style={{ marginTop: spacing.sm }}>
        <PageBody body={page.body} accent={page.domain_color} />
      </View>

      <OrnamentalDivider color={page.domain_color} />

      <AppButton
        label="شروع سؤالات این صفحه"
        onPress={() => navigation.navigate('Quiz', { pageId })}
        style={{ marginTop: spacing.md }}
        ornament
      />
    </ScreenContainer>
  );
}
