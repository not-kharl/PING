import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { quizzes } from '../../data/quizzes';
import { useProgress } from '../../lib/progress';
import LabChallenge from '../../components/LabChallenge';
import { colors } from '../../theme';

export default function QuizScreen() {
  const { id } = useLocalSearchParams();
  const quiz = quizzes.find((q) => q.id === id);
  const { data, ready, isUnlocked, mark, saveScore } = useProgress();

  const [stage, setStage] = useState('questions'); // questions | result | lab
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);

  const header = (
    <Stack.Screen
      options={{
        title: 'Quiz',
        headerLeft: () => (
          <Pressable
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace('/quizzes')
            }
            hitSlop={12}
            style={{ marginRight: 12 }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </Pressable>
        ),
      }}
    />
  );

  if (!quiz)
    return (
      <>
        {header}
        <Text style={{ padding: 20 }}>Quiz not found.</Text>
      </>
    );

  if (!ready)
    return (
      <>
        {header}
        <View style={styles.center}>
          <Text style={styles.muted}>Loading...</Text>
        </View>
      </>
    );

  // Security gate: the lesson must have been viewed first
  if (!isUnlocked(quiz.id))
    return (
      <>
        {header}
        <View style={styles.center}>
          <Ionicons name="lock-closed" size={44} color={colors.orange} />
          <Text style={styles.lockTitle}>This quiz is locked</Text>
          <Text style={styles.muted}>
            View Lesson {quiz.lessonId} first, then come back to take the quiz.
          </Text>
          <Pressable
            style={styles.primary}
            onPress={() =>
              router.replace({
                pathname: '/lesson/[id]',
                params: { id: quiz.lessonId },
              })
            }
          >
            <Text style={styles.primaryText}>GO TO LESSON {quiz.lessonId}</Text>
          </Pressable>
        </View>
      </>
    );

  const total = quiz.questions.length;
  const passed = (score / total) * 100 >= quiz.passPercent;
  const doneKey = `quiz${quiz.id}`;

  const choose = (i) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === quiz.questions[index].answer) setScore((s) => s + 1);
  };

  const next = () => {
    if (index + 1 < total) {
      setIndex(index + 1);
      setPicked(null);
      return;
    }
    saveScore(quiz.id, score, total);
    if ((score / total) * 100 >= quiz.passPercent && !quiz.lab) mark(doneKey);
    setStage('result');
  };

  const retry = () => {
    setIndex(0);
    setPicked(null);
    setScore(0);
    setStage('questions');
  };

  // ---- Questions ----
  if (stage === 'questions') {
    const q = quiz.questions[index];
    const answered = index + (picked !== null ? 1 : 0);
    return (
      <>
        {header}
        <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
          <Text style={styles.eyebrow}>{quiz.title.toUpperCase()}</Text>
          <Text style={styles.muted}>
            Question {index + 1} of {total}
          </Text>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${(answered / total) * 100}%` }]} />
          </View>

          <Text style={styles.question}>{q.q}</Text>

          {q.options.map((opt, i) => {
            const right = picked !== null && i === q.answer;
            const wrong = picked === i && i !== q.answer;
            return (
              <Pressable
                key={i}
                disabled={picked !== null}
                onPress={() => choose(i)}
                style={[styles.option, right && styles.right, wrong && styles.wrong]}
              >
                <Text style={styles.optionText}>{opt}</Text>
              </Pressable>
            );
          })}

          {picked !== null && (
            <View style={styles.explain}>
              <Text style={styles.explainText}>
                {picked === q.answer ? 'Correct! ' : 'Not quite. '}
                {q.explain}
              </Text>
              <Pressable style={styles.primary} onPress={next}>
                <Text style={styles.primaryText}>
                  {index + 1 < total ? 'NEXT' : 'SEE RESULT'}
                </Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </>
    );
  }

  // ---- Result ----
  if (stage === 'result') {
    return (
      <>
        {header}
        <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
          <Text style={styles.eyebrow}>RESULT</Text>
          <Text style={styles.bigScore}>
            {score}/{total}
          </Text>
          <Text style={[styles.verdict, { color: passed ? '#2e9b57' : '#c62828' }]}>
            {passed ? 'You passed!' : `You need ${quiz.passPercent}% to pass. Try again.`}
          </Text>

          {passed && quiz.lab && (
            <Pressable style={styles.primary} onPress={() => setStage('lab')}>
              <Text style={styles.primaryText}>CONTINUE TO THE LAB</Text>
            </Pressable>
          )}
          {passed && !quiz.lab && (
            <Pressable style={styles.primary} onPress={() => router.replace('/quizzes')}>
              <Text style={styles.primaryText}>BACK TO QUIZZES</Text>
            </Pressable>
          )}
          {!passed && (
            <Pressable style={styles.primary} onPress={retry}>
              <Text style={styles.primaryText}>TRY AGAIN</Text>
            </Pressable>
          )}
        </ScrollView>
      </>
    );
  }

  // ---- Lab ----
  return (
    <>
      {header}
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.eyebrow}>PART 2 - HANDS-ON LAB</Text>
        <Text style={styles.body}>
          Build the network step by step. Each step unlocks after the one before it
          is done.
        </Text>
        <LabChallenge onComplete={() => mark(doneKey)} />
        {data[doneKey] && (
          <View style={styles.explain}>
            <Text style={[styles.verdict, { color: '#2e9b57' }]}>
              Quiz complete! Your progress has been updated.
            </Text>
            <Pressable style={styles.primary} onPress={() => router.replace('/quizzes')}>
              <Text style={styles.primaryText}>BACK TO QUIZZES</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bgLight },
  content: { padding: 20, width: '100%', maxWidth: 900, alignSelf: 'center' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 10,
    backgroundColor: colors.bgLight,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.orange,
    letterSpacing: 2,
    marginBottom: 4,
  },
  muted: { color: colors.muted, fontSize: 14, textAlign: 'center' },
  body: { fontSize: 15, lineHeight: 22, color: colors.text, marginBottom: 14 },
  lockTitle: { fontSize: 20, fontWeight: '700', color: colors.navy },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.gray, marginVertical: 12 },
  fill: { height: 8, borderRadius: 4, backgroundColor: colors.orange },
  question: { fontSize: 18, fontWeight: '700', color: colors.navy, marginBottom: 14, lineHeight: 26 },
  option: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray,
    borderRadius: 6,
    padding: 14,
    marginBottom: 10,
  },
  right: { borderColor: '#2e9b57', backgroundColor: '#e8f6ee' },
  wrong: { borderColor: '#c62828', backgroundColor: '#fdecea' },
  optionText: { fontSize: 15, color: colors.text },
  explain: { marginTop: 10, gap: 12 },
  explainText: { fontSize: 14, lineHeight: 21, color: colors.text },
  primary: {
    backgroundColor: colors.orange,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryText: { color: colors.white, fontWeight: '700', letterSpacing: 2, fontSize: 13 },
  bigScore: { fontSize: 56, fontWeight: '300', color: colors.navy, marginTop: 8 },
  verdict: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
});