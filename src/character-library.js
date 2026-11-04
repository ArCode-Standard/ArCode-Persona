import catalog from '../data/characters.json' with { type: 'json' };
import { validateAvatarConfig } from './avatar-config.js';

export const CHARACTER_CATALOG = Object.freeze(catalog);

export function getCharacterPreset(id) {
  return CHARACTER_CATALOG.characters.find((item) => item.id === id) ?? null;
}

export function validateCharacterDocument(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new TypeError('Character document must be an object.');
  }
  if (input.format !== 'arcode-persona-character') {
    return Object.freeze({ config: validateAvatarConfig(input), profile: null });
  }
  if (input.formatVersion !== 1) throw new TypeError('Unsupported character document version.');
  if (typeof input.id !== 'string' || !/^[a-z0-9][a-z0-9-]{0,63}$/.test(input.id)) {
    throw new TypeError('Invalid character id.');
  }
  if (typeof input.name !== 'string' || !input.name.trim() || input.name.length > 80) {
    throw new TypeError('Invalid character name.');
  }
  if (typeof input.description !== 'string' || input.description.length > 240) {
    throw new TypeError('Invalid character description.');
  }
  if (!Array.isArray(input.tags) || input.tags.length > 12 || input.tags.some((tag) => typeof tag !== 'string' || tag.length > 32)) {
    throw new TypeError('Invalid character tags.');
  }
  return Object.freeze({
    config: validateAvatarConfig(input.config),
    profile: Object.freeze({ id: input.id, name: input.name.trim(), description: input.description, tags: Object.freeze([...input.tags]) })
  });
}

export function createCharacterDocument(config, profile = {}) {
  const safe = validateCharacterDocument({
    format: 'arcode-persona-character', formatVersion: 1,
    id: profile.id ?? 'custom', name: profile.name ?? 'Custom character',
    description: profile.description ?? '', tags: profile.tags ?? ['custom'],
    config: validateAvatarConfig(config)
  });
  return Object.freeze({ format: 'arcode-persona-character', formatVersion: 1,
    id: safe.profile.id, name: safe.profile.name, description: safe.profile.description,
    tags: [...safe.profile.tags], config: safe.config });
}
