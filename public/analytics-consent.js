(() => {
  const panel = document.querySelector('[data-analytics-panel]');
  const template = document.querySelector('[data-analytics-scripts]');
  if (!panel || !template) return;
  const key = 'analytics-consent-v1';
  const lifetime = 180 * 24 * 60 * 60 * 1000;
  let loaded = false;
  let opener;

  function preference() {
    try {
      const saved = JSON.parse(localStorage.getItem(key) || 'null');
      if (saved && ['granted', 'denied'].includes(saved.choice)
          && Number.isFinite(saved.expires) && saved.expires > Date.now()) return saved.choice;
    } catch { /* Unavailable storage means no remembered permission. */ }
    return null;
  }

  function clearAnalyticsCookies() {
    const host = location.hostname;
    const domains = new Set([host, host.replace(/^www\./, '')]);
    for (const item of document.cookie.split(';')) {
      const name = item.trim().split('=')[0];
      if (name !== '_ga' && !name.startsWith('_ga_') && name !== '_gid' && name !== '_gat') continue;
      const expired = `${name}=; Max-Age=0; Path=/; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
      document.cookie = expired;
      for (const domain of domains) document.cookie = `${expired}; Domain=${domain}`;
    }
  }

  function startAnalytics() {
    if (loaded) return;
    loaded = true;
    for (const original of template.content.querySelectorAll('script')) {
      const script = document.createElement('script');
      for (const { name, value } of original.attributes) script.setAttribute(name, value);
      if (original.nonce) script.nonce = original.nonce;
      script.textContent = original.textContent;
      document.head.appendChild(script);
    }
    window.dispatchEvent(new CustomEvent('ptupdate'));
  }

  function choose(choice) {
    try { localStorage.setItem(key, JSON.stringify({ choice, expires: Date.now() + lifetime })); } catch { /* The choice still applies to this page. */ }
    panel.hidden = true;
    if (choice === 'granted') startAnalytics();
    else {
      clearAnalyticsCookies();
      // A reload also stops analytics running in a worker or another script.
      if (loaded) { location.reload(); return; }
    }
    opener?.focus();
  }

  for (const button of document.querySelectorAll('[data-analytics-preferences]')) {
    button.hidden = false;
    button.addEventListener('click', () => {
      opener = button;
      panel.hidden = false;
      panel.querySelector('button')?.focus();
    });
  }
  for (const button of panel.querySelectorAll('[data-analytics-choice]')) {
    button.addEventListener('click', () => choose(button.dataset.analyticsChoice));
  }
  window.addEventListener('storage', event => {
    if (event.key === key || event.key === null) location.reload();
  });
  const choice = preference();
  if (choice === 'granted') startAnalytics();
  else clearAnalyticsCookies();
  panel.hidden = choice !== null;
})();
