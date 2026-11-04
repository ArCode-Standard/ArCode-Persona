# ArCode Persona

**ArCode Persona** is an independent avatar creation platform in the ArCode ecosystem. It is designed to let each person build a customizable digital persona while keeping identity data portable and under the user's control.

> Current status: interactive prototype and engineering foundation. The current character is procedural placeholder geometry, not a production-quality rigged avatar.

## Product direction

- Full 3D character viewing with orbit, zoom, and responsive preview.
- Customizable face, skin tone, hair, eyes, clothing, and accessories.
- Expressive face and body animation as a production target.
- A broad wardrobe direction that includes Moroccan heritage clothing and contemporary styles.
- Independent core architecture with future versioned SDK/API integrations.

## Moroccan wardrobe direction

The first design families are djellaba, caftan, takchita, contemporary Moroccan styling, and accessories such as babouches, fez, scarves, belts, jewelry, and eyewear. The catalog is research-first: regional and cultural references must be documented and reviewed. No single outfit is treated as representative of every Moroccan person.

See [Moroccan Wardrobe Catalog](docs/MOROCCAN_WARDROBE_CATALOG.md).

## Technology

- JavaScript ES modules
- Three.js for 3D rendering
- Vite for development and production builds
- Node.js built-in test runner
- GitHub Actions for CI, preview artifacts, and GitHub Pages deployment

## Local development

Requirements: Node.js 22 or newer.

```bash
npm install
npm run dev
npm test
npm run build
npm run preview
```

## Repository map

| Path | Purpose |
|---|---|
| `app.js` | Interactive 3D studio and UI behavior |
| `src/avatar-config.js` | Versioned renderer-independent avatar configuration |
| `test/` | Unit tests for the configuration contract |
| `docs/TECHNICAL_ARCHITECTURE.md` | System boundaries and rendering architecture |
| `docs/MOROCCAN_WARDROBE_CATALOG.md` | Moroccan clothing research and design direction |
| `docs/AVATAR_ASSET_PIPELINE.md` | Production 3D asset requirements |
| `docs/PRIVACY_AND_SECURITY.md` | Data handling and future server security principles |
| `docs/QUALITY_GATES.md` | CI and release acceptance criteria |
| `docs/ROADMAP_EXECUTION.md` | Phased execution plan |

## Current capabilities

- 360-degree pointer rotation, auto-rotation, and zoom.
- Initial appearance and wardrobe controls.
- Expression and accessory selectors.
- JSON export for a configured look.
- Responsive Arabic RTL interface.

## Important limitations

The current preview uses procedural geometric shapes. Full character topology, facial blendshapes, skeletal animation, realistic cloth behavior, detailed garment meshes, import/restore, persistence, and browser E2E tests are not yet implemented. See the [execution roadmap](docs/ROADMAP_EXECUTION.md).

## Independence and privacy

No Darija-LexReview integration is enabled. The current prototype does not require an account or database; look export is local. Future cloud storage requires explicit consent, server-side authorization, and a privacy review.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.
