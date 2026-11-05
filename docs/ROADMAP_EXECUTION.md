# Execution Roadmap

## Phase 0 — Browser studio foundation
- [x] Arabic RTL studio shell and responsive layout.
- [x] Three.js interactive character preview and camera controls.
- [x] Initial wardrobe and appearance controls.
- [x] Local JSON export/import and browser persistence.
- [x] Vite build pipeline and GitHub Actions workflow.
- [x] Versioned avatar configuration contract and unit tests.

## Phase 1 — High-quality character system
- [x] Establish a local GLB 2.0 import path with size, header, version, and external-resource checks.
- [x] Define versioned body, face, hair, and clothing proportion properties in JSON.
- [x] Connect procedural geometry and compatible imported GLB morph/bone targets to design properties.
- [ ] Approve stylized visual direction and character proportions.
- [x] Implement a procedural skinned humanoid blockout with normalized two-bone weights and a stable rig contract.
- [ ] Create and approve a production-quality sculpted base mesh and animation-ready production rig.
- [x] Expose imported GLB facial morph targets through runtime sliders.
- [x] Add runtime facial expression presets for imported blendshape names.
- [x] Add procedural face and nose morph targets for width, height, jaw, cheeks, chin, nose bridge, nose length and tip.
- [ ] Build visual blendshape authoring and calibration tools.
- [ ] Replace placeholder garments with researched modular Moroccan assets.
- [x] Play and select animation clips embedded in imported GLB files.
- [ ] Add a studio-wide animation state machine and gesture library.
- [ ] Validate mobile performance and accessibility.

## Phase 1A — Production asset pipeline
- [x] Add a Blender export helper with mandatory provenance metadata.
- [x] Add a GLB profile validator for skinned avatars and garments.
- [x] Implement an initial procedural weighted rig and runtime facial shape keys.
- [ ] Produce, license and visually QA a production human mesh, rig and authored facial shape keys.
- [ ] Produce modular djellaba, caftan, and takchita assets against the pinned rig.
- [ ] Complete garment deformation and clipping QA on the base animation set.

## Phase 2 — Creator experience
- [x] Import and restore saved looks.
- [x] Import a local GLB avatar into the live preview.
- [x] Add single-piece local garment import with bone-name rig rebinding.
- [ ] Add multi-piece outfit composition, layering, and clipping QA.
- [x] Add a JSON character preset library with live design controls.
- [ ] Multi-slot outfit composition and authored garment asset layers.
- [ ] Color/material controls with accessible names.
- [ ] Undo/redo and reset scopes.
- [ ] Visual snapshot and shareable export.

## Phase 3 — Independent platform services
- [ ] Define API and SDK contracts.
- [ ] Add optional account-backed persistence only after privacy review.
- [ ] Add asset catalog versioning and delivery.
- [ ] Add moderation and upload security for user-provided assets.

## Phase 4 — Ecosystem integration
- [ ] Publish stable integration SDK.
- [ ] Add adapters for consuming ArCode platforms.
- [ ] Keep identity data portable and user-controlled.
- [ ] No platform integration is enabled by this roadmap alone.
