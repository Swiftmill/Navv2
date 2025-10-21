import { BrowserWindow, app, Notification, shell } from 'electron';
import path from 'path';
import type { DownloadItemInfo } from '../shared/schema';

const downloads: DownloadItemInfo[] = [];

export function registerDownloadHandling(win: BrowserWindow): void {
  const ses = win.webContents.session;
  ses.on('will-download', (event, item) => {
    const downloadPath = path.join(app.getPath('downloads'), item.getFilename());
    item.setSavePath(downloadPath);

    const info: DownloadItemInfo = {
      id: item.getGUID(),
      fileName: item.getFilename(),
      receivedBytes: 0,
      totalBytes: item.getTotalBytes(),
      state: item.getState(),
      url: item.getURL(),
    };
    downloads.push(info);

    item.on('updated', (_event, state) => {
      info.receivedBytes = item.getReceivedBytes();
      info.totalBytes = item.getTotalBytes();
      info.state = state;
      win.webContents.send('downloads:update', downloads);
    });

    item.once('done', (_event, state) => {
      info.state = state;
      win.webContents.send('downloads:update', downloads);
      if (state === 'completed') {
        new Notification({
          title: 'Téléchargement terminé',
          body: info.fileName,
        }).show();
      }
    });
  });
}

export function openDownloadsFolder(): void {
  shell.openPath(app.getPath('downloads'));
}
