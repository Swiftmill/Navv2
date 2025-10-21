import fs from 'fs';
import path from 'path';

class Mutex {
  private promise: Promise<void> = Promise.resolve();

  lock<T>(fn: () => Promise<T>): Promise<T> {
    const res = this.promise.then(fn, fn);
    this.promise = res.then(() => undefined, () => undefined);
    return res;
  }
}

export class AtomicJsonStore<T> {
  private readonly filePath: string;
  private readonly defaults: T;
  private readonly mutex = new Mutex();

  constructor(filePath: string, defaults: T) {
    this.filePath = filePath;
    this.defaults = defaults;
  }

  async read(): Promise<T> {
    return this.mutex.lock(() => this.readUnlocked());
  }

  async write(data: T): Promise<void> {
    return this.mutex.lock(() => this.writeUnlocked(data));
  }

  async update(mutator: (current: T) => T | Promise<T>): Promise<T> {
    return this.mutex.lock(async () => {
      const current = await this.readUnlocked();
      const next = await mutator(current);
      await this.writeUnlocked(next);
      return next;
    });
  }

  private async readUnlocked(): Promise<T> {
    try {
      const content = await fs.promises.readFile(this.filePath, 'utf-8');
      return JSON.parse(content) as T;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        await this.writeUnlocked(this.defaults);
        return this.defaults;
      }
      const corruptedPath = `${this.filePath}.${Date.now()}.bak`;
      await fs.promises.copyFile(this.filePath, corruptedPath).catch(() => undefined);
      await this.writeUnlocked(this.defaults);
      return this.defaults;
    }
  }

  private async writeUnlocked(data: T): Promise<void> {
    await fs.promises.mkdir(path.dirname(this.filePath), { recursive: true });
    const tempPath = `${this.filePath}.tmp`;
    await fs.promises.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    await fs.promises.rename(tempPath, this.filePath);
  }
}
