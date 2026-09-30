"""C16 assets: crops/resizes only (photos are not retouched)."""
from PIL import Image
import numpy as np, os
A='assets'; O='src/prepped'; os.makedirs(O,exist_ok=True)
def trim(im):
    a=np.array(im)[:,:,3]; ys,xs=np.where(a>10); return im.crop((xs.min(),ys.min(),xs.max()+1,ys.max()+1)),(xs.min(),ys.min())
im=Image.open(f'{A}/S01_Field.jpg').convert('RGB'); im=im.resize((1200,int(1200*im.height/im.width)),Image.LANCZOS); im.save(f'{O}/S01.jpg',quality=88); print('field',im.size)
im=Image.open(f'{A}/S02_CC_Building.jpg').convert('RGB').crop((350,0,1700,700)); im.save(f'{O}/S02.jpg',quality=90); print('building',im.size)
for k,f in (('CLOCK','PR22_clock.png'),('CAL','PR21_calendar.png'),('HELI','PR20_helicopter.png')):
    im=Image.open(f'{A}/{f}').convert('RGBA'); t,off=trim(im); t.save(f'{O}/{k}.png',optimize=True); print(k,im.size,'->',t.size,'offset',off)
