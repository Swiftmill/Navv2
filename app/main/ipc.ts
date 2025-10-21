import { ipcMain } from 'electron';
import { IPC_CHANNELS } from './constants';
import {
  bookmarksStore,
  historyStore,
  settingsStore,
  SessionState,
  sessionStore,
  searchEngineStore,
  defaultSettings,
} from './storage';
import { openDownloadsFolder } from './download-manager';

export function registerIpcHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.SETTINGS_GET, async () => settingsStore.read());

  ipcMain.handle(IPC_CHANNELS.SETTINGS_SET, async (_event, payload) => {
    await settingsStore.write(payload);
    return payload;
  });

  ipcMain.handle(IPC_CHANNELS.SETTINGS_RESET, async () => {
    await settingsStore.write(defaultSettings);
    return defaultSettings;
  });

  ipcMain.handle(IPC_CHANNELS.BOOKMARKS_LIST, async () => bookmarksStore.read());

  ipcMain.handle(IPC_CHANNELS.BOOKMARKS_ADD, async (_event, bookmark) => {
    const bookmarks = await bookmarksStore.update((list) => [...list, bookmark]);
    return bookmarks;
  });

  ipcMain.handle(IPC_CHANNELS.BOOKMARKS_UPDATE, async (_event, bookmark) => {
    const bookmarks = await bookmarksStore.update((list) =>
      list.map((item) => (item.id === bookmark.id ? bookmark : item)),
    );
    return bookmarks;
  });

  ipcMain.handle(IPC_CHANNELS.BOOKMARKS_REMOVE, async (_event, id: string) => {
    const bookmarks = await bookmarksStore.update((list) => list.filter((item) => item.id !== id));
    return bookmarks;
  });

  ipcMain.handle(IPC_CHANNELS.HISTORY_LIST, async () => historyStore.read());

  ipcMain.handle(IPC_CHANNELS.HISTORY_ADD, async (_event, entry) => {
    const history = await historyStore.update((list) => {
      const filtered = list.filter((item) => item.url !== entry.url);
      return [entry, ...filtered].slice(0, 1000);
    });
    return history;
  });

  ipcMain.handle(IPC_CHANNELS.HISTORY_CLEAR, async () => {
    await historyStore.write([]);
    return [];
  });

  ipcMain.handle(IPC_CHANNELS.DOWNLOADS_OPEN_FOLDER, () => {
    openDownloadsFolder();
    return true;
  });

  ipcMain.handle(IPC_CHANNELS.SESSION_RESTORE, async () => {
    const state = await sessionStore.read();
    return state.lastSession;
  });

  ipcMain.handle(IPC_CHANNELS.SESSION_SAVE, async (_event, session: SessionState['lastSession']) => {
    await sessionStore.write({ lastSession: session });
    return true;
  });

  ipcMain.handle(IPC_CHANNELS.SEARCH_ENGINES_LIST, async () => searchEngineStore.read());

  ipcMain.handle(IPC_CHANNELS.SEARCH_ENGINES_SET, async (_event, engines) => {
    await searchEngineStore.write(engines);
    return engines;
  });
}
