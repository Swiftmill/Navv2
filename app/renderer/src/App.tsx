import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import type { BookmarkSchema, DownloadItemInfo, HistoryEntry, SearchEngine, SettingsSchema } from '../../shared/schema';
import type { HyperBridge } from './types/api';
import { useTabs } from './hooks/useTabs';
import { BrowserTab } from './state/tabs';
import { AddressBar } from './components/AddressBar';
import { TabStrip } from './components/TabStrip';
import { Sidebar } from './components/Sidebar';
import { SettingsView } from './routes/SettingsView';
import { HomeView } from './routes/HomeView';
import { WebviewStack } from './components/WebviewStack';
import { nanoid } from './utils/nanoid';

const hyper = window.hyper as HyperBridge;

export default function App() {
  const [settings, setSettings] = useState<SettingsSchema | null>(null);
  const [bookmarks, setBookmarks] = useState<BookmarkSchema[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [downloads, setDownloads] = useState<DownloadItemInfo[]>([]);
  const [searchEngines, setSearchEngines] = useState<SearchEngine[]>([
    { id: 'hyper', name: 'Hyper Search', url: 'https://search.hypergx.local?q=%s', shortcut: '!h' },
  ]);
  const { state, openTab, closeTab, duplicateTab, restoreLastClosed, updateTab, setActiveTab, pinTab, assignGroup } =
    useTabs();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    hyper.settings.get().then((value) => {
      setSettings(value);
      applyTheme(value);
    });
    hyper.bookmarks.list().then(setBookmarks);
    hyper.history.list().then(setHistory);
    hyper.downloads.onUpdate(setDownloads);
    hyper.keyboard.onShortcut(handleShortcut);
    hyper.search.list().then(setSearchEngines).catch((error) => console.error('Search engines load failed', error));
  }, []);

  function handleShortcut(action: string) {
    switch (action) {
      case 'new-tab':
        openTab('hyper://home');
        navigate('/');
        break;
      case 'close-tab':
        if (state.activeTabId) closeTab(state.activeTabId);
        break;
      case 'restore-tab':
        restoreLastClosed();
        break;
      case 'focus-address':
        document.dispatchEvent(new CustomEvent('hyper:focus-address'));
        break;
      case 'toggle-fullscreen':
        break;
      case 'new-private-window':
        openTab('hyper://home', { pinned: false, activate: true, isPrivate: true });
        break;
      case 'next-tab':
        cycleTab(1);
        break;
      case 'previous-tab':
        cycleTab(-1);
        break;
      default:
        break;
    }
  }

  function cycleTab(direction: 1 | -1) {
    const tabs = state.tabs;
    if (tabs.length === 0) return;
    const currentIndex = tabs.findIndex((tab) => tab.id === state.activeTabId);
    const nextIndex = (currentIndex + direction + tabs.length) % tabs.length;
    const nextTab = tabs[nextIndex];
    if (nextTab) {
      setActiveTab(nextTab.id);
      navigate('/');
    }
  }

  useEffect(() => {
    if (!settings) {
      return;
    }
    applyTheme(settings);
  }, [settings?.accentColor, settings?.theme, settings?.panelBlur, settings?.panelOpacity]);

  function applyTheme(value: SettingsSchema) {
    const root = document.documentElement;
    root.classList.toggle('dark', value.theme === 'dark');
    root.style.setProperty('--hyper-accent', value.accentColor);
    root.style.setProperty('--hyper-accent-foreground', '#ffffff');
    root.style.setProperty('--hyper-blur', `${value.panelBlur}px`);
    const secondaryOpacity = Math.max(0, value.panelOpacity - 0.2);
    root.style.setProperty(
      '--hyper-panel-bg',
      `linear-gradient(135deg, rgba(29,33,64,${value.panelOpacity}), rgba(12,12,24,${secondaryOpacity}))`,
    );
  }

  const activeTab = useMemo(() => state.tabs.find((tab) => tab.id === state.activeTabId) ?? state.tabs[0], [
    state.tabs,
    state.activeTabId,
  ]);

  function handleNavigate(url: string, tab: BrowserTab, title?: string) {
    if (location.pathname !== '/') {
      navigate('/');
    }
    const entry: HistoryEntry = {
      id: `${Date.now()}`,
      title: title ?? url,
      url,
      visitedAt: new Date().toISOString(),
    };
    hyper.history.add(entry).then(setHistory);
    updateTab(tab.id, { url, title: title ?? tab.title });
  }

  function handleBookmark(tab: BrowserTab) {
    const candidate: BookmarkSchema = {
      id: nanoid(),
      title: tab.title,
      url: tab.url,
    };
    hyper.bookmarks.add(candidate).then(setBookmarks);
  }

  if (!settings) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-surface">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-lg text-accent">
          Chargement d'HyperGX…
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <Sidebar
        bookmarks={bookmarks}
        history={history}
        downloads={downloads}
        onOpenBookmark={(bookmark) => {
          openTab(bookmark.url);
          navigate('/');
        }}
        onClearHistory={() => hyper.history.clear().then(setHistory)}
        onOpenDownloads={() => hyper.downloads.openFolder()}
      />
      <div className="flex flex-1 flex-col">
        <TabStrip
          tabs={state.tabs}
          activeTabId={state.activeTabId}
          groups={state.groups}
          onSelect={setActiveTab}
          onClose={closeTab}
          onDuplicate={duplicateTab}
          onPin={pinTab}
          onGroup={assignGroup}
          onNewTab={() => openTab('hyper://home')}
          onRestoreClosed={restoreLastClosed}
        />
        <AddressBar
          key={activeTab?.id ?? 'address'}
          activeTab={activeTab ?? null}
          bookmarks={bookmarks}
          history={history}
          searchEngine={settings.searchEngine}
          searchEngines={searchEngines}
          onNavigate={(url) => activeTab && handleNavigate(url, activeTab)}
          onBookmark={() => activeTab && handleBookmark(activeTab)}
          onSettings={() => navigate('/settings')}
        />
        <div className="flex-1 relative overflow-hidden">
          <Routes>
            <Route path="/" element={<WebviewStack tabs={state.tabs} activeTabId={state.activeTabId} onNavigate={handleNavigate} onTitle={(id, title) => updateTab(id, { title })} />} />
            <Route
              path="/settings"
              element={
                <SettingsView
                  settings={settings}
                  searchEngines={searchEngines}
                  onChange={(value) =>
                    hyper.settings.set(value).then((updated) => {
                      setSettings(updated);
                    })
                  }
                />
              }
            />
            <Route
              path="/home"
              element={
                <HomeView
                  settings={settings}
                  bookmarks={bookmarks}
                  onOpen={(url) => {
                    openTab(url);
                    navigate('/');
                  }}
                />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
