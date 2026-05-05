import React, {useMemo, useState} from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {Card, Chip, EmptyState, Header, IconButton, Page, PrimaryButton, SegmentedControl} from '../components/ui';
import {activityIdeas} from '../data/content';
import {colors} from '../theme/colors';
import type {ActivityIdea, AppState} from '../types/models';

type IdeasScreenProps = {
  state: AppState;
  onToggleLike: (id: string) => void;
  onCreateIdea: (title: string, description: string, emoji: string, type: string) => void;
};

const emojiOptions = ['🏕️', '⭐', '🔥', '🎒', '🌿', '📸', '🎨', '🎣', '🧘', '☀️'];
const categoryOptions = ['Night', 'Creative', 'Photography', 'Food', 'Art', 'Nature', 'Social', 'Wellness', 'Relaxation'];
const letterRows = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
const numberRows = ['1234567890', '-_/&()', '.,!?'];
const titleLimit = 42;
const descriptionLimit = 170;

export const IdeasScreen = ({state, onToggleLike, onCreateIdea}: IdeasScreenProps) => {
  const [mode, setMode] = useState<'all' | 'liked'>('all');
  const [index, setIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [activeField, setActiveField] = useState<'title' | 'description'>('title');
  const [keyboardMode, setKeyboardMode] = useState<'letters' | 'numbers'>('letters');
  const [shift, setShift] = useState(true);
  const [emoji, setEmoji] = useState(emojiOptions[0]);
  const [category, setCategory] = useState(categoryOptions[5]);
  const {width, height} = useWindowDimensions();
  const compact = width < 360 || height < 720;

  const allIdeas = useMemo(
    () => [...state.customIdeas, ...activityIdeas],
    [state.customIdeas],
  );

  const visibleIdeas = useMemo(() => {
    if (mode === 'liked') {
      return allIdeas.filter(idea => state.likedIdeaIds.includes(idea.id));
    }
    return allIdeas;
  }, [allIdeas, mode, state.likedIdeaIds]);

  const safeIndex = visibleIdeas.length ? Math.min(index, visibleIdeas.length - 1) : 0;
  const idea = visibleIdeas[safeIndex];

  const changeMode = (next: 'all' | 'liked') => {
    setMode(next);
    setIndex(0);
  };

  const next = () => {
    if (!visibleIdeas.length) {
      return;
    }
    setIndex(current => (current + 1) % visibleIdeas.length);
  };

  const previous = () => {
    if (!visibleIdeas.length) {
      return;
    }
    setIndex(current => (current === 0 ? visibleIdeas.length - 1 : current - 1));
  };

  const random = () => {
    if (!visibleIdeas.length) {
      return;
    }
    const nextIndex = Math.floor(Math.random() * visibleIdeas.length);
    setIndex(nextIndex);
  };

  const appendText = (value: string) => {
    const limit = activeField === 'title' ? titleLimit : descriptionLimit;
    const update = (current: string) => {
      if (current.length >= limit) {
        return current;
      }
      const shouldCapitalize =
        keyboardMode === 'letters' &&
        (shift ||
          current.length === 0 ||
          current.endsWith(' ') ||
          current.endsWith('.') ||
          current.endsWith('!') ||
          current.endsWith('?'));
      const nextValue = shouldCapitalize ? value.toUpperCase() : value;
      return `${current}${nextValue}`.slice(0, limit);
    };

    if (activeField === 'title') {
      setTitle(update);
    } else {
      setDescription(update);
    }

    if (keyboardMode === 'letters' && shift) {
      setShift(false);
    }
  };

  const eraseText = () => {
    if (activeField === 'title') {
      setTitle(current => current.slice(0, -1));
      return;
    }
    setDescription(current => current.slice(0, -1));
  };

  const addSpace = () => {
    const limit = activeField === 'title' ? titleLimit : descriptionLimit;
    const update = (current: string) => {
      if (!current || current.endsWith(' ') || current.length >= limit) {
        return current;
      }
      return `${current} `.slice(0, limit);
    };

    if (activeField === 'title') {
      setTitle(update);
    } else {
      setDescription(update);
    }
    setShift(true);
  };

  const create = () => {
    const cleanTitle = title.trim();
    const cleanDescription = description.trim();
    if (!cleanTitle || !cleanDescription) {
      return;
    }
    onCreateIdea(cleanTitle, cleanDescription, emoji, category);
    setTitle('');
    setDescription('');
    setActiveField('title');
    setKeyboardMode('letters');
    setShift(true);
    setEmoji(emojiOptions[0]);
    setCategory(categoryOptions[5]);
    setModalVisible(false);
    setMode('all');
    setIndex(0);
  };

  return (
    <Page withTabs>
      <Header
        eyebrow="Inspiration"
        title="Activity Ideas"
        right={<IconButton label="➕" active onPress={() => setModalVisible(true)} />}
      />
      <SegmentedControl
        value={mode}
        onChange={changeMode}
        options={[
          {key: 'all', label: 'All Ideas'},
          {key: 'liked', label: `Liked (${state.likedIdeaIds.length})`},
        ]}
      />
      <PrimaryButton
        label="Surprise Me with a Random Idea"
        icon="⤨"
        tone="orange"
        onPress={random}
        style={styles.randomButton}
      />
      {idea ? (
        <View>
          <IdeaCard
            idea={idea}
            compact={compact}
            liked={state.likedIdeaIds.includes(idea.id)}
            onLike={() => onToggleLike(idea.id)}
          />
          <View style={styles.carouselRow}>
            <IconButton label="⬅️" onPress={previous} size={44} />
            <View style={styles.dots}>
              {visibleIdeas.slice(0, 8).map((item, dotIndex) => (
                <View
                  key={item.id}
                  style={[styles.dot, safeIndex === dotIndex && styles.dotActive]}
                />
              ))}
              {visibleIdeas.length > 8 ? (
                <Text style={styles.moreDots}>+{visibleIdeas.length - 8}</Text>
              ) : null}
            </View>
            <IconButton label="➡️" onPress={next} size={44} />
          </View>
        </View>
      ) : (
        <EmptyState title="No liked ideas yet" subtitle="Tap the heart on any idea card to save it here" />
      )}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.modalShade} onPress={() => setModalVisible(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Add Custom Idea</Text>
              <Pressable onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <Text style={styles.closeText}>✖️</Text>
              </Pressable>
            </View>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.sheetContent}>
              <Text style={styles.inputLabel}>TITLE</Text>
              <Pressable
                onPress={() => setActiveField('title')}
                style={[
                  styles.fakeInput,
                  activeField === 'title' && styles.fakeInputActive,
                ]}>
                <Text
                  style={[styles.fakeInputText, !title && styles.fakePlaceholder]}
                  numberOfLines={1}>
                  {title || 'e.g. Night photography session'}
                </Text>
                <Text style={styles.inputCounter}>
                  {title.length}/{titleLimit}
                </Text>
              </Pressable>
              <Text style={styles.inputLabel}>DESCRIPTION</Text>
              <Pressable
                onPress={() => setActiveField('description')}
                style={[
                  styles.fakeInput,
                  styles.fakeTextarea,
                  activeField === 'description' && styles.fakeInputActive,
                ]}>
                <Text style={[styles.fakeInputText, !description && styles.fakePlaceholder]}>
                  {description || 'Describe the activity...'}
                </Text>
                <Text style={styles.textareaCounter}>
                  {description.length}/{descriptionLimit}
                </Text>
              </Pressable>
              <IdeaKeyboard
                mode={keyboardMode}
                shift={shift}
                onToggleMode={() =>
                  setKeyboardMode(current => (current === 'letters' ? 'numbers' : 'letters'))
                }
                onToggleShift={() => setShift(current => !current)}
                onKey={appendText}
                onSpace={addSpace}
                onBackspace={eraseText}
              />
              <Text style={styles.inputLabel}>EMOJI</Text>
              <View style={styles.wrapRow}>
                {emojiOptions.map(item => (
                  <Pressable
                    key={item}
                    onPress={() => setEmoji(item)}
                    style={[styles.squarePick, emoji === item && styles.pickActive]}>
                    <Text style={styles.squarePickText}>{item}</Text>
                  </Pressable>
                ))}
              </View>
              <Text style={styles.inputLabel}>CATEGORY</Text>
              <View style={styles.wrapRow}>
                {categoryOptions.map(item => (
                  <Pressable
                    key={item}
                    onPress={() => setCategory(item)}
                    style={[styles.categoryPick, category === item && styles.categoryActive]}>
                    <Text style={[styles.categoryText, category === item && styles.categoryTextActive]}>
                      {item}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <PrimaryButton
                label="Add Idea"
                icon="➕"
                onPress={create}
                disabled={!title.trim() || !description.trim()}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Page>
  );
};

const IdeaKeyboard = ({
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

const IdeaCard = ({
  idea,
  liked,
  compact,
  onLike,
}: {
  idea: ActivityIdea;
  liked: boolean;
  compact: boolean;
  onLike: () => void;
}) => (
  <Card style={[styles.ideaCard, compact && styles.ideaCardCompact]}>
    <View style={styles.ideaTop}>
      <View style={styles.chips}>
        <Chip label={idea.type} tone={idea.custom ? 'yellow' : 'cyan'} />
        {idea.custom ? <Chip label="Custom" tone="yellow" /> : null}
      </View>
      <IconButton label={liked ? '❤️' : '🤍'} danger active={liked} onPress={onLike} />
    </View>
    <View style={styles.ideaEmojiWrap}>
      <Text style={styles.ideaEmoji}>{idea.emoji}</Text>
    </View>
    <Text style={styles.ideaTitle}>{idea.title}</Text>
    <Text style={styles.ideaDescription}>{idea.description}</Text>
  </Card>
);

const styles = StyleSheet.create({
  randomButton: {
    marginTop: 16,
  },
  ideaCard: {
    gap: 22,
    marginTop: 26,
    minHeight: 318,
    padding: 24,
  },
  ideaCardCompact: {
    minHeight: 260,
    padding: 20,
  },
  ideaTop: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chips: {
    alignItems: 'flex-start',
    gap: 8,
  },
  ideaEmojiWrap: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.panelDeep,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  ideaEmoji: {
    fontSize: 34,
  },
  ideaTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 28,
  },
  ideaDescription: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
  carouselRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 18,
    justifyContent: 'center',
    marginTop: 26,
  },
  dots: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  dot: {
    backgroundColor: '#1a416c',
    borderRadius: 5,
    height: 8,
    width: 8,
  },
  dotActive: {
    backgroundColor: colors.blue,
    width: 22,
  },
  moreDots: {
    color: colors.faint,
    fontSize: 12,
    fontWeight: '900',
    marginLeft: 2,
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
    gap: 12,
    maxHeight: '92%',
    padding: 20,
  },
  sheetContent: {
    gap: 12,
    paddingBottom: 16,
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
    backgroundColor: colors.panelSoft,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 46,
    justifyContent: 'center',
    paddingRight: 52,
    paddingHorizontal: 14,
  },
  fakeInputActive: {
    borderColor: colors.blue,
  },
  fakeInputText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 21,
  },
  fakePlaceholder: {
    color: colors.faint,
  },
  inputCounter: {
    bottom: 8,
    color: colors.faint,
    fontSize: 10,
    fontWeight: '900',
    position: 'absolute',
    right: 12,
  },
  fakeTextarea: {
    justifyContent: 'flex-start',
    minHeight: 88,
    paddingBottom: 20,
    paddingTop: 12,
  },
  textareaCounter: {
    bottom: 8,
    color: colors.faint,
    fontSize: 10,
    fontWeight: '900',
    position: 'absolute',
    right: 12,
  },
  keyboard: {
    backgroundColor: colors.panelDeep,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    gap: 7,
    padding: 8,
  },
  keyRow: {
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
  },
  keyRowIndented: {
    paddingHorizontal: 10,
  },
  key: {
    alignItems: 'center',
    backgroundColor: colors.panelSoft,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    height: 34,
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.72,
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
    borderRadius: 9,
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    minWidth: 46,
    paddingHorizontal: 10,
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
    borderRadius: 9,
    borderWidth: 1,
    flex: 1,
    height: 34,
    justifyContent: 'center',
  },
  wrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },
  squarePick: {
    alignItems: 'center',
    backgroundColor: colors.panelSoft,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    height: 43,
    justifyContent: 'center',
    width: 43,
  },
  pickActive: {
    backgroundColor: colors.blue,
    borderColor: colors.blue,
  },
  squarePickText: {
    fontSize: 22,
  },
  categoryPick: {
    backgroundColor: colors.panelSoft,
    borderColor: colors.border,
    borderRadius: 100,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  categoryActive: {
    backgroundColor: colors.cyan,
    borderColor: colors.cyan,
  },
  categoryText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '900',
  },
  categoryTextActive: {
    color: colors.black,
  },
});
