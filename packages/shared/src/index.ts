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
  isFounder: boolean;
  birthYear?: number;
  isAdult?: boolean;
  ageBracket?: 'under_14' | 'minor_14_17' | 'adult_18_plus';
  createdAt: string;
}

export interface PublicBuilderProfile {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  primaryTenantSlug: string;
  socialLinks: string[];
  isFounder: boolean;
  isAdult?: boolean;
  photoCount: number;
  photos: MediaAsset[];
  createdAt: string;
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
  source: 'manual' | 'scalemates' | 'scalemates-fallback';
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

export interface CreateBuildCommentRequest {
  comment: string;
}

export interface UploadMediaResponse {
  media: MediaAsset;
  thumbUrl: string;
  fullUrl: string;
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

export interface PaginatedResult<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
  totalCount: number;
}

export * from './ui-shell/app-shell';
export * from './ui-shell/legal-pages';
