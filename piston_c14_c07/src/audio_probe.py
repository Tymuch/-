import subprocess, numpy as np, sys
FF='/tmp/claude-0/ffmpeg'
def load(path, sr=48000):
    raw=subprocess.run([FF,'-v','error','-i',path,'-f','f32le','-ac','1','-ar',str(sr),'-'],capture_output=True).stdout
    return np.frombuffer(raw,dtype=np.float32), sr
for n in ['01_soft_click','10_handdraw','14_smooth_move','oldshutter-nikon']:
    x,sr=load(f'assets/{n}.wav')
    pk=np.abs(x).max()
    print(n, 'dur %.2f'%(len(x)/sr), 'peak %.1f dBFS'%(20*np.log10(pk)))
    w=int(sr*0.05); env=[np.abs(x[i:i+w]).max() for i in range(0,len(x)-w,w)]
    print(' env(50ms,dB):',' '.join('%d'%(20*np.log10(e+1e-9)) for e in env[:60]))
