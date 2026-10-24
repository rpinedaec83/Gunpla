# Stack Pattern 05: Azure Functions + SWA + Key Vault + Static Egress Proxy VM

Status: Draft template
Owner: Architecture
Last Reviewed: 2026-05-01
Reference Implementation: Generic provider-aggregation API with fixed egress IP requirements

## Intent
A lean serverless API pattern for projects that aggregate data from multiple third-party providers and must present a single fixed source IP to at least one partner that whitelists by IP. The pattern keeps Azure Functions on a Consumption plan for cost and elasticity, and adds a single small Linux VM running a forward proxy with a destination filter to provide one stable egress IP without forcing a Premium or VNet-integrated plan migration.

## Core Services
- Azure Static Web Apps for OpenAPI / Swagger UI hosting and edge delivery of static API documentation
- Azure Functions (Python v2 Blueprints, Consumption plan) for the public API
- Azure Key Vault for API consumer credentials (per-user secrets) accessed via Function App managed identity
- Azure Virtual Machine (Debian 12, `Standard_B1ls`) running `tinyproxy` as a destination-filtered HTTPS forward proxy
- Azure Virtual Network, NSG, and Standard Static Public IP scoped to the proxy VM
- Application Insights and Log Analytics for telemetry

## When To Use This Pattern
Use this pattern when all of the following are true:
- The API is a thin aggregator over external providers (no large internal data store needed).
- At least one external provider whitelists callers by source IP and a Consumption plan's rotating outbound IP pool is unacceptable.
- Cost and operational simplicity outweigh the value of full VNet integration or Premium plan features.
- Long-running synchronous work is not required (HTTP under ~230 seconds, function execution under 10 minutes).

## Function Design Rules
Functions must be atomic and follow Single Responsibility Principle.
- One blueprint per concern, one route per blueprint endpoint
- One provider per provider module, with a shared `_common.py` for cross-provider helpers
- Route handlers stay thin: parse request, delegate to provider module, render response
- Provider modules own their HTTP contract with the upstream and raise a typed `ProviderError` on upstream failure
- Auth, config loading, and rendering are separate modules and not duplicated per route

## Reference Layout
```
api/
  function_app.py            # registers blueprints only
  routes/
    provider_a.py            # one blueprint per provider
    provider_b.py
    provider_c.py
    auth_users.py            # API user lifecycle
  cdr/
    handler.py               # request orchestration
    params.py                # query/body parsing, required source arg
    config.py                # ProviderConfig incl. optional egress proxy URL
    auth.py                  # header + Basic fallback, KV-backed
    render.py                # JSON / CSV
    providers/
      __init__.py            # re-exports ProviderError, fetch_*_rows
      _common.py             # shared HTTP, retries, normalization
      provider_a.py
      provider_b.py
      provider_c.py          # opt-in proxies via cfg.provider_c_https_proxy
swa/
  index.html
  openapi.json               # only live routes, kept in sync with code
scripts/
  smoketest-auth.ps1
  provision-egress-proxy.ps1
```

## Reference Flow
1. Client calls a per-provider route on Azure Functions, e.g. `GET /api/cdr/<provider>/<channel>` with `x-api-user` and `x-api-secret` headers.
2. Auth module validates credentials against Key Vault (Function App managed identity), with optional local accounts file fallback for development only.
3. Route blueprint passes `source` explicitly into `handle_request`, which parses options and dispatches to the right provider module.
4. Provider module calls the upstream over HTTPS using `requests`. For partner-whitelisted providers, the provider module reads an optional proxy URL from config and passes it to `requests` as `proxies={"http": ..., "https": ...}`.
5. Outbound traffic for the whitelisted provider exits through the egress proxy VM's Standard Static Public IP. All other providers go directly out the Functions outbound pool.
6. Response is normalized and rendered as JSON or CSV.
7. Telemetry is written to Application Insights.

## Egress Proxy Design
The egress proxy is a single-purpose appliance:
- Debian 12, `Standard_B1ls`, deployed by an idempotent CLI script under `scripts/`
- Cloud-init installs `tinyproxy` listening on TCP 8888
- `FilterDefaultDeny Yes` plus a destination filter restricted to the partner host(s)
- `ConnectPort` lines limited to the upstream's actual ports
- Standard Static Public IP, dedicated to this VM, given to the partner for whitelisting
- NSG inbound:
  - Allow TCP 8888 from each Function App outbound IP in `possibleOutboundIpAddresses`
  - Allow TCP 8888 from service tag `AzureCloud.<region>` to cover same-region intra-Azure source addresses that are not in the published outbound list
  - Deny by default for everything else; SSH closed unless explicitly opened from an operator CIDR
- No public ingress for any port other than 8888

The Function App holds the proxy URL as an app setting (e.g. `PROVIDER_A_HTTPS_PROXY=http://<static-ip>:8888`). Provider modules treat the proxy as opt-in, so providers that do not need it are unaffected.

## Security Baseline
- Managed identity on the Function App for all Key Vault reads
- All API user credentials live in Key Vault, not in code or config
- Header-based auth as primary mechanism with HTTP Basic as fallback
- A protected default user that cannot be deleted via the API to prevent self-lockout
- Egress proxy is single-purpose: destination filter restricts it to the partner host(s) only, NSG restricts source to the Function App pool plus same-region service tag
- No SSH exposed by default on the proxy; operator access is opt-in from a known CIDR
- Partner credentials (e.g. provider API keys, web service passwords) stored as Function App settings, not in code

## Reliability and Operations
- Per-provider error surfaces: provider modules raise `ProviderError` and the handler returns a clean HTTP 502 with the upstream's error message rather than leaking stack traces
- Smoketest script under `scripts/` exercises:
  - Unauthenticated and bad-credential probes (expect 401)
  - Authenticated happy-path probes for each provider/channel route
  - Account-filter behavior including content echo where rows are present
  - Auth user lifecycle (create, list, delete, default-user protection, 404 paths)
  - SWA OpenAPI and index reachability
- Function App stays on Consumption: default 5 minutes per execution, maximum 10 minutes, ~230 second HTTP front-end caveat
- Egress proxy alerts: VM availability, tinyproxy process health, NSG flow logs if compliance requires
- OpenAPI document and Swagger UI are deployed alongside the API and verified live after each release

## Cost Profile
- Functions Consumption: pay-per-execution, ideal for bursty CDR pulls
- Static Web Apps: Free tier is typically sufficient for OpenAPI hosting
- Key Vault: per-operation pricing, low for this access pattern
- Egress proxy VM: `Standard_B1ls` plus Standard Static Public IP, on the order of a few USD per month
- Total fixed monthly cost is dominated by the proxy VM and public IP, not by Functions

## Best Fit
- API aggregators over multiple SMS / messaging / telecom providers
- Any serverless API where exactly one or two upstream providers require IP whitelisting and the rest do not
- Teams that want to stay on Consumption Functions and avoid Premium plan or full VNet integration
- Projects where partner onboarding cost (sending one fixed IP) is more important than high-throughput provider traffic

## Weak Fit
- Workloads where most or all upstreams require IP whitelisting at high throughput; a Premium plan with VNet integration and NAT Gateway is cleaner at scale
- Workloads that need long-running synchronous HTTP calls past ~230 seconds
- Workloads with heavy relational data needs; pair with Stack Pattern 02 or 04 if relational storage is required
- Regulated environments where a single Linux VM is not acceptable as an egress hop

## Adoption Checklist
- Confirm which upstream providers require IP whitelisting and on which hostnames and ports
- Confirm that Consumption plan timeout boundaries are acceptable for all routes
- Provision the proxy VM with an idempotent script, capture the Static Public IP, and request whitelist from the partner in writing
- Set the proxy URL as a Function App setting and wire the relevant provider module(s) to read it from `ProviderConfig`
- Add an NSG service-tag allow rule for `AzureCloud.<region>` in addition to per-IP allows from `possibleOutboundIpAddresses`
- Keep the destination filter on the proxy as tight as the partner's actual hostnames; do not allow general internet egress
- Add the proxy IP to the partner access-request document and keep it under version control

## Known Risks and Mitigations
- Risk: Functions outbound IP list (`possibleOutboundIpAddresses`) does not cover same-region intra-Azure source addresses, leading to NSG drops.
  - Mitigation: pair per-IP allow rules with an `AzureCloud.<region>` service-tag allow rule on TCP 8888.
- Risk: Single proxy VM is a single point of failure for the whitelisted provider.
  - Mitigation: keep the provisioning script idempotent and fast so the VM can be rebuilt quickly; for higher availability, evolve to a paired VM behind a standard load balancer with the same Static Public IP.
- Risk: Partner credentials confused with portal credentials.
  - Mitigation: keep a written bilingual access-request document under `docs/reference/` that explicitly asks for web service `usuario`, `password`, and `Apikey`, and lists the single fixed IP to whitelist.
- Risk: Open proxy abuse.
  - Mitigation: `FilterDefaultDeny Yes` plus explicit destination allow list, NSG restricted to Function App sources and same-region service tag.

## Review History
- 2026-05-01 | Architecture | Documented as a reusable template baseline after validating end-to-end Function App traffic through a static-IP proxy to a partner endpoint in a sample environment. | Approved as draft template
