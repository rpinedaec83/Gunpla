import fs from 'fs';
import path from 'path';
import {
  Tenant,
  UserRecord,
  MediaAsset,
  EmailOutboxItem,
  KitRecord,
  PaintRecord,
  StashItemRecord,
  PaintRackItemRecord,
  BuildProjectRecord,
  ContestEntryRecord
} from '@gunpla/shared';

export interface PlatformDatabaseState {
  tenants: Tenant[];
  users: UserRecord[];
  mediaAssets: MediaAsset[];
  emailOutbox: EmailOutboxItem[];
  kits: KitRecord[];
  paints: PaintRecord[];
  stashItems: StashItemRecord[];
  paintRackItems: PaintRackItemRecord[];
  builds: BuildProjectRecord[];
  contestEntries: ContestEntryRecord[];
  lastSeededAt: string | null;
}

const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'platform-db.json');

let memoryState: PlatformDatabaseState | null = null;

function createEmptyState(): PlatformDatabaseState {
  return {
    tenants: [],
    users: [],
    mediaAssets: [],
    emailOutbox: [],
    kits: [],
    paints: [],
    stashItems: [],
    paintRackItems: [],
    builds: [],
    contestEntries: [],
    lastSeededAt: null
  };
}

export function getDb(): PlatformDatabaseState {
  if (memoryState) {
    return memoryState;
  }
  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<PlatformDatabaseState>;
      memoryState = {
        tenants: parsed.tenants ?? [],
        users: parsed.users ?? [],
        mediaAssets: parsed.mediaAssets ?? [],
        emailOutbox: parsed.emailOutbox ?? [],
        kits: parsed.kits ?? [],
        paints: parsed.paints ?? [],
        stashItems: parsed.stashItems ?? [],
        paintRackItems: parsed.paintRackItems ?? [],
        builds: parsed.builds ?? [],
        contestEntries: parsed.contestEntries ?? [],
        lastSeededAt: parsed.lastSeededAt ?? null
      };
      return memoryState;
    } catch {
      memoryState = createEmptyState();
      return memoryState;
    }
  }
  memoryState = createEmptyState();
  return memoryState;
}

export function saveDb(state: PlatformDatabaseState = getDb()): void {
  memoryState = state;
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
}
