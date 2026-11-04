import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { buildHumanAnatomy } from '../src/human-anatomy.js';

test('human anatomy creates a full articulated body volume', () => {
  const root = new THREE.Group();
  buildHumanAnatomy(root, { shoulderWidth: 1, torsoLength: 1, bodyDepth: 1, waistWidth: 1, hipWidth: 1, armLength: 1, legLength: 1 }, new THREE.MeshStandardMaterial());
  assert.ok(root.children.length >= 25);
  assert.ok(root.children.every((part) => part.isMesh && part.geometry && part.material));
  assert.ok(root.children.some((part) => part.position.y < -1.4));
});

test('shoulder proportion changes anatomy geometry', () => {
  const make = (shoulderWidth) => {
    const root = new THREE.Group();
    buildHumanAnatomy(root, { shoulderWidth, torsoLength: 1, bodyDepth: 1, waistWidth: 1, hipWidth: 1, armLength: 1, legLength: 1 }, new THREE.MeshStandardMaterial());
    return root.children[0].scale.x;
  };
  assert.ok(make(1.2) > make(0.8));
});
