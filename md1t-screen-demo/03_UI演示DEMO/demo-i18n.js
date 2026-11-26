'use strict';
/** MD1T screen demo — shell i18n + status message translation (ZH default). */
window.DemoI18n = (() => {
  const STORAGE_LANG = 'md1t-demo-lang';
  let lang = localStorage.getItem(STORAGE_LANG) === 'en' ? 'en' : 'zh';

  const shell = {
    zh: {
      'meta.eyebrow': 'TEEVOLUTION / MD1T + XD10 / 2026.10.13',
      'title': 'UI演示DEMO',
      'nav.home': '交付首页',
      'nav.spec': '功能定义介绍',
      'nav.design': 'UI 设计',
      'nav.gif': 'GIF 参考',
      'quick.title': '演示控制',
      'where.label': '当前画面',
      'badge.artboard': '原画板 570 × 488',
      'hint.pointer': '用鼠标操作屏幕。网页演示不接管电脑光标。',
      'sect.inputs': '设备按键',
      'sect.ota': '固件升级',
      'sect.quick': '快捷演示',
      'sect.timer': '计时器',
      'sect.mouse': '鼠标与连接',
      'sect.display': '展示与内容',
      'sect.status': '电量与连接',
      'sect.v2': 'V2 颜色与低电',
      'fn': 'FN · 短按 / 按住2秒',
      'm4': 'M4 上一页',
      'm5': 'M5 下一页',
      'sideSingle': '侧键单击',
      'side': '侧键双击',
      'dpiKey': '鼠标 DPI 键',
      'ota.summary': '固件升级演示',
      'ota.target': '升级对象',
      'ota.target.m': '鼠标',
      'ota.target.r': '接收器',
      'ota.start': '开始升级',
      'ota.fail': '模拟升级失败',
      'ota.ready': '模拟重连成功',
      'ota.lost': '模拟重连超时',
      'ota.retry': '重试升级',
      'ota.return': '结束失败演示',
      'ota.note': '这些按钮模拟驱动事件。重连阶段由你选择成功或超时。开始升级会结束当前计时。模拟进度，不连接设备。升级成功需设备重新连接确认；接收器自身升级能否显示进度，待芯谷确认。',
      'quick.enter': '快速进入FN',
      'quick.short': '模拟FN短按',
      'quick.lod': '驱动修改 LOD',
      'quick.reset': '复位演示',
      'quick.note': '以下控件用于模拟驱动设置和设备事件。',
      'timer.enable': '开启计时器',
      'timer.type': '类型',
      'timer.down': '倒计时',
      'timer.up': '正计时',
      'timer.preset': '当前预设',
      'timer.duration': '本档时长',
      'timer.unit': '时间单位',
      'timer.unit.s': '秒',
      'timer.unit.m': '分钟',
      'timer.unit.h': '小时',
      'timer.presetNote': '时长范围 1 秒～60 分钟。到点显示结果 5 秒。',
      'mouse.sensor': '传感器',
      'mouse.xy': 'X/Y 独立',
      'mouse.fnMap': 'FN 短按自定义',
      'mouse.map.page': '翻展示页（默认）',
      'mouse.map.hz': '切换 Hz',
      'mouse.link': '连接',
      'mouse.pairing': '模拟配对中',
      'mouse.uiOn': 'FN UI 总开关',
      'mouse.note': '演示 Hz：125～8000；DPI 上限 30000。实际档表和默认值待芯谷确认。',
      'disp.screenOn': '屏幕开启',
      'disp.page.clock': '时钟',
      'disp.page.mouse': '鼠标',
      'disp.page.host': '主机',
      'disp.page.album': '相册',
      'disp.page.text': '文字',
      'disp.albumCount': '有效相册数量',
      'disp.albumEmpty': '0 · 空相册',
      'disp.albumAuto': '相册轮播',
      'disp.albumInterval': '轮播间隔（秒）',
      'disp.albumFiles': '本地预览图片',
      'disp.albumFilesHint': '最多 4 张 PNG/GIF，GIF 最多 30 帧。仅本地预览，刷新后需重选。',
      'disp.albumGifLink': '相册 GIF 效果参考',
      'disp.albumGifHint': '：Logo 静止、光晕平滑呼吸；请芯谷确认支持情况及效果差异。',
      'disp.message': '自定义文字',
      'disp.messageMode': '显示方式',
      'disp.static': '静态',
      'disp.scroll': '滚动',
      'disp.messageSize': '文字大小（演示）',
      'disp.messageSpeed': '滚动速度（演示，像素/秒）',
      'disp.messageColor': '文字颜色',
      'disp.messageBg': '背景颜色',
      'disp.previewMsg': '预览文字效果',
      'disp.hostOk': '主机数据可用',
      'disp.failUpdate': '模拟更新失败',
      'status.link24': '2.4G 已连接',
      'status.battData': '电量数据有效',
      'status.chargeDone': '已收到充满状态',
      'status.wiredSync': '有线模式收到驱动电量同步',
      'status.note': '充电开关在下方电量面板。USB/蓝牙默认不向接收器同步电量；这里仅模拟明确收到的数据。右侧图标只表示2.4G连接，不表示信号强弱。',
      'v2.show': '显示 V2 功能',
      'v2.theme': '主题',
      'v2.theme.green': '原绿色',
      'v2.theme.blue': '蓝色参考',
      'v2.clockColor': '时钟数字',
      'v2.timerColor': '计时数字',
      'v2.color.white': '白色',
      'v2.color.green': '绿色',
      'v2.color.blue': '蓝色',
      'v2.weather': '显示天气（样例）',
      'v2.battery': '电量',
      'v2.charging': '充电中',
      'v2.sim20': '演示 20% 提醒',
      'v2.sim15': '降到 15%',
      'lang.switchEn': 'Switch to English',
      'lang.switchZh': '切换到中文'
    },
    en: {
      'meta.eyebrow': 'TEEVOLUTION / MD1T + XD10 / 2026.10.13',
      'title': 'UI Demo',
      'nav.home': 'Delivery home',
      'nav.spec': 'Feature spec',
      'nav.design': 'UI design',
      'nav.gif': 'GIF reference',
      'quick.title': 'Demo controls',
      'where.label': 'Current screen',
      'badge.artboard': 'Artboard 570 × 488',
      'hint.pointer': 'Use the mouse on the device screen. This page does not capture your system cursor.',
      'sect.inputs': 'Device keys',
      'sect.ota': 'Firmware',
      'sect.quick': 'Quick demo',
      'sect.timer': 'Timer',
      'sect.mouse': 'Mouse & link',
      'sect.display': 'Display & content',
      'sect.status': 'Battery & link',
      'sect.v2': 'V2 color & low battery',
      'fn': 'FN · tap / hold 2s',
      'm4': 'M4 previous',
      'm5': 'M5 next',
      'sideSingle': 'Side single-click',
      'side': 'Side double-click',
      'dpiKey': 'Mouse DPI key',
      'ota.summary': 'Firmware update demo',
      'ota.target': 'Target',
      'ota.target.m': 'Mouse',
      'ota.target.r': 'Receiver',
      'ota.start': 'Start update',
      'ota.fail': 'Simulate failure',
      'ota.ready': 'Simulate reconnect OK',
      'ota.lost': 'Simulate reconnect timeout',
      'ota.retry': 'Retry update',
      'ota.return': 'End failure demo',
      'ota.note': 'Buttons simulate driver events. During reconnect, choose success or timeout. Starting update ends the current timer. Progress is simulated only.',
      'quick.enter': 'Enter FN',
      'quick.short': 'Simulate FN tap',
      'quick.lod': 'Driver changes LOD',
      'quick.reset': 'Reset demo',
      'quick.note': 'Controls below simulate driver settings and device events.',
      'timer.enable': 'Enable timer',
      'timer.type': 'Mode',
      'timer.down': 'Count down',
      'timer.up': 'Count up',
      'timer.preset': 'Preset',
      'timer.duration': 'Duration',
      'timer.unit': 'Unit',
      'timer.unit.s': 'Seconds',
      'timer.unit.m': 'Minutes',
      'timer.unit.h': 'Hours',
      'timer.presetNote': 'Range 1 s–60 min. Result shows for 5 s when finished.',
      'mouse.sensor': 'Sensor',
      'mouse.xy': 'Separate X/Y',
      'mouse.fnMap': 'FN tap action',
      'mouse.map.page': 'Cycle display pages (default)',
      'mouse.map.hz': 'Cycle polling rate',
      'mouse.link': 'Connection',
      'mouse.pairing': 'Simulate pairing',
      'mouse.uiOn': 'FN UI master switch',
      'mouse.note': 'Demo Hz: 125–8000; DPI cap 30000. Final tables and defaults pending vendor confirmation.',
      'disp.screenOn': 'Screen on',
      'disp.page.clock': 'Clock',
      'disp.page.mouse': 'Mouse info',
      'disp.page.host': 'Host info',
      'disp.page.album': 'Album',
      'disp.page.text': 'Custom text',
      'disp.albumCount': 'Album slots in use',
      'disp.albumEmpty': '0 · empty',
      'disp.albumAuto': 'Album slideshow',
      'disp.albumInterval': 'Slideshow interval (s)',
      'disp.albumFiles': 'Local preview images',
      'disp.albumFilesHint': 'Up to 4 PNG/GIF; GIF max 30 frames. Local only; re-select after refresh.',
      'disp.albumGifLink': 'Album GIF reference',
      'disp.albumGifHint': ' — static logo, smooth glow; confirm support with vendor.',
      'disp.message': 'Custom message',
      'disp.messageMode': 'Layout',
      'disp.static': 'Static',
      'disp.scroll': 'Scroll',
      'disp.messageSize': 'Font size (demo)',
      'disp.messageSpeed': 'Scroll speed (px/s, demo)',
      'disp.messageColor': 'Text color',
      'disp.messageBg': 'Background color',
      'disp.previewMsg': 'Preview message',
      'disp.hostOk': 'Host sample data available',
      'disp.failUpdate': 'Simulate update failure',
      'status.link24': '2.4G connected',
      'status.battData': 'Battery data valid',
      'status.chargeDone': 'Full-charge flag received',
      'status.wiredSync': 'Wired battery sync from driver',
      'status.note': 'Charging toggle is in the V2 panel below. USB/BT do not sync receiver battery by default; only explicit data is simulated. The link icon is 2.4G only, not signal strength.',
      'v2.show': 'Enable V2 features',
      'v2.theme': 'Accent theme',
      'v2.theme.green': 'Green (default)',
      'v2.theme.blue': 'Blue reference',
      'v2.clockColor': 'Clock digits',
      'v2.timerColor': 'Timer digits',
      'v2.color.white': 'White',
      'v2.color.green': 'Green',
      'v2.color.blue': 'Blue',
      'v2.weather': 'Show weather (sample)',
      'v2.battery': 'Battery',
      'v2.charging': 'Charging',
      'v2.sim20': 'Demo 20% alert',
      'v2.sim15': 'Drop to 15%',
      'lang.switchEn': 'Switch to English',
      'lang.switchZh': 'Switch to 中文'
    }
  };

  const pagesZh = ['时钟', '鼠标信息', '主机信息', '相册', '自定义文字'];
  const pagesEn = ['Clock', 'Mouse info', 'Host info', 'Album', 'Custom text'];

  const rules = [
    [/^(.+)，调整已保留。$/, m => trSuffix(m[1], ', settings kept.')],
    [/^FN第(\d+)页，点击即生效。$/, m => `FN page ${m[1]} — tap to apply.`],
    [/^已切换为(\d+)，DPI步进为(\d+)。$/, m => `Sensor ${m[1]}; DPI step ${m[2]}.`],
    [/^相册轮播间隔已设为(\d+)秒。$/, m => `Slideshow interval set to ${m[1]} s.`],
    [/^已选择计时预设(\d+)，下一轮使用(\d+)秒。$/, m => `Preset ${m[1]} selected; next run uses ${m[2]} s.`],
    [/^有效相册数量已设为(\d+)；其余档位显示无图片图标。$/, m => `${m[1]} album slot(s) active; empty slots show placeholder.`],
    [/^鼠标DPI键切换到档位(\d+)；FN箭头仍修改当前档数值。$/, m => `DPI key → stage ${m[1]}. FN arrows still edit the active stage value.`],
    [/^相册轮播已开启，每(\d+)秒一张。$/, m => `Slideshow on — ${m[1]} s per image.`],
    [/^(.+)页已开启。$/, m => `${pageNameFromZh(m[1])} page enabled.`],
    [/^(.+)页已关闭，翻页会跳过。$/, m => `${pageNameFromZh(m[1])} page disabled; cycling skips it.`],
    [/^(\d+) 字符；(.+)$/, m => `${m[1]} chars; ${trMsgPart(m[2])}`],
    [/^当前预设 (\d+) · (\d+)秒$/, m => lang === 'en' ? `Preset ${m[1]} · ${m[2]} s` : null],
    [/^(.+)固件 · (升级中|等待重连|升级成功|升级失败)$/, m => {
      const target = m[1] === '鼠标' ? 'Mouse' : m[1] === '接收器' ? 'Receiver' : m[1];
      const phase = { '升级中': 'Updating', '等待重连': 'Awaiting reconnect', '升级成功': 'Success', '升级失败': 'Failed' }[m[2]] || m[2];
      return `${target} FW · ${phase}`;
    }]
  ];

  const exact = {
    '当前连接或屏幕状态不可进入FN。FN鼠控屏仅在2.4G可用。': 'Cannot enter FN — check connection and screen. FN UI requires 2.4G.',
    '已进入FN：点击即生效，3秒无鼠标操作退出。': 'FN active — changes apply on tap; idle 3 s to exit.',
    '已退出FN': 'Exited FN',
    '开始计时；长按FN进入设置时，计时仍继续。': 'Timer started; it keeps running if you enter FN settings.',
    '计时结束，结果显示5秒，然后返回原展示页。': 'Timer finished — result for 5 s, then back to display page.',
    '当前状态下FN不可用。': 'FN is not available in the current state.',
    '短按自定义：切换回报率。': 'FN tap: polling rate cycled.',
    '切到下一已开启展示页。': 'Next enabled display page.',
    '侧键双击：结束计时、退出FN并翻展示页。': 'Side double-click: stop timer, exit FN, next display page.',
    '驱动已修改LOD，FN同步当前值，不弹提示。': 'Driver changed LOD — synced in FN, no toast.',
    '驱动已修改LOD，计时继续，不弹改参提示。': 'Driver changed LOD — timer continues, no toast.',
    '驱动已修改LOD，展示页提示2秒。': 'Driver changed LOD — 2 s toast on display page.',
    '已生效，退出后保留。': 'Applied — kept after exiting FN.',
    'Motion Sync已生效。': 'Motion Sync updated.',
    '时钟数字颜色已生效，返回时钟页可见。': 'Clock color applied — see clock page.',
    '侧键单击：实机打开TeevoLink。此演示不跳转未确认的网址。': 'Side single-click opens TeevoLink on device. Demo does not open unconfirmed URLs.',
    '配对中，DPI键暂不切档。': 'Pairing — DPI key does not switch stages.',
    'M4在FN设置中切上一页；当前不切展示页。': 'M4: previous FN page only (not display pages).',
    'M5在FN设置中切下一页；当前不切展示页。': 'M5: next FN page only (not display pages).',
    '演示已复位；计时器默认关闭。': 'Demo reset; timer off by default.',
    '模拟失败：有效值保持不变；不显示成功。': 'Simulated failure — values unchanged; no success toast.',
    '请先退出FN或结束计时，再预览文字。': 'Exit FN or stop the timer before previewing text.',
    '文字效果已更新，在自定义文字页查看。': 'Message updated — see custom text page.',
    '至少保留2个展示页。': 'Keep at least two display pages enabled.',
    '下一轮计时使用新时长，当前运行不变。': 'New duration applies to the next run; current run unchanged.',
    '已切换时间单位，计时时长不变；最长60分钟。': 'Time unit changed; duration unchanged (max 60 min).',
    '短按FN翻展示页；按住FN满2秒进入设置。右侧按钮也可快速演示。': 'Tap FN to cycle pages; hold FN 2 s for settings. Or use the buttons on the right.',
    '3秒无鼠标操作，自动退出': 'Auto-exit after 3 s idle',
    '屏幕关闭': 'Screen off',
    '最多选择4张图片': 'Select up to 4 images',
    '只支持PNG或GIF': 'PNG or GIF only',
    'GIF最多30帧': 'GIF max 30 frames',
    'GIF文件不完整': 'Invalid GIF file',
    '图片无法读取': 'Could not read image',
    '请先开启屏幕，再演示升级画面。': 'Turn the screen on before the update demo.',
    '请先结束配对，再升级固件。': 'End pairing before firmware update.',
    '鼠标升级需要2.4G或有线连接。': 'Mouse update requires 2.4G or USB.',
    '点击“开始升级”。': 'Click “Start update”.',
    '正在升级。可点击“模拟升级失败”。': 'Updating… use “Simulate failure” if needed.',
    '等待重连：请选择“模拟重连成功”或“模拟重连超时”。': 'Awaiting reconnect — choose success or timeout.',
    '升级失败。点击“重试升级”从0%重新开始，或结束演示。': 'Update failed — retry from 0% or end demo.',
    '升级成功，3秒后回到展示页。': 'Success — returning to display in 3 s.'
  };

  function trSuffix(base, enSuffix) {
    const b = trMsg(base);
    return lang === 'en' ? b + enSuffix : base + '，调整已保留。';
  }

  function pageNameFromZh(name) {
    const i = pagesZh.indexOf(name);
    return i >= 0 ? pagesEn[i] : name;
  }

  function trMsgPart(zh) {
    if (lang === 'zh') return zh;
    if (zh === '当前字号下无法完整显示，请缩短文字、减小字号或选择滚动。') return 'Text overflows at this size — shorten, reduce size, or use scroll.';
    if (zh === '字数上限及可调范围由芯谷确认；当前数值仅用于效果演示。') return 'Character limits and ranges pending vendor; values are for demo only.';
    return zh;
  }

  function trMsg(zh) {
    if (lang !== 'en' || !zh) return zh;
    if (exact[zh]) return exact[zh];
    for (const [re, fn] of rules) {
      const m = zh.match(re);
      if (m) {
        const out = fn(m);
        if (out) return out;
      }
    }
    if (zh.includes('计时器已开启')) return 'Timer on — FN tap controls timer first.';
    if (zh.includes('计时器已关闭')) return 'Timer off — FN tap uses custom action.';
    if (zh.includes('屏幕已开启')) return 'Screen on — brightness restored.';
    if (zh.includes('屏幕已关闭')) return 'Screen off — brightness level kept.';
    if (zh.includes('已模拟充电')) return 'Charging on — low-battery alerts paused.';
    if (zh.includes('已结束充电模拟')) return 'Charging simulation off.';
    if (zh.includes('天气已开启')) return 'Weather sample on — see clock page.';
    if (zh.includes('天气已关闭')) return 'Weather off.';
    if (zh.includes('V2功能已开启')) return 'V2 features enabled.';
    if (zh.includes('V2功能已关闭')) return 'V2 off — defaults restored; weather and low-battery alerts off.';
    if (zh.includes('主机与天气样例数据已恢复')) return 'Host/weather sample data restored (not real PC readings).';
    if (zh.includes('主机与天气数据已设为不可用')) return 'Host/weather marked unavailable.';
    if (zh.includes('相册轮播已关闭')) return 'Slideshow off.';
    if (zh.includes('FN UI已开启')) return 'FN UI enabled.';
    if (zh.includes('FN UI已关闭')) return 'FN UI disabled.';
    if (zh.includes('配对中：')) return 'Pairing — FN, timer, and DPI key paused; receiver side key still works.';
    if (zh.includes('已结束配对模拟')) return 'Pairing simulation ended — FN restored.';
    if (zh.includes('X/Y独立已开启')) return 'Separate X/Y on — adjust on FN page 1.';
    if (zh.includes('X/Y已联动')) return 'X/Y linked — Y follows X per profile stage.';
    if (zh.includes('正计时')) return zh.replace('已选择正计时', 'Count-up selected').replace('已选择倒计时', 'Count-down selected');
    if (zh.startsWith('已选择')) return zh.replace('已选择正计时', 'Count-up selected').replace('已选择倒计时', 'Count-down selected').replace('；下一轮生效，当前计时不变。', '; applies next run.');
    if (zh.startsWith('FN短按已设为切换Hz')) return 'FN tap set to cycle Hz (timer still takes priority when enabled).';
    if (zh.startsWith('FN短按已设为翻展示页')) return 'FN tap set to cycle display pages (timer priority when enabled).';
    if (zh.startsWith('连接已设为')) {
      const link = zh.match(/连接已设为(\S+)；/)?.[1] || '';
      const fnOk = zh.includes('可进入FN');
      return `Link: ${link}. ${fnOk ? 'FN available.' : 'FN not available.'}`;
    }
    if (zh.includes('时钟数字颜色已修改')) return 'Clock color updated — see clock page.';
    if (zh.includes('计时数字颜色已修改')) return 'Timer color updated.';
    if (zh.includes('FN主题色已修改')) return 'FN accent updated — enter FN to preview.';
    if (zh.includes('相册已清空')) return 'Album cleared — empty state on display page.';
    if (zh.startsWith('本地相册已更新')) return 'Local album updated (demo only).';
    if (zh.startsWith('电量已更新')) return 'Battery updated.';
    if (zh.includes('已模拟收到充满状态')) return 'Full-charge flag simulated (shown only when battery data valid).';
    if (zh.includes('有线电量同步')) return 'Wired battery sync simulated; vendor to confirm; 2.4G icon unchanged.';
    if (zh.includes('有效电量已恢复')) return 'Valid battery restored — ring shows latest value.';
    if (zh.includes('当前没有有效电量')) return 'No valid battery — show “—”, not stale value.';
    return zh;
  }

  function t(key) {
    return (shell[lang] && shell[lang][key]) || shell.zh[key] || key;
  }

  function formatWhere(ctx) {
    const { screenOn, fn: inFn, fnPage, timer: tm, display } = ctx;
    if (!screenOn) return t('where.off') || (lang === 'en' ? 'Screen off' : '屏幕关闭');
    if (inFn) return lang === 'en' ? `FN · page ${fnPage + 1}` : `FN 第${fnPage + 1}页`;
    if (tm) {
      const st = tm.state === 'running' ? (lang === 'en' ? 'running' : '运行中') : (lang === 'en' ? 'result' : '结果');
      return lang === 'en' ? `Timer · ${st}` : `计时${st}`;
    }
    const pages = lang === 'en' ? pagesEn : pagesZh;
    return pages[display] || '';
  }

  function messageHint(state, ml) {
    const n = Array.from(state.message).length;
    const tail = state.messageMode === 'static' && ml.overflow
      ? trMsgPart('当前字号下无法完整显示，请缩短文字、减小字号或选择滚动。')
      : trMsgPart('字数上限及可调范围由芯谷确认；当前数值仅用于效果演示。');
    return lang === 'en' ? `${n} chars; ${tail}` : `${n} 字符；${tail}`;
  }

  function activePreset(state) {
    return lang === 'en'
      ? `Preset ${state.preset + 1} · ${state.presets[state.preset]} s`
      : `当前预设 ${state.preset + 1} · ${state.presets[state.preset]}秒`;
  }

  function displayPages() {
    return lang === 'en' ? pagesEn : pagesZh;
  }

  function otaTitle(id) {
    return lang === 'en' ? (id === 'otaStart' ? '' : {
      otaStart: 'Start again after demo ends',
      otaFail: 'Available during progress',
      otaLost: 'While waiting for reconnect',
      otaReady: 'While waiting for reconnect',
      otaRetry: 'After failure',
      otaReturn: 'After failure'
    }[id]) : ({
      otaStart: '结束当前演示后可重新开始',
      otaFail: '升级过程中可模拟失败',
      otaLost: '等待重连时可模拟超时',
      otaReady: '等待重连时可模拟成功',
      otaRetry: '升级失败后可重试',
      otaReturn: '升级失败后可结束演示'
    }[id] || '');
  }

  function applyShell(root = document) {
    root.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      const val = t(key);
      if (el.dataset.i18nAttr) el.setAttribute(el.dataset.i18nAttr, val);
      else el.textContent = val;
    });
    root.querySelectorAll('option[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    const pill = root.getElementById('lang-pill');
    if (pill) {
      pill.textContent = lang === 'en' ? 'EN' : '中文';
      pill.title = lang === 'en' ? t('lang.switchZh') : t('lang.switchEn');
    }
    document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN';
    document.title = lang === 'en' ? 'MD1T · UI Demo V2.0' : 'MD1T · UI演示DEMO V2.0';
  }

  function setLang(next) {
    lang = next === 'en' ? 'en' : 'zh';
    localStorage.setItem(STORAGE_LANG, lang);
    applyShell();
    window.dispatchEvent(new CustomEvent('demo-i18n-change'));
  }

  function getLang() {
    return lang;
  }

  return { t, trMsg, formatWhere, messageHint, activePreset, displayPages, otaTitle, applyShell, setLang, getLang };
})();
