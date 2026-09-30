import sys
from playwright.sync_api import sync_playwright
frames=[int(x) for x in sys.argv[1:]]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args=['--allow-file-access-from-files'])
    pg=b.new_page(viewport={'width':1920,'height':1080})
    msgs=[]; pg.on('console',lambda m:msgs.append(m.text)); pg.on('pageerror',lambda e:msgs.append('ERR '+str(e)))
    pg.goto('file:///home/user/-/piston_c14_c07/piston_c14_c07.html?render=1'); pg.wait_for_timeout(800)
    pg.evaluate('document.fonts.ready')
    print(pg.evaluate('JSON.stringify(window.__validate())'))
    for f in frames:
        pg.evaluate(f'window.renderFrame({f})'); pg.wait_for_timeout(60)
        pg.screenshot(path=f'/tmp/claude-0/f{f:04d}.png')
    print(msgs); b.close()
