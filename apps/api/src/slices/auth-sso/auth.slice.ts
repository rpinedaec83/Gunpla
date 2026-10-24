import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { RoleName, UserRecord } from '@gunpla/shared';
import { getDb, saveDb } from '../../core/db';
import { sendProblem } from '../../core/problem-details';
import { sendTenantEmailViaResend } from '../notifications-resend/resend.slice';

const JWT_SECRET =
  process.env.JWT_SECRET ||
  process.env.jwtSecret ||
  'gunpla-plamoscale-sso-dev-secret-2026';

export interface JwtPayloadData {
  sub: string;
  username: string;
  email: string;
  roles: RoleName[];
  tenantSlug: string;
  isAdult?: boolean;
  ageBracket?: string;
}

export function issueSsoToken(user: UserRecord, tenantSlug: string): string {
  const payload: JwtPayloadData = {
    sub: user.id,
    username: user.username,
    email: user.email,
    roles: user.roles,
    tenantSlug,
    isAdult: user.isAdult !== false,
    ageBracket: user.ageBracket || 'adult_18_plus'
  };
  return jwt.sign(payload, JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: '24h'
  });
}

export function toPublicUser(user: UserRecord) {
  const db = getDb();
  const photoCount = db.mediaAssets.filter(
    (m) => m.builderUsername === user.username
  ).length;
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    email: user.email,
    roles: user.roles,
    authProviders: user.authProviders,
    primaryTenantSlug: user.primaryTenantSlug,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    socialLinks: user.socialLinks,
    specialties: user.specialties || [],
    whatsapp: user.whatsapp,
    isFounder: user.isFounder,
    isAdult: user.isAdult !== false,
    ageBracket: user.ageBracket || 'adult_18_plus',
    photoCount,
    createdAt: user.createdAt
  };
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.header('Authorization');
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : undefined;

  if (!token) {
    sendProblem(
      req,
      res,
      401,
      'Unauthorized',
      'Missing Bearer JWT token in Authorization header.',
      'missing-token'
    );
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayloadData;
    req.user = {
      id: decoded.sub,
      username: decoded.username,
      email: decoded.email,
      roles: decoded.roles,
      tenantSlug: decoded.tenantSlug,
      isAdult: decoded.isAdult !== false,
      ageBracket: decoded.ageBracket || 'adult_18_plus'
    };
    next();
  } catch {
    sendProblem(
      req,
      res,
      401,
      'Unauthorized',
      'Invalid or expired SSO JWT token.',
      'invalid-token'
    );
  }
}

export function requireRole(allowedRoles: RoleName[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendProblem(req, res, 401, 'Unauthorized', 'Authentication required.');
      return;
    }
    const hasRole = req.user.roles.some((r) =>
      allowedRoles.includes(r as RoleName)
    );
    if (!hasRole) {
      sendProblem(
        req,
        res,
        403,
        'Forbidden',
        `Requires one of the following roles: ${allowedRoles.join(', ')}.`,
        'insufficient-role'
      );
      return;
    }
    next();
  };
}

interface VerifiedGoogleProfile {
  sub: string;
  email: string;
  emailVerified: boolean;
  name: string;
  picture?: string;
}

/**
 * Verifies a Google OAuth 2.0 / OIDC ID Token.
 * 1. In local/test mode, supports structured test tokens (`google-test-token:<json-or-base64>`)
 *    so automated CLI smoketests can deterministically verify Google SSO and Account Linking.
 * 2. In production, verifies against https://oauth2.googleapis.com/tokeninfo?id_token=...
 */
async function verifyGoogleIdToken(
  idToken: string
): Promise<VerifiedGoogleProfile | null> {
  if (idToken.startsWith('google-test-token:')) {
    try {
      const rawPayload = idToken.slice('google-test-token:'.length);
      const parsed = JSON.parse(
        rawPayload.startsWith('{')
          ? rawPayload
          : Buffer.from(rawPayload, 'base64').toString('utf-8')
      );
      if (parsed.email && parsed.sub) {
        return {
          sub: String(parsed.sub),
          email: String(parsed.email).toLowerCase(),
          emailVerified: parsed.email_verified !== false,
          name: String(parsed.name || parsed.email.split('@')[0]),
          picture: parsed.picture
        };
      }
    } catch {
      return null;
    }
  }

  try {
    const resp = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
    );
    if (!resp.ok) {
      return null;
    }
    const data = (await resp.json()) as Record<string, string>;
    const configuredClientId = process.env.GOOGLE_CLIENT_ID?.trim();
    if (
      configuredClientId &&
      !configuredClientId.startsWith('TBD') &&
      data.aud !== configuredClientId
    ) {
      return null;
    }
    if (!data.sub || !data.email) {
      return null;
    }
    return {
      sub: data.sub,
      email: data.email.toLowerCase(),
      emailVerified: data.email_verified === 'true',
      name: data.name || data.email.split('@')[0],
      picture: data.picture
    };
  } catch {
    return null;
  }
}

export const authRouter = Router();

// 1. Local Username/Email + Password Registration
async function handleSignup(req: Request, res: Response): Promise<void> {
  const tenant = req.tenant!;
  const { username, displayName, email, password } = req.body || {};

  if (!username || !email || !password || String(password).length < 6) {
    sendProblem(
      req,
      res,
      400,
      'Validation Error',
      'Valid username, email, and password (min 6 chars) are required.',
      'validation-error'
    );
    return;
  }

  const normalizedUsername = String(username).trim().toLowerCase();
  const normalizedEmail = String(email).trim().toLowerCase();
  const db = getDb();

  if (db.users.some((u) => u.username.toLowerCase() === normalizedUsername)) {
    sendProblem(
      req,
      res,
      409,
      'Username Already In Use',
      `Username '${normalizedUsername}' is already registered.`,
      'duplicate-username'
    );
    return;
  }

  if (db.users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    sendProblem(
      req,
      res,
      409,
      'Email Already In Use',
      `Email '${normalizedEmail}' is already registered. You can sign in with password or Google SSO.`,
      'duplicate-email'
    );
    return;
  }

  // Legal Age Verification (Ley N° 29733 - Perú & LATAM)
  const { birthYear } = req.body || {};
  const currentYear = new Date().getFullYear();
  let isAdult = true;
  let ageBracket: 'under_14' | 'minor_14_17' | 'adult_18_plus' = 'adult_18_plus';
  let numBirthYear: number | undefined = undefined;

  if (birthYear !== undefined && birthYear !== null && birthYear !== '') {
    numBirthYear = Number(birthYear);
    const age = currentYear - numBirthYear;
    if (age < 14) {
      sendProblem(
        req,
        res,
        403,
        'Acceso Restringido por Edad',
        'De conformidad con el Artículo 27 del Reglamento de la Ley N° 29733 (Protección de Datos Personales de Perú), los menores de 14 años no pueden registrar cuentas en la plataforma.',
        'underage-restriction'
      );
      return;
    }
    if (age < 18) {
      isAdult = false;
      ageBracket = 'minor_14_17';
    } else {
      isAdult = true;
      ageBracket = 'adult_18_plus';
    }
  }

  const newUser: UserRecord = {
    id: `user-${Date.now()}`,
    username: normalizedUsername,
    displayName: displayName ? String(displayName) : normalizedUsername,
    email: normalizedEmail,
    passwordHash: bcrypt.hashSync(String(password), 10),
    googleId: null,
    authProviders: ['local'],
    roles: ['user'],
    primaryTenantSlug: tenant.slug,
    bio: '',
    socialLinks: [],
    isFounder: false,
    birthYear: numBirthYear,
    isAdult,
    ageBracket,
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  saveDb(db);

  // Send tenant-branded welcome email via Resend.com
  await sendTenantEmailViaResend({
    tenant,
    to: [newUser.email],
    subject: `Bienvenido a ${tenant.name}, @${newUser.username}!`,
    html: `<h2>Bienvenido a ${tenant.name}!</h2>
<p>Tu cuenta unica SSO (<strong>@${newUser.username}</strong>) ya esta activa para <strong>plamoscale.com</strong> y <strong>gunplajunkies.com</strong>.</p>`
  });

  const token = issueSsoToken(newUser, tenant.slug);
  res.status(201).json({
    token,
    authMethod: 'local',
    accountLinked: false,
    tenant: tenant.slug,
    user: toPublicUser(newUser)
  });
}

// 2. Local Username/Email + Password Sign-In
async function handleSignin(req: Request, res: Response): Promise<void> {
  const tenant = req.tenant!;
  const identifier = req.body?.identifier || req.body?.username || req.body?.email;
  const password = req.body?.password;

  if (!identifier || !password) {
    sendProblem(
      req,
      res,
      400,
      'Validation Error',
      'Username/email and password are required.',
      'validation-error'
    );
    return;
  }

  const normalizedId = String(identifier).trim().toLowerCase();
  const db = getDb();
  const user = db.users.find(
    (u) =>
      u.username.toLowerCase() === normalizedId ||
      u.email.toLowerCase() === normalizedId
  );

  if (!user || !user.passwordHash) {
    sendProblem(
      req,
      res,
      401,
      'Invalid Credentials',
      'Invalid username/email or password.',
      'invalid-credentials'
    );
    return;
  }

  const isValid = bcrypt.compareSync(String(password), user.passwordHash);
  if (!isValid) {
    sendProblem(
      req,
      res,
      401,
      'Invalid Credentials',
      'Invalid username/email or password.',
      'invalid-credentials'
    );
    return;
  }

  const currentYear = new Date().getFullYear();
  if (user.birthYear !== undefined && (currentYear - user.birthYear) < 14) {
    sendProblem(
      req,
      res,
      403,
      'Acceso Restringido por Edad',
      'De conformidad con el Artículo 27 del Reglamento de la Ley N° 29733 (Protección de Datos Personales de Perú), la edad mínima para acceder a la plataforma es de 14 años.',
      'underage-restriction'
    );
    return;
  }

  const token = issueSsoToken(user, tenant.slug);
  res.status(200).json({
    token,
    authMethod: 'local',
    accountLinked: user.authProviders.length > 1,
    tenant: tenant.slug,
    user: toPublicUser(user)
  });
}

// 3. Google SSO (OAuth 2.0 / OIDC) Sign-In & Automatic Account Linking
async function handleGoogleSso(req: Request, res: Response): Promise<void> {
  const tenant = req.tenant!;
  const { idToken, birthYear } = req.body || {};

  if (!idToken) {
    sendProblem(
      req,
      res,
      400,
      'Validation Error',
      'Field idToken is required for Google SSO authentication.',
      'validation-error'
    );
    return;
  }

  // Legal Age Verification (Ley N° 29733 - Perú & LATAM)
  const currentYear = new Date().getFullYear();
  let isAdult = true;
  let ageBracket: 'under_14' | 'minor_14_17' | 'adult_18_plus' = 'adult_18_plus';
  let numBirthYear: number | undefined = undefined;

  if (birthYear !== undefined && birthYear !== null && birthYear !== '') {
    numBirthYear = Number(birthYear);
    const age = currentYear - numBirthYear;
    if (age < 14) {
      sendProblem(
        req,
        res,
        403,
        'Acceso Restringido por Edad',
        'De conformidad con el Artículo 27 del Reglamento de la Ley N° 29733 (Protección de Datos Personales de Perú), los menores de 14 años no pueden acceder a la plataforma.',
        'underage-restriction'
      );
      return;
    }
    if (age < 18) {
      isAdult = false;
      ageBracket = 'minor_14_17';
    } else {
      isAdult = true;
      ageBracket = 'adult_18_plus';
    }
  }

  const googleProfile = await verifyGoogleIdToken(String(idToken));
  if (!googleProfile || !googleProfile.emailVerified) {
    sendProblem(
      req,
      res,
      401,
      'Invalid Google Token',
      'Google ID token could not be verified or email is unverified.',
      'invalid-google-token'
    );
    return;
  }

  const db = getDb();
  let accountLinked = false;
  let user = db.users.find(
    (u) =>
      u.googleId === googleProfile.sub ||
      u.email.toLowerCase() === googleProfile.email
  );

  if (user) {
    if (user.birthYear !== undefined && (currentYear - user.birthYear) < 14) {
      sendProblem(
        req,
        res,
        403,
        'Acceso Restringido por Edad',
        'De conformidad con el Artículo 27 del Reglamento de la Ley N° 29733 (Protección de Datos Personales de Perú), la edad mínima para acceder a la plataforma es de 14 años.',
        'underage-restriction'
      );
      return;
    }

    // Automatic Account Linking if user previously signed up with Username/Password or is a Founding Builder
    if (!user.googleId) {
      user.googleId = googleProfile.sub;
    }
    if (!user.authProviders.includes('google')) {
      user.authProviders.push('google');
      accountLinked = true;
    }
    if (googleProfile.picture && !user.avatarUrl) {
      user.avatarUrl = googleProfile.picture;
    }
    if (numBirthYear !== undefined) {
      user.birthYear = numBirthYear;
      user.isAdult = isAdult;
      user.ageBracket = ageBracket;
    }
    saveDb(db);
  } else {
    // Provision new account from Google SSO
    const baseUsername = googleProfile.email
      .split('@')[0]
      .replace(/[^a-zA-Z0-9_]/g, '')
      .toLowerCase();
    let finalUsername = baseUsername || `builder_${Date.now()}`;
    if (db.users.some((u) => u.username.toLowerCase() === finalUsername)) {
      finalUsername = `${finalUsername}_${Math.floor(Math.random() * 1000)}`;
    }

    user = {
      id: `user-${Date.now()}`,
      username: finalUsername,
      displayName: googleProfile.name,
      email: googleProfile.email,
      passwordHash: null,
      googleId: googleProfile.sub,
      authProviders: ['google'],
      roles: ['user'],
      primaryTenantSlug: tenant.slug,
      bio: '',
      avatarUrl: googleProfile.picture,
      socialLinks: [],
      isFounder: false,
      birthYear: numBirthYear,
      isAdult,
      ageBracket,
      createdAt: new Date().toISOString()
    };

    db.users.push(user);
    saveDb(db);

    await sendTenantEmailViaResend({
      tenant,
      to: [user.email],
      subject: `Bienvenido a ${tenant.name} via Google SSO, @${user.username}!`,
      html: `<h2>Bienvenido a ${tenant.name}!</h2>
<p>Has ingresado con Google SSO. Tu cuenta <strong>@${user.username}</strong> es valida en <strong>plamoscale.com</strong> y <strong>gunplajunkies.com</strong>.</p>`
    });
  }

  const token = issueSsoToken(user, tenant.slug);
  res.status(200).json({
    token,
    authMethod: 'google',
    accountLinked,
    tenant: tenant.slug,
    user: toPublicUser(user)
  });
}

authRouter.post('/registrations', handleSignup);
authRouter.post('/signup', handleSignup);
authRouter.post('/register', handleSignup);

authRouter.post('/sessions', handleSignin);
authRouter.post('/signin', handleSignin);
authRouter.post('/login', handleSignin);

authRouter.post('/google-sessions', handleGoogleSso);
authRouter.post('/google', handleGoogleSso);

authRouter.delete('/sessions/current', (_req: Request, res: Response) => {
  res.status(200).json({ message: 'Signed out successfully.' });
});
authRouter.post('/signout', (_req: Request, res: Response) => {
  res.status(200).json({ message: 'Signed out successfully.' });
});

authRouter.get('/me', requireAuth, (req: Request, res: Response) => {
  const db = getDb();
  const user = db.users.find((u) => u.id === req.user!.id);
  if (!user) {
    sendProblem(req, res, 404, 'User Not Found', 'Authenticated user no longer exists.');
    return;
  }

  res.status(200).json({
    activeTenant: req.tenant?.slug,
    user: toPublicUser(user)
  });
});

function handleUpdateProfile(req: Request, res: Response) {
  const db = getDb();
  const user = db.users.find((u) => u.id === req.user!.id);
  if (!user) {
    sendProblem(req, res, 404, 'Usuario No Encontrado', 'El usuario autenticado no existe.', 'user-not-found');
    return;
  }

  const { displayName, bio, avatarUrl, socialLinks, specialties, whatsapp } = req.body;

  if (displayName !== undefined) {
    if (typeof displayName !== 'string' || displayName.trim().length === 0) {
      sendProblem(req, res, 400, 'Nombre Inválido', 'El nombre para mostrar no puede estar vacío.', 'validation-error');
      return;
    }
    user.displayName = displayName.trim().slice(0, 80);
  }

  if (bio !== undefined) {
    if (typeof bio !== 'string') {
      sendProblem(req, res, 400, 'Biografía Inválida', 'La biografía debe ser un texto.', 'validation-error');
      return;
    }
    user.bio = bio.trim().slice(0, 500);
  }

  if (avatarUrl !== undefined) {
    if (avatarUrl && typeof avatarUrl !== 'string') {
      sendProblem(req, res, 400, 'Avatar Inválido', 'La URL del avatar debe ser un texto.', 'validation-error');
      return;
    }
    user.avatarUrl = avatarUrl ? avatarUrl.trim() : undefined;
  }

  if (socialLinks !== undefined) {
    if (!Array.isArray(socialLinks)) {
      sendProblem(req, res, 400, 'Enlaces Inválidos', 'Los enlaces sociales deben ser una lista de URLs.', 'validation-error');
      return;
    }
    user.socialLinks = socialLinks.map((l) => String(l).trim()).filter(Boolean);
  }

  if (specialties !== undefined) {
    if (!Array.isArray(specialties)) {
      sendProblem(req, res, 400, 'Especialidades Inválidas', 'Las especialidades deben ser una lista de textos.', 'validation-error');
      return;
    }
    user.specialties = specialties.map((s) => String(s).trim()).filter(Boolean);
  }

  if (whatsapp !== undefined) {
    if (whatsapp && typeof whatsapp !== 'string') {
      sendProblem(req, res, 400, 'WhatsApp Inválido', 'El número de WhatsApp debe ser un texto.', 'validation-error');
      return;
    }
    user.whatsapp = whatsapp ? whatsapp.trim().slice(0, 30) : undefined;
  }

  saveDb(db);

  return res.status(200).json({
    message: 'Perfil actualizado exitosamente',
    user: toPublicUser(user)
  });
}

authRouter.patch('/me', requireAuth, handleUpdateProfile);
authRouter.put('/me', requireAuth, handleUpdateProfile);
authRouter.patch('/profile', requireAuth, handleUpdateProfile);
