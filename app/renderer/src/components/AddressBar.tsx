import { FormEvent, useEffect, useMemo, useState } from 'react';
import type { BookmarkSchema, HistoryEntry } from '../../shared/schema';
import type { BrowserTab } from '../state/tabs';

interface AddressBarProps {
  activeTab: BrowserTab | null;
  bookmarks: BookmarkSchema[];
  history: HistoryEntry[];
  searchEngine: string;
  searchEngines: { id: string; url: string; shortcut?: string }[];
  onNavigate: (url: string) => void;
  onBookmark: () => void;
  onSettings: () => void;
}

const DEFAULT_ENGINES: Record<string, string> = {
  hyper: 'https://search.hypergx.local?q=%s',
  google: 'https://www.google.com/search?q=%s',
  duckduckgo: 'https://duckduckgo.com/?q=%s',
};

export function AddressBar({
  activeTab,
  bookmarks,
  history,
  searchEngine,
  onNavigate,
  onBookmark,
  onSettings,
  searchEngines,
}: AddressBarProps) {
  const [value, setValue] = useState(activeTab?.url ?? '');
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    setValue(activeTab?.url ?? '');
  }, [activeTab?.url]);

  useEffect(() => {
    const handler = () => {
      const input = document.getElementById('hyper-address-input') as HTMLInputElement | null;
      input?.focus();
      input?.select();
    };
    document.addEventListener('hyper:focus-address', handler);
    return () => document.removeEventListener('hyper:focus-address', handler);
  }, []);

  const suggestions = useMemo(() => {
    const trimmed = value.trim().toLowerCase();
    if (!trimmed) return [];
    const bookmarkMatches = bookmarks
      .filter((b) => b.title.toLowerCase().includes(trimmed) || b.url.toLowerCase().includes(trimmed))
      .map((b) => ({ id: b.id, title: b.title, url: b.url, type: 'bookmark' as const }));
    const historyMatches = history
      .filter((h) => h.title.toLowerCase().includes(trimmed) || h.url.toLowerCase().includes(trimmed))
      .slice(0, 5)
      .map((h) => ({ id: h.id, title: h.title, url: h.url, type: 'history' as const }));
    return [...bookmarkMatches.slice(0, 3), ...historyMatches];
  }, [value, bookmarks, history]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const url = normaliseUrl(value, searchEngine, searchEngines);
    onNavigate(url);
  }

  return (
    <form onSubmit={handleSubmit} className="relative px-4 py-2 flex items-center gap-2 glass-panel border-b border-white/5">
      <div className="flex-1 relative">
        <input
          id="hyper-address-input"
          value={value}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Rechercher ou entrer une adresse"
          className="w-full rounded-2xl bg-white/5 text-white px-4 py-2 outline-none focus:ring-2 focus:ring-accent/80 backdrop-blur"
        />
        {focused && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 mt-2 rounded-2xl glass-panel shadow-glass border border-white/10 p-2 z-20 max-h-60 overflow-y-auto">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                  setValue(suggestion.url);
                  onNavigate(suggestion.url);
                }}
                className="flex flex-col items-start w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 transition"
              >
                <span className="text-sm font-medium">{suggestion.title}</span>
                <span className="text-xs text-white/60">{suggestion.url}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={onBookmark}
        className="px-3 py-2 rounded-xl bg-accent/20 text-accent hover:bg-accent/30 transition"
      >
        ☆
      </button>
      <button
        type="button"
        onClick={onSettings}
        className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition"
      >
        ⚙️
      </button>
    </form>
  );
}

function normaliseUrl(raw: string, searchEngine: string, searchEngines: { id: string; url: string; shortcut?: string }[]): string {
  const trimmed = raw.trim();
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('hyper://')) {
    return trimmed;
  }
  if (trimmed.startsWith('!')) {
    const [shortcut, ...rest] = trimmed.split(' ');
    const query = encodeURIComponent(rest.join(' '));
    const custom = searchEngines.find((engine) => engine.shortcut === shortcut);
    if (custom) {
      return custom.url.replace('%s', query);
    }
    switch (shortcut) {
      case '!g':
        return `https://www.google.com/search?q=${query}`;
      case '!ddg':
        return `https://duckduckgo.com/?q=${query}`;
      case '!yt':
        return `https://www.youtube.com/results?search_query=${query}`;
      default:
        break;
    }
  }
  const customTemplate = searchEngines.find((engine) => engine.id === searchEngine)?.url;
  const template = customTemplate ?? DEFAULT_ENGINES[searchEngine] ?? DEFAULT_ENGINES.hyper;
  return template.replace('%s', encodeURIComponent(trimmed));
}
