/* MD1T UI review demo. Local simulation, no device / network writes. */
'use strict';
const AS='../01_UI设计/', $=s=>document.querySelector(s), clone=x=>JSON.parse(JSON.stringify(x));
const original={linkConnected:true,batteryAvailable:true,wiredBatterySync:false,chargeComplete:false,screenOn:true,brightness:10,display:0,fnPage:0,enabled:[true,true,true,true,true],profile:0,model:'3950',timerEnabled:false,mode:'down',presets:[10,30,60,300],preset:0,clock:1,album:1,albumCount:4,albumAuto:false,albumInterval:3,theme:'#78be1f',clockColor:'#ffffff',timerColor:'#ffffff',weather:false,hostAvailable:true,message:'[INSERT YOUR MESSAGE]',messageMode:'scroll',messageSize:32,messageSpeed:30,messageColor:'#ffffff',messageBg:'#000000',mapping:'page',link:'2.4G',pairing:false,uiEnabled:true,battery:100,charging:false,groups:Array.from({length:4},()=>({slots:[400,800,1600,3200,6400].map(v=>({x:v,y:v})),slot:2,xy:false,hz:2000,lod:1,fps:"AUTO",motion:true})),v2:true};
let s=clone(original);try{let p=JSON.parse(localStorage.getItem('md1t-ui-v20'));if(p?.schema===2)s={...s,...p.state};}catch{}
let fn=false,timer=null,notice=null,low=null,queuedLow=null,failureUntil=0,lowDone=new Set(),lastInput=performance.now(),hold=null,physical=null,renderId='',clockTick=-1,albumAt=performance.now(),albumImages=[],messageStart=performance.now(),messageMetrics=null;
const textMeasure=document.createElement('canvas').getContext('2d');let overlayMarkup='';
// Migrate existing reviews without resetting other user settings.
for(const g of s.groups)if(!['AUTO',13000,20000].includes(g.fps))g.fps='AUTO';
const FPS=['AUTO',13000,20000]; // Vendor historical list; current firmware capabilities must be verified.
const HZ=[125,250,500,1000,2000,4000,8000], LOD=[.7,1,2], DISP=['C01','D06','H01','A01','F04'];
const screen=$('#screen'),board=$('#board'),layers=$('#layers'),base=$('#base'),status=$('#status');
function current(){return s.groups[s.profile]}function dpi(){return current().slots[current().slot]}
function persist(){try{localStorage.setItem('md1t-ui-v20',JSON.stringify({schema:2,state:s}));}catch{}}
function say(t){status.dataset.zh=t;status.textContent=window.DemoI18n?DemoI18n.trMsg(t):t;}
function esc(t){return String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));}
function svgText(x,y,t,size=32,font='DM',fill='#fff',anchor='middle'){return `<text x="${x}" y="${y}" font-family="${font}" font-size="${size}" font-style="normal" text-anchor="${anchor}" fill="${fill}">${esc(t)}</text>`;}
function rect(x,y,w,h,fill='#000',other=''){return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${other}/>`}
function placed(el,r){Object.assign(el.style,{left:r[0]+'px',top:r[1]+'px',width:r[2]+'px',height:r[3]+'px'});return el;}
function value(r,t,size=48,bg='#000',font='DM',color='#fff'){let n=document.createElement('div');n.className='value';n.textContent=t;Object.assign(n.style,{fontSize:size+'px',background:bg,fontFamily:font,color});layers.append(placed(n,r));return n;}
function nextEnabled(from,dir=1){for(let k=1;k<=5;k++){let n=(from+dir*k+5)%5;if(s.enabled[n])return n;}return from;}
function validPage(n){return s.enabled[n]?n:nextEnabled(n)}
function canFN(){return s.link==='2.4G'&&s.linkConnected!==false&&!s.pairing&&s.uiEnabled&&s.screenOn}
function activity(){lastInput=performance.now();}
function clearTransient(){notice=null;if(low)queuedLow=queuedLow===null?low.threshold:Math.min(queuedLow,low.threshold);low=null;}
function enterFN(){
 if(!canFN()){say('当前连接或屏幕状态不可进入FN。FN鼠控屏仅在2.4G可用。');return;}
 if(timer?.state==='result'){s.display=validPage(timer.returnPage);timer=null;}
 stopHold();fn=true;clearTransient();activity();render();say('已进入FN：点击即生效，3秒无鼠标操作退出。');
}
function leaveFN(reason='已退出FN'){stopHold();fn=false;activity();render();persist();say(reason+'，调整已保留。');}
function startTimer(){
 let back=timer?timer.returnPage:s.display;
 timer={state:'running',mode:s.mode,limit:s.presets[s.preset]*1000,start:performance.now(),returnPage:back,elapsed:0,expired:false};
 fn=false;stopHold();clearTransient();render();say('开始计时；长按FN进入设置时，计时仍继续。');
}
function finishTimer(expired=false){if(!timer||timer.state!=='running')return;timer.elapsed=Math.min(performance.now()-timer.start,timer.limit);timer.state='result';timer.until=performance.now()+5000;timer.expired=expired;fn=false;stopHold();clearTransient();render();say('计时结束，结果显示5秒，然后返回原展示页。');}
function shortFN(){
 if(!canFN()){say('当前状态下FN不可用。');return;}
 if(fn){leaveFN('FN短按退出');return;}
 if(s.timerEnabled){if(timer?.state==='running')finishTimer();else startTimer();return;}
 if(s.mapping==='hz'){current().hz=HZ[(HZ.indexOf(current().hz)+1)%HZ.length];externalNotice('POLLING RATE CHANGED');persist();render();say('短按自定义：切换回报率。');}
 else{clearTransient();s.display=nextEnabled(s.display);persist();render();say('切到下一已开启展示页。');}
}
function sideDouble(){stopHold();if(timer)s.display=validPage(timer.returnPage);timer=null;fn=false;clearTransient();s.display=nextEnabled(s.display);persist();render();say('侧键双击：结束计时、退出FN并翻展示页。');}
function externalNotice(t){if(!fn&&!timer&&s.screenOn){clearTransient();notice={text:t,until:performance.now()+2000};}}
function externalChange(){stopHold();current().lod=(current().lod+1)%3;externalNotice('LOD CHANGED');persist();render();say(fn?'驱动已修改LOD，FN同步当前值，不弹提示。':timer?'驱动已修改LOD，计时继续，不弹改参提示。':'驱动已修改LOD，展示页提示2秒。');}
function control(id,r,action,repeat=false,disabled=false){let b=document.createElement('button');b.className='hit';b.dataset.id=id;b.setAttribute('aria-label',id);b.disabled=disabled;placed(b,r);if(id==='previous'||id==='next'){b.classList.add('page-nav');b.innerHTML='<svg viewBox="0 0 215 40" aria-hidden="true"><text x="'+(id==='previous'?74:16)+'" y="25.5" text-anchor="start">'+(id==='previous'?'PREVIOUS PAGE':'NEXT PAGE')+'</text><path d="'+(id==='previous'?'M25 15 L20 20 L25 25':'M190 15 L195 20 L190 25')+'"/></svg>';}b.onpointerdown=e=>{
 if(e.button!==0)return;e.preventDefault();activity();stopHold();
 hold={id,r,action,repeat,started:performance.now(),repeating:false,next:performance.now()+2000};board.classList.add('pressing');b.classList.add('pressed');
 };b.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();activity();action();}};layers.append(b);}
function stopHold(){hold=null;board.classList.remove('pressing');layers.querySelectorAll('.pressed').forEach(n=>n.classList.remove('pressed'));}
function adjust(key,d){
 let g=current(),v=dpi();
 if(key==='dpi'||key==='x'||key==='y'){
  let step=s.model==='3950'?50:1;
  // Review range only; final capabilities are owned by the sensor firmware.
  if(key!=='y')v.x=Math.min(30000,Math.max(step,v.x+d*step));
  if(key!=='x')v.y=Math.min(30000,Math.max(step,v.y+d*step));
 }else if(key==='hz')g.hz=HZ[Math.max(0,Math.min(HZ.length-1,HZ.indexOf(g.hz)+d))];
 else if(key==='fps')g.fps=FPS[(FPS.indexOf(g.fps)+d+FPS.length)%FPS.length];
 else if(key==='lod')g.lod=Math.max(0,Math.min(2,g.lod+d));
 else if(key==='profile')s.profile=Math.max(0,Math.min(3,s.profile+d));
 else if(key==='brightness')s.brightness=Math.max(1,Math.min(10,s.brightness+d));
 else if(key==='album'){s.album=Math.max(1,Math.min(4,s.album+d));albumAt=performance.now();}
 else if(key==='preset')s.preset=Math.max(0,Math.min(3,s.preset+d));
 else if(key==='clock')s.clock=Math.max(1,Math.min(3,s.clock+d));
 persist();activity();updateValues();syncPanel();say('已生效，退出后保留。');
}
function arrows(key,left,right,disabled=false){for(let [id,r,d] of [[key+'_minus',left,-1],[key+'_plus',right,1]]){control(id,r,()=>adjust(key,d),true,disabled);let b=layers.lastElementChild,w=r[2],h=r[3],a=Math.min(9,Math.min(w,h)*.2),cx=w/2,cy=h/2;b.classList.add('adjust');b.innerHTML=`<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true"><rect x="-2" y="-2" width="${w+4}" height="${h+4}" fill="#000"/><rect class="arrowbg" x="1" y="1" width="${w-2}" height="${h-2}"/><polyline class="chevron" points="${cx-a},${cy+d*a/2} ${cx},${cy-d*a/2} ${cx+a},${cy+d*a/2}"/></svg>`;}}
function fnControls(){
 control('previous',[33,416,215,40],()=>fnPage(-1));control('home',[260,416,49,40],()=>leaveFN('房子返回'));control('next',[322,416,215,40],()=>fnPage(1));
 const top=[[53,124,62,64],[456,124,62,64]],bottom=[[53,316,62,64],[456,316,62,64]];
 if(s.fnPage===0){if(current().xy){arrows('x',[53,124,62,30],[456,124,62,30]);arrows('y',[53,160,62,30],[456,160,62,30]);}else arrows('dpi',...top);arrows('hz',...bottom);}
 if(s.fnPage===1){arrows('lod',...top);arrows('profile',...bottom);}
 if(s.fnPage===2){arrows('fps',...top);for(let [on,r] of [[true,[54,318,221,61]],[false,[294,318,222,61]]])control('motion_'+(on?'on':'off'),r,()=>{current().motion=on;persist();updateValues();say('Motion Sync已生效。');});}
 if(s.fnPage===3){arrows('brightness',[52,149,39,39],[217,149,39,39]);arrows('album',[313,149,39,39],[478,149,39,39],false);arrows('preset',[52,341,39,39],[217,341,39,39]);arrows('clock',[313,341,39,39],[478,341,39,39]);
 if(s.v2)for(let [i,c] of ['#ffffff','#78be1f','#50b9f2'].entries())control('clock_color_'+i,[402+i*27,319,18,18],()=>{s.clockColor=c;persist();updateValues();syncPanel();say('时钟数字颜色已生效，返回时钟页可见。');});}
}
function fnPage(d){stopHold();s.fnPage=(s.fnPage+d+4)%4;activity();persist();render();say('FN第'+(s.fnPage+1)+'页，点击即生效。');}
function updateValues(){
 layers.querySelectorAll('.value,.decor').forEach(n=>n.remove());let g=current(),v=dpi();
 if(fn){
  if(s.fnPage===0){if(g.xy){value([177,124,217,30],'X '+v.x,26);value([177,160,217,30],'Y '+v.y,26);}else value([177,122,217,73],v.x);value([177,314,217,73],g.hz);}
  if(s.fnPage===1){value([177,122,217,73],LOD[g.lod]+' MM',40);value([177,314,217,73],String(s.profile+1).padStart(2,'0'));}
  if(s.fnPage===2){value([177,122,217,73],g.fps,40);value([50,314,470,68],'',32);for(let [on,x] of [[true,54],[false,294]]){let e=value([x,318,221,61],on?'ON':'OFF',32,g.motion===on?'#0d1505':'#000'),accent=s.v2?s.theme:'#78be1f';e.style.border='2px solid '+(g.motion===on?accent:'#555');e.style.color=g.motion===on?accent:'#fff';}}
  if(s.fnPage===3){for(let [r,t] of [[[130,147,50,42],s.brightness],[[392,147,50,42],s.album],[[130,339,50,42],s.preset+1],[[392,339,50,42],s.clock]])value(r,t,24);
   if(s.v2){let e=document.createElementNS('http://www.w3.org/2000/svg','svg');e.classList.add('decor');e.setAttribute('viewBox','0 0 570 488');e.innerHTML=rect(306,317,222,20)+svgText(312,331,'COLOR',10,'DM','#fff','start')+['#ffffff','#78be1f','#50b9f2'].map((c,i)=>`<circle cx="${411+i*27}" cy="328" r="6" fill="${c}" stroke="${s.clockColor===c?'#fff':'none'}" stroke-width="2"/>`).join('');layers.append(e);}
  }
  const limits={dpi:[v.x,s.model==='3950'?50:1,30000],x:[v.x,s.model==='3950'?50:1,30000],y:[v.y,s.model==='3950'?50:1,30000],hz:[HZ.indexOf(g.hz),0,HZ.length-1],lod:[g.lod,0,2],profile:[s.profile,0,3],brightness:[s.brightness,1,10],album:[s.album,1,4],preset:[s.preset,0,3],clock:[s.clock,1,3]};
  for(let b of layers.querySelectorAll('.hit')){let m=b.dataset.id.match(/^(.*)_(minus|plus)$/);if(m&&limits[m[1]]){let [v,min,max]=limits[m[1]];b.disabled=m[2]==='minus'?v<=min:v>=max;}}
 }else if(!timer&&s.display===1){
  if(v.x===v.y)value([46,233,130,54],v.x,40,'#202020','Bebas');
  else{value([46,231,130,58],'',26,'#202020','Bebas');value([46,231,130,29],'X '+v.x,28,'#202020','Bebas');value([46,260,130,29],'Y '+v.y,28,'#202020','Bebas');}
  for(let [r,t] of [[[218,233,130,54],g.hz+' HZ'],[[390,233,130,54],LOD[g.lod]+' MM'],[[46,387,130,54],g.motion?'ON':'OFF'],[[218,387,130,54],'PROF'+(s.profile+1)],[[390,387,130,54],g.fps]])value(r,t,40,'#202020','Bebas');
 }
}
function render(){
 if(!s.screenOn){stopHold();fn=false;}
 let id=fn?['D01','P02','P03','P04'][s.fnPage]:DISP[s.display];if(fn&&s.fnPage===0&&current().xy)id='D07';if(!fn&&s.display===0)id='C0'+s.clock;if(!fn&&s.display===3&&s.album>s.albumCount)id=s.albumCount?'F02SLOT':'F02';if(!fn&&s.display===2&&!s.hostAvailable)id='F03';
 if(id==='F04'&&renderId!==id)messageStart=performance.now();if(id==='A01'&&renderId!==id)albumAt=performance.now();renderId=id;base.src=AS+'07_页面SVG/'+id+(s.v2&&fn&&s.theme==='#50b9f2'?'-blue':'')+'.svg';base.style.visibility=s.screenOn&&!timer||fn?'visible':'hidden';
 board.classList.toggle('fn',fn);board.style.setProperty('--accent',s.v2?s.theme:'#78be1f');board.style.setProperty('--button-hover',s.v2&&s.theme==='#50b9f2'?'#103448':'#263d0d');board.style.setProperty('--button-pressed',s.v2&&s.theme==='#50b9f2'?'#205a79':'#416719');
 board.style.filter='none';
 layers.replaceChildren();if(s.screenOn){if(fn)fnControls();updateValues();}drawOverlay();syncPanel();
}
function batterySVG(){return StatusUI.render(s,!!low&&Math.floor(performance.now()/500)%2===0,Math.floor(performance.now()/500)%2===0);}
function formatTime(ms,countUp=false){let v=Math.max(0,countUp?Math.floor(ms/1000):Math.ceil(ms/1000));return String(Math.floor(v/60)).padStart(2,'0')+':'+String(v%60).padStart(2,'0')}
function messageLayout(now=performance.now()){
 const size=Math.max(16,Math.min(80,Number(s.messageSize)||32)),speed=Math.max(10,Math.min(120,Number(s.messageSpeed)||30));
 const txt=(s.message||'[INSERT YOUR MESSAGE]').replace(/[\r\n]+/g,' ');textMeasure.font=size+'px DM';
 const width=textMeasure.measureText(txt).width,overflow=width>470;let shown=txt,x=285,anchor='middle';
 if(s.messageMode==='static'&&overflow){let chars=Array.from(txt);while(chars.length&&textMeasure.measureText(chars.join('')+'…').width>470)chars.pop();shown=chars.join('')+'…';}
 if(s.messageMode!=='static'){const travel=470+width,at=Math.max(0,now-messageStart)/1000;x=520-(at*speed)%travel;anchor='start';}
 return {size,speed,shown,x,anchor,overflow};
}
function drawMessage(){const m=messageLayout();return rect(0,0,570,488,s.messageBg)+`<clipPath id="msgclip"><rect x="50" y="150" width="470" height="188"/></clipPath><g clip-path="url(#msgclip)">${svgText(m.x,244+m.size*.35,m.shown,m.size,'DM',s.messageColor,m.anchor)}</g>`;}
function drawOverlay(){
 let out='';if(fn&&s.fnPage===3&&s.album>s.albumCount)out+='<g data-empty-slot="true" transform="translate(445 158)"><g fill="none" stroke="#888888" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="0" y="0" width="23" height="18" rx="2"/><path d="M3 14l5-5 4 4 4-5 4 6M1 1l21 16"/></g></g>';if(!s.screenOn){paintOverlay(rect(0,0,570,488));return;}
 if(timer&&!fn){
  let elapsed=timer.state==='running'?Math.min(performance.now()-timer.start,timer.limit):timer.elapsed,ms=timer.mode==='up'?elapsed:timer.limit-elapsed;
  let state=timer.state==='running'?'RUNNING':timer.expired?(timer.mode==='up'?'LIMIT REACHED':"TIME'S UP"):(timer.mode==='up'?'STOPPED  /  ELAPSED':'STOPPED  /  REMAINING');
  out=rect(0,0,570,488,'#111')+svgText(285,80,timer.mode==='up'?'COUNT UP':'COUNT DOWN',29,'DM','#78be1f')+svgText(285,264,formatTime(ms,timer.mode==='up'),132,'Bebas',s.v2?s.timerColor:'#fff')+svgText(285,326,state,25,'DM','#78be1f')+rect(52,369,466,5,'#303030')+rect(52,369,466*(elapsed/timer.limit),5,'#78be1f')+svgText(285,436,timer.state==='running'?'FN STOP':'FN  RESTART     BACK IN '+Math.max(0,Math.ceil((timer.until-performance.now())/1000))+'s',timer.state==='running'?24:21);
 }else if(!fn){
  if(s.display===0||s.display===1)out+=batterySVG();
  if(s.display===0){let d=new Date(),hh=String(d.getHours()).padStart(2,'0'),mm=String(d.getMinutes()).padStart(2,'0'),cc=s.v2?s.clockColor:'#fff';
   if(s.clock===1)out+=rect(55,165,470,227,'#111')+svgText(285,354,hh+':'+mm,240,'Bebas',cc);
   if(s.clock===2)out+=rect(110,190,350,150,'#111')+rect(290,196,3,138,'#78be1f')+svgText(217,334,hh,164,'Bebas',cc)+svgText(383,334,mm,164,'Bebas',cc);
   if(s.clock===3){out+=rect(54,216,295,119,'#202020')+svgText(201,310,hh+':'+mm,100,'Bebas',cc)+rect(395,177,120,155,'#202020')+svgText(455,208,d.toLocaleDateString('en-US',{month:'short'}).toUpperCase(),28,'DM','#78be1f')+svgText(455,319,String(d.getDate()).padStart(2,'0'),94,'Bebas','#fff');}
   out+=rect(35,405,500,64,'#111')+svgText(285,s.clock===2?446:440,s.clock===3?d.toLocaleDateString('en-US',{weekday:'long'}).toUpperCase():d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'2-digit'}).toUpperCase(),s.clock===3?40:s.clock===1?40:34,'DM','#78be1f');
   if(s.v2&&s.weather)out+=rect(35,458,500,24,'#111')+svgText(285,476,s.hostAvailable?'SHENZHEN  CLOUDY  26°C':'WEATHER UNAVAILABLE',15,'DM','#78be1f');
  }
  if(s.display===4)out+=drawMessage();
  if(s.display===3&&s.album<=s.albumCount){if(albumImages[s.album-1])out+=rect(0,0,570,488)+`<image href="${albumImages[s.album-1]}" x="0" y="0" width="570" height="488" preserveAspectRatio="xMidYMid meet"/>`;else out+=rect(12,449,140,27,'#111')+svgText(82,468,'ALBUM '+s.album,15);}
 }
 if(!fn&&!timer&&s.display===3&&s.albumCount>0&&s.album>s.albumCount)out+=rect(150,150,270,45,'#111')+svgText(285,183,'ALBUM '+s.album,24,'DM','#888');
 if(notice&&!fn&&!timer)out+=rect(31,459,506,26,'#223505')+svgText(285,478,notice.text,16);
 if(low&&!fn&&!timer&&!notice)out+=rect(95,170,380,144,'#111','stroke="#ff5252" stroke-width="2"')+svgText(285,223,'LOW BATTERY',30,'Bebas')+svgText(285,279,s.battery+'%',42,'Bebas');
 if(failureUntil>performance.now()&&!timer)out+=rect(31,459,506,26,'#202020')+rect(31,459,3,26,'#ff5252')+svgText(285,478,'UPDATE FAILED',16);
 if(s.brightness<10)out+=rect(0,0,570,488,'#000',`opacity="${(10-s.brightness)*.055}"`);
 paintOverlay(out);
}
function paintOverlay(out){if(out!==overlayMarkup){$('#overlay').innerHTML=out;overlayMarkup=out;}}
function syncPanel(){
 for(let k of ['timerEnabled','xy','screenOn','charging','weather','v2','hostAvailable','albumAuto','uiEnabled','pairing']){let e=$('#'+k);if(e)e.checked=k==='xy'?current().xy:s[k];}
 for(let k of ['model','mode','mapping','link','battery','clockColor','timerColor','theme','albumCount','preset']){let e=$('#'+k);if(e&&document.activeElement!==e)e.value=k==='preset'?s[k]+1:s[k];}
 {const factor=Number($('#timerUnit').value);$('#presetSeconds').value=Number((s.presets[s.preset]/factor).toFixed(6));$('#presetSeconds').min=1/factor;$('#presetSeconds').max=3600/factor;$('#presetSeconds').step='any';}
 const pages=window.DemoI18n?DemoI18n.displayPages():['时钟','鼠标信息','主机信息','相册','自定义文字'];
 $('#where').textContent=window.DemoI18n?DemoI18n.formatWhere({screenOn:s.screenOn,fn,fnPage:s.fnPage,timer,display:s.display}):(!s.screenOn?'屏幕关闭':fn?'FN 第'+(s.fnPage+1)+'页':timer?'计时'+(timer.state==='running'?'运行中':'结果'):pages[s.display]);
 if(document.activeElement!==$('#message'))$('#message').value=s.message;
 for(const key of ['messageMode','messageSize','messageSpeed','messageColor','messageBg'])if(document.activeElement!==$('#'+key))$('#'+key).value=s[key];
 $('#messageSpeed').disabled=s.messageMode==='static';
 const ml=messageLayout();$('#messageHint').textContent=window.DemoI18n?DemoI18n.messageHint(s,ml):Array.from(s.message).length+' 字符；'+(s.messageMode==='static'&&ml.overflow?'当前字号下无法完整显示，请缩短文字、减小字号或选择滚动。':'字数上限及可调范围由芯谷确认；当前数值仅用于效果演示。');
 $('#batteryValue').textContent=s.battery+'%';$('#activePreset').textContent=window.DemoI18n?DemoI18n.activePreset(s):('当前预设 '+(s.preset+1)+' · '+s.presets[s.preset]+'秒');
 $('#albumInterval').value=s.albumInterval;
 for(let k of ['theme','clockColor','timerColor','weather'])$('#'+k).disabled=!s.v2;
 document.querySelectorAll('[data-page]').forEach(e=>e.checked=s.enabled[Number(e.dataset.page)]);
}
function setBattery(v){
 stopHold();
 s.battery=v;if(v<100)s.chargeComplete=false;if(StatusUI.valid(s)&&!s.charging&&s.v2){for(let n of [20,15])if(v<=n&&!lowDone.has(n))queuedLow=n;}
 if(!StatusUI.valid(s)){low=null;queuedLow=null;}if(s.charging){low=null;queuedLow=null;if(v>20)lowDone.clear();}
 persist();render();
}
function tick(){
 if(window.ota?.active())return;
 let now=performance.now();
 if(timer?.state==='running'&&now-timer.start>=timer.limit)finishTimer(true);
 if(timer?.state==='result'&&now>=timer.until){s.display=validPage(timer.returnPage);timer=null;render();persist();}
 if(hold?.repeat&&now>=hold.next){hold.repeating=true;hold.next=now+100;hold.action();}
 if(fn&&!hold&&now-lastInput>=3000)leaveFN('3秒无鼠标操作，自动退出');
 if(notice&&now>=notice.until)notice=null;
 if(queuedLow!==null&&StatusUI.valid(s)&&s.v2&&!fn&&!timer&&!notice&&s.screenOn&&!s.charging){low={until:now+3000,threshold:queuedLow};for(let n of [20,15])if(n>=queuedLow)lowDone.add(n);queuedLow=null;}
 if(low&&now>=low.until)low=null;
 if(!fn&&!timer&&s.display===3&&s.albumCount&&s.albumAuto&&now-albumAt>=s.albumInterval*1000){s.album=s.album%s.albumCount+1;albumAt=now;}
 drawOverlay();
}
window.addEventListener('pointerup',e=>{
 if(hold){let h=hold;stopHold();if(!h.repeating&&e.button===0)h.action();activity();}
 if(physical){let p=physical;physical=null;clearTimeout(p.timeout);$('#fn').classList.remove('down');if(!p.long)shortFN();}
});
window.addEventListener('pointercancel',()=>{stopHold();if(physical)clearTimeout(physical.timeout);physical=null;});
window.addEventListener('blur',()=>{stopHold();if(physical)clearTimeout(physical.timeout);physical=null;});
window.addEventListener('pointermove',e=>{
 let r=board.getBoundingClientRect(),scale=r.width/570,x=(e.clientX-r.left)/scale,y=(e.clientY-r.top)/scale;
 if(fn&&x>=0&&x<=570&&y>=0&&y<=488)activity();
 if(hold){let b=hold.r;if(x<b[0]||x>b[0]+b[2]||y<b[1]||y>b[1]+b[3])stopHold();}
});
board.addEventListener('contextmenu',e=>e.preventDefault());board.addEventListener('wheel',e=>{if(fn){activity();e.preventDefault();}},{passive:false});
board.addEventListener('pointerdown',e=>{if(fn){activity();if(e.button===3||e.button===4){e.preventDefault();fnPage(e.button===3?-1:1);}}});
$('#fn').onpointerdown=e=>{if(e.button!==0)return;e.preventDefault();physical={long:false};physical.timeout=setTimeout(()=>{if(physical){physical.long=true;enterFN();}},2000);$('#fn').classList.add('down');};
$('#short').onclick=shortFN;$('#enter').onclick=enterFN;$('#side').onclick=sideDouble;
$('#sideSingle').onclick=()=>say('侧键单击：实机打开TeevoLink。此演示不跳转未确认的网址。');
$('#external').onclick=externalChange;
$('#dpiKey').onclick=()=>{if(s.pairing){say('配对中，DPI键暂不切档。');return;}stopHold();current().slot=(current().slot+1)%5;externalNotice('DPI CHANGED');persist();render();say('鼠标DPI键切换到档位'+(current().slot+1)+'；FN箭头仍修改当前档数值。');};
$('#m4').onclick=()=>{if(fn)fnPage(-1);else say('M4在FN设置中切上一页；当前不切展示页。');};$('#m5').onclick=()=>{if(fn)fnPage(1);else say('M5在FN设置中切下一页；当前不切展示页。');};
$('#reset').onclick=()=>{if(physical)clearTimeout(physical.timeout);physical=null;$('#fn').classList.remove('down');s=clone(original);timer=null;fn=false;notice=null;low=null;queuedLow=null;failureUntil=0;lowDone.clear();albumImages=[];messageMetrics=null;messageStart=performance.now();$('#albumFiles').value='';stopHold();persist();render();say('演示已复位；计时器默认关闭。');};
function batteryFeedback(){say(!s.v2?'电量已更新；低电提醒属于V2，当前关闭。':s.charging?'电量已更新；充电时不弹低电提醒。':fn||timer?'电量已更新；低电提醒等待FN或计时结束，不打断当前操作。':queuedLow!==null?'电量已更新，低电提醒显示3秒。':'电量已更新；同一轮放电中，相同阈值不重复提醒。');}
$('#simulate20').onclick=()=>{setBattery(20);batteryFeedback();};$('#simulate15').onclick=()=>{setBattery(15);batteryFeedback();};
$('#failure').onclick=()=>{failureUntil=performance.now()+2000;say('模拟失败：有效值保持不变；不显示成功。');render();};
for(let k of ['timerEnabled','screenOn','charging','weather','v2','hostAvailable','albumAuto','uiEnabled','pairing'])$('#'+k).onchange=e=>{
 s[k]=e.target.checked;stopHold();if(k==='albumAuto')albumAt=performance.now();if(k==='timerEnabled'&&!s.timerEnabled){if(timer)s.display=validPage(timer.returnPage);timer=null;}
 if(k==='charging'){if(!s.charging)s.chargeComplete=false;setBattery(s.battery);}
 if(k==='v2'){if(!s.v2){low=null;queuedLow=null;}else setBattery(s.battery);}
 if((k==='screenOn'&&!s.screenOn)||(k==='uiEnabled'&&!s.uiEnabled)||(k==='pairing'&&s.pairing)){fn=false;if(timer)s.display=validPage(timer.returnPage);timer=null;}
 persist();render();
 const messages={timerEnabled:s.timerEnabled?'计时器已开启，FN短按优先控制计时。':'计时器已关闭，FN短按恢复自定义功能。',screenOn:s.screenOn?'屏幕已开启，恢复原亮度。':'屏幕已关闭，亮度档位保留。',charging:s.charging?'已模拟充电，低电提醒停止。':'已结束充电模拟。',weather:s.weather?'天气已开启，返回时钟页查看样例。':'天气已关闭。',v2:s.v2?'V2功能已开启。':'V2功能已关闭，颜色恢复默认，天气与低电提醒停用。',hostAvailable:s.hostAvailable?'主机与天气样例数据已恢复；这些不是真实电脑读数。':'主机与天气数据已设为不可用，相关页面显示文字提示。',albumAuto:s.albumAuto?'相册轮播已开启，每'+s.albumInterval+'秒一张。':'相册轮播已关闭，保持当前图片。',uiEnabled:s.uiEnabled?'FN UI已开启。':'FN UI已关闭。',pairing:s.pairing?'配对中：FN、计时和DPI切档暂停；接收器侧键仍可用。':'已结束配对模拟，FN操作恢复。'};say(messages[k]);
};
$('#xy').onchange=e=>{current().xy=e.target.checked;if(!current().xy)for(let slot of current().slots)slot.y=slot.x;stopHold();persist();render();say(current().xy?'X/Y独立已开启，FN第1页可分别调整两轴。':'X/Y已联动，本配置组各档Y同步为X。');};
for(let k of ['model','mode','mapping','link','clockColor','timerColor','theme','albumCount','preset'])$('#'+k).onchange=e=>{
 stopHold();
 s[k]=['albumCount','preset'].includes(k)?Number(e.target.value)-(k==='preset'?1:0):e.target.value;
 if(k==='link'){low=null;queuedLow=null;}if(k==='link'&&s.link!=='2.4G'){stopHold();fn=false;if(timer)s.display=validPage(timer.returnPage);timer=null;}
 if(k==='albumCount'){s.album=Math.max(1,Math.min(s.album,4));albumAt=performance.now();}persist();render();
 const messages={model:'已切换为'+s.model+'，DPI步进为'+(s.model==='3950'?50:1)+'。',mode:'已选择'+(s.mode==='up'?'正计时':'倒计时')+'；下一轮生效，当前计时不变。',mapping:'FN短按已设为'+(s.mapping==='hz'?'切换Hz':'翻展示页')+'；开启计时器时仍由计时优先。',link:'连接已设为'+s.link+'；'+(s.link==='2.4G'?'可进入FN。':'不可进入FN。'),clockColor:'时钟数字颜色已修改，返回时钟页查看。',timerColor:'计时数字颜色已修改，计时画面可见。',theme:'FN主题色已修改，进入FN设置查看。',albumCount:s.albumCount?'有效相册数量已设为'+s.albumCount+'；其余档位显示无图片图标。':'相册已清空，展示页显示空相册提示。',preset:'已选择计时预设'+(s.preset+1)+'，下一轮使用'+s.presets[s.preset]+'秒。'};say(messages[k]);
};
$('#battery').oninput=e=>{setBattery(Number(e.target.value));batteryFeedback();};
$('#albumInterval').onchange=e=>{stopHold();s.albumInterval=Math.max(1,Math.min(60,Math.round(Number(e.target.value)||1)));albumAt=performance.now();persist();syncPanel();say('相册轮播间隔已设为'+s.albumInterval+'秒。');};
$('#presetSeconds').onchange=e=>{s.presets[s.preset]=Math.max(1,Math.min(3600,Math.round((Number(e.target.value)||0)*Number($('#timerUnit').value))));persist();syncPanel();say('下一轮计时使用新时长，当前运行不变。');};
function messageChanged(){messageMetrics=null;messageStart=performance.now();persist();drawOverlay();syncPanel();say('文字效果已更新，在自定义文字页查看。');}
$('#message').value=s.message;$('#message').oninput=e=>{s.message=e.target.value;messageChanged();};
for(const key of ['messageMode','messageSize','messageSpeed','messageColor','messageBg'])$('#'+key).oninput=e=>{s[key]=['messageSize','messageSpeed'].includes(key)?Number(e.target.value):e.target.value;messageChanged();};
$('#previewMessage').onclick=()=>{if(fn||timer){say('请先退出FN或结束计时，再预览文字。');return;}s.display=4;messageStart=performance.now();render();};
// Local preview only; content is never uploaded or sent to hardware.
function gifFrames(a){let i=13,n=0;if(a[10]&128)i+=3*(2**((a[10]&7)+1));const sub=()=>{while(i<a.length){let size=a[i++];if(!size)return;i+=size;}};while(i<a.length){let code=a[i++];if(code===0x3b)return n;if(code===0x21){i++;sub();}else if(code===0x2c){let packed=a[i+8];i+=9;if(packed&128)i+=3*(2**((packed&7)+1));i++;sub();n++;}else throw Error('GIF文件不完整');}return n;}
$('#albumFiles').onchange=async e=>{
 try{let files=[...e.target.files];if(files.length>4)throw Error('最多选择4张图片');let images=[];
 for(let f of files){let a=new Uint8Array(await f.arrayBuffer()),gif=String.fromCharCode(...a.slice(0,6)).startsWith('GIF8'),png=a[0]===137&&a[1]===80&&a[2]===78&&a[3]===71;
  if(!png&&!gif)throw Error('只支持PNG或GIF');if(gif&&gifFrames(a)>30)throw Error('GIF最多30帧');
  let url=await new Promise((r,j)=>{let reader=new FileReader();reader.onload=()=>r(reader.result);reader.onerror=j;reader.readAsDataURL(f)});let im=new Image();im.src=url;await im.decode();images.push(url);
 }albumImages=images;s.albumCount=images.length;s.album=1;albumAt=performance.now();if(!fn&&!timer&&s.enabled[3])s.display=3;stopHold();persist();render();say('本地相册已更新；'+(fn||timer?'当前FN或计时继续，返回相册页查看。':'在相册展示页查看。')+'图片仅用于演示。');
 }catch(err){say(err.message||'图片无法读取');}
};
document.querySelectorAll('[data-page]').forEach(e=>e.onchange=()=>{let i=Number(e.dataset.page);if(!e.checked&&s.enabled.filter(Boolean).length<=2){e.checked=true;say('至少保留2个展示页。');return;}stopHold();s.enabled[i]=e.checked;s.display=validPage(s.display);persist();render();say(['时钟','鼠标信息','主机信息','相册','自定义文字'][i]+'页已'+(e.checked?'开启。':'关闭，翻页会跳过。'));});
function resize(){let w=Math.min(570,screen.clientWidth);board.style.transform='scale('+w/570+')';screen.style.height=w*488/570+'px';}new ResizeObserver(resize).observe(screen);
// Exposed local state allows the supplier to inspect the demonstration; no firmware interface implied.
window.demo={state:()=>clone(s),runtime:()=>({fn,timer:timer?clone(timer):null,hold:!!hold,notice:notice?notice.text:null,low:!!low}),enterFN,shortFN,sideDouble,adjust,fnPage,externalChange,render};
render();resize();document.fonts.ready.then(()=>{messageMetrics=null;messageStart=performance.now();});setInterval(tick,40);say('短按FN翻展示页；按住FN满2秒进入设置。右侧按钮也可快速演示。');

$('#timerUnit').onchange=()=>{syncPanel();say('已切换时间单位，计时时长不变；最长60分钟。');};
