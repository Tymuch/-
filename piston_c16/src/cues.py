"""C16 SFX cue list (frame-exact, 60 fps). Peaks per master brief: mechanical -18, UI -20, whoosh/comic -22 dBFS."""
FPS=60
SH=dict(clip='shutter', file='oldshutter-nikon.wav', off=0.90, dur=0.45, peak=-18)
CK=dict(clip='click',   file='01_soft_click.wav',  off=0.0,  dur=0.50, peak=-22)
CUES=[
 dict(SH,f=10,  note='S01 field photo lands (shutter motif)'),
 dict(CK,f=100, note='the helicopter touches down'),
 dict(CK,f=378, note='calendar page torn off'),
 dict(dict(clip='smooth',file='14_smooth_move.wav',off=0.0,dur=1.47,peak=-22),f=470,note='the clock winds back an hour (only whoosh-type cue)'),
 dict(SH,f=580, note='S02 party-HQ photo lands (shutter motif)'),
 dict(dict(clip='handdraw',file='10_handdraw.wav',off=0.0,dur=0.93,peak=-20),f=812,note='helicopter lifts off, dotted route is drawn'),
 dict(CK,f=1068,note='the lead car stops; the others follow'),
]
