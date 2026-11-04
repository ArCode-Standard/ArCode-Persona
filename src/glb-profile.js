const GLB_MAGIC = 0x46546c67;
const JSON_CHUNK = 0x4e4f534a;
export const PRODUCTION_PROFILE = Object.freeze({ minJoints: 40, minMorphTargets: 20, minAnimations: 3 });

export function inspectGlbProfile(buffer, { role = 'avatar', strict = false } = {}) {
  if (!(buffer instanceof ArrayBuffer)) throw new TypeError('GLB input must be an ArrayBuffer.');
  if (buffer.byteLength < 20) throw new RangeError('GLB file is truncated.');
  const view = new DataView(buffer);
  if (view.getUint32(0, true) !== GLB_MAGIC) throw new TypeError('Invalid GLB magic header.');
  if (view.getUint32(4, true) !== 2) throw new TypeError('Only glTF 2.0 is supported.');
  if (view.getUint32(8, true) !== buffer.byteLength) throw new TypeError('GLB declared length does not match the file size.');
  const chunkLength = view.getUint32(12, true);
  if (view.getUint32(16, true) !== JSON_CHUNK || chunkLength < 2 || 20 + chunkLength > buffer.byteLength) {
    throw new TypeError('GLB JSON chunk is missing or malformed.');
  }
  let gltf;
  try {
    gltf = JSON.parse(new TextDecoder().decode(new Uint8Array(buffer, 20, chunkLength)).replace(/\u0000+$/g, '').trim());
  } catch {
    throw new TypeError('GLB JSON document is invalid.');
  }
  if (gltf?.asset?.version !== '2.0') throw new TypeError('GLB asset version must be 2.0.');
  if (!['avatar', 'garment'].includes(role)) throw new TypeError('Role must be avatar or garment.');
  for (const resource of [...(gltf.buffers ?? []), ...(gltf.images ?? [])]) {
    if (resource?.uri && !resource.uri.startsWith('data:')) throw new TypeError('External asset URLs are not allowed.');
  }
  const nodes = gltf.nodes ?? [];
  const meshes = gltf.meshes ?? [];
  const skins = gltf.skins ?? [];
  const skinnedNodes = nodes.filter(node => Number.isInteger(node.mesh) && Number.isInteger(node.skin));
  const jointIndices = new Set(skinnedNodes.flatMap(node => skins[node.skin]?.joints ?? []));
  const morphNames = new Set();
  let primitiveCount = 0;
  for (const mesh of meshes) {
    for (const primitive of mesh.primitives ?? []) {
      primitiveCount++;
      (primitive.targets ?? []).forEach((target, index) => morphNames.add(mesh.extras?.targetNames?.[index] ?? gltf.extras?.targetNames?.[index] ?? 'target_' + (index + 1)));
    }
  }
  const animationNames = (gltf.animations ?? []).map((clip, index) => clip.name || 'animation_' + (index + 1));
  const profile = {
    role, meshCount: meshes.length, primitiveCount, skinCount: skins.length,
    skinnedMeshCount: skinnedNodes.length,
    jointCount: jointIndices.size || Math.max(0, ...skins.map(skin => skin.joints?.length ?? 0)),
    morphTargetCount: morphNames.size, morphTargetNames: [...morphNames],
    animationCount: animationNames.length, animationNames,
    materialCount: (gltf.materials ?? []).length, textureCount: (gltf.textures ?? []).length, warnings: []
  };
  if (!profile.skinnedMeshCount) throw new Error('The ' + role + ' GLB must contain at least one mesh bound to a skin.');
  if (role === 'avatar' && profile.jointCount < PRODUCTION_PROFILE.minJoints) profile.warnings.push('Rig has ' + profile.jointCount + ' joints; production target is at least ' + PRODUCTION_PROFILE.minJoints + '.');
  if (role === 'avatar' && profile.morphTargetCount < PRODUCTION_PROFILE.minMorphTargets) profile.warnings.push('Only ' + profile.morphTargetCount + ' morph targets found; production target is at least ' + PRODUCTION_PROFILE.minMorphTargets + '.');
  if (role === 'avatar' && profile.animationCount < PRODUCTION_PROFILE.minAnimations) profile.warnings.push('Only ' + profile.animationCount + ' animation clips found; production target is at least ' + PRODUCTION_PROFILE.minAnimations + '.');
  if (strict && profile.warnings.length) throw new Error(profile.warnings.join(' '));
  return Object.freeze({ ...profile, morphTargetNames: Object.freeze(profile.morphTargetNames), animationNames: Object.freeze(profile.animationNames), warnings: Object.freeze(profile.warnings) });
}
