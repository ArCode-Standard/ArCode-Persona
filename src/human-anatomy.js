/**
 * Procedural human anatomy foundation for the stylized preview.
 * Creates a coherent underlying body volume and articulated limb landmarks.
 * This is deliberately a base-mesh approximation, not a substitute for a
 * production sculpt, retopology, skinning, or anatomically validated asset.
 */
import * as THREE from 'three';

function ellipsoid(parent, position, scale, material, segments = 24) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, segments, Math.max(12, Math.floor(segments * .7))), material);
  mesh.position.set(...position);
  mesh.scale.set(...scale);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function limb(parent, start, end, radiusStart, radiusEnd, material, depth = 1) {
  const a = new THREE.Vector3(...start);
  const b = new THREE.Vector3(...end);
  const direction = new THREE.Vector3().subVectors(b, a);
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radiusEnd, radiusStart, direction.length(), 20, 1, false),
    material
  );
  mesh.position.copy(a).add(b).multiplyScalar(.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  mesh.scale.z = depth;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

/**
 * Adds an anatomically ordered human volume beneath the clothing layer.
 * Coordinates are normalized around a standing adult reference proportion.
 */
export function buildHumanAnatomy(parent, proportions, skinMaterial) {
  const p = proportions;
  const shoulder = p.shoulderWidth;
  const torso = p.torsoLength;
  const depth = p.bodyDepth;
  const waist = p.waistWidth;
  const hips = p.hipWidth;
  const arms = p.armLength;
  const legs = p.legLength;

  // Thorax, rib cage, abdomen and pelvis establish a continuous torso silhouette.
  ellipsoid(parent, [0, .02, 0], [.39 * shoulder, .43 * torso, .245 * depth], skinMaterial, 32);
  ellipsoid(parent, [0, -.34 * torso, .005], [.32 * waist, .32 * torso, .205 * depth], skinMaterial, 28);
  ellipsoid(parent, [0, -.62 * torso, 0], [.39 * hips, .22 * torso, .235 * depth], skinMaterial, 28);

  // Clavicle/shoulder masses and articulated arms: upper arm, elbow, forearm, wrist, hand.
  for (const side of [-1, 1]) {
    const x = side;
    ellipsoid(parent, [x * .405 * shoulder, .25, 0], [.19 * shoulder, .2, .2 * depth], skinMaterial);
    const shoulderPoint = [x * .49 * shoulder, .19, 0];
    const elbowPoint = [x * .66 * shoulder, -.22 * arms, .005];
    const wristPoint = [x * .68 * shoulder, -.62 * arms, .025];
    const handPoint = [x * .68 * shoulder, -.76 * arms, .055];
    limb(parent, shoulderPoint, elbowPoint, .145, .105, skinMaterial, depth);
    ellipsoid(parent, elbowPoint, [.105, .105, .105], skinMaterial, 20);
    limb(parent, elbowPoint, wristPoint, .105, .065, skinMaterial, depth);
    ellipsoid(parent, wristPoint, [.07, .075, .07], skinMaterial, 18);
    ellipsoid(parent, handPoint, [.085, .12, .045], skinMaterial, 20);
    // Thumb mass gives the hand a recognizable palm orientation.
    ellipsoid(parent, [x * .61 * shoulder, -.72 * arms, .095], [.045, .075, .035], skinMaterial, 16);
  }

  // Legs are separate articulated volumes, so length and hip width remain independent.
  for (const side of [-1, 1]) {
    const hipPoint = [side * .205 * hips, -.69 * torso, 0];
    const kneePoint = [side * .22 * hips, -1.12 * legs, .015];
    const anklePoint = [side * .22 * hips, -1.53 * legs, .025];
    const footPoint = [side * .22 * hips, -1.57 * legs, .13];
    ellipsoid(parent, hipPoint, [.19 * hips, .2, .2 * depth], skinMaterial, 22);
    limb(parent, hipPoint, kneePoint, .17, .115, skinMaterial, depth);
    ellipsoid(parent, kneePoint, [.12, .12, .13], skinMaterial, 20);
    limb(parent, kneePoint, anklePoint, .115, .075, skinMaterial, depth);
    ellipsoid(parent, anklePoint, [.08, .1, .085], skinMaterial, 18);
    ellipsoid(parent, footPoint, [.105, .075, .22], skinMaterial, 20);
  }
}
