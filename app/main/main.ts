import path from 'path';
import { app, BrowserWindow, nativeTheme, protocol, globalShortcut } from 'electron';
import { buildAppMenu } from './app-menu';
import { registerIpcHandlers } from './ipc';
import { configureSecurity } from './security';
import { enableAdblock } from './adblock';
import { registerDownloadHandling } from './download-manager';
import { ensureDataDirectories, settingsStore } from './storage';
import type { SettingsSchema } from '../shared/schema';

const isDev = !app.isPackaged;
let mainWindow: BrowserWindow | null = null;

function getPreloadPath(): string {
  if (isDev) {
    return path.join(__dirname, '../preload/index.ts');
  }
  return path.join(__dirname, '../preload/index.js');
}

async function createWindow(): Promise<void> {
  const settings = await settingsStore.read();
  nativeTheme.themeSource = settings.theme;
  applyPerformanceBudget(settings);

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    title: 'HyperGX',
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#05060d',
    webPreferences: {
      preload: getPreloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false,
      sandbox: true,
      webviewTag: true,
      spellcheck: false,
    },
  });

  buildAppMenu();
  configureSecurity(mainWindow);
  registerDownloadHandling(mainWindow);
  await enableAdblock(mainWindow);

  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    await mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    await mainWindow.loadFile(path.join(__dirname, '../../dist/renderer/index.html'));
  }

  setupShortcuts(mainWindow);
}

function setupShortcuts(win: BrowserWindow): void {
  const shortcuts: Record<string, string> = {
    'CommandOrControl+T': 'new-tab',
    'CommandOrControl+W': 'close-tab',
    'CommandOrControl+Shift+T': 'restore-tab',
    'CommandOrControl+L': 'focus-address',
    'CommandOrControl+Shift+N': 'new-private-window',
    'F11': 'toggle-fullscreen',
    'Control+Tab': 'next-tab',
    'Control+Shift+Tab': 'previous-tab',
  };

  Object.entries(shortcuts).forEach(([accelerator, action]) => {
    globalShortcut.register(accelerator, () => {
      const target = BrowserWindow.getFocusedWindow();
      target?.webContents.send('shortcut', action);
      if (action === 'toggle-fullscreen' && target) {
        target.setFullScreen(!target.isFullScreen());
      }
    });
  });
}

function applyPerformanceBudget(settings: SettingsSchema): void {
  const cpuHeadroom = Math.max(10, Math.min(settings.cpuLimit, 100));
  if (cpuHeadroom < 100) {
    const delay = Math.round((100 - cpuHeadroom) * 5);
    app.commandLine.appendSwitch('disable-renderer-backgrounding');
    app.commandLine.appendSwitch('blink-settings', `background-timer-throttling-max-delay=${delay}`);
  }
  if (settings.ramLimit) {
    app.commandLine.appendSwitch('js-flags', `--max_old_space_size=${Math.max(512, settings.ramLimit)}`);
  }
}

function createHyperProtocol(): void {
  protocol.registerFileProtocol('hyper', (request, callback) => {
    const url = request.url.replace('hyper://', '');
    if (url === 'home') {
      const target = isDev
        ? path.join(__dirname, '../../app/renderer/public/home.html')
        : path.join(__dirname, '../renderer/home.html');
      callback(target);
      return;
    }
    callback({ error: -6 });
  });
}

app.whenReady().then(async () => {
  ensureDataDirectories();
  createHyperProtocol();
  registerIpcHandlers();
  await createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow().catch(console.error);
    }
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
