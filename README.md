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

See [Moroccan Wardrobe Catalog](docs/MOROCCAN_WARDROBE_CATALOG.md) and the [Character JSON Design Schema](docs/CHARACTER_JSON_SCHEMA.md).

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
| `docs/AVATAR_ASSET_PIPELINE.md` | Production 3D asset authoring and validation pipeline |\n| `tools/blender/export_skinned_asset.py` | Blender GLB exporter with provenance manifest |\n| `tools/validate-avatar-glb.mjs` | GLB rig/morph/animation profile validator |
| `docs/PRIVACY_AND_SECURITY.md` | Data handling and future server security principles |
| `docs/QUALITY_GATES.md` | CI and release acceptance criteria |
| `docs/ROADMAP_EXECUTION.md` | Phased execution plan |

## Current capabilities

- 360-degree pointer rotation, auto-rotation, and zoom.
- Initial appearance and wardrobe controls.
- Expression and accessory selectors.
- Validated JSON export/import for full character profiles, including body proportions, face shape, nose, jaw, ears, hair details, and clothing construction.
- Local GLB 2.0 avatar import with a 32 MB limit and rejection of external asset URLs.
- Local import of one skinned garment GLB, rebound to the imported avatar by exact skeleton bone names.
- Playback and selection of animation clips embedded in imported GLB avatars.
- Runtime sliders for facial morph targets exposed by imported GLB models (up to 24 controls).
- Live procedural controls for body proportions, facial anatomy, hair details, and clothing fit/embroidery.
- Procedural human anatomy foundation with thorax, abdomen, pelvis, shoulder masses, articulated upper/lower arms, elbows, hands, thighs, knees, calves, ankles, and feet.
- Semantic application of supported design properties to matching GLB morph targets and conventionally named skeleton bones.
- Automatic local browser persistence with no account or server storage.
- Restore saved looks after reloading the studio.
- Responsive Arabic RTL interface.\n- Blender export helper and GLB production-profile validation for skinned avatars and garments.

## Important limitations

The built-in preview now includes a more complete stylized human volume, but it remains a procedural anatomy blockout rather than a production-quality human base mesh. It does not yet provide anatomically sculpted muscle groups, realistic hands/fingers, detailed feet, facial topology, or production skin deformation. Users can import a self-contained GLB 2.0 avatar locally (maximum 32 MB); imported assets are not uploaded. Production human topology, finished rigged character assets, authored Moroccan garment meshes, multi-piece outfit composition, realistic cloth simulation, and browser E2E tests are not yet implemented. Procedural geometry is a stylized preview: some detailed proportions are only visually approximate, and imported GLB anatomy changes require compatible morph targets or conventionally named bones; unsupported GLB properties are intentionally left unchanged. The current garment loader is a single-piece rig-binding foundation and requires a compatible garment asset. The new Blender exporter and GLB validator provide production asset tooling, not the missing art assets. See the [execution roadmap](docs/ROADMAP_EXECUTION.md).

## Independence and privacy

No Darija-LexReview integration is enabled. The current prototype does not require an account or database; look export is local. Future cloud storage requires explicit consent, server-side authorization, and a privacy review.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.


### Human anatomy, rig and color engine

- `src/human-proportions.js`: shared proportion solver and anatomical landmarks for shoulder, elbow, wrist, pelvis, knee, ankle and foot placement.
- `src/human-rig.js`: standardized humanoid bone hierarchy (hips, spine, chest, neck, head, clavicles, arms, hands, fingers, legs, feet and toes) for future animation and skin binding.
- `src/human-anatomy.js`: lofted torso surface with smoother ribcage-to-waist-to-pelvis transitions, plus articulated limb blockout.
- `src/color-system.js`: Moroccan-inspired palettes and physically based skin/fabric material presets.
- The face preview now has more deliberate jaw, cheek, ear and nose sub-shapes; all remain stylized procedural geometry.

The bone hierarchy is currently animation-ready metadata, not yet a weighted SkinnedMesh. The preview anatomy remains a blockout; realistic anatomical topology, fingers, muscle definition and deformation require a dedicated production base mesh and skin weights.
