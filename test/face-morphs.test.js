import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createFaceSurface, createNoseSurface } from '../src/face-morphs.js';

test('procedural face exposes named, finite facial morph targets', () => {
  const mesh = createFaceSurface({ shape: 'heart', width: 1.12, jawWidth: .9 }, new THREE.MeshStandardMaterial());
  assert.equal(mesh.isMesh, true);
  for (const name of ['faceWidth', 'faceHeight', 'jawWidth', 'cheekboneWidth', 'chinWidth', 'shapeHeart']) {
    assert.ok(Number.isInteger(mesh.morphTargetDictionary[name]), name);
    assert.ok(Number.isFinite(mesh.morphTargetInfluences[mesh.morphTargetDictionary[name]]));
  }
  assert.equal(mesh.morphTargetInfluences[mesh.morphTargetDictionary.shapeHeart], 1);
  assert.ok(Math.abs(mesh.morphTargetInfluences[mesh.morphTargetDictionary.jawWidth] + .1) < 1e-9);
});

test('procedural nose exposes independent bridge, length, width and tip targets', () => {
  const mesh = createNoseSurface({ noseWidth: 1.2, noseLength: .9, noseBridgeHeight: 1.1 }, new THREE.MeshStandardMaterial());
  for (const name of ['noseWidth', 'noseLength', 'noseBridgeHeight', 'noseTip']) {
    assert.ok(Number.isInteger(mesh.morphTargetDictionary[name]), name);
  }
  assert.ok(mesh.morphTargetInfluences[mesh.morphTargetDictionary.noseWidth] > 0);
  assert.ok(mesh.morphTargetInfluences[mesh.morphTargetDictionary.noseLength] < 0);
});
