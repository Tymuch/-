"""C08 SFX cue list (frame-exact, 60 fps). Peaks per master brief: mechanical -18, UI -20, whoosh/comic -22 dBFS."""
FPS=60
CUES=[
 dict(f=8,    clip='handdraw', file='10_handdraw.wav',    off=0.0, dur=0.93, peak=-20, note='road ribbon + doctor Dacia start drawing'),
 dict(f=388,  clip='click',    file='01_soft_click.wav',  off=0.0, dur=0.50, peak=-22, note='gag 1: suitcases land on the family-sedan illustration roof'),
 dict(f=770,  clip='smooth',   file='14_smooth_move.wav', off=0.0, dur=1.47, peak=-22, note='the 20-minute drive starts (only whoosh-type cue)'),
 dict(f=1185, clip='handdraw', file='10_handdraw.wav',    off=0.0, dur=0.93, peak=-20, note='village and the route beyond it are drawn'),
 dict(f=1646, clip='click',    file='01_soft_click.wav',  off=0.0, dur=0.50, peak=-20, note='payoff: last passenger dot lands in the other Dacia'),
]
