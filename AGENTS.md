# LapBot — Implementation & Maintenance Guidelines

## Workspace Layout & Authority

- Monorepo root is this directory (`LapBot_Project/`), containing `apps/api`, `apps/web`, `packages/contracts`, `data/`, `docs/`, `e2e/` and `scripts/`.
- Read `README.md`, `docs/README.md`, and `docs/specs/08_DAC_TA_MVP_CHO_AI_CODE.md` for core transactional invariants, SSE gating and LLM tool boundaries, alongside migrations `001`–`007` in `apps/api/migrations/` for the expanded Member Auth and 7-module Admin Suite schema.
- Visual tokens and Neo-Retro Warm OS conventions are defined in `docs/design/02A_DESIGN_SYSTEM_RETRO_CLAUDE.md` (cream canvas, crisp ink borders, hard offset shadows, terracotta/amber accents, custom SVG icons only — no emojis in UI components).
- `docs/archive/` holds legacy pre-MVP drafts (`00`–`07`) for historical context only.

## Core Architectural Rules

1. **Single-Origin Fullstack**: Fastify 5 (`apps/api`) serves `/api/v1/*` and static SPA assets (`apps/web/dist`) in production. Share all DTO types, constants and JSON Schemas through `@lapbot/contracts`.
2. **Inventory & COD Safety**:
   - `POST /api/v1/orders/preview` issues a 15-minute price quote without reserving inventory; each session holds at most one `PENDING_CONFIRMATION` order.
   - `POST /api/v1/orders/:id/confirm` locks rows strictly in order (`chat_sessions → orders → laptops FOR SHARE → laptop_variants FOR UPDATE`), verifies price/visibility/expiry and deducts stock atomically.
   - Permitted cancellations restore stock at most once inside the same transaction.
3. **LLM Guardrails & HITL Handoff**:
   - LLM tools are strictly read/UI-only (`search_laptop_catalog`, `get_laptop_detail`, `get_laptop_variants_and_stock`, `show_checkout_form`, `escalate_to_human_agent`). Never expose PII or order-mutation tools to the model.
   - Keep `AI_ENABLED=false` fully functional for catalog browsing and direct COD checkout.
   - Gate streaming turns in memory (`control-gate.ts`) by `turn_id`, `control_version` and deadline; abort immediately upon customer handoff request or admin claim.
4. **Security & Code Hygiene**:
   - Enforce strict Origin (`PUBLIC_ORIGIN`), `application/json` content-type on mutations, and `additionalProperties: false` on request schemas.
   - Never hardcode API keys, credentials or temporary tunnel URLs in `scripts/`, tests or docs — always read from environment variables / `.env`.
   - Reuse shared helpers in `apps/api/src/lib/` (`cursor.ts`, `validate.ts`, `password.ts`, `limiter.ts`, `errors.ts`) rather than duplicating validation or pagination logic.
