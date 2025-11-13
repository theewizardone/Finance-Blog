// Theme helper: toggles dark/light theme and persists preference in localStorage.
(function () {
  const storageKey = 'theme';
  const doc = document.documentElement;
  const getStored = () => localStorage.getItem(storageKey);
  const setStored = (v) => localStorage.setItem(storageKey, v);

  // Initialize theme from stored value or system preference.
  function initTheme() {
    const stored = getStored();
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = stored === 'dark' || (!stored && prefersDark);
    applyTheme(isDark ? 'dark' : 'light');
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      doc.setAttribute('data-theme', 'dark');
      doc.classList.add('dark');
    } else {
      doc.removeAttribute('data-theme');
      doc.classList.remove('dark');
    }
  }

  function toggleTheme() {
    const current = doc.classList.contains('dark') ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    setStored(next);
    updateButtons(next);
  }

  function createFloatingToggle() {
    // If a toggle with id themeToggle exists, reuse it; otherwise create one.
    let btn = document.getElementById('themeToggle');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'themeToggle';
      btn.className = 'theme-toggle theme-toggle-floating';
      document.body.appendChild(btn);
    }
    btn.addEventListener('click', toggleTheme);
  }

  function updateButtons(theme) {
    const btns = document.querySelectorAll('#themeToggle');
    btns.forEach(b => {
      if (theme === 'dark') b.textContent = '☀️ Light Mode';
      else b.textContent = '🌙 Dark Mode';
    });
  }

  // Expose for manual toggling if needed
  window.__theme = { toggle: toggleTheme, set: applyTheme };

  // Smooth scroll polyfill for browsers that don't support CSS `scroll-behavior`.
  // Adds a delegated click handler that animates scrolling to anchors.
  function smoothScrollPolyfill() {
    if ('scrollBehavior' in document.documentElement.style) return; // native support available

    function smoothScrollToElement(el) {
      const start = window.scrollY || window.pageYOffset;
      const rect = el.getBoundingClientRect();
      const target = rect.top + start;
      const duration = 468;
      let startTime = null;

      function step(time) {
        if (!startTime) startTime = time;
        const t = Math.min(1, (time - startTime) / duration);
        // easeInOutCubic
        const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        window.scrollTo(0, Math.round(start + (target - start) * eased));
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    document.addEventListener('click', function (ev) {
      const a = ev.target.closest && ev.target.closest('a[href]');
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href) return;

      // fragment only
      if (href.charAt(0) === '#') {
        const id = href.slice(1);
        const dest = document.getElementById(id);
        if (dest) {
          ev.preventDefault();
          smoothScrollToElement(dest);
          // update URL without jumping
          if (history && history.pushState) history.pushState(null, '', '#' + id);
          else location.hash = '#' + id;
        }
      } else {
        // handle same-page links like page.html#section
        try {
          const url = new URL(href, location.href);
          if (url.pathname === location.pathname && url.hash) {
            const id = url.hash.slice(1);
            const dest = document.getElementById(id);
            if (dest) {
              ev.preventDefault();
              smoothScrollToElement(dest);
              if (history && history.pushState) history.pushState(null, '', url.href);
              else location.href = url.href;
            }
          }
        } catch (err) { /* ignore invalid URLs */ }
      }
    }, false);
  }

  // Init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initTheme();
      createFloatingToggle();
      updateButtons(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
      smoothScrollPolyfill();
    });
  } else {
    initTheme();
    createFloatingToggle();
    updateButtons(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    smoothScrollPolyfill();
  }

})();
