import React, {useMemo, useState} from 'react';
import {Pressable, Share, StyleSheet, Text, View} from 'react-native';
import {Card, Chip, Header, IconButton, Page, PrimaryButton, ProgressBar} from '../components/ui';
import {articles, quizQuestions} from '../data/content';
import {colors} from '../theme/colors';

type ArticlesScreenProps = {
  onOpenArticle: (id: string) => void;
  onStartQuiz: () => void;
};

export const ArticlesScreen = ({onOpenArticle, onStartQuiz}: ArticlesScreenProps) => (
  <Page withTabs>
    <Header eyebrow="Learn & Grow" title="Tips & Articles" />
    <Pressable onPress={onStartQuiz} style={({pressed}) => [styles.quizBanner, pressed && styles.pressed]}>
      <View style={styles.quizIcon}>
        <Text style={styles.quizIconText}>⚡</Text>
      </View>
      <View style={styles.quizTextWrap}>
        <Text style={styles.quizTitle}>Test Your Camping Knowledge</Text>
        <Text style={styles.quizMeta}>10 questions · ~3 min · All levels</Text>
      </View>
      <View style={styles.startPill}>
        <Text style={styles.startPillText}>Start</Text>
      </View>
    </Pressable>
    <Text style={styles.sectionLabel}>FEATURED ARTICLES</Text>
    <View style={styles.articleList}>
      {articles.map(article => (
        <Pressable
          accessibilityRole="button"
          key={article.id}
          onPress={() => onOpenArticle(article.id)}
          style={({pressed}) => [pressed && styles.pressed]}>
          <Card style={styles.articleCard}>
            <View style={styles.articleEmoji}>
              <Text style={styles.articleEmojiText}>{article.emoji}</Text>
            </View>
            <View style={styles.articleCopy}>
              <Text style={styles.articleTitle} numberOfLines={2}>
                {article.title}
              </Text>
              <Chip label={article.tag} tone={article.tag.includes('Safety') ? 'red' : 'green'} />
            </View>
            <Text style={styles.chevron}>➡️</Text>
          </Card>
        </Pressable>
      ))}
    </View>
  </Page>
);

type ArticleDetailScreenProps = {
  articleId: string;
  onBack: () => void;
};

export const ArticleDetailScreen = ({articleId, onBack}: ArticleDetailScreenProps) => {
  const article = articles.find(item => item.id === articleId) ?? articles[0];

  const shareArticle = () => {
    Share.share({
      title: article.title,
      message: `${article.title}\n\n${article.body.join('\n\n')}`,
    }).catch(() => undefined);
  };

  return (
    <Page>
      <View style={styles.detailTop}>
        <IconButton label="⬅️" onPress={onBack} />
        <IconButton label="📤" onPress={shareArticle} />
      </View>
      <Chip label={article.tag} tone="green" />
      <Text style={styles.detailTitle}>{article.title}</Text>
      <View style={styles.bodyBlock}>
        {article.body.map((paragraph, index) => (
          <Text key={`${article.id}-${index}`} style={styles.bodyText}>
            {paragraph}
          </Text>
        ))}
      </View>
    </Page>
  );
};

type QuizScreenProps = {
  quizBest: number;
  onBack: () => void;
  onComplete: (score: number) => void;
};

const quizSize = 10;

export const QuizScreen = ({quizBest, onBack, onComplete}: QuizScreenProps) => {
  const questions = useMemo(() => quizQuestions.slice(0, quizSize), []);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [done, setDone] = useState(false);

  const current = questions[index];
  const correct = answers.reduce(
    (score, answer, questionIndex) =>
      answer === questions[questionIndex].correctIndex ? score + 1 : score,
    0,
  );
  const liveScore =
    selected !== null && selected === current.correctIndex ? correct + 1 : correct;
  const progress = ((index + (selected === null ? 0 : 1)) / questions.length) * 100;

  const choose = (answerIndex: number) => {
    if (selected !== null) {
      return;
    }
    setSelected(answerIndex);
    setTimeout(() => {
      const nextAnswers = [...answers, answerIndex];
      if (index >= questions.length - 1) {
        const score = nextAnswers.reduce(
          (total, answer, questionIndex) =>
            answer === questions[questionIndex].correctIndex ? total + 1 : total,
          0,
        );
        setAnswers(nextAnswers);
        setDone(true);
        onComplete(score);
        return;
      }
      setAnswers(nextAnswers);
      setIndex(currentIndex => currentIndex + 1);
      setSelected(null);
    }, 720);
  };

  if (paused) {
    return (
      <Page scroll={false} contentStyle={styles.quizCentered}>
        <View style={styles.pauseIcon}>
          <Text style={styles.pauseText}>⏸️</Text>
        </View>
        <Text style={styles.pauseTitle}>Quiz Paused</Text>
        <Text style={styles.pauseSubtitle}>Take a breather — your progress is saved</Text>
        <PrimaryButton label="Resume Quiz" icon="▶️" onPress={() => setPaused(false)} style={styles.resumeButton} />
      </Page>
    );
  }

  if (done) {
    const score = Math.max(correct, quizBest);
    return (
      <Page>
        <View style={styles.resultWrap}>
          <ImageForResult />
          <Text style={styles.resultTitle}>Keep Learning!</Text>
          <Text style={styles.resultSubtitle}>
            You got {correct} out of {questions.length} questions right
          </Text>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreValue}>{correct}</Text>
            <Text style={styles.scoreTotal}>/ {questions.length}</Text>
          </View>
          <Card style={styles.recapCard}>
            <Text style={styles.sectionLabel}>ANSWER RECAP</Text>
            <View style={styles.recapGrid}>
              {answers.map((answer, questionIndex) => {
                const ok = answer === questions[questionIndex].correctIndex;
                return (
                  <View key={questions[questionIndex].id} style={[styles.recapDot, ok && styles.recapOk]}>
                    <Text style={[styles.recapText, ok && styles.recapTextOk]}>{questionIndex + 1}</Text>
                  </View>
                );
              })}
            </View>
          </Card>
          <Text style={styles.bestScore}>Best score: {score}/{questions.length}</Text>
          <PrimaryButton label="Home" onPress={onBack} />
        </View>
      </Page>
    );
  }

  return (
    <Page>
      <View style={styles.quizHeader}>
        <Text style={styles.quizScreenTitle}>Camping Quiz</Text>
        <IconButton label="⏸️" onPress={() => setPaused(true)} size={42} />
      </View>
      <View style={styles.questionMetaRow}>
        <Text style={styles.quizSmall}>Question {index + 1} of {questions.length}</Text>
        <Text style={styles.quizSmall}>{liveScore} correct</Text>
      </View>
      <ProgressBar value={progress} height={4} />
      <View style={styles.timerRow}>
        <View style={styles.timerBox}>
          <Text style={styles.timerText}>{20 - index}</Text>
        </View>
        <ProgressBar value={Math.max(16, 100 - index * 8)} height={4} />
      </View>
      <Card style={styles.questionCard}>
        <Text style={styles.questionLabel}>QUESTION {index + 1}</Text>
        <Text style={styles.questionText}>{current.question}</Text>
      </Card>
      <View style={styles.answers}>
        {current.answers.map((answer, answerIndex) => {
          const correctAnswer = selected !== null && answerIndex === current.correctIndex;
          const wrongAnswer = selected === answerIndex && answerIndex !== current.correctIndex;
          return (
            <Pressable
              accessibilityRole="button"
              disabled={selected !== null}
              key={answer}
              onPress={() => choose(answerIndex)}
              style={({pressed}) => [
                styles.answer,
                correctAnswer && styles.answerCorrect,
                wrongAnswer && styles.answerWrong,
                pressed && styles.pressed,
              ]}>
              <View style={styles.answerLetter}>
                <Text style={styles.answerLetterText}>
                  {wrongAnswer ? '❌' : correctAnswer ? '✅' : String.fromCharCode(65 + answerIndex)}
                </Text>
              </View>
              <Text style={[styles.answerText, correctAnswer && styles.answerTextGood, wrongAnswer && styles.answerTextBad]}>
                {answer}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Page>
  );
};

const ImageForResult = () => (
  <View style={styles.resultImageWrap}>
    <Text style={styles.resultImageEmoji}>🎒</Text>
    <Text style={styles.resultImageEmojiBack}>🏕️</Text>
  </View>
);

const styles = StyleSheet.create({
  quizBanner: {
    alignItems: 'center',
    backgroundColor: colors.blue,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 16,
    marginBottom: 28,
    minHeight: 132,
    padding: 20,
  },
  quizIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 14,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  quizIconText: {
    fontSize: 26,
  },
  quizTextWrap: {
    flex: 1,
  },
  quizTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 23,
  },
  quizMeta: {
    color: '#d1e9ff',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 20,
    marginTop: 6,
  },
  startPill: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  startPillText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '900',
  },
  sectionLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 3,
    marginBottom: 14,
  },
  articleList: {
    gap: 12,
  },
  articleCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
    minHeight: 112,
    padding: 16,
  },
  articleEmoji: {
    alignItems: 'center',
    backgroundColor: colors.panelDeep,
    borderColor: colors.borderSoft,
    borderRadius: 14,
    borderWidth: 1,
    height: 54,
    justifyContent: 'center',
    width: 54,
  },
  articleEmojiText: {
    fontSize: 24,
  },
  articleCopy: {
    flex: 1,
    gap: 10,
  },
  articleTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 19,
  },
  chevron: {
    color: colors.faint,
    fontSize: 26,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.78,
  },
  detailTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  detailTitle: {
    color: colors.text,
    fontSize: 27,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 36,
    marginTop: 16,
  },
  bodyBlock: {
    gap: 16,
    marginTop: 26,
  },
  bodyText: {
    color: colors.muted,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 25,
  },
  quizHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  quizScreenTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  questionMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  quizSmall: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  timerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  timerBox: {
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  timerText: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  questionCard: {
    marginTop: 26,
    padding: 20,
  },
  questionLabel: {
    color: colors.yellow,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 3,
    marginBottom: 16,
  },
  questionText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 26,
  },
  answers: {
    gap: 12,
    marginTop: 22,
  },
  answer: {
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 62,
    paddingHorizontal: 16,
  },
  answerCorrect: {
    backgroundColor: '#0e3a31',
    borderColor: colors.green,
  },
  answerWrong: {
    backgroundColor: '#321723',
    borderColor: colors.red,
  },
  answerLetter: {
    alignItems: 'center',
    backgroundColor: colors.panelSoft,
    borderRadius: 8,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  answerLetterText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '900',
  },
  answerText: {
    color: colors.text,
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  answerTextGood: {
    color: colors.green,
  },
  answerTextBad: {
    color: colors.red,
  },
  quizCentered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseIcon: {
    alignItems: 'center',
    backgroundColor: colors.panelSoft,
    borderRadius: 16,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  pauseText: {
    fontSize: 34,
  },
  pauseTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
    marginTop: 24,
  },
  pauseSubtitle: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 12,
    textAlign: 'center',
  },
  resumeButton: {
    marginTop: 34,
    minWidth: 190,
  },
  resultWrap: {
    alignItems: 'center',
    gap: 20,
  },
  resultImageWrap: {
    alignItems: 'center',
    height: 150,
    justifyContent: 'center',
    marginTop: 12,
    width: 210,
  },
  resultImageEmoji: {
    fontSize: 92,
  },
  resultImageEmojiBack: {
    fontSize: 70,
    opacity: 0.72,
    position: 'absolute',
    right: 20,
    top: 54,
  },
  resultTitle: {
    color: colors.yellow,
    fontSize: 22,
    fontWeight: '900',
  },
  resultSubtitle: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '700',
  },
  scoreCircle: {
    alignItems: 'center',
    borderColor: colors.yellow,
    borderRadius: 62,
    borderWidth: 3,
    height: 124,
    justifyContent: 'center',
    width: 124,
  },
  scoreValue: {
    color: colors.yellow,
    fontSize: 38,
    fontWeight: '900',
  },
  scoreTotal: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  recapCard: {
    alignSelf: 'stretch',
    padding: 16,
  },
  recapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recapDot: {
    alignItems: 'center',
    borderColor: colors.red,
    borderRadius: 9,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  recapOk: {
    backgroundColor: '#0d3b32',
    borderColor: colors.green,
  },
  recapText: {
    color: colors.red,
    fontSize: 13,
    fontWeight: '900',
  },
  recapTextOk: {
    color: colors.green,
  },
  bestScore: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '800',
  },
});
