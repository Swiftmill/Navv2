export const IPC_CHANNELS = {
  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',
  SETTINGS_RESET: 'settings:reset',
  BOOKMARKS_LIST: 'bookmarks:list',
  BOOKMARKS_ADD: 'bookmarks:add',
  BOOKMARKS_UPDATE: 'bookmarks:update',
  BOOKMARKS_REMOVE: 'bookmarks:remove',
  HISTORY_ADD: 'history:add',
  HISTORY_LIST: 'history:list',
  HISTORY_CLEAR: 'history:clear',
  DOWNLOADS_OPEN_FOLDER: 'downloads:open-folder',
  SESSION_SAVE: 'session:save',
  SESSION_RESTORE: 'session:restore',
  SEARCH_ENGINES_LIST: 'search-engines:list',
  SEARCH_ENGINES_SET: 'search-engines:set'
} as const;

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];

export const DATA_FILES = {
  SETTINGS: 'settings.json',
  BOOKMARKS: 'bookmarks.json',
  HISTORY: 'history.json',
  SESSIONS: 'sessions.json',
  SEARCH_ENGINES: 'search-engines.json'
} as const;
