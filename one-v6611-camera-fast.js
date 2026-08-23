/* ONE SHOT v6.6.11 · FAST REAR CAMERA START */
(()=>{
'use strict';
if(window.ONE_V6611_CAMERA_FAST)return;
const BUILD='oneshot-v6.6.11-camera-rear-fast-01';
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const rearRx=/(back|rear|environment|trasera|posterior|world|camera 0)/i;
const frontRx=/(front|frontal|selfie|user facing|camera 1)/i;
let patched=false;

function classify(err){try{return PermissionAssistant?.classify?.(err)||'generic'}catch(_){return'generic'}}
function status(msg){try{UI?.status?.(msg)}catch(_){}}
function toast(msg,ms=2200){try{UI?.toast?.(msg,ms,{placement:'top',tone:'soft'})}catch(_){}}

function muteAssistantForField(){
  try{
    if(typeof State!=='undefined'&&State.settings){State.settings.assistantEnabled=false;State.settings.assistantVoice=false;State.settings.assistantAuto=false;State.settings.assistantOcr=false;State.settings.assistantMascot=false;State.settings.assistantContextHelp=false;State.settings.assistantGuidedEdit=false;}
    if(typeof ONEAssistant!=='undefined'&&ONEAssistant){
      ONEAssistant.loadReference=async()=>true;
      ONEAssistant.render=()=>{};
      ONEAssistant.bind=()=>{};
      ONEAssistant.afterCapture=()=>{};
    }
  }catch(_){}
}

function patchCamera(){
  if(patched)return true;
  if(typeof Camera==='undefined'||typeof State==='undefined')return false;
  patched=true;
  muteAssistantForField();

  const baseStart=Camera.start.bind(Camera);
  const baseSetStatus=Camera.setStatus.bind(Camera);
  Camera.setStatus=function(next,detail=''){
    if(next==='idle'&&State.cameraStatus==='active'&&State.currentTrack?.readyState==='live')return;
    return baseSetStatus(next,detail);
  };

  Camera.start=async function({silent=false,force=false}={}){
    State.cameraWanted=true;
    if(State.startPromise)return State.startPromise;
    if(State.__oneRearStartupDone)return baseStart({silent,force});

    State.cameraFacing='back';
    State.startPromise=(async()=>{
      if(!navigator.mediaDevices?.getUserMedia){
        State.cameraErrorKind='unsupported';State.cameraErrorName='Unsupported';
        Camera.setStatus('error','getUserMedia no disponible');
        if(!silent)toast('Este navegador no permite cámara');
        return false;
      }

      Camera.setStatus('starting','Abriendo cámara trasera…');
      await Camera.stop({keepWanted:true});
      let lastError=null;
      const q=Camera.qualityConstraints?.()||{width:{ideal:1920},height:{ideal:1080}};
      const attempts=[
        {audio:false,video:{facingMode:{exact:'environment'},...q}},
        {audio:false,video:{facingMode:{ideal:'environment'},...q}},
        {audio:false,video:{facingMode:'environment'}}
      ];

      const open=async constraints=>{
        const stream=await navigator.mediaDevices.getUserMedia(constraints);
        const track=stream.getVideoTracks()[0];
        if(!track){stream.getTracks().forEach(t=>t.stop());throw new Error('No se recibió pista de video');}
        const facing=Camera.detectFacing?.(track)||String(track.getSettings?.().facingMode||'');
        return{stream,track,facing};
      };

      let selected=null;
      for(const constraints of attempts){
        try{selected=await open(constraints);if(selected)break;}
        catch(err){lastError=err;if(classify(err)==='permission')break;}
      }

      if(!selected&&classify(lastError)!=='permission'){
        try{
          await Camera.enumerate();
          const rear=(State.devices||[]).find(d=>rearRx.test(d.label||'')&&!frontRx.test(d.label||''));
          if(rear?.deviceId)selected=await open({audio:false,video:{deviceId:{exact:rear.deviceId},...q}});
        }catch(err){lastError=err;}
      }

      if(!selected&&classify(lastError)!=='permission'){
        try{selected=await open({audio:false,video:true});}
        catch(err){lastError=err;}
      }

      if(!selected){
        State.cameraErrorKind=classify(lastError);State.cameraErrorName=lastError?.name||'Error';
        const msg=State.cameraErrorKind==='permission'?'Permiso de cámara denegado':State.cameraErrorKind==='busy'?'Cámara ocupada':State.cameraErrorKind==='notfound'?'No se encontró cámara trasera disponible':(lastError?.message||'No se pudo iniciar video');
        Camera.setStatus('error',msg);if(!silent)toast(msg,3200);return false;
      }

      let {stream,track,facing}=selected;
      if(facing==='front'){
        try{
          await Camera.enumerate();
          const rear=(State.devices||[]).find(d=>rearRx.test(d.label||'')&&!frontRx.test(d.label||''));
          if(rear?.deviceId){
            stream.getTracks().forEach(t=>t.stop());
            selected=await open({audio:false,video:{deviceId:{exact:rear.deviceId},...q}});
            stream=selected.stream;track=selected.track;facing=selected.facing;
          }
        }catch(_){ }
      }

      State.stream=stream;State.currentTrack=track;State.cameraFacing=facing==='front'?'front':'back';
      const video=document.getElementById('video');
      if(!video)throw new Error('Vista de cámara no disponible');
      video.srcObject=stream;
      await video.play();
      await Camera.waitReady(video);
      Camera.readCapabilities?.();Camera.armRecovery?.();
      Camera.setStatus('active');Camera.touchControls?.();
      try{Sensors?.enable?.().catch(()=>{});Sensors?.smartRotate?.(true);Sensors?.applyStageOrientation?.(false)}catch(_){}
      State.__oneRearStartupDone=true;

      // Enumerar lentes después de mostrar imagen; no bloquea la primera toma.
      setTimeout(()=>Camera.enumerate?.().then(()=>{
        try{
          const id=track.getSettings?.().deviceId||'';
          if(id){const idx=(State.devices||[]).findIndex(d=>d.deviceId===id);if(idx>=0)State.deviceIndex=idx;}
          Camera.renderLensOptions?.();
        }catch(_){}
      }).catch(()=>{}),0);

      const st=track.getSettings?.()||{};
      status(`Cámara trasera lista · ${st.width||'?'}×${st.height||'?'}`);
      if(!silent)toast('Cámara trasera lista',1200);
      return true;
    })();

    try{return await State.startPromise;}
    catch(err){
      State.cameraErrorKind=classify(err);State.cameraErrorName=err?.name||'Error';
      Camera.setStatus('error',err?.message||'No se pudo iniciar la cámara');
      if(!silent)toast(err?.message||'No se pudo iniciar la cámara',3200);
      return false;
    }finally{State.startPromise=null;}
  };

  // Abrir cámara desde el primer respiro del runtime, en paralelo al resto de la app.
  setTimeout(async()=>{
    if(document.hidden||State.cameraStatus==='active'||State.startPromise)return;
    try{
      if(navigator.permissions?.query){
        try{const p=await navigator.permissions.query({name:'camera'});if(p?.state==='denied')return;}catch(_){}
      }
      State.cameraWanted=true;
      Camera.start({silent:true,force:true}).catch(()=>{});
    }catch(_){}
  },0);
  return true;
}

let tries=0;
const timer=setInterval(()=>{
  tries++;
  muteAssistantForField();
  if(patchCamera()||tries>300)clearInterval(timer);
},10);
window.ONE_V6611_CAMERA_FAST={BUILD,patchCamera};
})();
