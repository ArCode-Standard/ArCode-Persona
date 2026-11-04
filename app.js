import * as THREE from 'https://esm.sh/three@0.170.0';

const wrap=document.getElementById('canvasWrap');
const scene=new THREE.Scene();
scene.background=null;
const camera=new THREE.PerspectiveCamera(34,1,.1,100);
camera.position.set(0,1.45,7.6);
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.15;
wrap.appendChild(renderer.domElement);
const hemi=new THREE.HemisphereLight(0xe3f4df,0x344238,2.2);scene.add(hemi);
const key=new THREE.DirectionalLight(0xffe6c4,3.2);key.position.set(-3,5,5);key.castShadow=true;scene.add(key);
const rim=new THREE.DirectionalLight(0x9bc9b5,2.3);rim.position.set(3,3,-4);scene.add(rim);
const floor=new THREE.Mesh(new THREE.CircleGeometry(2.25,64),new THREE.MeshBasicMaterial({color:0x9cb79a,transparent:true,opacity:.08}));floor.rotation.x=-Math.PI/2;floor.position.y=-1.43;scene.add(floor);
const model=new THREE.Group();scene.add(model);
const state={skin:'#b97850',hair:'#241b19',hairStyle:'short',cloth:'#176b60',outfit:'djellaba',headwear:'none',expression:'smile',eyes:'#38251e',accessory:'none'};
const mat=(color,roughness=.72,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
const skinMat=()=>mat(state.skin);
const sphere=(parent,x,y,z,sx,sy,sz,material,segments=32)=>{const m=new THREE.Mesh(new THREE.SphereGeometry(1,segments,segments),material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m};
const cylinder=(parent,rt,rb,h,x,y,z,material,segments=48)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,segments,1),material);m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m};
let faceParts={};
function curve(parent,points,material,r=.018){const path=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));const mesh=new THREE.Mesh(new THREE.TubeGeometry(path,24,r,8,false),material);parent.add(mesh);return mesh}
function build(){
 while(model.children.length) {const o=model.children.pop();o.traverse?.(n=>{n.geometry?.dispose();if(n.material&&!Array.isArray(n.material))n.material.dispose()})}
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
new ResizeObserver(resize).observe(wrap);resize();
let dragging=false,lastX=0,rotation=0,auto=true,zoom=7.6,clock=new THREE.Clock();
renderer.domElement.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;renderer.domElement.setPointerCapture(e.pointerId)});
renderer.domElement.addEventListener('pointermove',e=>{if(!dragging)return;rotation+=(e.clientX-lastX)*.009;lastX=e.clientX});
renderer.domElement.addEventListener('pointerup',()=>dragging=false);
renderer.domElement.addEventListener('wheel',e=>{zoom=THREE.MathUtils.clamp(zoom+e.deltaY*.004,5.4,10);camera.position.z=zoom},{passive:true});
function animate(){requestAnimationFrame(animate);const t=clock.getElapsedTime();if(auto&&!dragging)rotation+=.0025;model.rotation.y=rotation;model.position.y=Math.sin(t*1.5)*.025;model.rotation.z=Math.sin(t*.8)*.012;renderer.render(scene,camera)}
animate();
document.getElementById('loading').classList.add('hidden');
function update(){build()}
function bindSwatches(id,key){document.querySelectorAll('#'+id+' .swatch').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('#'+id+' .swatch').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');state[key]=b.dataset.value;update()}))}
bindSwatches('skinOptions','skin');bindSwatches('hairOptions','hair');bindSwatches('clothOptions','cloth');
[['hairStyle','hairStyle'],['expression','expression'],['headwear','headwear'],['eyes','eyes'],['accessory','accessory']].forEach(([id,key])=>document.getElementById(id).addEventListener('change',e=>{state[key]=e.target.value;update()}));
document.querySelectorAll('#outfitOptions .choice').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('#outfitOptions .choice').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');state.outfit=b.dataset.value;update()}));
document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.tab,.tab-content').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.getElementById(b.dataset.tab).classList.add('active')}));
document.getElementById('rotate').addEventListener('click',e=>{auto=!auto;e.currentTarget.classList.toggle('active',auto);e.currentTarget.innerHTML=auto?'<span>⟳</span> دوران تلقائي':'<span>Ⅱ</span> إيقاف الدوران'});
document.getElementById('frontView').addEventListener('click',()=>{rotation=0;auto=false;document.getElementById('rotate').classList.remove('active')});
document.getElementById('resetView').addEventListener('click',()=>{rotation=0;zoom=7.6;camera.position.z=zoom});
function toast(msg){const el=document.getElementById('toast');el.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2300)}
function reset(){Object.assign(state,{skin:'#b97850',hair:'#241b19',hairStyle:'short',cloth:'#176b60',outfit:'djellaba',headwear:'none',expression:'smile',eyes:'#38251e',accessory:'none'});document.querySelectorAll('.swatches').forEach(g=>{g.querySelectorAll('.swatch').forEach(b=>b.classList.toggle('selected',b.dataset.value===state[g.id==='skinOptions'?'skin':g.id==='hairOptions'?'hair':'cloth']))});document.querySelectorAll('#outfitOptions .choice').forEach(b=>b.classList.toggle('selected',b.dataset.value==='djellaba'));['hairStyle','expression','headwear','eyes','accessory'].forEach(id=>{const map={hairStyle:'short',expression:'smile',headwear:'none',eyes:'#38251e',accessory:'none'};document.getElementById(id).value=map[id]});update()}
document.getElementById('resetTop').addEventListener('click',reset);
document.getElementById('randomize').addEventListener('click',()=>{const pick=a=>a[Math.floor(Math.random()*a.length)];state.skin=pick(['#b97850','#e0a77d','#8e573d','#603b30','#c98d70']);state.hair=pick(['#241b19','#57352a','#b78b53']);state.cloth=pick(['#176b60','#172b50','#873f49','#d1b16d']);state.outfit=pick(['djellaba','caftan','modern','takchita']);state.expression=pick(['smile','neutral','surprised']);update();toast('تم ابتكار إطلالة جديدة')});
document.getElementById('saveLook').addEventListener('click',()=>{const data={schemaVersion:1,...state};const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='arcode-persona-look.json';a.click();URL.revokeObjectURL(a.href);toast('تم تصدير إعدادات الشخصية')});
