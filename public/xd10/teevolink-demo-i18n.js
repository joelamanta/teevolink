'use strict';
/** TeevoLink ↔ XD10 Final DEMO — shell strings + live status (device SVG unchanged). */
window.TeevoDemoI18n = (() => {
  const LABELS = {
    en: {
      clock: 'Clock', mouse: 'Mouse info', pc1: 'PC info 1', pc2: 'PC info 2', album: 'Album',
      message: 'Custom text', menu: 'Navigation', dpi: 'DPI / Poll rate', sensor: 'Sensor',
      clockset: 'Clock style', brightness: 'Brightness', albumset: 'Album slots',
      timerset: 'Timer setup', timer: 'Timer', low: 'Low battery',
    },
    zh: {
      clock: '时钟', mouse: '鼠标信息', pc1: '电脑信息 1', pc2: '电脑信息 2', album: '相册',
      message: '自定义文字', menu: '导航菜单', dpi: 'DPI / 回报率', sensor: '传感器设置',
      clockset: '时钟款式', brightness: '屏幕亮度', albumset: '相册选择',
      timerset: '计时设置', timer: '计时器', low: '低电提醒',
    },
  };

  const S = {
    en: {
      fn: 'FN · Short press / Hold 2s',
      prev: 'M4 Previous',
      next: 'M5 Next',
      quickFnEnter: 'Enter FN',
      quickFnExit: 'Exit FN',
      modeDisplay: 'Display mode',
      modeFn: 'FN setup',
      timerToolsHint: 'Timer test controls (not on device screen)',
      timerPause: 'Pause (sim)',
      timerResume: 'Resume (sim)',
      timerStop: 'Stop (sim)',
      hintPointer:
        'Click the screen to simulate FN cursor. Arrow keys ← → flip pages in FN only; F short-press; Esc exit. Device artboard 570 × 488.',
      feedbackStart: 'Tap “Enter FN”, then use the on-screen menu and buttons.',
      secDisplay: 'Main display pages',
      secFn: 'FN setup',
      secTimer: 'Timer & alerts',
      secRx: 'Receiver side button',
      pageSwitchesLegend: 'Display pages · Keep at least 2 on',
      p1: 'P1 Clock', p2: 'P2 Mouse', p3: 'P3 PC info 1/2', p4: 'P4 Album', p5: 'P5 Custom text',
      xySplit: 'Independent X / Y',
      showHotspots: 'Show click targets',
      timerPage: 'Timer display',
      nearEnd: 'Quick test · 3s before end',
      lowPreview: 'Low battery preview',
      tlScreen: 'TeevoLink screen (sim)',
      screenPower: 'Screen power',
      tlTimer: 'TeevoLink timer (sim)',
      driverStart: 'Start with current preset',
      driverPause: 'Pause / resume',
      driverStop: 'Stop this round',
      battery: 'Battery',
      lowTest: 'Low-battery test',
      chargingSim: 'Simulate charging (dismiss low alert)',
      rxShort: 'Short press · Open TeevoLink',
      rxDouble: 'Double press · Next page',
      rxLong: 'Long press · Enter FN',
      connTest: 'Connection & fault test',
      connStatus: 'Connection',
      connConnected: '2.4G connected',
      connSleep: '2.4G mouse sleeping',
      connDisc: 'Disconnected',
      connPair: 'Pairing',
      connBt: 'Bluetooth',
      connWired: 'Wired',
      rxRepower: 'Receiver power cycle',
      pcOffline: 'Cannot read PC info',
      pcMissing: 'PC info page missing cell',
      pcNone: 'None',
      pcCell1: 'Cell 1', pcCell2: 'Cell 2', pcCell3: 'Cell 3', pcCell4: 'Cell 4',
      fnMap: 'FN short-press map (2.4G test)',
      fnDefault: 'Receiver default',
      fnCustom: 'Simulate custom action',
      media: 'Text & album',
      customText: 'Custom text',
      textMode: 'Display mode',
      static: 'Static',
      scroll: 'Scroll',
      textSize: 'Size',
      sizeSm: 'Small', sizeMd: 'Standard', sizeLg: 'Large',
      textColor: 'Text color',
      textPreview: 'Text preview',
      saveText: 'Save text & style',
      albumImages: 'Album images',
      uploadSlot: 'Target slot',
      albumImport: 'Import album',
      clearAlbum: 'Clear slot image',
      reset: 'Reset demo',
      title: 'XD10 UI Final DEMO',
      prevTitleFn: 'FN page prev',
      prevTitleOff: 'Screen paging only in FN mode',
    },
    zh: {
      fn: 'FN · 短按 / 长按 2 秒',
      prev: 'M4 上一页',
      next: 'M5 下一页',
      quickFnEnter: '进入 FN',
      quickFnExit: '退出 FN',
      modeDisplay: '展示模式',
      modeFn: 'FN 设置模式',
      timerToolsHint: '计时测试控制（不属于设备屏幕）',
      timerPause: '模拟暂停',
      timerResume: '模拟继续',
      timerStop: '模拟停止',
      hintPointer: '鼠标点击屏幕模拟 FN 光标操作；键盘 ← → 仅在 FN 内翻页，F 短按，Esc 退出。设备画面保留原稿 570 × 488 比例。',
      feedbackStart: '点击“进入 FN”，再点击屏幕上的菜单和按钮。',
      secDisplay: '主屏展示',
      secFn: 'FN 设置',
      secTimer: '计时与提醒',
      secRx: '接收器侧键',
      pageSwitchesLegend: '展示页开关 · 至少保留 2 页',
      p1: 'P1 时钟', p2: 'P2 鼠标信息', p3: 'P3 电脑信息 1／2', p4: 'P4 相册', p5: 'P5 自定义文字',
      xySplit: 'X / Y 独立调节',
      showHotspots: '显示可点击区域',
      timerPage: '计时展示',
      nearEnd: '快测 到点前3秒',
      lowPreview: '预览低电提醒',
      tlScreen: 'TeevoLink 屏幕控制（模拟）',
      screenPower: '屏幕开关',
      tlTimer: 'TeevoLink 计时控制（模拟）',
      driverStart: '按当前预设开始',
      driverPause: '暂停／继续',
      driverStop: '停止本轮',
      battery: '电量',
      lowTest: '低电提醒测试',
      chargingSim: '模拟开始充电（收起低电提醒）',
      rxShort: '短按 · 打开 TeevoLink',
      rxDouble: '双击 · 翻页',
      rxLong: '长按 · 进入 FN',
      connTest: '连接与异常测试',
      connStatus: '连接状态',
      connConnected: '2.4G 已连接',
      connSleep: '2.4G 鼠标休眠中',
      connDisc: '断开连接',
      connPair: '配对中',
      connBt: '蓝牙',
      connWired: '有线模式',
      rxRepower: 'Receiver power cycle',
      pcOffline: '读取不到电脑信息',
      pcMissing: '当前电脑信息页缺值',
      pcNone: '无',
      pcCell1: '第 1 格', pcCell2: '第 2 格', pcCell3: '第 3 格', pcCell4: '第 4 格',
      fnMap: 'FN 短按映射（2.4G 测试）',
      fnDefault: '接收器默认',
      fnCustom: '模拟已有自定义动作',
      media: '文字与相册',
      customText: '自定义文字',
      textMode: '显示方式',
      static: '静态',
      scroll: '滚动',
      textSize: '字号',
      sizeSm: '小', sizeMd: '标准', sizeLg: '大',
      textColor: '文字颜色',
      textPreview: '文字预览',
      saveText: '保存文字与样式',
      albumImages: '相册图片',
      uploadSlot: '写入槽位',
      albumImport: '相册导入',
      clearAlbum: '删除指定槽位图片',
      reset: '恢复演示',
      rxRepower: '接收器重新通电',
      title: 'XD10 UI Final DEMO',
      prevTitleFn: 'FN 模式翻页',
      prevTitleOff: '仅在 FN 模式控制屏幕翻页',
    },
  };

  const STATUS_EN = {
    '当前连接状态无法进入 FN，请切换到 2.4G 已连接。':
      'Cannot enter FN in this connection state. Switch to 2.4G connected.',
    '已进入 FN，点击屏幕菜单选择设置。': 'FN active — use the on-screen menu to pick a setting.',
    '计时已暂停。': 'Timer paused.',
    '计时已继续。': 'Timer resumed.',
    '计时开始。FN 短按暂停／继续，停止按钮结束本轮。':
      'Timer started. FN short-press pauses/resumes; Stop ends this round.',
    '已停止；5 秒后返回展示页，FN 短按可重启。':
      'Stopped; returning to display pages in 5s. FN short-press to restart.',
    '已恢复初始演示状态。': 'Demo reset to initial state.',
    '请先在计时设置中按 START。': 'Press START in timer setup first.',
    '请使用已连接的带屏接收器进入设置。': 'Use a connected screen receiver to open settings.',
    '本轮已停止，返回计时设置。未显示结束弹窗。': 'Round stopped — back to timer setup (no end dialog).',
    '已触发模拟的自定义短按动作': 'Simulated custom short-press action.',
    'TeevoLink 打开请求（模拟）': 'TeevoLink open request (simulated).',
    '接收器已重新通电，本轮计时已清除。': 'Receiver powered on; timer round cleared.',
    'GIF 已均匀抽取为 30 帧，保留原播放总时长并导入。':
      'GIF resampled to 30 frames; duration preserved and imported.',
    '无法处理图片，请重试。原槽位内容已保留。':
      'Could not process image. Slot unchanged.',
    '当前槽位已清空。': 'Current slot cleared.',
  };

  function resolveLang() {
    const q = new URLSearchParams(location.search);
    const fromQ = q.get('lang');
    if (fromQ === 'en' || fromQ === 'zh') return fromQ;
    const stored = localStorage.getItem('teevolink-lang');
    return stored === 'zh' ? 'zh' : 'en';
  }

  let lang = resolveLang();
  const $ = (s) => document.querySelector(s);

  function t(k) {
    return (S[lang] && S[lang][k]) || (S.zh[k] ?? k);
  }
  function label(key) {
    return (LABELS[lang] && LABELS[lang][key]) || (LABELS.zh[key] ?? key);
  }

  function setText(el, key) {
    if (el) el.textContent = t(key);
  }

  function setLabelText(labelEl, prefixKey, suffixText) {
    if (!labelEl) return;
    const keep = labelEl.querySelector('input, select, textarea, output');
    if (keep) {
      labelEl.childNodes.forEach((n) => {
        if (n.nodeType === 3) n.remove();
      });
      labelEl.insertBefore(document.createTextNode(t(prefixKey) + (suffixText || '')), keep);
    } else {
      labelEl.textContent = t(prefixKey);
    }
  }

  function applyStatic() {
    document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN';
    if (!document.documentElement.classList.contains('embed')) {
      document.title = t('title');
      const h1 = document.querySelector('header h1');
      if (h1) h1.textContent = t('title');
    }

    setText($('#fn'), 'fn');
    setText($('#prev'), 'prev');
    setText($('#next'), 'next');
    const hint = document.querySelector('section.preview .hint');
    if (hint) hint.textContent = t('hintPointer');
    const toolsHint = document.querySelector('#timerTools .hint');
    if (toolsHint) toolsHint.textContent = t('timerToolsHint');
    setText($('#timerStop'), 'timerStop');

    const h2s = [...document.querySelectorAll('aside#pages h2, aside#pages .tl-section-title')];
    const h2keys = ['secDisplay', 'secFn', 'secTimer', 'secRx'];
    h2s.forEach((el, i) => {
      if (h2keys[i]) el.textContent = t(h2keys[i]);
    });

    const leg = document.querySelector('#pageSwitches legend');
    if (leg) leg.textContent = t('pageSwitchesLegend');

    const pLabels = document.querySelectorAll('#pageSwitches label');
    const pKeys = ['p1', 'p2', 'p3', 'p4', 'p5'];
    pLabels.forEach((el, i) => {
      const inp = el.querySelector('input');
      if (inp) {
        el.textContent = '';
        el.appendChild(inp);
        el.appendChild(document.createTextNode(t(pKeys[i])));
      }
    });

    setText($('#timerSettings'), 'timerset');
    setLabelText($('label:has(#xy)'), 'xySplit');
    setLabelText($('label:has(#showHotspots)'), 'showHotspots');
    setText($('#timerPage'), 'timerPage');
    setText($('#nearEnd'), 'nearEnd');
    setText($('#low'), 'lowPreview');

    document.querySelectorAll('aside details summary').forEach((sum) => {
      const raw = sum.textContent.trim();
      const map = {
        'TeevoLink 屏幕控制（模拟）': 'tlScreen',
        'TeevoLink 计时控制（模拟）': 'tlTimer',
        '低电提醒测试': 'lowTest',
        '连接与异常测试': 'connTest',
        '文字与相册': 'media',
      };
      if (map[raw]) sum.textContent = t(map[raw]);
      else if (lang === 'en' && raw.includes('屏幕控制')) sum.textContent = t('tlScreen');
    });

    setLabelText($('label:has(#screenPower)'), 'screenPower');
    setText($('#driverStart'), 'driverStart');
    setText($('#driverPause'), 'driverPause');
    setText($('#driverStop'), 'driverStop');

    document.querySelectorAll('aside label').forEach((lab) => {
      if (lab.querySelector('#battery')) {
        setLabelText(lab, 'battery');
      }
      if (lab.querySelector('#charging')) setLabelText(lab, 'chargingSim');
      if (lab.querySelector('#pcOffline')) setLabelText(lab, 'pcOffline');
    });

    setText($('#rxShort'), 'rxShort');
    setText($('#rxDouble'), 'rxDouble');
    setText($('#rxLong'), 'rxLong');
    setText($('#power'), 'rxRepower');
    setText($('#reset'), 'reset');
    setText($('#saveText'), 'saveText');
    setText($('#clearAlbum'), 'clearAlbum');

    document.querySelectorAll('aside details label').forEach((lab) => {
      const txt = lab.textContent.trim();
      if (txt.startsWith('连接状态')) setLabelText(lab, 'connStatus');
      else if (txt.startsWith('当前电脑信息页')) setLabelText(lab, 'pcMissing');
      else if (txt.startsWith('FN 短按映射')) setLabelText(lab, 'fnMap');
    });

    const pcMissing = $('#pcMissing');
    if (pcMissing) {
      pcMissing.options[0].textContent = t('pcNone');
      pcMissing.options[1].textContent = t('pcCell1');
      pcMissing.options[2].textContent = t('pcCell2');
      pcMissing.options[3].textContent = t('pcCell3');
      pcMissing.options[4].textContent = t('pcCell4');
    }
    const mapping = $('#mapping');
    if (mapping) {
      mapping.options[0].textContent = t('fnDefault');
      mapping.options[1].textContent = t('fnCustom');
    }

    const conn = $('#connection');
    if (conn) {
      [...conn.options].forEach((opt) => {
        const m = {
          connected: 'connConnected', sleeping: 'connSleep', disconnected: 'connDisc',
          pairing: 'connPair', bt: 'connBt', wired: 'connWired',
        };
        if (m[opt.value]) opt.textContent = t(m[opt.value]);
      });
    }

    const editor = document.querySelector('details.mediaEditor');
    if (editor) {
      const h3 = editor.querySelector('h3');
      if (h3) h3.textContent = t('albumImages');
      setLabelText(editor.querySelector('label:has(#message)'), 'customText');
      setLabelText(editor.querySelector('label:has(#textMode)'), 'textMode');
      setLabelText(editor.querySelector('label:has(#messageSize)'), 'textSize');
      setLabelText(editor.querySelector('label:has(#textColor)'), 'textColor');
      setLabelText(editor.querySelector('label:has(#uploadSlot)'), 'uploadSlot');
      setLabelText(editor.querySelector('label:has(#albumFile)'), 'albumImport');
      const cap = editor.querySelector('.previewCaption');
      if (cap) cap.textContent = t('textPreview');
      const mode = $('#textMode');
      if (mode) {
        [...mode.options].forEach((o) => {
          if (o.value === 'static') o.textContent = t('static');
          if (o.value === 'scroll') o.textContent = t('scroll');
        });
      }
      const sz = $('#messageSize');
      if (sz) {
        sz.options[0].textContent = t('sizeSm');
        sz.options[1].textContent = t('sizeMd');
        sz.options[2].textContent = t('sizeLg');
      }
    }
  }

  function translateStatus(text) {
    if (lang !== 'en' || !text) return text;
    if (STATUS_EN[text]) return STATUS_EN[text];
    let m = text.match(/^已将图片导入槽位 (\d+)（仅保存在本次演示）。$/);
    if (m) return `Image imported to slot ${m[1]} (this session only).`;
    return text;
  }

  function hookFeedback() {
    const fb = $('#feedback');
    if (!fb || fb.dataset.tlI18n) return;
    fb.dataset.tlI18n = '1';
    const obs = new MutationObserver(() => {
      const cur = fb.textContent || '';
      const tr = translateStatus(cur);
      if (tr !== cur) fb.textContent = tr;
    });
    obs.observe(fb, { characterData: true, childList: true, subtree: true });
  }

  function patchAfterRender() {
    if (!window.demo?.state) return;
    const st = window.demo.state;
    $('#pageName').textContent = label(st.page);
    $('#modeLabel').textContent = st.fn ? t('modeFn') : t('modeDisplay');
    $('#quickFn').textContent = st.fn ? t('quickFnExit') : t('quickFnEnter');
    $('#prev').title = st.fn ? t('prevTitleFn') : t('prevTitleOff');
    $('#next').title = $('#prev').title;
    const tp = $('#timerPause');
    if (tp) tp.textContent = st.timer?.status === 'paused' ? t('timerResume') : t('timerPause');
    document.querySelectorAll('#mainPages button[data-page], #fnPages button[data-page]').forEach((b) => {
      const key = b.dataset.page;
      if (key) b.textContent = label(key);
    });
    const fb = $('#feedback');
    if (fb && fb.textContent === S.zh.feedbackStart) fb.textContent = t('feedbackStart');
  }

  function hookRender() {
    if (!window.demo?.render) return false;
    const orig = window.demo.render;
    window.demo.render = function tdRender() {
      orig.apply(this, arguments);
      applyStatic();
      patchAfterRender();
    };
    return true;
  }

  function boot() {
    hookFeedback();
    if (!hookRender()) {
      setTimeout(boot, 40);
      return;
    }
    applyStatic();
    window.demo.render();
  }

  function setLang(next) {
    if (next !== 'en' && next !== 'zh') return;
    lang = next;
    applyStatic();
    if (window.demo?.render) window.demo.render();
  }

  window.addEventListener('message', (e) => {
    if (e.data?.type === 'teevolink-lang') setLang(e.data.lang);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(boot, 0));
  } else {
    setTimeout(boot, 0);
  }

  return { getLang: () => lang, setLang, t, label };
})();