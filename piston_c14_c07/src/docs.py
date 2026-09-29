import sys, csv, json
sys.path.insert(0,'src')
from cues import CUES, FPS
tc=lambda f:f"{int(f//FPS//60):02d}:{int(f//FPS%60):02d}.{int(round((f%FPS)/FPS*1000)):03d}"
with open('out/cue_list.csv','w',newline='') as fh:
    w=csv.writer(fh); w.writerow(['frame','time_s','timecode','sfx_file','offset_in_file_s','length_s','peak_dBFS','note'])
    for c in CUES: w.writerow([c['f'],round(c['f']/FPS,3),tc(c['f']),c['file'],c['off'],c['dur'],c['peak'],c['note']])
SB=[0,189,433,677,1006,1474,1613,1872,2201,2305,2400]
VO=["Why would China's leader take a car ride around a garden?","He was trying out what a Communist Party history calls China's first homemade sedan.","One of its designers later recalled the day, May twenty-first, nineteen fifty-eight.","Mao circled the garden and said he was glad to be riding in a car China had made itself.","The car was a sample, built that May and parked inside the leadership's compound in Beijing, where delegates to a Communist Party congress could look it over.","Workers had hammered its body out by hand.","Up front, it carried a golden dragon, and its taillights were shaped like Chinese lanterns.","But the team had used a French Simca as its reference and based the engine on a Mercedes design.","Homemade didn't mean starting from scratch.","(hold: nothing new appears)"]
with open('out/timing_map.csv','w',newline='') as fh:
    w=csv.writer(fh); w.writerow(['sentence','start_frame','end_frame','start_s','end_s','VO_excerpt']); 
    for i,v in enumerate(VO): w.writerow([i+1 if i<9 else 'hold',SB[i],SB[i+1],round(SB[i]/FPS,3),round(SB[i+1]/FPS,3),v])
