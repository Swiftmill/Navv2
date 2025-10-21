import path from 'path';
import { spawn } from 'child_process';
import waitOn from 'wait-on';

const electronBinary = require('electron') as string;

async function start() {
  await waitOn({ resources: ['http-get://127.0.0.1:5173'], timeout: 30000 });

  const mainEntry = path.join(__dirname, 'main.ts');
  const child = spawn(
    electronBinary,
    ['-r', 'ts-node/register/transpile-only', mainEntry],
    {
      stdio: 'inherit',
      env: {
        ...process.env,
        VITE_DEV_SERVER_URL: 'http://127.0.0.1:5173',
      },
    },
  );

  child.on('close', (code) => {
    if (code !== null) {
      process.exit(code);
    }
  });
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
