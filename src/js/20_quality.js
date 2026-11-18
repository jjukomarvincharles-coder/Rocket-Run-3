/* ========== QUALITY ========== */
const QUALITY_PRESETS={
 LOW:{pixelRatio:0.75,bloom:false,asteroidCount:32,collectibleCount:18,bloomStrength:0.55,bloomRadius:0.5,bloomThresh:0.78},
 MEDIUM:{pixelRatio:1.0,bloom:true,asteroidCount:50,collectibleCount:24,bloomStrength:0.95,bloomRadius:0.62,bloomThresh:0.68},
 HIGH:{pixelRatio:1.35,bloom:true,asteroidCount:72,collectibleCount:30,bloomStrength:1.15,bloomRadius:0.7,bloomThresh:0.62},
 ULTRA:{pixelRatio:1.85,bloom:true,asteroidCount:94,collectibleCount:36,bloomStrength:1.3,bloomRadius:0.78,bloomThresh:0.55}
};
let qualityProfile=QUALITY_PRESETS.HIGH;
function detectQuality(){ const mem=navigator.deviceMemory||4, cores=navigator.hardwareConcurrency||4;
 const mobile=perfLowTex;
 if(mobile){ if(cores<=4||mem<=2) return 'LOW'; return 'MEDIUM'; }
 if(cores>=8&&mem>=8) return 'HIGH'; return cores<=4?'MEDIUM':'HIGH'; }
let composer=null,bloomPass=null;
function setupComposer(){
 if(composer){ try{composer.dispose();}catch(e){} composer=null; bloomPass=null; }
 if(!qualityProfile.bloom) return;
 composer=new EffectComposer(renderer);
 composer.addPass(new RenderPass(scene,camera));
 bloomPass=new UnrealBloomPass(new THREE.Vector2(window.innerWidth*0.5,window.innerHeight*0.5),qualityProfile.bloomStrength,qualityProfile.bloomRadius||0.6,qualityProfile.bloomThresh||0.7);
 composer.addPass(bloomPass);
}
function applyQuality(name){
 const key=(name==='auto')?detectQuality():name;
 qualityProfile=QUALITY_PRESETS[key]||QUALITY_PRESETS.HIGH;
 perfScale=1; perfFx=1; if(typeof Perf!=='undefined'){ Perf.bloomOn=true; }
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,qualityProfile.pixelRatio));
 setupComposer(); onResize(); return key;
}

