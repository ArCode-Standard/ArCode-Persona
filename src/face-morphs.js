/**
 * Procedural facial surface and nose with real relative morph-target deltas.
 * Morph values are normalized to [-1, 1] around the neutral JSON v2 design.
 */
import * as THREE from 'three';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
function addMorphTargets(geometry, definitions) {
  const base = geometry.getAttribute('position');
  geometry.morphTargetsRelative = true;
  geometry.morphAttributes.position = [];
  geometry.morphAttributes.normal = [];
  const baseNormals = geometry.getAttribute('normal');
  for (const [name, deltaForVertex] of Object.entries(definitions)) {
    const delta = new Float32Array(base.count * 3);
    const vertex = new THREE.Vector3();
    for (let i = 0; i < base.count; i++) {
      vertex.fromBufferAttribute(base, i);
      const change = deltaForVertex(vertex, i);
      delta[i * 3] = change.x;
      delta[i * 3 + 1] = change.y;
      delta[i * 3 + 2] = change.z;
    }
    const attribute = new THREE.Float32BufferAttribute(delta, 3);
    attribute.name = name;
    geometry.morphAttributes.position.push(attribute);

    const deformedPositions = new Float32Array(base.array.length);
    for (let i = 0; i < base.count; i++) {
      deformedPositions[i * 3] = base.getX(i) + delta[i * 3];
      deformedPositions[i * 3 + 1] = base.getY(i) + delta[i * 3 + 1];
      deformedPositions[i * 3 + 2] = base.getZ(i) + delta[i * 3 + 2];
    }
    const deformed = geometry.clone();
    deformed.morphAttributes = {};
    deformed.setAttribute('position', new THREE.Float32BufferAttribute(deformedPositions, 3));
    deformed.computeVertexNormals();
    const changedNormals = deformed.getAttribute('normal');
    const normalDelta = new Float32Array(baseNormals.count * 3);
    for (let i = 0; i < baseNormals.count; i++) {
      normalDelta[i * 3] = changedNormals.getX(i) - baseNormals.getX(i);
      normalDelta[i * 3 + 1] = changedNormals.getY(i) - baseNormals.getY(i);
      normalDelta[i * 3 + 2] = changedNormals.getZ(i) - baseNormals.getZ(i);
    }
    const normalAttribute = new THREE.Float32BufferAttribute(normalDelta, 3);
    normalAttribute.name = name;
    geometry.morphAttributes.normal.push(normalAttribute);
    deformed.dispose();
  }
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}

function faceMask(y, center, width) {
  const distance = Math.abs(y - center) / width;
  return Math.exp(-distance * distance * 2.2);
}

export function createFaceSurface(face = {}, material) {
  const geometry = new THREE.SphereGeometry(1, 56, 40);
  const position = geometry.getAttribute('position');
  const base = new Float32Array(position.array.length);
  for (let i = 0; i < position.count; i++) {
    base[i * 3] = position.getX(i) * .58;
    base[i * 3 + 1] = position.getY(i) * .72;
    base[i * 3 + 2] = position.getZ(i) * .49;
  }
  position.array.set(base);
  position.needsUpdate = true;
  geometry.computeVertexNormals();
  addMorphTargets(geometry, {
    faceWidth: v => new THREE.Vector3(v.x * .38, 0, 0),
    faceHeight: v => new THREE.Vector3(0, v.y * .34, 0),
    jawWidth: v => new THREE.Vector3(v.x * .52 * faceMask(v.y, -.42, .42), 0, 0),
    cheekboneWidth: v => new THREE.Vector3(v.x * .34 * faceMask(v.y, -.06, .22), 0, 0),
    chinWidth: v => new THREE.Vector3(v.x * .46 * faceMask(v.y, -.72, .2), 0, 0),
    shapeRound: v => new THREE.Vector3(v.x * .13 * faceMask(v.y, -.18, .55), -Math.abs(v.y) * .025, 0),
    shapeSquare: v => new THREE.Vector3(v.x * .12 * faceMask(v.y, -.48, .32), 0, 0),
    shapeHeart: v => new THREE.Vector3(v.x * .12 * (faceMask(v.y, .08, .3) - faceMask(v.y, -.55, .3)), 0, 0),
    shapeLong: v => new THREE.Vector3(0, v.y * .16, 0)
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'ProceduralFaceSurface';
  mesh.updateMorphTargets();
  const dictionary = mesh.morphTargetDictionary;
  const values = {
    faceWidth: (face.width ?? 1) - 1,
    faceHeight: (face.height ?? 1) - 1,
    jawWidth: (face.jawWidth ?? 1) - 1,
    cheekboneWidth: (face.cheekboneWidth ?? 1) - 1,
    chinWidth: (face.chinWidth ?? 1) - 1,
    shapeRound: face.shape === 'round' ? 1 : 0,
    shapeSquare: face.shape === 'square' ? 1 : 0,
    shapeHeart: face.shape === 'heart' ? 1 : 0,
    shapeLong: face.shape === 'long' ? 1 : 0
  };
  for (const [name, value] of Object.entries(values)) {
    const index = dictionary[name];
    if (index !== undefined) mesh.morphTargetInfluences[index] = clamp(value, -1, 1);
  }
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export function createNoseSurface(face = {}, material) {
  const geometry = new THREE.SphereGeometry(1, 32, 24);
  const position = geometry.getAttribute('position');
  for (let i = 0; i < position.count; i++) {
    position.setXYZ(i, position.getX(i) * .072, position.getY(i) * .17, position.getZ(i) * .07);
  }
  position.needsUpdate = true;
  geometry.computeVertexNormals();
  addMorphTargets(geometry, {
    noseWidth: v => new THREE.Vector3(v.x * .48, 0, 0),
    noseLength: v => new THREE.Vector3(0, v.y * .38, 0),
    noseBridgeHeight: v => new THREE.Vector3(0, 0, v.z * .34 * faceMask(v.y, .35, .7)),
    noseTip: v => new THREE.Vector3(v.x * .12 * faceMask(v.y, -.65, .3), 0, v.z * .2 * faceMask(v.y, -.65, .3))
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'ProceduralNose';
  mesh.position.set(0, -.075, .49);
  mesh.updateMorphTargets();
  const values = {
    noseWidth: (face.noseWidth ?? 1) - 1,
    noseLength: (face.noseLength ?? 1) - 1,
    noseBridgeHeight: (face.noseBridgeHeight ?? 1) - 1,
    noseTip: (face.noseTip ?? 1) - 1
  };
  for (const [name, value] of Object.entries(values)) {
    const index = mesh.morphTargetDictionary[name];
    if (index !== undefined) mesh.morphTargetInfluences[index] = clamp(value, -1, 1);
  }
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}
