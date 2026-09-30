/* Neutral ink-Dacia silhouette (SCHEMATIC, no colour, no plate). viewBox 0 0 1000 340, faces right, ground y=300.
   Same drawing is used for the doctor's car and for the other car: the plan says the models are not established. */
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const CAR_VB = {w: 1000, h: 340, cx: 500, cy: 170};
const circ = (cx, cy, r) => `M${cx - r},${cy} a${r},${r} 0 1,0 ${2 * r},0 a${r},${r} 0 1,0 ${-2 * r},0`;

const CAR_PARTS = [
  {id: 'body',   k: 'm', a: 0.00, b: 0.46, d: 'M78,262 C62,252 56,210 58,160 C60,132 70,122 96,120 L228,116 C262,112 312,62 350,24 C356,18 364,16 376,16 L580,15 C596,15 606,20 616,32 L698,108 C770,112 870,126 924,146 C946,156 954,176 956,206 L956,236 C956,254 950,262 936,264 L842,264 A72,72 0 1 0 698,264 L342,264 A72,72 0 1 0 198,264 L92,264 C86,264 82,264 78,262 Z'},
  {id: 'winF',   k: 't', a: 0.36, b: 0.52, d: 'M470,34 L590,33 C598,33 604,37 610,44 L662,106 L470,106 Z'},
  {id: 'winR',   k: 't', a: 0.40, b: 0.56, d: 'M362,34 L458,34 L458,106 L262,106 C296,96 330,66 350,42 C354,37 358,34 362,34 Z'},
  {id: 'wheelR', k: 'm', a: 0.50, b: 0.68, d: circ(270, 238, 62)},
  {id: 'wheelF', k: 'm', a: 0.54, b: 0.72, d: circ(770, 238, 62)},
  {id: 'rimR',   k: 't', a: 0.64, b: 0.78, d: circ(270, 238, 36) + ' ' + circ(270, 238, 11)},
  {id: 'rimF',   k: 't', a: 0.68, b: 0.82, d: circ(770, 238, 36) + ' ' + circ(770, 238, 11)},
  {id: 'doors',  k: 't', a: 0.60, b: 0.78, d: 'M470,106 L468,262 M300,110 L300,176 M662,108 L668,258'},
  {id: 'handle', k: 'h', a: 0.74, b: 0.84, d: 'M610,126 L640,126 M418,126 L448,126'},
  {id: 'strip',  k: 't', a: 0.78, b: 0.92, d: 'M96,196 L840,204'},
  {id: 'lamp',   k: 't', a: 0.84, b: 0.95, d: 'M912,160 L948,160 L948,186 L912,186 Z M930,196 L954,196'},
  {id: 'bumpF',  k: 'm', a: 0.88, b: 0.97, d: 'M914,246 L974,246 C990,246 992,266 974,272 L910,276 Z'},
  {id: 'bumpR',  k: 'm', a: 0.90, b: 0.98, d: 'M34,246 L98,248 L98,274 L38,272 C24,268 24,248 34,246 Z'},
  {id: 'tail',   k: 't', a: 0.92, b: 1.00, d: 'M60,132 L80,132 L80,168 L62,168 Z'}];

function buildCar(svg) {
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (n, attrs) => { const e = document.createElementNS(NS, n); for (const k in attrs) e.setAttribute(k, attrs[k]); svg.appendChild(e); return e; };
  svg.setAttribute('viewBox', `0 0 ${CAR_VB.w} ${CAR_VB.h}`); svg.setAttribute('width', CAR_VB.w); svg.setAttribute('height', CAR_VB.h);
  const C = {parts: []};
  C.shadow = mk('ellipse', {cx: 500, cy: 303, rx: 460, ry: 9, fill: '#000', opacity: 0});
  C.fill = mk('path', {d: CAR_PARTS[0].d, fill: '#fff', stroke: 'none', opacity: 0});
  for (const p of CAR_PARTS) C.parts.push({e: mk('path', {d: p.d, pathLength: 1, class: 'hp', fill: 'none'}), a: p.a, b: p.b, k: p.k});
  return C;
}
function drawCar(C, p, sw) {
  for (const q of C.parts) {
    const t = clamp((p - q.a) / (q.b - q.a)), e = q.e;
    e.style.strokeDasharray = '1 1'; e.style.strokeDashoffset = String(1 - t); e.style.opacity = t <= 0 ? 0 : 1;
    e.style.strokeWidth = q.k === 'm' ? sw : q.k === 'h' ? sw * 1.1 : sw * 0.6;
  }
  C.fill.setAttribute('opacity', clamp((p - 0.3) / 0.1)); C.shadow.setAttribute('opacity', 0.10 * clamp((p - 0.8) / 0.2));
}
