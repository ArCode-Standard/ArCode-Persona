import test from 'node:test';
import assert from 'node:assert/strict';
import { inspectGlbProfile } from '../src/glb-profile.js';

function makeGlb(document) {
  const json = new TextEncoder().encode(JSON.stringify(document));
  const padded = Math.ceil(json.length / 4) * 4;
  const buffer = new ArrayBuffer(20 + padded);
  const view = new DataView(buffer);
  view.setUint32(0, 0x46546c67, true);
  view.setUint32(4, 2, true);
  view.setUint32(8, buffer.byteLength, true);
  view.setUint32(12, padded, true);
  view.setUint32(16, 0x4e4f534a, true);
  new Uint8Array(buffer, 20, json.length).set(json);
  new Uint8Array(buffer, 20 + json.length, padded - json.length).fill(0x20);
  return buffer;
}
const valid = {
  asset: { version: '2.0' },
  nodes: [{ mesh: 0, skin: 0 }],
  meshes: [{ primitives: [{ targets: [{ POSITION: 0 }, { POSITION: 1 }] }] }],
  skins: [{ joints: [0, 1, 2, 3] }],
  animations: [{ name: 'Idle' }],
  materials: [{}],
  textures: [{}]
};

test('profiles skinned GLB and reports production gaps', () => {
  const result = inspectGlbProfile(makeGlb(valid));
  assert.equal(result.skinnedMeshCount, 1);
  assert.equal(result.jointCount, 4);
  assert.equal(result.morphTargetCount, 2);
  assert.equal(result.animationNames[0], 'Idle');
  assert.equal(result.warnings.length, 3);
});
test('rejects assets without a skinned mesh', () => {
  assert.throws(() => inspectGlbProfile(makeGlb({ asset: { version: '2.0' }, meshes: [{}] })), /bound to a skin/);
});
test('supports garment role and strict production gate', () => {
  assert.equal(inspectGlbProfile(makeGlb(valid), { role: 'garment' }).role, 'garment');
  assert.throws(() => inspectGlbProfile(makeGlb(valid), { strict: true }), /production target/);
});
test('rejects remote dependencies', () => {
  assert.throws(() => inspectGlbProfile(makeGlb({ ...valid, images: [{ uri: 'https://example.org/texture.png' }] })), /External asset URLs/);
});
