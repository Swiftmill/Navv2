import path from 'path';
import fs from 'fs';
import { app } from 'electron';
import { DATA_FILES } from '../constants';
import { dataPaths } from '../data-paths';
import { AtomicJsonStore } from './fileStore';
import type {
  SettingsSchema,
  BookmarkSchema,
  HistoryEntry,
  SessionState,
  SearchEngine,
} from '../../shared/schema';

function resolveSeedDir(): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'data');
  }
  return path.resolve(__dirname, '../../data');
}

function readSeed<T>(fileName: string, fallback: T): T {
  const seedDir = resolveSeedDir();
  const seedPath = path.join(seedDir, fileName);
  try {
    const raw = fs.readFileSync(seedPath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`Unable to read seed ${fileName}`, error);
    return fallback;
  }
}

export const defaultSettings: SettingsSchema = {
  theme: 'dark',
  accentColor: '#7c3aed',
  backgroundVideo: null,
  searchEngine: 'hyper',
  homepage: 'hyper://home',
  cpuLimit: 70,
  ramLimit: 4096,
  panelBlur: 18,
  panelOpacity: 0.75,
};

const defaultBookmarks: BookmarkSchema[] = [];
const defaultHistory: HistoryEntry[] = [];
export const defaultSessions: SessionState = { lastSession: { windows: [] } };
const defaultSearchEngines: SearchEngine[] = [
  { id: 'hyper', name: 'Hyper Search', url: 'https://search.hypergx.local?q=%s', shortcut: '!h' },
];

export function ensureDataDirectories(): void {
  dataPaths.ensureStructure();
  const seedDir = resolveSeedDir();
  const sourceList = path.join(seedDir, 'adblock-lists', 'easylist.txt');
  const targetList = dataPaths.resolve('adblock-lists', 'easylist.txt');
  try {
    if (!fs.existsSync(targetList) && fs.existsSync(sourceList)) {
      fs.copyFileSync(sourceList, targetList);
    }
  } catch (error) {
    console.warn('Unable to seed adblock list', error);
  }
}

export const settingsStore = new AtomicJsonStore<SettingsSchema>(
  dataPaths.resolve(DATA_FILES.SETTINGS),
  readSeed<SettingsSchema>(DATA_FILES.SETTINGS, defaultSettings),
);

export const bookmarksStore = new AtomicJsonStore<BookmarkSchema[]>(
  dataPaths.resolve(DATA_FILES.BOOKMARKS),
  readSeed<BookmarkSchema[]>(DATA_FILES.BOOKMARKS, defaultBookmarks),
);

export const historyStore = new AtomicJsonStore<HistoryEntry[]>(
  dataPaths.resolve(DATA_FILES.HISTORY),
  readSeed<HistoryEntry[]>(DATA_FILES.HISTORY, defaultHistory),
);

export const sessionStore = new AtomicJsonStore<SessionState>(
  dataPaths.resolve(DATA_FILES.SESSIONS),
  readSeed<SessionState>(DATA_FILES.SESSIONS, defaultSessions),
);

export const searchEngineStore = new AtomicJsonStore<SearchEngine[]>(
  dataPaths.resolve(DATA_FILES.SEARCH_ENGINES),
  readSeed<SearchEngine[]>(DATA_FILES.SEARCH_ENGINES, defaultSearchEngines),
);

export type { SettingsSchema, BookmarkSchema, HistoryEntry, SessionState, SearchEngine } from '../../shared/schema';
