import test from 'node:test';
import assert from 'node:assert/strict';
import { AVATAR_CONFIG_VERSION, DEFAULT_AVATAR_CONFIG, validateAvatarConfig } from '../src/avatar-config.js';

test('default design is versioned and includes anatomy and wardrobe sections', () => {
 const config=validateAvatarConfig(DEFAULT_AVATAR_CONFIG);
 assert.equal(config.schemaVersion,AVATAR_CONFIG_VERSION);
 assert.equal(config.body.shoulderWidth,1);
 assert.equal(config.face.shape,'oval');
 assert.equal(config.clothing.fit,'regular');
});

test('migrates legacy version 1 looks into version 2 without losing appearance',()=>{
 const config=validateAvatarConfig({schemaVersion:1,outfit:'caftan',skin:'#8a3344'});
 assert.equal(config.schemaVersion,2);
 assert.equal(config.outfit,'caftan');
 assert.equal(config.body.height,1);
});

test('normalizes partial nested design sections',()=>{
 const config=validateAvatarConfig({face:{shape:'square',noseWidth:1.2},clothing:{belt:true}});
 assert.equal(config.face.shape,'square');
 assert.equal(config.face.noseWidth,1.2);
 assert.equal(config.face.jawWidth,1);
 assert.equal(config.clothing.belt,true);
});

test('rejects unsupported schema versions and unknown properties',()=>{
 assert.throws(()=>validateAvatarConfig({schemaVersion:99}),/schema version/);
 assert.throws(()=>validateAvatarConfig({admin:true}),/Unknown avatar property/);
 assert.throws(()=>validateAvatarConfig({face:{thirdEye:true}}),/Unknown design property/);
});

test('validates numeric ranges and enumerated face/hair/clothing values',()=>{
 assert.throws(()=>validateAvatarConfig({body:{height:4}}),/body.height/);
 assert.throws(()=>validateAvatarConfig({face:{shape:'triangle'}}),/face.shape/);
 assert.throws(()=>validateAvatarConfig({hairDetails:{part:'diagonal'}}),/hairDetails.part/);
 assert.throws(()=>validateAvatarConfig({clothing:{trimColor:'gold'}}),/trimColor/);
});

test('rejects malformed colors, arrays and null',()=>{
 assert.throws(()=>validateAvatarConfig({skin:'red'}),/Invalid color/);
 assert.throws(()=>validateAvatarConfig(null),/must be an object/);
 assert.throws(()=>validateAvatarConfig([]),/must be an object/);
});

test('does not mutate caller input and freezes normalized sections',()=>{
 const input={face:{jawWidth:1.1}};
 const config=validateAvatarConfig(input);
 assert.equal(input.face.shape,undefined);
 assert.equal(config.face.jawWidth,1.1);
 assert.ok(Object.isFrozen(config.face));
});
