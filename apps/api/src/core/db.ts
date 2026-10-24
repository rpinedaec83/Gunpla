import fs from 'fs';
import path from 'path';
import {
  Tenant,
  UserRecord,
  MediaAsset,
  EmailOutboxItem
} from '@gunpla/shared';

export interface PlatformDatabaseState {
  tenants: Tenant[];
  users: UserRecord[];
  mediaAssets: MediaAsset[];
  emailOutbox: EmailOutboxItem[];
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
      memoryState = JSON.parse(raw) as PlatformDatabaseState;
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
