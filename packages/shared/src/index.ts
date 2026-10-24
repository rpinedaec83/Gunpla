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

export interface PaginatedResult<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
  totalCount: number;
}
