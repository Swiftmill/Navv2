import { app } from 'electron';
import path from 'path';
import fs from 'fs';

export class DataPaths {
  private baseDir: string;

  constructor(appDir?: string) {
    const appData = app.getPath('appData');
    this.baseDir = appDir ?? path.join(appData, 'HyperGX');
  }

  public resolve(...parts: string[]): string {
    return path.join(this.baseDir, ...parts);
  }

  public ensureStructure(): void {
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
    const adblockDir = this.resolve('adblock-lists');
    if (!fs.existsSync(adblockDir)) {
      fs.mkdirSync(adblockDir, { recursive: true });
    }
  }
}

export const dataPaths = new DataPaths(process.env.HYPER_GX_DATA_DIR);
