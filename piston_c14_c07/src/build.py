import base64, json, sys
sys.path.insert(0,'src')
import audio
b64=lambda p: base64.b64encode(open(p,'rb').read()).decode()
mime={'jpg':'image/jpeg','png':'image/png'}
assets={}
for k,f in dict(D03='D03.jpg',D08='D08.jpg',D09='D09.jpg',D10='D10.jpg',D11='D11.png',PR11='PR11.png',PR12='PR12.png',PR13='PR13.png',PR14='PR14.png',PR15='PR15.png').items():
    assets[k]=f"data:{mime[f.split('.')[-1]]};base64,"+b64('src/prepped/'+f)
css=open('src/style.css').read().replace('__FONT_REG__',b64('assets/Comic_Sans_MS.ttf')).replace('__FONT_BOLD__',b64('assets/Comic_Sans_MS_Bold.ttf'))
stem,clips,cuejs=audio.build()
html=f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Piston Dongfeng Clip</title>
<style>{css}</style></head><body>
<div id="viewport"><div id="stage"><div id="world"></div><div id="ui"></div></div></div>
<div id="ctl"><button id="play">▶ Play</button><input id="rng" type="range" min="0" value="0"><span id="lab"></span></div>
<script>const ASSETS={json.dumps(assets)};window.CUES={json.dumps(cuejs)};window.SFX_B64={json.dumps(clips)};</script>
<script>{open('src/hero.js').read()}</script>
<script>{open('src/anim.js').read()}</script>
</body></html>"""
open('piston_c14_c07.html','w').write(html)
print('html bytes',len(html))
