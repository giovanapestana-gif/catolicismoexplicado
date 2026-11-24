// Motor "Catolicismo Explicado" — bonequinhos low-poly 3D (Three.js)
import * as THREE from 'three';

// ---------- utilidades ----------
function rng(seedStr) { let h = 2166136261; for (const c of seedStr) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 10000) / 10000; }; }
const M = (color, o = {}) => new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.9, metalness: 0, ...o });
const EM = (color) => new THREE.MeshBasicMaterial({ color });
const box = (w, h, d, c, o) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), M(c, o));
const cyl = (rt, rb, h, c, seg = 8, o) => new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), M(c, o));
const sph = (r, c, d = 1, o) => new THREE.Mesh(new THREE.IcosahedronGeometry(r, d), M(c, o));
const cone = (r, h, c, seg = 6, o) => new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), M(c, o));
const at = (o, x = 0, y = 0, z = 0) => { o.position.set(x, y, z); return o; };
const ease = (x) => x * x * (3 - 2 * x);
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const SKINS = ['#f3c9a0', '#e8b48a', '#c98f62', '#a86b45', '#7a4a2c', '#f6d5b8'];
const HAIRS = ['#2b1d12', '#4a2f1b', '#7a5230', '#c9a15a', '#161616', '#8c8c8c'];

// ---------- personagens ----------
const KIND = {
  man: {}, woman: { hairStyle: 'long', skirt: true }, boy: { scale: 0.78 }, girl: { scale: 0.78, hairStyle: 'long', skirt: true },
  padre: { tunic: '#f4f1ea', vestment: '#2f8f4e', hat: 'none' },
  bispo: { tunic: '#f4f1ea', vestment: '#7b2d8e', hat: 'mitre' },
  coroinha: { tunic: '#f4f1ea', scale: 0.85, cord: true },
  jesuita: { tunic: '#222222', collar: true },
  monge: { tunic: '#6b4a2b', hat: 'hood' },
  jesus: { tunic: '#f6f1e6', mantle: '#b3262d', hairStyle: 'long', beard: true, halo: true },
  maria: { tunic: '#f6f1e6', mantle: '#2f5fa8', veil: '#f6f1e6', skirt: true, halo: true },
  jose: { tunic: '#8a6a3c', mantle: '#5b4a35', beard: true },
  anjo: { tunic: '#ffffff', wings: true, halo: true },
  pastor: { tunic: '#9a7a4a', mantle: '#6b5538', staff: true },
  mago: { tunic: '#7b3fa0', mantle: '#d4a017', hat: 'turban' },
  herodes: { tunic: '#6a1b9a', mantle: '#b3262d', hat: 'crown', beard: true },
  soldado: { hat: 'helmet', armor: '#8d96a3', tunic: '#b3262d', short: true },
  romano: { tunic: '#d9c9a3', short: true },
  cristao: { tunic: '#c9b48a' },
  joao: { tunic: '#7a5a34', hairStyle: 'long', beard: true, staff: true },
  santo: { tunic: '#f4f1ea', halo: true },
  indigena: { tunic: '#f3eadb', tilma: '#c8a46a', hair: '#161616', skin: '#a86b45' },
};

export function makeChar(id, spec0) {
  const spec = { ...(KIND[spec0.kind || 'man'] || {}), ...spec0 };
  const R = rng(id);
  const S = spec.scale || 1;
  const skin = spec.skin || SKINS[Math.floor(R() * SKINS.length)];
  const hair = spec.hair || HAIRS[Math.floor(R() * HAIRS.length)];
  const top = spec.top || ['#3d6fb6', '#c1493c', '#4a8f5a', '#d19a2e', '#7a5aa6'][Math.floor(R() * 5)];
  const bottom = spec.bottom || '#3b3b4f';
  const root = new THREE.Group();
  const inner = new THREE.Group(); inner.scale.setScalar(S); root.add(inner);
  const HIP = 0.68;
  const upper = at(new THREE.Group(), 0, HIP, 0); inner.add(upper);
  const tunic = spec.tunic;
  // tronco
  const torsoColor = tunic || top;
  const torso = at(box(0.52, 0.66, 0.3, torsoColor), 0, 0.33, 0); upper.add(torso);
  // cabeça
  const head = at(new THREE.Group(), 0, 0.98, 0); upper.add(head);
  const skull = sph(0.33, skin, 1); skull.scale.set(1, 1, 0.96); head.add(skull);
  const eyeM = EM('#141414');
  const eyes = new THREE.Group(); head.add(eyes);
  for (const sx of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.036, 8, 6), eyeM); e.position.set(sx * 0.12, 0.03, 0.3); e.scale.set(1, 1.25, 0.6); eyes.add(e); }
  for (const sx of [-1, 1]) { const c = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), M('#f08a8a', { flatShading: false })); c.position.set(sx * 0.2, -0.07, 0.25); c.scale.set(1, 0.7, 0.4); head.add(c); }
  const mouth = at(box(0.09, 0.018, 0.02, '#7a2a2a'), 0, -0.13, 0.31); head.add(mouth);
  // cabelo
  const hs = spec.hairStyle || (R() > 0.5 ? 'short' : 'curto2');
  if (!['hood', 'helmet', 'mitre', 'turban'].includes(spec.hat)) {
    if (hs !== 'bald') {
      const capG = new THREE.Mesh(new THREE.SphereGeometry(0.345, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.42), M(hair));
      capG.position.set(0, 0.03, -0.02); head.add(capG);
      if (hs === 'long') { const back = at(box(0.62, 0.62, 0.16, hair), 0, -0.2, -0.22); head.add(back); }
      if (hs === 'bun') head.add(at(sph(0.13, hair, 0), 0, 0.36, -0.1));
    }
  }
  if (spec.beard) { const b = at(box(0.42, 0.22, 0.14, hair === '#c9a15a' ? '#8a6a3a' : hair), 0, -0.2, 0.22); head.add(b); }
  if (spec.veil) { const v = new THREE.Mesh(new THREE.SphereGeometry(0.37, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.62), M(spec.veil)); v.position.set(0, 0.02, -0.03); head.add(v); head.add(at(box(0.7, 0.7, 0.1, spec.veil), 0, -0.25, -0.26)); }
  if (spec.hat === 'mitre') { const m = at(cone(0.28, 0.5, '#f1e7c8', 4), 0, 0.5, 0); m.scale.set(1, 1, 0.55); head.add(m); head.add(at(box(0.5, 0.08, 0.5, '#d4a017'), 0, 0.28, 0)); }
  if (spec.hat === 'crown') { const c = at(cyl(0.3, 0.26, 0.2, '#e0b020', 8), 0, 0.36, 0); head.add(c); for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; head.add(at(cone(0.05, 0.14, '#e0b020', 4), Math.sin(a) * 0.27, 0.52, Math.cos(a) * 0.27)); } }
  if (spec.hat === 'helmet') { const h = new THREE.Mesh(new THREE.SphereGeometry(0.37, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.55), M('#9aa3b0')); h.position.y = 0.04; head.add(h); head.add(at(box(0.08, 0.2, 0.5, '#b3262d'), 0, 0.42, 0)); }
  if (spec.hat === 'hood') { const h = new THREE.Mesh(new THREE.SphereGeometry(0.38, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.65), M(spec.tunic || '#6b4a2b')); h.position.set(0, 0.03, -0.03); head.add(h); }
  if (spec.hat === 'turban') { const t = at(sph(0.36, spec.mantle || '#d4a017', 1), 0, 0.14, 0); t.scale.set(1.02, 0.7, 1.02); head.add(t); }
  if (spec.hat === 'solideo') head.add(at(cyl(0.16, 0.16, 0.05, '#7b2d8e'), 0, 0.33, 0));
  if (spec.halo) { const h = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.035, 5, 14), EM('#ffd84a')); h.position.set(0, 0.62, -0.05); h.rotation.x = Math.PI / 2 - 0.25; head.add(h); }
  // braços
  const mkArm = (sx) => {
    const g = at(new THREE.Group(), sx * 0.35, 0.58, 0);
    const sleeve = spec.longSleeve === false ? skin : (tunic || top);
    const a = box(0.15, 0.52, 0.15, sleeve); a.geometry.translate(0, -0.26, 0); g.add(a);
    const hand = at(sph(0.085, skin, 0), 0, -0.56, 0); g.add(hand);
    const anchor = at(new THREE.Group(), 0, -0.6, 0.03); g.add(anchor);
    upper.add(g); return { g, hand, anchor };
  };
  const armR = mkArm(-1), armL = mkArm(1);
  // pernas / saia
  const mkLeg = (sx) => {
    const g = at(new THREE.Group(), sx * 0.14, HIP, 0);
    const l = box(0.19, 0.6, 0.2, spec.short ? skin : bottom); l.geometry.translate(0, -0.3, 0); g.add(l);
    const shoe = at(box(0.21, 0.09, 0.3, '#2a1d14'), 0, -0.64, 0.05); g.add(shoe);
    inner.add(g); return g;
  };
  const legR = mkLeg(-1), legL = mkLeg(1);
  let skirt = null;
  if (tunic || spec.skirt) {
    const sc = tunic || spec.skirtColor || top;
    skirt = at(cyl(0.3, spec.short ? 0.36 : 0.43, spec.short ? 0.45 : 0.82, sc, 8), 0, spec.short ? HIP - 0.12 : HIP - 0.2, 0);
    inner.add(skirt);
    if (!spec.short && tunic) { legR.visible = false; legL.visible = false; const sh = at(box(0.5, 0.09, 0.34, '#2a1d14'), 0, 0.045, 0.06); inner.add(sh); }
  }
  if (spec.armor) { upper.add(at(box(0.56, 0.5, 0.34, spec.armor), 0, 0.38, 0)); }
  if (spec.vestment) { // casula
    const cs = at(cyl(0.3, 0.46, 0.95, spec.vestment, 8), 0, 0.12, 0); cs.scale.set(1, 1, 0.8); inner.add(cs);
    const sh = at(cyl(0.3, 0.3, 0.2, spec.vestment, 8), 0, HIP + 0.55, 0); sh.scale.set(1, 1, 0.75); inner.add(sh);
    inner.add(at(box(0.1, 0.95, 0.06, '#e0b020'), 0, 0.42, 0.37)); inner.add(at(box(0.1, 0.95, 0.06, '#e0b020'), 0, 0.42, -0.37));
  }
  if (spec.mantle && !spec.vestment) {
    const cape = at(box(0.6, 0.85, 0.08, spec.mantle), 0, HIP + 0.2, -0.2); inner.add(cape);
    upper.add(at(box(0.6, 0.12, 0.34, spec.mantle), 0, 0.64, 0));
    if (spec.veil) { upper.add(at(box(0.56, 0.7, 0.06, spec.mantle), 0, 0.3, 0.17)); }
  }
  if (spec.tilma) { inner.add(at(box(0.6, 0.8, 0.08, spec.tilma), 0, HIP + 0.1, -0.2)); }
  if (spec.collar) upper.add(at(box(0.2, 0.08, 0.05, '#ffffff'), 0, 0.64, 0.17));
  if (spec.cord) inner.add(at(box(0.54, 0.05, 0.34, '#d6c18a'), 0, HIP + 0.1, 0));
  if (spec.wings) { for (const sx of [-1, 1]) { const w = at(box(0.7, 0.9, 0.05, '#ffffff'), sx * 0.45, 0.45, -0.22); w.rotation.z = sx * -0.5; w.rotation.y = sx * 0.3; upper.add(w); } }
  if (spec.staff) { const st = cyl(0.03, 0.03, 1.7, '#7a5230', 5); st.position.set(0, -0.2, 0.03); armL.anchor.add(st); }
  root.traverse(o => { if (o.isMesh) { o.castShadow = true; } });
  return { id, root, inner, upper, head, mouth, eyes, armR, armL, legR, legL, skirt, S, spec };
}

// poses procedurais: devolvem rotações de braços etc. em função do tempo s (seg.) e u (0..1) da cena
export function applyPose(ch, pose, s, u, speaking) {
  const { armR, armL, legR, legL, upper, head, root, inner } = ch;
  const rst = () => { armR.g.rotation.set(0, 0, 0); armL.g.rotation.set(0, 0, 0); legR.rotation.set(0, 0, 0); legL.rotation.set(0, 0, 0); upper.rotation.set(0, 0, 0); head.rotation.set(0, 0, 0); inner.position.y = 0; inner.rotation.set(0, 0, 0); inner.position.z = 0; legR.scale.y = legL.scale.y = 1; };
  rst();
  const sw = Math.sin(s * 1.6) * 0.04;
  armR.g.rotation.z = -0.1 + sw; armL.g.rotation.z = 0.1 - sw;
  const down = (a) => a;
  switch (pose) {
    case 'talk': armR.g.rotation.x = -0.85 + Math.sin(s * 4.2) * 0.3; armR.g.rotation.z = -0.25; break;
    case 'talk2': armR.g.rotation.x = -0.9 + Math.sin(s * 4.2) * 0.3; armL.g.rotation.x = -0.8 + Math.sin(s * 3.6 + 1) * 0.3; armR.g.rotation.z = -0.3; armL.g.rotation.z = 0.3; break;
    case 'wave': armR.g.rotation.z = -2.55 + Math.sin(s * 9) * 0.35; armR.g.rotation.x = 0; break;
    case 'pray': armR.g.rotation.set(-1.15, 0, 0.5); armL.g.rotation.set(-1.15, 0, -0.5); head.rotation.x = 0.25; break;
    case 'kneel': armR.g.rotation.set(-1.15, 0, 0.5); armL.g.rotation.set(-1.15, 0, -0.5); head.rotation.x = 0.1; inner.position.y = -0.3; legR.scale.y = legL.scale.y = 0.5; if (ch.skirt) ch.skirt.scale.y = 0.75; break;
    case 'point': armR.g.rotation.set(-1.55, 0, -0.2); break;
    case 'hold': case 'carry': armR.g.rotation.set(-1.0, 0, 0.35); armL.g.rotation.set(-1.0, 0, -0.35); break;
    case 'offer': armR.g.rotation.set(-2.5, 0, -0.15); armL.g.rotation.set(-2.5, 0, 0.15); break;
    case 'bless': armR.g.rotation.set(-0.5, 0, -1.0); armL.g.rotation.set(-0.5, 0, 1.0); break;
    case 'cheer': armR.g.rotation.set(0, 0, -2.5 + Math.sin(s * 8) * 0.2); armL.g.rotation.set(0, 0, 2.5 - Math.sin(s * 8) * 0.2); inner.position.y = Math.abs(Math.sin(s * 5)) * 0.1; break;
    case 'amazed': armR.g.rotation.set(-0.3, 0, -2.0); armL.g.rotation.set(-0.3, 0, 2.0); break;
    case 'think': armR.g.rotation.set(-2.1, 0, 0.8); head.rotation.z = 0.12; break;
    case 'bow': upper.rotation.x = 0.55; break;
    case 'sit': inner.position.y = -0.3; legR.rotation.x = -1.5; legL.rotation.x = -1.5; break;
    case 'lie': inner.rotation.x = -Math.PI / 2; inner.position.y = 0.22; inner.position.z = 0; break;
    case 'fall': { const k = ease(clamp01((u - 0.25) / 0.4)); inner.rotation.x = -Math.PI / 2 * k; inner.position.y = 0.22 * k; armR.g.rotation.z = -0.4 * k; armL.g.rotation.z = 0.4 * k; break; }
    case 'walk': case 'run': { const f = pose === 'run' ? 11 : 7, a = pose === 'run' ? 0.9 : 0.6; const w = Math.sin(s * f); legR.rotation.x = w * a; legL.rotation.x = -w * a; armR.g.rotation.x = -w * a * 0.8; armL.g.rotation.x = w * a * 0.8; inner.position.y = Math.abs(w) * 0.05; if (ch.skirt) ch.skirt.rotation.y = w * 0.1; break; }
    case 'carrywalk': { const w = Math.sin(s * 7); legR.rotation.x = w * 0.5; legL.rotation.x = -w * 0.5; armR.g.rotation.set(-1.0, 0, 0.35); armL.g.rotation.set(-1.0, 0, -0.35); inner.position.y = Math.abs(w) * 0.04; break; }
    default: break;
  }
  if (speaking) { head.rotation.x += Math.sin(s * 3.1) * 0.04; ch.mouth.scale.y = 1 + Math.abs(Math.sin(s * 11)) * 2.2; ch.mouth.scale.x = 1 + Math.abs(Math.sin(s * 7)) * 0.25; }
  else { ch.mouth.scale.set(1, 1, 1); }
  armR.anchor.rotation.x = -armR.g.rotation.x; armL.anchor.rotation.x = -armL.g.rotation.x;
  const bl = (s % 3.2) < 0.12 ? 0.1 : 1; ch.eyes.scale.y = bl;
}

// ---------- objetos ----------
export function makeProp(type, o = {}) {
  const g = new THREE.Group(); const c = o.color;
  switch (type) {
    case 'candle': { g.add(at(cyl(0.04, 0.04, 0.3, c || '#f5efe0', 6), 0, 0.15, 0)); const f = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.09, 5), EM('#ffb52e')); f.position.y = 0.35; f.name = 'flame'; g.add(f); break; }
    case 'candles': { for (let i = -1; i <= 1; i++) { const k = makeProp('candle'); k.position.set(i * 0.2, 0, (i % 2) * 0.05); g.add(k); } break; }
    case 'chalice': { g.add(at(cyl(0.1, 0.12, 0.03, '#e0b020', 8), 0, 0.015, 0)); g.add(at(cyl(0.025, 0.025, 0.2, '#e0b020', 6), 0, 0.12, 0)); g.add(at(cyl(0.1, 0.05, 0.14, '#e8c040', 8), 0, 0.29, 0)); break; }
    case 'ciborium': { g.add(at(cyl(0.08, 0.1, 0.03, '#e0b020', 8), 0, 0.015, 0)); g.add(at(cyl(0.025, 0.025, 0.12, '#e0b020', 6), 0, 0.09, 0)); g.add(at(cyl(0.12, 0.08, 0.12, '#e8c040', 8), 0, 0.2, 0)); g.add(at(cone(0.12, 0.08, '#e8c040', 8), 0, 0.3, 0)); break; }
    case 'host': { g.add(at(cyl(0.1, 0.1, 0.02, '#ffffff', 12), 0, 0, 0)); g.add(at(box(0.02, 0.1, 0.005, '#d4a017'), 0, 0, 0.012)); break; }
    case 'cross': { g.add(at(box(0.12, 1.0, 0.1, c || '#7a5230'), 0, 0.5, 0)); g.add(at(box(0.55, 0.12, 0.1, c || '#7a5230'), 0, 0.72, 0)); break; }
    case 'crossgold': { g.add(at(box(0.1, 0.5, 0.06, '#e0b020'), 0, 0.25, 0)); g.add(at(box(0.3, 0.1, 0.06, '#e0b020'), 0, 0.36, 0)); break; }
    case 'book': { g.add(at(box(0.32, 0.06, 0.42, c || '#7b2d8e'), 0, 0.03, 0)); g.add(at(box(0.3, 0.05, 0.4, '#f4ecd8'), 0.01, 0.03, 0)); break; }
    case 'scroll': { const s = cyl(0.05, 0.05, 0.42, '#efe3c2', 8); s.rotation.z = Math.PI / 2; g.add(s); break; }
    case 'torch': { g.add(at(cyl(0.03, 0.04, 0.7, '#5a3a20', 5), 0, 0.35, 0)); const f = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.26, 5), EM('#ff9a1f')); f.position.y = 0.8; f.name = 'flame'; g.add(f); break; }
    case 'star': { const sh = new THREE.Shape(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 0.2 : 0.5, a = i / 10 * Math.PI * 2 + Math.PI / 2; i ? sh.lineTo(Math.cos(a) * r, Math.sin(a) * r) : sh.moveTo(Math.cos(a) * r, Math.sin(a) * r); } sh.closePath(); const m = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.1, bevelEnabled: false }), EM('#ffe27a')); g.add(m); break; }
    case 'crown_advent': { const t = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.07, 6, 16), M('#2f7a3c')); t.rotation.x = Math.PI / 2; t.position.y = 0.05; g.add(t); const lit = o.lit ?? 1; for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2; const cd = makeProp('candle', { color: i === 2 ? '#e58aa8' : '#7b3fa0' }); cd.position.set(Math.cos(a) * 0.5, 0.05, Math.sin(a) * 0.5); const fl = cd.getObjectByName('flame'); if (fl) fl.visible = i < lit; g.add(cd); } break; }
    case 'manger': { g.add(at(box(0.9, 0.3, 0.45, '#8a5a2b'), 0, 0.15, 0)); g.add(at(box(0.8, 0.08, 0.35, '#e0c060'), 0, 0.32, 0)); const b = at(box(0.4, 0.14, 0.2, '#ffffff'), 0, 0.4, 0); g.add(b); g.add(at(sph(0.1, '#f3c9a0', 1), 0.22, 0.42, 0)); break; }
    case 'bag': { g.add(at(box(0.26, 0.22, 0.14, '#8a6a3c'), 0, 0, 0)); break; }
    case 'stone': { const s = sph(0.2, '#9a9a9a', 0); s.scale.y = 0.7; g.add(s); break; }
    case 'sword': { g.add(at(box(0.06, 0.7, 0.02, '#c9ced6'), 0, 0.35, 0)); g.add(at(box(0.24, 0.05, 0.05, '#7a5230'), 0, 0.02, 0)); break; }
    case 'spear': { g.add(at(cyl(0.025, 0.025, 1.9, '#7a5230', 5), 0, 0.95, 0)); g.add(at(cone(0.06, 0.25, '#c9ced6', 4), 0, 2.0, 0)); break; }
    case 'shield': { const s = cyl(0.3, 0.3, 0.06, '#b3262d', 12); s.rotation.x = Math.PI / 2; g.add(s); break; }
    case 'rose': { g.add(at(cyl(0.012, 0.012, 0.3, '#2f7a3c', 4), 0, 0.15, 0)); g.add(at(sph(0.05, '#d1264a', 0), 0, 0.32, 0)); break; }
    case 'roses': { for (let i = 0; i < 7; i++) { const r = makeProp('rose'); r.position.set((i - 3) * 0.06, 0, Math.sin(i) * 0.06); r.rotation.z = (i - 3) * 0.12; g.add(r); } break; }
    case 'dove': { g.add(at(sph(0.1, '#ffffff', 1), 0, 0, 0)); for (const sx of [-1, 1]) { const w = at(box(0.2, 0.02, 0.12, '#ffffff'), sx * 0.15, 0.03, 0); w.rotation.z = sx * 0.3; w.name = 'wing'; g.add(w); } g.add(at(sph(0.05, '#ffffff', 0), 0, 0.06, 0.1)); break; }
    case 'cloud': { for (let i = 0; i < 5; i++) { const s = sph(0.35 + (i % 2) * 0.12, '#ffffff', 1, { flatShading: false }); s.position.set((i - 2) * 0.35, (i % 2) * 0.08, 0); g.add(s); } break; }
    case 'globe': { g.add(sph(0.35, '#3f7fc0', 2)); g.add(at(sph(0.14, '#4a9a50', 1), 0.15, 0.15, 0.25)); g.add(at(sph(0.1, '#4a9a50', 1), -0.2, -0.1, 0.28)); break; }
    case 'boat': { g.add(at(box(1.6, 0.35, 0.7, '#8a5a2b'), 0, 0.15, 0)); g.add(at(cyl(0.04, 0.04, 1.8, '#5a3a20', 5), 0, 1.1, 0)); g.add(at(box(0.9, 1.1, 0.04, '#f4ecd8'), 0.45, 1.2, 0)); break; }
    case 'sheep': { g.add(at(sph(0.28, '#f4f4f0', 1), 0, 0.35, 0)); g.add(at(sph(0.13, '#3a3a3a', 0), 0.28, 0.42, 0)); for (const x of [-0.12, 0.12]) for (const z of [-0.1, 0.1]) g.add(at(box(0.05, 0.22, 0.05, '#3a3a3a'), x, 0.1, z)); break; }
    case 'tree': { g.add(at(cyl(0.12, 0.16, 1.2, '#6b4a2b', 6), 0, 0.6, 0)); g.add(at(sph(0.7, '#3f8f4a', 1), 0, 1.6, 0)); break; }
    case 'palm': { g.add(at(cyl(0.07, 0.1, 1.8, '#8a6a3c', 5), 0, 0.9, 0)); for (let i = 0; i < 5; i++) { const l = at(box(0.8, 0.03, 0.2, '#3f8f4a'), Math.cos(i * 1.256) * 0.4, 1.85, Math.sin(i * 1.256) * 0.4); l.rotation.y = -i * 1.256; l.rotation.z = -0.3; g.add(l); } break; }
    case 'tomb': { g.add(at(box(1.4, 0.5, 0.7, '#a8a39a'), 0, 0.25, 0)); g.add(at(box(1.5, 0.08, 0.8, '#c0bbb0'), 0, 0.54, 0)); break; }
    case 'bread': { const b = sph(0.14, '#c9a15a', 1); b.scale.set(1.4, 0.8, 1); g.add(b); break; }
    case 'fish': { const b = sph(0.12, '#c0c8d0', 1); b.scale.set(1.8, 0.8, 0.5); g.add(b); break; }
    case 'bench': { g.add(at(box(2.2, 0.08, 0.5, '#8a5a2b'), 0, 0.45, 0)); g.add(at(box(2.2, 0.55, 0.06, '#7a4a20'), 0, 0.75, -0.25)); for (const x of [-1, 1]) g.add(at(box(0.08, 0.45, 0.45, '#6a3a18'), x, 0.22, 0)); break; }
    case 'table': { g.add(at(box(1.6, 0.08, 0.9, '#8a5a2b'), 0, 0.75, 0)); for (const x of [-0.7, 0.7]) for (const z of [-0.35, 0.35]) g.add(at(box(0.08, 0.75, 0.08, '#6a3a18'), x, 0.37, z)); break; }
    case 'throne': { g.add(at(box(0.9, 0.5, 0.8, '#7a1f1f'), 0, 0.25, 0)); g.add(at(box(0.9, 1.1, 0.12, '#7a1f1f'), 0, 0.9, -0.34)); g.add(at(box(0.95, 0.06, 0.85, '#e0b020'), 0, 0.5, 0)); break; }
    case 'bishopstaff': { g.add(at(cyl(0.03, 0.03, 1.7, '#e0b020', 5), 0, 0.85, 0)); const t = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.03, 5, 10, Math.PI * 1.5), M('#e0b020')); t.position.y = 1.75; g.add(t); break; }
    case 'water': { const w = at(box(3.2, 0.04, 6, '#4aa0d8', { roughness: 0.3 }), 0, 0.02, 0); g.add(w); break; }
    case 'bible': { const b = makeProp('book', { color: '#2b2b6a' }); g.add(b); g.add(at(box(0.04, 0.02, 0.3, '#e0b020'), 0, 0.07, 0)); break; }
    case 'rosary': { const t = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.012, 4, 14), M('#7a3a20')); t.rotation.x = Math.PI / 2; g.add(t); g.add(at(box(0.02, 0.1, 0.01, '#e0b020'), 0, 0, 0.12)); break; }
    case 'sign': { const cv = document.createElement('canvas'); cv.width = 256; cv.height = 128; const x = cv.getContext('2d'); x.fillStyle = '#f4ecd8'; x.fillRect(0, 0, 256, 128); x.strokeStyle = '#7a5230'; x.lineWidth = 10; x.strokeRect(5, 5, 246, 118); x.fillStyle = '#3a2a1a'; x.font = 'bold 54px Poppins, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(o.text || '', 128, 66); const tx = new THREE.CanvasTexture(cv); const m = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.6), new THREE.MeshBasicMaterial({ map: tx })); m.position.y = 1.5; g.add(m); g.add(at(cyl(0.03, 0.03, 1.3, '#5a3a20', 5), 0, 0.65, -0.02)); break; }
    default: g.add(at(sph(0.15, c || '#cccccc', 1), 0, 0.15, 0));
  }
  g.traverse(m => { if (m.isMesh) m.castShadow = true; });
  return g;
}

// ---------- cenários ----------
function floor(w, d, c, y = 0) { const f = new THREE.Mesh(new THREE.PlaneGeometry(w, d), M(c, { flatShading: false })); f.rotation.x = -Math.PI / 2; f.position.y = y; f.receiveShadow = true; return f; }
function glass(w, h, c, x, y, z, ry = 0) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), EM(c)); m.position.set(x, y, z); m.rotation.y = ry; return m; }

const SETS = {
  igreja() {
    const g = new THREE.Group();
    g.add(floor(14, 26, '#c79a63', 0)); g.children[0].position.z = 2;
    g.add(at(box(2.2, 0.02, 20, '#a8232b'), 0, 0.015, 3));
    g.add(at(box(14, 8, 0.3, '#f1e6cf'), 0, 4, -10)); // fundo
    for (const sx of [-1, 1]) g.add(at(box(0.3, 8, 26, '#efe2c6'), sx * 6.5, 4, 2));
    g.add(at(box(14, 0.3, 26, '#d8c49a'), 0, 8, 2));
    for (let i = 0; i < 6; i++) g.add(at(box(14, 0.4, 0.4, '#7a4a20'), 0, 7.8, 10 - i * 4));
    // vitrais
    const cols = ['#d94a4a', '#4a7fd9', '#e0b030', '#3aa564', '#a85bd0'];
    for (let i = 0; i < 3; i++) g.add(glass(1.1, 3.4, cols[i * 2 % 5], (i - 1) * 3.2, 4.6, -9.82));
    for (const sx of [-1, 1]) for (let i = 0; i < 4; i++) g.add(glass(1.2, 3.0, cols[(i + (sx > 0 ? 2 : 0)) % 5], sx * 6.33, 4.2, 6 - i * 4, -sx * Math.PI / 2));
    // altar
    g.add(at(box(8, 0.3, 4, '#d9c7a0'), 0, 0.15, -8));
    g.add(at(box(2.4, 1.1, 1.0, '#ffffff'), 0, 0.85, -8.4));
    g.add(at(box(2.6, 0.08, 1.1, '#f1e6cf'), 0, 1.44, -8.4));
    const cr = makeProp('cross'); cr.scale.setScalar(2.1); cr.position.set(0, 2.3, -9.8); g.add(cr);
    const ca = makeProp('candle'); ca.position.set(-0.9, 1.48, -8.4); g.add(ca); const cb = makeProp('candle'); cb.position.set(0.9, 1.48, -8.4); g.add(cb);
    const ch = makeProp('chalice'); ch.position.set(0, 1.48, -8.4); g.add(ch);
    g.add(at(box(0.6, 1.3, 0.6, '#7a4a20'), -3.4, 0.95, -7.2)); g.add(at(box(0.7, 0.1, 0.7, '#7a4a20'), -3.4, 1.65, -7.2)); // ambão
    for (const sx of [-1, 1]) for (let i = 0; i < 5; i++) { const b = makeProp('bench'); b.scale.set(0.9, 1, 1); b.position.set(sx * 2.7, 0, 4 + i * 2); g.add(b); }
    return { g, bg: '#f0dfbd', hemi: [0xfff1d6, 0x8a6a40, 1.0], dir: [0xffe9c0, 1.25, [4, 9, 6]], fog: null };
  },
  catacumba() {
    const g = new THREE.Group();
    g.add(floor(8, 30, '#6b5a47', 0)); g.children[0].position.z = 0;
    for (const sx of [-1, 1]) { g.add(at(box(0.4, 4, 30, '#8a7560'), sx * 2.6, 2, 0)); for (let i = 0; i < 10; i++) for (let j = 0; j < 3; j++) g.add(at(box(0.12, 0.5, 1.4, '#4a3b2c'), sx * 2.36, 0.6 + j * 0.9, -12 + i * 2.6)); }
    g.add(at(box(6, 0.4, 30, '#7a6650'), 0, 4, 0)); g.add(at(box(6, 4, 0.4, '#7a6650'), 0, 2, -14));
    for (const [x, z] of [[-1.9, 2], [1.9, -3], [-1.9, -8]]) { const t = makeProp('torch'); t.position.set(x, 1.4, z); g.add(t); }
    return { g, bg: '#1a120c', hemi: [0xffe6cc, 0x3a2a20, 0.95], dir: [0xffd9b0, 1.0, [2, 5, 6]], fog: ['#1a120c', 8, 26], point: [[0, 2.2, 1, 0xffb060, 12]] };
  },
  roma() {
    const g = new THREE.Group(); g.add(floor(40, 40, '#d8c9a3'));
    const col = (x, z, h = 4) => { g.add(at(cyl(0.3, 0.34, h, '#efe5cc', 8), x, h / 2, z)); g.add(at(box(0.9, 0.2, 0.9, '#d8cba8'), x, h, z)); };
    for (let i = 0; i < 6; i++) { col(-4.5, -4 - i * 2.2); col(4.5, -4 - i * 2.2); }
    g.add(at(box(10, 0.4, 14, '#d8cba8'), 0, 4.2, -9));
    for (const sx of [-1, 1]) { g.add(at(box(5, 6, 8, '#d9b48a'), sx * 9, 3, -2)); g.add(at(box(5.4, 0.5, 8.4, '#b5533c'), sx * 9, 6.2, -2)); }
    g.add(at(box(12, 7, 1, '#c8a878'), 0, 3.5, -22));
    return { g, bg: '#ffd9a0', hemi: [0xfff0d0, 0xb08a60, 1.0], dir: [0xffe0a0, 1.3, [-5, 8, 6]], fog: ['#ffd9a0', 18, 45] };
  },
  prisao() {
    const g = new THREE.Group(); g.add(floor(10, 10, '#5a5a60'));
    g.add(at(box(10, 4, 0.3, '#6d6d75'), 0, 2, -4)); for (const sx of [-1, 1]) g.add(at(box(0.3, 4, 10, '#6d6d75'), sx * 4, 2, 0));
    for (let i = -3; i <= 3; i++) g.add(at(cyl(0.04, 0.04, 3.6, '#2a2a2e', 5), i * 0.5, 1.8, -3.7));
    const t = makeProp('torch'); t.position.set(-3.3, 1.2, -2); g.add(t);
    return { g, bg: '#16161a', hemi: [0xd0d6ea, 0x3a3a44, 1.0], dir: [0xffe0b8, 1.1, [-2, 5, 6]], fog: ['#16161a', 8, 24], point: [[-3, 2, -2, 0xffb060, 12]] };
  },
  deserto() {
    const g = new THREE.Group(); g.add(floor(60, 60, '#e2c58a'));
    for (let i = 0; i < 7; i++) { const d = sph(3 + (i % 3), '#d9b574', 1); d.scale.y = 0.35; d.position.set(-18 + i * 6, 0, -16 - (i % 2) * 4); g.add(d); }
    const w = at(box(16, 0.05, 4, '#4aa0d8', { roughness: 0.3 }), 0, 0.03, -3); g.add(w);
    return { g, bg: '#bfe0f2', hemi: [0xfff3d0, 0xc8a060, 1.05], dir: [0xfff0c0, 1.3, [5, 10, 6]], fog: ['#cfe8f4', 22, 60] };
  },
  noite_belem() {
    const g = new THREE.Group(); g.add(floor(50, 50, '#3d4a35'));
    for (let i = 0; i < 80; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.08, 4, 3), EM('#fff6c8')); s.position.set((Math.random() - 0.5) * 50, 6 + Math.random() * 14, -14 - Math.random() * 8); g.add(s); }
    for (const x of [-1.7, 1.7]) g.add(at(cyl(0.1, 0.1, 2.6, '#6a4a2a', 5), x, 1.3, -1)); g.add(at(box(4.2, 0.2, 3.2, '#8a6a3a'), 0, 2.7, -1.6)); g.add(at(box(4, 2.6, 0.2, '#5a3a20'), 0, 1.3, -3.2));
    for (let i = 0; i < 4; i++) { const h = sph(5 + i, '#2d3a2a', 1); h.scale.y = 0.4; h.position.set(-14 + i * 10, -0.5, -18); g.add(h); }
    const m = makeProp('star'); m.position.set(0, 6.5, -9); m.scale.setScalar(1.6); m.name = 'bigstar'; g.add(m);
    return { g, bg: '#0e1736', hemi: [0x8aa0e0, 0x2a2a3a, 0.7], dir: [0xaec0ff, 0.8, [-3, 8, 5]], fog: ['#0e1736', 20, 50], point: [[0, 1.6, 0.5, 0xffb060, 10]] };
  },
  casa() {
    const g = new THREE.Group(); g.add(floor(10, 10, '#b98b57'));
    g.add(at(box(10, 4, 0.3, '#e9d7b0'), 0, 2, -4)); for (const sx of [-1, 1]) g.add(at(box(0.3, 4, 10, '#e2cfa6'), sx * 4.5, 2, 0));
    g.add(glass(1.4, 1.6, '#bfe6ff', 2, 2.2, -3.8)); const t = makeProp('table'); t.position.set(-2, 0, -2.6); g.add(t);
    return { g, bg: '#f1e2c4', hemi: [0xfff1d6, 0x8a6a40, 1.0], dir: [0xffe9c0, 1.1, [3, 8, 6]], fog: null };
  },
  colina() {
    const g = new THREE.Group(); g.add(floor(50, 50, '#7aa457'));
    const h = sph(9, '#6a9448', 1); h.scale.y = 0.45; h.position.set(0, -1.5, -9); g.add(h);
    for (let i = 0; i < 30; i++) { const f = makeProp('rose'); f.scale.setScalar(0.8); f.position.set((Math.random() - 0.5) * 8, 0, -Math.random() * 6 + 1); g.add(f); }
    return { g, bg: '#cfe9f5', hemi: [0xfff3d6, 0x7a9a50, 1.05], dir: [0xfff0c8, 1.2, [4, 9, 5]], fog: ['#dff0f8', 20, 55] };
  },
  mar() {
    const g = new THREE.Group(); g.add(floor(80, 80, '#3f86c0', -0.3));
    return { g, bg: '#bfe3f7', hemi: [0xfff3d6, 0x3f86c0, 1.05], dir: [0xfff0c8, 1.2, [4, 9, 5]], fog: ['#cfe8f6', 25, 70] };
  },
  ceu() {
    const g = new THREE.Group(); g.add(floor(40, 40, '#fdfbf4', 0));
    for (let i = 0; i < 14; i++) { const c = makeProp('cloud'); c.position.set((Math.random() - 0.5) * 16, Math.random() * 2, -4 - Math.random() * 10); c.scale.setScalar(1.5 + Math.random()); g.add(c); }
    return { g, bg: '#bfe2ff', hemi: [0xffffff, 0xdfeaff, 1.15], dir: [0xfff6dc, 1.0, [3, 8, 6]], fog: ['#cfe8ff', 18, 50] };
  },
  estudio() {
    const g = new THREE.Group(); const f = new THREE.Mesh(new THREE.CircleGeometry(9, 32), M('#ead9b8', { flatShading: false })); f.rotation.x = -Math.PI / 2; f.receiveShadow = true; g.add(f);
    return { g, bg: '#f6e7c8', hemi: [0xfff1d6, 0xb09060, 1.0], dir: [0xffe9c0, 1.2, [4, 9, 6]], fog: null };
  },
  biblioteca() {
    const g = new THREE.Group(); g.add(floor(12, 12, '#a87a48'));
    g.add(at(box(12, 4.5, 0.3, '#d9c196'), 0, 2.25, -4.5));
    for (let r = 0; r < 4; r++) for (let i = -5; i <= 5; i++) g.add(at(box(0.4, 0.7, 0.4, ['#a8423a', '#3a6aa8', '#c9a13a', '#3a8a5a'][(i + r + 8) % 4]), i * 0.5, 0.6 + r * 0.9, -4.2));
    return { g, bg: '#e8d5ac', hemi: [0xfff1d6, 0x8a6a40, 1.0], dir: [0xffe9c0, 1.1, [3, 8, 6]], fog: null };
  },
};
SETS.cripta = () => { const s = SETS.catacumba(); s.bg = '#1c1812'; return s; };
SETS.necropole = SETS.cripta;
SETS.praia = SETS.mar;

// ---------- mundo ----------
export class World {
  constructor(canvas, W, H) {
    this.W = W; this.H = H;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(1); this.renderer.setSize(W, H, false);
    this.renderer.shadowMap.enabled = true; this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.scene = new THREE.Scene();
    this.cam = new THREE.PerspectiveCamera(46, W / H, 0.1, 120);
    this.hemi = new THREE.HemisphereLight(0xffffff, 0x888888, 1); this.scene.add(this.hemi);
    this.dir = new THREE.DirectionalLight(0xffffff, 1); this.dir.castShadow = true;
    this.dir.shadow.mapSize.set(1024, 1024); const sc = this.dir.shadow.camera; sc.left = -9; sc.right = 9; sc.top = 9; sc.bottom = -9; sc.near = 1; sc.far = 40; this.dir.shadow.bias = -0.0008;
    this.scene.add(this.dir); this.scene.add(this.dir.target);
    this.pl = [0, 1].map(() => { const p = new THREE.PointLight(0xffaa55, 0, 12, 1.6); this.scene.add(p); return p; });
    this.sets = {}; this.chars = {}; this.props = []; this.curSet = null;
  }
  cast(cast) { for (const [id, sp] of Object.entries(cast)) { const c = makeChar(id, sp); c.root.visible = false; this.scene.add(c.root); this.chars[id] = c; } }
  getSet(name) {
    if (!this.sets[name]) { const f = SETS[name] || SETS.estudio; const s = f(); s.g.traverse(o => { if (o.isMesh && !o.material.isMeshBasicMaterial) o.receiveShadow = true; }); s.g.visible = false; this.scene.add(s.g); this.sets[name] = s; }
    return this.sets[name];
  }
  setScene(sc) {
    const name = sc.set || 'igreja';
    if (this.curSet !== name) {
      if (this.curSet) this.sets[this.curSet].g.visible = false;
      const s = this.getSet(name); s.g.visible = true; this.curSet = name;
      this.scene.background = new THREE.Color(s.bg);
      this.scene.fog = s.fog ? new THREE.Fog(s.fog[0], s.fog[1], s.fog[2]) : null;
      this.hemi.color.set(s.hemi[0]); this.hemi.groundColor.set(s.hemi[1]).lerp(new THREE.Color(s.hemi[0]), 0.55); this.hemi.intensity = s.hemi[2];
      this.dir.color.set(s.dir[0]); this.dir.intensity = s.dir[1]; this.dir.position.set(...s.dir[2]);
      this.pl.forEach((p, i) => { const d = s.point && s.point[i]; if (d) { p.position.set(d[0], d[1], d[2]); p.color.set(d[3]); p.intensity = d[4]; } else p.intensity = 0; });
    }
    // personagens
    for (const c of Object.values(this.chars)) c.root.visible = false;
    this.active = [];
    for (const cs of sc.chars || []) {
      const c = this.chars[cs.id]; if (!c) continue;
      c.root.visible = true; c.cs = cs; this.active.push(c);
    }
    // objetos
    for (const p of this.props) p.obj.parent && p.obj.parent.remove(p.obj);
    this.props = [];
    for (const ps of sc.props || []) {
      const obj = makeProp(ps.type, ps);
      if (ps.scale) obj.scale.setScalar(ps.scale);
      if (ps.rot) obj.rotation.set(...(ps.rot.map(d => d * Math.PI / 180)));
      if (ps.attach) { const c = this.chars[ps.attach.id]; const h = ps.attach.at || 'R'; if (c) { (h === 'L' ? c.armL.anchor : h === 'chest' ? c.upper : h === 'head' ? c.head : c.armR.anchor).add(obj); if (h === 'chest') obj.position.set(0, 0.45, 0.35); if (h === 'head') obj.position.set(0, 0.55, 0); if (ps.off) obj.position.add(new THREE.Vector3(...ps.off)); } }
      else { obj.position.set(...(ps.pos || [0, 0, 0])); this.scene.add(obj); }
      this.props.push({ obj, ps });
    }
  }
  update(sc, s, u) {
    const speaker = sc.speaker || (sc.chars && sc.chars[0] && sc.chars[0].id);
    for (const c of this.active) {
      const cs = c.cs; let x = (cs.pos || [0, 0])[0], z = (cs.pos || [0, 0])[1], face = (cs.rot ?? 0) * Math.PI / 180;
      if (cs.move) { const k = ease(clamp01((u - (cs.move.at?.[0] ?? 0)) / ((cs.move.at?.[1] ?? 1) - (cs.move.at?.[0] ?? 0)))); const tx = cs.move.to[0], tz = cs.move.to[1]; if (!cs.rot && cs.rot !== 0) { /* auto */ } const dx = tx - x, dz = tz - z; if ((Math.abs(dx) + Math.abs(dz)) > 0.01 && cs.rot === undefined) face = Math.atan2(dx, dz); x += dx * k; z += dz * k; }
      c.root.position.set(x, cs.y || 0, z); c.root.rotation.y = face;
      applyPose(c, cs.pose || 'idle', s, u, c.id === speaker && !cs.mute);
    }
    // objetos animados
    for (const p of this.props) {
      const a = p.ps.anim; const o = p.obj;
      if (a === 'float') o.position.y = (p.ps.pos?.[1] || 0) + Math.sin(s * 2) * 0.08;
      if (a === 'spin') o.rotation.y = s * 1.5;
      if (a === 'flap') o.children.forEach(ch => { if (ch.name === 'wing') ch.rotation.z = (ch.position.x > 0 ? 1 : -1) * (0.3 + Math.sin(s * 14) * 0.5); });
      if (a === 'fly' && p.ps.to) { const k = ease(u); o.position.set(p.ps.pos[0] + (p.ps.to[0] - p.ps.pos[0]) * k, p.ps.pos[1] + (p.ps.to[1] - p.ps.pos[1]) * k, p.ps.pos[2] + (p.ps.to[2] - p.ps.pos[2]) * k); }
      const fl = o.getObjectByName && o.getObjectByName('flame'); if (fl && fl.visible) { fl.scale.set(1, 0.85 + Math.sin(s * 17 + o.id) * 0.2, 1); }
    }
    const bs = this.sets[this.curSet] && this.sets[this.curSet].g.getObjectByName('bigstar'); if (bs) bs.rotation.y = Math.sin(s) * 0.4;
    this.camera(sc, u);
    this.renderer.render(this.scene, this.cam);
  }
  camera(sc, u) {
    const cm = sc.cam || {};
    const fr = { wide: [1.7, 0.9, 1.0], full: [1.0, 0.85, 1.35], medium: [0.78, 1.2, 1.5], close: [0.6, 1.5, 1.65], detail: [0.45, 1.5, 1.6] }[cm.frame || 'full'];
    // foco: centro dos personagens ativos (ou foco explícito)
    let fx = 0, fz = 0, ext = 0;
    const act = (cm.on ? this.active.filter(c => cm.on.includes(c.id)) : this.active);
    if (act.length) { const ps = act.map(c => c.root.position); fx = ps.reduce((a, p) => a + p.x, 0) / ps.length; fz = ps.reduce((a, p) => a + p.z, 0) / ps.length; ext = Math.max(...ps.map(p => Math.hypot(p.x - fx, p.z - fz))) * 2; }
    if (cm.focus) { fx = cm.focus[0]; fz = cm.focus[2]; }
    const need = Math.max(1.9, ext + 1.9);
    let dist = cm.dist ?? Math.max(3.4, need / 0.4727) * fr[0];
    let h = cm.h ?? fr[2]; let ly = cm.lookY ?? fr[1]; let ang = (cm.ang ?? 0);
    const mv = cm.move || {}; const k = ease(u);
    if (mv.dist) dist += mv.dist * k; if (mv.ang) ang += mv.ang * k; if (mv.h) h += mv.h * k; if (mv.lookY) ly += mv.lookY * k; if (mv.x) fx += mv.x * k;
    const a = ang * Math.PI / 180;
    this.cam.position.set(fx + Math.sin(a) * dist, h, fz + Math.cos(a) * dist);
    this.cam.lookAt(fx, ly - 0.0, fz);
  }
}
