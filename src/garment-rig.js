/**
 * Build a deterministic remap from garment skeleton bone order to avatar skeleton order.
 * Garments must be authored against the avatar's stable bone-name contract.
 */
export function buildBoneRemap(garmentBoneNames, avatarBoneNames) {
  if (!Array.isArray(garmentBoneNames) || !Array.isArray(avatarBoneNames)) {
    throw new TypeError('Bone names must be arrays.');
  }
  const avatarIndices = new Map();
  avatarBoneNames.forEach((name, index) => {
    if (!name || avatarIndices.has(name)) throw new Error('Avatar skeleton contains missing or duplicate bone names.');
    avatarIndices.set(name, index);
  });
  const garmentNames = new Set();
  return garmentBoneNames.map(name => {
    if (!name || garmentNames.has(name)) throw new Error('Garment skeleton contains missing or duplicate bone names.');
    garmentNames.add(name);
    if (!avatarIndices.has(name)) throw new Error('Garment rig is incompatible: avatar is missing bone "' + name + '".');
    return avatarIndices.get(name);
  });
}
