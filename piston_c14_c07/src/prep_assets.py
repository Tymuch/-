"""Crop/resize source photos into build-ready assets (crops only: evidence is never retouched)."""
from PIL import Image, ImageFilter, ImageOps
import os
A='assets'; O='src/prepped'; os.makedirs(O,exist_ok=True)

# D03 - archive evidence photo, as is
Image.open(f'{A}/D03_Mao_Inspects_Dongfeng.jpg').convert('RGB').save(f'{O}/D03.jpg',quality=88)

# D08 - museum CA71: crop to the car (preview coords x2.016 -> source)
s=4032/2000
im=Image.open(f'{A}/D08_CA71_museum.jpg').convert('RGB')
box=tuple(int(v*s) for v in (100,195,1885,1445))
c=im.crop(box); c=c.resize((2400,int(2400*c.height/c.width)),Image.LANCZOS); c.save(f'{O}/D08.jpg',quality=86)
print('D08',c.size)

# D09 - Simca: upscale 1.5x smoothly (source is only 600x309)
im=Image.open(f'{A}/D09_Simca_Vedette.jpg').convert('RGB')
im=im.resize((int(im.width*2),int(im.height*2)),Image.LANCZOS).filter(ImageFilter.UnsharpMask(1.2,60,2)); im.save(f'{O}/D09.jpg',quality=90); print('D09',im.size)

# D10 - Mercedes M121 head: crop away supercharger label + battery ads
s=2592/2000
im=Image.open(f'{A}/D10_Mercedes_M121.jpg').convert('RGB')
box=tuple(int(v*s) for v in (400,50,1330,700))
c=im.crop(box); c.save(f'{O}/D10.jpg',quality=88); print('D10',c.size)

# D11 - map: NE China around Beijing, greyscale, crop only (no disputed areas, no Taiwan)
im=Image.open(f'{A}/D11_China_map.png').convert('RGB')
c=im.crop((880,330,1500,850)); g=ImageOps.grayscale(c); g=ImageOps.autocontrast(g,cutoff=1)
g=g.point(lambda v:int(150+v*0.42)); g.convert('RGB').save(f'{O}/D11.png'); print('D11',g.size)

# props
for n in ['PR11_label','PR12_hammer','PR13_palace_lantern','PR14_cake','PR15_box']:
    im=Image.open(f'{A}/{n}.png').convert('RGBA')
    m=1000 if im.width>1000 else im.width
    if im.width>m: im=im.resize((m,int(im.height*m/im.width)),Image.LANCZOS)
    im.save(f'{O}/{n[:4]}.png',optimize=True); print(n,im.size)
