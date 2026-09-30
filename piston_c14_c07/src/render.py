"""Render all 2400 frames (1920x1080) from the HTML timeline with 4 parallel Chromium workers."""
import sys, os, time
from multiprocessing import Process
from playwright.sync_api import sync_playwright
OUT=sys.argv[1]; N=2400; WORKERS=4
os.makedirs(OUT,exist_ok=True)
def work(k):
    with sync_playwright() as p:
        b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args=['--allow-file-access-from-files','--force-color-profile=srgb'])
        pg=b.new_page(viewport={'width':1920,'height':1080},device_scale_factor=1)
        pg.goto('file:///home/user/-/piston_c14_c07/piston_c14_c07.html?render=1'); pg.wait_for_timeout(1200)
        pg.evaluate('document.fonts.ready')
        for f in range(k,N,WORKERS):
            pg.evaluate(f'window.renderFrame({f})')
            pg.evaluate('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))')
            pg.screenshot(path=f'{OUT}/f{f:05d}.png')
        b.close()
if __name__=='__main__':
    t=time.time(); ps=[Process(target=work,args=(k,)) for k in range(WORKERS)]
    [p.start() for p in ps]; [p.join() for p in ps]; print('done',time.time()-t,'s',len(os.listdir(OUT)),'frames')
