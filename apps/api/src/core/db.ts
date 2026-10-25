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
  ContestRecord,
  ContestEntryRecord,
  MarketplaceListingRecord,
  CommissionBuilderRecord,
  CommissionRequestRecord,
  ShopRecord,
  ShopStockItem
} from '@gunpla/shared';
import { isPostgresConfigured, syncStateToPostgres } from './postgres';

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
  contests: ContestRecord[];
  contestEntries: ContestEntryRecord[];
  marketplaceListings: MarketplaceListingRecord[];
  commissionBuilders: CommissionBuilderRecord[];
  commissionRequests: CommissionRequestRecord[];
  shops: ShopRecord[];
  shopStock: ShopStockItem[];
  lastSeededAt: string | null;
}

const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'platform-db.json');

let memoryState: PlatformDatabaseState | null = null;
let isSyncing = false;
let pendingStateToSync: PlatformDatabaseState | null = null;

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
    contests: [],
    contestEntries: [],
    marketplaceListings: [],
    commissionBuilders: [],
    commissionRequests: [],
    shops: [],
    shopStock: [],
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
        contests: parsed.contests ?? [],
        contestEntries: parsed.contestEntries ?? [],
        marketplaceListings: parsed.marketplaceListings ?? [],
        commissionBuilders: parsed.commissionBuilders ?? [],
        commissionRequests: parsed.commissionRequests ?? [],
        shops: parsed.shops ?? [],
        shopStock: parsed.shopStock ?? [],
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

async function triggerPostgresSync(state: PlatformDatabaseState): Promise<void> {
  if (isSyncing) {
    pendingStateToSync = state;
    return;
  }
  isSyncing = true;
  pendingStateToSync = null;
  try {
    await syncStateToPostgres(state);
  } catch (err: any) {
    console.error('[Postgres Sync Background Error]:', err.message);
  } finally {
    isSyncing = false;
    if (pendingStateToSync) {
      const nextState = pendingStateToSync;
      pendingStateToSync = null;
      triggerPostgresSync(nextState).catch(() => {});
    }
  }
}

export function saveDb(state: PlatformDatabaseState = getDb()): void {
  memoryState = state;
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');

  // Asynchronously synchronize state into PostgreSQL if configured with queuing/debouncing
  if (isPostgresConfigured()) {
    triggerPostgresSync(state).catch((err) => {
      console.error('[Postgres Queue Error]:', err.message);
    });
  }
}
