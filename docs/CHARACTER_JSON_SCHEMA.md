# Character JSON Design Schema

ArCode Persona stores portable character designs as versioned JSON. The current design contract is **avatar config v2** and character document format v2. The validator still accepts legacy flat avatar configs (v1) and character documents with formatVersion 1; these are normalized to config v2 when loaded and re-exported.

## Character document

```json
{
  "format": "arcode-persona-character",
  "formatVersion": 2,
  "id": "custom-character",
  "name": "My character",
  "description": "A customizable character profile",
  "tags": ["custom"],
  "config": {
    "schemaVersion": 2,
    "skin": "#b97850",
    "hair": "#241b19",
    "hairStyle": "curly",
    "cloth": "#176b60",
    "outfit": "djellaba",
    "headwear": "none",
    "expression": "neutral",
    "eyes": "#38251e",
    "accessory": "none",
    "body": {
      "height": 1, "shoulderWidth": 1, "torsoLength": 1, "bodyDepth": 1,
      "waistWidth": 1, "hipWidth": 1, "armLength": 1, "legLength": 1,
      "headScale": 1, "neckLength": 1
    },
    "face": {
      "shape": "oval", "width": 1, "height": 1, "cheekboneWidth": 1,
      "jawWidth": 1, "chinWidth": 1, "noseBridgeHeight": 1,
      "noseLength": 1, "noseWidth": 1, "noseTip": 1,
      "earSize": 1, "earProtrusion": 1, "earAngle": 0
    },
    "hairDetails": {
      "volume": 1, "density": 1, "fringe": 0.25,
      "part": "center", "curl": 0.5, "sideburn": 0.5, "length": 1
    },
    "clothing": {
      "fit": "regular", "sleeveLength": 1, "robeLength": 1,
      "collarHeight": 1, "embroidery": 0.65,
      "trimColor": "#c7a45e", "belt": false, "layer": "single"
    }
  }
}
```

## Design sections

- **body**: overall height, shoulder/torso/waist/hip proportions, arm/leg lengths, head scale, and neck length.
- **face**: face silhouette, width/height, cheekbones, jaw/chin, nose bridge/length/width/tip, and ear size/projection/angle.
- **hairDetails**: volume, density, fringe, parting, curl amount, sideburns, and length.
- **clothing**: fit, sleeves, robe length, collar, embroidery amount/color, belt, and layer style.

All numeric properties are finite and range-checked at import. Enumerations and colors are validated. Unknown keys are rejected instead of silently ignored.

## Three.js application behavior

### Procedural preview

The built-in stylized placeholder responds directly to the design values:
- Body height and upper-body proportions scale the model and torso.
- Face silhouette, jaw/chin, cheekbones, nose, and ears modify the generated head geometry.
- Hair values change the cap, curls, fringe, part, sideburns, and long-hair strands.
- Clothing values alter robe fit/length, sleeves, collar, trim, belt, and simple outer-layer geometry.

This is a controllable stylized preview, not production human anatomy or physically simulated cloth. Leg length is stored in JSON but is not visible on the current robe-only placeholder.

### Imported GLB

When an imported GLB exposes compatible targets, the runtime applies matching semantic morph-target names (case-insensitive, punctuation-insensitive), including names such as `FaceWidth`, `FaceNarrow`, `FaceRound`, `JawWidth`, `NoseWidth`, `NoseLength`, `NoseTip`, `EarSize`, and `HeadScale`.

Body scaling is applied only where a compatible named bone exists. Recognized bone-name groups include shoulder/clavicle/upperarm, spine/chest/torso, hips/pelvis, thigh/upperleg, calf/shin/lowerleg, neck, and head. Original bone scales are retained and used as the baseline to prevent cumulative scaling.

The GLB must contain matching morph targets or a conventionally named skeleton for the corresponding property to affect it. The runtime does not fabricate missing shape keys or bones. Clothing design values currently affect the procedural garment preview; imported garment material editing and cloth fitting remain separate work.

## Compatibility and validation

- Config v1 flat looks are migrated to config v2 defaults.
- Character document format versions 1 and 2 are accepted.
- New exports use character document format v2.
- Unknown properties, invalid ranges, unsupported enum values, and malformed hex colors are rejected.
- Character designs are stored locally or exported by the browser; this schema does not upload a user's design.
