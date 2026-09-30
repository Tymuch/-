/* PISTON EXPLAINS · C16 (Romania: field, roof, road) · 1920x1080 · 60 fps · 1200 frames (20.000 s)
   Deterministic: everything is a pure function of the frame index.  renderFrame(n) draws frame n.
   Retime on the real voice: edit SB (sentence starts) and the frame numbers in render(). */
(function () {
'use strict';
const W = 1920, H = 1080, FPS = 60, N = 1200;
const $ = (id) => document.getElementById(id);
const lerp = (a, b, t) => a + (b - a) * t;
const pr = (f, a, b) => clamp((f - a) / (b - a));
const eio = (t) => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const eo = (t) => 1 - Math.pow(1 - t, 3);
const ei = (t) => t * t * t;
const eob = (t, s = 1.2) => { const c3 = s + 1; return 1 + c3 * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2); };

/* ---------------------------------------------------------------- TIMING */
/* 4 sentences, 57 words: storyboard 4.9/3.8/8.4/3.5 s scaled 0.895, then 94 frames of hold. */
const SB = [0, 263, 467, 918, 1106, 1200];
const VO = ["Romania's leader landed in a field, and his guards went looking for a car.",
  "It was the afternoon of December twenty-second, nineteen eighty-nine.",
  "About an hour earlier, as protesters forced their way into his party headquarters in Bucharest, Nicolae Ceausescu had escaped from the roof by helicopter.",
  "Out on the road beside the field, several cars stopped."];
function wf(s, i) { const w = VO[s].split(' '); let tot = 0, c = 0; w.forEach((x, k) => { if (k === i) c = tot; tot += x.length + 1; }); return Math.round(SB[s] + (SB[s + 1] - SB[s]) * c / tot); }
window.WF = wf;

const MAIN = [
  {id: 'm1', t: "NEED A CAR", size: 96, y: 140, a: 186, w: 22, e: 262, d: 10},
  {id: 'm2', t: "ONE HOUR EARLIER", size: 92, y: 140, a: 474, w: 26, e: 574, d: 10},
  {id: 'm3', t: "PARTY HQ", size: 96, y: 140, a: 640, w: 22, e: 740, d: 10},
  {id: 'm4', t: "SEVERAL CARS", size: 96, y: 140, a: 1030, w: 22, e: 0, d: 0}];
const TAGA = [10, 1900, "SCHEMATIC"];
const TAGS = [
  [40, 254, "STOCK PHOTO · HELICOPTER: REPRESENTATIVE MODEL"],
  [600, 900, "BUCHAREST · PARTY HQ BUILDING TODAY"],
  [1000, 1300, "SCHEMATIC · CARS AND DRIVERS UNKNOWN"]];

/* ------------------------------------------------------------ layout */
const CH = 460, PAD = 20;
const YR = 740, ROAD_T = YR - 38, ROAD_B = YR + 46, G = '#c9c9c9';
const S4 = .36, YC4 = YR - 130 * S4;                                   /* the several cars on the road */
const CARS = [{x: 1690, a: 1010, b: 1068}, {x: 1310, a: 1030, b: 1082}, {x: 930, a: 1046, b: 1094}, {x: 550, a: 1058, b: 1102}];
const HELI_W = 504, HELI_K = HELI_W / 1178;                             /* helicopter display width / scale */
const LAND = [1000, 704];                                              /* touch-down point on the field card */
const ROUTE = [[720, 290], [1000, 90], [1500, 130], [2150, 250]];       /* roof -> field, dotted (bezier) */

/* ------------------------------------------------------------ DOM build */
const world = $('world'), ui = $('ui');
const NS = 'http://www.w3.org/2000/svg';
const S_ = (n, a, p) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
const D_ = (cls, p, html) => { const e = document.createElement('div'); e.className = cls; if (html) e.innerHTML = html; (p || world).appendChild(e); return e; };
const layer = () => { const s = S_('svg', {width: W, height: H, viewBox: `0 0 ${W} ${H}`}); s.style.cssText = 'position:absolute;left:0;top:0;pointer-events:none'; world.appendChild(s); return s; };
const circP = (cx, cy, r) => `M${cx - r},${cy} a${r},${r} 0 1,0 ${2 * r},0 a${r},${r} 0 1,0 ${-2 * r},0`;
const setDash = (e, t) => { e.style.strokeDasharray = '1 1'; e.style.strokeDashoffset = 1 - clamp(t); e.style.opacity = t > 0 ? 1 : 0; };
function mkCard(src, aspect) {
  const iw = Math.round((CH - 2 * PAD) * aspect), w = iw + 2 * PAD;
  const el = D_('card'); el.style.width = w + 'px'; el.style.height = CH + 'px';
  const ph = D_('photo', el); const img = document.createElement('img'); img.src = src; ph.appendChild(img);
  el.__w = w; el.__h = CH; el.__iw = iw; el.__ih = CH - 2 * PAD; return el;
}
function put(el, x, y, o, r) { el.style.transform = `translate(${(x - el.__w / 2).toFixed(2)}px,${(y - el.__h / 2).toFixed(2)}px) rotate(${(r || 0).toFixed(3)}deg)`; el.style.opacity = o == null ? 1 : o; el.style.display = (o === 0) ? 'none' : 'block'; }

/* layer 1: road (same geometry as C08), field tufts, dotted route, dust */
const back = layer();
const road = [S_('path', {d: `M120,${ROAD_T} L1800,${ROAD_T}`, pathLength: 1, stroke: G, 'stroke-width': 7, 'stroke-linecap': 'round', fill: 'none'}, back), S_('path', {d: `M120,${ROAD_B} L1800,${ROAD_B}`, pathLength: 1, stroke: G, 'stroke-width': 7, 'stroke-linecap': 'round', fill: 'none'}, back)];
const roadMid = S_('path', {d: `M140,${YR} L1780,${YR}`, pathLength: 1, stroke: G, 'stroke-width': 4, 'stroke-dasharray': '22 20', fill: 'none'}, back);
const tufts = []; for (let i = 0; i < 13; i++) { const x = 140 + i * 24 + (i % 3) * 5, h = 14 + (i * 7 % 13); tufts.push(S_('path', {d: `M${x},${ROAD_T - 6} l-6,${-h} M${x},${ROAD_T - 6} l0,${-h - 8} M${x},${ROAD_T - 6} l7,${-h}`, pathLength: 1, stroke: G, 'stroke-width': 5, 'stroke-linecap': 'round', fill: 'none'}, back)); }
const routeLine = S_('path', {stroke: '#111', 'stroke-width': 7, 'stroke-dasharray': '1 16', 'stroke-linecap': 'round', fill: 'none'}, back);
const dust = S_('g', {}, back); const rings = [0, 1, 2].map(() => S_('ellipse', {fill: 'none', stroke: '#111', 'stroke-width': 5}, dust));
const rays = []; for (let i = 0; i < 14; i++) rays.push(S_('path', {stroke: '#111', 'stroke-width': 5, 'stroke-linecap': 'round', fill: 'none'}, dust));

/* layer 2: cards, props */
const cField = mkCard(ASSETS.S01, 1200 / 797), cHQ = mkCard(ASSETS.S02, 1350 / 700);
const heli = D_('abs'); heli.innerHTML = `<img src="${ASSETS.HELI}" style="display:block;width:${HELI_W}px">`;
const heliSvg = S_('svg', {width: HELI_W, height: HELI_W * 365 / 1178, viewBox: '0 0 1178 365'}); heliSvg.style.cssText = 'position:absolute;left:0;top:0'; heli.appendChild(heliSvg);
const rotorBlur = S_('path', {d: 'M0,118 L945,23', stroke: '#111', 'stroke-width': 16, 'stroke-linecap': 'round', fill: 'none', opacity: .18}, heliSvg);
const rotorDash = S_('path', {d: 'M0,118 L945,23', stroke: '#111', 'stroke-width': 7, 'stroke-linecap': 'round', fill: 'none'}, heliSvg);
const tailRotor = S_('g', {transform: 'translate(1070,108)'}, heliSvg); const tailBlades = [0, 1].map(() => S_('path', {d: 'M-52,0 L52,0', stroke: '#111', 'stroke-width': 7, 'stroke-linecap': 'round'}, tailRotor));
const clockWrap = D_('abs'); clockWrap.innerHTML = `<img src="${ASSETS.CLOCK}" style="display:block;width:495px;position:absolute;left:-247px;top:-247px">`;
const clockSvg = S_('svg', {width: 495, height: 495, viewBox: '0 0 808 808'}); clockSvg.style.cssText = 'position:absolute;left:-247px;top:-247px'; clockWrap.appendChild(clockSvg);
const ring = S_('path', {d: circP(404, 404, 392), fill: 'none', stroke: '#111', 'stroke-width': 5, 'stroke-dasharray': '60 46', 'stroke-linecap': 'round'}, clockSvg);
const hHour = S_('path', {d: 'M404,404 L404,236', stroke: '#111', 'stroke-width': 24, 'stroke-linecap': 'round'}, clockSvg), hMin = S_('path', {d: 'M404,404 L404,130', stroke: '#111', 'stroke-width': 16, 'stroke-linecap': 'round'}, clockSvg);
S_('circle', {cx: 404, cy: 404, r: 20, fill: '#111'}, clockSvg);
/* calendar: base sheet shows 22, the top sheet (clone, DECEMBER 1989) tears off around the spiral */
const CALW = 707 * .62, CALH = 897 * .62;
const cal = D_('abs'); cal.style.perspective = '1200px'; cal.style.width = CALW + 'px'; cal.style.height = CALH + 'px';
cal.innerHTML = `<img src="${ASSETS.CAL}" style="display:block;width:${CALW}px;position:absolute;left:0;top:0">`;
const sheetW = 651 * .62, sheetH = 832 * .62, sheetX = 4 * .62, sheetY = 3 * .62;
const calBase = D_('caltxt', cal); calBase.style.cssText = `position:absolute;left:${sheetX}px;top:${sheetY + 130 * .62}px;width:${sheetW}px;height:${sheetH - 130 * .62}px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:250px;line-height:1;color:#111;visibility:hidden`; calBase.textContent = '22';
const tear = D_('tear', cal); tear.style.cssText = `position:absolute;left:0;top:0;width:${CALW}px;height:${CALH}px;transform-origin:${sheetX + sheetW / 2}px ${sheetY + 30}px;backface-visibility:hidden`;
tear.innerHTML = `<img src="${ASSETS.CAL}" style="display:block;width:${CALW}px;position:absolute;left:0;top:0;clip-path:inset(${sheetY}px ${CALW - sheetX - sheetW}px ${CALH - sheetY - sheetH}px ${sheetX}px)">`;
const tearTxt = D_('caltxt2', tear); tearTxt.style.cssText = `position:absolute;left:${sheetX}px;top:${sheetY + 130 * .62}px;width:${sheetW}px;height:${sheetH - 130 * .62}px;display:flex;flex-direction:column;align-items:center;justify-content:center;font-weight:700;color:#111;line-height:1;visibility:hidden`;
tearTxt.innerHTML = '<span style="font-size:64px">DECEMBER</span><span style="font-size:120px;margin-top:14px">1989</span>';
/* arrows into the building, guards, thumbs, cars */
const top = layer();
const ARR = [[690, 760], [710, 830], [780, 880], [1220, 760], [1200, 830], [1130, 880], [890, 900], [1020, 900]].map(([x, y]) => ({x, y, l: S_('path', {stroke: '#111', 'stroke-width': 8, 'stroke-linecap': 'round', fill: 'none'}, top), h: S_('path', {stroke: '#111', 'stroke-width': 8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', fill: 'none'}, top)}));
const dots = [0, 1, 2].map(() => S_('circle', {r: 12, fill: '#111'}, top));
const thumbs = [0, 1, 2].map(() => S_('path', {stroke: '#111', 'stroke-width': 6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', fill: 'none'}, top));
const gdots = [0, 1, 2].map(() => S_('circle', {r: 12, fill: '#111'}, top));
const carSvgs = CARS.map(() => { const s = S_('svg', {}); s.style.cssText = 'position:absolute;left:0;top:0;transform-origin:0 0'; world.appendChild(s); return {svg: s, C: buildCar(s)}; });
const puffs = CARS.map(() => { const g = S_('g', {}, top); [[0, 0, 15], [15, -8, 11], [-14, -6, 9]].forEach(([x, y, r]) => S_('circle', {cx: x, cy: y, r, fill: '#fff', stroke: '#111', 'stroke-width': 4}, g)); return g; });

/* ui */
const mains = MAIN.map((m) => { const el = D_('main', ui); el.style.fontSize = m.size + 'px'; el.style.top = (m.y - m.size / 2) + 'px'; const w = document.createElement('span'); w.className = 'w'; w.textContent = m.t; el.appendChild(w); m.el = el; m.w_ = w; return m; });
const tagA = D_('tag tagA', ui); tagA.textContent = TAGA[2];
const tags = TAGS.map(([a, b, t]) => { const e = D_('tag', ui); e.textContent = t; return {a, b, e}; });

/* ------------------------------------------------------------ helpers */
function textStyle(m, f) { const rv = pr(f, m.a, m.a + m.w), er = m.e ? pr(f, m.e, m.e + m.d) : 0, vis = f >= m.a && er < 1; m.el.style.visibility = vis ? 'visible' : 'hidden'; if (vis) m.w_.style.clipPath = `inset(-10% ${((1 - rv) * 100).toFixed(2)}% -10% ${(er * 100).toFixed(2)}%)`; }
function bez(P, u) { const a = (1 - u) ** 3, b = 3 * u * (1 - u) ** 2, c = 3 * u * u * (1 - u), d = u ** 3; return [a * P[0][0] + b * P[1][0] + c * P[2][0] + d * P[3][0], a * P[0][1] + b * P[1][1] + c * P[2][1] + d * P[3][1]]; }
function bezD(P, u) { const m = 1 - u; return [3 * m * m * (P[1][0] - P[0][0]) + 6 * m * u * (P[2][0] - P[1][0]) + 3 * u * u * (P[3][0] - P[2][0]), 3 * m * m * (P[1][1] - P[0][1]) + 6 * m * u * (P[2][1] - P[1][1]) + 3 * u * u * (P[3][1] - P[2][1])]; }
const DOOR = [-46, 30];                                                 /* helicopter door, relative to its centre */

/* --------------------------------------------------------------- render */
function render(f) {
  f = Math.max(0, Math.min(N - 1, Math.round(f)));
  const dr = 1 + 0.02 * f / N; world.style.transform = `scale(${dr.toFixed(5)})`;

  /* ===== scene 1: field card, helicopter lands, guards look around ===== */
  const off1 = -2300 * ei(pr(f, 266, 304)), on1 = f < 306;
  { const t = eob(pr(f, 0, 24)); put(cField, 960 + off1, 560 + (1 - t) * 190, on1 ? 1 : 0); }
  /* helicopter: descends, hovers, touches down at f96; leaves the roof at S3 */
  let hx, hy, hrot = 0, spin = 0, hv = false;
  if (f < 306) { const t = eio(pr(f, 24, 96)); hx = lerp(1560, LAND[0], t) + off1; hy = lerp(-160, LAND[1] - 86, t) + (f < 96 ? Math.sin(f / 7) * 5 * (1 - t) : 0); hrot = lerp(-9, 0, t); spin = f < 96 ? 1 : 1 - pr(f, 96, 170); hv = true; }
  else if (f >= 776 && f < 930) {
    const up = pr(f, 776, 812), fly = eio(pr(f, 812, 902));
    if (f < 812) { hx = ROUTE[0][0]; hy = ROUTE[0][1] - 86 + 10 - 44 * eo(up); hrot = -2 * up; spin = eo(up); }
    else { const b = bez(ROUTE, fly), d = bezD(ROUTE, fly); hx = b[0]; hy = b[1] - 86 - 44; hrot = clamp(Math.atan2(d[1], d[0]) * 180 / Math.PI * .35, -14, 14); spin = 1; }
    hv = true;
  }
  heli.style.display = hv ? 'block' : 'none';
  if (hv) {
    heli.style.transform = `translate(${hx - HELI_W / 2}px,${hy - 86}px) rotate(${hrot}deg)`;
    const ph = f * 1.15 * spin; rotorDash.style.strokeDasharray = '34 22'; rotorDash.style.strokeDashoffset = -(f * 26 * spin) % 56; rotorDash.style.opacity = spin > .05 ? 1 : 0; rotorBlur.style.opacity = .18 * spin;
    tailBlades.forEach((b, i) => b.setAttribute('transform', `rotate(${(f * 47 * spin + i * 90) % 360})`)); tailRotor.style.opacity = spin > .05 ? 1 : .5;
  }
  /* dust rings and hatch at touch-down */
  { const t = pr(f, 96, 160), on = f >= 96 && f < 190; dust.style.opacity = on ? 1 : 0;
    rings.forEach((r, i) => { const k = clamp(t - i * .14), rr = 30 + 220 * eo(k); r.setAttribute('cx', LAND[0] + off1); r.setAttribute('cy', LAND[1]); r.setAttribute('rx', rr); r.setAttribute('ry', rr * .22); r.style.opacity = k > 0 ? 1 - k : 0; });
    rays.forEach((p, i) => { const a = (i / 14) * Math.PI * 2, k = eo(clamp(t * 1.1)), r0 = 60 + 150 * k, r1 = r0 + 26 * (1 - k); p.setAttribute('d', `M${LAND[0] + off1 + Math.cos(a) * r0},${LAND[1] + Math.sin(a) * r0 * .22} L${LAND[0] + off1 + Math.cos(a) * r1},${LAND[1] + Math.sin(a) * r1 * .22}`); p.style.opacity = 1 - clamp(t * 1.05); }); }
  /* guards: three dots hop out and look for a car */
  gdots.forEach((d, i) => {
    const a = 150 + i * 10, b = a + 26; let x, y, show = f >= a - 2 && on1;
    const door = [LAND[0] + DOOR[0], LAND[1] - 12], tgt = [700 + i * 44, LAND[1] - 12];
    if (f < b) { const t = pr(f, a, b); x = lerp(door[0], tgt[0], eio(t)); y = lerp(door[1], tgt[1], t) - Math.sin(t * Math.PI) * 60; }
    else { x = tgt[0] + Math.sin((f - 190) / 6 + i * 1.3) * 12 * clamp((f - b) / 10); y = tgt[1] - Math.abs(Math.sin((f - 190) / 6 + i * 1.3)) * 7; }
    d.setAttribute('cx', x + off1); d.setAttribute('cy', y); d.style.opacity = show ? 1 : 0;
  });

  /* ===== scene 2: the date, a page torn off the calendar ===== */
  { const en = eob(pr(f, 280, 304)), ex = ei(pr(f, 440, 470)); const on = f >= 280 && f < 472;
    const cx = lerp(2400, 960, en), cy = 560 + ex * 900; cal.style.display = on ? 'block' : 'none'; cal.style.transform = `translate(${cx - CALW / 2}px,${cy - CALH / 2}px)`;
    const wr = pr(f, 292, 314), er = pr(f, 372, 380);
    tearTxt.style.visibility = f >= 292 ? 'visible' : 'hidden'; tearTxt.style.clipPath = `inset(-5% ${((1 - wr) * 100).toFixed(1)}% -5% 0)`;
    const tp = pr(f, 376, 408), ang = -108 * eio(tp), tyy = -30 * tp; tear.style.display = (f >= 280 && f < 412) ? 'block' : 'none';
    tear.style.transform = `perspective(1200px) rotateX(${-ang * -1}deg) translateY(${tyy}px)`; tear.style.opacity = 1 - pr(f, 398, 412);
    calBase.style.visibility = f >= 388 ? 'visible' : 'hidden'; calBase.style.clipPath = `inset(0 ${((1 - pr(f, 388, 404)) * 100).toFixed(1)}% 0 0)`; }

  /* ===== scene 3: an hour earlier, the party HQ, the escape ===== */
  { /* clock spins back an hour */
    const en = eob(pr(f, 464, 490)), ex = ei(pr(f, 560, 592)); const on = f >= 464 && f < 594;
    const cx = f < 560 ? 960 : lerp(960, -700, ex), cy = lerp(-560, 520, en);
    clockWrap.style.display = on ? 'block' : 'none'; clockWrap.style.transform = `translate(${cx}px,${cy}px)`;
    const p = eio(pr(f, 476, 552)); hMin.setAttribute('transform', `rotate(${-360 * p} 404 404)`); hHour.setAttribute('transform', `rotate(${120 - 30 * p} 404 404)`);
    ring.style.strokeDashoffset = (f * 5) % 106; }
  { /* party HQ card, converging arrows, shake */
    const en = eob(pr(f, 570, 594)), ex = ei(pr(f, 892, 930)); const on = f >= 570 && f < 932;
    let x = lerp(2600, 960, en) + (f >= 892 ? -ex * 2600 : 0), y = 560;
    if (f >= 628 && f < 672) x += Math.sin(f * 1.9) * 7 * (1 - pr(f, 628, 672));
    put(cHQ, x, y, on ? 1 : 0);
    ARR.forEach((a, i) => { const k = eio(pr(f, 600 + i * 6, 640 + i * 6)) * (1 - pr(f, 700, 716)); const tx = 954, ty = 748; const dx = tx - a.x, dy = ty - a.y, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, sx = tx - ux * (L - 40) , sy = ty - uy * (L - 40);
      const ex_ = lerp(a.x, tx - ux * 34, k), ey_ = lerp(a.y, ty - uy * 34, k);
      a.l.style.opacity = k > 0 ? 1 : 0; a.h.style.opacity = k > .85 ? 1 : 0; a.l.setAttribute('d', `M${a.x},${a.y} L${ex_},${ey_}`);
      a.h.setAttribute('d', `M${ex_ - uy * 15 - ux * 20},${ey_ + ux * 15 - uy * 20} L${ex_},${ey_} L${ex_ + uy * 15 - ux * 20},${ey_ - ux * 15 - uy * 20}`); });
    /* the helicopter's dotted route grows with it */
    const rp = eio(pr(f, 812, 902)); routeLine.style.opacity = (f >= 812 && f < 934) ? 1 - pr(f, 910, 934) : 0;
    if (f >= 812) { let d = ''; const n = Math.round(60 * rp); for (let i = 0; i <= n; i++) { const b = bez(ROUTE, i / 60); d += (i ? 'L' : 'M') + b[0].toFixed(1) + ',' + b[1].toFixed(1); } routeLine.setAttribute('d', d || 'M0,0'); } }

  /* ===== scene 4: the road beside the field, several cars stop ===== */
  { const rp = pr(f, 900, 946); road.forEach((e) => setDash(e, rp)); setDash(roadMid, pr(f, 912, 956)); tufts.forEach((e, i) => setDash(e, pr(f, 926 + i * 2, 948 + i * 2)));
    /* three guards on the curb with thumbs out (the hitch-hiking gag) */
    gdots.forEach((d, i) => { });
    dots.forEach((d, i) => { const a = 964 + i * 8, t = eob(pr(f, a, a + 14)); const x = 230 + i * 58, y = ROAD_T - 22; d.setAttribute('cx', x); d.setAttribute('cy', y); d.setAttribute('r', Math.max(0, 15 * t)); d.style.opacity = f >= a ? 1 : 0;
      const wv = f >= 990 ? Math.sin((f - 990) / 5 + i) * 10 : 0; const th = thumbs[i]; th.style.opacity = f >= 990 ? pr(f, 990, 1000) : 0;
      { const fx = x + 28 + wv * .3, fy = y - 34 + wv * .2; th.setAttribute('d', `M${x + 8},${y - 8} L${fx},${fy} M${fx - 10},${fy} a10,10 0 1,0 20,0 a10,10 0 1,0 -20,0 M${fx + 4},${fy - 8} L${fx + 6},${fy - 24}`); } });
    CARS.forEach((c, i) => { const cs = carSvgs[i]; const t = eo(pr(f, c.a, c.b)), x = lerp(-420, c.x, t);
      const sqz = (f >= c.b && f < c.b + 4) ? 1 - .03 * (1 - (f - c.b) / 4) : 1, tilt = (f > c.b - 16 && f < c.b + 6) ? -1.6 * Math.sin(pr(f, c.b - 16, c.b + 6) * Math.PI) : 0;
      drawCar(cs.C, 1, 6.4 / (S4 * dr)); cs.svg.style.display = f >= c.a ? 'block' : 'none';
      cs.svg.style.transform = `translate(${x}px,${YC4}px) rotate(${tilt}deg) scale(${S4},${S4 * sqz}) translate(-500px,-170px)`;
      const pt = pr(f, c.b - 4, c.b + 30); puffs[i].style.opacity = (f >= c.b - 4 && pt < 1) ? 1 - pt * pt : 0;
      puffs[i].setAttribute('transform', `translate(${c.x - 170 - 40 * pt},${YR + 8 - 40 * pt}) scale(${.5 + 1.0 * pt})`); }); }

  /* texts + tags */
  mains.forEach((m) => textStyle(m, f));
  tagA.style.opacity = pr(f, TAGA[0], TAGA[0] + 6);
  tags.forEach((t) => { t.e.style.opacity = Math.min(pr(f, t.a, t.a + 6), 1 - pr(f, t.b - 6, t.b)).toFixed(3); });
}

/* ------------------------------------------------------------ validation */
window.__validate = function () {
  const out = [], hold = (n) => Math.max(48, Math.ceil((n / 15 + .5) * 60));
  const all = MAIN.map((m) => ({id: m.id, chars: m.t.length, a: m.a, e: m.e || N, d: m.d, size: m.size, words: m.t.split(/\s+/).length}));
  all.push({id: 'calendar DECEMBER 1989', chars: 13, a: 292, e: 376, d: 0, size: 64, words: 2}, {id: 'calendar 22', chars: 2, a: 388, e: 470, d: 0, size: 250, words: 1});
  all.forEach((m) => { if (m.e - m.a < hold(m.chars)) out.push(`${m.id}: visible ${m.e - m.a}f < required ${hold(m.chars)}f`); if (m.size < 56) out.push(m.id + ' size'); if (m.words > 4) out.push(m.id + ' > 4 words'); });
  const s = all.slice().sort((p, q) => p.a - q.a); for (let i = 1; i < s.length; i++) if (s[i].a < s[i - 1].e + s[i - 1].d) out.push(`overlap ${s[i - 1].id} → ${s[i].id}`);
  TAGS.forEach(([a, b, t]) => { if (b - a < 48) out.push('tag too short ' + t); });
  return {issues: out, N, FPS};
};
window.__zones = function (f) { render(f); let n = 0; const names = []; mains.forEach((m) => { if (m.el.style.visibility === 'visible' && !/inset\(-10% 100/.test(m.w_.style.clipPath) && !/ 100(\.0+)?%\)/.test(m.w_.style.clipPath)) { n++; names.push(m.id); } });
  if (cal.style.display === 'block' && (tearTxt.style.visibility === 'visible' && tear.style.display === 'block' || calBase.style.visibility === 'visible')) { n++; names.push('calendar'); } return {n, names}; };
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
