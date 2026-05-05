import React from 'react';
import {Alert, Pressable, StyleSheet, Switch, Text, View} from 'react-native';
import {Card, Header, Page} from '../components/ui';
import {packingTemplates, quizQuestions} from '../data/content';
import {colors} from '../theme/colors';
import type {AppState} from '../types/models';

type SettingsScreenProps = {
  state: AppState;
  onTogglePush: () => void;
  onClearAll: () => void;
};

export const SettingsScreen = ({state, onTogglePush, onClearAll}: SettingsScreenProps) => {
  const checkedItems = Object.values(state.checklistProgress).reduce(
    (sum, items) => sum + items.length,
    0,
  );
  const totalTemplateItems = packingTemplates.reduce(
    (sum, template) => sum + template.items.length,
    0,
  );

  const stats = [
    {label: 'Saved', value: state.savedLocationIds.length, max: 8, color: colors.blue},
    {label: 'Packed', value: checkedItems, max: Math.max(totalTemplateItems, 1), color: colors.cyan},
    {label: 'Ideas', value: state.likedIdeaIds.length, max: 12, color: colors.orange},
    {label: 'Quiz', value: state.quizBest, max: Math.min(10, quizQuestions.length), color: colors.yellow},
  ];

  const clear = () => {
    Alert.alert(
      'Clear all data?',
      'This action will permanently delete your saved camping locations, packing checklists, activity ideas, progress, and app preferences. This cannot be undone',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Clear', style: 'destructive', onPress: onClearAll},
      ],
    );
  };

  return (
    <Page withTabs>
      <Header title="Settings" />
      <Text style={styles.sectionLabel}>PREFERENCES</Text>
      <Card style={styles.preferenceRow}>
        <View style={styles.preferenceIcon}>
          <Text style={styles.preferenceEmoji}>🔔</Text>
        </View>
        <View style={styles.preferenceText}>
          <Text style={styles.preferenceTitle}>Push Notifications</Text>
          <Text style={styles.preferenceSubtitle}>Trip reminders & tips</Text>
        </View>
        <Switch
          value={state.pushEnabled}
          onValueChange={onTogglePush}
          trackColor={{false: '#18314f', true: colors.blue}}
          thumbColor={colors.white}
        />
      </Card>
      <Text style={[styles.sectionLabel, styles.statsLabel]}>TRIP STATS</Text>
      <Card style={styles.statsCard}>
        <View style={styles.statsHeader}>
          <View>
            <Text style={styles.statsTitle}>Saved Progress</Text>
            <Text style={styles.statsSubtitle}>Everything stays after restart</Text>
          </View>
          <Text style={styles.statsEmoji}>⛺</Text>
        </View>
        <View style={styles.chart}>
          {stats.map(item => {
            const height = Math.max(8, Math.min(92, (item.value / item.max) * 92));
            return (
              <View key={item.label} style={styles.barWrap}>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, {height, backgroundColor: item.color}]} />
                </View>
                <Text style={styles.barValue}>{item.value}</Text>
                <Text style={styles.barLabel}>{item.label}</Text>
              </View>
            );
          })}
        </View>
      </Card>
      <Text style={[styles.sectionLabel, styles.aboutLabel]}>ABOUT</Text>
      <Pressable onPress={clear} style={({pressed}) => [pressed && styles.pressed]}>
        <Card style={styles.clearRow}>
          <View style={styles.clearIcon}>
            <Text style={styles.clearEmoji}>🗑️</Text>
          </View>
          <Text style={styles.clearText}>Clear All Data</Text>
        </Card>
      </Pressable>
    </Page>
  );
};

const styles = StyleSheet.create({
  sectionLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 3,
    marginBottom: 14,
  },
  preferenceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
    minHeight: 72,
    padding: 16,
  },
  preferenceIcon: {
    alignItems: 'center',
    backgroundColor: colors.panelSoft,
    borderColor: colors.border,
    borderRadius: 13,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  preferenceEmoji: {
    fontSize: 22,
  },
  preferenceText: {
    flex: 1,
  },
  preferenceTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  preferenceSubtitle: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 5,
  },
  statsLabel: {
    marginTop: 34,
  },
  statsCard: {
    padding: 18,
  },
  statsHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statsTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  statsSubtitle: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 5,
  },
  statsEmoji: {
    fontSize: 32,
  },
  chart: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 14,
    height: 154,
    justifyContent: 'space-between',
    marginTop: 20,
  },
  barWrap: {
    alignItems: 'center',
    flex: 1,
    gap: 7,
  },
  barTrack: {
    backgroundColor: colors.panelDeep,
    borderColor: colors.borderSoft,
    borderRadius: 10,
    borderWidth: 1,
    height: 92,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    width: '100%',
  },
  barFill: {
    borderRadius: 10,
    width: '100%',
  },
  barValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  barLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800',
  },
  aboutLabel: {
    marginTop: 34,
  },
  clearRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
    minHeight: 72,
    padding: 16,
  },
  clearIcon: {
    alignItems: 'center',
    backgroundColor: colors.panelSoft,
    borderColor: colors.border,
    borderRadius: 13,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  clearEmoji: {
    fontSize: 21,
  },
  clearText: {
    color: colors.red,
    fontSize: 15,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.78,
  },
});
