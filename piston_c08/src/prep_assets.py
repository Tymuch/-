"""C08 assets: crop cut-outs (crops only, no retouch of the source documents)."""
from PIL import Image
import numpy as np, os
A='assets'; O='src/prepped'; os.makedirs(O,exist_ok=True)
def trim(im):
    a=np.array(im)[:,:,3]; ys,xs=np.where(a>10); return im.crop((xs.min(),ys.min(),xs.max()+1,ys.max()+1))
# C01: car only (the baked-in REPRESENTATIVE MODEL / credit label is rebuilt as live tags)
im=Image.open(f'{A}/C01_Dacia1300_Representative.webp').convert('RGBA').crop((0,0,1339,850)); im=trim(im)
im.save(f'{O}/C01.png',optimize=True); print('C01',im.size)
# suitcases
im=trim(Image.open(f'{A}/PR16_suitcases.webp').convert('RGBA')); im.save(f'{O}/PR16.png',optimize=True); print('PR16',im.size)
# documents (small source cards)
for k,f in (('C02','C02_Dacia_Account.png'),('C03','C03_Dacia_History.png')):
    im=Image.open(f'{A}/{f}').convert('RGB'); im.save(f'{O}/{k}.png',optimize=True); print(k,im.size)
