import React from 'react';
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';
import {assets} from '../assets';
import {colors} from '../theme/colors';
import {bottomInset, pagePadding, tabBarHeight, tabBottom, topInset} from '../theme/layout';
import type {TabKey} from '../types/models';

type PageProps = {
  children: React.ReactNode;
  withTabs?: boolean;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
};

export const Page = ({children, withTabs, scroll = true, contentStyle}: PageProps) => {
  const {width} = useWindowDimensions();
  const horizontal = pagePadding(width);
  const bottom = withTabs ? tabBarHeight + tabBottom + 26 : bottomInset + 22;
  const content = [
    styles.pageContent,
    {
      flex: scroll ? undefined : 1,
      paddingHorizontal: horizontal,
      paddingTop: topInset + 16,
      paddingBottom: bottom,
    },
    contentStyle,
  ];

  return (
    <SafeAreaView style={styles.safe}>
      {scroll ? (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={content}>
          {children}
        </ScrollView>
      ) : (
        <View style={content}>{children}</View>
      )}
    </SafeAreaView>
  );
};

type HeaderProps = {
  eyebrow?: string;
  title: string;
  right?: React.ReactNode;
};

export const Header = ({eyebrow, title, right}: HeaderProps) => (
  <View style={styles.header}>
    <View style={styles.headerText}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
    </View>
    {right}
  </View>
);

type IconButtonProps = {
  label: string;
  onPress?: () => void;
  active?: boolean;
  danger?: boolean;
  size?: number;
  disabled?: boolean;
};

export const IconButton = ({
  label,
  onPress,
  active,
  danger,
  size = 46,
  disabled,
}: IconButtonProps) => (
  <Pressable
    accessibilityRole="button"
    disabled={disabled}
    onPress={onPress}
    style={({pressed}) => [
      styles.iconButton,
      {
        width: size,
        height: size,
        borderRadius: Math.min(16, size / 2),
        opacity: disabled ? 0.45 : pressed ? 0.75 : 1,
        backgroundColor: active ? colors.blue : colors.panel,
        borderColor: active ? colors.blue : danger ? colors.red : colors.border,
      },
    ]}>
    <Text style={[styles.iconButtonText, danger && styles.dangerText]}>{label}</Text>
  </Pressable>
);

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  tone?: 'blue' | 'yellow' | 'orange' | 'muted' | 'danger';
  icon?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export const PrimaryButton = ({
  label,
  onPress,
  tone = 'blue',
  icon,
  disabled,
  style,
}: PrimaryButtonProps) => (
  <Pressable
    accessibilityRole="button"
    disabled={disabled}
    onPress={onPress}
    style={({pressed}) => [
      styles.primaryButton,
      tone === 'yellow' && styles.yellowButton,
      tone === 'orange' && styles.orangeButton,
      tone === 'muted' && styles.mutedButton,
      tone === 'danger' && styles.dangerButton,
      disabled && styles.disabledButton,
      pressed && !disabled && styles.pressed,
      style,
    ]}>
    {icon ? <Text style={styles.primaryIcon}>{icon}</Text> : null}
    <Text
      style={[
        styles.primaryLabel,
        tone === 'yellow' && styles.yellowLabel,
        tone === 'danger' && styles.primaryLabel,
      ]}
      numberOfLines={1}
      adjustsFontSizeToFit>
      {label}
    </Text>
  </Pressable>
);

type SegmentedProps<T extends string> = {
  options: {key: T; label: string}[];
  value: T;
  onChange: (key: T) => void;
};

export const SegmentedControl = <T extends string>({
  options,
  value,
  onChange,
}: SegmentedProps<T>) => (
  <View style={styles.segmented}>
    {options.map(option => {
      const active = option.key === value;
      return (
        <Pressable
          accessibilityRole="button"
          key={option.key}
          onPress={() => onChange(option.key)}
          style={({pressed}) => [
            styles.segment,
            active && styles.segmentActive,
            pressed && styles.pressed,
          ]}>
          <Text
            style={[styles.segmentText, active && styles.segmentTextActive]}
            numberOfLines={1}
            adjustsFontSizeToFit>
            {option.label}
          </Text>
        </Pressable>
      );
    })}
  </View>
);

type ProgressBarProps = {
  value: number;
  height?: number;
};

export const ProgressBar = ({value, height = 4}: ProgressBarProps) => (
  <View style={[styles.progressTrack, {height, borderRadius: height}]}>
    <View
      style={[
        styles.progressFill,
        {width: `${Math.max(0, Math.min(100, value))}%`, borderRadius: height},
      ]}
    />
  </View>
);

type ChipProps = {
  label: string;
  tone?: 'cyan' | 'green' | 'red' | 'yellow' | 'blue';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export const Chip = ({label, tone = 'blue', style, textStyle}: ChipProps) => (
  <View
    style={[
      styles.chip,
      tone === 'cyan' && styles.chipCyan,
      tone === 'green' && styles.chipGreen,
      tone === 'red' && styles.chipRed,
      tone === 'yellow' && styles.chipYellow,
      style,
    ]}>
    <Text
      style={[
        styles.chipText,
        tone === 'cyan' && styles.chipTextCyan,
        tone === 'green' && styles.chipTextGreen,
        tone === 'red' && styles.chipTextRed,
        tone === 'yellow' && styles.chipTextYellow,
        textStyle,
      ]}>
      {label}
    </Text>
  </View>
);

type EmptyStateProps = {
  title: string;
  subtitle: string;
};

export const EmptyState = ({title, subtitle}: EmptyStateProps) => (
  <View style={styles.emptyState}>
    <Image source={assets.empty} style={styles.emptyImage} resizeMode="contain" />
    <Text style={styles.emptyTitle}>{title}</Text>
    <Text style={styles.emptySubtitle}>{subtitle}</Text>
  </View>
);

type BottomTabBarProps = {
  value: TabKey;
  onChange: (key: TabKey) => void;
};

const tabs: {key: TabKey; icon: string; label: string}[] = [
  {key: 'locations', icon: '📍', label: 'Locations'},
  {key: 'checklists', icon: '☑️', label: 'Checklists'},
  {key: 'articles', icon: '📖', label: 'Articles'},
  {key: 'ideas', icon: '💡', label: 'Ideas'},
  {key: 'settings', icon: '⚙️', label: 'Settings'},
];

export const BottomTabBar = ({value, onChange}: BottomTabBarProps) => (
  <View style={[styles.tabBar, {bottom: tabBottom}]}>
    {tabs.map(tab => {
      const active = tab.key === value;
      return (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={tab.label}
          key={tab.key}
          onPress={() => onChange(tab.key)}
          style={({pressed}) => [styles.tabItem, pressed && styles.pressed]}>
          <View style={[styles.tabIconWrap, active && styles.tabIconActive]}>
            <Text style={[styles.tabIcon, active && styles.tabIconTextActive]}>
              {tab.icon}
            </Text>
          </View>
          <View style={[styles.tabDot, active && styles.tabDotActive]} />
        </Pressable>
      );
    })}
  </View>
);

export const Card = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) => <View style={[styles.card, style]}>{children}</View>;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  pageContent: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  headerText: {
    flex: 1,
    paddingRight: 12,
  },
  eyebrow: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: 27,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 33,
  },
  iconButton: {
    alignItems: 'center',
    borderWidth: 1,
    justifyContent: 'center',
  },
  iconButtonText: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  dangerText: {
    color: colors.red,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.blue,
    borderRadius: 15,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 54,
    paddingHorizontal: 18,
  },
  yellowButton: {
    backgroundColor: colors.yellow,
  },
  orangeButton: {
    backgroundColor: colors.orange,
  },
  mutedButton: {
    backgroundColor: '#1c3c63',
  },
  dangerButton: {
    backgroundColor: '#241725',
    borderColor: colors.red,
    borderWidth: 1,
  },
  disabledButton: {
    opacity: 0.5,
  },
  primaryIcon: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '900',
  },
  primaryLabel: {
    color: colors.white,
    flexShrink: 1,
    fontSize: 15,
    fontWeight: '900',
  },
  yellowLabel: {
    color: colors.black,
  },
  pressed: {
    opacity: 0.78,
  },
  segmented: {
    backgroundColor: colors.panel,
    borderRadius: 11,
    flexDirection: 'row',
    gap: 4,
    minHeight: 48,
    padding: 4,
  },
  segment: {
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  segmentActive: {
    backgroundColor: colors.blue,
  },
  segmentText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '800',
  },
  segmentTextActive: {
    color: colors.white,
  },
  progressTrack: {
    backgroundColor: '#163456',
    overflow: 'hidden',
    width: '100%',
  },
  progressFill: {
    backgroundColor: colors.cyan,
    height: '100%',
  },
  chip: {
    alignSelf: 'flex-start',
    backgroundColor: '#0b223b',
    borderColor: colors.border,
    borderRadius: 100,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipCyan: {
    borderColor: '#126b75',
  },
  chipGreen: {
    borderColor: '#0b8251',
  },
  chipRed: {
    borderColor: '#763245',
  },
  chipYellow: {
    borderColor: '#8b7515',
  },
  chipText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  chipTextCyan: {
    color: colors.cyan,
  },
  chipTextGreen: {
    color: colors.green,
  },
  chipTextRed: {
    color: colors.red,
  },
  chipTextYellow: {
    color: colors.yellow,
  },
  emptyState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    minHeight: 410,
    paddingVertical: 30,
  },
  emptyImage: {
    height: 210,
    marginBottom: 10,
    width: 260,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
    marginTop: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    textAlign: 'center',
  },
  tabBar: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(13, 34, 57, 0.96)',
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    height: tabBarHeight,
    justifyContent: 'space-around',
    left: 16,
    paddingHorizontal: 10,
    position: 'absolute',
    right: 16,
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.28,
    shadowRadius: 16,
  },
  tabItem: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
    justifyContent: 'center',
  },
  tabIconWrap: {
    alignItems: 'center',
    borderRadius: 15,
    height: 40,
    justifyContent: 'center',
    width: 44,
  },
  tabIconActive: {
    backgroundColor: '#143a64',
  },
  tabIcon: {
    fontSize: 21,
    opacity: 0.5,
  },
  tabIconTextActive: {
    opacity: 1,
  },
  tabDot: {
    backgroundColor: 'transparent',
    borderRadius: 4,
    height: 4,
    width: 4,
  },
  tabDotActive: {
    backgroundColor: colors.blue,
  },
  card: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
  },
});
