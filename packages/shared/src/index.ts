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
  source: 'manual' | 'scalemates' | 'scalemates-fallback' | 'user-import';
  createdAt: string;
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
  aiEngine: 'gemini-3.8-flash' | 'expert-local-rules';
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

export * from './ui-shell/app-shell';
export * from './ui-shell/views';
export * from './ui-shell/modals';
export * from './ui-shell/legal-pages';
export * from './ui-shell/pwa';
export * from './ui-shell/og-card';
