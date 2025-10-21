import { useCallback, useEffect, useMemo, useState } from 'react';
import { BrowserTab, TabGroup, TabState, createInitialTabState } from '../state/tabs';
import { nanoid } from '../utils/nanoid';
import type { HyperBridge } from '../types/api';

const hyper = window.hyper as HyperBridge;

const DEFAULT_GROUPS: TabGroup[] = [
  { id: 'work', name: 'Travail', color: '#38bdf8' },
  { id: 'play', name: 'Gaming', color: '#f472b6' },
  { id: 'social', name: 'Social', color: '#facc15' },
];

export function useTabs() {
  const [state, setState] = useState<TabState>(() => ({
    ...createInitialTabState(),
    groups: DEFAULT_GROUPS,
  }));

  const createTab = useCallback((url: string, title = 'Nouvel onglet', pinned = false): BrowserTab => ({
    id: nanoid(),
    title,
    url,
    pinned,
  }), []);

  useEffect(() => {
    hyper.session.restore().then((snapshot) => {
      if (snapshot.windows.length === 0) {
        const newTab = createTab('hyper://home', 'Accueil HyperGX', true);
        setState((prev) => ({
          ...prev,
          tabs: [newTab],
          activeTabId: newTab.id,
        }));
        return;
      }
      const windowState = snapshot.windows[0];
      const tabs: BrowserTab[] = windowState.tabs.map((tab) => ({
        id: tab.id,
        title: tab.title,
        url: tab.url,
        pinned: tab.pinned,
      }));
      const activeTab = windowState.tabs.find((tab) => tab.isActive)?.id ?? tabs[0]?.id ?? null;
      setState((prev) => ({ ...prev, tabs, activeTabId: activeTab }));
    });
  }, [createTab]);

  useEffect(() => {
    if (state.tabs.length === 0) {
      return;
    }
    const snapshot = {
      windows: [
        {
          id: 'main',
          tabs: state.tabs.map((tab) => ({
            id: tab.id,
            title: tab.title,
            url: tab.url,
            pinned: Boolean(tab.pinned),
            isActive: tab.id === state.activeTabId,
          })),
        },
      ],
    };
    hyper.session.save(snapshot);
  }, [state.tabs, state.activeTabId]);

  const openTab = useCallback((url: string, opts: { pinned?: boolean; activate?: boolean; isPrivate?: boolean } = {}) => {
    setState((prev) => {
      const newTab = { ...createTab(url, 'Chargement...', opts.pinned), isPrivate: opts.isPrivate };
      const tabs = opts.pinned ? [newTab, ...prev.tabs] : [...prev.tabs, newTab];
      return {
        ...prev,
        tabs,
        activeTabId: opts.activate !== false ? newTab.id : prev.activeTabId,
      };
    });
  }, [createTab]);

  const closeTab = useCallback((id: string) => {
    setState((prev) => {
      const closing = prev.tabs.find((tab) => tab.id === id);
      const tabs = prev.tabs.filter((tab) => tab.id !== id);
      const closedStack = closing ? [closing, ...prev.closedStack].slice(0, 20) : prev.closedStack;
      let activeTabId = prev.activeTabId;
      if (id === prev.activeTabId) {
        const currentIndex = prev.tabs.findIndex((tab) => tab.id === id);
        const nextTab = tabs[Math.max(0, currentIndex - 1)] ?? tabs[0];
        activeTabId = nextTab?.id ?? null;
      }
      return { ...prev, tabs, activeTabId, closedStack };
    });
  }, []);

  const restoreLastClosed = useCallback(() => {
    setState((prev) => {
      const [restore, ...rest] = prev.closedStack;
      if (!restore) {
        return prev;
      }
      return {
        ...prev,
        tabs: [...prev.tabs, restore],
        activeTabId: restore.id,
        closedStack: rest,
      };
    });
  }, []);

  const duplicateTab = useCallback((id: string) => {
    setState((prev) => {
      const target = prev.tabs.find((tab) => tab.id === id);
      if (!target) {
        return prev;
      }
      const copy = { ...target, id: nanoid(), title: `${target.title} (copie)` };
      const index = prev.tabs.findIndex((tab) => tab.id === id);
      const tabs = [...prev.tabs.slice(0, index + 1), copy, ...prev.tabs.slice(index + 1)];
      return { ...prev, tabs, activeTabId: copy.id };
    });
  }, []);

  const updateTab = useCallback((id: string, patch: Partial<BrowserTab>) => {
    setState((prev) => ({
      ...prev,
      tabs: prev.tabs.map((tab) => (tab.id === id ? { ...tab, ...patch } : tab)),
    }));
  }, []);

  const setActiveTab = useCallback((id: string) => {
    setState((prev) => ({ ...prev, activeTabId: id }));
  }, []);

  const pinTab = useCallback((id: string, pinned: boolean) => {
    setState((prev) => ({
      ...prev,
      tabs: prev.tabs
        .map((tab) => (tab.id === id ? { ...tab, pinned } : tab))
        .sort((a, b) => Number(b.pinned) - Number(a.pinned)),
    }));
  }, []);

  const assignGroup = useCallback((id: string, groupId?: string) => {
    setState((prev) => ({
      ...prev,
      tabs: prev.tabs.map((tab) => (tab.id === id ? { ...tab, groupId } : tab)),
    }));
  }, []);

  const value = useMemo(
    () => ({
      state,
      openTab,
      closeTab,
      duplicateTab,
      restoreLastClosed,
      updateTab,
      setActiveTab,
      pinTab,
      assignGroup,
    }),
    [state, openTab, closeTab, duplicateTab, restoreLastClosed, updateTab, setActiveTab, pinTab, assignGroup],
  );

  return value;
}
