import test from 'node:test';
import assert from 'node:assert/strict';
import { MAX_GLB_BYTES, validateGlbArrayBuffer } from '../src/avatar-asset.js';

function makeGlb(document) {
  const json = new TextEncoder().encode(JSON.stringify(document));
  const paddedLength = Math.ceil(json.length / 4) * 4;
  const buffer = new ArrayBuffer(20 + paddedLength);
  const view = new DataView(buffer);
  view.setUint32(0, 0x46546c67, true);
  view.setUint32(4, 2, true);
  view.setUint32(8, buffer.byteLength, true);
  view.setUint32(12, paddedLength, true);
  view.setUint32(16, 0x4e4f534a, true);
  new Uint8Array(buffer, 20, json.length).set(json);
  new Uint8Array(buffer, 20 + json.length, paddedLength - json.length).fill(0x20);
  return buffer;
}

test('accepts a valid self-contained glTF 2.0 binary document', () => {
  const result = validateGlbArrayBuffer(makeGlb({ asset: { version: '2.0' }, scenes: [{}] }));
  assert.equal(result.version, '2.0');
  assert.equal(result.scenes, 1);
});

test('rejects non-GLB data and unsupported versions', () => {
  assert.throws(() => validateGlbArrayBuffer(new ArrayBuffer(32)), /magic/);
  assert.throws(() => validateGlbArrayBuffer(makeGlb({ asset: { version: '1.0' } })), /version/);
});

test('rejects remote resource references', () => {
  const glb = makeGlb({ asset: { version: '2.0' }, buffers: [{ uri: 'https://example.com/model.bin' }] });
  assert.throws(() => validateGlbArrayBuffer(glb), /External asset URLs/);
});

test('rejects malformed declared lengths and oversized files', () => {
  const glb = makeGlb({ asset: { version: '2.0' } });
  new DataView(glb).setUint32(8, glb.byteLength + 4, true);
  assert.throws(() => validateGlbArrayBuffer(glb), /declared length/);
  assert.ok(MAX_GLB_BYTES === 32 * 1024 * 1024);
  assert.throws(() => validateGlbArrayBuffer(new ArrayBuffer(MAX_GLB_BYTES + 1)), /size/);
});
