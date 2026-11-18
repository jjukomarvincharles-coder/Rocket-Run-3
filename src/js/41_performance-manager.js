/* ========== PERFORMANCE MANAGER (adaptive resolution, frame cap, live stats) ========== */
const Perf={
 ema:16.7, acc:0, good:0, lastAdj:0, ignoreUntil:0, capMs:0, show:false, bloomOn:true, inited:false, hudEl:null, hudT:0, calls:0, tris:0,
 init(){ this.inited=true; this.ignoreUntil=performance.now()+4000; this.capMs=SAVE.settings.saver?33.3:0;
  if(SAVE.settings.saver) perfScale=Math.min(perfScale,0.8); },
 hold(ms=4000){ this.ignoreUntil=performance.now()+ms; this.acc=0; this.good=0; },
 sample(raw,now){
  if(raw>250||document.hidden) return;
  this.ema+=(raw-this.ema)*0.08; this.acc+=raw;
  if(this.acc<1500) return; this.acc=0;
  if(now<this.ignoreUntil||Game.state!=='PLAYING'){ this.good=0; return; }
  const fps=1000/this.ema, floor=this.capMs?27:45, ok=this.capMs?29:57;
  if(fps<floor&&now-this.lastAdj>2500){ this.step(-1,now); this.good=0; }
  else if(fps>ok){ if(++this.good>=6&&now-this.lastAdj>2500){ this.step(1,now); this.good=0; } }
  else this.good=0;
 },
 step(dir,now){
  const maxS=SAVE.settings.saver?0.8:1; const s=clamp(Math.round((perfScale+dir*0.1)*10)/10,0.5,maxS);
  this.lastAdj=now;
  if(s===perfScale){ if(dir<0&&this.bloomOn){ this.bloomOn=false; perfFx=0.6; } return; }
  perfScale=s; perfFx=clamp(0.5+s*0.5,0.5,1);
  if(dir<0&&s<=0.7) this.bloomOn=false;
  if(dir>0&&s>=0.9) this.bloomOn=true;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,qualityProfile.pixelRatio*perfScale)); onResize();
 },
 setSaver(on){ SAVE.settings.saver=on; persist(); this.capMs=on?33.3:0;
  if(on&&perfScale>0.8){ perfScale=0.8; renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,qualityProfile.pixelRatio*perfScale)); onResize(); } },
 toggleInfo(){ this.show=!this.show; renderer.info.autoReset=!this.show;
  if(!this.hudEl){ const d=document.createElement('div'); d.id='perfHud'; document.body.appendChild(d); this.hudEl=d; }
  this.hudEl.style.display=this.show?'block':'none'; },
 report(dt){ if(!this.show) return; this.hudT+=dt; if(this.hudT<0.5) return; this.hudT=0;
  const i=renderer.info; this.hudEl.textContent=Math.round(1000/this.ema)+' FPS · res '+Math.round(perfScale*100)+'% · bloom '+(this.bloomOn&&composer?'on':'off')+' · calls '+i.render.calls+' · tris '+Math.round(i.render.triangles/1000)+'k · tex '+i.memory.textures; }
};
document.addEventListener('visibilitychange',()=>{ if(!document.hidden&&Perf.inited) Perf.hold(2500); });

let lastT=performance.now();
function loop(now){
 requestAnimationFrame(loop);
 const raw=now-lastT;
 if(Perf.capMs&&raw<Perf.capMs-2) return;
 if(!Perf.inited) Perf.init();
 const dt=Math.min(raw/1000,0.05);
 lastT=now; Perf.sample(raw,now);
 if(Perf.show) renderer.info.reset();
 if(Game.state==='PLAYING'&&!Game.photoMode) updateGame(dt);
 updateVisuals(dt);
 updateBackground(dt,Game.state==='PLAYING'?Game.speed:26);
 updateDrone(dt);
 radarAcc+=dt; if(Game.state==='PLAYING'&&!Game.photoMode&&radarAcc>=0.1){ radarAcc=0; drawRadar(); }
 if(Game.photoMode) applyPhotoCamera();
 if(composer&&Perf.bloomOn) composer.render();
 else renderer.render(scene,camera);
 Perf.report(dt);
}

