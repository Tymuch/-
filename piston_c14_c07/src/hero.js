const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
/* Ink-Dongfeng hero: side-profile line drawing (SCHEMATIC, drawn by hand in code).
   viewBox 0 0 1000 340, car faces right, ground y = 300.
   Every stroke is a <path pathLength="1"> so it can be "hand drawn" with dash-offset. */
const HERO_VB = {w: 1000, h: 340, cx: 500, cy: 170};

const circ = (cx, cy, r) => `M${cx - r},${cy} a${r},${r} 0 1,0 ${2 * r},0 a${r},${r} 0 1,0 ${-2 * r},0`;

/* a,b = draw window inside the hero's 0..1 build progress; k = style class */
const HERO_PARTS = [
  {id: 'ground', k: 'g', a: 0.00, b: 0.12, d: 'M14,300 L986,300'},
  {id: 'body',   k: 'm', a: 0.04, b: 0.46, d: 'M78,262 C60,248 55,205 60,168 C62,140 74,128 100,124 L268,116 C296,113 316,80 336,38 C341,28 350,24 362,24 L560,22 C580,22 590,26 600,36 L668,112 C720,116 800,120 870,132 C915,140 942,156 952,182 L958,232 C958,252 950,262 936,264 L837,264 A72,72 0 1 0 703,264 L317,264 A72,72 0 1 0 183,264 L92,264 C86,264 82,264 78,262 Z'},
  {id: 'winF',   k: 't', a: 0.40, b: 0.56, d: 'M470,36 L578,35 C586,35 592,40 597,47 L645,106 L470,106 Z'},
  {id: 'winR',   k: 't', a: 0.44, b: 0.60, d: 'M372,36 L458,36 L458,106 L286,106 C310,97 331,72 347,45 C351,39 358,36 372,36 Z'},
  {id: 'wheelR', k: 'm', a: 0.54, b: 0.70, d: circ(250, 238, 62)},
  {id: 'wheelF', k: 'm', a: 0.58, b: 0.74, d: circ(770, 238, 62)},
  {id: 'rimR',   k: 't', a: 0.66, b: 0.78, d: circ(250, 238, 38) + ' ' + circ(250, 238, 12)},
  {id: 'rimF',   k: 't', a: 0.70, b: 0.82, d: circ(770, 238, 38) + ' ' + circ(770, 238, 12)},
  {id: 'doors',  k: 't', a: 0.62, b: 0.78, d: 'M470,106 L468,262 M320,108 L318,262 M652,110 L656,258'},
  {id: 'handle', k: 'h', a: 0.74, b: 0.82, d: 'M604,126 L640,126 M418,126 L454,126'},
  {id: 'strip',  k: 't', a: 0.76, b: 0.90, d: 'M96,170 L600,176 C690,178 750,192 820,208 M96,180 L598,186 C686,188 744,202 812,218'},
  {id: 'lamp',   k: 't', a: 0.84, b: 0.94, d: circ(908, 168, 24) + ' ' + circ(908, 168, 11) + ' M934,214 a8,14 0 1,0 0.1,0'},
  {id: 'bumpF',  k: 'm', a: 0.88, b: 0.97, d: 'M916,244 L974,244 C990,244 992,264 974,270 L912,274 Z'},
  {id: 'bumpR',  k: 'm', a: 0.90, b: 0.98, d: 'M30,244 L98,246 L98,272 L36,270 C22,266 22,246 30,244 Z'},
  {id: 'tail',   k: 't', a: 0.92, b: 1.00, d: 'M70,150 C60,160 58,196 68,212 C78,196 80,160 70,150 Z'},
];

/* gold dragon ornament on the hood (the one accent of the clip: it is literally gold) */
const DRAGON_D = 'M764,126 C770,112 782,106 792,112 C802,118 806,126 816,118 C826,108 836,100 848,104 C858,108 860,114 868,108 L876,96 L878,106 L894,100 L890,110 L900,114 L886,120 C880,128 866,128 858,122 M868,108 L866,94 M792,112 L786,124 M826,108 L822,120 M764,126 C758,122 754,124 750,120';
/* hammer dimples: [cx, cy] on hood / door / rear deck */
const DENTS = [[170, 120], [560, 134], [706, 126]];

function buildHero(svg) {
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (n, attrs, parent) => { const e = document.createElementNS(NS, n); for (const k in attrs) e.setAttribute(k, attrs[k]); (parent || svg).appendChild(e); return e; };
  svg.setAttribute('viewBox', `0 0 ${HERO_VB.w} ${HERO_VB.h}`);
  svg.setAttribute('width', HERO_VB.w); svg.setAttribute('height', HERO_VB.h);
  const H = {parts: [], sw: 6};
  H.shadow = mk('ellipse', {cx: 500, cy: 303, rx: 470, ry: 9, fill: '#000', opacity: 0});
  H.fill = mk('path', {d: HERO_PARTS[1].d, fill: '#fff', stroke: 'none', opacity: 0});
  for (const p of HERO_PARTS) {
    const e = mk('path', {d: p.d, pathLength: 1, class: 'hp hp-' + p.k, fill: 'none'});
    H.parts.push({e, a: p.a, b: p.b, k: p.k});
  }
  H.dents = DENTS.map(([x, y]) => {
    const g = mk('path', {d: `M${x - 16},${y + 2} a16,16 0 0 1 32,0 M${x - 9},${y + 12} a10,10 0 0 1 20,0 M${x - 24},${y - 6} l-8,-8 M${x + 24},${y - 6} l8,-8 M${x},${y - 20} l0,-12`, pathLength: 1, class: 'hp hp-h', fill: 'none'});
    return g;
  });
  /* dragon = ink outline under gold stroke */
  H.dragonInk = mk('path', {d: DRAGON_D, pathLength: 1, class: 'dragon-ink', fill: 'none'});
  H.dragon = mk('path', {d: DRAGON_D, pathLength: 1, class: 'dragon-gold', fill: 'none'});
  /* tail-light marker ring (dashed, ink) */
  H.ringInk = mk('path', {d: circ(828, 108, 56), pathLength: 1, class: 'dragon-ink', fill: 'none'});
  H.ring = mk('path', {d: circ(828, 108, 56), pathLength: 1, class: 'dragon-gold', fill: 'none'});
  H.tailRing = mk('path', {d: circ(66, 181, 46), pathLength: 1, class: 'hp hp-g', fill: 'none', 'stroke-dasharray': '0.04 0.03'});
  return H;
}

/* p in 0..1 = how much of the car is drawn; sw = stroke width in viewBox units */
function drawHero(H, p, sw, o) {
  o = o || {};
  const setDash = (e, t) => { e.style.strokeDasharray = '1 1'; e.style.strokeDashoffset = String(1 - clamp(t)); e.style.opacity = t <= 0 ? 0 : 1; };
  for (const q of H.parts) {
    const t = (p - q.a) / (q.b - q.a);
    setDash(q.e, t);
    const w = q.k === 'm' ? sw : q.k === 'g' ? sw * 0.55 : q.k === 'h' ? sw * 1.15 : sw * 0.6;
    q.e.style.strokeWidth = w;
  }
  H.fill.setAttribute('opacity', clamp((p - 0.30) / 0.1));
  H.shadow.setAttribute('opacity', 0.10 * clamp((p - 0.8) / 0.2));
  (o.dents || []).forEach((t, i) => { setDash(H.dents[i], t); H.dents[i].style.strokeWidth = sw * 0.9; });
  const dg = o.dragon || 0;
  setDash(H.dragon, dg); setDash(H.dragonInk, dg);
  H.dragon.style.strokeWidth = sw * 0.6; H.dragonInk.style.strokeWidth = sw * 1.25;
  const rg = o.ring || 0;
  setDash(H.ring, rg); setDash(H.ringInk, rg); H.ring.style.strokeWidth = sw * 0.5; H.ringInk.style.strokeWidth = sw * 1.1;
  const tr = o.tailRing || 0;
  H.tailRing.style.opacity = tr; H.tailRing.style.strokeDasharray = '0.03 0.02'; H.tailRing.style.strokeWidth = sw * 0.5;
}
