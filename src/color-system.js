/** Moroccan-inspired, accessible character color palettes and PBR material helpers. */
import * as THREE from 'three';
export const COLOR_PALETTES=Object.freeze({
  atlas:{label:'أطلس',cloth:'#315c50',hair:'#241b19',eyes:'#493126',trim:'#c5a46d',accent:'#a65d42'},
  medina:{label:'المدينة',cloth:'#174f68',hair:'#211b1b',eyes:'#34251f',trim:'#d1b16f',accent:'#f0e5d2'},
  sahara:{label:'الصحراء',cloth:'#a65f3c',hair:'#35251f',eyes:'#493126',trim:'#e2c18b',accent:'#d6a66a'},
  royal:{label:'ملكي',cloth:'#4a285e',hair:'#201918',eyes:'#38251e',trim:'#d4b15f',accent:'#8d3448'},
  zellige:{label:'زليج',cloth:'#176b60',hair:'#241b19',eyes:'#38251e',trim:'#c7a45e',accent:'#b9473d'},
  night:{label:'ليلي',cloth:'#26364f',hair:'#151719',eyes:'#2b211d',trim:'#a9b7bd',accent:'#527b83'}
});
export function applyColorPalette(state,id) {
  const palette=COLOR_PALETTES[id];if(!palette)throw new RangeError('Unknown color palette: '+id);
  state.cloth=palette.cloth;state.hair=palette.hair;state.eyes=palette.eyes;state.clothing.trimColor=palette.trim;
  return palette;
}
export function createSkinMaterial(color) {
  return new THREE.MeshPhysicalMaterial({
    color:new THREE.Color(color),roughness:.72,metalness:0,clearcoat:.035,clearcoatRoughness:.82,
    sheen:.12,sheenRoughness:.9,sheenColor:new THREE.Color('#f2c7a5')
  });
}
export function createFabricMaterial(color,accent=false) {
  return new THREE.MeshStandardMaterial({
    color:new THREE.Color(color),roughness:accent?.42:.78,metalness:accent?.18:0,
    side:THREE.DoubleSide
  });
}
