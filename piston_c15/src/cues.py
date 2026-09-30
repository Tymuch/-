"""C15 SFX cue list (frame-exact, 60 fps). Peaks per master brief: mechanical -18, UI -20, whoosh/comic -22 dBFS."""
FPS=60
SH=dict(clip='shutter', file='oldshutter-nikon.wav', off=0.90, dur=0.45, peak=-18)
HD=dict(clip='handdraw',file='10_handdraw.wav',    off=0.0,  dur=0.93, peak=-20)
CK=dict(clip='click',   file='01_soft_click.wav',  off=0.0,  dur=0.50, peak=-20)
CKQ=dict(CK, peak=-22)
CUES=[
 dict(SH,f=98,  note='D07 Hongqi photo lands (shutter motif)'),
 dict(HD,f=122, note='PHOTO -> INK: pen starts tracing the Hongqi'),
 dict(CKQ,f=176,note='gag: RESERVED plate lands beside the photo'),
 dict(CK,f=202, note='split-flap flip 1: SET ASIDE -> RED FLAG'),
 dict(HD,f=252, note='ink-Hongqi hero starts drawing'),
 dict(CK,f=314, note='split-flap flip 2: -> FELL OUT'),
 dict(CKQ,f=440,note='the rope snaps'),
 dict(CK,f=550, note='split-flap flip 4: -> REPLACED'),
 dict(SH,f=582, note='A08 ZIS-110 photo lands (shutter motif)'),
 dict(dict(clip='smooth',file='14_smooth_move.wav',off=0.0,dur=1.47,peak=-22),f=690,note='the Red Flag rolls in (only whoosh-type cue)'),
]
