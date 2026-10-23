# Agent and HTTP API

The API listens on port `4310` by default. All request and response bodies are JSON unless the endpoint returns a frame.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/brands` | Discover packs, versions, tokens and motion personality |
| GET | `/api/templates?ratio=course-hd` | Discover compatible templates |
| GET | `/api/components` | Discover render component capabilities |
| GET | `/api/presets` | Discover named outputs |
| POST | `/api/projects` | Create from a brief or store a complete v2 project |
| PATCH | `/api/projects/:id` | Optimistic project patch |
| POST | `/api/projects/:id/clone` | Clone and optionally change brand/preset |
| POST | `/api/validate` | Return structured diagnostics |
| GET | `/api/projects/:id/inspect` | Timeline, frame count, brand, preset and QA |
| GET | `/api/projects/:id/frame.svg` | Exact preview frame |
| POST | `/api/projects/:id/still` | Render one PNG |
| POST | `/api/projects/:id/contact-sheet` | Render representative frames |
| POST | `/api/projects/:id/render` | Queue an asynchronous video |
| GET | `/api/renders/:job` | Poll stage, progress and output |
| POST | `/api/projects/:id/variants` | Create brand/preset variants |
| POST | `/api/migrate/social-v1` | Import legacy renderer JSON |
| GET/POST | `/api/assets`, `/api/assets/register` | Search/register approved assets |
| POST | `/api/brands/init` | Derive and persist a client brand pack |

Errors use codes such as `BRAND_TOKEN_UNKNOWN`, `PROJECT_DURATION_MISMATCH`, `CAPTIONS_MISSING`, `TEXT_LIMIT_EXCEEDED` and `PRODUCT_BRAND_MISMATCH`, with a JSON path and suggested repair.

## Tested tool sequence

1. `brands.list` and `templates.list`.
2. `projects.create` with an explicit brand and preset.
3. `projects.patch` using the returned version.
4. `validate`; repair only diagnosed paths.
5. `still` or `contact_sheet` for visual review.
6. `render` with an idempotency key.
7. `render.status` until complete.

This same contract is exposed over stdio MCP and by the `motion` CLI.
