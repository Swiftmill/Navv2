import { useState } from 'react';
import type { BookmarkSchema, DownloadItemInfo, HistoryEntry } from '../../shared/schema';

interface SidebarProps {
  bookmarks: BookmarkSchema[];
  history: HistoryEntry[];
  downloads: DownloadItemInfo[];
  onOpenBookmark(bookmark: BookmarkSchema): void;
  onClearHistory(): void;
  onOpenDownloads(): void;
}

type SidebarSection = 'bookmarks' | 'history' | 'downloads' | 'extensions';

export function Sidebar({ bookmarks, history, downloads, onOpenBookmark, onClearHistory, onOpenDownloads }: SidebarProps) {
  const [section, setSection] = useState<SidebarSection>('bookmarks');

  return (
    <aside className="w-72 bg-black/50 backdrop-blur-xl border-r border-white/10 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-white/70">Hyper Dock</h2>
      </div>
      <nav className="flex flex-col gap-1 p-4">
        <SidebarButton label="Favoris" active={section === 'bookmarks'} onClick={() => setSection('bookmarks')} icon="★" />
        <SidebarButton label="Historique" active={section === 'history'} onClick={() => setSection('history')} icon="🕑" />
        <SidebarButton label="Téléchargements" active={section === 'downloads'} onClick={() => setSection('downloads')} icon="⬇" />
        <SidebarButton label="Extensions" active={section === 'extensions'} onClick={() => setSection('extensions')} icon="⚙" />
      </nav>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {section === 'bookmarks' && (
          <div className="space-y-2">
            {bookmarks.map((bookmark) => (
              <button
                key={bookmark.id}
                onClick={() => onOpenBookmark(bookmark)}
                className="w-full text-left px-3 py-2 rounded-2xl glass-panel border border-white/5 hover:border-accent/60 transition"
              >
                <div className="text-sm font-semibold text-white/90">{bookmark.title}</div>
                <div className="text-xs text-white/50">{bookmark.url}</div>
              </button>
            ))}
          </div>
        )}

        {section === 'history' && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs uppercase tracking-widest text-white/40">Dernières visites</span>
              <button className="text-xs text-accent hover:text-accent/80" onClick={onClearHistory}>
                Effacer
              </button>
            </div>
            {history.map((entry) => (
              <button
                key={entry.id}
                onClick={() => onOpenBookmark({ id: entry.id, title: entry.title, url: entry.url })}
                className="w-full text-left px-3 py-2 rounded-2xl glass-panel border border-white/5 hover:border-accent/60 transition"
              >
                <div className="text-sm text-white/80">{entry.title}</div>
                <div className="text-xs text-white/40">{entry.url}</div>
              </button>
            ))}
          </div>
        )}

        {section === 'downloads' && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs uppercase tracking-widest text-white/40">Téléchargements</span>
              <button className="text-xs text-accent hover:text-accent/80" onClick={onOpenDownloads}>
                Ouvrir le dossier
              </button>
            </div>
            {downloads.length === 0 && (
              <p className="text-xs text-white/40">Aucun téléchargement pour le moment.</p>
            )}
            {downloads.map((item) => (
              <div key={item.id} className="px-3 py-2 rounded-2xl glass-panel border border-white/5">
                <div className="text-sm text-white/80">{item.fileName}</div>
                <div className="text-xs text-white/40">
                  {(item.receivedBytes / 1024 / 1024).toFixed(2)} Mo / {(item.totalBytes / 1024 / 1024).toFixed(2)} Mo · {item.state}
                </div>
              </div>
            ))}
          </div>
        )}

        {section === 'extensions' && (
          <div className="space-y-2 text-white/60 text-sm">
            <p>Les extensions seront bientôt disponibles. Restez connectés !</p>
          </div>
        )}
      </div>
    </aside>
  );
}

function SidebarButton({ label, active, onClick, icon }: { label: string; active: boolean; onClick(): void; icon: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2 rounded-xl transition ${
        active ? 'bg-accent/30 text-white' : 'text-white/60 hover:text-white hover:bg-white/10'
      }`}
    >
      <span>{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
