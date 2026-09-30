import subprocess, numpy as np, wave, io, json, base64, sys
sys.path.insert(0,'src')
from cues import CUES, FPS
FF='/tmp/claude-0/ffmpeg'; SR=48000
def load(path):
    raw=subprocess.run([FF,'-v','error','-i',path,'-f','f32le','-ac','2','-ar',str(SR),'-'],capture_output=True).stdout
    return np.frombuffer(raw,dtype=np.float32).reshape(-1,2)
def clip(c):
    x=load('assets/'+c['file']); a=int(c['off']*SR); b=a+int(c['dur']*SR); x=x[a:b].copy()
    n=int(.008*SR); x[-n:]*=np.linspace(1,0,n)[:,None]; x[:int(.002*SR)]*=np.linspace(0,1,int(.002*SR))[:,None]
    pk=np.abs(x).max(); tgt=10**(c['peak']/20); return x*(tgt/pk), pk
def wav_bytes(x,ch=2):
    y=(np.clip(x,-1,1)*32767).astype('<i2'); b=io.BytesIO(); w=wave.open(b,'wb'); w.setnchannels(ch); w.setsampwidth(2); w.setframerate(SR); w.writeframes(y.tobytes()); w.close(); return b.getvalue()
def build(total_frames=1200):
    stem=np.zeros((int(total_frames/FPS*SR)+SR,2),dtype=np.float32); clips={}; cuejs=[]
    for c in CUES:
        x,pk=clip(c); s=int(round(c['f']/FPS*SR)); stem[s:s+len(x)]+=x
        if c['clip'] not in clips:
            # html preview clip: normalised to 0 dBFS peak, played back with gain
            xn=x/np.abs(x).max(); clips[c['clip']]=base64.b64encode(wav_bytes(xn)).decode()
        cuejs.append(dict(f=c['f'],clip=c['clip'],gain=round(10**(c['peak']/20),4)))
    stem=stem[:int(total_frames/FPS*SR)]
    return stem,clips,cuejs
if __name__=='__main__':
    stem,clips,cuejs=build()
    open('out/sfx_stem.wav','wb').write(wav_bytes(stem))
    print('stem peak dBFS',20*np.log10(np.abs(stem).max()),'dur',len(stem)/SR)
