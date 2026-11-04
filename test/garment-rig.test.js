import test from 'node:test';
import assert from 'node:assert/strict';
import { buildBoneRemap } from '../src/garment-rig.js';

test('maps garment bone order to the avatar skeleton by stable names', () => {
  assert.deepEqual(buildBoneRemap(['Spine', 'Hips', 'Head'], ['Hips', 'Spine', 'Head']), [1, 0, 2]);
});
test('rejects garment bones absent from the avatar rig', () => {
  assert.throws(() => buildBoneRemap(['Hips', 'HoodJoint'], ['Hips', 'Spine']), /missing bone/);
});
test('rejects duplicate names that make retargeting ambiguous', () => {
  assert.throws(() => buildBoneRemap(['Hips'], ['Hips', 'Hips']), /duplicate/);
  assert.throws(() => buildBoneRemap(['Hips', 'Hips'], ['Hips']), /duplicate/);
});
