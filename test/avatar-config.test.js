import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AVATAR_CONFIG_VERSION,
  DEFAULT_AVATAR_CONFIG,
  validateAvatarConfig
} from '../src/avatar-config.js';

test('default avatar configuration is valid and versioned', () => {
  const config = validateAvatarConfig(DEFAULT_AVATAR_CONFIG);
  assert.equal(config.schemaVersion, AVATAR_CONFIG_VERSION);
  assert.equal(config.outfit, 'djellaba');
});

test('partial saved looks inherit stable defaults', () => {
  const config = validateAvatarConfig({ outfit: 'caftan', cloth: '#8a3344' });
  assert.equal(config.outfit, 'caftan');
  assert.equal(config.hairStyle, DEFAULT_AVATAR_CONFIG.hairStyle);
});

test('rejects unsupported schema versions', () => {
  assert.throws(() => validateAvatarConfig({ schemaVersion: 99 }), /schema version/);
});

test('rejects invalid colors', () => {
  assert.throws(() => validateAvatarConfig({ skin: 'red' }), /Invalid color/);
});

test('rejects unknown properties rather than silently persisting them', () => {
  assert.throws(() => validateAvatarConfig({ admin: true }), /Unknown avatar property/);
});

test('rejects unsupported wardrobe values', () => {
  assert.throws(() => validateAvatarConfig({ outfit: 'unreviewed-costume' }), /Unsupported outfit/);
});

test('rejects arrays and null', () => {
  assert.throws(() => validateAvatarConfig(null), /must be an object/);
  assert.throws(() => validateAvatarConfig([]), /must be an object/);
});
