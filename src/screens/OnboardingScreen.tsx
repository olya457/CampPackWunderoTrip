import React, {useState} from 'react';
import {
  Image,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {assets} from '../assets';
import {PrimaryButton} from '../components/ui';
import {colors} from '../theme/colors';
import {bottomInset, pagePadding, topInset} from '../theme/layout';

type Props = {
  onFinish: () => void;
};

const slides = [
  {
    image: assets.onboarding.discover,
    icon: '⛺',
    eyebrow: 'DISCOVER',
    title: 'Find Your Perfect Campsite',
    text: 'Explore camping locations from mountain peaks to coastal retreats. Save your favorites and plan your next escape.',
  },
  {
    image: assets.onboarding.pack,
    icon: '🎒',
    eyebrow: 'PACK SMART',
    title: 'Never Forget Essential Gear',
    text: 'Use crafted packing checklists tailored to your trip type. Customize them, check off items, and head out prepared.',
  },
  {
    image: assets.onboarding.thrive,
    icon: '✨',
    eyebrow: 'THRIVE',
    title: 'Make Every Trip Unforgettable',
    text: 'Get expert tips, activity ideas, and camping quizzes whether you are a first-timer or a seasoned adventurer.',
  },
];

export const OnboardingScreen = ({onFinish}: Props) => {
  const [index, setIndex] = useState(0);
  const {width, height} = useWindowDimensions();
  const slide = slides[index];
  const horizontal = pagePadding(width);
  const compact = height < 720;
  const heroHeight = Math.max(285, Math.min(compact ? 340 : 430, height * 0.5));

  const next = () => {
    if (index === slides.length - 1) {
      onFinish();
      return;
    }
    setIndex(current => current + 1);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View pointerEvents="none" style={[styles.hero, {height: heroHeight}]}>
        <Image source={slide.image} resizeMode="cover" style={styles.heroImage} />
        <View style={styles.heroDim} />
      </View>
      <View pointerEvents="none" style={[styles.haze, {top: heroHeight - 118}]}>
        <View style={[styles.hazeBand, styles.hazeBandOne]} />
        <View style={[styles.hazeBand, styles.hazeBandTwo]} />
        <View style={[styles.hazeBand, styles.hazeBandThree]} />
        <View style={[styles.hazeBand, styles.hazeBandFour]} />
        <View style={[styles.hazeBand, styles.hazeBandFive]} />
      </View>
      <SafeAreaView style={styles.safe}>
        <View
          style={[
            styles.content,
            {
              paddingHorizontal: horizontal,
              paddingTop: topInset + 8,
              paddingBottom: bottomInset,
            },
          ]}>
          <Pressable accessibilityRole="button" onPress={onFinish} style={styles.skip}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
          <View style={styles.spacer} />
          <View style={[styles.copy, compact && styles.copyCompact]}>
            <View style={styles.eyebrowRow}>
              <View style={styles.emojiBox}>
                <Text style={styles.emoji}>{slide.icon}</Text>
              </View>
              <Text style={styles.eyebrow}>{slide.eyebrow}</Text>
            </View>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.text}>{slide.text}</Text>
            <View style={styles.bottomRow}>
              <View style={styles.dots}>
                {slides.map((item, dotIndex) => (
                  <View
                    key={item.title}
                    style={[styles.dot, index === dotIndex && styles.dotActive]}
                  />
                ))}
              </View>
              <PrimaryButton
                label={index === slides.length - 1 ? 'Get Started' : 'Next'}
                icon="➡️"
                tone={index === slides.length - 1 ? 'yellow' : 'blue'}
                onPress={next}
                style={styles.nextButton}
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background,
    flex: 1,
  },
  hero: {
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  heroImage: {
    height: '100%',
    width: '100%',
  },
  heroDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2, 10, 18, 0.16)',
  },
  haze: {
    height: 178,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  hazeBand: {
    backgroundColor: colors.background,
    flex: 1,
  },
  hazeBandOne: {
    opacity: 0.08,
  },
  hazeBandTwo: {
    opacity: 0.2,
  },
  hazeBandThree: {
    opacity: 0.42,
  },
  hazeBandFour: {
    opacity: 0.68,
  },
  hazeBandFive: {
    opacity: 1,
  },
  safe: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  skip: {
    alignSelf: 'flex-end',
    minHeight: 34,
    minWidth: 60,
    justifyContent: 'center',
  },
  skipText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'right',
  },
  spacer: {
    flex: 1,
  },
  copy: {
    paddingBottom: 6,
  },
  copyCompact: {
    paddingBottom: 0,
  },
  eyebrowRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  emojiBox: {
    alignItems: 'center',
    backgroundColor: '#143456',
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  emoji: {
    fontSize: 24,
  },
  eyebrow: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 3,
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 37,
    maxWidth: 330,
  },
  text: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 23,
    marginTop: 18,
    maxWidth: 340,
  },
  bottomRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 34,
  },
  dots: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  dot: {
    backgroundColor: '#1d4977',
    borderRadius: 5,
    height: 8,
    width: 8,
  },
  dotActive: {
    backgroundColor: colors.blue,
    width: 24,
  },
  nextButton: {
    minHeight: 52,
    minWidth: 126,
  },
});
