#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { inspectGlbProfile } from '../src/glb-profile.js';

const args = process.argv.slice(2);
const file = args.find(arg => !arg.startsWith('--'));
const role = args.includes('--garment') ? 'garment' : 'avatar';
const strict = args.includes('--strict');
if (!file || args.includes('--help')) {
  console.log('Usage: node tools/validate-avatar-glb.mjs <file.glb> [--garment] [--strict]');
  process.exit(file ? 0 : 2);
}
try {
  const bytes = await readFile(resolve(file));
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  const profile = inspectGlbProfile(buffer, { role, strict });
  console.log(JSON.stringify({ file, bytes: bytes.byteLength, ...profile }, null, 2));
  if (profile.warnings.length) process.exitCode = 1;
} catch (error) {
  console.error('GLB validation failed: ' + error.message);
  process.exitCode = 1;
}
