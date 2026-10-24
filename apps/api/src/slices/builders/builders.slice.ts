import { Router, Request, Response } from 'express';
import { PaginatedResult, PublicBuilderProfile } from '@gunpla/shared';
import { getDb } from '../../core/db';
import { sendProblem } from '../../core/problem-details';

export const buildersRouter = Router();

buildersRouter.get('/', (req: Request, res: Response) => {
  const db = getDb();
  const tenant = req.tenant!;
  const foundersOnly = req.query.foundersOnly === 'true';

  const filteredUsers = db.users.filter((u) =>
    foundersOnly ? u.isFounder : true
  );

  const items: PublicBuilderProfile[] = filteredUsers.map((user) => {
    const photos = db.mediaAssets.filter(
      (m) =>
        m.builderUsername === user.username &&
        tenant.allowedCategories.includes(m.category)
    );
    return {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      primaryTenantSlug: user.primaryTenantSlug,
      socialLinks: user.socialLinks,
      specialties: user.specialties || [],
      whatsapp: user.whatsapp,
      isFounder: user.isFounder,
      photoCount: photos.length,
      photos,
      createdAt: user.createdAt
    };
  });

  const result: PaginatedResult<PublicBuilderProfile> = {
    items,
    nextCursor: null,
    hasMore: false,
    totalCount: items.length
  };

  res.status(200).json(result);
});

buildersRouter.get('/:username', (req: Request, res: Response) => {
  const db = getDb();
  const tenant = req.tenant!;
  const username = String(req.params.username).replace(/^@/, '').toLowerCase();

  const user = db.users.find((u) => u.username.toLowerCase() === username);
  if (!user) {
    sendProblem(
      req,
      res,
      404,
      'Builder Not Found',
      `No builder profile matches username '${username}'.`,
      'builder-not-found'
    );
    return;
  }

  const photos = db.mediaAssets.filter(
    (m) =>
      m.builderUsername === user.username &&
      tenant.allowedCategories.includes(m.category)
  );

  const profile: PublicBuilderProfile = {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    primaryTenantSlug: user.primaryTenantSlug,
    socialLinks: user.socialLinks,
    specialties: user.specialties || [],
    whatsapp: user.whatsapp,
    isFounder: user.isFounder,
    photoCount: photos.length,
    photos,
    createdAt: user.createdAt
  };

  res.status(200).json(profile);
});
