import base64, json, sys
sys.path.insert(0,'src')
import audio
b64=lambda p: base64.b64encode(open(p,'rb').read()).decode()
assets={'S01':'data:image/jpeg;base64,'+b64('src/prepped/S01.jpg'),'S02':'data:image/jpeg;base64,'+b64('src/prepped/S02.jpg')}
for k in ['CLOCK','CAL','HELI']: assets[k]='data:image/png;base64,'+b64(f'src/prepped/{k}.png')
css=open('src/style.css').read().replace('__FONT_REG__',b64('assets/Comic_Sans_MS.ttf')).replace('__FONT_BOLD__',b64('assets/Comic_Sans_MS_Bold.ttf'))
stem,clips,cuejs=audio.build()
html=f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Piston Romania Clip</title>
<style>{css}</style></head><body>
<div id="viewport"><div id="stage"><div id="world"></div><div id="ui"></div></div></div>
<div id="ctl"><button id="play">▶ Play</button><input id="rng" type="range" min="0" value="0"><span id="lab"></span></div>
<script>const ASSETS={json.dumps(assets)};window.CUES={json.dumps(cuejs)};window.SFX_B64={json.dumps(clips)};</script>
<script>{open('src/car.js').read()}</script>
<script>{open('src/anim.js').read()}</script>
</body></html>"""
open('piston_c16.html','w').write(html); print('html bytes',len(html))
