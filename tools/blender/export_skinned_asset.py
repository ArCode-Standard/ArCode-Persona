"""Export selected skinned avatar or garment geometry to GLB with provenance metadata.

Example:
  blender -b character.blend --python tools/blender/export_skinned_asset.py -- \
    --output public/assets/avatar-base.glb --role avatar \
    --creator "Artist or studio" --license "CC-BY-4.0"
"""
import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

import bpy


def parse_arguments():
    raw = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", required=True)
    parser.add_argument("--role", choices=("avatar", "garment"), required=True)
    parser.add_argument("--creator", required=True)
    parser.add_argument("--license", required=True)
    parser.add_argument("--version", default="1.0.0")
    parser.add_argument("--source", default="Original work")
    parser.add_argument("--attribution", default="")
    parser.add_argument("--cultural-review", choices=("not-applicable", "pending", "reviewed"), default="pending")
    return parser.parse_args(raw)


def main():
    args = parse_arguments()
    selected = list(bpy.context.selected_objects)
    armatures = [obj for obj in selected if obj.type == "ARMATURE"]
    meshes = [obj for obj in selected if obj.type == "MESH"]
    if len(armatures) != 1:
        raise RuntimeError("Select exactly one armature with the asset meshes.")
    if not meshes:
        raise RuntimeError("Select at least one mesh.")
    armature = armatures[0]
    skinned = [mesh for mesh in meshes if any(mod.type == "ARMATURE" and mod.object == armature for mod in mesh.modifiers)]
    if not skinned:
        raise RuntimeError("No selected mesh is skinned to the selected armature.")
    output = Path(args.output).expanduser().resolve()
    output.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.object.select_all(action="DESELECT")
    for obj in selected:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = armature
    bpy.ops.export_scene.gltf(
        filepath=str(output),
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_animations=True,
        export_skins=True,
        export_morph=True,
        export_materials="EXPORT",
        export_image_format="AUTO",
    )
    shape_key_count = sum(
        max(0, len(mesh.data.shape_keys.key_blocks) - 1)
        for mesh in meshes if mesh.data.shape_keys
    )
    manifest = {
        "schemaVersion": 1,
        "assetRole": args.role,
        "name": output.stem,
        "version": args.version,
        "creator": args.creator,
        "source": args.source,
        "license": args.license,
        "attribution": args.attribution,
        "culturalReview": args.cultural_review,
        "exportedAt": datetime.now(timezone.utc).isoformat(),
        "blenderVersion": bpy.app.version_string,
        "armature": armature.name,
        "boneCount": len(armature.data.bones),
        "meshCount": len(meshes),
        "skinnedMeshCount": len(skinned),
        "shapeKeyCount": shape_key_count,
        "file": output.name,
    }
    manifest_path = output.with_suffix(output.suffix + ".manifest.json")
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("Exported:", output)
    print("Manifest:", manifest_path)


if __name__ == "__main__":
    main()
