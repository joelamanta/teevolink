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
  link.href = '/xd10/teevolink-chrome.css';
  document.head.appendChild(link);
})();