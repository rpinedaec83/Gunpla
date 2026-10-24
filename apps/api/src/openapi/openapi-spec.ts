export const openApiSpec = {
  openapi: '3.1.0',
  info: {
    title: 'PlamoScale & GunplaJunkies Multi-Tenant API',
    version: '1.0.0',
    description:
      'Single Central API powering plamoscale.com, gunplajunkies.com, and white-label scale modeling portals. Supports Dual Auth (Username/Password + Google OAuth 2.0 / OIDC SSO) and Resend.com multi-domain emails.'
  },
  servers: [
    { url: 'http://localhost:8080', description: 'Local Development' },
    { url: 'https://api.plamoscale.com', description: 'PlamoScale Production' },
    { url: 'https://api.gunplajunkies.com', description: 'GunplaJunkies Production' }
  ],
  paths: {
    '/api/v1/health': {
      get: {
        tags: ['Health'],
        summary: 'System health and seed verification probe',
        responses: { '200': { description: 'Healthy status' } }
      }
    },
    '/api/v1/tenants': {
      get: {
        tags: ['Tenants'],
        summary: 'List registered multi-tenant portals',
        responses: { '200': { description: 'Paginated tenants' } }
      },
      post: {
        tags: ['Tenants'],
        summary: 'Register a new white-label tenant portal',
        responses: { '201': { description: 'Tenant created' } }
      }
    },
    '/api/v1/tenants/current': {
      get: {
        tags: ['Tenants'],
        summary: 'Resolve active tenant from X-Tenant-Slug or Host header',
        responses: {
          '200': { description: 'Resolved tenant configuration' },
          '404': { description: 'Unknown tenant (RFC 7807)' }
        }
      }
    },
    '/api/v1/auth/registrations': {
      post: {
        tags: ['Auth'],
        summary: 'Register builder with Username/Email + Password and send Resend welcome email',
        responses: {
          '201': { description: 'User registered' },
          '409': { description: 'Duplicate username or email (RFC 7807)' }
        }
      }
    },
    '/api/v1/auth/sessions': {
      post: {
        tags: ['Auth'],
        summary: 'Sign in with Username/Email + Password',
        responses: {
          '200': { description: 'Signed in with SSO JWT' },
          '401': { description: 'Invalid credentials (RFC 7807)' }
        }
      }
    },
    '/api/v1/auth/google-sessions': {
      post: {
        tags: ['Auth'],
        summary: 'Sign in or register with Google SSO (OAuth 2.0 / OIDC) with automatic email account linking',
        responses: {
          '200': { description: 'Signed in via Google SSO with SSO JWT' },
          '401': { description: 'Invalid Google ID Token (RFC 7807)' }
        }
      }
    },
    '/api/v1/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current authenticated builder profile',
        responses: {
          '200': { description: 'Authenticated user profile' },
          '401': { description: 'Unauthorized (RFC 7807)' }
        }
      }
    },
    '/api/v1/builders': {
      get: {
        tags: ['Builders'],
        summary: 'List builder profiles and migrated legacy portfolios (aperich, dcampos, cluna, fog1labs1)',
        responses: { '200': { description: 'Paginated builder profiles' } }
      }
    },
    '/api/v1/builders/{username}': {
      get: {
        tags: ['Builders'],
        summary: 'Get builder profile and all build photos by username',
        responses: {
          '200': { description: 'Builder profile and photos' },
          '404': { description: 'Builder not found (RFC 7807)' }
        }
      }
    },
    '/api/v1/notifications/contact-messages': {
      post: {
        tags: ['Notifications'],
        summary: 'Send tenant-branded contact message via Resend.com (@plamoscale.com or @gunplajunkies.com)',
        responses: { '201': { description: 'Email processed via Resend adapter' } }
      }
    },
    '/api/v1/notifications/outbox': {
      get: {
        tags: ['Notifications'],
        summary: 'Inspect dispatched Resend emails (live and sandbox)',
        responses: { '200': { description: 'Email outbox items' } }
      }
    },
    '/api/v1/catalog/kits': {
      get: {
        tags: ['Catalog'],
        summary: 'List and filter scale model kits (scoped by tenant allowedCategories)',
        parameters: [
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'brand', in: 'query', schema: { type: 'string' } },
          { name: 'scale', in: 'query', schema: { type: 'string' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } }
        ],
        responses: { '200': { description: 'List of catalog kits' } }
      },
      post: {
        tags: ['Catalog'],
        summary: 'Create a new kit manually in the master catalog',
        responses: {
          '201': { description: 'Kit created' },
          '200': { description: 'Kit already exists (deduplicated)' },
          '400': { description: 'Invalid kit parameters (RFC 7807)' }
        }
      }
    },
    '/api/v1/catalog/kits/{id}': {
      get: {
        tags: ['Catalog'],
        summary: 'Get kit details by id',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Kit details' },
          '404': { description: 'Kit not found (RFC 7807)' }
        }
      }
    },
    '/api/v1/catalog/kits/import-scalemates': {
      post: {
        tags: ['Catalog'],
        summary: 'Import kit metadata from a Scalemates URL with deduplication and 4s graceful fallback',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['scalematesUrl'],
                properties: {
                  scalematesUrl: { type: 'string', example: 'https://www.scalemates.com/kits/bandai-5061919-rg-1-144-hi-nu-gundam--1359732' },
                  categoryOverride: { type: 'string', enum: ['gunpla-mecha', 'military', 'aviation', 'automotive', 'naval', 'figures', 'scifi', 'diorama'] }
                }
              }
            }
          }
        },
        responses: {
          '201': { description: 'Kit imported successfully' },
          '200': { description: 'Kit already exists (deduplicated)' },
          '400': { description: 'Invalid Scalemates URL or parsing error (RFC 7807)' }
        }
      }
    },
    '/api/v1/catalog/paints': {
      get: {
        tags: ['Catalog'],
        summary: 'List paints and supplies by brand, line, type, finish or search query',
        parameters: [
          { name: 'brand', in: 'query', schema: { type: 'string' } },
          { name: 'line', in: 'query', schema: { type: 'string' } },
          { name: 'type', in: 'query', schema: { type: 'string' } },
          { name: 'finish', in: 'query', schema: { type: 'string' } },
          { name: 'search', in: 'query', schema: { type: 'string' } }
        ],
        responses: { '200': { description: 'List of paints with hex color swatches' } }
      },
      post: {
        tags: ['Catalog'],
        summary: 'Add a new paint reference to the master catalog',
        responses: {
          '201': { description: 'Paint created' },
          '200': { description: 'Paint already exists' },
          '400': { description: 'Incomplete paint data' }
        }
      }
    },
    '/api/v1/catalog/brands': {
      get: {
        tags: ['Catalog'],
        summary: 'List all kit brands with kit counts and categories',
        responses: { '200': { description: 'Brands summary list' } }
      }
    }
  }
};
