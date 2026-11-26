/* Local OTA visualization only. No firmware, network or device access. */
'use strict';
(()=>{
 let job=null,wasDisabled=new Map(),lastImage='';
 const layer=document.createElement('div');layer.id='otaLayer';layer.style.cssText='position:absolute;inset:0;z-index:20;background:#111;display:none;pointer-events:none';
 layer.innerHTML='<img id="otaImage" src="../01_UI设计/07_页面SVG/UM01.svg" alt="固件升级状态" style="position:absolute;inset:0;width:570px;height:488px"><svg id="otaProgress" viewBox="0 0 570 488" style="position:absolute;inset:0;width:570px;height:488px"></svg>';
 board.append(layer);
 function lock(on){
  if(on){for(const e of document.querySelectorAll('main button,main input,main select,main textarea'))if(!e.closest('#otaPanel')&&e.id!=='reset'){wasDisabled.set(e,e.disabled);e.disabled=true;}board.style.pointerEvents='none';}
  else{for(const [e,v] of wasDisabled)e.disabled=v;wasDisabled.clear();board.style.pointerEvents='';}
 }
 function state(phase){job.phase=phase;job.at=performance.now();paint();buttons();}
 function buttons(){
  let phase=job?.phase,active=!!job;
  const rules={otaStart:!active,otaFail:phase==='progress',otaLost:phase==='restart',otaReady:phase==='restart',otaRetry:phase==='failed',otaReturn:phase==='failed'};
  const titles={otaStart:'结束当前演示后可重新开始',otaFail:'升级过程中可模拟失败',otaLost:'等待重连时可模拟超时',otaReady:'等待重连时可模拟成功',otaRetry:'升级失败后可重试',otaReturn:'升级失败后可结束演示'};
  for(const [id,enabled] of Object.entries(rules)){const b=$('#'+id);b.disabled=!enabled;b.title=enabled?'':((window.DemoI18n&&DemoI18n.getLang()==='en')?DemoI18n.otaTitle(id):titles[id]);}
  $('#otaTarget').disabled=active;
  const phaseZh=!active?'点击“开始升级”。':phase==='progress'?'正在升级。可点击“模拟升级失败”。':phase==='restart'?'等待重连：请选择“模拟重连成功”或“模拟重连超时”。':phase==='failed'?'升级失败。点击“重试升级”从0%重新开始，或结束演示。':'升级成功，3秒后回到展示页。';
  $('#otaPhase').textContent=window.DemoI18n?DemoI18n.trMsg(phaseZh):phaseZh;
 }
 window.__otaRefreshButtons=buttons;
 function paint(){if(!job)return;
  let n={progress:'01',success:'02',failed:'03',restart:'04'}[job.phase],id='U'+job.target+n;
  if(lastImage!==id){$('#otaImage').src=AS+'07_页面SVG/'+id+'.svg?rev=209';lastImage=id;}
  let percent=Math.min(100,Math.floor((performance.now()-job.at)/80));
  $('#otaProgress').innerHTML=job.phase==='progress'?rect(45,173,480,117,'#111')+svgText(285,271,percent+'%',86)+rect(55,314,460,8,'#333')+rect(55,314,460*percent/100,8,'#78be1f'):'';
  const whereZh=(job.target==='M'?'鼠标':'接收器')+'固件 · '+{progress:'升级中',restart:'等待重连',success:'升级成功',failed:'升级失败'}[job.phase];
  $('#where').textContent=window.DemoI18n?DemoI18n.trMsg(whereZh):whereZh;
 }
 function start(){if(job)return;if(!s.screenOn){say('请先开启屏幕，再演示升级画面。');return;}if(s.pairing){say('请先结束配对，再升级固件。');return;}
  if($('#otaTarget').value==='M'&&!['2.4G','USB'].includes(s.link)){say('鼠标升级需要2.4G或有线连接。');return;}
  let back=timer?timer.returnPage:s.display;
  stopHold();if(physical)clearTimeout(physical.timeout);physical=null;$('#fn').classList.remove('down');fn=false;timer=null;clearTransient();failureUntil=0;render();
  job={target:$('#otaTarget').value,phase:'progress',at:performance.now(),back};layer.style.display='block';board.classList.remove('fn');lock(true);paint();buttons();say('升级演示开始：本轮计时已结束，FN与设置暂不可用。请勿断开USB或电源。');
 }
 function end(message){if(!job)return;let back=job.back;job=null;layer.style.display='none';$('#otaProgress').innerHTML='';lastImage='';lock(false);s.display=validPage(back);fn=false;timer=null;activity();render();persist();buttons();say(message);}
 function fail(reason){if(!job)return;state('failed');say(reason+'。保留失败提示，请在TeevoLink检查连接后重试。');}
 function tickOTA(){if(!job)return;let elapsed=performance.now()-job.at;
  if(job.phase==='progress'&&elapsed>=8000){state('restart');say('传输完成，等待重连。请在右侧选择模拟重连成功或超时。');}
  else if(job.phase==='success'&&elapsed>=3000){end('升级演示结束，返回原展示页；不恢复FN或本轮计时。');}
  paint();
 }
 $('#otaStart').onclick=start;$('#otaFail').onclick=()=>{if(job?.phase==='progress')fail('模拟升级失败');};$('#otaLost').onclick=()=>{if(job?.phase==='restart')fail('模拟设备重连超时');};
 $('#otaReady').onclick=()=>{if(job?.phase==='restart'){state('success');say('模拟设备已重新连接并确认版本，显示成功3秒。');}};
 $('#otaRetry').onclick=()=>{if(job?.phase==='failed'){state('progress');say('模拟在驱动重试，重新开始升级。');}};
 $('#otaReturn').onclick=()=>end('已结束失败演示。实机应在驱动处理升级故障。');
 // Freeze ordinary controls even when a synthetic event is dispatched during OTA.
 for(const type of ['click','change','input','pointerdown','keydown'])document.querySelector('main').addEventListener(type,e=>{if(!job||e.target.closest('#otaPanel'))return;if(e.target.id==='reset'){end('演示复位');return;}e.preventDefault();e.stopImmediatePropagation();},true);
 window.ota={active:()=>!!job,state:()=>job?JSON.parse(JSON.stringify(job)):null};
 buttons();setInterval(tickOTA,40);
})();
