import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { BookmarkSchema, SettingsSchema } from '../../shared/schema';

interface HomeViewProps {
  settings: SettingsSchema;
  bookmarks: BookmarkSchema[];
  onOpen(url: string): void;
}

const quickLinks = [
  { label: 'YouTube', url: 'https://www.youtube.com', icon: '▶' },
  { label: 'Discord', url: 'https://discord.com', icon: '💬' },
  { label: 'Steam', url: 'https://store.steampowered.com', icon: '🎮' },
  { label: 'Netflix', url: 'https://www.netflix.com', icon: '🎬' },
];

export function HomeView({ settings, bookmarks, onOpen }: HomeViewProps) {
  const featuredBookmarks = useMemo(() => bookmarks.slice(0, 6), [bookmarks]);

  return (
    <div className="relative h-full overflow-hidden">
      {settings.backgroundVideo && (
        <video
          className="absolute inset-0 w-full h-full object-cover opacity-50"
          src={settings.backgroundVideo}
          autoPlay
          loop
          muted
        />
      )}
      <div className="relative z-10 h-full overflow-y-auto p-10 space-y-10 backdrop-blur-sm">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel border border-white/5 rounded-3xl p-8 space-y-6"
        >
          <header className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold">Bienvenue sur HyperGX</h1>
              <p className="text-white/60">Votre quartier général pour naviguer, jouer et créer.</p>
            </div>
            <div className="text-right text-sm text-white/60">
              <p>Météo: 🌤️ 18°C</p>
              <p>Performances: CPU {settings.cpuLimit}% / RAM {settings.ramLimit} Mo</p>
            </div>
          </header>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickLinks.map((item) => (
              <button
                key={item.url}
                onClick={() => onOpen(item.url)}
                className="flex flex-col items-center justify-center gap-3 rounded-2xl glass-panel border border-white/5 py-6 hover:border-accent/50 transition"
              >
                <span className="text-3xl">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel border border-white/5 rounded-3xl p-8 space-y-4">
          <header className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Favoris rapides</h2>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredBookmarks.map((bookmark) => (
              <button
                key={bookmark.id}
                onClick={() => onOpen(bookmark.url)}
                className="flex flex-col items-start gap-2 rounded-2xl glass-panel border border-white/5 p-5 hover:border-accent/50 transition"
              >
                <span className="text-sm font-semibold text-white/90">{bookmark.title}</span>
                <span className="text-xs text-white/60">{bookmark.url}</span>
              </button>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
