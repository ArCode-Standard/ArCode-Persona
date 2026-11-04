import test from 'node:test';
import assert from 'node:assert/strict';
import { CHARACTER_CATALOG, getCharacterPreset, validateCharacterDocument, createCharacterDocument } from '../src/character-library.js';

test('JSON character catalog contains unique valid profiles', () => {
  const ids = CHARACTER_CATALOG.characters.map((item) => item.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const item of CHARACTER_CATALOG.characters) assert.ok(validateCharacterDocument({ format:'arcode-persona-character', formatVersion:2, ...item }).config);
});

test('loads a known character preset by id', () => {
  assert.equal(getCharacterPreset('royal-caftan').config.outfit, 'caftan');
  assert.equal(getCharacterPreset('missing'), null);
});

test('exports and imports a versioned character document', () => {
  const preset = getCharacterPreset('atlas-scholar');
  const exported = createCharacterDocument(preset.config, preset);
  const restored = validateCharacterDocument(JSON.parse(JSON.stringify(exported)));
  assert.equal(restored.profile.id, 'atlas-scholar');
  assert.equal(restored.config.outfit, 'djellaba');
  assert.equal(restored.config.schemaVersion, 2);
  assert.equal(restored.config.face.shape, 'oval');
});

test('keeps backwards compatibility with legacy character document v1', () => {
  const preset = getCharacterPreset('atlas-scholar');
  const legacy = validateCharacterDocument({ format:'arcode-persona-character', formatVersion:1, ...preset });
  assert.equal(legacy.config.schemaVersion, 2);
  assert.equal(legacy.profile.id, 'atlas-scholar');
});

test('keeps backwards compatibility with legacy look JSON', () => {
  const restored = validateCharacterDocument({ outfit: 'caftan' });
  assert.equal(restored.profile, null);
  assert.equal(restored.config.outfit, 'caftan');
});

test('rejects invalid character metadata and unsupported versions', () => {
  assert.throws(() => validateCharacterDocument({ format:'arcode-persona-character', formatVersion:9, id:'x', name:'X', description:'', tags:[], config:{} }), /version/);
  assert.throws(() => validateCharacterDocument({ format:'arcode-persona-character', formatVersion:1, id:'bad id', name:'X', description:'', tags:[], config:{} }), /id/);
});
