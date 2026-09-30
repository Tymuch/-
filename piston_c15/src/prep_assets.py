"""C15 assets: crops/resizes only (evidence photos are not retouched)."""
from PIL import Image
import numpy as np, os, glob, shutil
A='assets'; O='src/prepped'; os.makedirs(O,exist_ok=True)
def trim(im):
    a=np.array(im)[:,:,3]; ys,xs=np.where(a>10); return im.crop((xs.min(),ys.min(),xs.max()+1,ys.max()+1))
im=Image.open(f'{A}/D07_Hongqi_CA72.jpg').convert('RGB'); im=im.resize((1600,int(1600*im.height/im.width)),Image.LANCZOS); im.save(f'{O}/D07.jpg',quality=88); print('D07',im.size)
im=Image.open(f'{A}/A08_ZIS110_Front_2016.jpg').convert('RGB'); im=im.resize((1200,int(1200*im.height/im.width)),Image.LANCZOS); im.save(f'{O}/A08.jpg',quality=88); print('A08',im.size)
r=Image.open(f'{A}/PR18_rope.png').convert('RGBA')
trim(r.crop((0,0,600,r.height))).save(f'{O}/ROPEL.png'); trim(r.crop((600,0,r.width,r.height))).save(f'{O}/ROPER.png')
print('rope',trim(r.crop((0,0,600,r.height))).size,trim(r.crop((600,0,r.width,r.height))).size)
trim(Image.open(f'{A}/PR17_reserved.png').convert('RGBA')).save(f'{O}/PR17.png'); print('sign',trim(Image.open(f'{A}/PR17_reserved.png').convert('RGBA')).size)
os.makedirs(f'{O}/meme',exist_ok=True)
