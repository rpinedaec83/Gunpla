import { Router, Request, Response } from 'express';
import { EmailOutboxItem, Tenant } from '@gunpla/shared';
import { getDb, saveDb } from '../../core/db';
import { sendProblem } from '../../core/problem-details';

export interface SendTenantEmailInput {
  tenant: Tenant;
  to: string[];
  subject: string;
  html: string;
  replyTo?: string;
}

/**
 * Sends transactional or contact emails via Resend.com API (https://api.resend.com/emails)
 * using the active tenant's verified domain (e.g. PlamoScale <noreply@plamoscale.com>
 * or GunplaJunkies <noreply@gunplajunkies.com>).
 * Falls back to auditable sandbox outbox when RESEND_API_KEY is not set in local/CI.
 */
export async function sendTenantEmailViaResend(
  input: SendTenantEmailInput
): Promise<EmailOutboxItem> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const db = getDb();
  const now = new Date().toISOString();
  const id = `email-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  if (apiKey && !apiKey.startsWith('TBD')) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: input.tenant.emailFrom,
          to: input.to,
          reply_to: input.replyTo || input.tenant.contactEmail,
          subject: input.subject,
          html: input.html
        })
      });

      if (response.ok) {
        const data = (await response.json()) as { id?: string };
        const record: EmailOutboxItem = {
          id,
          tenantSlug: input.tenant.slug,
          from: input.tenant.emailFrom,
          to: input.to,
          replyTo: input.replyTo,
          subject: input.subject,
          html: input.html,
          provider: 'resend-live',
          resendMessageId: data.id,
          status: 'sent',
          createdAt: now
        };
        db.emailOutbox.unshift(record);
        saveDb(db);
        return record;
      }
    } catch {
      // Fall through to sandbox record if network fails in offline mode
    }
  }

  const sandboxRecord: EmailOutboxItem = {
    id,
    tenantSlug: input.tenant.slug,
    from: input.tenant.emailFrom,
    to: input.to,
    replyTo: input.replyTo,
    subject: input.subject,
    html: input.html,
    provider: 'resend-sandbox',
    resendMessageId: `re_sandbox_${id}`,
    status: 'queued-sandbox',
    createdAt: now
  };

  db.emailOutbox.unshift(sandboxRecord);
  saveDb(db);
  return sandboxRecord;
}

export const notificationsRouter = Router();

async function handleContactSubmission(req: Request, res: Response): Promise<void> {
  const tenant = req.tenant!;
  const { name, email, phone, message } = req.body || {};

  if (!email || !message) {
    sendProblem(
      req,
      res,
      400,
      'Validation Error',
      'Fields email and message are required.',
      'validation-error',
      [
        { name: 'email', reason: 'Valid email is required' },
        { name: 'message', reason: 'Message body is required' }
      ]
    );
    return;
  }

  const record = await sendTenantEmailViaResend({
    tenant,
    to: [tenant.contactEmail, String(email)],
    replyTo: String(email),
    subject: `[${tenant.name}] Nuevo mensaje de contacto de ${name || email}`,
    html: `<p><strong>Portal:</strong> ${tenant.name} (${tenant.domain})</p>
<p><strong>De:</strong> ${name || 'Modelista'} (${email})</p>
<p><strong>Telefono:</strong> ${phone || 'No especificado'}</p>
<p><strong>Mensaje:</strong></p>
<blockquote>${String(message)}</blockquote>`
  });

  res.status(201).json({
    message: 'Contact email processed via Resend adapter.',
    emailRecord: record
  });
}

notificationsRouter.post('/contact-messages', handleContactSubmission);
notificationsRouter.post('/contact', handleContactSubmission);

notificationsRouter.get('/outbox', (req: Request, res: Response) => {
  const db = getDb();
  const tenantSlug = req.query.tenantSlug
    ? String(req.query.tenantSlug)
    : undefined;
  const items = tenantSlug
    ? db.emailOutbox.filter((e) => e.tenantSlug === tenantSlug)
    : db.emailOutbox;

  res.status(200).json({
    items: items.slice(0, 50),
    nextCursor: null,
    hasMore: false,
    totalCount: items.length
  });
});
