# PS -- Project Stages

This file defines the optional four-stage release model and required document gates for atlas_ai. PS stands for Project Stages and covers the EVT/DVT/PVT/GA lifecycle. It applies when a project follows a structured release process with formal gates, signers, and governance reviews.

Not all projects need this. POC work, internal tools, and exploratory development can follow the core process in `ATLAS.md` without these stages. Adopt this file when the project has real release gates, compliance requirements, or multi-stakeholder sign-off.

---

## Product Release Stages

This workflow uses a four-stage model.

### EVT -- Engineering Validation Test

Purpose: prove the concept works and establish a usable foundation.

Gate to enter EVT:
- MRD approved
- PRD approved
- Signers identified, typically Executive Sponsor, Product Owner, and Business or Commercial Owner

What happens in EVT:
- Core features are built and tested
- The active dev cycle runs
- ESD is drafted based on real implementation decisions

Exit criteria:
- Core workflow works end to end in a non-production environment
- ESD captures the architecture as built

### DVT -- Design Validation Test

Purpose: validate the design with real users and close operational or governance gaps.

Gate to enter DVT:
- EVT exit criteria met
- ESD complete and reviewed
- Governance review run if the project uses one
- Required signers identified, typically EVT signers plus IT or Platform Owner and Security or Compliance

Additional DVT gate controls when CGR is used:
- CGR score target met for DVT.
- No unresolved mandatory field in Rules 2, 6, 7, 8, 9, 10, 11, 12.
- No unresolved cross-document consistency gap that blocks pilot validation.

What happens in DVT:
- Pilot with defined acceptance criteria
- Security review
- Governance gaps closed or approved as exceptions
- Performance and capacity assumptions validated

Exit criteria:
- Pilot passes
- Security review complete
- Remaining governance gaps are resolved or explicitly approved

### PVT -- Production Validation Test

Purpose: confirm operational readiness before go-live.

Gate to enter PVT:
- DVT exit criteria met
- Governance review rerun if the project uses one
- Go-live signers identified

Additional PVT gate controls when CGR is used:
- CGR score target met for PVT.
- No unresolved mandatory field in any Critical or High rule.
- Exceptions include owner, approval, expiry, and revalidation date.

What happens in PVT:
- Operational handoff to support or operations
- Rollback plan tested
- Support and escalation paths confirmed
- Post-launch review scheduled

Exit criteria:
- Operational handoff accepted
- Rollback plan documented and tested
- Go-live approved by all required signers

### GA -- General Availability

Purpose: production release and steady-state support.

Gate to enter GA:
- PVT exit criteria met
- Go-live approved
- Post-launch review plan in place

What happens at GA:
- Product deployed to production
- Monitoring and alerting active
- Support playbook active
- Post-launch review executed

### Ownership Model

Ownership grows with the project stage.

| Stage | Required Owners |
|---|---|
| Pre-EVT | Product Owner |
| EVT | Product Owner, Business or Commercial Owner |
| DVT | Add IT or Platform Owner, Security or Compliance |
| PVT | All required go-live signers |
| GA | Add operations or support ownership where applicable |

### Gate Approvals

| Gate | Typical Signers |
|---|---|
| EVT start | Executive Sponsor, Product Owner, Business or Commercial Owner |
| DVT gate | EVT signers plus IT or Platform Owner and Security or Compliance |
| PVT gate | All required delivery and control functions |
| GA release | All required go-live signers |

### Stage Summary

| Stage | Gate Docs | Signers | Key Activities | Exit To |
|---|---|---|---|---|
| EVT | MRD, PRD | Exec, Product, Business | Build, test, draft ESD | DVT |
| DVT | ESD, optional CGR | Add IT, Security | Pilot, security review, governance closure | PVT |
| PVT | Optional CGR rerun, go-live checklist | All required functions | Ops handoff, rollback test, go-live prep | GA |
| GA | Go-live approval | All required functions | Production release and support | Ongoing ops |

---

## Required Documents

| Doc | When Required | Purpose |
|---|---|---|
| MRD | Before EVT | Market or business problem, users, justification |
| PRD | Before EVT | Product scope, use cases, acceptance criteria |
| ESD | During EVT, complete before DVT | Architecture, deployment, operations, governance |
| CGR | Before DVT and before PVT, if used | Governance gap analysis |

### Document Rules

- MRD before PRD.
- PRD before EVT.
- ESD drafted during EVT.
- ESD complete before DVT.
- If CGR is used, MRD, PRD, and ESD must pass completeness checks for mandatory fields before stage advancement.
- If CGR is used, cross-document consistency must be reviewed before DVT and PVT recommendations.
- If the project uses governance review, run it before DVT and again before PVT.
- Default naming convention: `MRD_<PROJECT>_v<X>.md`, `PRD_<PROJECT>_v<X>.md`, `ESD_<PROJECT>_v<X>.md`.
- `*_TEMPLATE.md` files are bootstrap-only helpers, not live project artifacts.
- On the first CGR run, remove `MRD_TEMPLATE.md` and `PRD_TEMPLATE.md` from `docs/cgr/` if they are still present.
- Once a live MRD, PRD, or ESD artifact exists, remove the matching `*_TEMPLATE.md` file from `docs/cgr/`.
