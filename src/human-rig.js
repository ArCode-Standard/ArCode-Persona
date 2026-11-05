/**
 * Stable humanoid skeleton. Bone positions align with the procedural anatomy landmarks.
 * Mesh binding is performed by human-anatomy.js using normalized two-bone skin weights.
 */
import * as THREE from 'three';
import { solveHumanProportions } from './human-proportions.js';

export function buildHumanRig(body = {}) {
  const p = solveHumanProportions(body), l = p.landmarks;
  const root = new THREE.Group();
  root.name = 'ArCodeHumanRig';
  const bones = {};
  const make = (name, parent, position) => {
    const bone = new THREE.Bone();
    bone.name = name;
    bone.position.set(...position);
    parent.add(bone);
    bones[name] = bone;
    return bone;
  };

  const pelvis = make('Hips', root, [0, l.pelvisY, 0]);
  const spine = make('Spine', pelvis, [0, .32 * p.torsoLength, 0]);
  const chest = make('Chest', spine, [0, .35 * p.torsoLength, 0]);
  const upperChest = make('UpperChest', chest, [0, .18 * p.torsoLength, 0]);
  const neck = make('Neck', upperChest, [0, .30 * p.neckLength, 0]);
  make('Head', neck, [0, .45 * p.headScale, 0]);

  for (const side of [-1, 1]) {
    const suffix = side < 0 ? 'L' : 'R';
    const clavicle = make('Clavicle' + suffix, upperChest, [side * l.shoulderHalf, -.04, 0]);
    const upperArm = make('UpperArm' + suffix, clavicle, [side * .04 * p.shoulderWidth, 0, 0]);
    const forearm = make('Forearm' + suffix, upperArm, [side * .15 * p.shoulderWidth, -.42 * p.armLength, 0]);
    const hand = make('Hand' + suffix, forearm, [side * .02 * p.shoulderWidth, -.4 * p.armLength, .01]);
    make('Thumb' + suffix, hand, [side * .055, -.025, .035]);
    for (let finger = 0; finger < 4; finger++) {
      make(['Index', 'Middle', 'Ring', 'Pinky'][finger] + suffix, hand,
        [side * (finger - 1.5) * .025, -.09, .02]);
    }
    const thigh = make('UpperLeg' + suffix, pelvis, [side * l.hipHalf, -.04, 0]);
    const calf = make('LowerLeg' + suffix, thigh, [side * .015 * p.hipWidth, -.43 * p.legLength, 0]);
    const foot = make('Foot' + suffix, calf, [0, -.41 * p.legLength, .02]);
    make('Toe' + suffix, foot, [0, -.015, .13]);
  }

  root.updateMatrixWorld(true);
  return { root, bones, proportions: p, skeleton: null };
}
