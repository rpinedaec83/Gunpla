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
    '/api/v1/catalog/kits/{id}/model-3d': {
      get: {
        tags: ['Catalog'],
        summary: 'Get 3D asset metadata, diorama presets, real and physical scale dimensions for a kit',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: '3D model metadata and scale dimensions' },
          '404': { description: 'Kit not found (RFC 7807)' }
        }
      }
    },
    '/api/v1/catalog/models-3d': {
      get: {
        tags: ['Catalog'],
        summary: 'List available 3D models for diorama studio and inspection scoped to tenant',
        responses: {
          '200': { description: 'List of 3D models and diorama configurations' }
        }
      }
    },
    '/api/v1/catalog/barcode/{barcode}': {
      get: {
        tags: ['Catalog'],
        summary: 'Lookup kit by JAN / EAN / UPC / Code-128 barcode with manufacturer prefix heuristics',
        parameters: [{ name: 'barcode', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Barcode lookup result with match or manufacturer hint' },
          '400': { description: 'Invalid barcode (RFC 7807)' }
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
    '/api/v1/workbench/stash/scan': {
      post: {
        tags: ['Workbench'],
        summary: 'Instant stash registration via scanned barcode (JAN / EAN / UPC / Code-128)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['barcode'],
                properties: {
                  barcode: { type: 'string' },
                  status: { type: 'string', enum: ['unbuilt', 'in_progress', 'built', 'wishlist', 'for_trade'] },
                  notes: { type: 'string' },
                  pricePaid: { type: 'number' },
                  currency: { type: 'string' },
                  kitName: { type: 'string' },
                  brand: { type: 'string' },
                  scale: { type: 'string' },
                  grade: { type: 'string' },
                  category: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          '201': { description: 'Kit registered in catalog (if needed) and added to stash' },
          '400': { description: 'Validation error (RFC 7807)' }
        }
      }
    },
    '/api/v1/workbench/stash/export/insurance-summary': {
      get: {
        tags: ['Workbench'],
        summary: 'Get itemized stash insurance and replacement valuation summary',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'currency', in: 'query', schema: { type: 'string', default: 'USD' } }
        ],
        responses: {
          '200': { description: 'Aggregated insurance valuation metrics and itemized list' },
          '401': { description: 'Unauthorized' }
        }
      }
    },
    '/api/v1/workbench/stash/export/insurance-report': {
      get: {
        tags: ['Workbench'],
        summary: 'Generate printable insurance appraisal sheet (HTML/PDF), JSON summary, or CSV file',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'format', in: 'query', schema: { type: 'string', enum: ['html', 'json', 'csv'], default: 'html' } },
          { name: 'currency', in: 'query', schema: { type: 'string', default: 'USD' } },
          { name: 'policyNumber', in: 'query', schema: { type: 'string' } },
          { name: 'includeUnbuilt', in: 'query', schema: { type: 'boolean', default: true } },
          { name: 'includeBuilt', in: 'query', schema: { type: 'boolean', default: true } },
          { name: 'includeInProgress', in: 'query', schema: { type: 'boolean', default: true } },
          { name: 'includeWishlist', in: 'query', schema: { type: 'boolean', default: false } }
        ],
        responses: {
          '200': { description: 'Generated appraisal report or CSV file' },
          '401': { description: 'Unauthorized' }
        }
      }
    },
    '/api/v1/workbench/import/stash': {
      post: {
        tags: ['Workbench'],
        summary: 'Bulk import model kits to personal stash from CSV/TSV or JSON array with auto-catalog matching',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  csvContent: { type: 'string' },
                  delimiter: { type: 'string' },
                  dryRun: { type: 'boolean' },
                  items: { type: 'array', items: { type: 'object' } }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Dry run import preview results' },
          '201': { description: 'Bulk items imported successfully' },
          '400': { description: 'Validation error' }
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
    '/api/v1/workbench/wishlist-alerts': {
      get: {
        tags: ['Workbench'],
        summary: 'Live matches between user wishlist items and verified Trusted Shops stock',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': { description: 'Wishlist stock alerts list' }
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
    '/api/v1/workbench/paints/{id}/equivalences': {
      get: {
        tags: ['Workbench', 'Paints AI'],
        summary: 'Get AI cross-brand equivalences across 4 chemical families for a rack paint',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'targetMedium', in: 'query', schema: { type: 'string', enum: ['lacquer', 'acrylic', 'polyurethane', 'montana_colors'] } }
        ],
        responses: {
          '200': { description: 'Cross-brand equivalences with rack ownership indicators' },
          '404': { description: 'Paint not found' }
        }
      }
    },
    '/api/v1/workbench/import/paints': {
      post: {
        tags: ['Workbench'],
        summary: 'Bulk import paints to personal paint rack from CSV/TSV or JSON array with auto-catalog matching',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  csvContent: { type: 'string' },
                  delimiter: { type: 'string' },
                  dryRun: { type: 'boolean' },
                  items: { type: 'array', items: { type: 'object' } }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Dry run import preview results' },
          '201': { description: 'Bulk paints imported successfully' },
          '400': { description: 'Validation error' }
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
    '/api/v1/builds/{slugOrId}/whatsapp-inquiry': {
      get: {
        tags: ['Build Logs'],
        summary: 'Generate prefilled WhatsApp deep-link to inquire with modeler about a build',
        parameters: [
          { name: 'slugOrId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'inquiryType', in: 'query', schema: { type: 'string', enum: ['general', 'paint_recipe', 'custom_commission', 'purchase_build'] } },
          { name: 'clientName', in: 'query', schema: { type: 'string' } }
        ],
        responses: {
          '200': { description: 'WhatsApp inquiry deep-link and prefilled message' },
          '404': { description: 'Build project not found' }
        }
      }
    },
    '/api/v1/builds/whatsapp-inquiry': {
      post: {
        tags: ['Build Logs'],
        summary: 'Generate prefilled WhatsApp deep-link from arbitrary gallery or showcase item',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['builderUsername', 'itemTitle'],
                properties: {
                  builderUsername: { type: 'string' },
                  itemTitle: { type: 'string' },
                  inquiryType: { type: 'string', enum: ['general', 'paint_recipe', 'custom_commission', 'purchase_build'] },
                  clientName: { type: 'string' },
                  itemUrl: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'WhatsApp inquiry deep-link and prefilled message' },
          '400': { description: 'Validation error' }
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
    '/api/v1/contests/hall-of-fame': {
      get: {
        tags: ['Community'],
        summary: 'Cross-contest public Hall of Fame winners and awarded badges',
        parameters: [{ name: 'tenantSlug', in: 'query', required: false, schema: { type: 'string' } }],
        responses: { '200': { description: 'Hall of fame winners and badges' } }
      }
    },
    '/api/v1/contests/{id}/podium': {
      get: {
        tags: ['Community'],
        summary: 'Get contest podium ranking and awards (gold, silver, bronze, community choice)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Contest podium result' },
          '404': { description: 'Contest not found' }
        }
      }
    },
    '/api/v1/contests/{slugOrId}': {
      get: {
        tags: ['Community'],
        summary: 'Get contest details and participating build entries',
        parameters: [{ name: 'slugOrId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Contest details' },
          '404': { description: 'Contest not found' }
        }
      }
    },
    '/api/v1/contests/{id}/entries': {
      post: {
        tags: ['Community'],
        summary: 'Submit a personal build project to an active contest',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '201': { description: 'Build submitted to contest' },
          '400': { description: 'Contest not active or invalid build' },
          '403': { description: 'Forbidden (not build owner)' },
          '404': { description: 'Contest or build not found' },
          '409': { description: 'Build already submitted' }
        }
      }
    },
    '/api/v1/contests/{id}/entries/{entryId}/vote': {
      post: {
        tags: ['Community'],
        summary: 'Cast or toggle community vote for a contest entry',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'entryId', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          '200': { description: 'Vote toggled' },
          '401': { description: 'Unauthorized' },
          '404': { description: 'Entry not found' }
        }
      }
    },
    '/api/v1/group-builds': {
      get: {
        tags: ['Community'],
        summary: 'List collaborative group builds scoped by tenant and optional status',
        parameters: [
          { name: 'status', in: 'query', required: false, schema: { type: 'string', enum: ['upcoming', 'active', 'completed'] } },
          { name: 'tenant', in: 'query', required: false, schema: { type: 'string' } }
        ],
        responses: { '200': { description: 'Group builds list' } }
      },
      post: {
        tags: ['Community'],
        summary: 'Create a new collaborative group build project',
        security: [{ BearerAuth: [] }],
        responses: {
          '201': { description: 'Group build created' },
          '400': { description: 'Validation error' },
          '401': { description: 'Unauthorized' }
        }
      }
    },
    '/api/v1/group-builds/{idOrSlug}': {
      get: {
        tags: ['Community'],
        summary: 'Get group build project details and participant build entries',
        parameters: [{ name: 'idOrSlug', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Group build details' },
          '404': { description: 'Group build not found' }
        }
      }
    },
    '/api/v1/group-builds/{idOrSlug}/join': {
      post: {
        tags: ['Community'],
        summary: 'Join an active collaborative group build with an existing build project',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'idOrSlug', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '201': { description: 'Build joined to group build' },
          '400': { description: 'Invalid build or group build completed' },
          '403': { description: 'Forbidden (not build owner)' },
          '404': { description: 'Group build or build not found' },
          '409': { description: 'Build already registered in group build' }
        }
      }
    },
    '/api/v1/group-builds/{idOrSlug}/leave': {
      delete: {
        tags: ['Community'],
        summary: 'Leave a collaborative group build project',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'idOrSlug', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Successfully removed from group build' },
          '401': { description: 'Unauthorized' },
          '404': { description: 'Group build or entry not found' }
        }
      }
    },
    '/api/v1/shops': {
      get: {
        tags: ['Community'],
        summary: 'List trusted hobby shops directory with WhatsApp and product catalog links',
        responses: { '200': { description: 'Shops list' } }
      }
    },
    '/api/v1/shops/{id}/stock': {
      get: {
        tags: ['Community'],
        summary: 'Get stock inventory for a trusted hobby shop',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Shop stock list' },
          '404': { description: 'Shop not found' }
        }
      },
      post: {
        tags: ['Community'],
        summary: 'Add or update kit stock in a trusted shop (alerts modelers with kit in wishlist)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '201': { description: 'Stock item added/updated and alerts emitted' },
          '400': { description: 'Validation error' },
          '404': { description: 'Shop not found' }
        }
      }
    },
    '/api/v1/marketplace/listings': {
      get: {
        tags: ['Marketplace'],
        summary: 'List kits for sale or trade scoped by tenant allowed categories',
        parameters: [
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['active', 'reserved', 'completed', 'cancelled'] } },
          { name: 'type', in: 'query', schema: { type: 'string', enum: ['sale', 'trade', 'both'] } },
          { name: 'search', in: 'query', schema: { type: 'string' } }
        ],
        responses: { '200': { description: 'List of marketplace kit listings' } }
      },
      post: {
        tags: ['Marketplace'],
        summary: 'Post a kit for sale or trade (optionally linking an item from personal Stash)',
        security: [{ BearerAuth: [] }],
        responses: {
          '201': { description: 'Listing created' },
          '400': { description: 'Validation error' },
          '403': { description: 'Forbidden (not stash owner)' },
          '404': { description: 'Kit or stash item not found' }
        }
      }
    },
    '/api/v1/marketplace/listings/{id}': {
      patch: {
        tags: ['Marketplace'],
        summary: 'Update listing status or price',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Listing updated' },
          '403': { description: 'Forbidden' },
          '404': { description: 'Listing not found' }
        }
      },
      delete: {
        tags: ['Marketplace'],
        summary: 'Delete listing',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Listing deleted' },
          '403': { description: 'Forbidden' },
          '404': { description: 'Listing not found' }
        }
      }
    },
    '/api/v1/marketplace/listings/{id}/inquiries': {
      post: {
        tags: ['Marketplace'],
        summary: 'Submit buyer inquiry or counter-offer for a listing via email (Resend)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '201': { description: 'Inquiry sent successfully to seller' },
          '400': { description: 'Validation error' },
          '404': { description: 'Listing not found' }
        }
      }
    },
    '/api/v1/commissions/builders': {
      get: {
        tags: ['Commissions'],
        summary: 'List verified modelers accepting custom painting and building commissions',
        responses: { '200': { description: 'List of commission builders' } }
      }
    },
    '/api/v1/commissions/requests': {
      post: {
        tags: ['Commissions'],
        summary: 'Submit a new commission request to a verified builder',
        responses: {
          '201': { description: 'Commission request created' },
          '400': { description: 'Validation error' },
          '404': { description: 'Builder not found' }
        }
      },
      get: {
        tags: ['Commissions'],
        summary: 'List commission requests with filter by builder or client',
        responses: { '200': { description: 'List of commission requests' } }
      }
    },
    '/api/v1/commissions/requests/{idOrCode}': {
      get: {
        tags: ['Commissions'],
        summary: 'Retrieve a single commission request by ID or code',
        parameters: [{ name: 'idOrCode', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Commission request details' },
          '404': { description: 'Request not found' }
        }
      }
    },
    '/api/v1/commissions/requests/{id}': {
      patch: {
        tags: ['Commissions'],
        summary: 'Update commission status, quote price, estimated days, or response notes',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Commission request updated' },
          '403': { description: 'Forbidden' },
          '404': { description: 'Request not found' }
        }
      }
    },
    '/api/v1/og/builds/{slugOrId}': {
      get: {
        tags: ['Social Sharing & OpenGraph'],
        summary: 'Generate dynamic 1200x630 social preview card PNG/SVG for a build project',
        parameters: [
          { name: 'slugOrId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'format', in: 'query', required: false, schema: { type: 'string', enum: ['png', 'svg'] } }
        ],
        responses: {
          '200': {
            description: '1200x630 Social Card Image',
            content: {
              'image/png': { schema: { type: 'string', format: 'binary' } },
              'image/svg+xml': { schema: { type: 'string' } }
            }
          }
        }
      }
    },
    '/api/v1/og/contests/{id}': {
      get: {
        tags: ['Social Sharing & OpenGraph'],
        summary: 'Generate dynamic 1200x630 social preview card PNG/SVG for contest podium and winner results',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'format', in: 'query', required: false, schema: { type: 'string', enum: ['png', 'svg'] } }
        ],
        responses: {
          '200': {
            description: '1200x630 Social Card Image',
            content: {
              'image/png': { schema: { type: 'string', format: 'binary' } },
              'image/svg+xml': { schema: { type: 'string' } }
            }
          }
        }
      }
    },
    '/api/v1/og/hall-of-fame': {
      get: {
        tags: ['Social Sharing & OpenGraph'],
        summary: 'Generate dynamic 1200x630 social preview card PNG/SVG for public Hall of Fame gallery',
        parameters: [
          { name: 'format', in: 'query', required: false, schema: { type: 'string', enum: ['png', 'svg'] } }
        ],
        responses: {
          '200': {
            description: '1200x630 Social Card Image',
            content: {
              'image/png': { schema: { type: 'string', format: 'binary' } },
              'image/svg+xml': { schema: { type: 'string' } }
            }
          }
        }
      }
    },
    '/api/v1/og/default': {
      get: {
        tags: ['Social Sharing & OpenGraph'],
        summary: 'Generate default dynamic 1200x630 social preview card PNG/SVG for active tenant',
        parameters: [
          { name: 'format', in: 'query', required: false, schema: { type: 'string', enum: ['png', 'svg'] } }
        ],
        responses: {
          '200': {
            description: '1200x630 Social Card Image',
            content: {
              'image/png': { schema: { type: 'string', format: 'binary' } },
              'image/svg+xml': { schema: { type: 'string' } }
            }
          }
        }
      }
    },
    '/api/v1/builds/{id}/steps/reorder': {
      patch: {
        tags: ['Build Logs'],
        summary: 'Reorder steps in a build project',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          '200': { description: 'Steps reordered' }
        }
      }
    },
    '/api/v1/builds/{id}/steps/{stepId}': {
      patch: {
        tags: ['Build Logs'],
        summary: 'Update a build step milestone',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'stepId', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          '200': { description: 'Step updated' }
        }
      },
      delete: {
        tags: ['Build Logs'],
        summary: 'Delete a build step milestone',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'stepId', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          '200': { description: 'Step deleted' }
        }
      }
    },
    '/api/v1/builds/{id}/costs': {
      get: {
        tags: ['Build Logs'],
        summary: 'Get project cost accounting, expenses and commission summary',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'hourlyRate', in: 'query', required: false, schema: { type: 'number' } },
          { name: 'currency', in: 'query', required: false, schema: { type: 'string' } }
        ],
        responses: {
          '200': { description: 'Cost summary retrieved' },
          '404': { description: 'Build not found' }
        }
      },
      post: {
        tags: ['Build Logs'],
        summary: 'Add expense item to build project',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          '201': { description: 'Expense item added' },
          '400': { description: 'Validation error' },
          '403': { description: 'Forbidden' },
          '404': { description: 'Build not found' }
        }
      }
    },
    '/api/v1/builds/{id}/costs/{expenseId}': {
      delete: {
        tags: ['Build Logs'],
        summary: 'Remove expense item from build project',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'expenseId', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          '200': { description: 'Expense removed' },
          '403': { description: 'Forbidden' },
          '404': { description: 'Expense not found' }
        }
      }
    },
    '/api/v1/notifications': {
      get: {
        tags: ['Notifications & Activity Bell'],
        summary: 'Get notifications list and unread count for current user',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'unreadOnly', in: 'query', required: false, schema: { type: 'boolean' } }
        ],
        responses: {
          '200': { description: 'Notification list' }
        }
      }
    },
    '/api/v1/notifications/{id}/read': {
      patch: {
        tags: ['Notifications & Activity Bell'],
        summary: 'Mark a notification as read',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          '200': { description: 'Notification updated' }
        }
      }
    },
    '/api/v1/notifications/mark-all-read': {
      post: {
        tags: ['Notifications & Activity Bell'],
        summary: 'Mark all notifications as read for current user',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': { description: 'All notifications marked as read' }
        }
      }
    },
    '/api/v1/notifications/push-subscribe': {
      post: {
        tags: ['Notifications & Activity Bell'],
        summary: 'Register Web Push subscription',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': { description: 'Subscribed' }
        }
      },
      delete: {
        tags: ['Notifications & Activity Bell'],
        summary: 'Unregister Web Push subscription',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': { description: 'Unsubscribed' }
        }
      }
    },
    '/api/v1/decals/presets': {
      get: {
        tags: ['Decals'],
        summary: 'List curated water-slide decal and masking stencil presets',
        parameters: [
          { name: 'category', in: 'query', required: false, schema: { type: 'string' } },
          { name: 'scale', in: 'query', required: false, schema: { type: 'string' } }
        ],
        responses: {
          '200': { description: 'List of decal presets' }
        }
      }
    },
    '/api/v1/decals/presets/{id}': {
      get: {
        tags: ['Decals'],
        summary: 'Get details for a specific decal sheet preset',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          '200': { description: 'Decal sheet preset retrieved' },
          '404': { description: 'Preset not found' }
        }
      }
    },
    '/api/v1/decals/render-svg': {
      post: {
        tags: ['Decals'],
        summary: 'Generate print-ready vector SVG for a custom decal sheet',
        responses: {
          '200': { description: 'Rendered SVG sheet' },
          '400': { description: 'Validation error' }
        }
      }
    },
    '/api/v1/workbench/ai/inspect-runner': {
      post: {
        tags: ['Workbench AI'],
        summary: 'Inspect model kit runner/sprue photo with Vision AI',
        responses: {
          '200': { description: 'Runner analysis with detected parts and remaining tally' },
          '400': { description: 'Validation error' }
        }
      }
    },
    '/api/v1/workbench/ai/inspect-nub': {
      post: {
        tags: ['Workbench AI'],
        summary: 'Inspect gate cut and nub mark cleanup quality with Vision AI',
        responses: {
          '200': { description: 'Nub quality assessment and corrective sanding recommendations' },
          '400': { description: 'Validation error' }
        }
      }
    }
  }
};
