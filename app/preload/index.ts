import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../main/constants';
import type {
  SettingsSchema,
  BookmarkSchema,
  HistoryEntry,
  SessionState,
  SearchEngine,
  DownloadItemInfo,
} from '../shared/schema';

type SessionSnapshot = SessionState['lastSession'];

declare global {
  interface Window {
    hyper: typeof api;
  }
}

const api = {
  settings: {
    get: () => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_GET) as Promise<SettingsSchema>,
    set: (payload: SettingsSchema) =>
      ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_SET, payload) as Promise<SettingsSchema>,
    reset: () => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_RESET) as Promise<SettingsSchema>,
  },
  bookmarks: {
    list: () => ipcRenderer.invoke(IPC_CHANNELS.BOOKMARKS_LIST) as Promise<BookmarkSchema[]>,
    add: (bookmark: BookmarkSchema) =>
      ipcRenderer.invoke(IPC_CHANNELS.BOOKMARKS_ADD, bookmark) as Promise<BookmarkSchema[]>,
    update: (bookmark: BookmarkSchema) =>
      ipcRenderer.invoke(IPC_CHANNELS.BOOKMARKS_UPDATE, bookmark) as Promise<BookmarkSchema[]>,
    remove: (id: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.BOOKMARKS_REMOVE, id) as Promise<BookmarkSchema[]>,
  },
  history: {
    add: (entry: HistoryEntry) =>
      ipcRenderer.invoke(IPC_CHANNELS.HISTORY_ADD, entry) as Promise<HistoryEntry[]>,
    list: () => ipcRenderer.invoke(IPC_CHANNELS.HISTORY_LIST) as Promise<HistoryEntry[]>,
    clear: () => ipcRenderer.invoke(IPC_CHANNELS.HISTORY_CLEAR) as Promise<HistoryEntry[]>,
  },
  downloads: {
    openFolder: () => ipcRenderer.invoke(IPC_CHANNELS.DOWNLOADS_OPEN_FOLDER) as Promise<boolean>,
    onUpdate: (callback: (downloads: DownloadItemInfo[]) => void) => {
      ipcRenderer.on('downloads:update', (_event, downloads) => callback(downloads));
    },
  },
  session: {
    save: (session: SessionSnapshot) => ipcRenderer.invoke(IPC_CHANNELS.SESSION_SAVE, session),
    restore: () => ipcRenderer.invoke(IPC_CHANNELS.SESSION_RESTORE) as Promise<SessionSnapshot>,
  },
  search: {
    list: () => ipcRenderer.invoke(IPC_CHANNELS.SEARCH_ENGINES_LIST) as Promise<SearchEngine[]>,
    set: (engines: SearchEngine[]) =>
      ipcRenderer.invoke(IPC_CHANNELS.SEARCH_ENGINES_SET, engines) as Promise<SearchEngine[]>,
  },
  keyboard: {
    onShortcut: (callback: (action: string) => void) => {
      ipcRenderer.on('shortcut', (_event, action: string) => callback(action));
    },
  },
};

contextBridge.exposeInMainWorld('hyper', api);
