import { seedPlatformDatabase } from './seed-legacy';

const state = seedPlatformDatabase(true);
console.log(
  JSON.stringify(
    {
      status: 'seeded',
      tenantsCount: state.tenants.length,
      usersCount: state.users.length,
      foundingBuildersCount: state.users.filter((u) => u.isFounder).length,
      mediaAssetsCount: state.mediaAssets.length,
      lastSeededAt: state.lastSeededAt
    },
    null,
    2
  )
);
