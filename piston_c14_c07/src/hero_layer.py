from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args=['--allow-file-access-from-files'])
    pg=b.new_page(viewport={'width':1920,'height':1080}); pg.goto('file:///home/user/-/piston_c14_c07/piston_c14_c07.html?render=1'); pg.wait_for_timeout(1000)
    pg.evaluate('window.renderFrame(2399)')
    # keep only the ink hero on a transparent background (join layer for the next clip)
    pg.add_style_tag(content='#stage{background:transparent!important} #ui,#world>*:not(svg:nth-of-type(2)){display:none!important} html,body{background:transparent!important}')
    pg.evaluate("document.querySelectorAll('#world > *').forEach((e,i)=>{ if(e.tagName.toLowerCase()==='svg' && e.getAttribute('viewBox') && e.getAttribute('viewBox').startsWith('0 0 1000')) e.style.display='block'; else e.style.display='none'; })")
    pg.screenshot(path='out/join_layer_hero_ink_last_frame.png',omit_background=True); b.close()
