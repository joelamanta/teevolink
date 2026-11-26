/* Screen status graphics shared by the demo and vector source exporter. */
const StatusUI={
 valid(s){return s.batteryAvailable!==false&&!s.pairing&&((s.link==='2.4G'&&s.linkConnected!==false)||(s.link==='USB'&&s.wiredBatterySync===true));},
 connected(s){return s.link==='2.4G'&&!s.pairing&&s.linkConnected!==false;},
 color(n){return n>=50?'#78be1f':n>20?'#f5b83d':'#ff5252';},
 battery(s,flash=false){
  const valid=this.valid(s),n=Math.max(0,Math.min(100,Number(s.battery)||0)),charging=valid&&s.charging,full=charging&&s.chargeComplete;
  const c=valid?this.color(n):'#777777',bg=!valid?'#202020':n>=50?'#426413':n>20?'#493613':'#411d1d';
  let out='<g id="battery-indicator"><circle cx="112" cy="81" r="62" fill="#111111"/><circle cx="112" cy="81" r="53" fill="'+bg+'" stroke="#303030" stroke-width="8"/>';
  if(valid&&n>0)out+='<circle class="battery-arc" cx="112" cy="81" r="53" fill="none" stroke="'+(flash?bg:c)+'" stroke-width="8" '+(n===100?'':'pathLength="100" stroke-dasharray="'+n+' 100" transform="rotate(-90 112 81)"')+'/>';
  out+='<text class="battery-number" x="112" y="'+(charging?88:98)+'" text-anchor="middle" fill="#ffffff" font-family="Bebas" font-size="'+(charging?38:44)+'">'+(valid?n+'%':'—')+'</text>';
  if(charging)out+=full?'<path d="M103 108L110 115L122 102" fill="none" stroke="#ffffff" stroke-width="3"/>':'<path d="M116 96L104 111H112L108 122L121 106H113Z" fill="#ffffff"/>';
  return out+'</g>';
 },
 signal(s,pulse=false){
  const connected=this.connected(s),pair=!!s.pairing,c=connected?'#78be1f':pair?'#78be1f':'#777777';
  let out='<g id="link-indicator"><circle cx="458" cy="81" r="62" fill="#111111"/><circle cx="458" cy="81" r="53" fill="'+(connected?'#426413':'#202020')+'" stroke="'+(pair&&pulse?'#303030':c)+'" stroke-width="8"/>';
  out+='<g fill="none" stroke="'+(connected||pair?'#ffffff':'#aaaaaa')+'" stroke-width="5"><path d="M436 57Q416 81 436 105M480 57Q500 81 480 105M445 65Q433 81 445 97M471 65Q483 81 471 97"/></g><circle cx="458" cy="81" r="7" fill="'+(connected||pair?'#ffffff':'#aaaaaa')+'"/>';
  if(!connected&&!pair)out+='<path d="M430 110L486 52" stroke="#202020" stroke-width="10"/><path d="M430 110L486 52" stroke="#aaaaaa" stroke-width="4"/>';
  return out+'</g>';
 },
 render(s,flash=false,pulse=false){return this.battery(s,flash)+this.signal(s,pulse);}
};
if(typeof module!=='undefined')module.exports=StatusUI;
