export interface SettingsSchema {
  theme: 'light' | 'dark';
  accentColor: string;
  backgroundVideo: string | null;
  searchEngine: string;
  homepage: string;
  cpuLimit: number;
  ramLimit: number;
  panelBlur: number;
  panelOpacity: number;
}

export interface BookmarkSchema {
  id: string;
  title: string;
  url: string;
  group?: string;
}

export interface HistoryEntry {
  id: string;
  title: string;
  url: string;
  visitedAt: string;
}

export interface SessionTab {
  id: string;
  title: string;
  url: string;
  pinned: boolean;
  isActive: boolean;
}

export interface SessionWindow {
  id: string;
  tabs: SessionTab[];
}

export interface SessionState {
  lastSession: {
    windows: SessionWindow[];
  };
}

export interface SearchEngine {
  id: string;
  name: string;
  url: string;
  shortcut?: string;
}

export interface DownloadItemInfo {
  id: string;
  fileName: string;
  receivedBytes: number;
  totalBytes: number;
  state: string;
  url: string;
}
