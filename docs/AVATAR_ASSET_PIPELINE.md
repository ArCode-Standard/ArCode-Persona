# 3D Avatar Asset Pipeline

## Status and scope

The built-in browser figure remains a procedural placeholder. This repository does **not** yet contain a licensed production human mesh, a validated production rig, or finished Moroccan garment meshes. The tools in this document establish a repeatable authoring and acceptance path; they do not fabricate those art assets.

## Required asset packages

### Base character
- One stylized base body with clean deformation topology, UVs, PBR materials, and a documented neutral pose.
- A single armature with stable, documented bone names and a consistent rest pose.
- Skin weights validated through shoulder, elbow, wrist, hip, knee, and ankle extremes.
- Facial shape keys exported as glTF morph targets. Production target: at least 20 useful targets covering brows, eyelids, gaze, cheeks, jaw, lips, and phoneme families.
- Production animation target: idle, turn, walk, and at least one gesture.
- Separate desktop/mobile LODs, with texture budgets documented.

### Modular Moroccan garments

Each garment is a separate skinned GLB using the **same base armature, bone names, rest pose, and coordinate convention** as the character:
- Djellaba: hood, sleeve, cut, length, fabric, and trim variants.
- Caftan: silhouette, sfifa-inspired edging, closure, fabric, and belt.
- Takchita: distinct inner and outer layers plus belt; preserve layer order.
- Contemporary pieces remain a separate category.
- Accessories use explicit attachment points rather than being merged into body geometry.

Cultural review is required before production approval. Record references, region/context, reviewer, and review date. Do not use sacred or community-specific motifs as generic decoration.

## Blender export

1. Open the source blend file and set the character/garment to its documented neutral rest pose.
2. Select exactly one armature and the meshes for one asset package.
3. Ensure each mesh has an Armature modifier targeting that armature; apply transforms consistently before skinning.
4. For avatars, create shape keys and animation actions; test extreme poses and facial weights.
5. Run the exporter (Blender with the glTF 2.0 exporter enabled):

~~~bash
blender -b character.blend --python tools/blender/export_skinned_asset.py -- \
  --output public/assets/avatar-base.glb --role avatar \
  --creator "Creator or studio" --license "SPDX license identifier" \
  --source "Source URL or original work" --version "1.0.0"
~~~

For a garment, use --role garment and a garment-specific output name. The script writes a companion GLB manifest JSON file with creator, source, license, version, rig, shape-key, and cultural-review metadata. Never use a placeholder license or omit attribution obligations.

## GLB profile validation

Run after export:

~~~bash
npm run validate:avatar -- public/assets/avatar-base.glb
npm run validate:garment -- public/assets/djellaba.glb
~~~

The validator checks GLB 2.0 structure, self-contained resources, skinned mesh bindings, joint counts, morph targets, animations, materials, and textures. It reports production gaps. Add --strict to fail when the avatar is below the target of 40 joints, 20 morph targets, or 3 animation clips. A garment must contain at least one mesh bound to a skin. These are project gates, not universal glTF requirements.

## Garment compatibility and clipping QA

Before an asset is accepted:
1. Compare bone names and rest transforms against the pinned base-rig revision.
2. Test the garment on the base rig at neutral, arms-up, arms-crossed, seated, and walking poses.
3. Inspect shoulders, armpits, elbows, waist, knees, cuffs, hood, belt, and layered hems.
4. Use corrective shape keys or revised skin weights where clipping occurs; do not hide intersections by scaling the whole garment.
5. Check that all required textures are embedded and the GLB has no external resource URLs.
6. Test on a mid-range mobile device for frame time, memory, and download size.

The current runtime can import a single self-contained avatar GLB. Modular garment attachment/retargeting is a separate runtime feature and must not be implied by this exporter or validator.

## Provenance and licensing

Every production asset must carry creator, source, SPDX license identifier, attribution obligations, modification rights, cultural review status, version, and rig compatibility. Do not commit scraped or unlicensed 3D assets.

## Acceptance gates

An asset is not production-ready until it passes topology, rig, deformation, facial, animation, garment clipping, performance, accessibility, licensing, and cultural-review checks.
