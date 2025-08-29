(function () {
    // --- Tiny DOM helpers (no dependencies) ---
    const qs = (sel, root = document) => root.querySelector(sel);
    const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));
    const on = (el, type, handler, opts) => el && el.addEventListener(type, handler, opts);
    const attr = (el, name, value) => (value === undefined ? el.getAttribute(name) : el.setAttribute(name, value));

    // --- Service Worker (kept minimal) ---
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker
                .register('sw.js')
                .then(() => {
                    const btnUpdate = qs('#btn-update-app');
                    if (!btnUpdate) return;
                    on(btnUpdate, 'click', async () => {
                        if (!confirm('This will clear ALL cached data (including preferences) and force a fresh update. Continue?')) return;
                        try {
                            localStorage.clear();
                            const cacheNames = await caches.keys();
                            await Promise.all(cacheNames.map((name) => caches.delete(name)));
                            const registration = await navigator.serviceWorker.getRegistration();
                            if (registration) await registration.unregister();
                            window.location.reload(true);
                        } catch (error) {
                            console.error('Update failed:', error);
                            alert('Update failed. Please check console for details.');
                        }
                    });
                })
                .catch((error) => console.warn('Service Worker registration failed:', error));
        });
    }

    // --- Theme ---
    const THEME_KEY = 'theme';
    const setTheme = (next) => {
        attr(document.documentElement, 'data-theme', next);
        try { localStorage.setItem(THEME_KEY, next); } catch { /* ignore */ }
    };

    // --- Popups ---
    function bindPopup(triggerBtn, popupEl, closeBtn) {
        if (!popupEl) return;
        const open = () => { popupEl.classList.add('show'); attr(popupEl, 'aria-hidden', 'false'); };
        const close = () => { popupEl.classList.remove('show'); attr(popupEl, 'aria-hidden', 'true'); };
        on(triggerBtn, 'click', open);
        on(closeBtn, 'click', close);
        on(popupEl, 'click', (e) => { if (e.target === popupEl) close(); });
        return { open, close };
    }

    // --- Tabs ---
    function initTabs({ wrapper, slider, menuBtn }) {
        if (!wrapper || !slider) return;
        const tabs = qsa('.btn-tab', wrapper);
        const contents = qsa('[data-content]');

        const current = () => tabs.find((t) => t.classList.contains('active')) || tabs[0];

        function activate(tab) {
            tabs.forEach((t) => t.classList.toggle('active', t === tab));
            const name = attr(tab, 'data-tab');
            contents.forEach((c) => (c.hidden = attr(c, 'data-content') !== name));
            const r = tab.getBoundingClientRect();
            const p = wrapper.getBoundingClientRect();
            slider.style.width = r.width + 'px';
            slider.style.transform = `translateX(${r.left - p.left}px)`;
        }

        tabs.forEach((t) => on(t, 'click', () => activate(t)));
        // First paint and after layout/fonts settle
        activate(current());
        on(window, 'resize', () => activate(current()));
        requestAnimationFrame(() => activate(current()));
        on(menuBtn, 'click', () => wrapper.classList.toggle('show'));

        return { activate, current };
    }

    function initUI() {
        // Tabs
        initTabs({
            wrapper: qs('#wrapper-tabs'),
            slider: qs('#slider-bg'),
            menuBtn: qs('#btn-show-menu'),
        });

        // Popups
        bindPopup(qs('#btn-show-settings'), qs('#popup-settings'), qs('#btn-popup-close-settings'));
        bindPopup(qs('#btn-show-info'), qs('#popup-info'), qs('#btn-popup-close-info'));

        // Theme toggle (initial theme is applied inline in index.html to prevent flash)
        on(qs('#btn-toggle-theme'), 'click', () => {
            const current = attr(document.documentElement, 'data-theme');
            setTheme(current === 'dark' ? 'light' : 'dark');
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initUI);
    } else {
        initUI();
    }
})();
