import path from 'path';
import { BrowserWindow } from 'electron';
import { ElectronBlocker, Request } from '@cliqz/adblocker-electron';
import fetch from 'node-fetch';
import { dataPaths } from './data-paths';

let blocker: ElectronBlocker | null = null;

async function ensureBlocker(): Promise<ElectronBlocker> {
  if (blocker) {
    return blocker;
  }
  const listPath = path.join(dataPaths.resolve('adblock-lists'), 'easylist.txt');
  blocker = await ElectronBlocker.fromLists(fetch, [listPath]);
  return blocker;
}

export async function enableAdblock(win: BrowserWindow): Promise<void> {
  const instance = await ensureBlocker();
  instance.enableBlockingInSession(win.webContents.session);
}

export function shouldBlockRequest(request: Request): boolean {
  if (!blocker) {
    return false;
  }
  return blocker.isBlockedSync(request);
}
