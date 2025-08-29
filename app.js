(function () {
    const qs = (sel, root = document) => root.querySelector(sel);
    const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));
    const on = (el, type, handler, opts) => el && el.addEventListener(type, handler, opts);
    const attr = (el, name, value) => (value === undefined ? el.getAttribute(name) : el.setAttribute(name, value));
    const setVar = (el, name, value) => el.style.setProperty(name, value);

    // Service worker
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

    // Theme
    const THEME_KEY = 'theme';
    const setTheme = (next) => {
        attr(document.documentElement, 'data-theme', next);
        try { localStorage.setItem(THEME_KEY, next); } catch { /* ignore */ }
    };

    // Popups
    function bindPopup(triggerBtn, popupEl, closeBtn) {
        if (!popupEl) return;
        const open = () => { popupEl.classList.add('show'); attr(popupEl, 'aria-hidden', 'false'); };
        const close = () => { popupEl.classList.remove('show'); attr(popupEl, 'aria-hidden', 'true'); };
        on(triggerBtn, 'click', open);
        on(closeBtn, 'click', close);
        on(popupEl, 'click', (e) => { if (e.target === popupEl) close(); });
    }

    // Tabs
    function initTabs({ wrapper, slider, menuBtn }) {
        if (!wrapper || !slider) return;
        const tabs = qsa('.btn-tab', wrapper);
        const contents = qsa('[data-content]');
        const header = wrapper.closest('.header-tab-menu');

        const current = () => qs('.btn-tab.active', wrapper) || tabs[0];
        const activateByName = (name) => {
            const t = name && tabs.find((t) => attr(t, 'data-tab') === name);
            return t ? (activate(t), true) : false;
        };

        function activate(tab) {
            tabs.forEach((t) => t.classList.toggle('active', t === tab));
            const name = attr(tab, 'data-tab');
            contents.forEach((c) => (c.hidden = attr(c, 'data-content') !== name));
            if (!wrapper.classList.contains('force-dropdown')) {
                let w = tab.offsetWidth;
                const cs = getComputedStyle(wrapper);
                const padL = parseFloat(cs.paddingLeft) || 0;
                const padR = parseFloat(cs.paddingRight) || 0;
                let x = tab.offsetLeft - padL;
                const inner = wrapper.clientWidth - padL - padR;
                if (x + w > inner) w = Math.max(0, inner - x);
                setVar(wrapper, '--slider-w', w + 'px');
                setVar(wrapper, '--slider-x', x + 'px');
            }
        }

        tabs.forEach((t) => on(t, 'click', () => {
            const target = '#' + attr(t, 'data-tab');
            location.hash !== target ? (location.hash = target) : activate(t);
        }));
        activateByName(location.hash.slice(1)) || activate(current());
        on(window, 'resize', () => {
            applyLayoutMode();
            if (!wrapper.classList.contains('force-dropdown')) activate(current());
        });
        requestAnimationFrame(() => activate(current()));
        on(menuBtn, 'click', () => wrapper.classList.toggle('show'));

        on(window, 'hashchange', () => { if (!activateByName(location.hash.slice(1))) activate(current()); });

        function isOverflowing() { return wrapper.scrollWidth > wrapper.clientWidth; }
        function applyLayoutMode() {
            const dropdown = isOverflowing();
            if (dropdown) {
                wrapper.classList.add('force-dropdown');
                header && header.classList.add('dropdown-mode');
            } else {
                wrapper.classList.remove('force-dropdown');
                header && header.classList.remove('dropdown-mode');
            }
        }

        // Observe size changes for robustness
        const ro = new ResizeObserver(() => {
            applyLayoutMode();
            if (!wrapper.classList.contains('force-dropdown')) activate(current());
        });
        ro.observe(wrapper);
        // Initial mode compute
        applyLayoutMode();

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
