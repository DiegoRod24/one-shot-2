/* ONE SHOT v6.6.8 · MOBILE EDITOR POLISH */
(()=>{
'use strict';
if(window.ONE_V668_MOBILE_EDITOR_POLISH)return;
const BUILD='oneshot-v6.6.8-mobile-editor-polish-01';
const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>[...r.querySelectorAll(s)];

function toast(text,ms=2200){try{if(typeof UI!=='undefined'&&UI.toast)return UI.toast(text,ms)}catch(_){ }console.log('[ONE SHOT v6.6.8]',text)}

function injectStyle(){
  if(q('#oneV668MobilePolishStyle'))return;
  const s=document.createElement('style');
  s.id='oneV668MobilePolishStyle';
  s.textContent=`
/* Seleccionar: acción compacta, no una franja gigante. */
#oneV665EvidenceToolbar>.one-v665-toolbar-action.select,
#selectVisibleBtn.one-v665-toolbar-action.select{
  width:auto!important;min-width:118px!important;max-width:154px!important;flex:0 0 auto!important;
  padding-inline:14px!important;justify-content:center!important;text-align:center!important;
}
/* hidden debe ganar a los estilos author display:block. */
#oneV664ProviderWrap[hidden],#oneV667ProviderWrap[hidden],
.one-v664-field[hidden],.one-v667-field[hidden]{display:none!important;visibility:hidden!important}
/* Marco: cuando abre, siempre debe ser visible y entrar en el flujo normal del modal. */
#editModal #editRescuePanel.open{display:block!important;visibility:visible!important;opacity:1!important}
/* Zoom de inspección: no altera el archivo ni el marco guardado. */
#editModal #editImageStage,.one-v667-photo{touch-action:pan-y!important}
#editModal #editEvidenceImg,.one-v667-photo img{transform-origin:center center!important;will-change:scale}
.one-v668-zoomed{cursor:zoom-out}
@media(max-width:700px){
  #oneV665EvidenceToolbar{justify-content:flex-start!important;gap:7px!important}
  #oneV665EvidenceToolbar .viewSwitch{flex:0 0 auto!important}
  #oneV665EvidenceToolbar>.one-v665-toolbar-action.select,
  #selectVisibleBtn.one-v665-toolbar-action.select{
    min-width:104px!important;max-width:128px!important;min-height:40px!important;padding:7px 11px!important;font-size:11px!important;
  }
}
@media(max-width:390px){
  #oneV665EvidenceToolbar>.one-v665-toolbar-action.select,
  #selectVisibleBtn.one-v665-toolbar-action.select{min-width:94px!important;max-width:112px!important;padding-inline:8px!important}
}
`;
  document.head.appendChild(s);
}

function forceProviderRule(root=document){
  const quick=q('#oneV664QuickEditor',root)||q('#oneV664QuickEditor');
  if(quick){
    const type=String(quick.dataset.selectedType||'').toUpperCase();
    const wrap=q('#oneV664ProviderWrap',quick),sel=q('#oneV664Provider',quick);
    const panel=type==='PANEL';
    if(wrap){wrap.hidden=!panel;wrap.style.display=panel?'':'none'}
    if(!panel&&sel)sel.value='';
  }
  const batch=q('#oneV667Classify',root)||q('#oneV667Classify');
  if(batch){
    const type=String(batch.dataset.type||'').toUpperCase();
    const wrap=q('#oneV667ProviderWrap',batch),sel=q('#oneV667Provider',batch);
    const panel=type==='PANEL';
    if(wrap){wrap.hidden=!panel;wrap.style.display=panel?'':'none'}
    if(!panel&&sel)sel.value='';
  }
}

function distance(touches){
  if(!touches||touches.length<2)return 0;
  const a=touches[0],b=touches[1];
  return Math.hypot(b.clientX-a.clientX,b.clientY-a.clientY);
}

function attachPinch(stage,img,key){
  if(!stage||!img||stage.dataset[key]==='1')return;
  stage.dataset[key]='1';
  let scale=1,startScale=1,startDistance=0;
  const apply=value=>{
    scale=Math.max(1,Math.min(4,Number(value)||1));
    try{img.style.scale=String(scale)}catch(_){img.style.setProperty('scale',String(scale))}
    img.classList.toggle('one-v668-zoomed',scale>1.02);
    stage.dataset.previewZoom=scale.toFixed(2);
  };
  stage.addEventListener('touchstart',e=>{
    if(e.touches.length!==2)return;
    startDistance=distance(e.touches);startScale=scale;
    e.preventDefault();
  },{passive:false});
  stage.addEventListener('touchmove',e=>{
    if(e.touches.length!==2||!startDistance)return;
    const d=distance(e.touches);if(!d)return;
    apply(startScale*(d/startDistance));
    e.preventDefault();
  },{passive:false});
  stage.addEventListener('touchend',e=>{if(e.touches.length<2)startDistance=0},{passive:true});
  stage.addEventListener('dblclick',()=>apply(1));
  stage.__oneShotResetPreviewZoom=()=>apply(1);
  apply(1);
}

function prepareEditorPhoto(){
  const modal=q('#editModal');if(!modal?.classList.contains('open'))return;
  const stage=q('#editImageStage',modal),img=q('#editEvidenceImg',modal);
  attachPinch(stage,img,'oneV668Pinch');
  forceProviderRule(modal);
}

function prepareBatchPhoto(){
  const modal=q('#oneV667BatchModal');if(!modal?.classList.contains('open'))return;
  const stage=q('.one-v667-photo',modal),img=q('.one-v667-photo img',modal);
  attachPinch(stage,img,'oneV668BatchPinch');
  forceProviderRule(modal);
}

function openFrameEditor(){
  try{window.ONE_V664_EDITOR_STABLE?.resolveRecord?.()}catch(_){ }
  const panel=q('#editRescuePanel'),stage=q('#editImageStage');
  if(!panel)return toast('No se encontró el editor de marco');
  try{stage?.__oneShotResetPreviewZoom?.()}catch(_){ }
  try{
    if(typeof EvidenceRescue!=='undefined'){
      EvidenceRescue.reset?.();
      EvidenceRescue.open?.();
    }else panel.classList.add('open');
  }catch(_){panel.classList.add('open')}
  panel.classList.add('open');
  requestAnimationFrame(()=>setTimeout(()=>panel.scrollIntoView({behavior:'smooth',block:'nearest'}),30));
}

function bindEvents(){
  document.addEventListener('click',e=>{
    const typeBtn=e.target.closest('#oneV664QuickEditor [data-type],#oneV667Classify [data-type]');
    if(typeBtn)setTimeout(()=>forceProviderRule(typeBtn.closest('#editModal,#oneV667BatchModal')||document),0);
    const rescue=e.target.closest('#editOpenRescueBtn');
    if(rescue){e.preventDefault();e.stopImmediatePropagation();openFrameEditor()}
  },true);
}

function observe(){
  const observer=new MutationObserver(mutations=>{
    for(const m of mutations){
      if(m.type==='attributes'){
        if(m.target?.id==='editModal')prepareEditorPhoto();
        if(m.target?.id==='oneV667BatchModal')prepareBatchPhoto();
      }
      if(m.type==='childList'){
        prepareEditorPhoto();prepareBatchPhoto();
      }
    }
  });
  observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
}

function boot(){injectStyle();bindEvents();observe();prepareEditorPhoto();prepareBatchPhoto();forceProviderRule()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.ONE_V668_MOBILE_EDITOR_POLISH={BUILD,prepareEditorPhoto,prepareBatchPhoto,forceProviderRule,openFrameEditor};
})();
