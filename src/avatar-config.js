/**
 * Versioned, platform-neutral avatar configuration contract.
 * Keep this module free of rendering dependencies so it can be reused by
 * future web, mobile, and server-side adapters.
 */
export const AVATAR_CONFIG_VERSION = 1;

export const AVATAR_OPTIONS = Object.freeze({
  hairStyle: ['short', 'curly', 'long', 'shaved'],
  outfit: ['djellaba', 'caftan', 'modern', 'takchita'],
  headwear: ['none', 'fez', 'hood'],
  expression: ['smile', 'neutral', 'surprised'],
  accessory: ['none', 'glasses', 'earring', 'scarf']
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
  accessory: 'none'
});

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

/**
 * Validates a serialized avatar look. Returns a normalized copy or throws
 * a descriptive TypeError. Unknown keys are rejected to keep the contract
 * explicit and safe to persist.
 */
export function validateAvatarConfig(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new TypeError('Avatar config must be an object.');
  }

  const allowedKeys = new Set(Object.keys(DEFAULT_AVATAR_CONFIG));
  for (const key of Object.keys(input)) {
    if (!allowedKeys.has(key)) throw new TypeError(`Unknown avatar property: ${key}`);
  }

  const value = { ...DEFAULT_AVATAR_CONFIG, ...input };
  if (value.schemaVersion !== AVATAR_CONFIG_VERSION) {
    throw new TypeError('Unsupported avatar config schema version.');
  }

  for (const key of ['skin', 'hair', 'cloth', 'eyes']) {
    if (typeof value[key] !== 'string' || !HEX_COLOR.test(value[key])) {
      throw new TypeError(`Invalid color value for ${key}.`);
    }
  }

  for (const [key, choices] of Object.entries(AVATAR_OPTIONS)) {
    if (!choices.includes(value[key])) {
      throw new TypeError(`Unsupported ${key} value.`);
    }
  }

  return Object.freeze(value);
}
