/* PISTON EXPLAINS · C08 (Dacia) · 1920x1080 · 60 fps · 1800 frames (30.000 s)
   Deterministic: everything is a pure function of the frame index.  renderFrame(n) draws frame n.
   Retime on the real voice: edit SB (sentence starts) and the per-scene frame numbers in render(). */
(function () {
'use strict';
const W = 1920, H = 1080, FPS = 60, N = 1800;
const $ = (id) => document.getElementById(id);
const lerp = (a, b, t) => a + (b - a) * t;
const pr = (f, a, b) => clamp((f - a) / (b - a));
const eio = (t) => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const eo = (t) => 1 - Math.pow(1 - t, 3);
const ei = (t) => t * t * t;
const eob = (t, s = 1.2) => { const c3 = s + 1; return 1 + c3 * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2); };

/* ---------------------------------------------------------------- TIMING */
/* 6 sentences, 98 words. Storyboard durations (7.0/6.6/6.3/3.5/8.0/3.1 s) scaled 0.83, then 82 frames of hold. */
const SB = [0, 349, 678, 992, 1166, 1564, 1718];
const VO = [
  "In a Romanian journalist's reconstruction, the one that took them came from a volunteer: a passing doctor driving a Dacia.",
  "That was Romania's family sedan, a French Renault design built in Romania under license since the late nineteen-sixties.",
  "Ceausescu, his wife and a security officer got in, and the doctor drove them for about twenty minutes.",
  "Then, the doctor later said, the engine started acting up.",
  "In a village, he pulled up beside a man who was washing his car and told his passengers he would go no farther.",
  "They went on in that man's car, another Dacia."];
function wf(s, i) { const w = VO[s].split(' '); let tot = 0, c = 0; w.forEach((x, k) => { if (k === i) c = tot; tot += x.length + 1; }); return Math.round(SB[s] + (SB[s + 1] - SB[s]) * c / tot); }
window.WF = wf;

const MAIN = [
  {id: 'm1', t: "VOLUNTEER DOCTOR", size: 92, y: 140, a: 150, w: 26, e: 330, d: 12},
  {id: 'm2', t: "RENAULT → DACIA 1960s", size: 84, y: 140, a: 470, w: 30, e: 650, d: 10},
  {id: 'm3', t: "ABOUT 20 MINUTES", size: 92, y: 140, a: 880, w: 24, e: 982, d: 10},
  {id: 'm4', t: "ENGINE ACTING UP", size: 92, y: 140, a: 1010, w: 24, e: 1150, d: 10},
  {id: 'm5', t: "VILLAGE STOP", size: 96, y: 140, a: 1196, w: 22, e: 1330, d: 10}];
const TAGA = [10, 1900, "JOURNALIST'S RECONSTRUCTION"];
const TAGS = [
  [356, 678, "REPRESENTATIVE MODEL · CC BY-SA 3.0 · dacia24.de"],
  [686, 992, "SCHEMATIC · ROUTE NOT SHOWN"],
  [1000, 1172, "DOCTOR LATER SAID"],
  [1178, 1900, "SCHEMATIC · MODELS NOT ESTABLISHED"]];

/* ------------------------------------------------------------ layout */
const S = .46, YR = 740, YC = YR - 130 * S, HW = 500 * S * .9 / 2;                  /* car scale, wheel-contact y, car centre y */
const ROAD_T = YR - 38, ROAD_B = YR + 46, TRAIL_Y = YR + 24;
const X0 = 400, X1 = 940, C2X = 1470, C2END = 1640;         /* start of the drive, end of the drive, other car, other car after leaving */
const WIN = [[545, 78], [420, 78], [330, 80]];               /* passenger dots: window positions in car space */

/* ------------------------------------------------------------ DOM build */
const world = $('world'), ui = $('ui');
const NS = 'http://www.w3.org/2000/svg';
const S_ = (n, a, p) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
const D_ = (cls, p, html) => { const e = document.createElement('div'); e.className = cls; if (html) e.innerHTML = html; (p || world).appendChild(e); return e; };
const circP = (cx, cy, r) => `M${cx - r},${cy} a${r},${r} 0 1,0 ${2 * r},0 a${r},${r} 0 1,0 ${-2 * r},0`;
const layer = () => { const s = S_('svg', {width: W, height: H, viewBox: `0 0 ${W} ${H}`}); s.style.cssText = 'position:absolute;left:0;top:0;pointer-events:none'; world.appendChild(s); return s; };
const setDash = (e, t) => { e.style.strokeDasharray = '1 1'; e.style.strokeDashoffset = 1 - clamp(t); e.style.opacity = t > 0 ? 1 : 0; };
const G = '#c9c9c9';

/* layer 1: behind the cars (road, field, village, route) */
const back = layer();
const road = [
  S_('path', {d: `M120,${ROAD_T} L1800,${ROAD_T}`, pathLength: 1, stroke: G, 'stroke-width': 7, 'stroke-linecap': 'round', fill: 'none'}, back),
  S_('path', {d: `M120,${ROAD_B} L1800,${ROAD_B}`, pathLength: 1, stroke: G, 'stroke-width': 7, 'stroke-linecap': 'round', fill: 'none'}, back)];
const roadMid = S_('path', {d: `M140,${YR} L1780,${YR}`, pathLength: 1, stroke: G, 'stroke-width': 4, 'stroke-dasharray': '22 20', fill: 'none'}, back);
const tufts = []; for (let i = 0; i < 13; i++) { const x = 140 + i * 24 + (i % 3) * 5, h = 14 + (i * 7 % 13); tufts.push(S_('path', {d: `M${x},${ROAD_T - 6} l-6,${-h} M${x},${ROAD_T - 6} l0,${-h - 8} M${x},${ROAD_T - 6} l7,${-h}`, pathLength: 1, stroke: G, 'stroke-width': 5, 'stroke-linecap': 'round', fill: 'none'}, back)); }
const HOUSES = [[1290, 96], [1480, 120], [1680, 100]].map(([x, h]) => S_('path', {d: `M${x - 60},${ROAD_T - 8} V${ROAD_T - 8 - h} L${x},${ROAD_T - 8 - h - 52} L${x + 60},${ROAD_T - 8 - h} V${ROAD_T - 8} Z M${x - 14},${ROAD_T - 8} v-38 h28 v38`, pathLength: 1, stroke: G, 'stroke-width': 6, 'stroke-linejoin': 'round', fill: 'none'}, back));
const trail = S_('path', {stroke: '#111', 'stroke-width': 6, 'stroke-linecap': 'round', fill: 'none'}, back);
const trailDash = S_('path', {stroke: '#111', 'stroke-width': 6, 'stroke-linecap': 'round', 'stroke-dasharray': '14 14', fill: 'none'}, back);

/* layer 2: cars */
const carSvg = (id) => { const s = S_('svg', {}); s.style.cssText = 'position:absolute;left:0;top:0;transform-origin:0 0'; world.appendChild(s); return {svg: s, C: buildCar(s)}; };
const car1 = carSvg(), car2 = carSvg();

/* layer 3: overlay graphics (scale, stopwatch, dots, doctor icon, bubbles, puffs) */
const over = layer();
const scaleG = S_('g', {}, over);
const scaleLine = S_('path', {d: `M${X0},470 L${X1},470`, pathLength: 1, stroke: '#111', 'stroke-width': 6, 'stroke-linecap': 'round', fill: 'none'}, scaleG);
const scaleTicks = S_('path', {d: [0, 1, 2, 3, 4].map((i) => `M${X0 + i * (X1 - X0) / 4},454 L${X0 + i * (X1 - X0) / 4},486`).join(' '), pathLength: 1, stroke: '#111', 'stroke-width': 5, 'stroke-linecap': 'round', fill: 'none'}, scaleG);
const scaleMark = S_('path', {d: 'M-13,-6 L13,-6 L0,20 Z', fill: '#111'}, scaleG);
const lab0 = S_('text', {x: X0, y: 420, 'text-anchor': 'middle', 'font-size': 34, 'font-weight': 700, fill: '#111'}, scaleG); lab0.textContent = '0';
const lab20 = S_('text', {x: X1, y: 420, 'text-anchor': 'middle', 'font-size': 34, 'font-weight': 700, fill: '#111'}, scaleG); lab20.textContent = '20 MIN';
const swG = S_('g', {transform: 'translate(290,470)'}, over);
S_('path', {d: circP(0, 6, 40), fill: '#fff', stroke: '#111', 'stroke-width': 6}, swG);
S_('path', {d: 'M-10,-38 h20 M0,-38 v-12 M-9,-50 h18 M30,-30 l8,-8', stroke: '#111', 'stroke-width': 6, 'stroke-linecap': 'round', fill: 'none'}, swG);
const swHand = S_('path', {d: 'M0,6 L0,-26', stroke: '#111', 'stroke-width': 6, 'stroke-linecap': 'round'}, swG);
S_('circle', {cx: 0, cy: 6, r: 5, fill: '#111'}, swG);
const doc = S_('g', {}, over);                                                   /* doctor icon: no face, cross on the coat */
S_('path', {d: circP(0, -14, 15), fill: '#fff', stroke: '#111', 'stroke-width': 6}, doc);
S_('path', {d: 'M-26,26 a26,26 0 0 1 52,0 Z', fill: '#fff', stroke: '#111', 'stroke-width': 6, 'stroke-linejoin': 'round'}, doc);
S_('path', {d: 'M0,8 v14 M-7,15 h14', stroke: '#111', 'stroke-width': 5, 'stroke-linecap': 'round'}, doc);
const dots = [0, 1, 2].map(() => S_('circle', {r: 12, fill: '#111'}, over));
const bubbles = [0, 1, 2, 3, 4, 5].map(() => S_('circle', {fill: 'none', stroke: '#111', 'stroke-width': 3.5}, over));
const puffs = [0, 1, 2, 3].map(() => { const g = S_('g', {}, over); [[0, 0, 18], [18, -10, 13], [-16, -8, 11]].forEach(([x, y, r]) => S_('circle', {cx: x, cy: y, r, fill: '#fff', stroke: '#111', 'stroke-width': 4}, g)); return g; });

/* layer 4: cut-outs and source cards (HTML) */
const cut = D_('abs'); cut.style.filter = 'drop-shadow(0 16px 16px rgba(0,0,0,.28))'; cut.innerHTML = `<img src="${ASSETS.C01}" style="display:block;width:755px">`;
const cases = D_('abs'); cases.style.filter = 'drop-shadow(0 12px 12px rgba(0,0,0,.32))'; cases.innerHTML = `<img src="${ASSETS.PR16}" style="display:block;width:230px;position:absolute;left:-115px;top:-190px">`;
const dcard = (src, w) => { const e = D_('dcard'); e.style.width = w + 'px'; e.innerHTML = `<img src="${src}" style="display:block;width:100%">`; return e; };
const c03 = dcard(ASSETS.C03, 440), c02 = dcard(ASSETS.C02, 440);

/* ui: texts + tags */
const mains = MAIN.map((m) => { const el = D_('main', ui); el.style.fontSize = m.size + 'px'; el.style.top = (m.y - m.size / 2) + 'px'; const w = document.createElement('span'); w.className = 'w'; w.textContent = m.t; el.appendChild(w); m.el = el; m.w_ = w; return m; });
const tagA = D_('tag tagA', ui); tagA.textContent = TAGA[2];
const tags = TAGS.map(([a, b, t]) => { const e = D_('tag', ui); e.textContent = t; return {a, b, e}; });

/* ------------------------------------------------------------ helpers */
const carTf = (c, x, sy, rot) => { c.svg.style.transform = `translate(${x}px,${YC}px) rotate(${rot || 0}deg) scale(${S},${S * (sy || 1)}) translate(-500px,-170px)`; };
const loc = (x, cx, lx, ly) => [cx + (lx - 500) * S, YC + (ly - 170) * S];      /* car-space -> world */
const JERK = [1010, 1030, 1050, 1072];
const HOP_IN = [700, 714, 728], HOP_OUT = [1584, 1598, 1612];
const HOP_D = 30, HOP_OUT_D = 34;
function car1X(f) {
  let x = X0; if (f > 770) x = lerp(X0, X1, eio(pr(f, 770, 990)));
  JERK.forEach((t) => { x += 6 * eo(pr(f, t, t + 8)); });
  x += 16 * eio(pr(f, 1300, 1345)); return x;
}
function car2X(f) { return lerp(C2X, C2END, eio(pr(f, 1650, 1710))); }
function textStyle(m, f) {
  const rv = pr(f, m.a, m.a + m.w), er = m.e ? pr(f, m.e, m.e + m.d) : 0, vis = f >= m.a && er < 1;
  m.el.style.visibility = vis ? 'visible' : 'hidden';
  if (vis) m.w_.style.clipPath = `inset(-10% ${((1 - rv) * 100).toFixed(2)}% -10% ${(er * 100).toFixed(2)}%)`;
}
function place(el, x, y, o, extra) { el.style.transform = `translate(${x}px,${y}px)${extra || ''}`; el.style.opacity = o; el.style.display = o <= 0 ? 'none' : 'block'; }

/* --------------------------------------------------------------- render */
function render(f) {
  f = Math.max(0, Math.min(N - 1, Math.round(f)));
  const dr = 1 + 0.02 * f / N; world.style.transform = `scale(${dr.toFixed(5)})`;
  const sw = 6.4 / (S * dr);

  /* road, field, village */
  const rp = pr(f, 6, 60); road.forEach((e) => setDash(e, rp)); setDash(roadMid, pr(f, 20, 70));
  tufts.forEach((e, i) => setDash(e, pr(f, 30 + i * 2, 50 + i * 2)));
  HOUSES.forEach((e, i) => setDash(e, pr(f, 1180 + i * 14, 1230 + i * 14)));

  /* car 1: draws itself at the stop beside the field, then drives */
  const x1 = car1X(f);
  let rot1 = 0; JERK.forEach((t) => { const k = pr(f, t, t + 8); if (k > 0 && k < 1) rot1 += -1.3 * Math.sin(k * Math.PI); });
  let sq = 0; [730, 744, 758].forEach((t) => { if (f >= t && f < t + 4) sq = Math.max(sq, 1 - (f - t) / 4); });
  drawCar(car1.C, pr(f, 30, 104), sw); car1.svg.style.display = f < 30 ? 'none' : 'block'; carTf(car1, x1, 1 - .02 * sq, rot1);

  /* route trail (ink) behind car 1, dashed extension towards car 2 */
  const trailOn = f > 770; trail.style.opacity = trailOn ? 1 : 0; if (trailOn) trail.setAttribute('d', `M${X0},${TRAIL_Y} L${x1},${TRAIL_Y}`);
  const dp = pr(f, 1420, 1500), x2 = car2X(f), dEnd = lerp(x1 + HW, f < 1650 ? C2X - HW : x2 - HW, dp);
  trailDash.style.opacity = dp > 0 ? 1 : 0; if (dp > 0) trailDash.setAttribute('d', `M${x1 + HW - 20},${TRAIL_Y} L${Math.max(x1 + HW - 19, dEnd)},${TRAIL_Y}`);

  /* car 2 (another Dacia): draws itself in the village, later drives on */
  drawCar(car2.C, pr(f, 1230, 1300), sw); car2.svg.style.display = f < 1230 ? 'none' : 'block'; carTf(car2, x2, 1, 0);

  /* doctor icon above car 1 */
  { const t = eob(pr(f, 118, 136)); doc.style.opacity = f >= 118 ? 1 : 0; doc.setAttribute('transform', `translate(${x1 - 20},${YC - 146 * S - 52}) scale(${Math.max(0.001, t)})`); }

  /* 20-minute scale + stopwatch (motif from C12) */
  { const sp = pr(f, 684, 726) * (1 - pr(f, 1166, 1186)); scaleG.style.opacity = sp > 0 ? 1 : 0; swG.style.opacity = sp > 0 ? 1 : 0;
    setDash(scaleLine, pr(f, 684, 716)); setDash(scaleTicks, pr(f, 700, 726));
    scaleG.style.opacity = f >= 684 && f < 1186 ? 1 - pr(f, 1166, 1186) : 0; swG.style.opacity = scaleG.style.opacity;
    scaleMark.setAttribute('transform', `translate(${Math.min(x1, X1)},508)`); scaleMark.style.opacity = f > 740 ? 1 : 0;
    const prog = clamp((Math.min(x1, X1) - X0) / (X1 - X0)); swHand.setAttribute('transform', `rotate(${120 * prog} 0 6)`); }

  /* passengers = three dots, no faces */
  dots.forEach((d, i) => {
    let x, y, show = true;
    const a = HOP_IN[i], b = a + HOP_D, wc = loc(0, x1, WIN[i][0], WIN[i][1]);
    const ground = [x1 - 250 + i * 34, YR - 14];
    if (f < a - 6) show = false;
    if (f < a) { x = ground[0]; y = ground[1]; }
    else if (f < b) { const t = pr(f, a, b); x = lerp(ground[0], wc[0], eio(t)); y = lerp(ground[1], wc[1], t) - Math.sin(t * Math.PI) * 90; }
    else if (f < HOP_OUT[i]) { x = wc[0]; y = wc[1]; }
    else {
      const a2 = HOP_OUT[i], b2 = a2 + HOP_OUT_D, w2 = loc(0, x2, WIN[i][0], WIN[i][1]);
      if (f < b2) { const t = pr(f, a2, b2); x = lerp(wc[0], w2[0], eio(t)); y = lerp(wc[1], w2[1], t) - Math.sin(t * Math.PI) * 150; } else { x = w2[0]; y = w2[1]; }
    }
    d.setAttribute('cx', x); d.setAttribute('cy', y); d.style.opacity = show ? 1 : 0;
    const wob = (f >= a && f < a + 6) ? 1 : 1; d.setAttribute('r', 12 * wob);
  });

  /* gag 2: exhaust puffs at the engine's jerks (comic, 1.2 s) */
  puffs.forEach((g, i) => { const t = pr(f, JERK[i], JERK[i] + 30), on = f >= JERK[i] && t < 1; g.style.opacity = on ? 1 - t * t : 0;
    if (on) { const ex = loc(0, car1X(JERK[i]), 40, 250); g.setAttribute('transform', `translate(${ex[0] - 50 * t},${ex[1] - 46 * t}) scale(${.8 + 1.3 * t})`); } });
  /* washing bubbles around car 2 */
  bubbles.forEach((b, i) => { const t0 = 1310 + i * 17, ph = ((f - t0) / 70) % 1; const on = f >= t0 && f < 1640 && ph >= 0;
    b.style.opacity = on ? (1 - pr(f, 1618, 1640)) * Math.min(1, ph * 6) * (1 - ph * ph) : 0;
    b.setAttribute('cx', C2X - 130 + i * 52 + Math.sin(ph * 6 + i) * 8); b.setAttribute('cy', YC - 146 * S - 18 - ph * 70); b.setAttribute('r', 7 + (i % 3) * 3.5); });

  /* C01 cut-out (representative model) + gag 1: suitcases on the family sedan's roof */
  {
    const en = eob(pr(f, 350, 376)), ex = ei(pr(f, 652, 676)); const cx = f < 652 ? lerp(2200, 1130, en) : lerp(1130, 2200, ex);
    const cy = 430; let sy = 1; const lt = 388; if (f >= lt && f < lt + 5) sy = 1 - .05 * (1 - (f - lt) / 5);
    cut.style.display = (f < 350 || f > 678) ? 'none' : 'block';
    cut.style.transform = `translate(${cx - 377}px,${cy - 210}px) translate(377px,420px) scale(1,${sy}) translate(-377px,-420px)`;
    /* suitcases: drop on roof at f388, stay ~30 f, leave before the next fact */
    const drop = pr(f, 372, 388), leave = ei(pr(f, 424, 446)); const rx = 1130 + 140;
    const roofY = cy - 210 + 12; let by = lerp(roofY - 480, roofY + 34, 1 - Math.pow(1 - drop, 2));
    if (f >= 424) by = roofY + 34 - leave * 560;
    let sr = f >= 424 ? leave * -8 : 0; const sq2 = (f >= 388 && f < 393) ? 1 - .06 * (1 - (f - 388) / 5) : 1;
    cases.style.display = (f < 372 || f > 448) ? 'none' : 'block';
    cases.style.transform = `translate(${rx}px,${by}px) rotate(${sr}deg) scale(1,${sq2})`;
    cases.firstChild.style.top = '-190px';
  }
  /* small source cards (tags, never read) */
  place(c03, 1690, 952, (f >= 440 && f < 686) ? Math.min(pr(f, 440, 452), 1 - pr(f, 672, 686)) : 0, ' translate(-50%,-50%) rotate(1.2deg)');
  place(c02, 1690, 952, f >= 1010 ? pr(f, 1010, 1022) : 0, ' translate(-50%,-50%) rotate(-1deg)');

  /* texts + tags */
  mains.forEach((m) => textStyle(m, f));
  tagA.style.opacity = Math.min(pr(f, TAGA[0], TAGA[0] + 6), 1);
  tags.forEach((t) => { const o = Math.min(pr(f, t.a, t.a + 6), 1 - pr(f, t.b - 6, t.b)); t.e.style.opacity = o.toFixed(3); });
}

/* ------------------------------------------------------------ validation */
window.__validate = function () {
  const out = [], hold = (chars) => Math.max(48, Math.ceil((chars / 15 + .5) * 60));
  const all = MAIN.map((m) => ({id: m.id, chars: m.t.length, a: m.a, e: m.e || N, d: m.d, size: m.size, words: m.t.split(/\s+/).length}));
  all.forEach((m) => { if (m.e - m.a < hold(m.chars)) out.push(`${m.id}: visible ${m.e - m.a}f < required ${hold(m.chars)}f`); if (m.size < 56) out.push(m.id + ' size'); if (m.words > 4) out.push(m.id + ' > 4 words'); });
  for (let i = 1; i < all.length; i++) if (all[i].a < all[i - 1].e + all[i - 1].d) out.push(`overlap ${all[i - 1].id} → ${all[i].id}`);
  TAGS.forEach(([a, b, t]) => { if (b - a < 48) out.push('tag too short ' + t); });
  return {issues: out, mains: all, N, FPS};
};
window.__zones = function (f) { render(f); let n = 0; const names = []; mains.forEach((m) => { if (m.el.style.visibility === 'visible' && !/ 100(\.0+)?%\s*-10%\s*0/.test(m.w_.style.clipPath) && !/inset\(-10% 100/.test(m.w_.style.clipPath) && !/ 100(\.0+)?%\)/.test(m.w_.style.clipPath)) { n++; names.push(m.id); } }); return {n, names}; };
window.renderFrame = render; window.TOTAL_FRAMES = N;

/* ----------------------------------------------------- viewer + player */
const q = new URLSearchParams(location.search), vp = $('viewport'), CUES = window.CUES || [];
function fit() { if (document.body.classList.contains('render')) { vp.style.transform = 'none'; return; } const s = Math.min(innerWidth / W, (innerHeight - 52) / H); vp.style.transform = `scale(${s})`; }
if (q.get('render')) document.body.classList.add('render');
addEventListener('resize', fit); fit();
let cur = q.get('frame') ? +q.get('frame') : 0; render(cur);
if (!document.body.classList.contains('render')) {
  const rng = $('rng'), lab = $('lab'), btn = $('play'); rng.max = N - 1;
  let playing = false, t0 = 0, base = 0, ac = null, bufs = {}, played = new Set();
  const show = (f) => { cur = f; render(f); rng.value = f; lab.textContent = `frame ${f} / ${N - 1} · ${(f / FPS).toFixed(2)} s`; };
  rng.oninput = () => { show(+rng.value); played.clear(); };
  async function loadAudio() { if (ac) return; ac = new (window.AudioContext || window.webkitAudioContext)(); for (const k in (window.SFX_B64 || {})) { const bin = atob(window.SFX_B64[k]); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); bufs[k] = await ac.decodeAudioData(u.buffer); } }
  function cueAt(f) { CUES.forEach((c, i) => { if (f >= c.f && !played.has(i)) { played.add(i); if (bufs[c.clip] && f - c.f < 30) { const s = ac.createBufferSource(); s.buffer = bufs[c.clip]; const g = ac.createGain(); g.gain.value = c.gain; s.connect(g).connect(ac.destination); s.start(); } } }); }
  function tick(ts) { if (!playing) return; const f = Math.floor(base + (ts - t0) / 1000 * FPS); if (f >= N - 1) { show(N - 1); playing = false; btn.textContent = '▶ Play'; return; } show(f); cueAt(f); requestAnimationFrame(tick); }
  btn.onclick = async () => { if (playing) { playing = false; btn.textContent = '▶ Play'; return; } await loadAudio(); if (ac.state === 'suspended') await ac.resume(); base = cur >= N - 2 ? 0 : cur; played = new Set(CUES.map((c, i) => c.f < base ? i : -1)); playing = true; btn.textContent = '❚❚ Pause'; t0 = performance.now(); requestAnimationFrame(tick); };
  show(cur);
}
})();
