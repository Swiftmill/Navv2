export interface TabGroup {
  id: string;
  name: string;
  color: string;
}

export interface BrowserTab {
  id: string;
  title: string;
  url: string;
  pinned?: boolean;
  isPrivate?: boolean;
  groupId?: string;
}

export interface TabState {
  activeTabId: string | null;
  tabs: BrowserTab[];
  groups: TabGroup[];
  closedStack: BrowserTab[];
}

export function createInitialTabState(): TabState {
  return {
    activeTabId: null,
    tabs: [],
    groups: [],
    closedStack: [],
  };
}
