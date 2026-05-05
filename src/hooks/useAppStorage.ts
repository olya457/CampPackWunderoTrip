import AsyncStorage from '@react-native-async-storage/async-storage';
import {useCallback, useEffect, useMemo, useState} from 'react';
import type {AppState} from '../types/models';

const storageKey = '@camp-pack-wundero-trip/state';

export const initialAppState: AppState = {
  hasOnboarded: false,
  savedLocationIds: [],
  checklistProgress: {},
  checklistExtras: {},
  customChecklists: [],
  likedIdeaIds: [],
  customIdeas: [],
  pushEnabled: true,
  quizBest: 0,
};

const hydrateState = (value: unknown): AppState => {
  const incoming = value && typeof value === 'object' ? (value as Partial<AppState>) : {};

  return {
    ...initialAppState,
    ...incoming,
    savedLocationIds: Array.isArray(incoming.savedLocationIds)
      ? incoming.savedLocationIds
      : [],
    checklistProgress:
      incoming.checklistProgress && typeof incoming.checklistProgress === 'object'
        ? incoming.checklistProgress
        : {},
    checklistExtras:
      incoming.checklistExtras && typeof incoming.checklistExtras === 'object'
        ? incoming.checklistExtras
        : {},
    customChecklists: Array.isArray(incoming.customChecklists)
      ? incoming.customChecklists
      : [],
    likedIdeaIds: Array.isArray(incoming.likedIdeaIds) ? incoming.likedIdeaIds : [],
    customIdeas: Array.isArray(incoming.customIdeas) ? incoming.customIdeas : [],
    pushEnabled:
      typeof incoming.pushEnabled === 'boolean'
        ? incoming.pushEnabled
        : initialAppState.pushEnabled,
    quizBest:
      typeof incoming.quizBest === 'number' ? incoming.quizBest : initialAppState.quizBest,
  };
};

export const useAppStorage = () => {
  const [state, setState] = useState<AppState>(initialAppState);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(storageKey);
        const parsed = raw ? JSON.parse(raw) : null;
        if (mounted) {
          setState(hydrateState(parsed));
        }
      } catch {
        if (mounted) {
          setState(initialAppState);
        }
      } finally {
        if (mounted) {
          setLoaded(true);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const updateState = useCallback((updater: (current: AppState) => AppState) => {
    setState(current => {
      const next = hydrateState(updater(current));
      AsyncStorage.setItem(storageKey, JSON.stringify(next)).catch(() => undefined);
      return next;
    });
  }, []);

  const clearState = useCallback(() => {
    setState(initialAppState);
    AsyncStorage.removeItem(storageKey).catch(() => undefined);
  }, []);

  return useMemo(
    () => ({
      state,
      loaded,
      updateState,
      clearState,
    }),
    [clearState, loaded, state, updateState],
  );
};
