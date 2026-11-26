'use strict';
(()=>{
 function syncStatus(){for(const key of ['linkConnected','batteryAvailable','wiredBatterySync','chargeComplete']){const e=$('#'+key);if(e)e.checked=!!s[key];}}
 const previous=syncPanel;syncPanel=function(){previous();syncStatus();};
 function disconnect(){if(fn||timer){if(timer)s.display=validPage(timer.returnPage);timer=null;fn=false;stopHold();}low=null;queuedLow=null;}
 for(const key of ['linkConnected','batteryAvailable','wiredBatterySync','chargeComplete'])$('#'+key).onchange=e=>{
  s[key]=e.target.checked;stopHold();
  if(key==='chargeComplete'&&s.chargeComplete){s.charging=true;s.battery=100;}
  if(!StatusUI.connected(s)&&key==='linkConnected')disconnect();
  if(!StatusUI.valid(s)){low=null;queuedLow=null;}else setBattery(s.battery);
  persist();render();say(key==='chargeComplete'?'已模拟收到充满状态；只有电量数据有效时显示。':key==='wiredBatterySync'?'有线电量同步为接入能力演示，需芯谷确认；不改变2.4G连接图标。':StatusUI.valid(s)?'有效电量已恢复，圆环显示最新数值。':'当前没有有效电量，显示灰色“—”，不显示旧读数。');
 };
 for(const e of document.querySelectorAll('[data-battery]'))e.onclick=()=>{setBattery(Number(e.dataset.battery));batteryFeedback();};
 const oldPair=$('#pairing').onchange;$('#pairing').onchange=e=>{oldPair(e);if(s.pairing){low=null;queuedLow=null;}render();};
 syncStatus();
})();
