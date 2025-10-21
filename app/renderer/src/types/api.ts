import type {
  SettingsSchema,
  BookmarkSchema,
  HistoryEntry,
  SessionState,
  SearchEngine,
  DownloadItemInfo,
} from '../../shared/schema';

type SessionSnapshot = SessionState['lastSession'];

export interface HyperBridge {
  settings: {
    get(): Promise<SettingsSchema>;
    set(payload: SettingsSchema): Promise<SettingsSchema>;
    reset(): Promise<SettingsSchema>;
  };
  bookmarks: {
    list(): Promise<BookmarkSchema[]>;
    add(bookmark: BookmarkSchema): Promise<BookmarkSchema[]>;
    update(bookmark: BookmarkSchema): Promise<BookmarkSchema[]>;
    remove(id: string): Promise<BookmarkSchema[]>;
  };
  history: {
    add(entry: HistoryEntry): Promise<HistoryEntry[]>;
    list(): Promise<HistoryEntry[]>;
    clear(): Promise<HistoryEntry[]>;
  };
  downloads: {
    openFolder(): Promise<boolean>;
    onUpdate(callback: (downloads: DownloadItemInfo[]) => void): void;
  };
  session: {
    save(session: SessionSnapshot): Promise<void>;
    restore(): Promise<SessionSnapshot>;
  };
  search: {
    list(): Promise<SearchEngine[]>;
    set(engines: SearchEngine[]): Promise<SearchEngine[]>;
  };
  keyboard: {
    onShortcut(callback: (action: string) => void): void;
  };
}

declare global {
  interface Window {
    hyper: HyperBridge;
  }
}
