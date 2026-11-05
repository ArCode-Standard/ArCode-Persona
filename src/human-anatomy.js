/**
 * Procedural humanoid anatomy with optional full skeletal skinning.
 * Geometry remains renderer-native Three.js and uses the stable humanoid bone contract.
 */
import * as THREE from 'three';
import { solveHumanProportions } from './human-proportions.js';

function getSkeleton(rig) {
  if (!rig?.bones) return null;
  if (!rig.skeleton) {
    rig.root.updateMatrixWorld(true);
    rig.skeleton = new THREE.Skeleton(Object.values(rig.bones));
    rig.skeleton.calculateInverses();
  }
  return rig.skeleton;
}

function attachMesh(parent, geometry, material, transform = {}, rig = null, candidates = []) {
  const skeleton = getSkeleton(rig);
  const mesh = skeleton ? new THREE.SkinnedMesh(geometry, material) : new THREE.Mesh(geometry, material);
  mesh.name = transform.name || 'AnatomyPart';
  mesh.position.set(...(transform.position || [0, 0, 0]));
  mesh.quaternion.copy(transform.quaternion || new THREE.Quaternion());
  mesh.scale.set(...(transform.scale || [1, 1, 1]));
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  mesh.updateMatrix();
  if (skeleton) {
    parent.updateMatrixWorld(true);
    const bonePoints = candidates.map(name => {
      const bone = rig.bones[name];
      if (!bone) throw new Error('Humanoid rig is missing required bone: ' + name);
      const world = bone.getWorldPosition(new THREE.Vector3());
      return { name, index: skeleton.bones.indexOf(bone), point: parent.worldToLocal(world) };
    });
    const positions = geometry.getAttribute('position');
    const indices = new Uint16Array(positions.count * 4);
    const weights = new Float32Array(positions.count * 4);
    const local = new THREE.Vector3();
    for (let i = 0; i < positions.count; i++) {
      local.fromBufferAttribute(positions, i).applyMatrix4(mesh.matrix);
      const nearest = bonePoints
        .map(bone => ({ ...bone, distance: local.distanceTo(bone.point) }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, Math.min(2, bonePoints.length));
      const inverse = nearest.map(item => 1 / Math.max(item.distance, 0.025));
      const total = inverse.reduce((sum, value) => sum + value, 0);
      nearest.forEach((item, slot) => {
        indices[i * 4 + slot] = item.index;
        weights[i * 4 + slot] = inverse[slot] / total;
      });
    }
    geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(indices, 4));
    geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(weights, 4));
    mesh.bind(skeleton, mesh.matrixWorld);
  }
  return mesh;
}

function loftY(parent, rings, material, segments, rig) {
  const positions = [], indices = [];
  for (const ring of rings) {
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      positions.push(Math.cos(angle) * ring.rx, ring.y, Math.sin(angle) * ring.rz);
    }
  }
  const row = segments + 1;
  for (let j = 0; j < rings.length - 1; j++) {
    for (let i = 0; i < segments; i++) {
      const a = j * row + i, b = a + row;
      indices.push(a, a + 1, b, b, a + 1, b + 1);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return attachMesh(parent, geometry, material, { name: 'TorsoSkin' }, rig,
    ['Hips', 'Spine', 'Chest', 'UpperChest', 'Neck']);
}

function ellipsoid(parent, position, scale, material, rig, candidates, name, segments = 24) {
  const geometry = new THREE.SphereGeometry(1, segments, Math.max(12, Math.floor(segments * 0.7)));
  return attachMesh(parent, geometry, material, { name, position, scale }, rig, candidates);
}

function taperedLimb(parent, start, end, r0, r1, material, depth, rig, candidates, name) {
  const a = new THREE.Vector3(...start), b = new THREE.Vector3(...end);
  const axis = new THREE.Vector3().subVectors(b, a);
  const geometry = new THREE.CylinderGeometry(r1, r0, axis.length(), 24, 8, false);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), axis.clone().normalize());
  return attachMesh(parent, geometry, material, {
    name, position: a.clone().add(b).multiplyScalar(0.5).toArray(),
    quaternion, scale: [1, 1, depth]
  }, rig, candidates);
}

export function buildHumanAnatomy(parent, proportions = {}, skinMaterial, rig = null) {
  parent.updateWorldMatrix(true, false);
  if (rig?.root) rig.root.updateMatrixWorld(true);
  const p = solveHumanProportions(proportions);
  const l = p.landmarks;
  const sx = p.shoulderWidth, dx = p.bodyDepth, wx = p.waistWidth, hx = p.hipWidth, tl = p.torsoLength;
  const upper = side => side < 0 ? 'L' : 'R';
  const torsoRings = [
    { y: .34 * tl, rx: .245 * sx, rz: .145 * dx },
    { y: .25 * tl, rx: .36 * sx, rz: .205 * dx },
    { y: .12 * tl, rx: .39 * sx, rz: .235 * dx },
    { y: -.08 * tl, rx: .355 * sx, rz: .22 * dx },
    { y: -.28 * tl, rx: .30 * wx, rz: .195 * dx },
    { y: -.43 * tl, rx: .325 * wx, rz: .205 * dx },
    { y: -.56 * tl, rx: .38 * hx, rz: .225 * dx },
    { y: -.69 * tl, rx: .37 * hx, rz: .22 * dx },
    { y: -.78 * tl, rx: .25 * hx, rz: .17 * dx }
  ];
  loftY(parent, torsoRings, skinMaterial, 48, rig);

  if (rig) {
    taperedLimb(parent, [0, .23, 0], [0, .55 * p.neckLength, 0], .125, .105,
      skinMaterial, dx, rig, ['UpperChest', 'Neck'], 'NeckSkin');
  }

  for (const side of [-1, 1]) {
    const suffix = upper(side);
    ellipsoid(parent, [side * .205 * sx, .13 * tl, .17 * dx], [.19 * sx, .16 * tl, .09 * dx],
      skinMaterial, rig, ['Chest', 'UpperChest', 'Clavicle' + suffix], 'Pectoral' + suffix, 28);
    ellipsoid(parent, [side * .405 * sx, .19 * tl, 0], [.17 * sx, .18, .18 * dx],
      skinMaterial, rig, ['UpperChest', 'Clavicle' + suffix, 'UpperArm' + suffix], 'Shoulder' + suffix, 24);
    const shoulder = [side * .49 * sx, l.shoulderY, 0];
    const elbow = [side * .62 * sx, l.elbowY, .005];
    const wrist = [side * .66 * sx, l.wristY, .025];
    taperedLimb(parent, shoulder, elbow, .125, .09, skinMaterial, dx, rig,
      ['Clavicle' + suffix, 'UpperArm' + suffix], 'UpperArmSkin' + suffix);
    ellipsoid(parent, elbow, [.092, .095, .09], skinMaterial, rig,
      ['UpperArm' + suffix, 'Forearm' + suffix], 'Elbow' + suffix, 20);
    taperedLimb(parent, elbow, wrist, .09, .055, skinMaterial, dx, rig,
      ['Forearm' + suffix, 'Hand' + suffix], 'ForearmSkin' + suffix);
    ellipsoid(parent, wrist, [.061, .065, .055], skinMaterial, rig,
      ['Forearm' + suffix, 'Hand' + suffix], 'Wrist' + suffix, 18);
    ellipsoid(parent, [wrist[0], wrist[1] - .105 * p.armLength, .06], [.078, .115, .038],
      skinMaterial, rig, ['Hand' + suffix, 'Thumb' + suffix], 'Palm' + suffix, 22);
    ellipsoid(parent, [side * (.66 * sx - .045), wrist[1] - .075 * p.armLength, .09], [.035, .065, .03],
      skinMaterial, rig, ['Hand' + suffix, 'Thumb' + suffix], 'ThumbBase' + suffix, 16);
    for (let finger = 0; finger < 4; finger++) {
      const x = side * (.66 * sx - .045 + (finger - 1.5) * .027);
      ellipsoid(parent, [x, wrist[1] - .205 * p.armLength, .09], [.014, .075, .014],
        skinMaterial, rig, ['Hand' + suffix, ['Index', 'Middle', 'Ring', 'Pinky'][finger] + suffix],
        ['Index', 'Middle', 'Ring', 'Pinky'][finger] + 'Skin' + suffix, 12);
    }
  }

  for (const side of [-1, 1]) {
    const suffix = upper(side);
    const hip = [side * l.hipHalf, l.hipY, 0];
    const knee = [side * l.hipHalf * 1.04, l.kneeY, .012];
    const ankle = [side * l.hipHalf * 1.04, l.ankleY, .018];
    ellipsoid(parent, hip, [.17 * hx, .18 * tl, .18 * dx], skinMaterial, rig,
      ['Hips', 'UpperLeg' + suffix], 'Hip' + suffix, 24);
    taperedLimb(parent, hip, knee, .155 * hx, .105, skinMaterial, dx, rig,
      ['Hips', 'UpperLeg' + suffix], 'ThighSkin' + suffix);
    ellipsoid(parent, knee, [.105, .11, .115], skinMaterial, rig,
      ['UpperLeg' + suffix, 'LowerLeg' + suffix], 'Knee' + suffix, 20);
    taperedLimb(parent, knee, ankle, .105, .065, skinMaterial, dx, rig,
      ['LowerLeg' + suffix, 'Foot' + suffix], 'CalfSkin' + suffix);
    ellipsoid(parent, ankle, [.068, .085, .075], skinMaterial, rig,
      ['LowerLeg' + suffix, 'Foot' + suffix], 'Ankle' + suffix, 18);
    ellipsoid(parent, [ankle[0], ankle[1] - .025, .13], [.09, .065, .19], skinMaterial, rig,
      ['Foot' + suffix, 'Toe' + suffix], 'FootSkin' + suffix, 22);
  }

  return { proportions: p, skeleton: rig?.skeleton || null };
}
