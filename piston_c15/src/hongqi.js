/* Neutral ink-Hongqi (Red Flag) silhouette, SCHEMATIC. viewBox 0 0 1000 340, faces right, ground y=300. */
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const CAR_VB = {w: 1000, h: 340, cx: 500, cy: 170};
const circ = (cx, cy, r) => `M${cx - r},${cy} a${r},${r} 0 1,0 ${2 * r},0 a${r},${r} 0 1,0 ${-2 * r},0`;
const CAR_PARTS = [
  {id: 'body',   k: 'm', a: 0.00, b: 0.46, d: 'M60,262 C46,250 42,215 44,172 C46,146 56,136 78,133 L86,118 L120,128 L292,124 C318,120 350,78 392,42 C400,35 410,32 424,32 L600,30 C616,30 628,34 638,44 L708,120 L732,124 C800,128 880,140 926,160 C946,170 952,188 954,210 L954,240 C954,256 948,266 934,268 L818,268 A62,62 0 1 0 702,268 L290,268 A62,62 0 1 0 174,268 L84,268 C72,268 66,266 60,262 Z'},
  {id: 'winF',   k: 't', a: 0.36, b: 0.52, d: 'M474,44 L604,42 C612,42 620,46 626,54 L690,118 L474,118 Z'},
  {id: 'winR',   k: 't', a: 0.40, b: 0.56, d: 'M400,44 L464,44 L464,118 L308,118 C340,106 372,78 388,56 C392,50 396,46 400,44 Z'},
  {id: 'wheelR', k: 'm', a: 0.50, b: 0.68, d: circ(232, 246, 54)},
  {id: 'wheelF', k: 'm', a: 0.54, b: 0.72, d: circ(760, 246, 54)},
  {id: 'rimR',   k: 't', a: 0.64, b: 0.78, d: circ(232, 246, 40) + ' ' + circ(232, 246, 24) + ' ' + circ(232, 246, 8)},
  {id: 'rimF',   k: 't', a: 0.68, b: 0.82, d: circ(760, 246, 40) + ' ' + circ(760, 246, 24) + ' ' + circ(760, 246, 8)},
  {id: 'doors',  k: 't', a: 0.60, b: 0.78, d: 'M474,118 L472,266 M308,120 L306,178 M690,120 L696,262'},
  {id: 'handle', k: 'h', a: 0.74, b: 0.84, d: 'M628,138 L660,138 M420,138 L452,138'},
  {id: 'strip',  k: 't', a: 0.78, b: 0.92, d: 'M96,196 L604,190 C700,190 790,200 890,216 M96,206 L604,200 C696,200 780,210 880,226'},
  {id: 'grille', k: 't', a: 0.84, b: 0.95, d: 'M936,170 V238 M944,172 V238 M952,180 V236 M912,150 a22,22 0 1,0 0.1,0'},
  {id: 'bumpF',  k: 'm', a: 0.88, b: 0.97, d: 'M930,246 L980,246 C994,246 996,266 980,272 L926,276 Z'},
  {id: 'bumpR',  k: 'm', a: 0.90, b: 0.98, d: 'M28,246 L88,248 L88,274 L34,272 C20,268 20,248 28,246 Z'},
  {id: 'flag',   k: 'h', a: 0.92, b: 1.00, d: 'M840,128 L848,98 L882,106 L852,116 M52,150 L60,150 L60,192 L52,192 Z'}];
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
