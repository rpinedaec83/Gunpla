export type RoleName = 'user' | 'moderator' | 'tenant_admin' | 'admin';

export type AuthProviderType = 'local' | 'google';

export type ScaleCategory =
  | 'gunpla-mecha'
  | 'military'
  | 'aviation'
  | 'automotive'
  | 'naval'
  | 'figures'
  | 'scifi'
  | 'diorama';

export interface TenantThemeConfig {
  primaryColor: string;
  accentColor: string;
  surfaceColor: string;
  logoText: string;
  logoUrl?: string;
  uxPatternId: string;
}

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  domain: string;
  emailFrom: string;
  contactEmail: string;
  tagline: string;
  mission: string;
  vision: string;
  allowedCategories: ScaleCategory[];
  themeConfig: TenantThemeConfig;
  communityLinks: {
    facebookGroup?: string;
    whatsappGroup?: string;
    googleDrive?: string;
    gundamHobbyLife?: string;
    trustedShopsCatalog?: string;
  };
  createdBy?: string;
  createdAt: string;
}

export interface MediaAsset {
  id: string;
  builderUsername: string;
  buildId?: string;
  fileName: string;
  thumbUrl: string;
  fullUrl: string;
  category: ScaleCategory;
  title: string;
  altText: string;
  createdAt: string;
}

export interface UserRecord {
  id: string;
  username: string;
  displayName: string;
  email: string;
  passwordHash: string | null;
  googleId: string | null;
  authProviders: AuthProviderType[];
  roles: RoleName[];
  primaryTenantSlug: string;
  bio: string;
  avatarUrl?: string;
  socialLinks: string[];
  specialties?: string[];
  whatsapp?: string;
  isFounder: boolean;
  birthYear?: number;
  isAdult?: boolean;
  ageBracket?: 'under_14' | 'minor_14_17' | 'adult_18_plus';
  contestBadges?: ContestAwardBadge[];
  createdAt: string;
}

export interface PublicBuilderProfile {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl?: string;
  primaryTenantSlug: string;
  socialLinks: string[];
  specialties?: string[];
  whatsapp?: string;
  isFounder: boolean;
  isAdult?: boolean;
  photoCount: number;
  photos: MediaAsset[];
  contestBadges?: ContestAwardBadge[];
  createdAt: string;
}

export interface UpdateUserProfileRequest {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  socialLinks?: string[];
  specialties?: string[];
  whatsapp?: string;
}

export interface EmailOutboxItem {
  id: string;
  tenantSlug: string;
  from: string;
  to: string[];
  replyTo?: string;
  subject: string;
  html: string;
  provider: 'resend-live' | 'resend-sandbox';
  resendMessageId?: string;
  status: 'sent' | 'queued-sandbox' | 'failed';
  createdAt: string;
}

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  invalidParams?: Array<{ name: string; reason: string }>;
}

export type PaintType = 'lacquer' | 'acrylic' | 'polyurethane' | 'spray_graffiti' | 'enamel' | 'oil' | 'primer';

export type PaintMedium = 'lacquer' | 'acrylic' | 'polyurethane' | 'montana_colors';

export type PaintFinish = 'gloss' | 'flat/matte' | 'semi-gloss' | 'metallic' | 'clear' | 'satin';

export interface PaintRecord {
  id: string;
  brand: string;
  line: string;
  code: string;
  name: string;
  type: PaintType;
  finish: PaintFinish;
  hexColor: string;
  createdAt: string;
}

export interface KitRecord {
  id: string;
  name: string;
  brand: string;
  scale: string;
  grade?: string;
  category: ScaleCategory;
  kitNumber?: string;
  releaseYear?: number;
  boxartUrl?: string;
  scalematesUrl?: string;
  manualUrl?: string;
  barcode?: string;
  model3dUrl?: string;
  model3dFormat?: 'glb' | 'gltf' | 'obj' | 'procedural';
  source: 'manual' | 'scalemates' | 'scalemates-fallback' | 'user-import';
  createdAt: string;
}

export type DioramaLightingPreset = 'studio' | 'neon-scifi' | 'sunset' | 'military-hangar' | 'clay-primer';
export type DioramaViewMode = 'shaded' | 'wireframe' | 'clay' | 'matcap';
export type DioramaCameraAngle = 'perspective' | 'isometric' | 'top' | 'front' | 'hero';

export interface KitModel3dMetadata {
  kitId: string;
  kitName: string;
  brand: string;
  scale: string;
  category: ScaleCategory;
  modelUrl: string;
  modelFormat: 'glb' | 'gltf' | 'obj' | 'procedural';
  meshType: 'mecha' | 'tank' | 'aircraft' | 'car' | 'warship' | 'humanoid';
  realHeightMeters: number;
  physicalHeightMm: number;
  humanFigureScaleMm: number;
  defaultLighting: DioramaLightingPreset;
  defaultViewMode: DioramaViewMode;
  arSupported: boolean;
  dioramaGroundSizeMeters: number;
}

export interface KitModel3dResponse {
  kit: KitRecord;
  model3d: KitModel3dMetadata;
}

export function resolveKitModel3d(kit: KitRecord): KitModel3dMetadata {
  let meshType: 'mecha' | 'tank' | 'aircraft' | 'car' | 'warship' | 'humanoid' = 'mecha';
  if (kit.category === 'military') meshType = 'tank';
  else if (kit.category === 'aviation') meshType = 'aircraft';
  else if (kit.category === 'automotive') meshType = 'car';
  else if (kit.category === 'naval') meshType = 'warship';
  else if (kit.category === 'figures') meshType = 'humanoid';

  const scaleStr = (kit.scale || '1/144').trim();
  let realHeightMeters = 18.0; // Standard 18m Gundam
  let physicalHeightMm = 125.0; // 12.5 cm for 1/144
  let humanFigureScaleMm = 12.5;
  let groundSize = 25.0;

  if (scaleStr === '1/144') {
    realHeightMeters = 18.0;
    physicalHeightMm = 125.0;
    humanFigureScaleMm = 12.5;
    groundSize = 30.0;
  } else if (scaleStr === '1/100') {
    realHeightMeters = 18.0;
    physicalHeightMm = 180.0;
    humanFigureScaleMm = 18.0;
    groundSize = 35.0;
  } else if (scaleStr === '1/35') {
    realHeightMeters = 3.0; // Tank height ~3m, length ~8m
    physicalHeightMm = 85.0;
    humanFigureScaleMm = 51.4; // 1.8m / 35
    groundSize = 15.0;
  } else if (scaleStr === '1/48') {
    realHeightMeters = 3.8; // Spitfire
    physicalHeightMm = 79.0;
    humanFigureScaleMm = 37.5;
    groundSize = 20.0;
  } else if (scaleStr === '1/24') {
    realHeightMeters = 1.35; // Sports car
    physicalHeightMm = 56.0;
    humanFigureScaleMm = 75.0;
    groundSize = 10.0;
  } else if (scaleStr === '1/450' || scaleStr === '1/700') {
    realHeightMeters = 50.0; // Battleship
    physicalHeightMm = 111.0;
    humanFigureScaleMm = 4.0;
    groundSize = 300.0;
  } else if (scaleStr === '1/1') {
    realHeightMeters = 0.14; // Megami Device
    physicalHeightMm = 140.0;
    humanFigureScaleMm = 140.0;
    groundSize = 1.0;
  }

  const defaultLighting: DioramaLightingPreset =
    kit.category === 'military'
      ? 'military-hangar'
      : kit.category === 'automotive'
      ? 'sunset'
      : 'studio';

  return {
    kitId: kit.id,
    kitName: kit.name,
    brand: kit.brand,
    scale: kit.scale,
    category: kit.category,
    modelUrl: kit.model3dUrl || `/assets/models/kits/${kit.id}.glb`,
    modelFormat: kit.model3dFormat || 'procedural',
    meshType,
    realHeightMeters,
    physicalHeightMm,
    humanFigureScaleMm,
    defaultLighting,
    defaultViewMode: 'shaded',
    arSupported: true,
    dioramaGroundSizeMeters: groundSize
  };
}

export interface BrandSummary {
  brand: string;
  kitCount: number;
  categories: ScaleCategory[];
}

export interface ScalematesImportRequest {
  scalematesUrl: string;
  categoryOverride?: ScaleCategory;
}

export interface ScalematesImportResponse {
  kit: KitRecord;
  imported: boolean;
  isExisting: boolean;
  warnings?: string[];
}

export type StashStatus = 'unbuilt' | 'in_progress' | 'built' | 'wishlist' | 'for_trade';

export interface StashItemRecord {
  id: string;
  userId: string;
  kitId: string;
  kit?: KitRecord;
  status: StashStatus;
  rating?: number;
  notes?: string;
  pricePaid?: number;
  currency?: string;
  acquiredAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type PaintRackStatus = 'owned' | 'low_stock' | 'wishlist';

export interface PaintRackItemRecord {
  id: string;
  userId: string;
  paintId: string;
  paint?: PaintRecord;
  status: PaintRackStatus;
  quantity: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkbenchSummary {
  totalStash: number;
  unbuiltCount: number;
  inProgressCount: number;
  builtCount: number;
  wishlistCount: number;
  forTradeCount: number;
  totalPaints: number;
  ownedPaintsCount: number;
  lowStockPaintsCount: number;
  wishlistPaintsCount: number;
}

export interface CreateStashItemRequest {
  kitId: string;
  status?: StashStatus;
  rating?: number;
  notes?: string;
  pricePaid?: number;
  currency?: string;
  acquiredAt?: string;
}

export interface UpdateStashItemRequest {
  status?: StashStatus;
  rating?: number;
  notes?: string;
  pricePaid?: number;
  currency?: string;
  acquiredAt?: string;
  completedAt?: string;
}

export type BarcodeFormat = 'JAN-13' | 'JAN-8' | 'EAN-13' | 'UPC-A' | 'UPC-E' | 'CODE-128' | 'OTHER';

export interface BarcodeLookupResponse {
  barcode: string;
  normalizedBarcode: string;
  found: boolean;
  kit?: KitRecord;
  manufacturerHint?: string;
  format: BarcodeFormat;
}

export interface ScanStashRequest {
  barcode: string;
  status?: StashStatus;
  notes?: string;
  pricePaid?: number;
  currency?: string;
  kitName?: string;
  brand?: string;
  scale?: string;
  grade?: string;
  category?: ScaleCategory;
}

export interface ScanStashResponse {
  stashItem: StashItemRecord;
  kit: KitRecord;
  createdKit: boolean;
  message: string;
}

export function normalizeBarcode(raw: string): string {
  if (!raw) return '';
  return raw.trim().replace(/[^a-zA-Z0-9]/g, '');
}

export function detectBarcodeFormat(normalized: string): BarcodeFormat {
  if (!normalized) return 'OTHER';
  const isDigits = /^\d+$/.test(normalized);
  if (isDigits) {
    if (normalized.length === 13) {
      if (normalized.startsWith('45') || normalized.startsWith('49')) {
        return 'JAN-13';
      }
      return 'EAN-13';
    }
    if (normalized.length === 8) {
      if (normalized.startsWith('45') || normalized.startsWith('49')) {
        return 'JAN-8';
      }
      return 'UPC-E';
    }
    if (normalized.length === 12) {
      return 'UPC-A';
    }
  }
  if (normalized.length >= 4 && normalized.length <= 48) {
    return 'CODE-128';
  }
  return 'OTHER';
}

export function getManufacturerHintFromBarcode(normalized: string): string | undefined {
  if (!normalized) return undefined;
  if (normalized.startsWith('4573102')) return 'Bandai Spirits';
  if (normalized.startsWith('4543112') || normalized.startsWith('4549660') || normalized.startsWith('4902425')) return 'Bandai';
  if (normalized.startsWith('4950344')) return 'Tamiya';
  if (normalized.startsWith('4934054')) return 'Kotobukiya';
  if (normalized.startsWith('4967834')) return 'Hasegawa';
  if (normalized.startsWith('4905083')) return 'Aoshima';
  if (normalized.startsWith('4545784')) return 'Max Factory';
  if (normalized.startsWith('4580416')) return 'Good Smile Company';
  if (normalized.startsWith('4537807')) return 'Kaiyodo';
  if (normalized.startsWith('4571337')) return 'Wave Corporation';
  if (normalized.startsWith('4009803')) return 'Revell';
  if (normalized.startsWith('8429551')) return 'Vallejo';
  return undefined;
}

export interface CreatePaintRackItemRequest {
  paintId: string;
  status?: PaintRackStatus;
  quantity?: number;
  notes?: string;
}

export interface UpdatePaintRackItemRequest {
  status?: PaintRackStatus;
  quantity?: number;
  notes?: string;
}

export type BuildStepStage =
  | 'unboxing'
  | 'assembly'
  | 'assembly_inner_frame'
  | 'modification'
  | 'priming'
  | 'painting'
  | 'decals'
  | 'weathering'
  | 'final_reveal'
  | (string & {});

export interface PaintRecipeUsage {
  paintId: string;
  paint?: PaintRecord;
  partDescription?: string;
  role?: string;
  mixRatio?: string;
  thinnerRatio?: string;
  technique?: string;
}

export interface PaintConversionRequest {
  sourceBrand?: string;
  sourceCode: string;
  targetMedium?: PaintMedium;
  targetBrand?: string;
  checkUserRack?: boolean;
}

export interface PaintConversionMatch {
  brand: string;
  code: string;
  name: string;
  line: string;
  type: string;
  finish: string;
  hexColor: string;
  similarity: 'exact' | 'very_close' | 'close' | 'approximate';
  ownedInRack?: boolean;
  rackQuantity?: number;
}

export interface PaintConversionResult {
  source: {
    brand: string;
    code: string;
    name?: string;
    hexColor?: string;
    type?: string;
  };
  matches: PaintConversionMatch[];
  airbrushGuide: {
    recommendedThinner: string;
    thinningRatio: string;
    recommendedPSI: string;
    dryingTime: string;
    proTips: string;
  };
}

export interface PaintRecipeAiRequest {
  query: string;
  preferredMedium?: PaintMedium;
  preferredBrand?: string;
  style?: 'anime_accurate' | 'weathered_realistic' | 'candy_metallic' | 'stealth_matte';
}

export interface PaintRecipeAiComponent {
  partOrTonalStep: string;
  recommendedPaint: string;
  brand: string;
  code: string;
  hexColor: string;
  percentage?: number;
  inUserRack?: boolean;
}

export interface PaintRecipeAiResponse {
  recipeName: string;
  description: string;
  aiEngine: 'gemini-3.8-flash' | 'gemini-3.5-flash-lite' | 'expert-local-rules';
  colorPaletteHex: string[];
  components: PaintRecipeAiComponent[];
  mixingInstructions: string;
  airbrushApplication: {
    primer: string;
    baseCoat: string;
    shadingOrHighlight: string;
    topCoat: string;
    thinnerRatio: string;
    psi: string;
  };
}

export interface BuildStep {
  id: string;
  buildId: string;
  stage: BuildStepStage;
  orderIndex: number;
  title: string;
  description: string;
  photoUrls: string[];
  paintUsages: PaintRecipeUsage[];
  createdAt: string;
}

export interface BuildComment {
  id: string;
  buildId: string;
  userId: string;
  username: string;
  userDisplayName: string;
  comment: string;
  createdAt: string;
}

export interface BuildProjectRecord {
  id: string;
  slug: string;
  userId: string;
  username: string;
  userDisplayName: string;
  kitId?: string;
  kit?: KitRecord;
  category: ScaleCategory;
  scale?: string;
  grade?: string;
  title: string;
  subtitle?: string;
  status: 'wip' | 'completed' | 'paused' | 'in_progress';
  coverImageUrl?: string;
  likeCount: number;
  likedByUserIds: string[];
  viewCount: number;
  steps: BuildStep[];
  comments: BuildComment[];
  expenses?: BuildExpenseItem[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateBuildProjectRequest {
  kitId?: string;
  title: string;
  category?: ScaleCategory;
  categoryOverride?: ScaleCategory;
  scale?: string;
  grade?: string;
  subtitle?: string;
  status?: 'wip' | 'completed' | 'paused' | 'in_progress';
  coverImageUrl?: string;
  tags?: string[];
}

export interface UpdateBuildProjectRequest {
  title?: string;
  subtitle?: string;
  status?: 'wip' | 'completed' | 'paused' | 'in_progress';
  coverImageUrl?: string;
  tags?: string[];
}

export interface CreateBuildStepRequest {
  stage: BuildStepStage;
  title: string;
  description?: string;
  photoUrls?: string[];
  paintUsages?: PaintRecipeUsage[];
}

export interface UpdateBuildStepRequest {
  stage?: BuildStepStage;
  title?: string;
  description?: string;
  photoUrls?: string[];
  orderIndex?: number;
  paintUsages?: PaintRecipeUsage[];
}

export interface ReorderBuildStepsRequest {
  stepIds: string[];
}

export interface CreateBuildCommentRequest {
  comment: string;
}

export type BuildExpenseCategory =
  | 'kit'
  | 'paint'
  | 'consumable'
  | 'aftermarket'
  | 'decal'
  | 'labor'
  | 'other';

export type ExpenseCurrency = 'USD' | 'PEN' | 'EUR';

export interface BuildExpenseItem {
  id: string;
  buildId: string;
  category: BuildExpenseCategory;
  name: string;
  amount: number;
  currency: ExpenseCurrency;
  paintId?: string;
  paintBottleFraction?: number;
  laborHours?: number;
  notes?: string;
  createdAt: string;
}

export interface BuildCostSummary {
  buildId: string;
  currency: ExpenseCurrency;
  totalCost: number;
  breakdownByCategory: Record<BuildExpenseCategory, number>;
  expenses: BuildExpenseItem[];
  totalLaborHours: number;
  suggestedCommissionPrice: number;
  laborHourlyRate: number;
}

export interface AddExpenseRequest {
  category: BuildExpenseCategory;
  name: string;
  amount: number;
  currency?: ExpenseCurrency;
  paintId?: string;
  paintBottleFraction?: number;
  laborHours?: number;
  notes?: string;
}

export interface BuildCostResponse {
  buildId: string;
  buildTitle: string;
  currency: ExpenseCurrency;
  summary: BuildCostSummary;
}

export function calculateBuildCostSummary(
  buildId: string,
  expenses: BuildExpenseItem[] = [],
  laborHourlyRate: number = 15,
  defaultCurrency: ExpenseCurrency = 'USD'
): BuildCostSummary {
  const breakdown: Record<BuildExpenseCategory, number> = {
    kit: 0,
    paint: 0,
    consumable: 0,
    aftermarket: 0,
    decal: 0,
    labor: 0,
    other: 0
  };

  let totalCost = 0;
  let totalLaborHours = 0;
  let currency = defaultCurrency;

  for (const exp of expenses) {
    const amt = typeof exp.amount === 'number' && !isNaN(exp.amount) ? exp.amount : 0;
    const cat = exp.category || 'other';
    if (breakdown[cat] !== undefined) {
      breakdown[cat] = Math.round((breakdown[cat] + amt) * 100) / 100;
    } else {
      breakdown.other = Math.round((breakdown.other + amt) * 100) / 100;
    }
    totalCost = Math.round((totalCost + amt) * 100) / 100;
    if (exp.currency) {
      currency = exp.currency;
    }
    if (exp.laborHours && typeof exp.laborHours === 'number') {
      totalLaborHours = Math.round((totalLaborHours + exp.laborHours) * 10) / 10;
    }
  }

  const materialsCost =
    breakdown.kit + breakdown.paint + breakdown.consumable + breakdown.aftermarket + breakdown.decal + breakdown.other;
  const laborCost = breakdown.labor > 0 ? breakdown.labor : totalLaborHours * laborHourlyRate;
  const suggestedCommissionPrice = Math.round(((materialsCost * 1.25) + laborCost) * 100) / 100;

  return {
    buildId,
    currency,
    totalCost,
    breakdownByCategory: breakdown,
    expenses,
    totalLaborHours,
    suggestedCommissionPrice,
    laborHourlyRate
  };
}

export interface UploadMediaResponse {
  media: MediaAsset;
  thumbUrl: string;
  fullUrl: string;
}

export interface JudgeRubricCriteria {
  assembly: number;   // 1 - 10: Mold lines, nubs, fitment, alignment
  painting: number;   // 1 - 10: Smoothness, opacity, coverage, color separation
  finish: number;     // 1 - 10: Decals, panel lining, weathering, clear coat
  creativity: number; // 1 - 10: Posing, difficulty, presentation, diorama
}

export interface JudgeScoreRecord {
  id: string;
  entryId: string;
  judgeUserId: string;
  judgeUsername: string;
  judgeDisplayName: string;
  scores: JudgeRubricCriteria;
  totalScore: number; // 4 - 40
  feedback?: string;
  createdAt: string;
}

export interface ContestEntryRecord {
  id: string;
  contestId: string;
  buildId: string;
  build?: BuildProjectRecord;
  userId: string;
  username: string;
  userDisplayName: string;
  title: string;
  category: ScaleCategory;
  coverImageUrl?: string;
  voteCount: number;
  votedByUserIds: string[];
  judgeScores?: JudgeScoreRecord[];
  judgeScoreAverage?: number;
  judgeCount?: number;
  status: 'submitted' | 'approved' | 'disqualified';
  createdAt: string;
}

export interface CreateContestEntryRequest {
  buildId: string;
}

export interface VoteContestEntryResponse {
  voted: boolean;
  voteCount: number;
}

export interface ContestCertificateRecord {
  certificateId: string;
  verificationCode: string;
  contestTitle: string;
  tenantSlug: string;
  category: ScaleCategory;
  builderName: string;
  entryTitle: string;
  rank: number;
  rankTitle: string;
  judgeAverageScore?: number;
  voteCount: number;
  qrCodeDataUrl: string;
  verifyUrl: string;
  issuedAt: string;
  organizerSignatures: { title: string; name: string }[];
  htmlTemplate?: string;
}

export type SpecCardFormat = 'flat' | 'tent';
export type SpecCardTheme = 'light_ink_saver' | 'dark_mecha';

export interface GenerateSpecCardRequest {
  buildIdOrSlug: string;
  contestName?: string;
  entryCode?: string;
  widthMm: number;
  heightMm: number;
  format?: SpecCardFormat;
  theme?: SpecCardTheme;
  includeQr?: boolean;
  includeCoverImage?: boolean;
  includePaints?: boolean;
  includeJudgeScoreBox?: boolean;
  customNotes?: string;
}

export interface GenerateSpecCardResponse {
  build: BuildProjectRecord;
  qrDataUrl: string;
  qrSvg: string;
  targetUrl: string;
  widthMm: number;
  heightMm: number;
  format: SpecCardFormat;
  theme: SpecCardTheme;
  htmlPreview: string;
}

export interface ContestRecord {
  id: string;
  slug: string;
  title: string;
  description: string;
  tenantSlug: 'plamoscale' | 'gunplajunkies' | 'all';
  category: ScaleCategory;
  bannerUrl: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'judging' | 'completed';
  rules: string[];
  prizes: string[];
  participantsCount: number;
  entries?: ContestEntryRecord[];
}

export type ContestAwardType = 'gold' | 'silver' | 'bronze' | 'community_choice' | 'judge_mention';

export interface ContestAwardBadge {
  id: string;
  contestId: string;
  contestTitle: string;
  tenantSlug: 'plamoscale' | 'gunplajunkies' | 'all';
  entryId: string;
  entryTitle: string;
  awardType: ContestAwardType;
  awardTitle: string;
  medalIcon: string;
  rank: number;
  judgeAverageScore?: number;
  voteCount: number;
  awardedAt: string;
  certificateUrl?: string;
}

export interface HallOfFameItem {
  id: string;
  contestId: string;
  contestTitle: string;
  contestStatus: 'upcoming' | 'active' | 'judging' | 'completed';
  tenantSlug: 'plamoscale' | 'gunplajunkies' | 'all';
  category: ScaleCategory;
  entryId: string;
  entryTitle: string;
  coverImageUrl?: string;
  buildId: string;
  userId: string;
  username: string;
  userDisplayName: string;
  awardType: ContestAwardType;
  awardTitle: string;
  medalIcon: string;
  rank: number;
  judgeAverageScore?: number;
  voteCount: number;
  awardedAt: string;
  certificateUrl?: string;
}

export interface ContestPodiumResult {
  contestId: string;
  contestTitle: string;
  contestStatus: 'upcoming' | 'active' | 'judging' | 'completed';
  tenantSlug: 'plamoscale' | 'gunplajunkies' | 'all';
  podium: HallOfFameItem[];
  peoplesChoice?: HallOfFameItem;
}

export type GroupBuildStatus = 'upcoming' | 'active' | 'completed';

export interface GroupBuildEntry {
  id: string;
  groupBuildId: string;
  buildId: string;
  userId: string;
  username: string;
  userDisplayName?: string;
  buildTitle: string;
  buildSlug?: string;
  coverImageUrl?: string;
  stage?: string;
  stepsCount?: number;
  joinedAt: string;
}

export interface GroupBuildRecord {
  id: string;
  tenantSlug: 'plamoscale' | 'gunplajunkies' | 'all';
  title: string;
  slug: string;
  description: string;
  rules: string[];
  bannerImageUrl?: string;
  startDate: string;
  endDate: string;
  status: GroupBuildStatus;
  creatorUserId: string;
  creatorUsername: string;
  creatorDisplayName?: string;
  category?: ScaleCategory | 'all';
  entries: GroupBuildEntry[];
  participantsCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateGroupBuildRequest {
  title: string;
  description: string;
  rules?: string[];
  bannerImageUrl?: string;
  startDate: string;
  endDate: string;
  category?: ScaleCategory | 'all';
}

export interface JoinGroupBuildRequest {
  buildId: string;
}

export interface ShopStockItem {
  id: string;
  shopId: string;
  kitId?: string;
  kitName: string;
  brand: string;
  scale?: string;
  grade?: string;
  category?: ScaleCategory;
  pricePEN: number;
  inStock: boolean;
  stockCount?: number;
  discountPercentage?: number;
  promoLabel?: string;
  shopUrl?: string;
  lastUpdated: string;
}

export interface WishlistStockAlert {
  stashItemId: string;
  kitId: string;
  kitName: string;
  brand: string;
  scale?: string;
  shopId: string;
  shopName: string;
  shopCity: string;
  pricePEN: number;
  discountPercentage?: number;
  promoLabel?: string;
  shopWhatsappUrl?: string;
  shopCatalogUrl?: string;
  shopWebsiteUrl?: string;
  inStock: boolean;
  matchedAt: string;
}

export interface ShopRecord {
  id: string;
  name: string;
  description: string;
  country: string;
  city: string;
  websiteUrl?: string;
  catalogUrl?: string;
  whatsappUrl?: string;
  instagramUrl?: string;
  specialties: string[];
  isVerified: boolean;
  stockItems?: ShopStockItem[];
}

export type BoxCondition = 'mint_sealed' | 'opened_complete' | 'started' | 'damaged_box';
export type MarketplaceType = 'sale' | 'trade' | 'both';
export type MarketplaceStatus = 'active' | 'reserved' | 'completed' | 'cancelled';

export interface MarketplaceListingRecord {
  id: string;
  stashItemId?: string;
  kitId: string;
  kit?: KitRecord;
  userId: string;
  username: string;
  userDisplayName: string;
  type: MarketplaceType;
  price?: number;
  currency?: string;
  boxCondition: BoxCondition;
  notes: string;
  contactWhatsapp?: string;
  contactLocation: string;
  category: ScaleCategory;
  status: MarketplaceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMarketplaceListingRequest {
  stashItemId?: string;
  kitId: string;
  type?: MarketplaceType;
  price?: number;
  currency?: string;
  boxCondition?: BoxCondition;
  notes?: string;
  contactWhatsapp?: string;
  contactLocation?: string;
}

export interface UpdateMarketplaceListingRequest {
  price?: number;
  currency?: string;
  status?: MarketplaceStatus;
  notes?: string;
  contactWhatsapp?: string;
  contactLocation?: string;
}

export interface CreateListingInquiryRequest {
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string;
  message: string;
  offerPrice?: number;
}

export interface ListingInquiryRecord {
  id: string;
  listingId: string;
  tenantSlug: string;
  buyerUserId?: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string;
  message: string;
  offerPrice?: number;
  sellerUserId: string;
  sellerUsername: string;
  sellerEmail: string;
  createdAt: string;
}

export interface CommissionBuilderRecord {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  bio: string;
  specialties: string[];
  acceptingCommissions: boolean;
  startingPricePEN?: number;
  portfolioSampleUrls: string[];
  whatsappUrl?: string;
  instagramUrl?: string;
}

export type CommissionScopeLevel =
  | 'level_1_clean_build'    // Montaje Limpio, Lijado, Panel Lining & Topcoat
  | 'level_2_custom_paint'   // Aerografía & Pintura Custom Completa, Calcas al Agua, Barniz
  | 'level_3_weathering'     // Weathering Avanzado, Desgaste, Óxido, Sombreado & Chipping
  | 'level_4_masterpiece';   // Masterpiece / Modificaciones Resina / Plaplate / Diorama

export type CommissionKitSupply =
  | 'client_provides_kit'    // El cliente provee la maqueta
  | 'builder_sources_kit'    // El modelista adquiere el kit
  | 'undecided';             // A convenir

export type CommissionRequestStatus =
  | 'pending'                // Pendiente de respuesta
  | 'quoted'                 // Cotizado por el modelista
  | 'accepted'               // Aceptado por el cliente
  | 'in_progress'            // En proceso en la mesa de trabajo
  | 'completed'              // Finalizado y entregado
  | 'declined';              // Rechazado / Cancelado

export interface CommissionRequestRecord {
  id: string;
  code: string;              // ej. "COM-2026-X9Y2"
  tenantId: string;
  builderUsername: string;
  builderDisplayName?: string;
  clientUserId?: string;
  clientName: string;
  clientEmail: string;
  clientWhatsapp: string;
  clientCity?: string;
  kitTitle: string;
  scaleCategory: string;
  scopeLevel: CommissionScopeLevel;
  kitSupply: CommissionKitSupply;
  targetBudget?: number;
  currency: string;
  targetDeadline?: string;
  referenceLinks?: string[];
  projectNotes: string;
  status: CommissionRequestStatus;
  quotePrice?: number;
  estimatedDays?: number;
  builderResponseNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommissionRequestPayload {
  builderUsername: string;
  kitTitle: string;
  scaleCategory?: string;
  scopeLevel: CommissionScopeLevel;
  kitSupply: CommissionKitSupply;
  targetBudget?: number;
  currency?: string;
  targetDeadline?: string;
  referenceLinks?: string[];
  projectNotes: string;
  clientName: string;
  clientEmail: string;
  clientWhatsapp: string;
  clientCity?: string;
}

export interface UpdateCommissionRequestPayload {
  status?: CommissionRequestStatus;
  quotePrice?: number;
  estimatedDays?: number;
  builderResponseNotes?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
  totalCount: number;
}

export type WhatsAppInquiryType =
  | 'general'
  | 'paint_recipe'
  | 'custom_commission'
  | 'purchase_build';

export interface WhatsAppInquiryRequest {
  builderUsername: string;
  itemTitle: string;
  inquiryType?: WhatsAppInquiryType;
  itemUrl?: string;
  buildSlugOrId?: string;
  clientName?: string;
}

export interface WhatsAppInquiryResponse {
  builderUsername: string;
  builderDisplayName: string;
  targetWhatsapp: string;
  whatsappUrl: string;
  prefilledMessage: string;
  inquiryType: WhatsAppInquiryType;
}

export interface BulkStashImportItem {
  name: string;
  brand?: string;
  scale?: string;
  grade?: string;
  status?: StashStatus;
  notes?: string;
  pricePaid?: number;
  currency?: string;
}

export interface BulkPaintImportItem {
  code: string;
  brand?: string;
  name?: string;
  type?: PaintType;
  color?: string;
  quantity?: number;
  status?: PaintRackStatus;
  notes?: string;
}

export interface BulkImportRequest {
  csvContent?: string;
  delimiter?: string;
  dryRun?: boolean;
  items?: any[];
}

export interface BulkStashImportResponse {
  dryRun: boolean;
  totalParsed: number;
  importedCount: number;
  matchedCatalogCount: number;
  createdCustomCount: number;
  items: StashItemRecord[];
  previewRows?: Array<{
    name: string;
    brand?: string;
    matchedKitName?: string;
    isCatalogMatch: boolean;
    status: StashStatus;
  }>;
  errors?: string[];
}

export interface BulkPaintImportResponse {
  dryRun: boolean;
  totalParsed: number;
  importedCount: number;
  matchedCatalogCount: number;
  createdCustomCount: number;
  items: PaintRackItemRecord[];
  previewRows?: Array<{
    code: string;
    brand?: string;
    name?: string;
    matchedPaintName?: string;
    isCatalogMatch: boolean;
    quantity: number;
  }>;
  errors?: string[];
}

export interface OpenGraphMetadata {
  title: string;
  description: string;
  image: string;
  url: string;
  type?: 'website' | 'article';
  siteName?: string;
}

export type NotificationType =
  | 'build_comment'
  | 'contest_judged'
  | 'contest_award'
  | 'commission_update'
  | 'wishlist_stock'
  | 'community_vote'
  | 'system';

export interface NotificationItem {
  id: string;
  tenantSlug: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string;
  read: boolean;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface PushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

export interface PushSubscriptionRecord {
  id: string;
  tenantSlug: string;
  userId: string;
  endpoint: string;
  keys: PushSubscriptionKeys;
  createdAt: string;
  userAgent?: string;
}

export interface NotificationsListResponse {
  items: NotificationItem[];
  unreadCount: number;
  totalCount: number;
}

// ---------------------------------------------------------------------------
// Custom Decals & Masking Stencils Studio (DT18)
// ---------------------------------------------------------------------------

export type DecalSheetSize = 'A4' | 'A5' | 'A6';
export type DecalScale = '1/144' | '1/100' | '1/60' | '1/35' | '1/48' | '1/24' | 'custom';
export type DecalItemType =
  | 'warning_stencil'
  | 'unit_number'
  | 'faction_emblem'
  | 'pilot_name'
  | 'rank_insignia'
  | 'kill_marks'
  | 'checker_band'
  | 'custom_text';

export type DecalColor =
  | 'white'
  | 'red'
  | 'black'
  | 'yellow'
  | 'gold_metallic'
  | 'silver_metallic'
  | 'cyan';

export type DecalPaperType = 'transparent' | 'white_film';

export interface DecalElement {
  id: string;
  type: DecalItemType;
  label: string;
  codeText?: string;
  scale?: DecalScale;
  color: DecalColor;
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
  fontSizeMm?: number;
  subtext?: string;
  hazardStripes?: boolean;
  count?: number;
}

export interface DecalSheetConfig {
  title: string;
  scale: DecalScale;
  paperSize: DecalSheetSize;
  paperType: DecalPaperType;
  marginMm: number;
  includeCutLines: boolean;
  includeRegistrationMarks: boolean;
  elements: DecalElement[];
}

export interface DecalSheetPreset {
  id: string;
  name: string;
  category: ScaleCategory;
  scale: DecalScale;
  paperSize: DecalSheetSize;
  paperType: DecalPaperType;
  description: string;
  elements: DecalElement[];
}

export interface GenerateDecalSvgRequest {
  config: DecalSheetConfig;
  previewMode?: boolean; // If true, renders high-contrast dark backing for transparent white decals
}

export interface GenerateDecalSvgResponse {
  svg: string;
  widthMm: number;
  heightMm: number;
  scale: DecalScale;
  elementCount: number;
}

export const PAPER_DIMENSIONS_MM: Record<DecalSheetSize, { width: number; height: number }> = {
  A4: { width: 210, height: 297 },
  A5: { width: 148, height: 210 },
  A6: { width: 105, height: 148 }
};

export const DECAL_COLOR_HEX: Record<DecalColor, string> = {
  white: '#ffffff',
  red: '#ef4444',
  black: '#111827',
  yellow: '#eab308',
  gold_metallic: '#d97706',
  silver_metallic: '#94a3b8',
  cyan: '#06b6d4'
};

export const DECAL_SHEET_PRESETS: DecalSheetPreset[] = [
  {
    id: 'gunpla-efsf-caution',
    name: 'E.F.S.F. Tactical Warning & Caution Set',
    category: 'gunpla-mecha',
    scale: '1/144',
    paperSize: 'A5',
    paperType: 'transparent',
    description: 'Marcas de advertencia táctica, propulsores, esclusas de eyección e insignias de la Federación Terrestre.',
    elements: [
      { id: 'el-1', type: 'warning_stencil', label: 'CAUTION: HOT EXHAUST', subtext: 'KEEP 3M CLEAR', color: 'red', xMm: 12, yMm: 15, widthMm: 22, heightMm: 7, fontSizeMm: 1.8, hazardStripes: true },
      { id: 'el-2', type: 'warning_stencil', label: 'DANGER: BEWARE OF BLAST', subtext: 'NO STEP', color: 'red', xMm: 38, yMm: 15, widthMm: 22, heightMm: 7, fontSizeMm: 1.8, hazardStripes: true },
      { id: 'el-3', type: 'warning_stencil', label: 'EMERGENCY HATCH RELEASE', subtext: 'PRESS BUTTON PUSH LEVER', color: 'yellow', xMm: 64, yMm: 15, widthMm: 24, heightMm: 7, fontSizeMm: 1.7 },
      { id: 'el-4', type: 'warning_stencil', label: 'MINOVSKY CRAFT INTAKE', subtext: 'RESTRICTED AREA', color: 'white', xMm: 92, yMm: 15, widthMm: 24, heightMm: 7, fontSizeMm: 1.7 },
      { id: 'el-5', type: 'unit_number', label: '01', codeText: 'WB-01', color: 'white', xMm: 12, yMm: 27, widthMm: 14, heightMm: 10, fontSizeMm: 6.5 },
      { id: 'el-6', type: 'unit_number', label: '02', codeText: 'WB-02', color: 'white', xMm: 29, yMm: 27, widthMm: 14, heightMm: 10, fontSizeMm: 6.5 },
      { id: 'el-7', type: 'unit_number', label: '03', codeText: 'WB-03', color: 'red', xMm: 46, yMm: 27, widthMm: 14, heightMm: 10, fontSizeMm: 6.5 },
      { id: 'el-8', type: 'unit_number', label: '102', codeText: 'RX-78-2', color: 'white', xMm: 64, yMm: 27, widthMm: 18, heightMm: 10, fontSizeMm: 6.0 },
      { id: 'el-9', type: 'faction_emblem', label: 'E.F.S.F. Star Crest', codeText: 'EFSF', color: 'gold_metallic', xMm: 86, yMm: 27, widthMm: 12, heightMm: 12 },
      { id: 'el-10', type: 'faction_emblem', label: 'White Base Pegasus', codeText: 'WB', color: 'white', xMm: 102, yMm: 27, widthMm: 14, heightMm: 12 },
      { id: 'el-11', type: 'pilot_name', label: 'LT. AMURO RAY', subtext: 'SCV-70 WHITE BASE', color: 'white', xMm: 12, yMm: 42, widthMm: 28, heightMm: 7, fontSizeMm: 2.0 },
      { id: 'el-12', type: 'pilot_name', label: 'ENS. SAYLA MASS', subtext: 'CORE BOOSTER-01', color: 'yellow', xMm: 44, yMm: 42, widthMm: 28, heightMm: 7, fontSizeMm: 2.0 },
      { id: 'el-13', type: 'kill_marks', label: 'Victory Stars', count: 8, color: 'yellow', xMm: 76, yMm: 42, widthMm: 24, heightMm: 6 },
      { id: 'el-14', type: 'checker_band', label: 'Hazard Stripe Band', color: 'yellow', xMm: 12, yMm: 53, widthMm: 60, heightMm: 4 }
    ]
  },
  {
    id: 'gunpla-zeon-markings',
    name: 'Principality of Zeon Mobile Suit Caution Stencils',
    category: 'gunpla-mecha',
    scale: '1/144',
    paperSize: 'A5',
    paperType: 'transparent',
    description: 'Marcas imperiales del Principado de Zeon, advertencias en alemán/inglés de sobrecalentamiento y numerales.',
    elements: [
      { id: 'ze-1', type: 'warning_stencil', label: 'ACHTUNG: THERMAL OUTLET', subtext: 'HIGH TEMPERATURE', color: 'red', xMm: 12, yMm: 15, widthMm: 24, heightMm: 7, fontSizeMm: 1.8, hazardStripes: true },
      { id: 'ze-2', type: 'warning_stencil', label: 'MONOEYE SENSOR HOUSING', subtext: 'DO NOT TOUCH LENS', color: 'yellow', xMm: 40, yMm: 15, widthMm: 24, heightMm: 7, fontSizeMm: 1.7 },
      { id: 'ze-3', type: 'warning_stencil', label: 'COCKPIT ENTRY BEACON', subtext: 'ZIONIC HEAVY INDUSTRIES', color: 'white', xMm: 68, yMm: 15, widthMm: 26, heightMm: 7, fontSizeMm: 1.7 },
      { id: 'ze-4', type: 'unit_number', label: '06', codeText: 'MS-06', color: 'white', xMm: 12, yMm: 27, widthMm: 14, heightMm: 10, fontSizeMm: 6.5 },
      { id: 'ze-5', type: 'unit_number', label: 'S-01', codeText: 'RED COMET', color: 'yellow', xMm: 29, yMm: 27, widthMm: 16, heightMm: 10, fontSizeMm: 6.0 },
      { id: 'ze-6', type: 'unit_number', label: '3S', codeText: 'BLACK TRI-STARS', color: 'white', xMm: 48, yMm: 27, widthMm: 14, heightMm: 10, fontSizeMm: 6.5 },
      { id: 'ze-7', type: 'faction_emblem', label: 'Zeon Eagle Crest', codeText: 'ZEON', color: 'gold_metallic', xMm: 66, yMm: 27, widthMm: 14, heightMm: 14 },
      { id: 'ze-8', type: 'pilot_name', label: 'MAJ. CHAR AZNABLE', subtext: 'ZEON SPACE ATTACK FORCE', color: 'yellow', xMm: 12, yMm: 44, widthMm: 32, heightMm: 7, fontSizeMm: 2.0 },
      { id: 'ze-9', type: 'kill_marks', label: 'Battleship Kills', count: 5, color: 'white', xMm: 48, yMm: 44, widthMm: 22, heightMm: 6 }
    ]
  },
  {
    id: 'military-tank-stencil',
    name: 'WWII Military Armor Turret Numbers & Allied Star Stencils',
    category: 'military',
    scale: '1/35',
    paperSize: 'A5',
    paperType: 'white_film',
    description: 'Numerales de torreta blindada, estrellas de invasión aliadas, presiones de neumáticos y códigos de división.',
    elements: [
      { id: 'mil-1', type: 'faction_emblem', label: 'Allied Invasion Star', codeText: 'US-STAR', color: 'white', xMm: 12, yMm: 15, widthMm: 18, heightMm: 18 },
      { id: 'mil-2', type: 'faction_emblem', label: 'Circled Star', codeText: 'ALLIED', color: 'white', xMm: 34, yMm: 15, widthMm: 18, heightMm: 18 },
      { id: 'mil-3', type: 'unit_number', label: '312', codeText: 'TIGER-312', color: 'white', xMm: 56, yMm: 15, widthMm: 18, heightMm: 12, fontSizeMm: 8.0 },
      { id: 'mil-4', type: 'unit_number', label: 'B-14', codeText: 'SHERMAN-B14', color: 'white', xMm: 78, yMm: 15, widthMm: 18, heightMm: 12, fontSizeMm: 8.0 },
      { id: 'mil-5', type: 'warning_stencil', label: 'AMMO STORAGE: HIGH EXPLOSIVES', subtext: 'HANDLE WITH EXTREME CARE', color: 'yellow', xMm: 12, yMm: 38, widthMm: 32, heightMm: 7, fontSizeMm: 1.8 },
      { id: 'mil-6', type: 'warning_stencil', label: 'TIRE PRESSURE 35 PSI', subtext: 'MAINTENANCE CHECK DAILY', color: 'white', xMm: 48, yMm: 38, widthMm: 26, heightMm: 7, fontSizeMm: 1.8 },
      { id: 'mil-7', type: 'custom_text', label: 'U.S. ARMY 3011492-S', color: 'white', xMm: 12, yMm: 49, widthMm: 36, heightMm: 6, fontSizeMm: 3.2 }
    ]
  },
  {
    id: 'aviation-jet-lowvis',
    name: 'Modern Tactical Fighter Aircraft Low-Vis Warnings',
    category: 'aviation',
    scale: '1/48',
    paperSize: 'A5',
    paperType: 'transparent',
    description: 'Advertencias de baja visibilidad para tomas de aire, asientos de eyección, flechas de rescate y numerales tácticos.',
    elements: [
      { id: 'av-1', type: 'warning_stencil', label: 'DANGER: JET INTAKE', subtext: 'KEEP 25FT CLEAR AT MIL POWER', color: 'black', xMm: 12, yMm: 15, widthMm: 26, heightMm: 8, fontSizeMm: 1.9, hazardStripes: true },
      { id: 'av-2', type: 'warning_stencil', label: 'DANGER: EJECTION SEAT', subtext: 'EXPLOSIVE CHARGE ARMED', color: 'red', xMm: 42, yMm: 15, widthMm: 24, heightMm: 8, fontSizeMm: 1.8 },
      { id: 'av-3', type: 'warning_stencil', label: 'RESCUE -> PUSH BUTTON', subtext: 'CANOPY RELEASE', color: 'black', xMm: 70, yMm: 15, widthMm: 22, heightMm: 8, fontSizeMm: 1.8 },
      { id: 'av-4', type: 'unit_number', label: '007', codeText: 'MODEX-007', color: 'black', xMm: 12, yMm: 28, widthMm: 16, heightMm: 10, fontSizeMm: 7.0 },
      { id: 'av-5', type: 'unit_number', label: 'AF-86', codeText: 'TAIL-86', color: 'black', xMm: 32, yMm: 28, widthMm: 18, heightMm: 10, fontSizeMm: 6.5 },
      { id: 'av-6', type: 'pilot_name', label: 'CAPT. M. MAVERICK', subtext: 'VF-1 FIGHTING FALCONS', color: 'black', xMm: 54, yMm: 28, widthMm: 28, heightMm: 7, fontSizeMm: 2.0 },
      { id: 'av-7', type: 'kill_marks', label: 'MiG Silhouettes', count: 4, color: 'black', xMm: 86, yMm: 28, widthMm: 18, heightMm: 6 }
    ]
  },
  {
    id: 'racing-motorsport-numbers',
    name: 'Motorsport Racing Car Roundels & Sponsor Decals',
    category: 'automotive',
    scale: '1/24',
    paperSize: 'A5',
    paperType: 'white_film',
    description: 'Dorsales redondos con numeros de carrera, flechas de gancho de remolque, insignias de corte electrico y sponsors.',
    elements: [
      { id: 'rc-1', type: 'unit_number', label: '23', codeText: 'NISMO-23', color: 'black', xMm: 12, yMm: 15, widthMm: 22, heightMm: 22, fontSizeMm: 12.0 },
      { id: 'rc-2', type: 'unit_number', label: '12', codeText: 'CALSONIC-12', color: 'white', xMm: 38, yMm: 15, widthMm: 22, heightMm: 22, fontSizeMm: 12.0 },
      { id: 'rc-3', type: 'warning_stencil', label: 'TOW HOOK ->', color: 'red', xMm: 64, yMm: 15, widthMm: 18, heightMm: 6, fontSizeMm: 2.5 },
      { id: 'rc-4', type: 'warning_stencil', label: 'ELEC CUT-OFF', color: 'red', xMm: 86, yMm: 15, widthMm: 18, heightMm: 6, fontSizeMm: 2.2 },
      { id: 'rc-5', type: 'custom_text', label: 'TURBO INTERCOOLER 4WD', color: 'red', xMm: 12, yMm: 42, widthMm: 38, heightMm: 6, fontSizeMm: 3.5 },
      { id: 'rc-6', type: 'pilot_name', label: 'K. TSUCHIYA / DRIFT KING', color: 'black', xMm: 54, yMm: 42, widthMm: 32, heightMm: 6, fontSizeMm: 2.2 }
    ]
  }
];

export function generateDecalSheetSvg(config: DecalSheetConfig, previewMode: boolean = false): string {
  const paper = PAPER_DIMENSIONS_MM[config.paperSize] || PAPER_DIMENSIONS_MM.A5;
  const w = paper.width;
  const h = paper.height;

  // Background style: dark contrast for transparent paper in preview mode, or clean white/transparent for printing
  const bgFill = previewMode
    ? (config.paperType === 'transparent' ? '#0f172a' : '#f8fafc')
    : (config.paperType === 'white_film' ? '#ffffff' : 'none');

  const bgRect = bgFill !== 'none'
    ? `<rect width="${w}" height="${h}" fill="${bgFill}" />`
    : '';

  // Registration crosshairs in 4 corners
  let regMarks = '';
  if (config.includeRegistrationMarks) {
    const regCoords = [
      { x: 6, y: 6 },
      { x: w - 6, y: 6 },
      { x: 6, y: h - 6 },
      { x: w - 6, y: h - 6 }
    ];
    regMarks = regCoords
      .map(
        (c) => `<g stroke="${previewMode ? '#475569' : '#000000'}" stroke-width="0.15" fill="none">
          <circle cx="${c.x}" cy="${c.y}" r="2.2" />
          <line x1="${c.x - 3.5}" y1="${c.y}" x2="${c.x + 3.5}" y2="${c.y}" />
          <line x1="${c.x}" y1="${c.y - 3.5}" x2="${c.x}" y2="${c.y + 3.5}" />
        </g>`
      )
      .join('\n');
  }

  // Margin boundary cut guide
  const m = config.marginMm || 5;
  const borderGuide = `<rect x="${m}" y="${m}" width="${w - m * 2}" height="${h - m * 2}" fill="none" stroke="${previewMode ? '#334155' : '#cbd5e1'}" stroke-width="0.15" stroke-dasharray="1.5,1.5" />`;

  // Header info line
  const titleText = escapeXml(config.title || 'Custom Decal Sheet');
  const scaleText = escapeXml(config.scale || '1/144');
  const infoHeader = `<g fill="${previewMode ? '#94a3b8' : '#000000'}" font-family="monospace, sans-serif" font-size="2.2" font-weight="bold">
    <text x="${m + 2}" y="${h - m - 2}">PLAMOSCALE DECAL STUDIO • ${titleText} • SCALE ${scaleText} • 100% SCALE (DO NOT FIT TO PAGE)</text>
  </g>`;

  // Elements rendering
  const elementsSvg = (config.elements || [])
    .map((el) => {
      const hex = DECAL_COLOR_HEX[el.color] || '#ffffff';
      const x = el.xMm;
      const y = el.yMm;
      const ew = el.widthMm;
      const eh = el.heightMm;

      let cutLine = '';
      if (config.includeCutLines) {
        cutLine = `<rect x="${x - 0.6}" y="${y - 0.6}" width="${ew + 1.2}" height="${eh + 1.2}" fill="none" stroke="${previewMode ? 'rgba(56,189,248,0.35)' : '#cbd5e1'}" stroke-width="0.08" stroke-dasharray="0.6,0.6" rx="0.3" />`;
      }

      let contentSvg = '';

      if (el.type === 'warning_stencil') {
        const fs = el.fontSizeMm || 1.8;
        const subFs = Math.max(0.9, fs * 0.65);
        let stripes = '';
        if (el.hazardStripes) {
          stripes = `<rect x="${x}" y="${y}" width="${ew}" height="1.2" fill="${hex}" opacity="0.9" />
          <line x1="${x + 2}" y1="${y}" x2="${x}" y2="${y + 1.2}" stroke="${previewMode ? '#0f172a' : '#ffffff'}" stroke-width="0.5" />
          <line x1="${x + 5}" y1="${y}" x2="${x + 3}" y2="${y + 1.2}" stroke="${previewMode ? '#0f172a' : '#ffffff'}" stroke-width="0.5" />
          <line x1="${x + 8}" y1="${y}" x2="${x + 6}" y2="${y + 1.2}" stroke="${previewMode ? '#0f172a' : '#ffffff'}" stroke-width="0.5" />
          <line x1="${x + 11}" y1="${y}" x2="${x + 9}" y2="${y + 1.2}" stroke="${previewMode ? '#0f172a' : '#ffffff'}" stroke-width="0.5" />`;
        }

        contentSvg = `<g>
          <rect x="${x}" y="${y}" width="${ew}" height="${eh}" fill="none" stroke="${hex}" stroke-width="0.22" rx="0.4" />
          ${stripes}
          <text x="${x + ew / 2}" y="${y + (el.hazardStripes ? 3.8 : 3.0)}" fill="${hex}" font-family="monospace, sans-serif" font-size="${fs}" font-weight="900" text-anchor="middle">${escapeXml(el.label)}</text>
          ${el.subtext ? `<text x="${x + ew / 2}" y="${y + eh - 1.2}" fill="${hex}" font-family="monospace, sans-serif" font-size="${subFs}" font-weight="bold" letter-spacing="0.1" text-anchor="middle">${escapeXml(el.subtext)}</text>` : ''}
        </g>`;
      } else if (el.type === 'unit_number') {
        const fs = el.fontSizeMm || 6.5;
        contentSvg = `<g>
          <text x="${x + ew / 2}" y="${y + eh * 0.8}" fill="${hex}" font-family="monospace, sans-serif" font-size="${fs}" font-weight="900" text-anchor="middle" letter-spacing="0.3">${escapeXml(el.label)}</text>
        </g>`;
      } else if (el.type === 'faction_emblem') {
        const cx = x + ew / 2;
        const cy = y + eh / 2;
        const r = Math.min(ew, eh) * 0.45;
        if (el.codeText === 'US-STAR' || el.codeText === 'ALLIED') {
          // 5-point star inside optional circle
          const points = [
            [cx, cy - r],
            [cx + r * 0.22, cy - r * 0.3],
            [cx + r * 0.95, cy - r * 0.3],
            [cx + r * 0.35, cy + r * 0.15],
            [cx + r * 0.58, cy + r * 0.85],
            [cx, cy + r * 0.42],
            [cx - r * 0.58, cy + r * 0.85],
            [cx - r * 0.35, cy + r * 0.15],
            [cx - r * 0.95, cy - r * 0.3],
            [cx - r * 0.22, cy - r * 0.3]
          ].map(p => p.join(',')).join(' ');

          contentSvg = `<g fill="${hex}">
            <circle cx="${cx}" cy="${cy}" r="${r * 1.1}" fill="none" stroke="${hex}" stroke-width="0.3" />
            <polygon points="${points}" fill="${hex}" />
          </g>`;
        } else if (el.codeText === 'ZEON') {
          // Stylized Zeon crest
          contentSvg = `<g fill="${hex}" stroke="${hex}">
            <path d="M ${cx} ${cy - r} L ${cx + r * 0.7} ${cy - r * 0.4} L ${cx + r * 0.5} ${cy + r * 0.5} L ${cx} ${cy + r * 0.85} L ${cx - r * 0.5} ${cy + r * 0.5} L ${cx - r * 0.7} ${cy - r * 0.4} Z" fill="none" stroke-width="0.35" />
            <polygon points="${cx},${cy - r * 0.5} ${cx + r * 0.3},${cy + r * 0.2} ${cx - r * 0.3},${cy + r * 0.2}" />
            <line x1="${cx - r * 0.6}" y1="${cy - r * 0.1}" x2="${cx + r * 0.6}" y2="${cy - r * 0.1}" stroke-width="0.35" />
          </g>`;
        } else {
          // Default EFSF / Star Shield
          contentSvg = `<g fill="${hex}">
            <polygon points="${cx},${cy - r} ${cx + r * 0.7},${cy - r * 0.3} ${cx + r * 0.5},${cy + r * 0.6} ${cx},${cy + r} ${cx - r * 0.5},${cy + r * 0.6} ${cx - r * 0.7},${cy - r * 0.3}" fill="none" stroke="${hex}" stroke-width="0.35" />
            <polygon points="${cx},${cy - r * 0.7} ${cx + r * 0.2},${cy - r * 0.2} ${cx + r * 0.7},${cy - r * 0.2} ${cx + r * 0.3},${cy + r * 0.1} ${cx + r * 0.45},${cy + r * 0.6} ${cx},${cy + r * 0.3} ${cx - r * 0.45},${cy + r * 0.6} ${cx - r * 0.3},${cy + r * 0.1} ${cx - r * 0.7},${cy - r * 0.2} ${cx - r * 0.2},${cy - r * 0.2}" />
          </g>`;
        }
      } else if (el.type === 'pilot_name') {
        const fs = el.fontSizeMm || 2.0;
        contentSvg = `<g>
          <rect x="${x}" y="${y}" width="${ew}" height="${eh}" fill="none" stroke="${hex}" stroke-width="0.18" />
          <text x="${x + ew / 2}" y="${y + fs * 1.3}" fill="${hex}" font-family="monospace, sans-serif" font-size="${fs}" font-weight="bold" text-anchor="middle">${escapeXml(el.label)}</text>
          ${el.subtext ? `<text x="${x + ew / 2}" y="${y + eh - 1.0}" fill="${hex}" font-family="monospace, sans-serif" font-size="${fs * 0.6}" text-anchor="middle" letter-spacing="0.1">${escapeXml(el.subtext)}</text>` : ''}
        </g>`;
      } else if (el.type === 'kill_marks') {
        const count = Math.min(15, el.count || 5);
        const starSpacing = ew / (count + 1);
        let stars = '';
        for (let i = 0; i < count; i++) {
          const sx = x + starSpacing * (i + 1);
          const sy = y + eh / 2;
          stars += `<polygon points="${sx},${sy - 1.6} ${sx + 0.4},${sy - 0.5} ${sx + 1.6},${sy - 0.5} ${sx + 0.6},${sy + 0.2} ${sx + 1.0},${sy + 1.4} ${sx},${sy + 0.6} ${sx - 1.0},${sy + 1.4} ${sx - 0.6},${sy + 0.2} ${sx - 1.6},${sy - 0.5} ${sx - 0.4},${sy - 0.5}" fill="${hex}" />`;
        }
        contentSvg = `<g>${stars}</g>`;
      } else if (el.type === 'checker_band') {
        const blocks = 10;
        const blockW = ew / blocks;
        let bandSvg = '';
        for (let i = 0; i < blocks; i++) {
          if (i % 2 === 0) {
            bandSvg += `<rect x="${x + i * blockW}" y="${y}" width="${blockW}" height="${eh}" fill="${hex}" />`;
          } else {
            bandSvg += `<rect x="${x + i * blockW}" y="${y}" width="${blockW}" height="${eh}" fill="${previewMode ? '#1e293b' : '#000000'}" />`;
          }
        }
        contentSvg = `<g>${bandSvg}</g>`;
      } else {
        // custom_text
        const fs = el.fontSizeMm || 3.0;
        contentSvg = `<g>
          <text x="${x + ew / 2}" y="${y + eh * 0.75}" fill="${hex}" font-family="monospace, sans-serif" font-size="${fs}" font-weight="900" text-anchor="middle">${escapeXml(el.label)}</text>
        </g>`;
      }

      return `<g id="${el.id}">
        ${cutLine}
        ${contentSvg}
      </g>`;
    })
    .join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}mm" height="${h}mm" viewBox="0 0 ${w} ${h}" style="text-rendering: geometricPrecision; shape-rendering: geometricPrecision;">
  ${bgRect}
  ${borderGuide}
  ${regMarks}
  ${infoHeader}
  <g id="decal-elements">
    ${elementsSvg}
  </g>
</svg>`;
}

function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// =============================================================================
// AI Workbench Smart Builder Assistant (DT19)
// =============================================================================

export type RunnerPartStatus = 'intact' | 'removed' | 'uncertain';

export interface DetectedRunnerPart {
  partNumber: string;
  status: RunnerPartStatus;
  confidence: number;
  notes?: string;
}

export interface RunnerInspectionRequest {
  image: string; // Base64 data URL (e.g. data:image/jpeg;base64,...) or image URL
  runnerLetter?: string;
  kitName?: string;
}

export interface RunnerInspectionResponse {
  runnerLetter: string;
  totalPartsDetected: number;
  remainingPartsCount: number;
  removedPartsCount: number;
  completionPercentage: number;
  parts: DetectedRunnerPart[];
  aiEngine: 'gemini-3.5-flash-lite' | 'expert-local-rules';
  recommendations: string[];
  inspectedAt: string;
}

export type NubDiagnosisType =
  | 'clean_cut'
  | 'protruding_nub'
  | 'stress_mark'
  | 'gouge'
  | 'under_sanded';

export type NubSeverity = 'none' | 'minor' | 'moderate' | 'severe';

export interface NubInspectionRequest {
  image: string;
  partName?: string;
  plasticType?: 'PS' | 'ABS' | 'PE' | 'KPS' | 'resin';
}

export interface NubCorrectionStep {
  stepOrder: number;
  tool: string;
  instruction: string;
}

export interface NubInspectionResponse {
  qualityScore: number; // 0 - 100
  diagnosis: NubDiagnosisType;
  severity: NubSeverity;
  headline: string;
  detailedAnalysis: string;
  stressMarkPresent: boolean;
  correctionSteps: NubCorrectionStep[];
  sandingGritSequence: number[];
  aiEngine: 'gemini-3.5-flash-lite' | 'expert-local-rules';
  inspectedAt: string;
}

export function analyzeRunnerPhotoOffline(runnerLetter: string = 'A', kitName?: string): RunnerInspectionResponse {
  const normLetter = (runnerLetter || 'A').trim().toUpperCase().charAt(0) || 'A';
  const total = 18;
  const removed = 7;
  const remaining = total - removed;
  const completion = Math.round((removed / total) * 100);

  const parts: DetectedRunnerPart[] = [];
  for (let i = 1; i <= total; i++) {
    const isRemoved = i <= removed;
    parts.push({
      partNumber: `${normLetter}${i}`,
      status: isRemoved ? 'removed' : 'intact',
      confidence: 0.92,
      notes: isRemoved ? 'Pieza ya retirada del canal' : 'Pieza disponible en matriz'
    });
  }

  return {
    runnerLetter: normLetter,
    totalPartsDetected: total,
    remainingPartsCount: remaining,
    removedPartsCount: removed,
    completionPercentage: completion,
    parts,
    aiEngine: 'expert-local-rules',
    recommendations: [
      `Grapa ${normLetter}: Se detectaron ${remaining} piezas pendientes por retirar.`,
      'Corta a 1-2 mm de distancia de la compuerta para evitar estresar el plastico.',
      'Usa un alicate de corte fino (Single-Blade Nipper) para el corte secundario a ras.'
    ],
    inspectedAt: new Date().toISOString()
  };
}

export function analyzeNubPhotoOffline(partName: string = 'Pieza General', plasticType: string = 'PS'): NubInspectionResponse {
  return {
    qualityScore: 78,
    diagnosis: 'protruding_nub',
    severity: 'minor',
    headline: 'Resto de compuerta sobresaliente (0.3mm) con ligera marca de presion',
    detailedAnalysis: `Analisis visual del corte en plastico ${plasticType}: Se aprecia un saliente de compuerta no recortado a ras. La matriz de poliestireno conserva integridad sin mordeduras profundas ni huecos bajo el plano de la pieza.`,
    stressMarkPresent: true,
    correctionSteps: [
      {
        stepOrder: 1,
        tool: 'Bisturi de precision o cuchilla de modelismo (angulo 30 grados)',
        instruction: 'Apoyar la hoja plana contra la superficie y realizar un corte suave hacia adelante para retirar el 90% del saliente.'
      },
      {
        stepOrder: 2,
        tool: 'Lija de esponja o taco abrasivo grano 800',
        instruction: 'Lijar en movimientos unidireccionales hasta que el relieve se nivele al tacto.'
      },
      {
        stepOrder: 3,
        tool: 'Lija al agua grano 1200 / 1500',
        instruction: 'Pulido humedo para eliminar micro-rayaduras y devolver el acabado uniforme al poliestireno.'
      },
      {
        stepOrder: 4,
        tool: 'Pulidor de unas de 3 pasos o trapo de microfibra con frotado rapido',
        instruction: 'Friccion rapida para disipar marcas blanquecinas de estres mecanico residual.'
      }
    ],
    sandingGritSequence: [800, 1000, 1500, 2000],
    aiEngine: 'expert-local-rules',
    inspectedAt: new Date().toISOString()
  };
}


export * from './ui-shell/app-shell';
export * from './ui-shell/views';
export * from './ui-shell/modals';
export * from './ui-shell/legal-pages';
export * from './ui-shell/pwa';
export * from './ui-shell/og-card';
