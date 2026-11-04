# 3D Avatar Asset Pipeline

## Production asset requirements

### Base character
- One consistent stylized body proportion system with configurable body shape ranges.
- Clean deformation topology and documented polygon budgets.
- UV maps, PBR texture sets, normal/tangent consistency, and material naming.
- Skeleton hierarchy with stable bone naming and documented coordinate conventions.

### Face
- Blendshape targets for brows, eyelids, gaze, cheeks, jaw, lips, and phoneme families.
- Neutral pose and expression calibration.
- Tests for clipping and deformation at expression extremes.

### Wardrobe
- Modular garments authored against supported body rigs.
- Defined attachment points and collision volumes.
- Skinning or cloth simulation strategy per garment.
- Layering rules for caftan/takchita and outerwear.
- Tested combinations to prevent clipping.

### Animation
- Idle, turn, walk, run, sit, and gesture clips.
- Facial expression presets and transition rules.
- Root-motion policy and retargeting conventions.
- Reduced-motion alternatives for accessibility.

## Runtime format and optimization

Use GLB/glTF 2.0 as the preferred runtime interchange format, subject to pipeline validation. Produce mobile and desktop LODs, compressed textures where appropriate, and bounded download sizes. Load optional garments and animation packs on demand.

## Provenance and licensing

Every asset must carry metadata for creator, source, license, allowed modifications, attribution obligations, cultural review status, and version. Do not add scraped or unlicensed 3D assets to the production library.

## Acceptance gates

An asset is not production-ready until it passes topology, rig, material, clipping, performance, accessibility, licensing, and cultural-review checks.
