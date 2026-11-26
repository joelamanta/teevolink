'use strict';
(() => {
  const q = new URLSearchParams(location.search);
  const chrome = q.get('chrome') === 'teevolink' || q.get('embed') === 'teevolink';
  const embed = q.get('embed') === '1' || q.get('embed') === 'teevolink';
  if (!chrome && !embed) return;

  document.documentElement.classList.add('teevolink-chrome');
  if (embed) document.documentElement.classList.add('embed');

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/xd10/teevolink-chrome.css?v=5';
  document.head.appendChild(link);

  function structureAside() {
    const aside = document.getElementById('pages');
    if (!aside || aside.dataset.tlStructured === '1') return;

    const items = [...aside.children];
    const scroll = document.createElement('div');
    scroll.className = 'tl-scroll';

    let section = null;
    let body = null;
    let resetBtn = null;

    for (const el of items) {
      if (el.id === 'reset') {
        resetBtn = el;
        continue;
      }
      if (el.tagName === 'H2') {
        section = document.createElement('section');
        section.className = 'tl-section';
        const head = document.createElement('div');
        head.className = 'tl-section-head';
        el.classList.add('tl-section-title');
        head.appendChild(el);
        section.appendChild(head);
        body = document.createElement('div');
        body.className = 'tl-section-body';
        section.appendChild(body);
        scroll.appendChild(section);
      } else if (body) {
        body.appendChild(el);
      } else {
        scroll.appendChild(el);
      }
    }

    aside.replaceChildren(scroll);
    if (resetBtn) {
      const foot = document.createElement('div');
      foot.className = 'tl-aside-foot';
      foot.appendChild(resetBtn);
      aside.appendChild(foot);
    }

    aside.dataset.tlStructured = '1';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', structureAside);
  } else {
    structureAside();
  }
})();