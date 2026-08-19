/* ONE SHOT v6.4.12 · FER APPROVED VISUAL */
(()=>{
'use strict';
if(window.ONE_V6412_FER_VISUAL)return;
const BUILD='oneshot-v6.4.12-fer-voice-logos-guided-ux-01';
const MAP={idle:4,greeting:1,listening:2,speaking:3,thinking:0,processing:0,searching:0,observing:0,success:1,alert:2,error:5,help:0,waiting:2,ready:4,paused:4,confirm:1,confirmation:1};
const state=s=>String(s||'idle').toLowerCase();
const V={
 current:'idle',observers:new WeakMap(),
 frame(s){return MAP[state(s)]??MAP.idle;},
 setState(s='idle'){
   this.current=state(s);
   document.querySelectorAll('.ferSpriteV6412').forEach(x=>{x.dataset.state=this.current;x.style.setProperty('--ferFrame',String(this.frame(this.current)));});
 },
 hostSize(host){if(host?.id==='guidedRobot')return'hero';if(host?.id==='oneAssistantFab'||host?.classList?.contains('relationHelpBot'))return'tiny';if(host?.classList?.contains('editMiniAssistant')||host?.classList?.contains('reportOneMascot')||host?.classList?.contains('ferOrbHuman'))return'small';return'medium';},
 mount(host){
   if(!host||host.dataset?.v6412FerMounted==='1')return;
   const sprite=window.ONE_FER_SPRITE_V6412||'';if(!sprite)return;
   host.dataset.v6412FerMounted='1';host.classList.add('ferV6412Host');
   const avatar=host.querySelector('.ferAvatar');const current=state(avatar?.dataset?.ferState||this.current);
   const el=document.createElement('span');el.className=`ferSpriteV6412 ${this.hostSize(host)}`;el.dataset.state=current;el.style.backgroundImage=`url("${sprite}")`;el.style.setProperty('--ferFrame',String(this.frame(current)));el.setAttribute('role','img');el.setAttribute('aria-label','Fer · asistente de revisión');
   if(avatar)avatar.insertAdjacentElement('afterend',el);else host.prepend(el);
   if(host.id==='guidedRobot'&&!host.querySelector('.v6412FerIdentity')){const id=document.createElement('div');id.className='v6412FerIdentity';id.innerHTML='<b>Fer</b><small>Asistente de revisión</small>';el.insertAdjacentElement('afterend',id);}
   if(avatar&&window.MutationObserver){const ob=new MutationObserver(()=>{const s=state(avatar.dataset.ferState||'idle');el.dataset.state=s;el.style.setProperty('--ferFrame',String(this.frame(s)));});ob.observe(avatar,{attributes:true,attributeFilter:['data-fer-state']});this.observers.set(host,ob);}
 },
 scan(){
   const selectors=['#guidedRobot','.editMiniAssistant','.reportOneMascot','.relationHelpBot','#oneAssistantFab','.ferOrbHuman','.oneAssistantOrb'];
   document.querySelectorAll(selectors.join(',')).forEach(x=>this.mount(x));this.setState(this.current);
 },
 install(){this.scan();const roots=['guidedRobot','editMiniAssistant','oneAssistantFab','assistantEditPanel','reportsAssistant'];for(const id of roots){const r=document.getElementById(id);if(r&&window.MutationObserver&&!r.dataset.v6412FerWatch){r.dataset.v6412FerWatch='1';new MutationObserver(()=>this.scan()).observe(r,{childList:true,subtree:true});}}}
};
function css(){if(document.getElementById('v6412FerVisualCss'))return;const s=document.createElement('style');s.id='v6412FerVisualCss';s.textContent=`
.ferV6412Host .ferAvatar{display:none!important}.ferSpriteV6412{--ferFrame:4;display:inline-block;flex:0 0 auto;background-repeat:no-repeat;background-size:600% 100%;background-position:calc(var(--ferFrame) * 20%) 0;background-color:transparent;filter:drop-shadow(0 10px 18px rgba(1,13,35,.26));transition:filter .2s ease,transform .2s ease;aspect-ratio:18/25}.ferSpriteV6412.hero{width:88px}.ferSpriteV6412.medium{width:72px}.ferSpriteV6412.small{width:58px}.ferSpriteV6412.tiny{width:43px}.ferSpriteV6412[data-state="listening"]{filter:drop-shadow(0 0 14px rgba(54,215,185,.48))}.ferSpriteV6412[data-state="speaking"]{animation:v6412FerTalk .65s ease-in-out infinite alternate}.ferSpriteV6412[data-state="thinking"],.ferSpriteV6412[data-state="processing"],.ferSpriteV6412[data-state="observing"],.ferSpriteV6412[data-state="searching"]{animation:v6412FerThink 1.4s ease-in-out infinite alternate}.ferSpriteV6412[data-state="success"]{animation:v6412FerSuccess .55s ease-out 1}.v6412FerIdentity{display:grid;align-content:center;gap:2px;min-width:118px}.v6412FerIdentity b{font-size:15px!important;color:#fff!important;opacity:1!important}.v6412FerIdentity small{font-size:10px;color:#a9c4e7}.ferV6412Host#guidedRobot{grid-template-columns:auto auto 1fr auto!important;align-items:center!important;min-height:118px!important;background:linear-gradient(135deg,#0a2344,#07162c)!important;border:1px solid #2a5588!important;overflow:hidden}.ferV6412Host#guidedRobot:before{content:'';position:absolute;width:160px;height:100px;left:-20px;top:5px;background:radial-gradient(circle,rgba(65,145,255,.16),transparent 68%);pointer-events:none}.ferV6412Host.editMiniAssistant{min-height:82px}.ferV6412Host#oneAssistantFab .ferSpriteV6412{margin-left:-3px}@keyframes v6412FerTalk{from{transform:translateY(0)}to{transform:translateY(-3px)}}@keyframes v6412FerThink{from{transform:translateY(0) rotate(-1deg)}to{transform:translateY(-2px) rotate(1deg)}}@keyframes v6412FerSuccess{0%{transform:scale(1)}45%{transform:scale(1.06) translateY(-4px)}100%{transform:scale(1)}}@media(max-width:740px){.ferSpriteV6412.hero{width:72px}.v6412FerIdentity{min-width:96px}.ferV6412Host#guidedRobot{min-height:98px!important;grid-template-columns:auto auto 1fr auto!important}}`;
document.head.appendChild(s);}
let tries=0;function start(){if(window.__ONE_V6412_FER_VISUAL_STARTED)return;if(!window.ONE_FER_SPRITE_V6412){if(tries++<140)return void setTimeout(start,80);return;}window.__ONE_V6412_FER_VISUAL_STARTED=true;css();V.install();setTimeout(()=>V.scan(),850);}
window.FerVisual=V;window.ONE_V6412_FER_VISUAL={BUILD,start,V};window.addEventListener('load',()=>setTimeout(start,2350),{once:true});if(document.readyState==='complete')setTimeout(start,2350);
})();
