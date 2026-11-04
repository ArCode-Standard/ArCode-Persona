# Contributing to ArCode Persona

## Local development

Requirements: Node.js 22 or newer.

```bash
npm install
npm run dev
npm test
npm run build
npm run preview
```

## Contribution rules

- Keep the core independent from any consuming ArCode platform.
- Keep avatar configuration versioned and renderer-agnostic.
- Add tests when changing configuration validation or serialization.
- Do not commit generated `dist/` or `node_modules/`.
- Do not add third-party models, textures, fonts, or sound without license and provenance records.
- Clearly label placeholder art; do not describe it as production-ready.
- For Moroccan cultural references, include source notes and review status.
- Prefer small pull requests with a clear scope and verification notes.
