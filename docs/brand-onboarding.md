# Brand onboarding

The public catalogue contains only the Neutral base pack. Keep business identities, logos and project-specific copy in locally stored custom packs, outside version control. Start from Neutral:

```bash
npm run motion -- brand init client-name --name "Client Name" --base neutral
```

The service writes `.motion-foundry/brands/client-name.json`. Complete these fields before production use:

1. Semantic colours for canvas, surfaces, text, muted copy, accent, state and line roles.
2. Typography roles and local deterministic font assets.
3. Logo registry, minimum size, clear space and permitted backgrounds.
4. Motion personality: easing, speed, stagger, drift and radius.
5. Writing rules, approved product IDs and co-brand policy.
6. Provenance/licence metadata for every external asset.

Then clone the generic getting-started example across title, process, network, evidence, metric and closing scenes. Render landscape, portrait and square contact sheets. Check contrast, safe areas, overflow, logo clear space, motion recognition and reduced-motion alternatives. Publish a new immutable version rather than silently changing an existing pack used by pinned projects.
