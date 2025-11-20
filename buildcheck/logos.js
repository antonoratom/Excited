document.addEventListener('DOMContentLoaded', () => {
    if (window.innerWidth <= 991) return;

    const CONFIG = {
        minWidth: 991,
        gap: -12,
        padding: 20,
        animationDuration: 300,
        showDelay: 150,
        hideDelay: 10,
        bridgeExpand: 10,
        horizontalSnap: 1,
        styles: {
            bridge: {
                position: 'fixed',
                pointerEvents: 'auto',
                zIndex: '9998',
                opacity: '0'
            },
            hoverCard: {
                position: 'fixed',
                zIndex: '9999',
                opacity: '0',
                visibility: 'hidden',
                pointerEvents: 'auto',
                transition: 'opacity 0.2s ease'
            }
        }
    };

    class HoverCardController {
        constructor(trigger, hoverCard) {
            this.trigger = trigger;
            this.hoverCard = hoverCard;
            this.bridge = this.createEl('div', CONFIG.styles.bridge);
            this.state = { trigger: false, card: false, bridge: false };
            this.timers = { show: 0, hide: 0 };
            this.rafId = 0;
            this.visible = false;
            this.lockedPos = null; // 'above' | 'below'
            this.lastSig = '';
            this.lastLeft = null;

            document.body.append(this.hoverCard, this.bridge);
            Object.assign(this.hoverCard.style, CONFIG.styles.hoverCard);
            this.bindEvents();
        }

        // Utilities
        createEl(tag, styles) {
            const el = document.createElement(tag);
            Object.assign(el.style, styles);
            return el;
        }
        anyHovered() { return this.state.trigger || this.state.card || this.state.bridge; }
        on(el, ev, fn, opt) { el.addEventListener(ev, fn, opt); }

        bindEvents() {
            const map = { trigger: this.trigger, card: this.hoverCard, bridge: this.bridge };
            Object.entries(map).forEach(([key, el]) => {
                this.on(el, 'mouseenter', () => this.enter(key));
                this.on(el, 'mouseleave', () => this.leave(key));
            });

            // Keep rAF running on scroll/resize if visible
            const pump = () => { if (this.visible && !this.rafId) this.loop(); };
            this.on(window, 'scroll', pump, { passive: true });
            this.on(window, 'resize', pump, { passive: true });
        }

        enter(key) {
            if (window.innerWidth <= CONFIG.minWidth) return;
            this.state[key] = true;
            this.trigger.classList.toggle('is-hovered', this.anyHovered());
            clearTimeout(this.timers.hide);
            clearTimeout(this.timers.show);
            this.timers.show = setTimeout(() => { if (this.anyHovered()) this.show(); }, CONFIG.showDelay);
        }

        leave(key) {
            this.state[key] = false;
            this.trigger.classList.toggle('is-hovered', this.anyHovered());
            clearTimeout(this.timers.show);
            this.hide();
        }

        decideSide(triggerRect, cardH) {
            const above = triggerRect.top;
            const below = window.innerHeight - triggerRect.bottom;
            return (above >= cardH + CONFIG.gap && above > below) ? 'above' : 'below';
        }

        // Geometry and positioning
        compute() {
            const tr = this.trigger.getBoundingClientRect();
            const cw = this.hoverCard.offsetWidth;
            const ch = this.hoverCard.offsetHeight;

            if (!this.lockedPos) this.lockedPos = this.decideSide(tr, ch);

            const cx = tr.left + tr.width / 2;
            let left = Math.min(Math.max(cx - cw / 2, CONFIG.padding), window.innerWidth - cw - CONFIG.padding);
            if (this.lastLeft != null && Math.abs(left - this.lastLeft) < CONFIG.horizontalSnap) left = this.lastLeft;
            this.lastLeft = left;

            const top = this.lockedPos === 'below' ? tr.bottom + CONFIG.gap : undefined;
            const bottom = this.lockedPos === 'above' ? (window.innerHeight - tr.top + CONFIG.gap) : undefined;

            return { tr, left, top, bottom, pos: this.lockedPos, arrowOffset: cx - left };
        }

        applyPosition(geom) {
            const s = this.hoverCard.style;
            s.left = `${geom.left}px`;
            s.setProperty('--arrow-offset', `${geom.arrowOffset}px`);
            if (geom.pos === 'above') {
                s.top = 'auto';
                s.bottom = `${geom.bottom}px`;
            } else {
                s.bottom = 'auto';
                s.top = `${geom.top}px`;
            }
            this.hoverCard.setAttribute('data-position', geom.pos);
        }

        applyBridge(tr, cardRect, pos) {
            const isAbove = pos === 'above';
            const top = isAbove ? cardRect.bottom : tr.bottom;
            const bottom = isAbove ? tr.top : cardRect.top;

            Object.assign(this.bridge.style, {
                display: 'block',
                left: `${Math.min(tr.left, cardRect.left) - CONFIG.bridgeExpand}px`,
                top: `${top}px`,
                width: `${Math.max(tr.width, cardRect.width) + CONFIG.bridgeExpand * 2}px`,
                height: `${Math.abs(bottom - top)}px`
            });
        }

        loop() {
            if (!this.visible || window.innerWidth <= CONFIG.minWidth) { this.rafId = 0; return; }

            const g = this.compute();
            const sig = `${Math.round(g.left)}|${g.pos}|${Math.round(g.top ?? -1)}|${Math.round(g.bottom ?? -1)}|${Math.round(g.tr.top)}|${Math.round(g.tr.bottom)}|${window.innerHeight}`;
            if (sig !== this.lastSig) {
                this.lastSig = sig;
                this.applyPosition(g);
                const cardRect = this.hoverCard.getBoundingClientRect();
                this.applyBridge(g.tr, cardRect, g.pos);
            }
            this.rafId = requestAnimationFrame(() => this.loop());
        }

        // Show/Hide
        show() {
            if (!this.anyHovered() || window.innerWidth <= CONFIG.minWidth) return;
            clearTimeout(this.timers.hide);

            const g = this.compute();
            this.applyPosition(g);

            // Make visible (opacity only)
            Object.assign(this.hoverCard.style, { visibility: 'visible', opacity: '1' });

            const cardRect = this.hoverCard.getBoundingClientRect();
            this.applyBridge(g.tr, cardRect, g.pos);

            this.visible = true;
            if (!this.rafId) { this.lastSig = ''; this.loop(); }
        }

        hide() {
            this.timers.hide = setTimeout(() => {
                if (this.anyHovered()) return;

                this.hoverCard.style.opacity = '0';

                setTimeout(() => {
                    if (this.anyHovered()) return;
                    Object.assign(this.hoverCard.style, { visibility: 'hidden' });
                    this.bridge.style.display = 'none';
                    this.visible = false;
                    this.lockedPos = null;
                    this.lastLeft = null;
                    if (this.rafId) { cancelAnimationFrame(this.rafId); this.rafId = 0; }
                }, CONFIG.animationDuration);
            }, CONFIG.hideDelay);
        }
    }

    // Init
    document.querySelectorAll('.feedbacks-cases-bl').forEach(trigger => {
        const hoverCard = trigger.nextElementSibling;
        if (hoverCard?.hasAttribute('hover-card-type')) {
            new HoverCardController(trigger, hoverCard);
        }
    });
});
