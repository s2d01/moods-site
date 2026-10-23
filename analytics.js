(() => {
  'use strict';
  const id = 'G-L6DPMYNZL8';
  const key = 'moods-analytics-consent-v1';
  const lifetime = 180 * 24 * 60 * 60 * 1000;
  const panel = document.getElementById('analytics-consent');
  let enabled = false;
  let loaded = false;
  let choice = null;
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    if (saved && ['granted', 'denied'].includes(saved.value) &&
        saved.at <= Date.now() && Date.now() - saved.at < lifetime) choice = saved.value;
  } catch (_) { /* Unavailable storage leaves the visitor opted out. */ }

  function clearCookies() {
    document.cookie.split(';').forEach(part => {
      const name = part.trim().split('=')[0];
      if (name !== '_ga' && !name.startsWith('_ga_')) return;
      ['', '; domain=moods.s2d01.org', '; domain=.moods.s2d01.org'].forEach(domain => {
        document.cookie = name + '=; Max-Age=0; path=/' + domain + '; SameSite=Lax; Secure';
      });
    });
  }

  function enable() {
    if (loaded || location.hostname !== 'moods.s2d01.org') return;
    loaded = true;
    enabled = true;
    window['ga-disable-' + id] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {
      analytics_storage: 'denied', ad_storage: 'denied',
      ad_user_data: 'denied', ad_personalization: 'denied'
    });
    window.gtag('consent', 'update', { analytics_storage: 'granted' });
    window.gtag('js', new Date());
    let referrer = '';
    try { referrer = new URL(document.referrer).origin; } catch (_) {}
    window.gtag('config', id, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_domain: 'moods.s2d01.org',
      cookie_expires: 15552000,
      cookie_update: false,
      page_location: location.origin + location.pathname,
      page_referrer: referrer
    });
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
    document.head.appendChild(script);
  }

  function save(value) {
    choice = value;
    try { localStorage.setItem(key, JSON.stringify({ value, at: Date.now() })); } catch (_) {}
    panel.hidden = true;
    if (value === 'granted') enable();
    else {
      enabled = false;
      window['ga-disable-' + id] = true;
      clearCookies();
      if (loaded) location.reload();
    }
    document.getElementById('analytics-settings').focus();
  }

  document.getElementById('analytics-accept').addEventListener('click', () => save('granted'));
  document.getElementById('analytics-reject').addEventListener('click', () => save('denied'));
  document.getElementById('analytics-settings').addEventListener('click', () => {
    panel.hidden = false;
    document.getElementById('analytics-reject').focus();
  });
  document.addEventListener('click', event => {
    if (!enabled || typeof window.gtag !== 'function') return;
    const link = event.target.closest('a');
    if (!link) return;
    const href = link.getAttribute('href') || '';
    let name;
    if (href === '#early-access') name = 'early_access_click';
    else if (href.startsWith('https://discord.gg/')) name = 'discord_click';
    else if (href.startsWith('https://www.youtube.com/')) name = 'youtube_click';
    if (name) window.gtag('event', name);
  });
  if (choice === 'granted') enable();
  else { window['ga-disable-' + id] = true; clearCookies(); }
  panel.hidden = choice !== null;
})();
