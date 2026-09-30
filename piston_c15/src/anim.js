/* PISTON EXPLAINS · C15 (Red Flag replaces ZIS) · 1920x1080 · 60 fps · 840 frames (14.000 s)
   Deterministic: everything is a pure function of the frame index.  renderFrame(n) draws frame n.
   Retime on the real voice: edit SB (sentence starts) and the frame numbers in render(). */
(function () {
'use strict';
const W = 1920, H = 1080, FPS = 60, N = 840;
const $ = (id) => document.getElementById(id);
const lerp = (a, b, t) => a + (b - a) * t;
const pr = (f, a, b) => clamp((f - a) / (b - a));
const eio = (t) => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const eo = (t) => 1 - Math.pow(1 - t, 3);
const ei = (t) => t * t * t;
const eob = (t, s = 1.2) => { const c3 = s + 1; return 1 + c3 * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2); };

/* ---------------------------------------------------------------- TIMING */
/* 2 sentences, 42 words. Storyboard 5.9 + 8.7 s scaled 0.863, then 84 frames of hold. */
const SB = [0, 305, 756, 840];
const VO = ["The designer recalled that the factory switched to a luxury car for China's leaders: the Red Flag.",
  "After China fell out with the Soviet Union, he said, the Red Flag had to replace the ZIS limousines those leaders had been riding in."];
function wf(s, i) { const w = VO[s].split(' '); let tot = 0, c = 0; w.forEach((x, k) => { if (k === i) c = tot; tot += x.length + 1; }); return Math.round(SB[s] + (SB[s + 1] - SB[s]) * c / tot); }
window.WF = wf;

/* split-flap board = the one reading zone. T = frame the flip starts (cells flip 3 f apart), to = new word */
const BOARD = [{T: -99, to: 'SET ASIDE'}, {T: 200, to: 'RED FLAG'}, {T: 312, to: 'FELL OUT'}, {T: 424, to: ''}, {T: 548, to: 'REPLACED'}];
const NCELL = 10, CELLW = 84, CELLGAP = 8, FLIP = 18, STAG = 3;
const TAGA = [10, 1900, "DESIGNER RECALLED"];
const TAGS = [
  [100, 306, "REPRESENTATIVE MODEL · MUSEUM PHOTO"],
  [360, 542, "SCHEMATIC · NO DATES SHOWN"],
  [598, 900, "ZIS-110 · MUSEUM CAR 2016 · CC BY-SA 4.0 · Morio"]];

/* D07 photo trace (coordinates in the 1985x1000 photo): a hand-drawn line over the car only */
const TRACE = [
  {d: 'M700,96 C800,58 1000,50 1200,60 C1300,66 1385,92 1418,150', a: 0.00, b: 0.12},
  {d: 'M690,105 L640,236 M640,236 C700,236 900,236 1210,228', a: 0.10, b: 0.24},
  {d: 'M20,292 C150,262 300,258 420,262 C520,262 620,250 700,240', a: 0.22, b: 0.36},
  {d: 'M45,380 a30,60 0 1,0 60,0 a30,60 0 1,0 -60,0', a: 0.34, b: 0.42},
  {d: 'M640,440 a72,95 0 1,0 144,0 a72,95 0 1,0 -144,0', a: 0.40, b: 0.52},
  {d: 'M118,410 L600,470 C618,530 610,600 585,635 L150,570 Z', a: 0.50, b: 0.64},
  {d: 'M35,585 C150,650 400,705 580,748 L830,772 C880,765 930,730 950,690', a: 0.62, b: 0.76},
  {d: 'M905,712 a100,165 0 1,0 200,0 a100,165 0 1,0 -200,0 M945,712 a60,105 0 1,0 120,0 a60,105 0 1,0 -120,0', a: 0.74, b: 0.90},
  {d: 'M1120,420 C1250,395 1400,350 1500,320', a: 0.88, b: 1.00}];

/* ------------------------------------------------------------ layout */
const CH = 460, PAD = 20, GY = 851;                       /* card height, ground line */
const S_SMALL = .55, HERO_Y = 780, HERO_X0 = 420, HERO_XEND = 960, CONTACT_X = 704;
const ZIS = [1290, 621], TOK = [[560, 470], [1360, 470]];

/* ------------------------------------------------------------ DOM build */
const world = $('world'), ui = $('ui');
const NS = 'http://www.w3.org/2000/svg';
const S__ = (n, a, p) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
const D_ = (cls, p, html) => { const e = document.createElement('div'); e.className = cls; if (html) e.innerHTML = html; (p || world).appendChild(e); return e; };
const layer = () => { const s = S__('svg', {width: W, height: H, viewBox: `0 0 ${W} ${H}`}); s.style.cssText = 'position:absolute;left:0;top:0;pointer-events:none'; world.appendChild(s); return s; };
const circP = (cx, cy, r) => `M${cx - r},${cy} a${r},${r} 0 1,0 ${2 * r},0 a${r},${r} 0 1,0 ${-2 * r},0`;
const setDash = (e, t) => { e.style.strokeDasharray = '1 1'; e.style.strokeDashoffset = 1 - clamp(t); e.style.opacity = t > 0 ? 1 : 0; };

function mkCard(src, aspect) {
  const iw = Math.round((CH - 2 * PAD) * aspect), w = iw + 2 * PAD;
  const el = D_('card'); el.style.width = w + 'px'; el.style.height = CH + 'px';
  const ph = D_('photo', el); let img = null; if (src) { img = document.createElement('img'); img.src = src; ph.appendChild(img); }
  el.__w = w; el.__h = CH; el.__iw = iw; el.__ih = CH - 2 * PAD; el.__ph = ph; return el;
}
function put(el, x, y, s, r, o) { el.style.transform = `translate(${(x - el.__w / 2).toFixed(2)}px,${(y - el.__h / 2).toFixed(2)}px) rotate(${(r || 0).toFixed(3)}deg) scale(${(s == null ? 1 : s).toFixed(4)})`; el.style.opacity = o == null ? 1 : o; el.style.display = (o === 0) ? 'none' : 'block'; }

const back = layer();
const ground = S__('path', {d: `M120,${GY} L1800,${GY}`, pathLength: 1, stroke: '#c9c9c9', 'stroke-width': 7, 'stroke-linecap': 'round', fill: 'none'}, back);
const tokens = TOK.map(([x, y], i) => ({c: S__('path', {d: circP(x, y, 88), pathLength: 1, fill: '#fff', stroke: '#111', 'stroke-width': 7}, back),
  t: (() => { const t = S__('text', {x, y: y + 14, 'text-anchor': 'middle', 'font-size': 40, 'font-weight': 700, fill: '#111'}, back); t.textContent = i ? 'USSR' : 'CHINA'; return t; })()}));
const arrow = S__('path', {stroke: '#111', 'stroke-width': 5, 'stroke-dasharray': '14 12', 'stroke-linecap': 'round', fill: 'none'}, back);
const arrowHead = S__('path', {stroke: '#111', 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', fill: 'none'}, back);

const heroSvg = S__('svg', {}); heroSvg.style.cssText = 'position:absolute;left:0;top:0;transform-origin:0 0'; world.appendChild(heroSvg);
const HERO = buildCar(heroSvg);
const sign = D_('abs'); sign.style.filter = 'drop-shadow(0 12px 12px rgba(0,0,0,.34))'; sign.innerHTML = `<img src="${ASSETS.PR17}" style="display:block;width:100%">`;
const ropeL = D_('abs'), ropeR = D_('abs');
ropeL.innerHTML = `<img src="${ASSETS.ROPEL}" style="display:block;width:319px">`; ropeR.innerHTML = `<img src="${ASSETS.ROPER}" style="display:block;width:316px">`;
ropeL.style.transformOrigin = '0 50%'; ropeR.style.transformOrigin = '100% 50%'; ropeL.style.filter = ropeR.style.filter = 'none';

const cD07 = mkCard(ASSETS.D07, 1600 / 806), cZIS = mkCard(ASSETS.A08, 1200 / 799), cMEME = mkCard(null, 1);
const memeImgs = ASSETS.MEME.map((s) => { const i = document.createElement('img'); i.src = s; i.style.display = 'none'; cMEME.__ph.appendChild(i); return i; });
const wash = D_('wash', cD07.__ph);
const trSvg = S__('svg', {width: cD07.__iw, height: cD07.__ih, viewBox: '0 0 1985 1000'}); cD07.__ph.appendChild(trSvg);
const trPaths = TRACE.map((t) => S__('path', {d: t.d, pathLength: 1, fill: 'none', stroke: '#111', 'stroke-width': 12, 'stroke-linecap': 'round', 'stroke-linejoin': 'round'}, trSvg));
const flash = D_('flash'); flash.style.cssText = 'position:absolute;left:0;top:0;width:1920px;height:1080px;background:#fff;opacity:0;pointer-events:none';

/* ui: split-flap board + tags */
const board = D_('board', ui); board.style.cssText = `position:absolute;left:${960 - (NCELL * (CELLW + CELLGAP) - CELLGAP) / 2}px;top:81px;width:${NCELL * (CELLW + CELLGAP)}px;height:118px`;
const cells = []; for (let i = 0; i < NCELL; i++) { const c = D_('cell', board); c.style.left = i * (CELLW + CELLGAP) + 'px'; const g = document.createElement('span'); g.className = 'g'; c.appendChild(g); cells.push({c, g}); }
const tagA = D_('tag tagA', ui); tagA.textContent = TAGA[2];
const tags = TAGS.map(([a, b, t]) => { const e = D_('tag', ui); e.textContent = t; return {a, b, e}; });

/* ------------------------------------------------------------ helpers */
const padWord = (w) => { const l = Math.floor((NCELL - w.length) / 2); return (' '.repeat(l) + w).padEnd(NCELL, ' ').split(''); };
const WORDS = BOARD.map((b) => padWord(b.to));
const RND = 'AEORSTLN';
function cellState(i, f) {
  let k = 0; for (let j = 1; j < BOARD.length; j++) if (f >= BOARD[j].T + i * STAG) k = j;
  if (k === 0) return {g: WORDS[0][i], sy: 1};
  const prev = WORDS[k - 1][i], next = WORDS[k][i], tt = f - (BOARD[k].T + i * STAG);
  if (prev === next || tt >= FLIP) return {g: next, sy: 1};
  const seq = [prev, RND[(i * 3 + k) % 8], RND[(i * 5 + k * 2 + 1) % 8], next]; const j = Math.floor(tt / 6), u = (tt % 6) / 6;
  return u < .5 ? {g: seq[j], sy: 1 - u * 2} : {g: seq[j + 1], sy: (u - .5) * 2};
}
const HS = {x: HERO_X0, y: HERO_Y, s: S_SMALL, sy: 1};
function heroPose(f) {
  if (f < 338) return [960, 640, .9];
  if (f < 384) { const t = eio(pr(f, 338, 384)); return [lerp(960, HERO_X0, t), lerp(640, HERO_Y, t), lerp(.9, S_SMALL, t)]; }
  if (f < 680) return [HERO_X0, HERO_Y, S_SMALL];
  if (f < 712) return [lerp(HERO_X0, CONTACT_X, ei(pr(f, 680, 712))), HERO_Y, S_SMALL];
  if (f < 760) return [lerp(CONTACT_X, HERO_XEND, eo(pr(f, 712, 760))), HERO_Y, S_SMALL];
  return [HERO_XEND, HERO_Y, S_SMALL];
}
function putDiv(el, x, y, r, sc) { el.style.transform = `translate(${x}px,${y}px) rotate(${r}deg) scale(${sc == null ? 1 : sc})`; }

/* --------------------------------------------------------------- render */
function render(f) {
  f = Math.max(0, Math.min(N - 1, Math.round(f)));
  const dr = 1 + 0.02 * f / N; world.style.transform = `scale(${dr.toFixed(5)})`;
  const sw = 6.4 / (HS.s * dr);

  /* hero: ink Hongqi draws itself after the photo card leaves */
  const hp = heroPose(f); HS.x = hp[0]; HS.y = hp[1]; HS.s = hp[2];
  HS.sy = 1 - (f >= 712 && f < 716 ? .022 * (1 - (f - 712) / 4) : 0);
  drawCar(HERO, pr(f, 250, 330), 6.4 / (HS.s * dr)); heroSvg.style.display = f < 250 ? 'none' : 'block';
  heroSvg.style.transform = `translate(${HS.x}px,${HS.y}px) scale(${HS.s},${HS.s * HS.sy}) translate(-500px,-170px)`;
  setDash(ground, pr(f, 350, 392));

  /* D07 photo card: lands, wash + trace (PHOTO -> INK), leaves */
  { const t = eob(pr(f, 88, 112)); let y = 560 + (1 - t) * 190; if (f >= 236) y = 560 + ei(pr(f, 236, 270)) * 720;
    put(cD07, 960, y, 1, 0, (f < 88 || f > 272) ? 0 : 1);
    wash.style.opacity = pr(f, 108, 136) * .58; const tp = pr(f, 120, 226);
    TRACE.forEach((q, i) => { const k = clamp((tp - q.a) / (q.b - q.a)); trPaths[i].style.strokeDasharray = '1 1'; trPaths[i].style.strokeDashoffset = 1 - k; trPaths[i].style.opacity = k > 0 ? 1 : 0; }); }

  /* RESERVED plate: lands beside the photo (gag), then hops on the Hongqi's roof and stays */
  { const w0 = 380, lt = 176; const drop = eob(pr(f, 160, lt)); const sq = (f >= lt && f < lt + 4) ? 1 - .05 * (1 - (f - lt) / 4) : 1;
    let x = 1640, y = lerp(-220, 560, drop), rot = 5, wd = w0;
    const rx = HS.x, ry = HS.y + (-48 - 170) * HS.s, rw = 400 * HS.s;
    const fly = eio(pr(f, 316, 352));
    if (f >= 316) { x = lerp(1640, rx, fly); y = lerp(560, ry, fly) - Math.sin(fly * Math.PI) * 120; rot = lerp(5, 0, fly); wd = lerp(w0, rw, fly); }
    if (f >= 352) { x = rx; y = ry; rot = 0; wd = rw; }
    const wob = (f >= 712) ? 7 * Math.exp(-(f - 712) / 14) * Math.sin((f - 712) / 3) : 0;
    sign.style.display = f < 160 ? 'none' : 'block'; sign.style.width = wd + 'px';
    sign.style.transform = `translate(${x - wd / 2}px,${y - wd * .39 / 2}px) rotate(${rot + wob}deg) scale(1,${sq})`;
    sign.style.transformOrigin = '50% 100%'; }

  /* tokens + rope: the split (no dates on screen); the rope snaps, the meme cuts in */
  { const tp = pr(f, 372, 410), ex = ei(pr(f, 548, 590)), rec = f >= 440 ? 14 * eo(pr(f, 440, 452)) : 0;
    tokens.forEach((k, i) => { setDash(k.c, tp); k.t.style.opacity = pr(f, 396, 410);
      const dx = (i ? 1 : -1) * (ex * 900 + rec) + (f >= 430 && f < 440 ? (i ? 1 : -1) * 4 * Math.sin(f * 2.4) : 0);
      k.c.setAttribute('transform', `translate(${dx},0)`); k.t.setAttribute('transform', `translate(${dx},0)`); });
    const on = f >= 396 && f < 600; ropeL.style.display = ropeR.style.display = on ? 'block' : 'none';
    const slide = eo(pr(f, 396, 424)), tens = f < 440 ? 1 + .03 * pr(f, 424, 440) : 1, snap = pr(f, 440, 458);
    const ang = 68 * eob(snap, 1.5); const dxL = -ex * 900 - rec, dxR = ex * 900 + rec;
    const lx = 634 + dxL - (1 - slide) * 90, rx = 1266 + dxR + (1 - slide) * 90;
    ropeL.style.opacity = ropeR.style.opacity = pr(f, 396, 404);
    ropeL.style.transform = `translate(${lx}px,${TOK[0][1] - 38}px) rotate(${ang}deg) scale(${tens},1)`;
    ropeR.style.transform = `translate(${rx - 316}px,${TOK[1][1] - 32}px) rotate(${-ang}deg) scale(${tens},1)`; }

  /* the meme: hard cut with a white flash, 1.28 s (plays 1.25x) */
  { const on = f >= 468 && f < 546; put(cMEME, 960, 540, 1, 0, on ? 1 : 0);
    if (on) { const k = Math.min(19, Math.floor((f - 468) * 0.2604)); memeImgs.forEach((im, i) => { im.style.display = i === k ? 'block' : 'none'; }); }
    let fa = 0; if (f >= 468 && f < 474) fa = 1 - (f - 468) / 6; if (f >= 543 && f < 546) fa = (f - 543) / 3; if (f >= 546 && f < 552) fa = 1 - (f - 546) / 6;
    flash.style.opacity = fa; }

  /* ZIS-110 card (same frame as the ZIS thread), REPLACE arrow, wobble, ejection */
  { const en = eob(pr(f, 574, 598)); let x = lerp(2300, ZIS[0], en), y = ZIS[1], rot = 0;
    if (f >= 640 && f < 712) rot = .8 * Math.sin((f - 640) / 5) * Math.min(1, (f - 640) / 20);
    if (f >= 712) { const t = pr(f, 712, 756); x = ZIS[0] + 1350 * eo(t); y = ZIS[1] - 90 * Math.sin(Math.PI * Math.min(1, t * 1.1)); rot = 16 * eo(t); }
    put(cZIS, x, y, 1, rot, (f < 574 || f > 760) ? 0 : 1);
    const ap = pr(f, 602, 640) * (1 - pr(f, 690, 704)); const ax0 = HERO_X0 + 251 + 14, ay = 735;
    if (ap > 0) { arrow.style.opacity = 1; const xe = lerp(ax0, 926, ap); arrow.setAttribute('d', `M${ax0},${ay} L${xe},${ay}`); arrowHead.style.opacity = ap >= 1 ? 1 : 0; arrowHead.setAttribute('d', `M${xe - 26},${ay - 20} L${xe},${ay} L${xe - 26},${ay + 20}`); }
    else { arrow.style.opacity = 0; arrowHead.style.opacity = 0; } }

  /* board + tags */
  cells.forEach((c, i) => { const s = cellState(i, f); c.g.textContent = s.g === ' ' ? '' : s.g; c.g.style.transform = `scaleY(${Math.max(.02, s.sy).toFixed(3)})`; });
  tagA.style.opacity = pr(f, TAGA[0], TAGA[0] + 6);
  tags.forEach((t) => { t.e.style.opacity = Math.min(pr(f, t.a, t.a + 6), 1 - pr(f, t.b - 6, t.b)).toFixed(3); });
}

/* ------------------------------------------------------------ validation */
window.__validate = function () {
  const out = [], hold = (n) => Math.max(48, Math.ceil((n / 15 + .5) * 60)), rows = [];
  for (let j = 1; j < BOARD.length; j++) { const w = BOARD[j].to; if (!w) continue; const a = BOARD[j].T + (NCELL - 1) * STAG + FLIP, e = j + 1 < BOARD.length ? BOARD[j + 1].T : N; rows.push({word: w, visible: e - a, need: hold(w.length)}); if (e - a < hold(w.length)) out.push(`${w}: visible ${e - a}f < ${hold(w.length)}f`); }
  TAGS.forEach(([a, b, t]) => { if (b - a < 48) out.push('tag too short ' + t); });
  /* tags must not fade while a flip is running */
  const flips = BOARD.slice(1).map((b) => [b.T, b.T + (NCELL - 1) * STAG + FLIP]);
  TAGS.concat([TAGA]).forEach(([a, b, t]) => { [[a, a + 6], [b - 6, b]].forEach(([x, y]) => flips.forEach(([p, q]) => { if (x < q && y > p && b < 1000) out.push(`tag "${t}" fades during a flip`); })); });
  /* meme must not overlap board text */
  return {issues: out, rows, N, FPS};
};
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
