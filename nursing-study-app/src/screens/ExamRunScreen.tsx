import React, { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenContainer } from '../components/ScreenContainer';
import { AppText } from '../components/AppText';
import { AppButton, Card } from '../components/UI';
import { EightPointStar, OrnamentalDivider } from '../components/PersianOrnament';
import { useApp } from '../context/AppContext';
import {
  domainFilterKey,
  getBestStreak,
  getRandomQuestion,
  recordQuizAttempt,
  saveExamRecord,
} from '../db/queries';
import { ChoiceKey } from '../types';
import { toFaDigits } from '../theme/theme';
import { ExamStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<ExamStackParamList, 'ExamRun'>;
type R = RouteProp<ExamStackParamList, 'ExamRun'>;
type ExamQuestion = Awaited<ReturnType<typeof getRandomQuestion>>;

const CHOICE_KEYS: ChoiceKey[] = ['a', 'b', 'c', 'd'];

export function ExamRunScreen() {
  const { theme } = useApp();
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const { domainFilter } = route.params;

  const [question, setQuestion] = useState<ExamQuestion>(null);
  const [usedIds, setUsedIds] = useState<number[]>([]);
  const [selected, setSelected] = useState<ChoiceKey | null>(null);
  const [streak, setStreak] = useState(0);
  const [finished, setFinished] = useState(false);
  const [isNewBest, setIsNewBest] = useState(false);

  const loadNext = async (exclude: number[]) => {
    let q = await getRandomQuestion(domainFilter, exclude);
    if (!q) {
      // exhausted the pool — start a fresh cycle so the exam can keep going
      q = await getRandomQuestion(domainFilter, []);
      setUsedIds(q ? [q.id] : []);
    } else {
      setUsedIds([...exclude, q.id]);
    }
    setQuestion(q);
    setSelected(null);
  };

  useEffect(() => {
    loadNext([]);
  }, []);

  if (finished) {
    return (
      <ScreenContainer>
        <Card accentColor={theme.color.gold}>
          <AppText weight="display" size={22} center style={{ marginBottom: 4 }}>
            پایان آزمون
          </AppText>
          <OrnamentalDivider color={theme.color.gold} />
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
            {isNewBest && <EightPointStar size={20} color={theme.color.gold} filled />}
            <AppText size={38} weight="display" color={theme.color.gold} style={{ marginRight: isNewBest ? 8 : 0 }}>
              {toFaDigits(streak)}
            </AppText>
          </View>
          <AppText color={theme.color.textMuted} style={{ marginBottom: 16 }}>
            {isNewBest ? 'رکورد جدید! 🎉' : 'سؤال درست پشت‌سرهم قبل از اولین جواب غلط'}
          </AppText>
          <AppButton label="آزمون دوباره" onPress={() => navigation.replace('ExamRun', { domainFilter })} />
          <AppButton label="بازگشت" variant="secondary" style={{ marginTop: 10 }} onPress={() => navigation.goBack()} />
        </Card>
      </ScreenContainer>
    );
  }

  if (!question) {
    return (
      <ScreenContainer>
        <AppText color={theme.color.textMuted}>در حال بارگذاری سؤال...</AppText>
      </ScreenContainer>
    );
  }

  const answered = selected !== null;
  const isCorrect = selected === question.correct_choice;

  const handleSelect = async (choice: ChoiceKey) => {
    if (answered) return;
    setSelected(choice);
    const correct = choice === question.correct_choice;
    await recordQuizAttempt(question.page_id, question.id, correct);
  };

  const handleContinue = async () => {
    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      await loadNext(usedIds);
    } else {
      const key = await domainFilterKey(domainFilter);
      const prevBest = await getBestStreak(key);
      await saveExamRecord(key, streak);
      setIsNewBest(streak > prevBest);
      setFinished(true);
    }
  };

  return (
    <ScreenContainer>
      <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: 14 }}>
        <AppText size={13} color={theme.color.textMuted}>
          {question.domain_name}
        </AppText>
        <AppText weight="semibold" color={theme.color.gold}>
          {`رکورد فعلی: ${toFaDigits(streak)}`}
        </AppText>
      </View>

      <Card>
        <AppText weight="semibold" size={17} style={{ marginBottom: 16 }}>
          {question.question}
        </AppText>

        {CHOICE_KEYS.map((key) => {
          const text = question[`choice_${key}` as const];
          const isThisCorrect = key === question.correct_choice;
          const isThisSelected = key === selected;

          let bg = 'transparent';
          let borderColor = theme.color.hairline;
          if (answered && isThisCorrect) {
            bg = theme.color.success + '22';
            borderColor = theme.color.success;
          } else if (answered && isThisSelected && !isThisCorrect) {
            bg = theme.color.danger + '22';
            borderColor = theme.color.danger;
          }

          return (
            <Pressable
              key={key}
              disabled={answered}
              onPress={() => handleSelect(key)}
              style={({ pressed }) => ({
                borderWidth: 1,
                borderColor,
                backgroundColor: bg,
                borderRadius: 10,
                padding: 13,
                marginBottom: 10,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <AppText weight={isThisSelected ? 'semibold' : 'regular'}>{text}</AppText>
            </Pressable>
          );
        })}

        {answered && (
          <View
            style={{
              marginTop: 6,
              padding: 12,
              borderRadius: 10,
              backgroundColor: (isCorrect ? theme.color.success : theme.color.danger) + '18',
            }}
          >
            <AppText weight="semibold" color={isCorrect ? theme.color.success : theme.color.danger} style={{ marginBottom: 4 }}>
              {isCorrect ? 'درست بود' : 'نادرست بود — آزمون اینجا تموم می‌شه'}
            </AppText>
            <AppText size={14} color={theme.color.textMuted}>
              {question.explanation}
            </AppText>
          </View>
        )}

        {answered && (
          <AppButton
            label={isCorrect ? 'سؤال بعدی' : 'مشاهده نتیجه نهایی'}
            onPress={handleContinue}
            style={{ marginTop: 16 }}
          />
        )}
      </Card>
    </ScreenContainer>
  );
}
