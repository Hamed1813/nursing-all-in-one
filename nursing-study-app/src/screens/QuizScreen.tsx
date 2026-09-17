import React, { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenContainer } from '../components/ScreenContainer';
import { AppText } from '../components/AppText';
import { AppButton, Card, ProgressBar } from '../components/UI';
import { EightPointStar, OrnamentalDivider } from '../components/PersianOrnament';
import { useApp } from '../context/AppContext';
import { applyLeitnerResult, getQuestionsForPage, recordQuizAttempt } from '../db/queries';
import { ChoiceKey, Question } from '../types';
import { toFaDigits } from '../theme/theme';
import { SharedStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<SharedStackParamList, 'Quiz'>;
type R = RouteProp<SharedStackParamList, 'Quiz'>;

const CHOICE_KEYS: ChoiceKey[] = ['a', 'b', 'c', 'd'];

export function QuizScreen() {
  const { theme } = useApp();
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const { pageId } = route.params;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<ChoiceKey | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    getQuestionsForPage(pageId).then(setQuestions);
  }, [pageId]);

  if (questions.length === 0) {
    return (
      <ScreenContainer>
        <AppText color={theme.color.textMuted}>در حال بارگذاری سؤالات...</AppText>
      </ScreenContainer>
    );
  }

  if (finished) {
    const passed = correctCount >= 4;
    return (
      <ScreenContainer>
        <Card accentColor={passed ? theme.color.success : theme.color.due}>
          <AppText weight="display" size={22} center style={{ marginBottom: 4 }}>
            نتیجه این صفحه
          </AppText>
          <OrnamentalDivider color={passed ? theme.color.success : theme.color.due} />
          <AppText weight="display" size={34} center color={passed ? theme.color.success : theme.color.due}>
            {`${toFaDigits(correctCount)} / ${toFaDigits(questions.length)}`}
          </AppText>
          <AppText size={14} center color={theme.color.textMuted} style={{ marginBottom: 14 }}>
            سؤال درست
          </AppText>
          <AppText color={theme.color.textMuted} style={{ marginBottom: 18 }}>
            {passed
              ? 'عالیه! این صفحه در جعبه لایتنر به مرحله بعد رفت و دیرتر برای بازخوانی نشونت داده می‌شه.'
              : 'اشکالی نداره — این صفحه زودتر برای بازخوانی دوباره بهت پیشنهاد می‌شه.'}
          </AppText>
          <AppButton ornament label="بازگشت" onPress={() => navigation.popToTop()} />
          <AppButton
            label="مرور دوباره همین سؤالات"
            variant="secondary"
            style={{ marginTop: 10 }}
            onPress={() => {
              setIndex(0);
              setSelected(null);
              setCorrectCount(0);
              setFinished(false);
            }}
          />
        </Card>
      </ScreenContainer>
    );
  }

  const question = questions[index];
  const answered = selected !== null;
  const isCorrect = selected === question.correct_choice;

  const handleSelect = async (choice: ChoiceKey) => {
    if (answered) return;
    setSelected(choice);
    const correct = choice === question.correct_choice;
    if (correct) setCorrectCount((c) => c + 1);
    await recordQuizAttempt(pageId, question.id, correct);
  };

  const handleNext = async () => {
    if (index + 1 < questions.length) {
      setIndex((i) => i + 1);
      setSelected(null);
    } else {
      await applyLeitnerResult(pageId, correctCount);
      setFinished(true);
    }
  };

  return (
    <ScreenContainer>
      <AppText size={13} color={theme.color.textMuted} style={{ marginBottom: 8 }}>
        {`سؤال ${toFaDigits(index + 1)} از ${toFaDigits(questions.length)}`}
      </AppText>
      <ProgressBar progress={(index + (answered ? 1 : 0)) / questions.length} />

      <Card style={{ marginTop: 18 }}>
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
              {isCorrect ? 'درست بود' : 'نادرست بود'}
            </AppText>
            <AppText size={14} color={theme.color.textMuted}>
              {question.explanation}
            </AppText>
          </View>
        )}

        {answered && (
          <AppButton
            label={index + 1 < questions.length ? 'سؤال بعدی' : 'مشاهده نتیجه'}
            onPress={handleNext}
            style={{ marginTop: 16 }}
          />
        )}
      </Card>
    </ScreenContainer>
  );
}
