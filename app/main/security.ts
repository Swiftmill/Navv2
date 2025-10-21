import { BrowserWindow, shell, app } from 'electron';

const allowedProtocols = new Set(['http:', 'https:', 'hyper:', 'file:']);

export function configureSecurity(win: BrowserWindow): void {
  const ses = win.webContents.session;

  ses.setPermissionRequestHandler((_wc, permission, callback) => {
    const allowed = ['fullscreen', 'notifications', 'media'];
    callback(allowed.includes(permission));
  });

  ses.setCertificateVerifyProc((request, callback) => {
    if (request.hostname.endsWith('.hypergx.local')) {
      callback(0);
      return;
    }
    callback(-3);
  });

  ses.webRequest.onHeadersReceived((details, callback) => {
    const csp = [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "font-src 'self' data:",
      "connect-src 'self' https://*",
      "media-src 'self' data:",
      "frame-src 'self' https://*",
    ].join('; ');

    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [csp],
        'Cross-Origin-Opener-Policy': ["same-origin"],
        'Cross-Origin-Embedder-Policy': ["require-corp"],
      },
    });
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    const protocol = new URL(url).protocol;
    if (!allowedProtocols.has(protocol)) {
      return { action: 'deny' };
    }
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.on('web-contents-created', (_event, contents) => {
  contents.on('will-navigate', (event, url) => {
    const protocol = new URL(url).protocol;
    if (!allowedProtocols.has(protocol)) {
      event.preventDefault();
    }
  });
});
