"""SFX cue list (frame-exact, 60 fps). Peaks per master brief: mechanical -18, UI -20, whoosh/comic -22 dBFS."""
FPS=60
CUES=[
 dict(f=14,   clip='shutter',  file='oldshutter-nikon.wav', off=0.90, dur=0.45, peak=-18, note='D03 archive photo lands (shutter motif)'),
 dict(f=162,  clip='handdraw', file='10_handdraw.wav',      off=0.0,  dur=0.93, peak=-20, note='PHOTO -> INK: pen starts tracing the car'),
 dict(f=458,  clip='handdraw', file='10_handdraw.wav',      off=0.0,  dur=0.93, peak=-20, note='ink-Dongfeng hero starts drawing (line continuity)'),
 dict(f=745,  clip='smooth',   file='14_smooth_move.wav',   off=0.0,  dur=1.47, peak=-22, note='car travels the garden arc'),
 dict(f=1500, clip='handdraw', file='10_handdraw.wav',      off=0.0,  dur=0.93, peak=-20, note='hammer arrives, body panels (plan: handdraw @ panels)'),
 dict(f=1638, clip='shutter',  file='oldshutter-nikon.wav', off=0.90, dur=0.45, peak=-18, note='D08 museum photo lands (shutter motif)'),
 dict(f=1934, clip='shutter',  file='oldshutter-nikon.wav', off=0.90, dur=0.45, peak=-18, note='D09 Simca photo lands (shutter motif)'),
 dict(f=2072, clip='shutter',  file='oldshutter-nikon.wav', off=0.90, dur=0.45, peak=-18, note='D10 Mercedes engine photo lands (shutter motif)'),
 dict(f=2250, clip='click',    file='01_soft_click.wav',    off=0.0,  dur=0.50, peak=-20, note='final card: not-equals stamp (plan: soft_click @ final card)'),
]
