import React, {useEffect, useState} from 'react';
import {StatusBar, StyleSheet, View} from 'react-native';
import {BottomTabBar} from './src/components/ui';
import {useAppStorage} from './src/hooks/useAppStorage';
import {colors} from './src/theme/colors';
import type {TabKey} from './src/types/models';
import {ArticleDetailScreen, ArticlesScreen, QuizScreen} from './src/screens/ArticlesScreen';
import {ChecklistDetailScreen, ChecklistsScreen} from './src/screens/ChecklistsScreen';
import {IdeasScreen} from './src/screens/IdeasScreen';
import {LocationDetailScreen, LocationsScreen} from './src/screens/LocationsScreen';
import {OnboardingScreen} from './src/screens/OnboardingScreen';
import {SettingsScreen} from './src/screens/SettingsScreen';
import {SplashScreen} from './src/screens/SplashScreen';

type Route =
  | {name: 'splash'}
  | {name: 'onboarding'}
  | {name: 'tabs'}
  | {name: 'locationDetail'; id: string}
  | {name: 'checklistDetail'; id: string; isCustom: boolean}
  | {name: 'articleDetail'; id: string}
  | {name: 'quiz'};

const App = (): React.JSX.Element => {
  const {state, loaded, updateState, clearState} = useAppStorage();
  const [route, setRoute] = useState<Route>({name: 'splash'});
  const [tab, setTab] = useState<TabKey>('locations');

  useEffect(() => {
    if (!loaded || route.name !== 'splash') {
      return;
    }

    const timer = setTimeout(() => {
      setRoute(state.hasOnboarded ? {name: 'tabs'} : {name: 'onboarding'});
    }, 5000);

    return () => clearTimeout(timer);
  }, [loaded, route.name, state.hasOnboarded]);

  const finishOnboarding = () => {
    updateState(current => ({...current, hasOnboarded: true}));
    setRoute({name: 'tabs'});
  };

  const toggleSaveLocation = (id: string) => {
    updateState(current => {
      const saved = current.savedLocationIds.includes(id);
      return {
        ...current,
        savedLocationIds: saved
          ? current.savedLocationIds.filter(item => item !== id)
          : [...current.savedLocationIds, id],
      };
    });
  };

  const createCustomChecklist = (title: string, emoji: string) => {
    updateState(current => ({
      ...current,
      customChecklists: [
        {
          id: `${Date.now()}`,
          emoji,
          title,
          items: [],
        },
        ...current.customChecklists,
      ],
    }));
  };

  const toggleChecklistItem = (key: string, item: string) => {
    updateState(current => {
      const completed = current.checklistProgress[key] ?? [];
      const nextCompleted = completed.includes(item)
        ? completed.filter(value => value !== item)
        : [...completed, item];
      return {
        ...current,
        checklistProgress: {
          ...current.checklistProgress,
          [key]: nextCompleted,
        },
      };
    });
  };

  const resetChecklist = (key: string) => {
    updateState(current => {
      const nextProgress = {...current.checklistProgress};
      delete nextProgress[key];
      return {...current, checklistProgress: nextProgress};
    });
  };

  const toggleLikeIdea = (id: string) => {
    updateState(current => {
      const liked = current.likedIdeaIds.includes(id);
      return {
        ...current,
        likedIdeaIds: liked
          ? current.likedIdeaIds.filter(item => item !== id)
          : [...current.likedIdeaIds, id],
      };
    });
  };

  const createIdea = (title: string, description: string, emoji: string, type: string) => {
    updateState(current => ({
      ...current,
      customIdeas: [
        {
          id: `custom-idea-${Date.now()}`,
          custom: true,
          emoji,
          title,
          description,
          type,
        },
        ...current.customIdeas,
      ],
    }));
  };

  const updateQuizBest = (score: number) => {
    updateState(current => ({...current, quizBest: Math.max(current.quizBest, score)}));
  };

  const clearAll = () => {
    clearState();
    setTab('locations');
    setRoute({name: 'onboarding'});
  };

  const openTab = (next: TabKey) => {
    setTab(next);
    setRoute({name: 'tabs'});
  };

  if (route.name === 'splash') {
    return <SplashScreen />;
  }

  if (route.name === 'onboarding') {
    return <OnboardingScreen onFinish={finishOnboarding} />;
  }

  if (route.name === 'locationDetail') {
    return (
      <LocationDetailScreen
        locationId={route.id}
        saved={state.savedLocationIds.includes(route.id)}
        onBack={() => setRoute({name: 'tabs'})}
        onToggleSave={toggleSaveLocation}
      />
    );
  }

  if (route.name === 'checklistDetail') {
    return (
      <ChecklistDetailScreen
        state={state}
        checklistId={route.id}
        isCustom={route.isCustom}
        onBack={() => setRoute({name: 'tabs'})}
        onToggleItem={toggleChecklistItem}
        onReset={resetChecklist}
      />
    );
  }

  if (route.name === 'articleDetail') {
    return <ArticleDetailScreen articleId={route.id} onBack={() => setRoute({name: 'tabs'})} />;
  }

  if (route.name === 'quiz') {
    return (
      <QuizScreen
        quizBest={state.quizBest}
        onBack={() => setRoute({name: 'tabs'})}
        onComplete={updateQuizBest}
      />
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      {tab === 'locations' ? (
        <LocationsScreen
          savedIds={state.savedLocationIds}
          onToggleSave={toggleSaveLocation}
          onOpen={id => setRoute({name: 'locationDetail', id})}
        />
      ) : null}
      {tab === 'checklists' ? (
        <ChecklistsScreen
          state={state}
          onOpenTemplate={id => setRoute({name: 'checklistDetail', id, isCustom: false})}
          onOpenCustom={id => setRoute({name: 'checklistDetail', id, isCustom: true})}
          onCreateCustom={createCustomChecklist}
        />
      ) : null}
      {tab === 'articles' ? (
        <ArticlesScreen
          onOpenArticle={id => setRoute({name: 'articleDetail', id})}
          onStartQuiz={() => setRoute({name: 'quiz'})}
        />
      ) : null}
      {tab === 'ideas' ? (
        <IdeasScreen state={state} onToggleLike={toggleLikeIdea} onCreateIdea={createIdea} />
      ) : null}
      {tab === 'settings' ? (
        <SettingsScreen
          state={state}
          onTogglePush={() =>
            updateState(current => ({...current, pushEnabled: !current.pushEnabled}))
          }
          onClearAll={clearAll}
        />
      ) : null}
      <BottomTabBar value={tab} onChange={openTab} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background,
    flex: 1,
  },
});

export default App;
