(function () {
    // Utils
    const qs = (sel, root = document) => root.querySelector(sel);
    const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));
    const on = (el, type, handler, opts) => el && el.addEventListener(type, handler, opts);
    const attr = (el, name, value) => (value === undefined ? el.getAttribute(name) : el.setAttribute(name, value));

    // Service Worker (register silently; update flow handled via modal elsewhere)
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker
                .register('sw.js')
                .catch((error) => console.warn('Service Worker registration failed:', error));
        });
    }

    // Theme
    const THEME_KEY = 'theme';
    function updateThemeMeta() {
        // Use computed CSS variable to set <meta name="theme-color"> to the background color
        const meta = document.querySelector('meta[name="theme-color"]');
        if (!meta) return;
        const cs = getComputedStyle(document.documentElement);
        const bg = cs.getPropertyValue('--color-background').trim();
        if (bg) meta.setAttribute('content', bg);
    }

    const setTheme = (next) => {
        attr(document.documentElement, 'data-theme', next);
        try { localStorage.setItem(THEME_KEY, next); } catch { /* ignore */ }
        updateThemeMeta();
    };

    // Modal
    function bindModal(triggerBtn, modalEl, closeBtn) {
        if (!modalEl) return;
        const dialog = modalEl.querySelector('.modal-dialog');
        let lastFocus = null;
        const focusableElements = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

        const trapFocus = (e) => {
            if (e.key !== 'Tab') return;
            const focusable = Array.from(modalEl.querySelectorAll(focusableElements));
            if (!focusable.length) return e.preventDefault();
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        };

        const onEsc = (e) => { if (e.key === 'Escape') close(); };

        const open = () => {
            lastFocus = document.activeElement;
            modalEl.classList.add('is-visible');
            attr(modalEl, 'aria-hidden', 'false');
            document.body.classList.add('scroll-lock');
            on(document, 'keydown', trapFocus);
            on(document, 'keydown', onEsc);
            const firstFocusable = modalEl.querySelector(focusableElements);
            (firstFocusable || dialog || modalEl).focus();
        };

        const close = () => {
            modalEl.classList.remove('is-visible');
            attr(modalEl, 'aria-hidden', 'true');
            document.body.classList.remove('scroll-lock');
            document.removeEventListener('keydown', trapFocus);
            document.removeEventListener('keydown', onEsc);
            if (lastFocus && typeof lastFocus.focus === 'function') {
                lastFocus.focus();
            }
        };

        on(triggerBtn, 'click', open);
        on(closeBtn, 'click', close);
        on(modalEl, 'click', (e) => { if (e.target === modalEl) close(); });
    }

    // Tabs (sample website parity: .active class + data-target)
    function initTabs() {
        const tabContainer = qs('#wrapper-tabs');
        if (!tabContainer) return;

        const tabs = qsa('.tab-button', tabContainer);
        const slider = qs('.tab-slider', tabContainer);
        const panels = qsa('.content-section[data-content]');

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
            const targetSel = attr(tab, 'data-target');
            if (isInitial && slider) slider.style.transition = 'none';
            tabs.forEach(t => t.classList.toggle('active', t === tab));
            // Toggle panels inline (no helper function)
            panels.forEach(p => { p.hidden = true; });
            const target = targetSel ? qs(targetSel) : null;
            if (target) target.hidden = false;
            moveSlider(tab);
            if (isInitial && slider) setTimeout(() => (slider.style.transition = ''), 50);
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
            } else {
                activate(tab, false);
            }
        }));

        on(window, 'hashchange', () => onHashChange(false));
        onHashChange(true); // Initial activation

        on(window, 'resize', () => {
            const activeTab = qs('.tab-button.active', tabContainer);
            moveSlider(activeTab);
        });
    }

    // Mobile nav
    function initMobileNav() {
        const container = qs('.mobile-nav');
        if (!container) return;

        const toggleBtn = qs('#btn-mobile-nav');
        const dropdown = qs('#mobile-nav-dropdown');
        const titleEl = qs('#mobile-nav-title');
        const mainTabs = qsa('.tab-button[data-tab]');

        // Build dropdown from tabs
        dropdown.innerHTML = '';
        dropdown.setAttribute('role', 'menu');
        dropdown.setAttribute('aria-labelledby', 'btn-mobile-nav');
        mainTabs.forEach((tab, idx) => {
            const tabName = attr(tab, 'data-tab');
            const link = document.createElement('button');
            attr(link, 'role', 'menuitem');
            attr(link, 'data-tab', tabName);
            link.className = 'mobile-nav-link';
            const iconMap = {
                home: 'home',
                about: 'info',
                contact: 'mail'
            };
            const iconName = iconMap[tabName] || 'chevron_right';
            const icon = document.createElement('span');
            icon.className = 'material-symbols-rounded menu-icon';
            icon.textContent = iconName;
            const label = document.createElement('span');
            label.className = 'menu-label';
            label.textContent = tab.textContent;
            link.appendChild(icon);
            link.appendChild(label);
            link.type = 'button';
            link.tabIndex = -1;
            on(link, 'click', () => {
                if (`#${tabName}` !== location.hash) {
                    location.hash = tabName;
                }
                closeDropdown();
            });
            dropdown.appendChild(link);
            if (idx < mainTabs.length - 1) {
                const divider = document.createElement('div');
                divider.className = 'menu-divider';
                divider.setAttribute('role', 'separator');
                dropdown.appendChild(divider);
            }
        });

        const mobileLinks = qsa('.mobile-nav-link', dropdown);

        // Visibility
        const focusFirstItem = () => {
            const first = mobileLinks[0];
            if (first) first.focus();
        };

        const openDropdown = () => {
            dropdown.classList.add('is-visible');
            attr(toggleBtn, 'aria-expanded', 'true');
            setTimeout(focusFirstItem, 0);
        };
        const closeDropdown = () => {
            dropdown.classList.remove('is-visible');
            attr(toggleBtn, 'aria-expanded', 'false');
            toggleBtn.focus();
        };

        on(toggleBtn, 'click', (e) => {
            e.stopPropagation();
            dropdown.classList.contains('is-visible') ? closeDropdown() : openDropdown();
        });

        on(toggleBtn, 'keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                dropdown.classList.contains('is-visible') ? closeDropdown() : openDropdown();
            }
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (!dropdown.classList.contains('is-visible')) openDropdown();
                setTimeout(focusFirstItem, 0);
            }
        });

        on(document, 'click', (e) => {
            if (!container.contains(e.target)) {
                closeDropdown();
            }
        });

        on(dropdown, 'keydown', (e) => {
            const currentIndex = mobileLinks.indexOf(document.activeElement);
            if (e.key === 'Escape') {
                e.preventDefault();
                closeDropdown();
                return;
            }
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                const next = currentIndex < 0 ? 0 : (currentIndex + 1) % mobileLinks.length;
                mobileLinks[next]?.focus();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const prev = currentIndex < 0 ? mobileLinks.length - 1 : (currentIndex - 1 + mobileLinks.length) % mobileLinks.length;
                mobileLinks[prev]?.focus();
            } else if (e.key === 'Home') {
                e.preventDefault();
                mobileLinks[0]?.focus();
            } else if (e.key === 'End') {
                e.preventDefault();
                mobileLinks[mobileLinks.length - 1]?.focus();
            } else if (e.key === 'Enter' || e.key === ' ') {
                // Activate focused item
                if (document.activeElement && document.activeElement.classList.contains('mobile-nav-link')) {
                    e.preventDefault();
                    document.activeElement.click();
                }
            }
        });

        // Sync active state
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
        syncActiveState();
    }

    // Init
    function initUI() {
        initTabs();
        initMobileNav();
        bindModal(qs('#btn-show-settings'), qs('#modal-settings'), qs('#btn-modal-close-settings'));
        bindModal(qs('#btn-show-info'), qs('#modal-info'), qs('#btn-modal-close-info'));
        // Update flow modal
        bindModal(qs('#btn-update-app'), qs('#modal-update'), qs('#btn-modal-close-update'));

        on(qs('#btn-toggle-theme'), 'click', () => {
            const current = attr(document.documentElement, 'data-theme');
            setTheme(current === 'dark' ? 'light' : 'dark');
        });
        // Wire update confirm/cancel
        const btnUpdateConfirm = qs('#btn-update-confirm');
        const btnUpdateCancel = qs('#btn-update-cancel');
        const btnUpdateClose = qs('#btn-modal-close-update');
        const overlayUpdate = qs('#modal-update');

        on(btnUpdateCancel, 'click', () => {
            // Close via the existing close button to ensure focus trap cleanup
            btnUpdateClose && btnUpdateClose.click();
        });

        on(btnUpdateConfirm, 'click', async () => {
            // Optional: basic disabling to prevent double-click
            if (btnUpdateConfirm) btnUpdateConfirm.disabled = true;
            try {
                try { localStorage.clear(); } catch {}
                if ('caches' in window) {
                    const cacheNames = await caches.keys();
                    await Promise.all(cacheNames.map((name) => caches.delete(name)));
                }
                if ('serviceWorker' in navigator) {
                    const registration = await navigator.serviceWorker.getRegistration();
                    if (registration) await registration.unregister();
                }
                // Close modal before reload for cleanliness
                if (btnUpdateClose) btnUpdateClose.click();
                window.location.reload(true);
            } catch (error) {
                console.error('Update failed:', error);
                alert('Update failed. Please check console for details.');
                if (btnUpdateConfirm) btnUpdateConfirm.disabled = false;
            }
        });

        // Ensure meta theme-color matches initial computed theme
        updateThemeMeta();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initUI);
    } else {
        initUI();
    }
})();
