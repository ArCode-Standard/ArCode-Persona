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
- [ ] Approve stylized visual direction and character proportions.
- [ ] Create production base mesh and rig.
- [x] Expose imported GLB facial morph targets through runtime sliders.
- [ ] Implement facial expression presets and blendshape authoring tools.
- [ ] Replace placeholder garments with researched modular Moroccan assets.
- [x] Play and select animation clips embedded in imported GLB files.
- [ ] Add a studio-wide animation state machine and gesture library.
- [ ] Validate mobile performance and accessibility.

## Phase 1A — Production asset pipeline\n- [x] Add a Blender export helper with mandatory provenance metadata.\n- [x] Add a GLB profile validator for skinned avatars and garments.\n- [ ] Produce and license the base human mesh, rig, and facial shape keys.\n- [ ] Produce modular djellaba, caftan, and takchita assets against the pinned rig.\n- [ ] Complete garment deformation and clipping QA on the base animation set.\n\n## Phase 2 — Creator experience
- [x] Import and restore saved looks.
- [x] Import a local GLB avatar into the live preview.
- [ ] Add modular garment attachment and rig compatibility checks.\n- [ ] Preset library and outfit slots.
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
