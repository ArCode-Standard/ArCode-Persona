# Technical Architecture

## Current implementation

ArCode Persona is an independent browser application. The current prototype uses:

- Vite for local development and optimized static builds.
- JavaScript ES modules with Three.js pinned as a local npm dependency.
- A platform-neutral avatar configuration contract in `src/avatar-config.js`.
- Node's built-in test runner for contract validation.
- GitHub Actions for tests, production build, pull-request preview artifacts, and GitHub Pages deployment.

## Logical layers

1. **Experience layer** — Arabic RTL studio, controls, accessible labels, responsive layout.
2. **Avatar domain** — versioned appearance configuration, enumerated options, validation.
3. **Rendering adapter** — Three.js scene, camera, lighting, meshes, materials, interaction.
4. **Asset layer (planned)** — rigged body, face morphs, garment modules, PBR textures, animation clips.
5. **Persistence adapter (planned)** — explicit export/import first; account-backed storage only after privacy and security review.
6. **Integration adapter (planned)** — versioned public SDK/API. No consuming platform is coupled to the core.

## Rendering and asset roadmap

The current procedural mesh is a visual interaction placeholder. Production quality requires a consistent humanoid base mesh, clean topology, UV layout, physically based materials, skeleton rig, facial blendshapes, garment-specific skinning/cloth strategy, and tested animation clips.

Prefer glTF 2.0/GLB for runtime delivery. Keep source authoring files, exported runtime files, licenses, provenance, and validation reports separate. Use LODs and texture budgets for mobile devices.

## Quality constraints

- Do not claim photorealism or production-ready animation while placeholder meshes remain.
- Validate all imported and saved configurations against the versioned contract.
- Never trust a client-provided avatar payload on a future server API.
- Keep Three.js implementation details out of the domain configuration contract.
- Keep the product independently deployable and consumable by multiple ArCode products.
