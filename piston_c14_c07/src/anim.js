/* PISTON EXPLAINS · C14 + C07 (Dongfeng) merged clip · 1920x1080 · 60 fps · 2400 frames (40.000 s)
   Deterministic: everything is a pure function of the frame index.  renderFrame(n) draws frame n.
   Retime on the real voice: edit only the TIMING block (SB = sentence starts) and the per-scene frame numbers in render(). */
(function () {
'use strict';
const W = 1920, H = 1080, FPS = 60, N = 2400;
const $ = (id) => document.getElementById(id);
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const pr = (f, a, b) => clamp((f - a) / (b - a));
const eio = (t) => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;     /* easeInOut (cubic) */
const eo = (t) => 1 - Math.pow(1 - t, 3);                                          /* easeOut */
const ei = (t) => t * t * t;                                                       /* easeIn */
const eob = (t, s = 1.2) => { const c3 = s + 1; return 1 + c3 * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2); }; /* easeOut, ~6% overshoot */

/* ---------------------------------------------------------------- TIMING */
/* sentence boundaries of the VO on the 40 s timeline (frames). 9 sentences, VO ~ 131 words.
   Derived from the storyboard durations scaled 38.43/46.5, then 95 frames of hold. */
const SB = [0, 189, 433, 677, 1006, 1474, 1613, 1872, 2201, 2305];
const VO = [
  "Why would China's leader take a car ride around a garden?",
  "He was trying out what a Communist Party history calls China's first homemade sedan.",
  "One of its designers later recalled the day, May twenty-first, nineteen fifty-eight.",
  "Mao circled the garden and said he was glad to be riding in a car China had made itself.",
  "The car was a sample, built that May and parked inside the leadership's compound in Beijing, where delegates to a Communist Party congress could look it over.",
  "Workers had hammered its body out by hand.",
  "Up front, it carried a golden dragon, and its taillights were shaped like Chinese lanterns.",
  "But the team had used a French Simca as its reference and based the engine on a Mercedes design.",
  "Homemade didn't mean starting from scratch."];
/* frame at which word #i (0-based) of sentence s starts: proportional to characters */
function wf(s, i) {
  const w = VO[s].split(' '); let tot = 0, c = 0;
  w.forEach((x, k) => { if (k === i) c = tot; tot += x.length + 1; });
  return Math.round(SB[s] + (SB[s + 1] - SB[s]) * c / tot);
}
window.WF = wf;

/* -------------------------------------------------------- content specs */
/* main texts: a = start writing, w = write duration, e = start erasing (0 = stays), d = erase duration */
const MAIN = [
  {id: 'm1', t: "WHY A GARDEN RIDE?", size: 92, y: 150, a: 44, w: 28, e: 189, d: 12},
  {id: 'm3', t: "21 MAY 1958", size: 96, y: 150, a: 452, w: 26, e: 650, d: 12},
  {id: 'm4', t: "CHINA-MADE CAR", size: 92, y: 150, a: 905, w: 24, e: 1000, d: 12},
  {id: 'm5', t: "LEADERSHIP COMPOUND", size: 88, y: 150, a: 1190, w: 30, e: 1300, d: 12},
  {id: 'm6', t: "PARTY CONGRESS", size: 92, y: 150, a: 1330, w: 24, e: 1462, d: 12},
  {id: 'm7', t: "HAND-HAMMERED", size: 96, y: 150, a: 1490, w: 26, e: 1602, d: 10},
  {id: 'm8', t: "GOLDEN DRAGON", size: 96, y: 150, a: 1668, w: 24, e: 1770, d: 12},
  {id: 'm9', t: "LANTERN TAILLIGHTS", size: 88, y: 150, a: 1790, w: 28, e: 1898, d: 12},
  {id: 'm10', t: "FRENCH SIMCA", size: 96, y: 150, a: 1984, w: 22, e: 2066, d: 12},
  {id: 'm11', t: "MERCEDES ENGINE", size: 92, y: 150, a: 2086, w: 24, e: 2178, d: 12},
  {id: 'm12', t: "HOMEMADE _ FROM SCRATCH", size: 84, y: 170, a: 2206, w: 34, e: 0, d: 0}];
const LABEL = {id: 'lbl', t: "CHINA'S FIRST\nHOMEMADE SEDAN", a: 286, w: 28, e: 431, d: 8};
const TAGS = [
  [12, 190, "PHOTO: INSPECTION, NOT A RIDE"],
  [196, 433, "CLAIM: PARTY HISTORY"],
  [440, 677, "DESIGNER'S RECOLLECTION"],
  [684, 1006, "SCHEMATIC · RETOLD, NOT A QUOTE"],
  [1014, 1474, "SCHEMATIC · MAP PIN APPROXIMATE"],
  [1480, 1613, "HAND-HAMMERED · DESIGNER'S ACCOUNT"],
  [1620, 1780, "MUSEUM DISPLAY · NOT THE 1958 SAMPLE"],
  [1786, 1872, "LANTERN-STYLE LIGHTS · SCHEMATIC"],
  [1910, 2068, "SIMCA MODEL PHOTO · REFERENCE ONLY"],
  [2074, 2200, "M121 ENGINE · DESIGN REFERENCE ONLY"],
  [2208, 2420, "INFERRED FROM DESIGNER'S ACCOUNT"]];

/* D03 photo trace (coordinates in the 1000x800 photo): hand-drawn line over the car only */
const TRACE = [
  {d: 'M0,152 C90,146 170,158 225,192', a: 0.00, b: 0.10},
  {d: 'M225,192 L315,297 M0,332 C100,312 220,300 315,297', a: 0.08, b: 0.20},
  {d: 'M60,346 C200,312 380,300 520,305 C600,310 660,318 692,332', a: 0.18, b: 0.36},
  {d: 'M412,440 C410,398 438,380 462,392 C482,410 482,442 470,464 C454,488 424,484 412,456 Z', a: 0.34, b: 0.44},
  {d: 'M485,500 L655,420 L668,478 L470,566 Z', a: 0.42, b: 0.56},
  {d: 'M320,652 C400,668 500,644 560,602 L690,500 M322,690 C420,692 520,662 588,610', a: 0.54, b: 0.70},
  {d: 'M90,640 a115,115 0 1,0 230,0 a115,115 0 1,0 -230,0 M137,640 a68,68 0 1,0 136,0 a68,68 0 1,0 -136,0', a: 0.68, b: 0.88},
  {d: 'M0,472 L330,494 M672,368 a12,28 0 1,0 24,0 a12,28 0 1,0 -24,0', a: 0.86, b: 1.00}];

const CUES = window.CUES || [];

/* ------------------------------------------------------------ DOM build */
const CH = 460, PAD = 20;
const world = $('world'), ui = $('ui');
const NS = 'http://www.w3.org/2000/svg';
const S_ = (n, a, p) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
const D_ = (cls, p, html) => { const e = document.createElement('div'); e.className = cls; if (html) e.innerHTML = html; (p || world).appendChild(e); return e; };
const circP = (cx, cy, r) => `M${cx - r},${cy} a${r},${r} 0 1,0 ${2 * r},0 a${r},${r} 0 1,0 ${-2 * r},0`;

function mkCard(src, aspect, extra) {
  const iw = Math.round((CH - 2 * PAD) * aspect), w = iw + 2 * PAD;
  const el = D_('card'); el.style.width = w + 'px'; el.style.height = CH + 'px';
  const ph = D_('photo', el); const img = document.createElement('img'); img.src = src; ph.appendChild(img);
  el.__w = w; el.__h = CH; el.__iw = iw; el.__ih = CH - 2 * PAD; el.__img = img; el.__ph = ph;
  return el;
}
function put(el, x, y, s, r, o) {
  const w = el.__w, h = el.__h;
  el.style.transform = `translate(${(x - w / 2).toFixed(2)}px,${(y - h / 2).toFixed(2)}px) rotate(${(r || 0).toFixed(3)}deg) scale(${(s == null ? 1 : s).toFixed(4)})`;
  el.style.opacity = o == null ? 1 : o; el.style.display = (o === 0) ? 'none' : 'block';
}

/* layer 1: plan (garden, compound) */
const plan = S_('svg', {width: W, height: H, viewBox: `0 0 ${W} ${H}`}); plan.style.cssText = 'position:absolute;left:0;top:0';
world.appendChild(plan);
const LAWN = 'M330,290 H1590 A90,90 0 0 1 1680,380 V840 A90,90 0 0 1 1590,930 H330 A90,90 0 0 1 240,840 V380 A90,90 0 0 1 330,290 Z';
const gard = {
  lawn: S_('path', {d: LAWN, pathLength: 1, fill: 'none', stroke: '#c9c9c9', 'stroke-width': 7, 'stroke-linejoin': 'round'}, plan),
  trees: [[330, 400, 40], [420, 850, 34], [1000, 860, 30], [1580, 420, 44], [1560, 850, 34], [700, 410, 28], [1240, 400, 30]].map(([x, y, r]) =>
    S_('path', {d: circP(x, y, r), pathLength: 1, fill: 'none', stroke: '#c9c9c9', 'stroke-width': 6}, plan)),
  bench: S_('path', {d: 'M830,880 h120 M840,880 v20 M940,880 v20 M835,864 h110', pathLength: 1, fill: 'none', stroke: '#c9c9c9', 'stroke-width': 6, 'stroke-linecap': 'round'}, plan)};
const compound = S_('path', {d: 'M940,430 H1740 A40,40 0 0 1 1780,470 V900 A40,40 0 0 1 1740,940 H940 A40,40 0 0 1 900,900 V470 A40,40 0 0 1 940,430 Z', pathLength: 1, fill: 'none', stroke: '#c9c9c9', 'stroke-width': 7, 'stroke-linejoin': 'round'}, plan);
const arcTrack = S_('path', {fill: 'none', stroke: '#111', 'stroke-width': 5, 'stroke-dasharray': '16 14', 'stroke-linecap': 'round'}, plan);
const DEL = [[1050, 560], [1130, 515], [1230, 540], [1330, 512], [1430, 540], [1530, 515], [1630, 560], [1712, 610]].map(([x, y]) =>
  ({x, y, e: S_('circle', {r: 11, fill: '#111'}, plan)}));

/* layer 2: hero */
const heroSvg = S_('svg', {}); heroSvg.style.cssText = 'position:absolute;left:0;top:0;transform-origin:0 0';
world.appendChild(heroSvg);
const HERO = buildHero(heroSvg);

/* layer 3: props + cards */
const lantern = D_('abs prop'); lantern.innerHTML = '<div style="position:absolute;left:-1.5px;top:-1400px;width:3px;height:1400px;background:#111"></div><img src="' + ASSETS.PR13 + '" style="position:absolute;left:-95px;top:0;width:190px">';
const hammer = D_('abs prop'); hammer.innerHTML = '<img src="' + ASSETS.PR12 + '" style="position:absolute;left:-323px;top:-207px;width:340px">';
const boxA = D_('abs prop'), boxB = D_('abs prop'), cake = D_('abs prop');
[boxA, boxB].forEach((b) => { b.innerHTML = '<img src="' + ASSETS.PR15 + '" style="position:absolute;left:-130px;top:-110px;width:260px">'; });
const boxTxtA = D_('boxtxt', boxA, 'SIMCA'), boxTxtB = D_('boxtxt', boxB, 'MERCEDES');
boxTxtA.style.left = '-58px'; boxTxtA.style.top = '-20px'; boxTxtB.style.left = '-76px'; boxTxtB.style.top = '-20px';
cake.innerHTML = '<img src="' + ASSETS.PR14 + '" style="position:absolute;left:-215px;top:-154px;width:430px">';
const label = D_('abs prop'); label.innerHTML = '<img src="' + ASSETS.PR11 + '" style="position:absolute;left:-310px;top:-98px;width:620px;height:196px">';
const lblTxt = D_('lbltxt', label); lblTxt.style.left = '-310px'; lblTxt.style.top = '-56px'; lblTxt.style.width = '620px'; lblTxt.style.height = '120px'; lblTxt.innerHTML = 'CHINA\'S FIRST<br>HOMEMADE SEDAN';

const cD03 = mkCard(ASSETS.D03, 1000 / 800), cD08 = mkCard(ASSETS.D08, 2400 / 1680), cD09 = mkCard(ASSETS.D09, 1200 / 618),
  cD10 = mkCard(ASSETS.D10, 1205 / 843), cMAP = mkCard(ASSETS.D11, 620 / 520);
/* trace overlay + wash inside D03 card */
const wash = D_('wash', cD03.__ph);
const trSvg = S_('svg', {width: cD03.__iw, height: cD03.__ih, viewBox: '0 0 1000 800'}); cD03.__ph.appendChild(trSvg);
const trPaths = TRACE.map((t) => S_('path', {d: t.d, pathLength: 1, fill: 'none', stroke: '#111', 'stroke-width': 9.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round'}, trSvg));
cD08.__img.style.transformOrigin = '0 0';

/* layer 4: leaders / pin / gold ring (above cards) */
const top = S_('svg', {width: W, height: H, viewBox: `0 0 ${W} ${H}`}); top.style.cssText = 'position:absolute;left:0;top:0;pointer-events:none';
world.appendChild(top);
const mkLeader = () => S_('path', {fill: 'none', stroke: '#111', 'stroke-width': 4.5, 'stroke-dasharray': '14 12', 'stroke-linecap': 'round'}, top);
const LD = {label: mkLeader(), dragon: mkLeader(), tail: mkLeader(), simca: mkLeader(), merc: mkLeader(), pin: mkLeader(), flow: mkLeader()};
const flowHead = S_('path', {fill: 'none', stroke: '#111', 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round'}, top);
const pinG = S_('g', {}, top);
const pinRing = S_('circle', {r: 24, fill: 'none', stroke: '#111', 'stroke-width': 4}, pinG);
const pinDot = S_('circle', {r: 12, fill: '#111'}, pinG);
const goldRingInk = S_('path', {d: circP(0, 0, 70), pathLength: 1, fill: 'none', stroke: '#111', 'stroke-width': 11, 'stroke-linecap': 'round'}, top);
const goldRing = S_('path', {d: circP(0, 0, 70), pathLength: 1, fill: 'none', stroke: '#D9A21B', 'stroke-width': 5.5, 'stroke-linecap': 'round'}, top);

/* ui: main texts + tags */
const mains = MAIN.map((m) => {
  const el = D_('main', ui); el.style.fontSize = m.size + 'px'; el.style.top = (m.y - m.size / 2) + 'px';
  const w = document.createElement('span'); w.className = 'w'; w.innerHTML = m.t.replace('_', '<span class="ne" style="display:inline-block;padding:0 .14em;font-size:1.3em;line-height:.8;vertical-align:-.06em;opacity:0">≠</span>'); el.appendChild(w);
  m.el = el; m.w_ = w; m.ne = w.querySelector('.ne'); return m;
});
const tags = TAGS.map(([a, b, t]) => { const e = D_('tag', ui); e.textContent = t; return {a, b, e}; });

/* ------------------------------------------------------- helpers: state */
const HS = {x: 960, y: 640, s: 1.15, r: 0, sy: 1};
function heroTarget(f) {
  /* piecewise path of the hero: [frame, x, y, scale] with easeInOut between neighbours */
  const K = [[0, 960, 640, 1.15], [677, 960, 640, 1.15], [745, 400, 780, .36]];
  if (f <= 677) return [960, 640, 1.15, 0];
  if (f < 745) { const t = eio(pr(f, 677, 745)); return [lerp(960, 400, t), lerp(640, 780, t), lerp(1.15, .36, t), 0]; }
  if (f < 905) { /* arc across the garden */
    const u = eio(pr(f, 745, 905)); const b = bez(u), d = bezD(u);
    return [b[0], b[1], .36, clamp(Math.atan2(d[1], d[0]) * 180 / Math.PI * .28, -11, 11)];
  }
  if (f < 990) return [1520, 760, .36, 0];
  if (f < 1054) { const t = eio(pr(f, 990, 1054)); return [lerp(1520, 1340, t), lerp(760, 730, t), lerp(.36, .66, t), 0]; }
  if (f < 1474) return [1340, 730, .66, 0];
  if (f < 1508) { const t = eio(pr(f, 1474, 1508)); return [lerp(1340, 960, t), lerp(730, 690, t), lerp(.66, 1.2, t), 0]; }
  if (f < 1626) return [960, 690, 1.2, 0];
  if (f < 1672) { const t = eio(pr(f, 1626, 1672)); return [lerp(960, 515, t), lerp(690, 650, t), lerp(1.2, .9, t), 0]; }
  if (f < 1876) return [515, 650, .9, 0];
  if (f < 1922) { const t = eio(pr(f, 1876, 1922)); return [lerp(515, 960, t), lerp(650, 895, t), lerp(.9, .55, t), 0]; }
  if (f < 2200) return [960, 895, .55, 0];
  if (f < 2262) { const t = eio(pr(f, 2200, 2262)); return [960, lerp(895, 745, t), lerp(.55, .62, t), 0]; }
  return [960, 745, .62, 0];
}
/* garden trajectory (hero centre) : cubic bezier */
const BP = [[400, 780], [700, 330], [1300, 330], [1520, 760]];
function bez(u) { const a = (1 - u) ** 3, b = 3 * u * (1 - u) ** 2, c = 3 * u * u * (1 - u), d = u ** 3; return [a * BP[0][0] + b * BP[1][0] + c * BP[2][0] + d * BP[3][0], a * BP[0][1] + b * BP[1][1] + c * BP[2][1] + d * BP[3][1]]; }
function bezD(u) { const m = 1 - u; return [3 * m * m * (BP[1][0] - BP[0][0]) + 6 * m * u * (BP[2][0] - BP[1][0]) + 3 * u * u * (BP[3][0] - BP[2][0]), 3 * m * m * (BP[1][1] - BP[0][1]) + 6 * m * u * (BP[2][1] - BP[1][1]) + 3 * u * u * (BP[3][1] - BP[2][1])]; }
/* ground track under the hero centre path, drawn as dashed line */
arcTrack.setAttribute('d', (() => { let s = ''; for (let i = 0; i <= 60; i++) { const b = bez(i / 60); s += (i ? 'L' : 'M') + b[0].toFixed(1) + ',' + (b[1] + 47).toFixed(1); } return s; })());
const arcPts = (() => { const a = []; for (let i = 0; i <= 60; i++) { const b = bez(i / 60); a.push([b[0], b[1] + 47]); } return a; })();

const h2w = (x, y) => [HS.x + (x - 500) * HS.s, HS.y + (y - 170) * HS.s * HS.sy];

function setLeader(el, x1, y1, x2, y2, t) {
  if (t <= 0) { el.style.opacity = 0; return; }
  el.style.opacity = 1; const e = eio(clamp(t));
  el.setAttribute('d', `M${x1.toFixed(1)},${y1.toFixed(1)} L${(x1 + (x2 - x1) * e).toFixed(1)},${(y1 + (y2 - y1) * e).toFixed(1)}`);
}
function textStyle(m, f, extra) {
  const rv = pr(f, m.a, m.a + m.w), er = m.e ? pr(f, m.e, m.e + m.d) : 0;
  const vis = f >= m.a && er < 1;
  m.el.style.visibility = vis ? 'visible' : 'hidden';
  if (vis) m.w_.style.clipPath = `inset(-10% ${((1 - rv) * 100).toFixed(2)}% -10% ${(er * 100).toFixed(2)}%)`;
}

/* --------------------------------------------------------------- render */
const cam = {drift: 0};
function render(f) {
  f = Math.max(0, Math.min(N - 1, Math.round(f)));
  /* slow global drift 0 → 2 % (no dead frame) */
  const dr = 1 + 0.02 * f / N;
  world.style.transform = `scale(${dr.toFixed(5)})`;

  /* ---- hero ---- */
  const ht = heroTarget(f);
  /* squash on hammer impacts (2-4 frames) */
  const imp = [1519, 1547, 1573]; let sq = 0; imp.forEach((t) => { if (f >= t && f < t + 4) sq = Math.max(sq, 1 - (f - t) / 4); });
  HS.x = ht[0]; HS.y = ht[1]; HS.s = ht[2]; HS.r = ht[3]; HS.sy = 1 - .022 * sq;
  const pd = pr(f, 455, 640);
  heroSvg.style.display = f < 455 ? 'none' : 'block';
  heroSvg.style.transform = `translate(${HS.x}px,${HS.y}px) rotate(${HS.r}deg) scale(${HS.s},${HS.s * HS.sy}) translate(-500px,-170px)`;
  const sw = 6.4 / (HS.s * dr);
  const dents = imp.map((t) => clamp((f - t) / 9));
  const dragonP = pr(f, 1700, 1730), ringP = pr(f, 1718, 1738) * (1 - pr(f, 1850, 1866));
  drawHero(HERO, pd, sw, {dents, dragon: dragonP, ring: ringP, tailRing: (f >= 1815 && f < 1880) ? clamp(pr(f, 1815, 1835)) * clamp(1 - pr(f, 1868, 1880)) : 0});

  /* ---- D03 card: land, wash, trace, shift, exit ---- */
  {
    const t = pr(f, 0, 24); let x = 960, y = 640, o = 1;
    y = 640 + (1 - eob(t)) * 170;
    x = lerp(960, 1230, eio(pr(f, 236, 276)));
    if (f > 437) y = 640 + ei(pr(f, 437, 474)) * 800;
    put(cD03, x, y, 1, 0, f < 437 ? o : (f < 474 ? 1 : 0));
    const wa = pr(f, 150, 178) * .58; wash.style.opacity = wa;
    const tp = pr(f, 160, 330);
    TRACE.forEach((q, i) => { const k = clamp((tp - q.a) / (q.b - q.a)); trPaths[i].style.strokeDasharray = '1 1'; trPaths[i].style.strokeDashoffset = 1 - k; trPaths[i].style.opacity = k > 0 ? 1 : 0; });
  }
  /* ---- label (PR11) ---- */
  {
    const enter = eob(pr(f, 282, 306)), exit = ei(pr(f, 433, 456));
    let x = lerp(-420, 560, enter), r = lerp(-8, -2.5, enter);
    if (f >= 433) x = lerp(560, -520, exit);
    label.style.display = (f < 282 || f > 458) ? 'none' : 'block';
    label.style.transform = `translate(${x}px,620px) rotate(${r}deg)`;
    const rv = pr(f, LABEL.a, LABEL.a + LABEL.w), er = pr(f, LABEL.e, LABEL.e + LABEL.d);
    lblTxt.style.visibility = (f >= LABEL.a && er < 1) ? 'visible' : 'hidden';
    lblTxt.style.clipPath = `inset(-10% ${((1 - rv) * 100).toFixed(2)}% -10% ${(er * 100).toFixed(2)}%)`;
    /* leader from label to the car on the photo (car only, never across people) */
    const cx = 1230 - cD03.__w / 2 + PAD, cy = 640 - CH / 2 + PAD; const k = cD03.__iw / 1000;
    const tx = cx + 250 * k, ty = cy + 330 * k;
    setLeader(LD.label, x + 300, 620 - 4, tx, ty, f < 433 ? pr(f, 300, 322) : 0);
  }

  /* ---- garden plan ---- */
  {
    const gp = pr(f, 665, 730), gx = 1 - pr(f, 990, 1020), on = gp > 0 && gx > 0;
    const set = (e, t) => { e.style.strokeDasharray = '1 1'; e.style.strokeDashoffset = 1 - clamp(t); e.style.opacity = t > 0 ? 1 : 0; };
    set(gard.lawn, on ? Math.min(gp, gx) : 0);
    gard.trees.forEach((e, i) => set(e, on ? Math.min(clamp((f - 690 - i * 5) / 24), gx) : 0));
    set(gard.bench, on ? Math.min(pr(f, 715, 740), gx) : 0);
    /* arc track: reveal in front of the car, undraw at the end */
    const vis = arcPts.length;
    let n = Math.round(vis * clamp(pr(f, 735, 775))); let n0 = Math.round(vis * pr(f, 990, 1020));
    let d = ''; for (let i = n0; i < n; i++) d += (d ? 'L' : 'M') + arcPts[i][0].toFixed(1) + ',' + arcPts[i][1].toFixed(1);
    arcTrack.setAttribute('d', d || 'M0,0'); arcTrack.style.opacity = d ? 1 : 0;
  }
  /* ---- compound + map + delegates (scene C) ---- */
  {
    const cp = pr(f, 1030, 1092) * (1 - pr(f, 1474, 1500));
    compound.style.strokeDasharray = '1 1'; compound.style.strokeDashoffset = 1 - cp; compound.style.opacity = cp > 0 ? 1 : 0;
    DEL.forEach((q, i) => {
      const a = 1322 + i * 9, sc = eob(pr(f, a, a + 14)) * (1 - eo(pr(f, 1476 + i * 3, 1492 + i * 3)));
      const dxo = -Math.sin((f - a) / 22 + i) * 3 * clamp((f - a) / 30);
      q.e.setAttribute('cx', q.x + dxo); q.e.setAttribute('cy', q.y + Math.cos((f - a) / 18 + i) * 3 * clamp((f - a) / 30));
      q.e.setAttribute('r', Math.max(0, 11 * sc));
    });
    const en = eob(pr(f, 1148, 1172)), ex = ei(pr(f, 1476, 1502));
    const mx = f < 1476 ? lerp(-420, 470, en) : lerp(470, -560, ex);
    put(cMAP, mx, 690, 1, 0, (f < 1148 || f > 1503) ? 0 : 1);
    /* pin */
    const pp = pr(f, 1206, 1224), by = 663 - (1 - eo(pp)) * 180 - Math.abs(Math.sin(pp * Math.PI * 1.5)) * 18 * (1 - pp);
    pinG.style.opacity = f >= 1206 && f < 1503 ? 1 : 0;
    const pinX = mx - 470 + 488;
    pinG.setAttribute('transform', `translate(${pinX},${by})`);
    pinRing.setAttribute('r', 24 + 10 * pr(f, 1224, 1250) * (1 - pr(f, 1224, 1250)) * 4);
    setLeader(LD.pin, pinX + 14, 663, 900, 663, (f >= 1236 && f < 1474) ? pr(f, 1236, 1270) : 0);
  }
  /* ---- hammer (scene D): enters from the left, strikes rear deck, door, hood, leaves to the right ---- */
  {
    const tg = [[150, 122], [548, 138], [760, 124]].map(([x, y]) => [960 + (x - 500) * 1.2, 690 + (y - 170) * 1.2]);
    const cp = (i) => [tg[i][0] + 296, tg[i][1] + 30];             /* pivot when the striking face touches target i */
    const K = [
      [1496, -420, 300, 40],
      [1512, cp(0)[0], cp(0)[1] - 22, 30], [1519, cp(0)[0], cp(0)[1], 0], [1527, cp(0)[0], cp(0)[1] - 8, 16],
      [1541, cp(1)[0], cp(1)[1] - 22, 30], [1547, cp(1)[0], cp(1)[1], 0], [1555, cp(1)[0], cp(1)[1] - 8, 16],
      [1567, cp(2)[0], cp(2)[1] - 22, 30], [1573, cp(2)[0], cp(2)[1], 0], [1581, cp(2)[0], cp(2)[1] - 8, 16],
      [1598, 2560, cp(2)[1] - 200, 36]];
    let cur = null;
    if (f >= K[0][0] && f <= K[K.length - 1][0]) {
      for (let i = 0; i < K.length - 1; i++) if (f >= K[i][0] && f <= K[i + 1][0]) {
        const a = K[i], b = K[i + 1]; const t0 = pr(f, a[0], b[0]);
        const fast = (b[3] === 0) ? ei(t0) : (a[3] === 0 ? eo(t0) : eio(t0));
        cur = [lerp(a[1], b[1], fast), lerp(a[2], b[2], fast), lerp(a[3], b[3], fast)]; break;
      }
    }
    hammer.style.display = cur ? 'block' : 'none';
    if (cur) hammer.style.transform = `translate(${cur[0]}px,${cur[1]}px) rotate(${cur[2]}deg)`;
  }
  /* ---- D08 card (scene E) ---- */
  {
    const en = eob(pr(f, 1626, 1650)), ex = ei(pr(f, 1772, 1796));
    let x = f < 1772 ? lerp(2400, 1420, en) : lerp(1420, 2500, ex);
    put(cD08, x, 600, 1, 0, (f < 1626 || f > 1798) ? 0 : 1);
    const z = eio(pr(f, 1690, 1740)), sc = lerp(1, 2.6, z);
    /* dragon at (195,118) in the 600x420 photo: keep it centred while zooming */
    const dx = lerp(0, 300 - 195, z), dy = lerp(0, 210 - 118, z);
    cD08.__img.style.width = cD08.__iw + 'px'; cD08.__img.style.height = cD08.__ih + 'px';
    cD08.__img.style.transformOrigin = '195px 118px';
    cD08.__img.style.transform = `translate(${dx}px,${dy}px) scale(${sc})`;
    /* gold ring on the museum dragon */
    const rp = pr(f, 1748, 1770) * (f < 1772 ? 1 : 0);
    goldRing.setAttribute('transform', `translate(${x},600) scale(1)`); goldRingInk.setAttribute('transform', `translate(${x},600)`);
    [goldRing, goldRingInk].forEach((e) => { e.style.strokeDasharray = '1 1'; e.style.strokeDashoffset = 1 - rp; e.style.opacity = rp > 0 ? 1 : 0; });
    /* leader hero dragon -> card */
    const dw = h2w(828, 108);
    setLeader(LD.dragon, dw[0] + 60 * HS.s, dw[1], 1100 - 6, 600, (f >= 1730 && f < 1772) ? pr(f, 1730, 1756) : 0);
  }
  /* ---- lantern (scene E → F) ---- */
  {
    const drop = eob(pr(f, 1790, 1815)), lift = ei(pr(f, 1876, 1904));
    let y = lerp(-320, 300, drop); if (f >= 1876) y = lerp(300, -420, lift);
    const sw_ = f >= 1815 ? Math.sin((f - 1815) / 9) * 5 * Math.exp(-(f - 1815) / 70) : (1 - drop) * 4;
    lantern.style.display = (f < 1790 || f > 1906) ? 'none' : 'block';
    lantern.style.transform = `translate(190px,${y}px) rotate(${sw_}deg)`;
    const tw = h2w(66, 181);
    setLeader(LD.tail, 190, 300 + 233 + 8, tw[0], tw[1] - 50 * HS.s, (f >= 1820 && f < 1876) ? pr(f, 1820, 1845) : 0);
  }
  /* ---- D09 / D10 cards (scene F) + leaders ---- */
  {
    const e9 = eob(pr(f, 1922, 1946)), x9out = ei(pr(f, 2196, 2220));
    put(cD09, f < 2196 ? lerp(-600, 560, e9) : lerp(560, -700, x9out), 520, 1, 0, (f < 1922 || f > 2222) ? 0 : 1);
    const e10 = eob(pr(f, 2060, 2084)), x10out = ei(pr(f, 2196, 2220));
    put(cD10, f < 2196 ? lerp(2500, 1360, e10) : lerp(1360, 2600, x10out), 520, 1, 0, (f < 2060 || f > 2222) ? 0 : 1);
    const hd = h2w(600, 150), hh = h2w(720, 122);
    setLeader(LD.simca, 560, 520 + CH / 2 + 4, hd[0], hd[1] - 6, (f >= 1948 && f < 2196) ? pr(f, 1948, 1978) : 0);
    setLeader(LD.merc, 1360, 520 + CH / 2 + 4, hh[0], hh[1] - 6, (f >= 2088 && f < 2196) ? pr(f, 2088, 2116) : 0);
  }
  /* ---- scene G: boxes, cake, flow arc ---- */
  {
    const dropA = eob(pr(f, 2210, 2228)), dropB = eob(pr(f, 2218, 2236)), dropC = eob(pr(f, 2232, 2250));
    const fadeIn = (a) => pr(f, a, a + 5);
    boxA.style.display = f < 2210 ? 'none' : 'block'; boxA.style.opacity = fadeIn(2210); boxA.style.transform = `translate(300px,${lerp(560, 800, dropA)}px) rotate(-3deg)`;
    boxB.style.display = f < 2218 ? 'none' : 'block'; boxB.style.opacity = fadeIn(2218); boxB.style.transform = `translate(520px,${lerp(570, 812, dropB)}px) rotate(2deg)`;
    const sqC = f >= 2250 && f < 2254 ? 1 - (f - 2250) / 4 : 0;
    cake.style.display = f < 2232 ? 'none' : 'block'; cake.style.opacity = fadeIn(2232); cake.style.transform = `translate(1570px,${lerp(560, 812, dropC)}px) scale(${1 + .04 * sqC},${1 - .06 * sqC})`;
    const wr = (el, a) => { const r = pr(f, a, a + 14); el.style.visibility = f >= a ? 'visible' : 'hidden'; el.style.clipPath = `inset(-10% ${(1 - r) * 100}% -10% 0)`; };
    wr(boxTxtA, 2230); wr(boxTxtB, 2240);
    /* flow: quadratic curve boxes → cake over the car */
    const fp = pr(f, 2262, 2296);
    if (fp > 0) {
      const P0 = [560, 690], P1 = [1010, 420], P2 = [1410, 640]; const n = Math.round(50 * fp); let d = '';
      for (let i = 0; i <= n; i++) { const u = i / 50, a = (1 - u) * (1 - u), b = 2 * u * (1 - u), c = u * u; d += (i ? 'L' : 'M') + (a * P0[0] + b * P1[0] + c * P2[0]).toFixed(1) + ',' + (a * P0[1] + b * P1[1] + c * P2[1]).toFixed(1); }
      LD.flow.style.opacity = 1; LD.flow.setAttribute('d', d);
      flowHead.style.opacity = fp >= 1 ? 1 : 0; flowHead.setAttribute('d', 'M1384,606 L1410,640 L1372,646');
    } else { LD.flow.style.opacity = 0; flowHead.style.opacity = 0; }
  }
  /* ---- texts ---- */
  mains.forEach((m) => textStyle(m, f));
  const m12 = mains[mains.length - 1];
  { const sp = pr(f, 2250, 2254); m12.ne.style.opacity = f >= 2250 ? 1 : 0; m12.ne.style.transform = `scale(${lerp(1.2, 1, sp)})`; }
  tags.forEach((t) => { const o = Math.min(pr(f, t.a, t.a + 6), 1 - pr(f, t.b - 6, t.b)); t.e.style.opacity = o.toFixed(3); });
}

/* ------------------------------------------------------------ validation */
window.__validate = function () {
  const out = [], hold = (chars) => Math.max(48, Math.ceil((chars / 15 + .5) * 60));
  const all = MAIN.map((m) => ({id: m.id, chars: m.t.replace('_', '≠').length, a: m.a, e: m.e || N, size: m.size})).concat([{id: 'label', chars: 27, a: LABEL.a, e: LABEL.e, size: 56}]);
  all.forEach((m) => { const vis = m.e - m.a; if (vis < hold(m.chars)) out.push(`${m.id}: visible ${vis}f < required ${hold(m.chars)}f`); if (m.size < 56) out.push(m.id + ': size < 56'); if (m.id !== 'label' && MAIN.find((x) => x.id === m.id).t.split(/\s+/).length > 4) out.push(m.id + ': > 4 words'); });
  const sorted = all.slice().sort((p, q) => p.a - q.a);
  for (let i = 1; i < sorted.length; i++) { const prev = sorted[i - 1]; const pe = (MAIN.find((x) => x.id === prev.id) || LABEL); const end = prev.e + (pe.d || 0); if (sorted[i].a < end) out.push(`overlap ${prev.id} → ${sorted[i].id} (${end} > ${sorted[i].a})`); }
  TAGS.forEach(([a, b, t], i) => { if (b - a < 48) out.push('tag too short ' + t); });
  return {issues: out, mains: all, N, FPS};
};
window.__zones = function (f) { render(f); const vis = (e) => e.style.visibility === 'visible' && !/inset\([^)]*100(\.0+)?%/.test(e.style.clipPath || ''); let n = 0; const names = [];
  mains.forEach((m) => { if (vis(m.el) && !/inset\(-10% 100/.test(m.w_.style.clipPath) && !/ 100(\.0+)?%\)/.test(m.w_.style.clipPath)) { n++; names.push(m.id); } });
  if (lblTxt.style.visibility === 'visible' && !/inset\(-10% 100/.test(lblTxt.style.clipPath) && !/ 100(\.0+)?%\)/.test(lblTxt.style.clipPath)) { n++; names.push('label'); }
  return {n, names}; };
window.renderFrame = render; window.TOTAL_FRAMES = N; window.FPS_ = FPS;

/* ----------------------------------------------------- viewer + player */
const q = new URLSearchParams(location.search);
const vp = $('viewport');
function fit() { if (document.body.classList.contains('render')) { vp.style.transform = 'none'; return; } const s = Math.min(innerWidth / W, (innerHeight - 52) / H); vp.style.transform = `scale(${s})`; }
if (q.get('render')) document.body.classList.add('render');
addEventListener('resize', fit); fit();
let cur = q.get('frame') ? +q.get('frame') : 0; render(cur);
if (!document.body.classList.contains('render')) {
  const rng = $('rng'), lab = $('lab'), btn = $('play'); rng.max = N - 1;
  let playing = false, t0 = 0, base = 0, ac = null, bufs = {}, played = new Set();
  const show = (f) => { cur = f; render(f); rng.value = f; lab.textContent = `frame ${f} / ${N - 1} · ${(f / FPS).toFixed(2)} s`; };
  rng.oninput = () => { show(+rng.value); played.clear(); };
  async function loadAudio() {
    if (ac) return; ac = new (window.AudioContext || window.webkitAudioContext)();
    for (const k in (window.SFX_B64 || {})) { const bin = atob(window.SFX_B64[k]); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); bufs[k] = await ac.decodeAudioData(u.buffer); }
  }
  function cueAt(f) { CUES.forEach((c, i) => { if (f >= c.f && !played.has(i)) { played.add(i); if (bufs[c.clip] && f - c.f < 30) { const s = ac.createBufferSource(); s.buffer = bufs[c.clip]; const g = ac.createGain(); g.gain.value = c.gain; s.connect(g).connect(ac.destination); s.start(); } } }); }
  function tick(ts) { if (!playing) return; const f = Math.floor(base + (ts - t0) / 1000 * FPS); if (f >= N - 1) { show(N - 1); playing = false; btn.textContent = '▶ Play'; return; } show(f); cueAt(f); requestAnimationFrame(tick); }
  btn.onclick = async () => { if (playing) { playing = false; btn.textContent = '▶ Play'; return; } await loadAudio(); if (ac.state === 'suspended') await ac.resume(); base = cur >= N - 2 ? 0 : cur; played = new Set(CUES.map((c, i) => c.f < base ? i : -1)); playing = true; btn.textContent = '❚❚ Pause'; t0 = performance.now(); requestAnimationFrame(tick); };
  show(cur);
}
})();
