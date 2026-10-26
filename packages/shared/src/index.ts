export type RoleName = 'user' | 'moderator' | 'tenant_admin' | 'admin' | 'super_admin' | 'community_admin';

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
  status?: 'active' | 'suspended' | 'archived';
  resendApiKey?: string;
  suspensionReason?: string;
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
  subassemblies?: SubassemblyCard[];
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

// =============================================================================
// Stash Inventory & Insurance Valuation Report (DT20)
// =============================================================================

export interface StashInsuranceItem {
  stashId: string;
  kitId: string;
  kitName: string;
  brand: string;
  scale: string;
  grade?: string;
  category: ScaleCategory;
  kitNumber?: string;
  barcode?: string;
  status: StashStatus;
  boxartUrl?: string;
  declaredPricePaid: number;
  estimatedReplacementValue: number;
  currency: string;
  acquiredAt?: string;
  completedAt?: string;
  notes?: string;
}

export interface StashInsuranceValuationSummary {
  userId: string;
  userName?: string;
  totalKitsCount: number;
  valuationPortfolioTotalKits?: number;
  builtVitrinesCount: number;
  unbuiltStashCount: number;
  inProgressCount: number;
  wishlistCount: number;
  forTradeCount: number;
  totalAcquisitionInvestment: number;
  totalAcquisitionDeclared?: number;
  totalEstimatedReplacementValue: number;
  totalReplacementEstimated?: number;
  currency: string;
  breakdownByCategory: Record<string, { count: number; totalValue: number }>;
  categoryBreakdown?: Record<string, { count: number; totalValue: number }>;
  breakdownByBrand: Record<string, { count: number; totalValue: number }>;
  brandBreakdown?: Record<string, { count: number; totalValue: number }>;
  items: StashInsuranceItem[];
  generatedAt: string;
}

export interface StashInsuranceReportConfig {
  includeUnbuilt?: boolean;
  includeBuilt?: boolean;
  includeInProgress?: boolean;
  includeWishlist?: boolean;
  includePhotos?: boolean;
  insurancePolicyNumber?: string;
  appraiserName?: string;
  tenantName?: string;
}

export function calculateStashValuation(
  items: StashItemRecord[],
  userId: string = 'unknown-user',
  userName?: string,
  preferredCurrency: string = 'USD'
): StashInsuranceValuationSummary {
  let builtVitrinesCount = 0;
  let unbuiltStashCount = 0;
  let inProgressCount = 0;
  let wishlistCount = 0;
  let forTradeCount = 0;

  let totalAcquisition = 0;
  let totalReplacement = 0;

  const categoryMap: Record<string, { count: number; totalValue: number }> = {};
  const brandMap: Record<string, { count: number; totalValue: number }> = {};

  const evaluatedItems: StashInsuranceItem[] = (items || []).map((item) => {
    const kit = item.kit || ({} as Partial<KitRecord>);
    const status = item.status || 'unbuilt';

    if (status === 'built') builtVitrinesCount++;
    else if (status === 'unbuilt') unbuiltStashCount++;
    else if (status === 'in_progress') inProgressCount++;
    else if (status === 'wishlist') wishlistCount++;
    else if (status === 'for_trade') forTradeCount++;

    const declaredPrice = Number(item.pricePaid || 35.0);
    const itemCurrency = item.currency || preferredCurrency;

    // Multiplier for insurance valuation
    // Finished built models reflect invested labor & paint supplies
    let replacementMultiplier = 1.15;
    if (status === 'built') replacementMultiplier = 1.5;
    else if (status === 'in_progress') replacementMultiplier = 1.25;
    else if (status === 'for_trade') replacementMultiplier = 1.1;
    else if (status === 'wishlist') replacementMultiplier = 1.0;

    const estimatedValue = Math.round(declaredPrice * replacementMultiplier * 100) / 100;

    // Only count non-wishlist items towards inventory balance
    if (status !== 'wishlist') {
      totalAcquisition += declaredPrice;
      totalReplacement += estimatedValue;

      const cat = kit.category || 'gunpla-mecha';
      if (!categoryMap[cat]) categoryMap[cat] = { count: 0, totalValue: 0 };
      categoryMap[cat].count++;
      categoryMap[cat].totalValue = Math.round((categoryMap[cat].totalValue + estimatedValue) * 100) / 100;

      const br = kit.brand || 'Bandai Spirits';
      if (!brandMap[br]) brandMap[br] = { count: 0, totalValue: 0 };
      brandMap[br].count++;
      brandMap[br].totalValue = Math.round((brandMap[br].totalValue + estimatedValue) * 100) / 100;
    }

    return {
      stashId: item.id,
      kitId: item.kitId,
      kitName: kit.name || 'Maqueta No Catalogada',
      brand: kit.brand || 'Bandai Spirits',
      scale: kit.scale || '1/144',
      grade: kit.grade,
      category: (kit.category || 'gunpla-mecha') as ScaleCategory,
      kitNumber: kit.kitNumber,
      barcode: kit.barcode,
      status,
      boxartUrl: kit.boxartUrl,
      declaredPricePaid: declaredPrice,
      estimatedReplacementValue: estimatedValue,
      currency: itemCurrency,
      acquiredAt: item.acquiredAt,
      completedAt: item.completedAt,
      notes: item.notes
    };
  });

  const totalAcq = Math.round(totalAcquisition * 100) / 100;
  const totalRep = Math.round(totalReplacement * 100) / 100;
  const portfolioKits = (items || []).filter(i => (i.status || 'unbuilt') !== 'wishlist').length;

  return {
    userId,
    userName: userName || userId,
    totalKitsCount: items.length,
    valuationPortfolioTotalKits: portfolioKits,
    builtVitrinesCount,
    unbuiltStashCount,
    inProgressCount,
    wishlistCount,
    forTradeCount,
    totalAcquisitionInvestment: totalAcq,
    totalAcquisitionDeclared: totalAcq,
    totalEstimatedReplacementValue: totalRep,
    totalReplacementEstimated: totalRep,
    currency: preferredCurrency,
    breakdownByCategory: categoryMap,
    categoryBreakdown: categoryMap,
    breakdownByBrand: brandMap,
    brandBreakdown: brandMap,
    items: evaluatedItems,
    generatedAt: new Date().toISOString()
  };
}

export function generateInsuranceReportHtml(
  summary: StashInsuranceValuationSummary,
  config: StashInsuranceReportConfig = {}
): string {
  const tenant = config.tenantName || 'PlamoScale';
  const policyNum = config.insurancePolicyNumber || 'VAL-STASH-' + Date.now().toString(36).toUpperCase();
  const appraiser = config.appraiserName || 'Peritaje Oficial PlamoScale / GunplaJunkies';

  const filteredItems = summary.items.filter((it) => {
    if (it.status === 'unbuilt' && config.includeUnbuilt === false) return false;
    if (it.status === 'built' && config.includeBuilt === false) return false;
    if (it.status === 'in_progress' && config.includeInProgress === false) return false;
    if (it.status === 'wishlist' && config.includeWishlist !== true) return false;
    return true;
  });

  const rows = filteredItems.map((it, idx) => {
    const photoCell = config.includePhotos !== false
      ? `<td style="padding: 6px; text-align: center;"><img src="${it.boxartUrl || '/assets/boxart-placeholder.png'}" alt="${escapeXml(it.kitName)}" style="width: 44px; height: 32px; object-fit: cover; border-radius: 3px; border: 1px solid #cbd5e1;" onerror="this.style.display='none'" /></td>`
      : '';
    const statusLabel = it.status === 'built' ? 'Vitrina (Armado)' : it.status === 'in_progress' ? 'En Taller' : it.status === 'unbuilt' ? 'En Caja (Stash)' : it.status;

    return `<tr style="border-bottom: 1px solid #e2e8f0; font-size: 11px;">
      <td style="padding: 6px; text-align: center; color: #64748b;">${idx + 1}</td>
      ${photoCell}
      <td style="padding: 6px; font-weight: bold; color: #0f172a;">${escapeXml(it.kitName)}</td>
      <td style="padding: 6px; color: #334155;">${escapeXml(it.brand)}</td>
      <td style="padding: 6px; text-align: center; color: #334155;">${escapeXml(it.scale)}</td>
      <td style="padding: 6px; text-align: center; color: #475569;">${statusLabel}</td>
      <td style="padding: 6px; text-align: right; color: #64748b;">$${it.declaredPricePaid.toFixed(2)}</td>
      <td style="padding: 6px; text-align: right; font-weight: bold; color: #0f172a;">$${it.estimatedReplacementValue.toFixed(2)}</td>
    </tr>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Certificado de Tasacion Patrimonial e Inventario de Coleccionismo - ${escapeXml(tenant)}</title>
  <style>
    @page { size: A4; margin: 15mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0f172a; margin: 0; padding: 0; background: #fff; font-size: 12px; line-height: 1.4; }
    .header-box { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 15px; }
    .kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 15px; }
    .kpi-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; text-align: center; }
    .kpi-value { font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 4px; }
    .kpi-title { font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th { background: #f1f5f9; padding: 7px 6px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; text-align: left; border-bottom: 1px solid #cbd5e1; }
    .signature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 30px; page-break-inside: avoid; }
    .signature-line { border-top: 1px solid #0f172a; padding-top: 6px; text-align: center; font-size: 11px; }
    .disclaimer { font-size: 9px; color: #64748b; margin-top: 25px; line-height: 1.3; border-top: 1px dashed #cbd5e1; padding-top: 8px; }
    @media print { .no-print { display: none !important; } }
  </style>
</head>
<body>
  <div class="no-print" style="background: #0ea5e9; color: #fff; padding: 10px 15px; text-align: center; font-weight: bold; margin-bottom: 15px;">
    📄 Vista de Impresion Oficial para Seguro / Ficha de Inventario. Usa <em>Archivo -> Imprimir</em> o <em>Guardar como PDF</em>.
  </div>

  <div class="header-box">
    <div>
      <h1 style="font-size: 20px; margin: 0; font-weight: 900; letter-spacing: -0.5px; color: #0f172a;">${escapeXml(tenant).toUpperCase()} • TASACION PATRIMONIAL</h1>
      <div style="font-size: 11px; color: #475569; margin-top: 2px;">Ficha Oficial de Inventario y Valor de Reposicion para Seguro de Bienes & Coleccionismo</div>
      <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Coleccionista Titular: <strong>${escapeXml(summary.userName || summary.userId)}</strong></div>
    </div>
    <div style="text-align: right; font-size: 11px;">
      <div>Ref. Poliza/Expediente: <strong>${escapeXml(policyNum)}</strong></div>
      <div>Fecha de Emision: <strong>${new Date(summary.generatedAt).toLocaleDateString()}</strong></div>
      <div style="color: #64748b;">Moneda Base: <strong>${summary.currency}</strong></div>
    </div>
  </div>

  <div class="kpi-row">
    <div class="kpi-card">
      <div class="kpi-title">Valor Reposicion Total</div>
      <div class="kpi-value" style="color: #059669;">$${summary.totalEstimatedReplacementValue.toFixed(2)}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-title">Inversion Declarada</div>
      <div class="kpi-value">$${summary.totalAcquisitionInvestment.toFixed(2)}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-title">Modelos en Vitrina</div>
      <div class="kpi-value" style="color: #2563eb;">${summary.builtVitrinesCount} kits</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-title">Stash Sin Armar</div>
      <div class="kpi-value" style="color: #d97706;">${summary.unbuiltStashCount} kits</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 25px; text-align: center;">#</th>
        ${config.includePhotos !== false ? '<th style="width: 50px; text-align: center;">Foto</th>' : ''}
        <th>Modelo / Descripcion</th>
        <th>Marca</th>
        <th style="width: 50px; text-align: center;">Escala</th>
        <th style="width: 90px; text-align: center;">Estado</th>
        <th style="width: 75px; text-align: right;">Costo Adq.</th>
        <th style="width: 85px; text-align: right;">Val. Reposicion</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>

  <div class="signature-grid">
    <div>
      <div class="signature-line">
        <strong>${escapeXml(summary.userName || summary.userId)}</strong><br />
        Firma del Coleccionista / Titular
      </div>
    </div>
    <div>
      <div class="signature-line">
        <strong>${escapeXml(appraiser)}</strong><br />
        Perito Valuador / Sello de Plataforma
      </div>
    </div>
  </div>

  <div class="disclaimer">
    <strong>Aviso Legal & Alcance de la Tasacion:</strong> El presente documento detalla el valor de mercado estimado y costo de reposicion de los modelos a escala especificados. Para maquetas terminadas en vitrina, el valor de tasacion contempla un factor del 150% del valor base para reconocer insumos consumidos (primer, pinturas, barnices, calcas al agua) y mano de obra artesanal de acabado. Para cajas selladas en stash, se aplica la tasa de valor de mercado segun disponibilidad comercial.
  </div>
</body>
</html>`;
}

// ===========================================================================
// DT21: Workshop Soundscapes & Procedural Ambient Generator
// ===========================================================================

export type SoundscapePresetId =
  | 'lluvia-taller'
  | 'compresor-aerografo'
  | 'hangar-mecha'
  | 'lo-fi-beats'
  | 'jardin-zen';

export type SoundscapeCategory = 'nature' | 'workshop' | 'scifi' | 'music';

export interface SoundscapeLayer {
  id: string;
  name: string;
  type: 'noise' | 'drone' | 'tone' | 'texture';
  defaultVolume: number;
  description: string;
}

export interface SoundscapePreset {
  id: SoundscapePresetId;
  name: string;
  tag: string;
  description: string;
  icon: string;
  category: SoundscapeCategory;
  color: string;
  layers: SoundscapeLayer[];
  tempoBpm?: number;
}

export type SoundscapeTimerMode = 'none' | 'pomodoro-25' | 'deep-work-45' | 'session-60';

export interface SoundscapeSessionState {
  activePresetId: SoundscapePresetId;
  isPlaying: boolean;
  masterVolume: number;
  timerMode: SoundscapeTimerMode;
  secondsRemaining: number;
  totalSessionSeconds: number;
  layerVolumes: Record<string, number>;
}

export const WORKSHOP_SOUNDSCAPE_PRESETS: SoundscapePreset[] = [
  {
    id: 'lluvia-taller',
    name: 'Lluvia en el Taller',
    tag: 'Calma & Aislamiento',
    description: 'Chubasco suave sobre tejado y ventanas, ideal para corte de compuertas y lijado meticuloso.',
    icon: '🌧️',
    category: 'nature',
    color: '#38bdf8',
    layers: [
      { id: 'rain-heavy', name: 'Lluvia de fondo', type: 'noise', defaultVolume: 0.65, description: 'Ruido browniano de baja frecuencia' },
      { id: 'rain-patter', name: 'Gotas en vidrio', type: 'noise', defaultVolume: 0.40, description: 'Chispas de ruido rosa de alta frecuencia' },
      { id: 'distant-thunder', name: 'Truenos lejanos', type: 'drone', defaultVolume: 0.25, description: 'Resonador sub-grave a 60Hz' }
    ]
  },
  {
    id: 'compresor-aerografo',
    name: 'Estudio de Aerografía',
    tag: 'Foco de Pintura',
    description: 'Zumbido constante de compresor de diafragma y siseo de flujo de aire en cabina de extracción.',
    icon: '💨',
    category: 'workshop',
    color: '#a855f7',
    layers: [
      { id: 'compressor-hum', name: 'Motor de compresor', type: 'drone', defaultVolume: 0.45, description: 'Armónicos sutiles a 60Hz y 120Hz' },
      { id: 'airflow-hiss', name: 'Flujo de aire continuo', type: 'noise', defaultVolume: 0.50, description: 'Banda filtrada a 1.2kHz' },
      { id: 'booth-fan', name: 'Extractor de cabina', type: 'noise', defaultVolume: 0.35, description: 'Viento continuo de ventilador' }
    ]
  },
  {
    id: 'hangar-mecha',
    name: 'Hangar Sci-Fi Mecha',
    tag: 'Inmersión Total',
    description: 'Ambiente industrial futurista: resonancia de bahía de ensamblaje, sistemas hidráulicos y ecos lejanos.',
    icon: '🤖',
    category: 'scifi',
    color: '#10b981',
    layers: [
      { id: 'hangar-drone', name: 'Resonancia de bahía', type: 'drone', defaultVolume: 0.60, description: 'Drone armónico a 55Hz' },
      { id: 'hydraulics', name: 'Presurización hidráulica', type: 'noise', defaultVolume: 0.35, description: 'Barrido oscilante paso-banda' },
      { id: 'reactor-pulse', name: 'Pulso de reactor', type: 'tone', defaultVolume: 0.20, description: 'Modulación de pulso lenta' }
    ]
  },
  {
    id: 'lo-fi-beats',
    name: 'Lo-Fi Chillhop Taller',
    tag: 'Ritmo Relajante',
    description: 'Acordes cálidos sintéticos en Rhodes, crujido sutil de vinilo y pulsación suave para ensamblar.',
    icon: '🎧',
    category: 'music',
    color: '#f59e0b',
    tempoBpm: 72,
    layers: [
      { id: 'vinyl-crackle', name: 'Crujido de vinilo', type: 'texture', defaultVolume: 0.35, description: 'Micro-impulsos analógicos' },
      { id: 'rhodes-chords', name: 'Acordes cálidos', type: 'tone', defaultVolume: 0.55, description: 'Tríadas menores sintetizadas' },
      { id: 'tape-flutter', name: 'Calor de cinta', type: 'drone', defaultVolume: 0.30, description: 'LFO de tono vibrato sutil' }
    ]
  },
  {
    id: 'jardin-zen',
    name: 'Jardín Zen & Pincel',
    tag: 'Concentración Pura',
    description: 'Susurro de bambú, agua corriente y resonancias de cuenco tibetano para pincel seco y panel-lining.',
    icon: '🎋',
    category: 'nature',
    color: '#14b8a6',
    layers: [
      { id: 'bamboo-wind', name: 'Brisa en bambú', type: 'noise', defaultVolume: 0.50, description: 'Filtro paso-banda dinámico' },
      { id: 'water-stream', name: 'Arroyo continuo', type: 'noise', defaultVolume: 0.45, description: 'Gotas y gorgoteo acuático' },
      { id: 'singing-bowl', name: 'Cuenco tibetano', type: 'tone', defaultVolume: 0.30, description: 'Onda senoidal pura resonante' }
    ]
  }
];

export function getAllSoundscapePresets(): SoundscapePreset[] {
  return WORKSHOP_SOUNDSCAPE_PRESETS;
}

export function getSoundscapePreset(id: string): SoundscapePreset | undefined {
  return WORKSHOP_SOUNDSCAPE_PRESETS.find(p => p.id === id);
}

export function calculateTimerSeconds(mode: SoundscapeTimerMode): number {
  switch (mode) {
    case 'pomodoro-25':
      return 25 * 60;
    case 'deep-work-45':
      return 45 * 60;
    case 'session-60':
      return 60 * 60;
    case 'none':
    default:
      return 0;
  }
}

// ===========================================================================
// DT22: Airbrush PSI & Thinner Ratio Calculator
// ===========================================================================

export type AirbrushMedium =
  | 'lacquer'
  | 'acrylic-alcohol'
  | 'acrylic-water'
  | 'enamel'
  | 'polyurethane-primer';

export type AirbrushNeedleSize = 0.15 | 0.2 | 0.3 | 0.4 | 0.5;

export type AirbrushTechnique =
  | 'detail-shading'
  | 'base-coat'
  | 'primer-surfacer'
  | 'gloss-clear'
  | 'candy-metallic';

export interface AirbrushMixRequest {
  medium: AirbrushMedium;
  brand?: string;
  needleSize?: AirbrushNeedleSize;
  technique?: AirbrushTechnique;
  paintDrops?: number;
  ambientTempCelsius?: number;
  ambientHumidityPercent?: number;
}

export interface AirbrushTroubleshootingItem {
  symptom: string;
  issue?: string;
  probableCause: string;
  cause?: string;
  solution: string;
}

export interface AirbrushMixResult {
  medium: AirbrushMedium;
  mediumLabel: string;
  brand: string;
  needleSize: AirbrushNeedleSize;
  technique: AirbrushTechnique;
  techniqueLabel: string;
  paintParts: number;
  thinnerParts: number;
  ratioText: string;
  ratioString?: string;
  recommendedThinnerRatio?: number;
  recommendedThinnerName: string;
  recommendedThinner?: string;
  calculatedPaintDrops: number;
  recommendedPaintDrops?: number;
  calculatedThinnerDrops: number;
  recommendedThinnerDrops?: number;
  retarderDrops: number;
  flowImproverDrops: number;
  recommendedAdditives?: { flowImproverDrops: number; retarderDrops: number };
  recipeDescription?: string;
  pressurePsi: [number, number];
  pressureBar: [number, number];
  recommendedPressurePsi?: { min: number; max: number };
  recommendedPressureBar?: { min: number; max: number };
  sprayDistanceCm: [number, number];
  sprayingDistanceCm?: { min: number; max: number };
  viscosityAnalogy: string;
  expertTips: string[];
  tips?: string[];
  troubleshooting: AirbrushTroubleshootingItem[];
}

export const AIRBRUSH_MEDIUMS: AirbrushMedium[] = [
  'lacquer',
  'acrylic-alcohol',
  'acrylic-water',
  'enamel',
  'polyurethane-primer'
];

export const AIRBRUSH_NEEDLE_SIZES: AirbrushNeedleSize[] = [0.15, 0.2, 0.3, 0.4, 0.5];

export const AIRBRUSH_TECHNIQUES: AirbrushTechnique[] = [
  'base-coat',
  'detail-shading',
  'primer-surfacer',
  'gloss-clear',
  'candy-metallic'
];

export const AIRBRUSH_MEDIUM_LABELS: Record<AirbrushMedium, string> = {
  'lacquer': 'Laca Acrílica (Mr. Color, Gaia Notes, SMS, Tamiya LP)',
  'acrylic-alcohol': 'Acrílico Base Alcohol (Tamiya X/XF, Mr. Hobby Aqueous)',
  'acrylic-water': 'Acrílico Vinílico Base Agua (Vallejo, AK 3Gen, Ammo Mig)',
  'enamel': 'Esmalte / Enamel (Tamiya Enamel, Humbrol, Testors)',
  'polyurethane-primer': 'Imprimante Poliuretano / 2K Surfacer (Vallejo Surface Primer, Stynylrez)'
};

export const AIRBRUSH_TECHNIQUE_LABELS: Record<AirbrushTechnique, string> = {
  'detail-shading': 'Post-sombreado Fino & Trazos de Detalle',
  'base-coat': 'Capa Base Uniforme & Opaca',
  'primer-surfacer': 'Imprimación & Detección de Rayaduras (Surfacer)',
  'gloss-clear': 'Barniz Brillante / Capa Húmeda Espejo (Wet Coat)',
  'candy-metallic': 'Efecto Candy & Metálicos Pulidos'
};

export function calculateAirbrushMix(req: AirbrushMixRequest): AirbrushMixResult {
  const medium = req.medium || 'lacquer';
  if (!AIRBRUSH_MEDIUMS.includes(medium as any)) {
    throw new Error(`Química de pintura no válida: ${medium}`);
  }
  const needle: AirbrushNeedleSize = (req.needleSize !== undefined ? Number(req.needleSize) : 0.3) as AirbrushNeedleSize;
  if (!AIRBRUSH_NEEDLE_SIZES.includes(needle)) {
    throw new Error(`Diámetro de boquilla no válido: ${needle}`);
  }
  const technique: AirbrushTechnique = req.technique || 'base-coat';
  const paintDrops = req.paintDrops && req.paintDrops > 0 ? Number(req.paintDrops) : 10;
  const temp = req.ambientTempCelsius !== undefined ? Number(req.ambientTempCelsius) : (req as any).ambientTempC !== undefined ? Number((req as any).ambientTempC) : 22;
  const humidity = req.ambientHumidityPercent !== undefined ? Number(req.ambientHumidityPercent) : (req as any).ambientHumidityPct !== undefined ? Number((req as any).ambientHumidityPct) : 55;

  let paintParts = 1.0;
  let thinnerParts = 1.5;
  let defaultThinner = 'Mr. Color Leveling Thinner (con retardante)';
  let flowImproverDrops = 0;
  let retarderDrops = 0;
  let psiMin = 15;
  let psiMax = 20;
  let distMin = 6;
  let distMax = 10;
  let viscosity = 'Consistencia fluida como leche descremada; forma una película continua sin acumulación.';
  const tips: string[] = [];

  // Medium baseline configuration
  switch (medium) {
    case 'lacquer':
      defaultThinner = 'Mr. Color Leveling Thinner o Tamiya Lacquer Thinner Retarder';
      if (technique === 'detail-shading') {
        thinnerParts = 2.5;
        psiMin = 10;
        psiMax = 14;
        distMin = 2;
        distMax = 4;
        viscosity = 'Semistransparente muy fluido; no debe formar gotas gruesas al rociar a baja presión.';
        tips.push('Ajusta el gatillo con carrera muy corta para control milimétrico en líneas de panel.');
      } else if (technique === 'gloss-clear') {
        thinnerParts = 2.0;
        psiMin = 14;
        psiMax = 18;
        distMin = 5;
        distMax = 8;
        tips.push('Aplica primero una capa de niebla (mist coat) y luego dos capas húmedas uniformes.');
      } else if (technique === 'primer-surfacer') {
        thinnerParts = 1.2;
        psiMin = 20;
        psiMax = 25;
        distMin = 8;
        distMax = 12;
      } else if (technique === 'candy-metallic') {
        thinnerParts = 2.0;
        psiMin = 12;
        psiMax = 16;
        tips.push('Aplica sobre base negra brillante curada para máxima reflectividad cromada.');
      } else {
        thinnerParts = 1.5;
        psiMin = 16;
        psiMax = 20;
      }
      break;

    case 'acrylic-alcohol':
      defaultThinner = 'Tamiya X-20A Thinner o Alcohol Isopropílico 70-90%';
      if (technique === 'detail-shading') {
        thinnerParts = 2.0;
        psiMin = 12;
        psiMax = 15;
        distMin = 3;
        distMax = 5;
      } else if (technique === 'primer-surfacer') {
        thinnerParts = 1.0;
        psiMin = 20;
        psiMax = 24;
      } else {
        thinnerParts = 1.2;
        psiMin = 16;
        psiMax = 20;
      }
      tips.push('El alcohol evapora rápido; si notas pulverizado seco añade 1 gota de retardante cada 15 gotas.');
      break;

    case 'acrylic-water':
      defaultThinner = 'Vallejo Airbrush Thinner / AK 3Gen Thinner (nunca agua corriente sola)';
      flowImproverDrops = Math.max(1, Math.round(paintDrops * 0.1));
      retarderDrops = Math.max(1, Math.round(paintDrops * 0.05));
      if (technique === 'detail-shading') {
        thinnerParts = 1.5;
        psiMin = 14;
        psiMax = 18;
      } else if (technique === 'primer-surfacer') {
        thinnerParts = 0.3;
        psiMin = 22;
        psiMax = 26;
      } else {
        thinnerParts = 0.8;
        psiMin = 18;
        psiMax = 22;
      }
      tips.push('Esencial añadir 1-2 gotas de Flow Improver para lubricar la punta de la aguja y evitar tip-dry.');
      tips.push('Limpia periódicamente la corona de la aguja con un pincel humedecido en limpiador.');
      break;

    case 'enamel':
      defaultThinner = 'Tamiya X-20 Enamel Thinner o Esencia de Trementina / Odorless Spirits';
      thinnerParts = technique === 'detail-shading' ? 1.8 : 1.0;
      psiMin = 14;
      psiMax = 18;
      distMin = 6;
      distMax = 10;
      tips.push('El esmalte tarda más en secar, ideal para acabados ultra lisos sin marcas de spray.');
      break;

    case 'polyurethane-primer':
      defaultThinner = 'Vallejo Airbrush Thinner (máximo 10-20% para no quebrar la resina PU)';
      thinnerParts = 0.25;
      flowImproverDrops = Math.max(1, Math.round(paintDrops * 0.1));
      psiMin = 22;
      psiMax = 28;
      distMin = 8;
      distMax = 14;
      viscosity = 'Más denso; debe pulverizar con abanico amplio sin saturar ranuras de piezas.';
      tips.push('Usa aguja preferentemente de 0.4mm o 0.5mm para evitar atascos en la compuerta de fluido.');
      break;
  }

  // Needle adjustments
  if (needle <= 0.2) {
    psiMin = Math.max(8, psiMin - 3);
    psiMax = Math.max(12, psiMax - 4);
    thinnerParts = Math.round((thinnerParts + 0.3) * 10) / 10;
    tips.push(`Con boquilla fina de ${needle}mm es mandatorio colar la pintura para evitar motas.`);
  } else if (needle >= 0.4) {
    psiMin += 2;
    psiMax += 3;
    distMin += 2;
    distMax += 3;
  }

  // Environmental climate adjustments
  if (temp > 27) {
    retarderDrops += Math.max(1, Math.round(paintDrops * 0.08));
    thinnerParts = Math.round((thinnerParts + 0.2) * 10) / 10;
    tips.push(`Clima cálido (${temp}°C): mayor velocidad de evaporación. Se incrementó retardante para prevenir pulverizado seco.`);
  }

  if (humidity > 70 && medium === 'lacquer') {
    tips.push(`Humedad elevada (${humidity}%): usa exclusivamente retardante con agente antihumedad (blushing prevention) para evitar veladuras blancas.`);
  }

  const calculatedThinnerDrops = Math.round(paintDrops * thinnerParts);
  const ratioText = `1 : ${thinnerParts.toFixed(1).replace('.0', '')}`;

  const barMin = Math.round((psiMin / 14.5038) * 10) / 10;
  const barMax = Math.round((psiMax / 14.5038) * 10) / 10;

  const troubleshooting: AirbrushTroubleshootingItem[] = [
    {
      symptom: 'Piel de naranja (superficie rugosa e irregular)',
      issue: 'Piel de naranja (superficie rugosa e irregular)',
      probableCause: 'Pintura excesivamente espesa, presión demasiado baja o distancia excesiva.',
      cause: 'Pintura excesivamente espesa, presión demasiado baja o distancia excesiva.',
      solution: `Incrementa la dilución a 1:${(thinnerParts + 0.5).toFixed(1)} y sube 2 PSI al compresor.`
    },
    {
      symptom: 'Patas de araña / Charcos (Spider webbing)',
      issue: 'Patas de araña / Charcos (Spider webbing)',
      probableCause: 'Pintura sobre-diluida, presión muy alta o pulverizado demasiado cercano.',
      cause: 'Pintura sobre-diluida, presión muy alta o pulverizado demasiado cercano.',
      solution: 'Reduce el flujo de diluyente, baja la presión 3-4 PSI y mantén el aerógrafo a mínimo 6cm de la pieza.'
    },
    {
      symptom: 'Pulverizado seco / Arenoso (Dry spray)',
      issue: 'Pulverizado seco / Arenoso (Dry spray)',
      probableCause: 'La pintura seca en el aire antes de tocar el plástico por calor o diluyente ultra-rápido.',
      cause: 'La pintura seca en el aire antes de tocar el plástico por calor o diluyente ultra-rápido.',
      solution: 'Acerca el aerógrafo 3cm y añade 2 gotas de retardante para ralentizar el secado superficial.'
    },
    {
      symptom: 'Obstrucción en la aguja (Tip-dry)',
      issue: 'Obstrucción en la aguja (Tip-dry)',
      probableCause: 'Acumulación de pintura seca en el protector de corona (común en acrílicos vinílicos).',
      cause: 'Acumulación de pintura seca en el protector de corona (común en acrílicos vinílicos).',
      solution: 'Limpia la punta con bastoncillo con alcohol/cleaner y añade 2 gotas de Flow Improver a la copa.'
    },
    {
      symptom: 'Salpicaduras y chisporroteo (Splattering)',
      issue: 'Salpicaduras y chisporroteo (Splattering)',
      probableCause: 'Presión inestable, boquilla floja o suciedad acumulada en el canal de aguja.',
      cause: 'Presión inestable, boquilla floja o suciedad acumulada en el canal de aguja.',
      solution: 'Asegura la rosca de la boquilla (nozzel), purga agua del filtro del compresor y vacía la copa para limpiar.'
    }
  ];

  let recipeDescription = `${paintDrops} gotas Pintura + ${calculatedThinnerDrops} gotas Diluyente`;
  if (flowImproverDrops > 0) {
    recipeDescription += ` + ${flowImproverDrops} gotas Flow Improver`;
  }
  if (retarderDrops > 0) {
    recipeDescription += ` + ${retarderDrops} gotas Retarder`;
  }

  return {
    medium,
    mediumLabel: AIRBRUSH_MEDIUM_LABELS[medium],
    brand: req.brand || (medium === 'lacquer' ? 'Mr. Color' : medium === 'acrylic-alcohol' ? 'Tamiya' : 'Vallejo'),
    needleSize: needle,
    technique,
    techniqueLabel: AIRBRUSH_TECHNIQUE_LABELS[technique],
    paintParts,
    thinnerParts,
    ratioText,
    ratioString: ratioText,
    recommendedThinnerRatio: thinnerParts,
    recommendedThinnerName: defaultThinner,
    recommendedThinner: defaultThinner,
    calculatedPaintDrops: paintDrops,
    recommendedPaintDrops: paintDrops,
    calculatedThinnerDrops,
    recommendedThinnerDrops: calculatedThinnerDrops,
    retarderDrops,
    flowImproverDrops,
    recommendedAdditives: {
      flowImproverDrops,
      retarderDrops
    },
    recipeDescription,
    pressurePsi: [psiMin, psiMax],
    pressureBar: [barMin, barMax],
    recommendedPressurePsi: { min: psiMin, max: psiMax },
    recommendedPressureBar: { min: barMin, max: barMax },
    sprayDistanceCm: [distMin, distMax],
    sprayingDistanceCm: { min: distMin, max: distMax },
    viscosityAnalogy: viscosity,
    expertTips: tips,
    tips,
    troubleshooting
  };
}

// ============================================================================
// DT23: Parts Breakdown & Assembly Subassembly Cards
// ============================================================================
export type SubassemblyStage = 'cut' | 'cleaned' | 'primed' | 'painted' | 'topcoated';

export interface SubassemblyStageProgress {
  cut: boolean;
  cleaned: boolean;
  primed: boolean;
  painted: boolean;
  topcoated: boolean;
}

export type SubassemblyType =
  | 'head'
  | 'torso'
  | 'arms'
  | 'legs'
  | 'waist'
  | 'backpack'
  | 'weapons'
  | 'cockpit'
  | 'chassis'
  | 'engine'
  | 'turret'
  | 'wings'
  | 'accessories'
  | 'custom';

export interface SubassemblyCard {
  id: string;
  buildId: string;
  name: string;
  type: SubassemblyType;
  icon: string;
  runners: string[];
  partCountEstimated: number;
  stages: SubassemblyStageProgress;
  customNotes: string;
  colorPaletteNotes?: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubassemblyDto {
  name?: string;
  type?: SubassemblyType;
  icon?: string;
  runners?: string[];
  partCountEstimated?: number;
  stages?: Partial<SubassemblyStageProgress>;
  customNotes?: string;
  colorPaletteNotes?: string;
  autoGenerate?: boolean;
}

export interface UpdateSubassemblyDto {
  name?: string;
  type?: SubassemblyType;
  icon?: string;
  runners?: string[];
  partCountEstimated?: number;
  stages?: Partial<SubassemblyStageProgress>;
  customNotes?: string;
  colorPaletteNotes?: string;
  orderIndex?: number;
}

export interface SubassemblyOverallProgress {
  totalCards: number;
  totalStagesCount: number;
  completedStagesCount: number;
  completionPercentage: number;
  totalPartsEstimated: number;
  stageBreakdown: Record<SubassemblyStage, { completed: number; total: number; pct: number }>;
}

export function generateDefaultSubassemblies(
  buildId: string,
  category: string = 'gunpla',
  grade: string = 'MG'
): SubassemblyCard[] {
  const cat = (category || 'gunpla').toLowerCase();
  const now = new Date().toISOString();

  type TemplateItem = {
    name: string;
    type: SubassemblyType;
    icon: string;
    runners: string[];
    parts: number;
    notes: string;
  };

  let templates: TemplateItem[] = [];

  if (cat.includes('military') || cat.includes('armor') || cat.includes('tank')) {
    templates = [
      { name: 'Casco Inferior & Suspensión', type: 'chassis', icon: '🚜', runners: ['A', 'B'], parts: 32, notes: 'Lijar marcas de eyección en brazos de suspensión.' },
      { name: 'Ruedas & Orugas / Tracks', type: 'chassis', icon: '⚙️', runners: ['B', 'C', 'TR'], parts: 48, notes: 'Pintar bandas de caucho antes de ensamblar eslabones.' },
      { name: 'Casco Superior & Guardabarros', type: 'chassis', icon: '🛡️', runners: ['A', 'C'], parts: 26, notes: 'Verificar encastre frontal y texturizar fundición.' },
      { name: 'Torreta Principal & Cañón', type: 'turret', icon: '🎯', runners: ['D', 'E'], parts: 34, notes: 'Eliminar línea de molde en el tubo del cañón (seam line).' },
      { name: 'Herramientas OVM & Petacas', type: 'accessories', icon: '🔧', runners: ['E', 'PE'], parts: 18, notes: 'Pintar mangos de madera y partes metálicas por separado.' }
    ];
  } else if (cat.includes('aviation') || cat.includes('aircraft') || cat.includes('avion')) {
    templates = [
      { name: 'Cabina & Asiento Eyectable', type: 'cockpit', icon: '💺', runners: ['A', 'PE'], parts: 16, notes: 'Pintar paneles de instrumentos y arneses antes de cerrar.' },
      { name: 'Fuselaje & Tomas de Aire', type: 'chassis', icon: '✈️', runners: ['B', 'C'], parts: 28, notes: 'Añadir contrapeso de plomo en el morro (nose weight).' },
      { name: 'Alas & Flaps / Alerones', type: 'wings', icon: '🛩️', runners: ['A', 'C'], parts: 30, notes: 'Repasar líneas de panel con buril 0.15mm.' },
      { name: 'Tren de Aterrizaje & Pozos', type: 'chassis', icon: '🛞', runners: ['D', 'PE'], parts: 22, notes: 'Detallar mangueras hidráulicas con hilo de cobre.' },
      { name: 'Armamento & Tanques Alares', type: 'weapons', icon: '💣', runners: ['E', 'F'], parts: 20, notes: 'Aplicar calcas de advertencia antes de barniz mate.' }
    ];
  } else if (cat.includes('auto') || cat.includes('car') || cat.includes('vehiculo')) {
    templates = [
      { name: 'Bloque Motor & Transmisión', type: 'engine', icon: '🏎️', runners: ['A', 'B'], parts: 32, notes: 'Cableado de bujías y manifold de escape.' },
      { name: 'Chasis, Frenos & Suspensión', type: 'chassis', icon: '🔩', runners: ['B', 'C'], parts: 26, notes: 'Imprimar discos de freno en Gunmetal.' },
      { name: 'Habitáculo, Butacas & Tablero', type: 'cockpit', icon: '🛋️', runners: ['C', 'D'], parts: 24, notes: 'Flocado aterciopelado en alfombras y cinturones tela.' },
      { name: 'Carrocería & Cristales Transparentes', type: 'accessories', icon: '✨', runners: ['E', 'CL'], parts: 20, notes: 'Pulir carrocería con compuestos basto, fino y finish.' }
    ];
  } else {
    // Default: Sci-Fi / Gunpla / Mecha
    const isPg = grade === 'PG' || grade === 'MegaSize';
    const mult = isPg ? 1.8 : grade === 'RG' || grade === 'MG' ? 1.2 : 1.0;

    templates = [
      { name: 'Cabeza / Head Unit', type: 'head', icon: '🤖', runners: ['A', 'B', 'PC'], parts: Math.round(14 * mult), notes: 'Pintar v-fin, panel line en orejas y limpiar nubs diminutos.' },
      { name: 'Torso & Cabina de Piloto', type: 'torso', icon: '🥋', runners: ['A', 'B', 'C', 'PC'], parts: Math.round(26 * mult), notes: 'Encastre de hombros y compuerta de cockpit.' },
      { name: 'Brazos & Manos / Arm Units', type: 'arms', icon: '💪', runners: ['A', 'C', 'D', 'PC'], parts: Math.round(36 * mult), notes: 'Comprobar rigidez de codos y despiece simétrico der/izq.' },
      { name: 'Cintura & Faldones / Waist Unit', type: 'waist', icon: '🩳', runners: ['B', 'C', 'PC'], parts: Math.round(18 * mult), notes: 'Separar faldones frontales gemelos con alicate de corte fino.' },
      { name: 'Piernas & Pies / Leg Units', type: 'legs', icon: '🦵', runners: ['A', 'B', 'D', 'PC'], parts: Math.round(44 * mult), notes: 'Pistones de rodilla en esqueleto interno y tobillo con holgura.' },
      { name: 'Mochila Propulsora / Backpack', type: 'backpack', icon: '🚀', runners: ['C', 'D'], parts: Math.round(16 * mult), notes: 'Toberas metálicas con quemado titanium exhaust.' },
      { name: 'Armamento & Escudo / Weapons', type: 'weapons', icon: '⚔️', runners: ['E', 'F'], parts: Math.round(22 * mult), notes: 'Eliminar costura longitudinal en rifle de rayos.' }
    ];
  }

  return templates.map((tpl, idx) => ({
    id: `sub-${buildId.slice(-6)}-${idx + 1}`,
    buildId,
    name: tpl.name,
    type: tpl.type,
    icon: tpl.icon,
    runners: tpl.runners,
    partCountEstimated: tpl.parts,
    stages: {
      cut: false,
      cleaned: false,
      primed: false,
      painted: false,
      topcoated: false
    },
    customNotes: tpl.notes,
    colorPaletteNotes: '',
    orderIndex: idx,
    createdAt: now,
    updatedAt: now
  }));
}

export function calculateSubassemblyOverallProgress(cards: SubassemblyCard[]): SubassemblyOverallProgress {
  const totalCards = cards.length;
  const stagesList: SubassemblyStage[] = ['cut', 'cleaned', 'primed', 'painted', 'topcoated'];

  if (totalCards === 0) {
    return {
      totalCards: 0,
      totalStagesCount: 0,
      completedStagesCount: 0,
      completionPercentage: 0,
      totalPartsEstimated: 0,
      stageBreakdown: {
        cut: { completed: 0, total: 0, pct: 0 },
        cleaned: { completed: 0, total: 0, pct: 0 },
        primed: { completed: 0, total: 0, pct: 0 },
        painted: { completed: 0, total: 0, pct: 0 },
        topcoated: { completed: 0, total: 0, pct: 0 }
      }
    };
  }

  const totalStagesCount = totalCards * stagesList.length;
  let completedStagesCount = 0;
  let totalPartsEstimated = 0;

  const stageBreakdown: Record<SubassemblyStage, { completed: number; total: number; pct: number }> = {
    cut: { completed: 0, total: totalCards, pct: 0 },
    cleaned: { completed: 0, total: totalCards, pct: 0 },
    primed: { completed: 0, total: totalCards, pct: 0 },
    painted: { completed: 0, total: totalCards, pct: 0 },
    topcoated: { completed: 0, total: totalCards, pct: 0 }
  };

  cards.forEach(card => {
    totalPartsEstimated += card.partCountEstimated || 0;
    stagesList.forEach(stg => {
      if (card.stages && card.stages[stg]) {
        completedStagesCount++;
        stageBreakdown[stg].completed++;
      }
    });
  });

  stagesList.forEach(stg => {
    stageBreakdown[stg].pct = Math.round((stageBreakdown[stg].completed / totalCards) * 100);
  });

  const completionPercentage = Math.round((completedStagesCount / totalStagesCount) * 100);

  return {
    totalCards,
    totalStagesCount,
    completedStagesCount,
    completionPercentage,
    totalPartsEstimated,
    stageBreakdown
  };
}

export function generateSubassemblyWorksheetHtml(params: {
  buildTitle: string;
  kitName?: string;
  scale?: string;
  grade?: string;
  builderName?: string;
  tenantTitle?: string;
  cards: SubassemblyCard[];
}): string {
  const { buildTitle, kitName, scale, grade, builderName, tenantTitle, cards } = params;
  const progress = calculateSubassemblyOverallProgress(cards);
  const nowFormatted = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

  const cardsHtml = cards.map(c => {
    const runnersHtml = (c.runners && c.runners.length > 0)
      ? c.runners.map(r => `<span class="runner-badge">[ ${r} ]</span>`).join(' ')
      : '<span style="color: #94a3b8; font-style: italic;">Sin asignar</span>';

    const stageBox = (stgKey: SubassemblyStage, label: string) => {
      const isChecked = c.stages && c.stages[stgKey];
      return `
        <div class="stage-item ${isChecked ? 'checked' : ''}">
          <span class="box">${isChecked ? '☒' : '☐'}</span>
          <span class="lbl">${label}</span>
        </div>
      `;
    };

    return `
      <div class="tray-card">
        <div class="cut-corner">✂️ Cortar ficha para bandeja</div>
        <div class="card-header">
          <div class="title-wrap">
            <span class="icon">${c.icon || '🧩'}</span>
            <span class="name">${c.name}</span>
          </div>
          <span class="parts-badge">~${c.partCountEstimated || 0} piezas</span>
        </div>

        <div class="meta-row">
          <strong>Grapas / Runners:</strong> ${runnersHtml}
        </div>

        <div class="stages-grid">
          ${stageBox('cut', '1. Cortado')}
          ${stageBox('cleaned', '2. Lijado / Nubs')}
          ${stageBox('primed', '3. Imprimado')}
          ${stageBox('painted', '4. Pintado')}
          ${stageBox('topcoated', '5. Barnizado')}
        </div>

        ${c.customNotes ? `
          <div class="notes-box">
            <strong>Modificaciones / Checklist:</strong>
            <p>${c.customNotes}</p>
          </div>
        ` : `
          <div class="notes-box empty">
            <em>Notas técnicas / panel lines / encastre libre:</em>
            <div class="dotted-lines">....................................................................................................</div>
          </div>
        `}

        ${c.colorPaletteNotes ? `
          <div class="color-box">
            <strong>Colores:</strong> ${c.colorPaletteNotes}
          </div>
        ` : ''}
      </div>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Fichas de Despiece & Subensambles - ${kitName || buildTitle}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    body {
      background: #f8fafc;
      color: #0f172a;
      padding: 12px;
    }
    .header-banner {
      background: #0f172a;
      color: #ffffff;
      padding: 16px 20px;
      border-radius: 8px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-left: 6px solid #2563eb;
    }
    .header-banner h1 {
      font-size: 1.35rem;
      font-weight: 800;
      letter-spacing: -0.02em;
    }
    .header-banner p {
      font-size: 0.85rem;
      color: #94a3b8;
      margin-top: 4px;
    }
    .kpi-row {
      display: flex;
      gap: 16px;
      text-align: right;
    }
    .kpi-pill {
      background: rgba(255,255,255,0.08);
      padding: 8px 14px;
      border-radius: 6px;
      border: 1px solid rgba(255,255,255,0.15);
    }
    .kpi-val {
      font-size: 1.15rem;
      font-weight: 800;
      color: #38bdf8;
    }
    .kpi-lbl {
      font-size: 0.65rem;
      text-transform: uppercase;
      color: #cbd5e1;
      font-weight: 600;
    }

    .cards-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 14px;
    }

    .tray-card {
      background: #ffffff;
      border: 2px dashed #94a3b8;
      border-radius: 8px;
      padding: 14px 16px;
      position: relative;
      page-break-inside: avoid;
      display: flex;
      flex-direction: column;
      gap: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }

    .cut-corner {
      position: absolute;
      top: -10px;
      right: 14px;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      padding: 1px 6px;
      font-size: 0.62rem;
      color: #64748b;
      font-weight: 600;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1.5px solid #e2e8f0;
      padding-bottom: 6px;
    }
    .title-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .icon {
      font-size: 1.25rem;
    }
    .name {
      font-size: 1rem;
      font-weight: 700;
      color: #1e293b;
    }
    .parts-badge {
      background: #f1f5f9;
      color: #475569;
      font-size: 0.72rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 12px;
      border: 1px solid #cbd5e1;
    }

    .meta-row {
      font-size: 0.78rem;
      color: #334155;
    }
    .runner-badge {
      display: inline-block;
      background: #e0e7ff;
      color: #3730a3;
      font-weight: 700;
      font-family: monospace;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.75rem;
      margin-right: 2px;
    }

    .stages-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 4px;
      background: #f8fafc;
      padding: 6px;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
    }
    .stage-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 4px 2px;
      border-radius: 4px;
      font-size: 0.65rem;
      color: #475569;
      background: #ffffff;
      border: 1px solid #cbd5e1;
    }
    .stage-item.checked {
      background: #ecfdf5;
      border-color: #10b981;
      color: #065f46;
      font-weight: 700;
    }
    .stage-item .box {
      font-size: 0.95rem;
      line-height: 1;
      margin-bottom: 2px;
    }

    .notes-box {
      background: #fdf2f8;
      border-left: 3px solid #ec4899;
      padding: 6px 10px;
      border-radius: 4px;
      font-size: 0.72rem;
      color: #831843;
    }
    .notes-box.empty {
      background: #f8fafc;
      border-left: 3px solid #cbd5e1;
      color: #64748b;
    }
    .dotted-lines {
      color: #cbd5e1;
      margin-top: 4px;
      letter-spacing: 2px;
    }

    .color-box {
      font-size: 0.7rem;
      color: #0369a1;
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      padding: 4px 8px;
      border-radius: 4px;
    }

    .footer-bar {
      margin-top: 16px;
      font-size: 0.7rem;
      color: #94a3b8;
      text-align: center;
      border-top: 1px solid #e2e8f0;
      padding-top: 8px;
    }

    @media print {
      body {
        background: #fff;
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
      .tray-card {
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <div class="header-banner">
    <div>
      <h1>📋 Ficha de Despiece & Bandejas de Subensambles</h1>
      <p>
        <strong>${buildTitle}</strong>
        ${kitName && kitName !== buildTitle ? ` · Kit: ${kitName}` : ''}
        ${scale ? ` · Escala ${scale}` : ''}
        ${grade ? ` · ${grade}` : ''}
        ${builderName ? ` · Modelista: ${builderName}` : ''}
      </p>
    </div>
    <div class="kpi-row">
      <div class="kpi-pill">
        <div class="kpi-val">${progress.totalCards}</div>
        <div class="kpi-lbl">Subensambles</div>
      </div>
      <div class="kpi-pill">
        <div class="kpi-val">~${progress.totalPartsEstimated}</div>
        <div class="kpi-lbl">Piezas Est.</div>
      </div>
      <div class="kpi-pill">
        <div class="kpi-val">${progress.completionPercentage}%</div>
        <div class="kpi-lbl">Progreso Fase</div>
      </div>
    </div>
  </div>

  <div class="cards-grid">
    ${cardsHtml}
  </div>

  <div class="footer-bar">
    ${tenantTitle || 'PlamoScale / GunplaJunkies'} · Manual de Taller y Fichas de Bandeja · Impreso el ${nowFormatted}
  </div>
</body>
</html>`;
}

// ============================================================================
// DT24: Workbench Tool Inventory & Blade Wear Tracker
// ============================================================================
export type ToolCategory =
  | 'nippers'
  | 'knives'
  | 'chisels'
  | 'abrasives'
  | 'airbrush'
  | 'rotary-drill'
  | 'general';

export const TOOL_CATEGORIES: ToolCategory[] = [
  'nippers',
  'knives',
  'chisels',
  'abrasives',
  'airbrush',
  'rotary-drill',
  'general'
];

export const TOOL_CATEGORY_LABELS: Record<ToolCategory, string> = {
  'nippers': 'Alicates de Corte (Single/Double Blade)',
  'knives': 'Cúteres & Cuchillas de Precisión (Design Knife)',
  'chisels': 'Buriles de Grabado (Panel Line Chisels)',
  'abrasives': 'Lijas & Limas (Glass / Sponge / Sticks)',
  'airbrush': 'Aerógrafos & Boquillas',
  'rotary-drill': 'Taladros Manuales & Brocas',
  'general': 'Herramientas Generales (Pinzas, Tapetes)'
};

export type ToolCondition = 'new' | 'good' | 'fair' | 'worn' | 'needs_replacement';
export type ToolStatus = 'active' | 'in_use' | 'maintenance' | 'retired';

export interface ToolWearTracker {
  enabled: boolean;
  bladeType?: string;
  currentCutsCount: number;
  maxRecommendedCuts: number;
  sessionsCount: number;
  lastBladeReplacedAt?: string;
  totalBladesConsumed: number;
}

export interface ToolMaintenanceLogEntry {
  id: string;
  type: 'blade_replacement' | 'lubrication' | 'sharpening' | 'deep_clean' | 'alignment' | 'general';
  notes: string;
  performedAt: string;
}

export interface WorkbenchToolItem {
  id: string;
  userId: string;
  name: string;
  brand: string;
  category: ToolCategory;
  modelNumber?: string;
  purchasePrice?: number;
  purchaseCurrency?: string;
  acquiredAt?: string;
  status: ToolStatus;
  condition: ToolCondition;
  wear: ToolWearTracker;
  maintenanceLog: ToolMaintenanceLogEntry[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkbenchToolDto {
  name: string;
  brand: string;
  category: ToolCategory;
  modelNumber?: string;
  purchasePrice?: number;
  purchaseCurrency?: string;
  acquiredAt?: string;
  status?: ToolStatus;
  condition?: ToolCondition;
  wearEnabled?: boolean;
  bladeType?: string;
  maxRecommendedCuts?: number;
  notes?: string;
}

export interface UpdateWorkbenchToolDto {
  name?: string;
  brand?: string;
  category?: ToolCategory;
  modelNumber?: string;
  purchasePrice?: number;
  purchaseCurrency?: string;
  status?: ToolStatus;
  condition?: ToolCondition;
  notes?: string;
  cutsIncrement?: number;
  sessionsIncrement?: number;
}

export interface ToolWearCalculationResult {
  wearPercentage: number;
  remainingLifespanPct: number;
  conditionSuggestion: ToolCondition;
  isDullWarning: boolean;
  alertMessage?: string;
  recommendedAction?: string;
}

export interface WorkbenchToolsSummary {
  totalTools: number;
  activeToolsCount: number;
  byCategory: Record<ToolCategory, number>;
  wornToolsCount: number;
  needsReplacementCount: number;
  totalBladesConsumedAllTime: number;
}

export function calculateToolWear(
  tool: WorkbenchToolItem | { wear: ToolWearTracker; condition?: ToolCondition }
): ToolWearCalculationResult {
  if (!tool.wear || !tool.wear.enabled || !tool.wear.maxRecommendedCuts || tool.wear.maxRecommendedCuts <= 0) {
    return {
      wearPercentage: 0,
      remainingLifespanPct: 100,
      conditionSuggestion: (tool.condition as ToolCondition) || 'good',
      isDullWarning: false
    };
  }

  const cuts = Math.max(0, tool.wear.currentCutsCount || 0);
  const max = tool.wear.maxRecommendedCuts;
  const wearPercentage = Math.min(100, Math.round((cuts / max) * 100));
  const remainingLifespanPct = Math.max(0, 100 - wearPercentage);

  if (wearPercentage >= 100) {
    return {
      wearPercentage,
      remainingLifespanPct,
      conditionSuggestion: 'needs_replacement',
      isDullWarning: true,
      alertMessage: `¡Filo agotado (${cuts}/${max} cortes)! La cuchilla está mellada o sin filo, lo que provocará marcas de estrés blanco o aplastamiento en el plástico.`,
      recommendedAction: 'Reemplazar cuchilla o afilar de inmediato'
    };
  }

  if (wearPercentage >= 80) {
    return {
      wearPercentage,
      remainingLifespanPct,
      conditionSuggestion: 'worn',
      isDullWarning: true,
      alertMessage: `Desgaste avanzado (${cuts}/${max} cortes, ${remainingLifespanPct}% vida restante). El filo está perdiendo precisión en cortes finos.`,
      recommendedAction: 'Preparar cuchilla de repuesto'
    };
  }

  if (wearPercentage >= 50) {
    return {
      wearPercentage,
      remainingLifespanPct,
      conditionSuggestion: 'fair',
      isDullWarning: false,
      recommendedAction: 'Filo óptimo para corte general de compuertas'
    };
  }

  if (wearPercentage >= 20) {
    return {
      wearPercentage,
      remainingLifespanPct,
      conditionSuggestion: 'good',
      isDullWarning: false,
      recommendedAction: 'Filo afilado y preciso'
    };
  }

  return {
    wearPercentage,
    remainingLifespanPct,
    conditionSuggestion: 'new',
    isDullWarning: false,
    recommendedAction: 'Cuchilla nueva con filo de máxima precisión'
  };
}

export function calculateWorkbenchToolsSummary(tools: WorkbenchToolItem[]): WorkbenchToolsSummary {
  const byCategory: Record<ToolCategory, number> = {
    'nippers': 0,
    'knives': 0,
    'chisels': 0,
    'abrasives': 0,
    'airbrush': 0,
    'rotary-drill': 0,
    'general': 0
  };

  let activeToolsCount = 0;
  let wornToolsCount = 0;
  let needsReplacementCount = 0;
  let totalBladesConsumedAllTime = 0;

  tools.forEach(t => {
    if (byCategory[t.category] !== undefined) {
      byCategory[t.category]++;
    } else {
      byCategory['general']++;
    }

    if (t.status === 'active' || t.status === 'in_use') {
      activeToolsCount++;
    }

    if (t.wear && t.wear.enabled) {
      totalBladesConsumedAllTime += t.wear.totalBladesConsumed || 0;
      const wearRes = calculateToolWear(t);
      if (wearRes.wearPercentage >= 100) {
        needsReplacementCount++;
      } else if (wearRes.wearPercentage >= 80) {
        wornToolsCount++;
      }
    }
  });

  return {
    totalTools: tools.length,
    activeToolsCount,
    byCategory,
    wornToolsCount,
    needsReplacementCount,
    totalBladesConsumedAllTime
  };
}

export function getStarterToolsForUser(userId: string): WorkbenchToolItem[] {
  const now = new Date().toISOString();
  return [
    {
      id: `tool-${userId.slice(-6)}-1`,
      userId,
      name: 'GodHand SPN-120 Ultimate Nipper (Alicate Single-Blade)',
      brand: 'GodHand',
      category: 'nippers',
      modelNumber: 'SPN-120',
      purchasePrice: 58.00,
      purchaseCurrency: 'USD',
      acquiredAt: '2025-11-10',
      status: 'active',
      condition: 'good',
      wear: {
        enabled: true,
        bladeType: 'GodHand Single Blade Ultra-Thin (Filo Único)',
        currentCutsCount: 85,
        maxRecommendedCuts: 400,
        sessionsCount: 14,
        lastBladeReplacedAt: '2025-11-10T00:00:00.000Z',
        totalBladesConsumed: 0
      },
      maintenanceLog: [
        {
          id: 'maint-1',
          type: 'lubrication',
          notes: 'Lubricación de resorte y perno con aceite mineral antióxido.',
          performedAt: '2026-01-15T10:00:00.000Z'
        }
      ],
      notes: 'Usar exclusivamente en compuertas de plástico blando (PS/PE), jamás en policarbonato transparente ni metal.',
      createdAt: now,
      updatedAt: now
    },
    {
      id: `tool-${userId.slice(-6)}-2`,
      userId,
      name: 'Olfa AK-4 Art Knife Pro (Cúter de Precisión)',
      brand: 'Olfa',
      category: 'knives',
      modelNumber: 'AK-4',
      purchasePrice: 16.50,
      purchaseCurrency: 'USD',
      acquiredAt: '2025-08-20',
      status: 'active',
      condition: 'good',
      wear: {
        enabled: true,
        bladeType: 'Olfa KB4-S (Cuchilla de Precisión 30°)',
        currentCutsCount: 75,
        maxRecommendedCuts: 200,
        sessionsCount: 18,
        lastBladeReplacedAt: '2026-02-01T00:00:00.000Z',
        totalBladesConsumed: 3
      },
      maintenanceLog: [
        {
          id: 'maint-2',
          type: 'blade_replacement',
          notes: 'Cambio de cuchilla mellada tras recortar planchas de estireno.',
          performedAt: '2026-02-01T00:00:00.000Z'
        }
      ],
      notes: 'Mango ergonómico antideslizante con balance de peso para desbaste de nubs.',
      createdAt: now,
      updatedAt: now
    },
    {
      id: `tool-${userId.slice(-6)}-3`,
      userId,
      name: 'Gunprimer Raser Plus (Lima de Nanovidrio Templado)',
      brand: 'Gunprimer',
      category: 'abrasives',
      modelNumber: 'R-GP-P1',
      purchasePrice: 24.00,
      purchaseCurrency: 'USD',
      acquiredAt: '2025-12-05',
      status: 'active',
      condition: 'new',
      wear: {
        enabled: false,
        bladeType: 'Superficie de Vidrio Templado Nano-Grabado',
        currentCutsCount: 0,
        maxRecommendedCuts: 0,
        sessionsCount: 22,
        totalBladesConsumed: 0
      },
      maintenanceLog: [
        {
          id: 'maint-3',
          type: 'deep_clean',
          notes: 'Lavado con agua tibia, jabón neutro y paño de microfibra.',
          performedAt: '2026-02-10T15:00:00.000Z'
        }
      ],
      notes: 'Deja acabado semibrillo directamente sin lijas intermedias. Limpiar polvo con cinta adhesiva.',
      createdAt: now,
      updatedAt: now
    },
    {
      id: `tool-${userId.slice(-6)}-4`,
      userId,
      name: 'Mr. Hobby Procon Boy WA 0.3mm (Aerógrafo Doble Acción)',
      brand: 'Mr. Hobby',
      category: 'airbrush',
      modelNumber: 'PS-289',
      purchasePrice: 95.00,
      purchaseCurrency: 'USD',
      acquiredAt: '2025-06-14',
      status: 'active',
      condition: 'good',
      wear: {
        enabled: false,
        bladeType: 'Boquilla de 0.3mm con Copa de 10ml y Válvula MAC',
        currentCutsCount: 0,
        maxRecommendedCuts: 0,
        sessionsCount: 45,
        totalBladesConsumed: 0
      },
      maintenanceLog: [
        {
          id: 'maint-4',
          type: 'deep_clean',
          notes: 'Despiece completo y limpieza ultrasónica del canal de pintura.',
          performedAt: '2026-02-20T18:00:00.000Z'
        }
      ],
      notes: 'Aerógrafo insignia para capas base y sombreados finos en 1/144 y 1/100.',
      createdAt: now,
      updatedAt: now
    }
  ];
}

export * from './ui-shell/app-shell';
export * from './ui-shell/views';
export * from './ui-shell/modals';
export * from './ui-shell/legal-pages';
export * from './ui-shell/pwa';
export * from './ui-shell/og-card';
