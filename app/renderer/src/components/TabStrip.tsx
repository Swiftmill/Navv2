import { AnimatePresence, motion } from 'framer-motion';
import type { BrowserTab, TabGroup } from '../state/tabs';
import clsx from 'classnames';

interface TabStripProps {
  tabs: BrowserTab[];
  activeTabId: string | null;
  groups: TabGroup[];
  onSelect(id: string): void;
  onClose(id: string): void;
  onDuplicate(id: string): void;
  onPin(id: string, pinned: boolean): void;
  onGroup(id: string, groupId?: string): void;
  onNewTab(): void;
  onRestoreClosed(): void;
}

export function TabStrip({
  tabs,
  activeTabId,
  groups,
  onSelect,
  onClose,
  onDuplicate,
  onPin,
  onGroup,
  onNewTab,
  onRestoreClosed,
}: TabStripProps) {
  const pinned = tabs.filter((tab) => tab.pinned);
  const regular = tabs.filter((tab) => !tab.pinned);

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-white/10 bg-black/40 backdrop-blur">
      <div className="flex items-center gap-2 flex-1 overflow-hidden">
        <TabSection
          label="Épinglés"
          tabs={pinned}
          activeTabId={activeTabId}
          onSelect={onSelect}
          onClose={onClose}
          onDuplicate={onDuplicate}
          onPin={onPin}
          onGroup={onGroup}
          groups={groups}
        />
        <TabSection
          label="Onglets"
          tabs={regular}
          activeTabId={activeTabId}
          onSelect={onSelect}
          onClose={onClose}
          onDuplicate={onDuplicate}
          onPin={onPin}
          onGroup={onGroup}
          groups={groups}
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onNewTab}
          className="px-3 py-2 rounded-xl bg-accent/20 text-accent hover:bg-accent/30 transition"
        >
          +
        </button>
        <button
          type="button"
          onClick={onRestoreClosed}
          className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20"
        >
          ↺
        </button>
      </div>
    </div>
  );
}

interface TabSectionProps {
  label: string;
  tabs: BrowserTab[];
  activeTabId: string | null;
  onSelect(id: string): void;
  onClose(id: string): void;
  onDuplicate(id: string): void;
  onPin(id: string, pinned: boolean): void;
  onGroup(id: string, groupId?: string): void;
  groups: TabGroup[];
}

function TabSection({ label, tabs, activeTabId, onSelect, onClose, onDuplicate, onPin, onGroup, groups }: TabSectionProps) {
  if (tabs.length === 0) {
    return null;
  }
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs uppercase tracking-wide text-white/40 w-14">{label}</span>
      <div className="flex items-center gap-2 overflow-x-auto max-w-[60vw]">
        <AnimatePresence initial={false}>
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              tab={tab}
              isActive={tab.id === activeTabId}
              onSelect={() => onSelect(tab.id)}
              onClose={() => onClose(tab.id)}
              onDuplicate={() => onDuplicate(tab.id)}
              onPin={(value) => onPin(tab.id, value)}
              onGroup={(groupId) => onGroup(tab.id, groupId)}
              groups={groups}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

interface TabButtonProps {
  tab: BrowserTab;
  isActive: boolean;
  onSelect(): void;
  onClose(): void;
  onDuplicate(): void;
  onPin(pinned: boolean): void;
  onGroup(groupId?: string): void;
  groups: TabGroup[];
}

function TabButton({ tab, isActive, onSelect, onClose, onDuplicate, onPin, onGroup, groups }: TabButtonProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={clsx('px-4 py-2 rounded-2xl glass-panel shadow-glass flex items-center gap-3 min-w-[180px] border border-white/10', {
        'ring-2 ring-accent/60': isActive,
      })}
    >
      <button onClick={onSelect} className="flex-1 text-left truncate">
        <div className="text-sm font-semibold text-white/90 truncate">{tab.title || 'Nouvel onglet'}</div>
        <div className="text-xs text-white/50 truncate">{tab.url}</div>
      </button>
      <div className="flex items-center gap-1 text-sm">
        <button
          onClick={() => onPin(!tab.pinned)}
          className="hover:text-accent transition"
          title={tab.pinned ? 'Désépingler' : 'Épingler'}
        >
          📌
        </button>
        <TabGroupSelector groups={groups} activeGroupId={tab.groupId} onChange={onGroup} />
        <button onClick={onDuplicate} className="hover:text-accent transition" title="Dupliquer">
          ⧉
        </button>
        <button onClick={onClose} className="hover:text-red-400 transition" title="Fermer">
          ×
        </button>
      </div>
    </motion.div>
  );
}

function TabGroupSelector({ groups, activeGroupId, onChange }: { groups: TabGroup[]; activeGroupId?: string; onChange: (groupId?: string) => void }) {
  return (
    <div className="relative group">
      <button
        className="w-3 h-3 rounded-full border border-white/20"
        style={{ backgroundColor: activeGroupId ? groups.find((g) => g.id === activeGroupId)?.color : 'transparent' }}
        title="Groupe"
      />
      <div className="absolute hidden group-hover:flex flex-col gap-2 p-3 rounded-2xl glass-panel border border-white/10 mt-3 z-30">
        {groups.map((group) => (
          <button
            key={group.id}
            className="flex items-center gap-2 text-sm hover:text-accent"
            onClick={() => onChange(group.id)}
          >
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: group.color }} />
            {group.name}
          </button>
        ))}
        <button className="text-xs text-white/60 hover:text-white" onClick={() => onChange(undefined)}>
          Effacer
        </button>
      </div>
    </div>
  );
}
