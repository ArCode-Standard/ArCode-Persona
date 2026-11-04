/**
 * Versioned, renderer-independent character design contract.
 * Version 1 flat looks are migrated automatically to the nested version 2 model.
 */
export const AVATAR_CONFIG_VERSION = 2;

export const AVATAR_OPTIONS = Object.freeze({
  hairStyle: ['short', 'curly', 'long', 'shaved'],
  outfit: ['djellaba', 'caftan', 'modern', 'takchita'],
  headwear: ['none', 'fez', 'hood'],
  expression: ['smile', 'neutral', 'surprised'],
  accessory: ['none', 'glasses', 'earring', 'scarf']
});

export const DESIGN_DEFAULTS = Object.freeze({
  body: Object.freeze({
    height: 1, shoulderWidth: 1, torsoLength: 1, bodyDepth: 1,
    waistWidth: 1, hipWidth: 1, armLength: 1, legLength: 1, headScale: 1, neckLength: 1
  }),
  face: Object.freeze({
    shape: 'oval', width: 1, height: 1, cheekboneWidth: 1, jawWidth: 1,
    chinWidth: 1, noseBridgeHeight: 1, noseLength: 1, noseWidth: 1,
    noseTip: 1, earSize: 1, earProtrusion: 1, earAngle: 0
  }),
  hairDetails: Object.freeze({
    volume: 1, density: 1, fringe: 0.25, part: 'center',
    curl: 0.5, sideburn: 0.5, length: 1
  }),
  clothing: Object.freeze({
    fit: 'regular', sleeveLength: 1, robeLength: 1, collarHeight: 1,
    embroidery: 0.65, trimColor: '#c7a45e', belt: false, layer: 'single'
  })
});

export const DEFAULT_AVATAR_CONFIG = Object.freeze({
  schemaVersion: AVATAR_CONFIG_VERSION,
  skin: '#b97850',
  hair: '#241b19',
  hairStyle: 'short',
  cloth: '#176b60',
  outfit: 'djellaba',
  headwear: 'none',
  expression: 'smile',
  eyes: '#38251e',
  accessory: 'none',
  ...DESIGN_DEFAULTS
});

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;
const ENUMS = {
  'face.shape': ['oval', 'round', 'square', 'heart', 'long'],
  'hairDetails.part': ['center', 'left', 'right', 'none'],
  'clothing.fit': ['slim', 'regular', 'loose', 'oversized'],
  'clothing.layer': ['single', 'inner-outer', 'ceremonial']
};
const RANGES = {
  'body.height':[0.8,1.2], 'body.shoulderWidth':[0.7,1.35], 'body.torsoLength':[0.8,1.2],
  'body.bodyDepth':[0.75,1.3], 'body.waistWidth':[0.7,1.35], 'body.hipWidth':[0.7,1.4],
  'body.armLength':[0.8,1.2], 'body.legLength':[0.8,1.2], 'body.headScale':[0.8,1.2],
  'body.neckLength':[0.7,1.3], 'face.width':[0.75,1.25], 'face.height':[0.8,1.2],
  'face.cheekboneWidth':[0.75,1.3], 'face.jawWidth':[0.7,1.3], 'face.chinWidth':[0.65,1.35],
  'face.noseBridgeHeight':[0.65,1.35], 'face.noseLength':[0.7,1.3], 'face.noseWidth':[0.65,1.35],
  'face.noseTip':[0.7,1.3], 'face.earSize':[0.7,1.3], 'face.earProtrusion':[0.5,1.5],
  'face.earAngle':[-25,25], 'hairDetails.volume':[0.5,1.6], 'hairDetails.density':[0.5,1.5],
  'hairDetails.fringe':[0,1], 'hairDetails.curl':[0,1], 'hairDetails.sideburn':[0,1],
  'hairDetails.length':[0.5,1.8], 'clothing.sleeveLength':[0.5,1.3],
  'clothing.robeLength':[0.7,1.3], 'clothing.collarHeight':[0.5,1.5],
  'clothing.embroidery':[0,1]
};

function mergeDesign(source = {}) {
  if (!source || typeof source !== 'object' || Array.isArray(source)) throw new TypeError('Design section must be an object.');
  return Object.fromEntries(Object.entries(DESIGN_DEFAULTS).map(([section, defaults]) => {
    const supplied = Object.prototype.hasOwnProperty.call(source, section) ? source[section] : {};
    if (!supplied || typeof supplied !== 'object' || Array.isArray(supplied)) throw new TypeError(`Invalid ${section} design section.`);
    for (const key of Object.keys(supplied)) if (!(key in defaults)) throw new TypeError(`Unknown design property: ${section}.${key}`);
    return [section, { ...defaults, ...supplied }];
  }));
}

export function validateAvatarConfig(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new TypeError('Avatar config must be an object.');
  const allowedKeys = new Set(Object.keys(DEFAULT_AVATAR_CONFIG));
  for (const key of Object.keys(input)) if (!allowedKeys.has(key)) throw new TypeError(`Unknown avatar property: ${key}`);
  const version = input.schemaVersion ?? 1;
  if (version !== 1 && version !== AVATAR_CONFIG_VERSION) throw new TypeError('Unsupported avatar config schema version.');
  const value = { ...DEFAULT_AVATAR_CONFIG, ...input, schemaVersion: AVATAR_CONFIG_VERSION };
  for (const key of ['skin','hair','cloth','eyes']) {
    if (typeof value[key] !== 'string' || !HEX_COLOR.test(value[key])) throw new TypeError(`Invalid color value for ${key}.`);
  }
  for (const [key, choices] of Object.entries(AVATAR_OPTIONS)) if (!choices.includes(value[key])) throw new TypeError(`Unsupported ${key} value.`);

  const design = mergeDesign(input);
  for (const [section, values] of Object.entries(design)) {
    for (const [key, item] of Object.entries(values)) {
      const path = `${section}.${key}`;
      if (ENUMS[path] && !ENUMS[path].includes(item)) throw new TypeError(`Unsupported ${path} value.`);
      if (RANGES[path] && (typeof item !== 'number' || !Number.isFinite(item) || item < RANGES[path][0] || item > RANGES[path][1])) {
        throw new TypeError(`Invalid ${path} value; expected ${RANGES[path].join('..')}.`);
      }
      if (path === 'clothing.trimColor' && (typeof item !== 'string' || !HEX_COLOR.test(item))) throw new TypeError('Invalid clothing.trimColor value.');
      if (path === 'clothing.belt' && typeof item !== 'boolean') throw new TypeError('Invalid clothing.belt value.');
    }
  }
  return Object.freeze({ ...value, ...Object.fromEntries(Object.entries(design).map(([key, section]) => [key, Object.freeze(section)])) });
}
