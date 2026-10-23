# Motion Foundry

Motion Foundry is a local, agent-first, multi-brand system for code-driven motion. One versioned project model drives animated teaching inserts, title scenes, social formats, explainers, long-form assemblies, stills, thumbnails, contact sheets and transparent overlays.

The repository includes:

- deterministic responsive SVG/frame runtime and FFmpeg exporter;
- a Neutral base brand pack and support for private custom packs;
- twelve foundation, teaching, social and long-form components/templates;
- canonical v2 projects with scenes, layers, narration, music, captions, presenter/demo/video tracks and markers;
- static QA, semantic brand enforcement, exact timing checks and render manifests;
- legacy social-format migration with a generic example;
- local JSON API, MCP server and CLI with discovery, authoring, inspection and asynchronous rendering;
- Motion Studio with template authoring, project/scene properties, source view, exact-frame transport, safe areas, QA and render queue;
- persistent projects, optimistic patches, idempotency, cached/resumable jobs, variants and asset registration;
- brand-pack onboarding and generic demonstration fixtures.

## Run it

Requirements: Node 22+, npm and FFmpeg 7+.

```bash
npm ci
npm run build
npm run seed
npm run dev
```

Open [http://localhost:4311](http://localhost:4311). The Studio proxies its API to `http://localhost:4310`.

Production build and single-service deployment:

```bash
npm run build
npm run dev:api
```

The API serves the built Studio at [http://localhost:4310](http://localhost:4310).

## Agent workflow

The intended sequence is explicit and repairable:

```bash
npm run motion -- brands
npm run motion -- templates --ratio course-hd
npm run motion -- create "Example sequence" --brand neutral --preset course-hd --template foundation.title
npm run motion -- validate example-sequence
npm run motion -- still example-sequence --time 4
npm run motion -- contact-sheet example-sequence
npm run motion -- render example-sequence --key example-sequence-v1 --wait
```

The CLI is a thin client over the JSON API. Set `MOTION_API` to change its endpoint.

The stdio MCP server exposes the same workflow:

```bash
MOTION_API=http://localhost:4310/api npm run start -w @motion-foundry/mcp
```

Its tools include `brands.list`, `templates.list`, `components.list`, `projects.create`, `projects.patch`, `validate`, `inspect`, `still`, `contact_sheet`, `render`, `render.status`, `variants.create` and `migrate.social_v1`.

## Reference projects

`npm run seed` installs these into the local project store:

- `getting-started`: a 20-second sequence with titles, process steps, captions and generated demo audio;
- four responsive variants of the getting-started sequence;
- `process-flow`: an example workflow in portrait format;
- `system-overview`: a simple input/process/output diagram;
- `terminal-demo`: a sample CLI session.

Source fixtures remain under [`examples`](./examples) and the social-v1 import fixture is under [`fixtures`](./fixtures).

## Data and outputs

The public repository contains application source, documentation, tests and example specifications. Local projects, media assets, render jobs, generated outputs and credentials are excluded by `.gitignore`. Custom business packs belong in `.motion-foundry/brands/`; the repository ships only the Neutral pack and generic demonstrations.

Runtime state is intentionally local and reviewable:

```text
.motion-foundry/
  projects/   canonical project JSON
  brands/     locally onboarded versioned brand packs
  assets/     registered assets and generated demo audio
  jobs/       resumable render jobs
  renders/    MP4, PNG, contact sheets and manifests
```

The API is intended for a trusted local workstation. It has no authentication layer; keep it behind local network access controls rather than exposing it directly to the public internet.

Projects use optimistic version checks. Render requests accept idempotency keys and emit a manifest containing the spec hash, brand version, engine version, dimensions, duration and frame count.

## Zero-cost renderer policy

Motion Foundry uses only the local SVG, Sharp and FFmpeg renderer. Remotion, paid APIs, hosted renderers, subscriptions and metered services are explicitly excluded from this project. Agents must preserve this constraint when extending the runtime, Studio or automation surfaces.

See [`docs/architecture.md`](./docs/architecture.md), [`docs/api.md`](./docs/api.md), and [`docs/brand-onboarding.md`](./docs/brand-onboarding.md).

## Verification

```bash
npm run typecheck
npm test
npm run build
npm run seed
npm run motion -- validate getting-started
npm run motion -- contact-sheet getting-started
npm run motion -- render getting-started --key acceptance-v1 --wait
ffprobe .motion-foundry/renders/*.mp4
```
