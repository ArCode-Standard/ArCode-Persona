/**
 * Minimal, dependency-free GLB 2.0 preflight validation.
 * Only self-contained GLB files are accepted; remote buffer/image URLs are rejected.
 */
export const MAX_GLB_BYTES = 32 * 1024 * 1024;
const GLB_MAGIC = 0x46546c67;
const JSON_CHUNK = 0x4e4f534a;

export function validateGlbArrayBuffer(buffer) {
  if (!(buffer instanceof ArrayBuffer)) throw new TypeError('GLB input must be an ArrayBuffer.');
  if (buffer.byteLength < 20 || buffer.byteLength > MAX_GLB_BYTES) {
    throw new RangeError('GLB file size is outside the supported range.');
  }

  const view = new DataView(buffer);
  if (view.getUint32(0, true) !== GLB_MAGIC) throw new TypeError('Invalid GLB magic header.');
  if (view.getUint32(4, true) !== 2) throw new TypeError('Only glTF 2.0 binary assets are supported.');
  if (view.getUint32(8, true) !== buffer.byteLength) throw new TypeError('GLB declared length does not match the file size.');

  const chunkLength = view.getUint32(12, true);
  const chunkType = view.getUint32(16, true);
  if (chunkType !== JSON_CHUNK || chunkLength < 2 || 20 + chunkLength > buffer.byteLength) {
    throw new TypeError('GLB JSON chunk is missing or malformed.');
  }

  let document;
  try {
    const jsonBytes = new Uint8Array(buffer, 20, chunkLength);
    document = JSON.parse(new TextDecoder().decode(jsonBytes).replace(/\\u0000+$/g, '').trim());
  } catch {
    throw new TypeError('GLB JSON document is invalid.');
  }

  if (document?.asset?.version !== '2.0') throw new TypeError('GLB asset version must be 2.0.');
  for (const entry of [...(document.buffers ?? []), ...(document.images ?? [])]) {
    if (entry?.uri && !entry.uri.startsWith('data:')) {
      throw new TypeError('External asset URLs are not allowed in imported GLB files.');
    }
  }
  return Object.freeze({ version: document.asset.version, scenes: document.scenes?.length ?? 0 });
}
