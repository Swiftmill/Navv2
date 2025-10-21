import { useEffect, useRef } from 'react';
import type { WebviewTag } from 'electron';
import type { BrowserTab } from '../state/tabs';

interface WebviewStackProps {
  tabs: BrowserTab[];
  activeTabId: string | null;
  onNavigate: (url: string, tab: BrowserTab, title?: string) => void;
  onTitle: (id: string, title: string) => void;
}

export function WebviewStack({ tabs, activeTabId, onNavigate, onTitle }: WebviewStackProps) {
  return (
    <div className="absolute inset-0 bg-black/60">
      {tabs.map((tab) => (
        <WebviewItem
          key={tab.id}
          tab={tab}
          hidden={tab.id !== activeTabId}
          onNavigate={onNavigate}
          onTitle={onTitle}
        />
      ))}
    </div>
  );
}

interface WebviewItemProps {
  tab: BrowserTab;
  hidden: boolean;
  onNavigate: (url: string, tab: BrowserTab, title?: string) => void;
  onTitle: (id: string, title: string) => void;
}

function WebviewItem({ tab, hidden, onNavigate, onTitle }: WebviewItemProps) {
  const ref = useRef<WebviewTag>(null);

  useEffect(() => {
    const webview = ref.current;
    if (!webview) return;
    const handleDidNavigate = (_event: unknown, url: string) => onNavigate(url, tab);
    const handlePageTitleUpdated = (_event: unknown, title: string) => onTitle(tab.id, title);
    const handleDidFinishLoad = () => {
      if (webview.getTitle()) {
        onTitle(tab.id, webview.getTitle());
      }
    };

    webview.addEventListener('did-navigate', handleDidNavigate as never);
    webview.addEventListener('page-title-updated', handlePageTitleUpdated as never);
    webview.addEventListener('did-finish-load', handleDidFinishLoad as never);

    return () => {
      webview.removeEventListener('did-navigate', handleDidNavigate as never);
      webview.removeEventListener('page-title-updated', handlePageTitleUpdated as never);
      webview.removeEventListener('did-finish-load', handleDidFinishLoad as never);
    };
  }, [tab.id, tab.url]);

  useEffect(() => {
    const webview = ref.current;
    if (webview && webview.getURL() !== tab.url) {
      webview.loadURL(tab.url);
    }
  }, [tab.url]);

  return (
    <webview
      ref={ref}
      data-tab-id={tab.id}
      src={tab.url}
      className="absolute inset-0"
      allowpopups="true"
      style={{ display: hidden ? 'none' : 'flex' }}
      partition={tab.isPrivate ? 'persist:private' : undefined}
    />
  );
}
