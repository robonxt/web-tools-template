(function () {
    // Utility functions
    const qs = (sel, root = document) => root.querySelector(sel);
    const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));
    const on = (el, type, handler, opts) => el && el.addEventListener(type, handler, opts);
    const attr = (el, name, value) => (value === undefined ? el.getAttribute(name) : el.setAttribute(name, value));

    // --- Service Worker --- //
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

    // --- Theme Management --- //
    const THEME_KEY = 'theme';
    const setTheme = (next) => {
        attr(document.documentElement, 'data-theme', next);
        try { localStorage.setItem(THEME_KEY, next); } catch { /* ignore */ }
    };

    // --- Popup (Modal) Logic --- //
    function bindPopup(triggerBtn, popupEl, closeBtn) {
        if (!popupEl) return;
        const dialog = popupEl.querySelector('.popup-dialog');
        let lastFocus = null;
        const focusableElements = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

        const trapFocus = (e) => {
            if (e.key !== 'Tab') return;
            const focusable = Array.from(popupEl.querySelectorAll(focusableElements));
            if (!focusable.length) return e.preventDefault();
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        };

        const onEsc = (e) => { if (e.key === 'Escape') close(); };

        const open = () => {
            lastFocus = document.activeElement;
            popupEl.classList.add('is-visible');
            attr(popupEl, 'aria-hidden', 'false');
            document.body.classList.add('scroll-lock');
            on(document, 'keydown', trapFocus);
            on(document, 'keydown', onEsc);
            const firstFocusable = popupEl.querySelector(focusableElements);
            (firstFocusable || dialog || popupEl).focus();
        };

        const close = () => {
            popupEl.classList.remove('is-visible');
            attr(popupEl, 'aria-hidden', 'true');
            document.body.classList.remove('scroll-lock');
            document.removeEventListener('keydown', trapFocus);
            document.removeEventListener('keydown', onEsc);
            if (lastFocus && typeof lastFocus.focus === 'function') {
                lastFocus.focus();
            }
        };

        on(triggerBtn, 'click', open);
        on(closeBtn, 'click', close);
        on(popupEl, 'click', (e) => { if (e.target === popupEl) close(); });
    }

    // --- Tab Navigation Logic --- //
    function initTabs() {
        const tabContainer = qs('#wrapper-tabs');
        if (!tabContainer) return;

        const tabs = qsa('.tab-button', tabContainer);
        const slider = qs('.tab-slider', tabContainer);
        const contents = qsa('.content-section[data-content]');

        function moveSlider(targetTab) {
            if (!targetTab || !slider) return;
            const targetRect = targetTab.getBoundingClientRect();
            const containerRect = tabContainer.getBoundingClientRect();

            const width = targetRect.width;
            const transform = `translateX(${targetRect.left - containerRect.left}px)`;

            slider.style.width = `${width}px`;
            slider.style.transform = transform;
        }

        function activate(tab, isInitial = false) {
            if (!tab) return;
            const tabName = attr(tab, 'data-tab');

            if (isInitial) {
                slider.style.transition = 'none'; // Disable transition for initial set
            }

            moveSlider(tab);

            if (isInitial) {
                setTimeout(() => slider.style.transition = '', 50); // Re-enable after a tick
            }

            tabs.forEach(t => t.classList.toggle('active', t === tab));
            contents.forEach(c => {
                c.hidden = attr(c, 'data-content') !== tabName;
            });
        }

        function onHashChange(isInitial = false) {
            const tabName = location.hash.slice(1);
            const targetTab = qs(`.tab-button[data-tab="${tabName}"]`) || tabs[0];
            activate(targetTab, isInitial);
        }

        tabs.forEach(tab => on(tab, 'click', () => {
            const tabName = attr(tab, 'data-tab');
            if (`#${tabName}` !== location.hash) {
                location.hash = tabName;
            }
        }));

        on(window, 'hashchange', () => onHashChange(false));
        onHashChange(true); // Initial activation

        // Recalculate slider on resize
        on(window, 'resize', () => {
            const activeTab = qs('.tab-button.active');
            moveSlider(activeTab);
        });
    }

    // --- Mobile Navigation Logic ---
    function initMobileNav() {
        const container = qs('.mobile-nav');
        if (!container) return;

        const toggleBtn = qs('#btn-mobile-nav');
        const dropdown = qs('#mobile-nav-dropdown');
        const titleEl = qs('#mobile-nav-title');
        const mainTabs = qsa('.tab-button[data-tab]');

        // 1. Populate dropdown from main tabs
        dropdown.innerHTML = ''; // Clear existing
        mainTabs.forEach(tab => {
            const tabName = attr(tab, 'data-tab');
            const link = document.createElement('button');
            attr(link, 'role', 'menuitem');
            attr(link, 'data-tab', tabName);
            link.className = 'mobile-nav-link';
            link.textContent = tab.textContent;
            on(link, 'click', () => {
                if (`#${tabName}` !== location.hash) {
                    location.hash = tabName;
                }
                closeDropdown(); // Close after selection
            });
            dropdown.appendChild(link);
        });

        const mobileLinks = qsa('.mobile-nav-link', dropdown);

        // 2. Handle dropdown visibility
        const openDropdown = () => {
            dropdown.classList.add('is-visible');
            attr(toggleBtn, 'aria-expanded', 'true');
        };
        const closeDropdown = () => {
            dropdown.classList.remove('is-visible');
            attr(toggleBtn, 'aria-expanded', 'false');
        };

        on(toggleBtn, 'click', (e) => {
            e.stopPropagation();
            dropdown.classList.contains('is-visible') ? closeDropdown() : openDropdown();
        });

        // 3. Close when clicking outside
        on(document, 'click', (e) => {
            if (!container.contains(e.target)) {
                closeDropdown();
            }
        });

        // 4. Sync active state and title with hash changes
        const syncActiveState = () => {
            const currentTabName = location.hash.slice(1) || attr(mainTabs[0], 'data-tab');
            const activeTab = qs(`.tab-button[data-tab="${currentTabName}"]`);

            // Sync dropdown links
            mobileLinks.forEach(link => {
                link.classList.toggle('active', attr(link, 'data-tab') === currentTabName);
            });

            // Sync mobile title
            if (titleEl && activeTab) {
                titleEl.textContent = activeTab.textContent;
            }
        };

        on(window, 'hashchange', syncActiveState);
        syncActiveState(); // Initial sync
    }

    // --- UI Initialization --- //
    function initUI() {
        initTabs();
        initMobileNav();
        bindPopup(qs('#btn-show-settings'), qs('#popup-settings'), qs('#btn-popup-close-settings'));
        bindPopup(qs('#btn-show-info'), qs('#popup-info'), qs('#btn-popup-close-info'));

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
