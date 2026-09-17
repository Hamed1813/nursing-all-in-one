import React from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
}

export function ScreenContainer({ children, scroll = true, style, contentStyle }: Props) {
  const { theme } = useApp();
  const Container = scroll ? ScrollView : View;
  const containerProps = scroll
    ? { contentContainerStyle: [styles.content, contentStyle], showsVerticalScrollIndicator: false }
    : { style: [styles.content, contentStyle] };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.color.bg }, style]} edges={['top', 'left', 'right']}>
      {/* @ts-ignore - ScrollView vs View prop shape */}
      <Container {...containerProps}>{children}</Container>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
});
