/**
 * Procedural human anatomy blockout v2. Smooth lofted body volumes replace disconnected primitive-only torso geometry.
 * Production realism still requires a sculpted base mesh and skin-weighted rig.
 */
import * as THREE from 'three';
import { solveHumanProportions } from './human-proportions.js';
function loftY(parent,rings,material,segments=40){
 const positions=[],indices=[];
 for(const r of rings)for(let i=0;i<=segments;i++){const a=i/segments*Math.PI*2;positions.push(Math.cos(a)*r.rx,r.y,Math.sin(a)*r.rz)}
 const row=segments+1;for(let j=0;j<rings.length-1;j++)for(let i=0;i<segments;i++){const a=j*row+i,b=a+row;indices.push(a,a+1,b,b,a+1,b+1)}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();
 const mesh=new THREE.Mesh(geometry,material);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
}
function ellipsoid(parent,position,scale,material,segments=24){const mesh=new THREE.Mesh(new THREE.SphereGeometry(1,segments,Math.max(12,Math.floor(segments*.7))),material);mesh.position.set(...position);mesh.scale.set(...scale);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh}
function taperedLimb(parent,start,end,r0,r1,material,depth=1){const a=new THREE.Vector3(...start),b=new THREE.Vector3(...end),axis=new THREE.Vector3().subVectors(b,a);const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r1,r0,axis.length(),24,8,false),material);mesh.position.copy(a).add(b).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),axis.normalize());mesh.scale.z=depth;mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh}
export function buildHumanAnatomy(parent,proportions,skinMaterial){
 const p=solveHumanProportions(proportions),l=p.landmarks,sx=p.shoulderWidth,dx=p.bodyDepth,wx=p.waistWidth,hx=p.hipWidth,tl=p.torsoLength;
 loftY(parent,[{y:.34*tl,rx:.245*sx,rz:.145*dx},{y:.25*tl,rx:.36*sx,rz:.205*dx},{y:.12*tl,rx:.39*sx,rz:.235*dx},{y:-.08*tl,rx:.355*sx,rz:.22*dx},{y:-.28*tl,rx:.30*wx,rz:.195*dx},{y:-.43*tl,rx:.325*wx,rz:.205*dx},{y:-.56*tl,rx:.38*hx,rz:.225*dx},{y:-.69*tl,rx:.37*hx,rz:.22*dx},{y:-.78*tl,rx:.25*hx,rz:.17*dx}],skinMaterial,48);
 for(const side of [-1,1]){
  ellipsoid(parent,[side*.205*sx,.13*tl,.17*dx],[.19*sx,.16*tl,.09*dx],skinMaterial,28);ellipsoid(parent,[side*.405*sx,.19*tl,0],[.17*sx,.18,.18*dx],skinMaterial,24);
  const shoulder=[side*.49*sx,.17*tl,0],elbow=[side*.62*sx,l.elbowY,.005],wrist=[side*.66*sx,l.wristY,.025];
  taperedLimb(parent,shoulder,elbow,.125,.09,skinMaterial,dx);ellipsoid(parent,elbow,[.092,.095,.09],skinMaterial,20);taperedLimb(parent,elbow,wrist,.09,.055,skinMaterial,dx);ellipsoid(parent,wrist,[.061,.065,.055],skinMaterial,18);
  ellipsoid(parent,[wrist[0],wrist[1]-.105*p.armLength,.06],[.078,.115,.038],skinMaterial,22);ellipsoid(parent,[side*(.66*sx-.045),wrist[1]-.075*p.armLength,.09],[.035,.065,.03],skinMaterial,16);
 }
 for(const side of [-1,1]){const hip=[side*l.hipHalf,l.hipY,0],knee=[side*l.hipHalf*1.04,l.kneeY,.012],ankle=[side*l.hipHalf*1.04,l.ankleY,.018];ellipsoid(parent,hip,[.17*hx,.18*tl,.18*dx],skinMaterial,24);taperedLimb(parent,hip,knee,.155*hx,.105,skinMaterial,dx);ellipsoid(parent,knee,[.105,.11,.115],skinMaterial,20);taperedLimb(parent,knee,ankle,.105,.065,skinMaterial,dx);ellipsoid(parent,ankle,[.068,.085,.075],skinMaterial,18);ellipsoid(parent,[ankle[0],ankle[1]-.025,.13],[.09,.065,.19],skinMaterial,22)}
}
