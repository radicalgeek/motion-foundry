# Motion Foundry

**Motion Foundry creates animated graphics and assembles videos on your own computer.** Describe the scenes, text, diagrams, timing and media in a JSON project, then preview and render it through a browser editor, command-line tool or API.

It is designed for repeatable production: reuse a layout, change the content, apply a custom brand and produce another video. AI agents and scripts can use the same project format and tools as the human editor.

The renderer runs locally using **SVG, Sharp and FFmpeg**. It can combine its graphics with video, images, narration, music and captions that you supply. Footage from cameras, screen recordings or external generation tools can be brought into a composition.

## What can I use it for?

| Use | Examples |
|---|---|
| Animated explanations | Process diagrams, timelines, comparisons and system diagrams |
| Video graphics | Opening titles, chapter cards, captions and closing scenes |
| Social videos | Landscape, portrait, vertical and square versions of a sequence |
| Video composition | Combine footage, a presenter, narration, music and graphics on a timed sequence |
| Overlays and background replacement | Transparent graphics, green-screen footage and supplied subject mattes |
| Automated production | Generate variations from a script, review sample frames and queue renders through an API |

Outputs include MP4 videos, transparent WebM overlays, PNG stills, JPEG contact sheets and SRT caption files. Video renders also produce a JSON manifest identifying the project, brand, timing and source assets.

The public distribution includes a **Neutral** visual style and generic examples. You can add private brand packs without changing the renderer.

## Install and start

Requirements:

- **Node.js 22.12 or later** and npm.
- **FFmpeg 7 or later**, with `ffmpeg` and `ffprobe` available on your command path.

Check the tools before installing:

```bash
node --version
npm --version
ffmpeg -version
ffprobe -version
```

Clone the repository, install its dependencies and build all applications:

```bash
git clone https://github.com/radicalgeek/motion-foundry.git
cd motion-foundry
npm ci
npm run build
npm run seed
npm run start --workspace @motion-foundry/api
```

Leave that terminal running and open **[http://localhost:4310](http://localhost:4310)**. The service hosts both the Studio and the API.

`npm run seed` creates eight sample projects and variants in local storage. It also generates demonstration audio with FFmpeg. On macOS it uses the built-in `say` command for sample narration; on other systems that narration track is silent, with the written captions still available. These are demonstration assets.

## Make your first video

### In the browser

1. Open the Studio and choose **Getting started** from the project list. It contains a title, an animated process and a closing scene.
2. Select a scene and change its title, body text, items or duration in **Properties**. Use **Add** to insert another scene template.
3. Click **Save** to update the stored project and its preview.
4. Open **QA** and resolve any errors before rendering.
5. Click **Render**, then open the **Renders** tab. When the job is complete, use **Open MP4** to view the result.

To start from scratch, click **+** beside **Projects**, enter a title and choose **Neutral** and an output preset. The **Source** tab lets you edit the complete JSON project; click **Apply source**, then **Save**.

### From the command line

With the API still running, open a second terminal in the repository directory. Render the supplied example:

```bash
npm run motion -- validate getting-started
npm run motion -- still getting-started --time 6
npm run motion -- contact-sheet getting-started
npm run motion -- render getting-started --key getting-started-v1 --wait
```

Inspect the still and contact sheet before rendering. The commands return JSON containing their output paths. A successful video job has `"status": "complete"` and an `output` path to the finished file.

Create a simple six-second title video of your own:

```bash
npm run motion -- create "Hello motion" --brand neutral --preset course-hd --template foundation.title
npm run motion -- validate hello-motion
npm run motion -- still hello-motion --time 2
npm run motion -- render hello-motion --key hello-motion-v1 --wait
```

The project ID is returned by `create`; for this title it is `hello-motion`. Open the Studio to edit it further. Use a new render key after changing a project; repeating the same key retrieves the existing job.

The `course-hd` preset is ordinary **1920 × 1080** landscape video. Discover other formats, brands and templates with:

```bash
npm run motion -- brands
npm run motion -- templates --ratio social-square
npm run motion -- components
```

## How projects work

A project specifies its brand, output preset, frame rate and ordered scenes. Each scene has a template, content and duration. Optional layers and timed tracks add images, footage, narration, music or captions. The total project duration matches the sum of its scene durations.

For a complete JSON example, see [`examples/getting-started/project.motion.json`](examples/getting-started/project.motion.json). The supplied examples demonstrate:

- **getting-started** — titles, an animated process, captions and demo audio, plus four output-format variants;
- **process-flow** — a portrait workflow diagram;
- **system-overview** — a square input/process/output diagram;
- **terminal-demo** — an animated sample command-line session.

Still and contact-sheet previews show the graphics renderer. Inspect the finished video when checking footage, audio or video compositing.

## Use the HTTP API or an AI agent

The Studio, CLI and MCP server all use the same JSON API at `http://localhost:4310/api`. A script can create, read, patch, validate and render projects without operating the browser.

For example, create a title project over HTTP:

```bash
curl http://localhost:4310/api/projects \
  -H 'Content-Type: application/json' \
  -d '{"title":"API example","brand":"neutral","preset":"course-hd","template":"foundation.title"}'
```

Submit a complete project JSON to the same endpoint for more complex sequences. Updates use `PATCH /api/projects/:id` with `expectedVersion` and a `patch` object, so clients can detect conflicting edits. See the [API reference](docs/api.md) for endpoints and the workflow.

For MCP clients, build the project and keep the API running, then configure a stdio server using the compiled entry point. Clients that use `mcpServers` entries can use this structure; replace the example installation path:

```json
{
  "mcpServers": {
    "motion-foundry": {
      "command": "node",
      "args": ["/absolute/path/to/motion-foundry/apps/mcp/dist/index.js"],
      "env": {
        "MOTION_API": "http://localhost:4310/api"
      }
    }
  }
}
```

An agent's normal workflow is to discover brands and templates, create or patch a project, validate it, inspect representative frames, then render and poll the job. Available tools include `brands.list`, `templates.list`, `projects.create`, `projects.patch`, `validate`, `inspect`, `still`, `contact_sheet`, `render` and `render.status`.

The CLI also accepts `MOTION_API` when connecting to another instance. Include the `/api` suffix in that URL.

## Add your own branding and media

Create a local brand pack from Neutral:

```bash
npm run motion -- brand init my-brand --name "My Brand" --base neutral
```

The pack is stored in `.motion-foundry/brands/my-brand.json`. Edit its colours, fonts and motion settings, then restart the API to load those file changes. Create projects with `--brand my-brand`. See [brand onboarding](docs/brand-onboarding.md) for the fields to configure.

Place your media in `.motion-foundry/assets/` and reference it as `assets/filename.ext` in the project JSON. The API also provides `POST /api/assets/register` for programmatic registration. Media tracks define when an asset starts and how long it is used; video composition settings control fitting, cropping, layering, keys and mattes. See [the composition architecture](docs/architecture.md#long-form-media) for these controls.

## Where files are stored

Local working data lives in the ignored `.motion-foundry/` directory:

```text
.motion-foundry/
  projects/   saved JSON project specifications
  brands/     private custom brand packs
  assets/     your media and generated demo audio
  jobs/       render status and queue records
  renders/    finished videos, stills, contact sheets, captions and manifests
```

Your projects, business packs, media and outputs stay outside the tracked source. Back up this directory separately if you need to preserve your work.

The API is intended for a trusted local workstation and has no authentication layer. Keep it behind local access controls rather than exposing it directly to the public internet.

## Development and checks

For live API and Studio development:

```bash
npm run dev
```

The development Studio runs at [http://localhost:4311](http://localhost:4311) and proxies API requests to port `4310`. Stop the single-service API first to avoid a port conflict.

Run the source checks with:

```bash
npm run typecheck
npm test
npm run build
```

The renderer uses local SVG, Sharp and FFmpeg throughout. Contributions should preserve that rendering path and avoid adding paid or hosted rendering dependencies.

Further documentation: [architecture](docs/architecture.md), [API](docs/api.md), [brand onboarding](docs/brand-onboarding.md).
