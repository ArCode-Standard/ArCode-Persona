import * as THREE from 'three';
import { DEFAULT_AVATAR_CONFIG, validateAvatarConfig } from './src/avatar-config.js';
import { CHARACTER_CATALOG, getCharacterPreset, validateCharacterDocument, createCharacterDocument } from './src/character-library.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { validateGlbArrayBuffer, MAX_GLB_BYTES } from './src/avatar-asset.js';
import { buildBoneRemap } from './src/garment-rig.js';

const wrap=document.getElementById('canvasWrap');
const scene=new THREE.Scene();
scene.background=null;
const camera=new THREE.PerspectiveCamera(34,1,.1,100);
camera.position.set(0,1.45,7.6);
let renderer;
let renderAvailable=true;
try {
 renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));
 renderer.shadowMap.enabled=true;
 renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.15;
} catch(error) {
 console.error('WebGL initialization failed:',error);
 renderAvailable=false;
 const fallback=document.createElement('div');
 fallback.className='webgl-fallback';
 fallback.textContent='المعاينة ثلاثية الأبعاد غير متاحة في هذا المتصفح أو على هذا الجهاز. يمكنك تعديل الإطلالة وتصديرها، أو تفعيل WebGL ثم إعادة تحميل الصفحة.';
 fallback.setAttribute('role','status');
 wrap.appendChild(fallback);
 renderer={domElement:document.createElement('canvas'),shadowMap:{},setPixelRatio(){},setSize(){},render(){},dispose(){}};
}
wrap.appendChild(renderer.domElement);
const hemi=new THREE.HemisphereLight(0xe3f4df,0x344238,2.2);scene.add(hemi);
const key=new THREE.DirectionalLight(0xffe6c4,3.2);key.position.set(-3,5,5);key.castShadow=true;scene.add(key);
const rim=new THREE.DirectionalLight(0x9bc9b5,2.3);rim.position.set(3,3,-4);scene.add(rim);
const floor=new THREE.Mesh(new THREE.CircleGeometry(2.25,64),new THREE.MeshBasicMaterial({color:0x9cb79a,transparent:true,opacity:.08}));floor.rotation.x=-Math.PI/2;floor.position.y=-1.43;scene.add(floor);
const model=new THREE.Group();scene.add(model);
const state={...DEFAULT_AVATAR_CONFIG};
const STORAGE_KEY='arcode-persona:look:v1';
const importedRoot=new THREE.Group();
scene.add(importedRoot);
let importedAvatar=null;
let importedGarment=null;
let importedMixer=null;
let importedActions=[];
let activeAnimationIndex=-1;
let morphBindings=new Map();
const mat=(color,roughness=.72,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
const skinMat=()=>mat(state.skin);
const sphere=(parent,x,y,z,sx,sy,sz,material,segments=32)=>{const m=new THREE.Mesh(new THREE.SphereGeometry(1,segments,segments),material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m};
const cylinder=(parent,rt,rb,h,x,y,z,material,segments=48)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,segments,1),material);m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m};
let faceParts={};
function curve(parent,points,material,r=.018){const path=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));const mesh=new THREE.Mesh(new THREE.TubeGeometry(path,24,r,8,false),material);parent.add(mesh);return mesh}
function build(){
 while(model.children.length) {const o=model.children[0];model.remove(o);o.traverse(n=>{n.geometry?.dispose();if(n.material){for(const material of (Array.isArray(n.material)?n.material:[n.material])) material.dispose()}})}
 const skin=skinMat(),hair=mat(state.hair),cloth=mat(state.cloth,.58),gold=mat('#c7a45e',.34,.68),dark=mat('#251e1a'),white=mat('#f5eee1'),eye=mat(state.eyes,.3);
 const torso=new THREE.Group();model.add(torso);
 // Robe / outfit silhouette
 if(state.outfit==='modern'){
  cylinder(torso,.49,.63,1.13,0,-.42,0,cloth);
  sphere(torso,0,.13,0,.48,.34,.29,cloth);
  cylinder(torso,.18,.2,.24,0,.28,0,skin);
 }else{
  cylinder(torso,.42,.62,1.48,0,-.48,0,cloth);
  sphere(torso,0,.16,0,.47,.34,.31,cloth);
  cylinder(torso,.17,.19,.22,0,.31,0,skin);
  // embroidered front line and neckline
  curve(torso,[[0,.2,.315],[0,-.15,.38],[0,-.65,.53],[0,-1.15,.55]],gold,.014);
  curve(torso,[[-.13,.28,.27],[0,.17,.34],[.13,.28,.27]],gold,.012);
  for(let y=-.05;y>-.95;y-=.18){sphere(torso,0,y,.39,.025,.025,.012,gold,12)}
  if(state.outfit==='takchita'){cylinder(torso,.5,.68,1.55,0,-.48,-.015,mat('#d8c7a0',.45),48).material.transparent=true;torso.children[torso.children.length-1].material.opacity=.22}
  if(state.outfit==='caftan'){curve(torso,[[-.34,.15,.23],[-.25,-.2,.33],[0,-.8,.57],[.25,-.2,.33],[.34,.15,.23]],gold,.018)}
  if(state.outfit==='djellaba'){const hood=sphere(torso,0,.49,-.18,.36,.25,.22,cloth);hood.visible=state.headwear==='hood'}
 }
 // arms
 for(const side of [-1,1]){
  const arm=sphere(torso,side*.58,-.35,0,.17,.57,.17,cloth);arm.rotation.z=side*-.12;
  sphere(torso,side*.59,-.92,.015,.14,.15,.14,skin);
  sphere(torso,side*.59,-1.12,.015,.17,.17,.22,cloth);
 }
 // neck and head
 cylinder(model,.17,.18,.28,0,.52,0,skin);
 const head=new THREE.Group();head.position.set(0,1.12,0);model.add(head);
 sphere(head,0,0,0,.58,.72,.49,skin,48);
 // ears
 for(const s of [-1,1])sphere(head,s*.57,-.02,0,.11,.17,.09,skin);
 // hair cap / styles
 if(state.hairStyle!=='shaved'){
  sphere(head,0,.49,-.02,.59,.28,.5,hair);
  if(state.hairStyle==='short')sphere(head,0,.37,.29,.48,.15,.22,hair);
  if(state.hairStyle==='curly'){for(let i=0;i<17;i++){const a=i/17*Math.PI*2;sphere(head,Math.cos(a)*.48,.45+Math.sin(i*2.1)*.055,Math.sin(a)*.4,.14,.15,.14,hair,16)}}
  if(state.hairStyle==='long'){for(const s of [-1,1])sphere(head,s*.49,-.1,-.05,.13,.57,.18,hair)}
 }
 // brows and eyes
 faceParts={eyes:[],mouth:null};
 for(const s of [-1,1]){
  curve(head,[[s*.12,.18,.425],[s*.23,.22,.45],[s*.34,.18,.41]],hair,.025);
  sphere(head,s*.235,.035,.438,.095,.075,.035,white);
  faceParts.eyes.push(sphere(head,s*.235,.035,.472,.038,.045,.018,eye,20));
  sphere(head,s*.235,.035,.488,.016,.02,.009,dark,16);
 }
 sphere(head,0,-.08,.47,.07,.14,.075,skin);
 faceParts.mouth=curve(head,[[-.14,-.29,.43],[0,-.34,.47],[.14,-.29,.43]],mat('#6b302d'),.018);
 if(state.expression==='neutral'){faceParts.mouth.scale.y=.45}
 if(state.expression==='surprised'){faceParts.mouth.scale.set(.55,1.8,1)}
 // headwear
 if(state.headwear==='fez'){
  cylinder(head,.24,.27,.42,0,.72,0,mat('#8c3432'),32);
  cylinder(head,.3,.3,.055,0,.51,0,gold,32);
  curve(head,[[.05,.93,.05],[.17,1.03,.05],[.23,1.06,.05]],dark,.012);
 }else if(state.headwear==='hood'){
  sphere(head,0,.52,-.13,.58,.35,.46,cloth);
 }
 // accessories
 if(state.accessory==='glasses'){
  const frame=mat('#252a27',.3,.45);
  for(const s of [-1,1]){const ring=new THREE.Mesh(new THREE.TorusGeometry(.115,.018,8,32),frame);ring.position.set(s*.235,.035,.48);head.add(ring)}
  curve(head,[[-.12,.04,.49],[0,.07,.5],[.12,.04,.49]],frame,.014);
 }else if(state.accessory==='earring'){
  for(const s of [-1,1]){const ring=new THREE.Mesh(new THREE.TorusGeometry(.07,.012,8,24),gold);ring.position.set(s*.59,-.16,.04);head.add(ring)}
 }else if(state.accessory==='scarf'){
  const scarf=sphere(torso,0,.25,.27,.48,.12,.12,mat('#c6a15f'));scarf.rotation.z=-.08;
 }
 // subtle ground contact
 const shadow=new THREE.Mesh(new THREE.CircleGeometry(.62,48),new THREE.MeshBasicMaterial({color:0x07110e,transparent:true,opacity:.34}));shadow.rotation.x=-Math.PI/2;shadow.position.y=-1.42;model.add(shadow);
}
build();
function resize(){const w=wrap.clientWidth,h=wrap.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
if('ResizeObserver' in window) new ResizeObserver(resize).observe(wrap); else window.addEventListener('resize',resize);resize();
let dragging=false,lastX=0,rotation=0,auto=true,zoom=7.6,clock=new THREE.Clock();
renderer.domElement.addEventListener('pointerdown',e=>{if(e.button!==0)return;dragging=true;lastX=e.clientX;renderer.domElement.setPointerCapture(e.pointerId)});
renderer.domElement.addEventListener('pointermove',e=>{if(!dragging)return;rotation+=(e.clientX-lastX)*.009;lastX=e.clientX});
renderer.domElement.addEventListener('pointerup',()=>dragging=false);
renderer.domElement.addEventListener('pointercancel',()=>dragging=false);
renderer.domElement.addEventListener('lostpointercapture',()=>dragging=false);
renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();zoom=THREE.MathUtils.clamp(zoom+e.deltaY*.004,5.4,10);camera.position.z=zoom},{passive:false});
function animate(){requestAnimationFrame(animate);const delta=clock.getDelta();const t=clock.elapsedTime;if(importedMixer)importedMixer.update(delta);if(auto&&!dragging)rotation+=.0025;model.rotation.y=rotation;model.position.y=Math.sin(t*1.5)*.025;model.rotation.z=Math.sin(t*.8)*.012;importedRoot.rotation.y=rotation;importedRoot.position.y=model.position.y;renderer.render(scene,camera)}
animate();
document.getElementById('loading').classList.add('hidden');
function update(){build();persistLook()}
function persistLook(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(validateAvatarConfig(state)))}catch(error){console.warn('Unable to save persona locally:',error)}}
function restoreLook(input){try{const document=validateCharacterDocument(input);Object.assign(state,document.config);const selector=document.getElementById('characterPreset');if(selector)selector.value=document.profile?.id||'';syncControls();update();toast(document.profile?'تم استيراد ملف الشخصية':'تمت استعادة الإطلالة')}catch(error){toast('ملف الشخصية غير صالح أو غير مدعوم');console.error(error)}}
function syncControls(){
 const keys={skin:'skinOptions',hair:'hairOptions',cloth:'clothOptions'};
 for(const [key,id] of Object.entries(keys))document.querySelectorAll(`#${id} .swatch`).forEach(b=>b.classList.toggle('selected',b.dataset.value===state[key]));
 document.querySelectorAll('#outfitOptions .choice').forEach(b=>b.classList.toggle('selected',b.dataset.value===state.outfit));
 for(const id of ['hairStyle','expression','headwear','eyes','accessory'])document.getElementById(id).value=state[id];
}
function bindSwatches(id,key){document.querySelectorAll('#'+id+' .swatch').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('#'+id+' .swatch').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');state[key]=b.dataset.value;update()}))}
bindSwatches('skinOptions','skin');bindSwatches('hairOptions','hair');bindSwatches('clothOptions','cloth');
[['hairStyle','hairStyle'],['expression','expression'],['headwear','headwear'],['eyes','eyes'],['accessory','accessory']].forEach(([id,key])=>document.getElementById(id).addEventListener('change',e=>{state[key]=e.target.value;update()}));
document.querySelectorAll('#outfitOptions .choice').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('#outfitOptions .choice').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');state.outfit=b.dataset.value;update()}));
document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.tab,.tab-content').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.getElementById(b.dataset.tab).classList.add('active')}));
document.getElementById('rotate').addEventListener('click',e=>{auto=!auto;e.currentTarget.classList.toggle('active',auto);e.currentTarget.innerHTML=auto?'<span>⟳</span> دوران تلقائي':'<span>Ⅱ</span> إيقاف الدوران'});
document.getElementById('frontView').addEventListener('click',()=>{rotation=0;auto=false;document.getElementById('rotate').classList.remove('active')});
document.getElementById('resetView').addEventListener('click',()=>{rotation=0;zoom=7.6;camera.position.z=zoom});

const garmentFileInput=document.getElementById('garmentAssetFile');
document.getElementById('importGarmentAsset').addEventListener('click',()=>garmentFileInput.click());
document.getElementById('removeGarmentAsset').addEventListener('click',()=>{clearImportedGarment();toast('تمت إزالة قطعة الملابس')});
garmentFileInput.addEventListener('change',async()=>{
 const file=garmentFileInput.files?.[0];
 if(!file)return;
 try{await importGarmentAsset(file)}catch(error){console.error('Garment import failed:',error);toast(error.message||'تعذر استيراد قطعة الملابس')}finally{garmentFileInput.value=''}
});
const avatarFileInput=document.getElementById('avatarAssetFile');
document.getElementById('importAvatarAsset').addEventListener('click',()=>avatarFileInput.click());
document.getElementById('removeAvatarAsset').addEventListener('click',removeAvatarAsset);
avatarFileInput.addEventListener('change',async()=>{
 const file=avatarFileInput.files?.[0];
 if(!file)return;
 try{await importAvatarAsset(file)}catch(error){console.error('GLB import failed:',error);toast(error.message||'تعذر استيراد نموذج GLB')}finally{avatarFileInput.value=''}
});
const animationSelect=document.getElementById('avatarAnimation');
const animationToggle=document.getElementById('toggleAvatarAnimation');
animationSelect.addEventListener('change',()=>playAvatarAnimation(Number(animationSelect.value)));
animationToggle.addEventListener('click',toggleAvatarAnimation);
function playAvatarAnimation(index){
 if(!importedMixer||!importedActions.length||!Number.isInteger(index)||index<0||index>=importedActions.length)return;
 importedActions.forEach(action=>action.stop());
 activeAnimationIndex=index;
 importedActions[index].reset().fadeIn(.2).play();
 animationToggle.disabled=false;
 animationToggle.textContent='إيقاف الحركة';
 animationToggle.setAttribute('aria-pressed','true');
}
function toggleAvatarAnimation(){
 if(!importedMixer||activeAnimationIndex<0)return;
 const action=importedActions[activeAnimationIndex];
 if(action.isRunning()){
  action.paused=true;
  animationToggle.textContent='تشغيل الحركة';
  animationToggle.setAttribute('aria-pressed','true');
 }else{
  action.paused=false;
  action.play();
  animationToggle.textContent='إيقاف الحركة';
  animationToggle.setAttribute('aria-pressed','false');
 }
}
function clearMorphControls(){
 morphBindings.clear();
 const container=document.getElementById('morphControls');
 container.replaceChildren();
 document.getElementById('morphEditor').hidden=true;
}
const MORPH_LABELS={
 jawOpen:'فتح الفك',mouthSmileLeft:'ابتسامة يسار',mouthSmileRight:'ابتسامة يمين',
 eyeBlinkLeft:'إغلاق العين اليسرى',eyeBlinkRight:'إغلاق العين اليمنى',
 browInnerUp:'رفع الحاجبين',browDownLeft:'خفض الحاجب الأيسر',browDownRight:'خفض الحاجب الأيمن',
 mouthFunnel:'تدوير الشفاه',mouthPucker:'ضم الشفاه',mouthFrownLeft:'عبوس يسار',mouthFrownRight:'عبوس يمين',
 cheekSquintLeft:'رفع الخدين',cheekSquintRight:'رفع الخدين'
};
function buildMorphControls(root){
 clearMorphControls();
 root.traverse(mesh=>{
  if(!mesh.isMesh||!mesh.morphTargetDictionary||!mesh.morphTargetInfluences)return;
  for(const [name,index] of Object.entries(mesh.morphTargetDictionary)){
   if(!morphBindings.has(name))morphBindings.set(name,[]);
   morphBindings.get(name).push({mesh,index});
  }
 });
 const container=document.getElementById('morphControls');
 [...morphBindings.entries()].slice(0,24).forEach(([name,bindings])=>{
  const row=document.createElement('div');row.className='morph-control';
  const label=document.createElement('label');label.textContent=MORPH_LABELS[name]||name;label.htmlFor=`morph-${container.children.length}`;
  const input=document.createElement('input');input.type='range';input.min='0';input.max='1';input.step='.01';input.id=label.htmlFor;input.dataset.morphIndex=String(container.children.length);
  const initial=Number(bindings[0].mesh.morphTargetInfluences[bindings[0].index]||0);
  input.value=String(THREE.MathUtils.clamp(initial,0,1));
  const output=document.createElement('output');output.value=Number(input.value).toFixed(2);
  input.addEventListener('input',()=>{
   const value=Number(input.value);
   bindings.forEach(({mesh,index})=>{mesh.morphTargetInfluences[index]=value});
   output.value=value.toFixed(2);
  });
  row.append(label,input,output);container.append(row);
 });
 document.getElementById('morphEditor').hidden=morphBindings.size===0;
}

const MORPH_PRESETS={
 neutral:{},
 smile:{mouthSmileLeft:.7,mouthSmileRight:.7,cheekSquintLeft:.25,cheekSquintRight:.25},
 surprised:{jawOpen:.48,eyeWideLeft:.65,eyeWideRight:.65,browInnerUp:.7,browOuterUpLeft:.55,browOuterUpRight:.55},
 sad:{mouthFrownLeft:.55,mouthFrownRight:.55,browInnerUp:.45,browDownLeft:.2,browDownRight:.2},
 blink:{eyeBlinkLeft:1,eyeBlinkRight:1}
};
function applyMorphPreset(name){
 const preset=MORPH_PRESETS[name];
 if(!preset)return;
 morphBindings.forEach((bindings,morphName)=>{
  const value=THREE.MathUtils.clamp(Number(preset[morphName]||0),0,1);
  bindings.forEach(({mesh,index})=>{mesh.morphTargetInfluences[index]=value});
 });
 document.querySelectorAll('#morphControls .morph-control').forEach(row=>{
  const input=row.querySelector('input[type="range"]');
  const output=row.querySelector('output');
  if(!input)return;
  const morphName=[...morphBindings.keys()][Number(input.dataset.morphIndex)];
  const value=THREE.MathUtils.clamp(Number(preset[morphName]||0),0,1);
  input.value=String(value);
  if(output)output.value=value.toFixed(2);
 });
 toast('تم تطبيق التعبير');
}
document.querySelectorAll('[data-morph-preset]').forEach(button=>button.addEventListener('click',()=>applyMorphPreset(button.dataset.morphPreset)));

function clearAvatarAnimations(){
 if(importedMixer&&importedAvatar)importedMixer.stopAllAction();
 importedMixer=null;
 importedActions=[];
 activeAnimationIndex=-1;
 animationSelect.replaceChildren(new Option('لا توجد حركات',''));
 animationSelect.disabled=true;
 animationToggle.disabled=true;
 animationToggle.textContent='لا توجد حركة';
 animationToggle.setAttribute('aria-pressed','false');
}
async function importAvatarAsset(file){
 if(!/\.glb$/i.test(file.name))throw new Error('صيغة الملف غير مدعومة؛ استخدم GLB.');
 if(file.size>MAX_GLB_BYTES)throw new Error('حجم النموذج يتجاوز الحد المسموح (32MB).');
 const buffer=await file.arrayBuffer();
 validateGlbArrayBuffer(buffer);
 const loader=new GLTFLoader();
 const gltf=await loader.parseAsync(buffer,'');
 const root=gltf.scene;
 if(!root)throw new Error('ملف GLB لا يحتوي على مشهد قابل للعرض.');
 const bounds=new THREE.Box3().setFromObject(root);
 const size=bounds.getSize(new THREE.Vector3());
 if(!Number.isFinite(size.y)||size.y<=0)throw new Error('أبعاد الشخصية غير صالحة.');
 const center=bounds.getCenter(new THREE.Vector3());
 const scale=THREE.MathUtils.clamp(2.8/size.y,.001,1000);
 const normalizedRoot=new THREE.Group();
 normalizedRoot.add(root);
 normalizedRoot.scale.setScalar(scale);
 normalizedRoot.position.copy(center).multiplyScalar(-scale);
 disposeImportedAvatar();
 importedAvatar=normalizedRoot;
 importedRoot.add(normalizedRoot);
 buildMorphControls(root);
 importedMixer=new THREE.AnimationMixer(root);
 importedActions=gltf.animations.map(clip=>importedMixer.clipAction(clip));
 animationSelect.replaceChildren(new Option('اختر الحركة',''));
 gltf.animations.forEach((clip,index)=>animationSelect.add(new Option(clip.name||`حركة ${index+1}`,String(index))));
 animationSelect.disabled=importedActions.length===0;
 animationToggle.disabled=importedActions.length===0;
 if(importedActions.length)playAvatarAnimation(0);
 importedRoot.scale.setScalar(1);
 model.visible=false;
 toast(importedActions.length?'تم تحميل الشخصية وتشغيل أول حركة':'تم تحميل نموذج GLB دون حركات مدمجة');
}
function bindGarmentToAvatar(garmentRoot,avatarRoot){
 let avatarMesh=null;
 avatarRoot.traverse(node=>{if(!avatarMesh&&node.isSkinnedMesh)avatarMesh=node});
 if(!avatarMesh?.skeleton)throw new Error('الشخصية الحالية لا تحتوي على هيكل عظمي قابل لتركيب الملابس.');
 const avatarSkeleton=avatarMesh.skeleton;
 let skinnedCount=0;
 garmentRoot.traverse(node=>{
  if(!node.isSkinnedMesh)return;
  const sourceBones=node.skeleton?.bones||[];
  const remap=buildBoneRemap(sourceBones.map(bone=>bone.name),avatarSkeleton.bones.map(bone=>bone.name));
  const bones=remap.map(index=>avatarSkeleton.bones[index]);
  const inverses=remap.map(index=>avatarSkeleton.boneInverses[index].clone());
  node.bind(new THREE.Skeleton(bones,inverses),node.bindMatrix.clone());
  skinnedCount++;
 });
 if(!skinnedCount)throw new Error('ملف الملابس لا يحتوي على Mesh مرتبط بـ Armature.');
 return skinnedCount;
}
async function importGarmentAsset(file){
 if(!importedAvatar)throw new Error('استورد شخصية GLB ذات هيكل عظمي أولاً.');
 if(!/\.glb$/i.test(file.name))throw new Error('صيغة قطعة الملابس غير مدعومة؛ استخدم GLB.');
 if(file.size>MAX_GLB_BYTES)throw new Error('حجم قطعة الملابس يتجاوز الحد المسموح (32MB).');
 const buffer=await file.arrayBuffer();
 validateGlbArrayBuffer(buffer);
 const loader=new GLTFLoader();
 const gltf=await loader.parseAsync(buffer,'');
 if(!gltf.scene)throw new Error('ملف الملابس لا يحتوي على مشهد قابل للعرض.');
 const count=bindGarmentToAvatar(gltf.scene,importedAvatar);
 clearImportedGarment();
 importedAvatar.add(gltf.scene);
 importedGarment=gltf.scene;
 toast('تم تركيب قطعة الملابس وربط '+count+' أجزاء بالهيكل العظمي');
}
function disposeObjectResources(root){
 const disposedTextures=new Set();
 root.traverse(node=>{
  node.geometry?.dispose();
  if(node.material)for(const material of(Array.isArray(node.material)?node.material:[node.material])){
   for(const value of Object.values(material)){
    if(value?.isTexture&&!disposedTextures.has(value)){value.dispose();disposedTextures.add(value)}
   }
   material.dispose();
  }
  if(node.skeleton?.boneTexture)node.skeleton.boneTexture.dispose();
 });
}
function clearImportedGarment(){
 if(!importedGarment)return;
 importedAvatar?.remove(importedGarment);
 disposeObjectResources(importedGarment);
 importedGarment=null;
}
function disposeImportedAvatar(){
 clearAvatarAnimations();
 clearMorphControls();
 if(!importedAvatar)return;
 importedRoot.remove(importedAvatar);
 disposeObjectResources(importedAvatar);
 importedAvatar=null;
 importedGarment=null;
}
function removeAvatarAsset(){
 disposeImportedAvatar();
 importedRoot.position.set(0,0,0);
 importedRoot.rotation.set(0,0,0);
 model.visible=true;
 toast('تم الرجوع إلى النموذج الافتراضي');
}

function toast(msg){const el=document.getElementById('toast');el.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2300)}
function reset(){Object.assign(state,DEFAULT_AVATAR_CONFIG);syncControls();rotation=0;zoom=7.6;camera.position.set(0,1.45,zoom);auto=true;document.getElementById('rotate').classList.add('active');document.getElementById('rotate').innerHTML='<span>⟳</span> دوران تلقائي';update();toast('تمت إعادة الإطلالة الافتراضية')}
document.getElementById('resetTop').addEventListener('click',reset);
document.getElementById('randomize').addEventListener('click',()=>{const pick=a=>a[Math.floor(Math.random()*a.length)];state.skin=pick(['#b97850','#e0a77d','#8e573d','#603b30','#c98d70']);state.hair=pick(['#241b19','#57352a','#b78b53']);state.cloth=pick(['#176b60','#172b50','#873f49','#d1b16d']);state.outfit=pick(['djellaba','caftan','modern','takchita']);state.expression=pick(['smile','neutral','surprised']);update();toast('تم ابتكار إطلالة جديدة')});
document.getElementById('saveLook').addEventListener('click',()=>{const selected=getCharacterPreset(document.getElementById('characterPreset')?.value);const data=createCharacterDocument(state,selected||{id:'custom',name:'شخصيتي المخصصة',description:'شخصية مخصصة أنشأها المستخدم.',tags:['custom']});const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='arcode-persona-look.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('تم تصدير إعدادات الشخصية')});
const characterPreset=document.getElementById('characterPreset');
if(characterPreset){for(const item of CHARACTER_CATALOG.characters){const option=document.createElement('option');option.value=item.id;option.textContent=item.name+' — '+item.description;characterPreset.appendChild(option)}characterPreset.addEventListener('change',()=>{if(!characterPreset.value)return;try{const preset=getCharacterPreset(characterPreset.value);Object.assign(state,validateAvatarConfig(preset.config));syncControls();update();toast('تم تطبيق تصميم '+preset.name)}catch(error){console.error(error);toast('تعذر تطبيق تصميم الشخصية')}})}
const importInput=document.getElementById('importLookFile');
document.getElementById('importLook').addEventListener('click',()=>importInput.click());
importInput.addEventListener('change',async()=>{const file=importInput.files?.[0];if(!file)return;if(file.size>64*1024){toast('حجم ملف الإطلالة أكبر من المسموح');importInput.value='';return}try{restoreLook(JSON.parse(await file.text()))}catch(error){toast('تعذر قراءة ملف الإطلالة');console.error(error)}finally{importInput.value=''}});
try{const saved=localStorage.getItem(STORAGE_KEY);if(saved)restoreLook(JSON.parse(saved))}catch(error){console.warn('Saved persona look could not be restored:',error);localStorage.removeItem(STORAGE_KEY)}
window.addEventListener('beforeunload',()=>{renderer.dispose();disposeImportedAvatar();scene.traverse(o=>{o.geometry?.dispose();if(o.material){for(const m of(Array.isArray(o.material)?o.material:[o.material]))m.dispose()}})});
