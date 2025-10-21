import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { AtomicJsonStore } from '../../storage/fileStore';

describe('AtomicJsonStore', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'hypergx-test-'));
  });

  afterEach(async () => {
    await fs.promises.rm(dir, { recursive: true, force: true });
  });

  it('writes and reads data atomiquement', async () => {
    const filePath = path.join(dir, 'settings.json');
    const store = new AtomicJsonStore(filePath, { theme: 'dark' });
    const data = await store.read();
    expect(data).toEqual({ theme: 'dark' });

    await store.write({ theme: 'light' });
    const next = await store.read();
    expect(next.theme).toBe('light');
  });

  it('restaure les valeurs par défaut si fichier corrompu', async () => {
    const filePath = path.join(dir, 'settings.json');
    const store = new AtomicJsonStore(filePath, { theme: 'dark' });

    await fs.promises.writeFile(filePath, 'not-json', 'utf-8');
    const data = await store.read();
    expect(data).toEqual({ theme: 'dark' });
    const backups = await fs.promises.readdir(dir);
    expect(backups.some((name) => name.includes('.bak'))).toBe(true);
  });
});
