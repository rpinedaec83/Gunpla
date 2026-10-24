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
    },
    '/api/v1/workbench/summary': {
      get: {
        tags: ['Workbench'],
        summary: 'Get personal stash and paint rack statistics for the authenticated builder',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': { description: 'Workbench summary metrics' },
          '401': { description: 'Unauthorized' }
        }
      }
    },
    '/api/v1/workbench/stash': {
      get: {
        tags: ['Workbench'],
        summary: 'List kits in personal stash with optional status filter',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['unbuilt', 'in_progress', 'built', 'wishlist', 'for_trade'] } }
        ],
        responses: { '200': { description: 'Stash kit items' } }
      },
      post: {
        tags: ['Workbench'],
        summary: 'Add a kit from the master catalog into personal stash',
        security: [{ BearerAuth: [] }],
        responses: {
          '201': { description: 'Kit added to stash' },
          '400': { description: 'Validation error' },
          '404': { description: 'Kit not found in catalog' }
        }
      }
    },
    '/api/v1/workbench/stash/{id}': {
      patch: {
        tags: ['Workbench'],
        summary: 'Update kit status, rating, or notes in personal stash',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Stash item updated' },
          '403': { description: 'Forbidden (not the owner)' },
          '404': { description: 'Item not found' }
        }
      },
      delete: {
        tags: ['Workbench'],
        summary: 'Remove kit from personal stash',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Stash item removed' },
          '403': { description: 'Forbidden' },
          '404': { description: 'Item not found' }
        }
      }
    },
    '/api/v1/workbench/paints': {
      get: {
        tags: ['Workbench'],
        summary: 'List paints in personal paint rack',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['owned', 'low_stock', 'wishlist'] } }
        ],
        responses: { '200': { description: 'Paint rack items' } }
      },
      post: {
        tags: ['Workbench'],
        summary: 'Add a paint from catalog to personal paint rack (or increment quantity)',
        security: [{ BearerAuth: [] }],
        responses: {
          '201': { description: 'Paint added to rack' },
          '200': { description: 'Paint quantity incremented' },
          '404': { description: 'Paint not found in catalog' }
        }
      }
    },
    '/api/v1/workbench/paints/{id}': {
      patch: {
        tags: ['Workbench'],
        summary: 'Update quantity or status in personal paint rack',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Rack item updated' },
          '403': { description: 'Forbidden' },
          '404': { description: 'Item not found' }
        }
      },
      delete: {
        tags: ['Workbench'],
        summary: 'Remove paint from personal paint rack',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Paint removed from rack' },
          '403': { description: 'Forbidden' },
          '404': { description: 'Item not found' }
        }
      }
    },
    '/api/v1/builds': {
      get: {
        tags: ['Build Logs'],
        summary: 'List build projects feed scoped by tenant allowed categories',
        parameters: [
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['planning', 'in_progress', 'completed', 'on_hold', 'abandoned'] } },
          { name: 'username', in: 'query', schema: { type: 'string' } },
          { name: 'search', in: 'query', schema: { type: 'string' } }
        ],
        responses: { '200': { description: 'List of build projects' } }
      },
      post: {
        tags: ['Build Logs'],
        summary: 'Create a new step-by-step build project',
        security: [{ BearerAuth: [] }],
        responses: {
          '201': { description: 'Build project created' },
          '400': { description: 'Validation error' },
          '401': { description: 'Unauthorized' }
        }
      }
    },
    '/api/v1/builds/{slugOrId}': {
      get: {
        tags: ['Build Logs'],
        summary: 'Get build project details including steps and paint recipes',
        parameters: [{ name: 'slugOrId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Build project details' },
          '404': { description: 'Build project not found' }
        }
      }
    },
    '/api/v1/builds/{id}/steps': {
      post: {
        tags: ['Build Logs'],
        summary: 'Add a build step with stage, photos, and paint recipe usages',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '201': { description: 'Build step created' },
          '400': { description: 'Validation error' },
          '403': { description: 'Forbidden (not owner)' },
          '404': { description: 'Build project not found' }
        }
      }
    },
    '/api/v1/builds/{id}/like': {
      post: {
        tags: ['Build Logs'],
        summary: 'Toggle like on a build project',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Like toggled' },
          '401': { description: 'Unauthorized' },
          '404': { description: 'Build project not found' }
        }
      }
    },
    '/api/v1/builds/{id}/comments': {
      post: {
        tags: ['Build Logs'],
        summary: 'Post a comment on a build project',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '201': { description: 'Comment posted' },
          '400': { description: 'Validation error' },
          '401': { description: 'Unauthorized' },
          '404': { description: 'Build project not found' }
        }
      }
    },
    '/api/v1/media/upload': {
      post: {
        tags: ['Media'],
        summary: 'Upload build photo (supports base64, enforces <= 15MB limit)',
        security: [{ BearerAuth: [] }],
        responses: {
          '201': { description: 'Photo uploaded' },
          '400': { description: 'Validation error' },
          '413': { description: 'Payload too large (> 15MB)' }
        }
      }
    },
    '/api/v1/contests': {
      get: {
        tags: ['Community'],
        summary: 'List active and upcoming group builds and contests scoped by tenant',
        responses: { '200': { description: 'Contests list' } }
      }
    },
    '/api/v1/shops': {
      get: {
        tags: ['Community'],
        summary: 'List trusted hobby shops directory with WhatsApp and product catalog links',
        responses: { '200': { description: 'Shops list' } }
      }
    }
  }
};
