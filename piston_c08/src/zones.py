from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args=['--allow-file-access-from-files'])
    pg=b.new_page(viewport={'width':1920,'height':1080}); pg.goto('file:///home/user/-/piston_c08/piston_c08.html?render=1'); pg.wait_for_timeout(800)
    r=pg.evaluate('(()=>{const bad=[];let maxn=0;for(let f=0;f<2400;f++){const z=window.__zones(f);maxn=Math.max(maxn,z.n);if(z.n>1)bad.push([f,z.names.join("+")]);}return {bad:bad.slice(0,20),count:bad.length,maxn}})()')
    print(r); b.close()
