'use strict';
(() => {
  DemoI18n.applyShell();
  document.getElementById('lang-pill')?.addEventListener('click', () => {
    DemoI18n.setLang(DemoI18n.getLang() === 'en' ? 'zh' : 'en');
  });
  window.addEventListener('demo-i18n-change', () => {
    if (typeof syncPanel === 'function') syncPanel();
    if (typeof window.__otaRefreshButtons === 'function') window.__otaRefreshButtons();
    const st = document.getElementById('status');
    if (st?.dataset.zh) {
      st.textContent = DemoI18n.getLang() === 'en' ? DemoI18n.trMsg(st.dataset.zh) : st.dataset.zh;
    }
  });
})();
