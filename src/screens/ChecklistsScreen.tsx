import React, {useMemo, useState} from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Card, EmptyState, Header, IconButton, Page, PrimaryButton, ProgressBar, SegmentedControl} from '../components/ui';
import {packingTemplates} from '../data/content';
import {colors} from '../theme/colors';
import type {AppState, CustomChecklist, PackingTemplate} from '../types/models';

type ChecklistsScreenProps = {
  state: AppState;
  onOpenTemplate: (id: string) => void;
  onOpenCustom: (id: string) => void;
  onCreateCustom: (title: string, emoji: string) => void;
};

const customEmojis = ['📦', '🏕️', '🎒', '🧗', '🌿', '🔦', '🪓', '🎣', '⛰️', '⭐'];
const letterRows = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
const numberRows = ['1234567890', '-_/&()', '.,!?'];
const titleLimit = 36;

export const ChecklistsScreen = ({
  state,
  onOpenTemplate,
  onOpenCustom,
  onCreateCustom,
}: ChecklistsScreenProps) => {
  const [mode, setMode] = useState<'templates' | 'mine'>('templates');
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState(customEmojis[0]);
  const [keyboardMode, setKeyboardMode] = useState<'letters' | 'numbers'>('letters');
  const [shift, setShift] = useState(true);

  const appendTitle = (value: string) => {
    setTitle(current => {
      if (current.length >= titleLimit) {
        return current;
      }
      const shouldCapitalize =
        keyboardMode === 'letters' && (shift || current.length === 0 || current.endsWith(' '));
      const next = shouldCapitalize ? value.toUpperCase() : value;
      return `${current}${next}`.slice(0, titleLimit);
    });
    if (keyboardMode === 'letters' && shift) {
      setShift(false);
    }
  };

  const eraseTitle = () => {
    setTitle(current => current.slice(0, -1));
  };

  const addSpace = () => {
    setTitle(current => {
      if (!current || current.endsWith(' ') || current.length >= titleLimit) {
        return current;
      }
      return `${current} `.slice(0, titleLimit);
    });
    setShift(true);
  };

  const create = () => {
    const trimmed = title.trim();
    if (!trimmed) {
      return;
    }
    onCreateCustom(trimmed, emoji);
    setTitle('');
    setEmoji(customEmojis[0]);
    setKeyboardMode('letters');
    setShift(true);
    setModalVisible(false);
  };

  return (
    <Page withTabs>
      <Header
        eyebrow="Pack Smart"
        title="Checklists"
        right={<IconButton label="➕" active onPress={() => setModalVisible(true)} />}
      />
      <SegmentedControl
        value={mode}
        onChange={setMode}
        options={[
          {key: 'templates', label: 'Templates'},
          {key: 'mine', label: `My Lists (${state.customChecklists.length})`},
        ]}
      />
      <View style={styles.list}>
        {mode === 'templates' ? (
          packingTemplates.map(template => (
            <ChecklistSummary
              key={template.id}
              list={template}
              completed={state.checklistProgress[template.id]?.length ?? 0}
              total={template.items.length + (state.checklistExtras[template.id]?.length ?? 0)}
              onPress={() => onOpenTemplate(template.id)}
            />
          ))
        ) : state.customChecklists.length === 0 ? (
          <EmptyState title="No lists yet" subtitle="Tap + to create your first packing list" />
        ) : (
          state.customChecklists.map(list => (
            <ChecklistSummary
              key={list.id}
              list={list}
              completed={state.checklistProgress[`custom:${list.id}`]?.length ?? 0}
              total={list.items.length}
              onPress={() => onOpenCustom(list.id)}
            />
          ))
        )}
      </View>
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.modalShade} onPress={() => setModalVisible(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>New Checklist</Text>
              <Pressable onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <Text style={styles.closeText}>✖️</Text>
              </Pressable>
            </View>
            <Text style={styles.inputLabel}>NAME</Text>
            <View style={styles.fakeInput}>
              <Text
                style={[styles.fakeInputText, !title && styles.fakePlaceholder]}
                numberOfLines={1}>
                {title || 'e.g. Weekend Hiking Trip'}
              </Text>
              <Text style={styles.inputCounter}>
                {title.length}/{titleLimit}
              </Text>
            </View>
            <CompactKeyboard
              mode={keyboardMode}
              shift={shift}
              onToggleMode={() =>
                setKeyboardMode(current => (current === 'letters' ? 'numbers' : 'letters'))
              }
              onToggleShift={() => setShift(current => !current)}
              onKey={appendTitle}
              onSpace={addSpace}
              onBackspace={eraseTitle}
            />
            <Text style={styles.inputLabel}>ICON</Text>
            <View style={styles.emojiGrid}>
              {customEmojis.map(item => (
                <Pressable
                  key={item}
                  onPress={() => setEmoji(item)}
                  style={[styles.emojiPick, emoji === item && styles.emojiPickActive]}>
                  <Text style={styles.emojiPickText}>{item}</Text>
                </Pressable>
              ))}
            </View>
            <PrimaryButton label="Create Checklist" icon="➕" onPress={create} disabled={!title.trim()} />
          </View>
        </View>
      </Modal>
    </Page>
  );
};

const CompactKeyboard = ({
  mode,
  shift,
  onToggleMode,
  onToggleShift,
  onKey,
  onSpace,
  onBackspace,
}: {
  mode: 'letters' | 'numbers';
  shift: boolean;
  onToggleMode: () => void;
  onToggleShift: () => void;
  onKey: (value: string) => void;
  onSpace: () => void;
  onBackspace: () => void;
}) => {
  const rows = mode === 'letters' ? letterRows : numberRows;

  return (
    <View style={styles.keyboard}>
      {rows.map((row, rowIndex) => (
        <View key={`${mode}-${row}`} style={[styles.keyRow, rowIndex === 1 && styles.keyRowIndented]}>
          {row.split('').map(item => {
            const label = mode === 'letters' && shift ? item.toUpperCase() : item;
            return (
              <Pressable
                key={item}
                onPress={() => onKey(item)}
                style={({pressed}) => [styles.key, pressed && styles.pressed]}>
                <Text style={styles.keyText}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
      ))}
      <View style={styles.keyRow}>
        <Pressable onPress={onToggleMode} style={({pressed}) => [styles.controlKey, pressed && styles.pressed]}>
          <Text style={styles.controlKeyText}>{mode === 'letters' ? '123' : 'ABC'}</Text>
        </Pressable>
        <Pressable onPress={onToggleShift} style={({pressed}) => [styles.controlKey, shift && styles.controlKeyActive, pressed && styles.pressed]}>
          <Text style={styles.controlKeyText}>⬆️</Text>
        </Pressable>
        <Pressable onPress={onSpace} style={({pressed}) => [styles.spaceKey, pressed && styles.pressed]}>
          <Text style={styles.controlKeyText}>space</Text>
        </Pressable>
        <Pressable onPress={onBackspace} style={({pressed}) => [styles.controlKey, pressed && styles.pressed]}>
          <Text style={styles.controlKeyText}>⌫</Text>
        </Pressable>
      </View>
    </View>
  );
};

const ChecklistSummary = ({
  list,
  completed,
  total,
  onPress,
}: {
  list: PackingTemplate | CustomChecklist;
  completed: number;
  total: number;
  onPress: () => void;
}) => {
  const percent = total ? Math.round((completed / total) * 100) : 0;

  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({pressed}) => [pressed && styles.pressed]}>
      <Card style={styles.summaryCard}>
        <View style={styles.summaryIcon}>
          <Text style={styles.summaryEmoji}>{list.emoji}</Text>
        </View>
        <View style={styles.summaryBody}>
          <Text style={styles.summaryTitle} numberOfLines={1}>
            {list.title}
          </Text>
          <Text style={styles.summaryMeta}>
            {completed}/{total} items · {percent}% done
          </Text>
          <ProgressBar value={percent} height={3} />
        </View>
        <Text style={styles.chevron}>➡️</Text>
      </Card>
    </Pressable>
  );
};

type ChecklistDetailScreenProps = {
  state: AppState;
  checklistId: string;
  isCustom: boolean;
  onBack: () => void;
  onToggleItem: (key: string, item: string) => void;
  onReset: (key: string) => void;
};

export const ChecklistDetailScreen = ({
  state,
  checklistId,
  isCustom,
  onBack,
  onToggleItem,
  onReset,
}: ChecklistDetailScreenProps) => {
  const key = isCustom ? `custom:${checklistId}` : checklistId;
  const template = packingTemplates.find(item => item.id === checklistId);
  const custom = state.customChecklists.find(item => item.id === checklistId);
  const list = isCustom ? custom : template;

  const items = useMemo(() => {
    if (!list) {
      return [];
    }
    if (isCustom) {
      return (list as CustomChecklist).items;
    }
    return [...(list as PackingTemplate).items, ...(state.checklistExtras[checklistId] ?? [])];
  }, [checklistId, isCustom, list, state.checklistExtras]);

  const completed = state.checklistProgress[key] ?? [];
  const percent = items.length ? Math.round((completed.length / items.length) * 100) : 0;

  if (!list) {
    return (
      <Page>
        <Header title="Checklist" right={<IconButton label="⬅️" onPress={onBack} />} />
        <EmptyState title="List not found" subtitle="Go back and choose another checklist" />
      </Page>
    );
  }

  return (
    <Page scroll>
      <View style={styles.detailHeader}>
        <IconButton label="⬅️" onPress={onBack} />
        <View style={styles.detailTitleWrap}>
          <Text
            style={styles.detailTitle}
            numberOfLines={2}
            adjustsFontSizeToFit
            minimumFontScale={0.82}>
            {list.emoji} {list.title}
          </Text>
          <Text style={styles.detailMeta}>
            {completed.length}/{items.length} items completed
          </Text>
        </View>
        <IconButton label="🔄" onPress={() => onReset(key)} size={42} />
      </View>
      <ProgressBar value={percent} />
      <View style={styles.itemList}>
        {items.map(item => {
          const checked = completed.includes(item);
          return (
            <Pressable
              key={item}
              accessibilityRole="checkbox"
              accessibilityState={{checked}}
              onPress={() => onToggleItem(key, item)}
              style={({pressed}) => [styles.itemRow, checked && styles.itemRowDone, pressed && styles.pressed]}>
              <View style={[styles.checkbox, checked && styles.checkboxDone]}>
                {checked ? <Text style={styles.checkmark}>✅</Text> : null}
              </View>
              <Text style={[styles.itemText, checked && styles.itemTextDone]}>{item}</Text>
            </Pressable>
          );
        })}
      </View>
    </Page>
  );
};

const styles = StyleSheet.create({
  list: {
    gap: 14,
    marginTop: 16,
  },
  summaryCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
    padding: 16,
  },
  summaryIcon: {
    alignItems: 'center',
    backgroundColor: '#102c4c',
    borderColor: colors.border,
    borderRadius: 15,
    borderWidth: 1,
    height: 54,
    justifyContent: 'center',
    width: 54,
  },
  summaryEmoji: {
    fontSize: 25,
  },
  summaryBody: {
    flex: 1,
    gap: 8,
  },
  summaryTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  summaryMeta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  chevron: {
    color: colors.faint,
    fontSize: 28,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.78,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2, 7, 13, 0.76)',
  },
  sheet: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    gap: 14,
    padding: 20,
  },
  sheetHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sheetTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  closeButton: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  closeText: {
    color: colors.muted,
    fontSize: 28,
  },
  inputLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  fakeInput: {
    alignItems: 'center',
    backgroundColor: colors.panelSoft,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  fakeInputText: {
    color: colors.text,
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  fakePlaceholder: {
    color: '#708aa8',
    fontWeight: '600',
  },
  inputCounter: {
    color: colors.faint,
    fontSize: 11,
    fontWeight: '800',
  },
  keyboard: {
    backgroundColor: 'rgba(8, 26, 44, 0.72)',
    borderColor: colors.borderSoft,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
    padding: 8,
  },
  keyRow: {
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
  },
  keyRowIndented: {
    paddingHorizontal: 12,
  },
  key: {
    alignItems: 'center',
    backgroundColor: colors.panelSoft,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    height: 30,
    justifyContent: 'center',
  },
  keyText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  controlKey: {
    alignItems: 'center',
    backgroundColor: colors.panelSoft,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 32,
    justifyContent: 'center',
    minWidth: 48,
    paddingHorizontal: 9,
  },
  controlKeyActive: {
    backgroundColor: colors.blue,
    borderColor: colors.blue,
  },
  controlKeyText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  spaceKey: {
    alignItems: 'center',
    backgroundColor: colors.panelSoft,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    height: 32,
    justifyContent: 'center',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  emojiPick: {
    alignItems: 'center',
    backgroundColor: colors.panelSoft,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  emojiPickActive: {
    backgroundColor: colors.blue,
    borderColor: colors.blue,
  },
  emojiPickText: {
    fontSize: 22,
  },
  detailHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  detailTitleWrap: {
    flex: 1,
  },
  detailTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 25,
  },
  detailMeta: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 5,
  },
  itemList: {
    gap: 10,
    marginTop: 24,
  },
  itemRow: {
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 58,
    paddingHorizontal: 14,
  },
  itemRowDone: {
    backgroundColor: '#102a45',
  },
  checkbox: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 7,
    borderWidth: 2,
    height: 26,
    justifyContent: 'center',
    width: 26,
  },
  checkboxDone: {
    backgroundColor: colors.blue,
    borderColor: colors.blue,
  },
  checkmark: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '900',
  },
  itemText: {
    color: colors.text,
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  itemTextDone: {
    color: colors.faint,
    textDecorationLine: 'line-through',
  },
});
