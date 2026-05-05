import React, {useMemo, useState} from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
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

export const IdeasScreen = ({state, onToggleLike, onCreateIdea}: IdeasScreenProps) => {
  const [mode, setMode] = useState<'all' | 'liked'>('all');
  const [index, setIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
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

  const create = () => {
    const cleanTitle = title.trim();
    const cleanDescription = description.trim();
    if (!cleanTitle || !cleanDescription) {
      return;
    }
    onCreateIdea(cleanTitle, cleanDescription, emoji, category);
    setTitle('');
    setDescription('');
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
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalRoot}>
          <Pressable style={styles.modalShade} onPress={() => setModalVisible(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Add Custom Idea</Text>
              <Pressable onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <Text style={styles.closeText}>✖️</Text>
              </Pressable>
            </View>
            <Text style={styles.inputLabel}>TITLE</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Night photography session"
              placeholderTextColor="#708aa8"
              style={styles.input}
            />
            <Text style={styles.inputLabel}>DESCRIPTION</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Describe the activity..."
              placeholderTextColor="#708aa8"
              style={[styles.input, styles.textarea]}
              multiline
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
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </Page>
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
  input: {
    backgroundColor: colors.panelSoft,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    color: colors.text,
    fontSize: 15,
    minHeight: 46,
    paddingHorizontal: 14,
  },
  textarea: {
    minHeight: 88,
    paddingTop: 12,
    textAlignVertical: 'top',
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
