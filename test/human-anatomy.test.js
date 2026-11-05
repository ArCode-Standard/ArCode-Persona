import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { buildHumanAnatomy } from '../src/human-anatomy.js';
import { solveHumanProportions } from '../src/human-proportions.js';
import { buildHumanRig } from '../src/human-rig.js';
import { COLOR_PALETTES, applyColorPalette, createSkinMaterial } from '../src/color-system.js';

const body = { shoulderWidth: 1, torsoLength: 1, bodyDepth: 1, waistWidth: 1, hipWidth: 1, armLength: 1, legLength: 1, neckLength: 1, headScale: 1 };

test('proportion solver produces stable anatomical landmarks', () => {
  const p = solveHumanProportions({ ...body, legLength: 1.1, shoulderWidth: 1.2 });
  assert.ok(p.landmarks.kneeY < p.landmarks.hipY);
  assert.ok(p.landmarks.ankleY < p.landmarks.kneeY);
  assert.ok(p.landmarks.shoulderHalf > .4);
});

test('procedural anatomy builds lofted torso and articulated limb meshes', () => {
  const root = new THREE.Group();
  buildHumanAnatomy(root, body, new THREE.MeshStandardMaterial());
  assert.ok(root.children.length >= 15);
  assert.ok(root.children.some(mesh => mesh.geometry.index && mesh.geometry.attributes.position.count > 300));
  assert.ok(root.children.every(mesh => mesh.isMesh && mesh.geometry && mesh.material));
});

test('skinned anatomy binds every generated body part to normalized bone weights', () => {
  const root = new THREE.Group();
  const rig = buildHumanRig(body);
  root.add(rig.root);
  const result = buildHumanAnatomy(root, body, new THREE.MeshStandardMaterial(), rig);
  const meshes = root.children.filter(child => child.isSkinnedMesh);
  assert.ok(result.skeleton?.isSkeleton);
  assert.ok(meshes.length >= 20);
  for (const mesh of meshes) {
    const indices = mesh.geometry.getAttribute('skinIndex');
    const weights = mesh.geometry.getAttribute('skinWeight');
    assert.ok(indices && weights, mesh.name);
    for (let i = 0; i < weights.count; i++) {
      const sum = weights.getX(i) + weights.getY(i) + weights.getZ(i) + weights.getW(i);
      assert.ok(Math.abs(sum - 1) < 1e-5, mesh.name + ' weights must normalize');
    }
  }
});

test('humanoid rig exposes aligned standard bones and both sides', () => {
  const rig = buildHumanRig(body);
  for (const name of ['Hips', 'Spine', 'Chest', 'UpperChest', 'Neck', 'Head', 'UpperArmL', 'ForearmR', 'HandL', 'UpperLegR', 'LowerLegL', 'FootR', 'ToeL']) {
    assert.ok(rig.bones[name], name);
  }
  const head = rig.bones.Head.getWorldPosition(new THREE.Vector3());
  assert.ok(head.y > .8 && head.y < 1.2);
});

test('color palette application preserves independent skin tone', () => {
  const state = { skin: '#b97850', cloth: '#fff', hair: '#fff', eyes: '#fff', clothing: { trimColor: '#fff' } };
  applyColorPalette(state, 'atlas');
  assert.equal(state.skin, '#b97850');
  assert.equal(state.cloth, COLOR_PALETTES.atlas.cloth);
  assert.ok(createSkinMaterial('#b97850').isMeshPhysicalMaterial);
});
