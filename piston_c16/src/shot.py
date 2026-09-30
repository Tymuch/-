import sys,asyncio
from playwright.sync_api import sync_playwright
url,out,w,h=sys.argv[1],sys.argv[2],int(sys.argv[3]),int(sys.argv[4])
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args=['--allow-file-access-from-files'])
    pg=b.new_page(viewport={'width':w,'height':h}); pg.goto(url); pg.wait_for_timeout(500); pg.screenshot(path=out); b.close()
