(function () {
    /*
     * RECOMMENDED HTML for the three numbered tab indicators (recreate in Webflow):
     *
     * Best structure: a single wrap containing three indicator divs, synced by index with tabs.
     * Put this inside or beside your .features-tab (Webflow Tabs) component.
     *
     *   <div class="features-tab-number_wrap">
     *     <div class="features-tab-number" data-tab-index="0">  <!-- optional, for click sync -->
     *       <span class="features-tab-number_num">1</span>
     *       <svg class="features-tab-number_ring" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
     *         <circle class="features-ring-bg" cx="12" cy="12" r="10" fill="none" stroke-width="2"/>
     *         <circle class="features-ring-fill" cx="12" cy="12" r="10" fill="none" stroke-width="2"
     *           stroke-linecap="round" stroke-dasharray="62.83" stroke-dashoffset="62.83"
     *           transform="rotate(-90 12 12)"/>
     *       </svg>
     *     </div>
     *     <div class="features-tab-number" data-tab-index="1">...</div>
     *     <div class="features-tab-number" data-tab-index="2">...</div>
     *   </div>
     *
     * .features-ring-bg = inactive outline. .features-ring-fill = animated progress (0→100% over ROTATION_INTERVAL).
     * r=10 → circumference ≈ 62.83.
     *
     * Mobile: if tab links have numbers, nest <div class="features-number"><svg><circle class="features-ring-fill"/>...>
     * inside each .w-tab-link (r=11 → circumference ≈ 69.12).
     */
    


    // Constants
    const CONFIG = {
        ROTATION_INTERVAL: 8000,
        INACTIVE_TRANSITION: "stroke-dashoffset 0.2s ease",
        VIEWPORT_THRESHOLD: 0.1,
        INIT_DELAY: 200,
        RESTART_DELAY: 1000,
        ANIMATION_DELAY: 100,
        MOBILE_BREAKPOINT: 991
    };

    const SELECTORS = {
        container: ".features-tab",
        tabMenu: ".w-tab-menu",
        tabLink: ".w-tab-link",
        tabPane: ".w-tab-pane",
        indicatorWrap: ".features-tab-number_wrap",
        indicator: ".features-tab-number",
        ringFill: ".features-ring-fill",
        mobileTabNumber: ".features-number",
        mobileRingFill: ".features-ring-fill",
        lottie: ".end-to-end-lottie"
    };

    const RING_CIRCUMFERENCE = 62.83; // 2πr for r=10 (desktop)
    const RING_CIRCUMFERENCE_MOBILE = 69.12; // 2πr for r=11 (mobile)
    // Safari needs two-value stroke-dasharray: "X X"
    const STROKE_DASHARRAY = `${RING_CIRCUMFERENCE} ${RING_CIRCUMFERENCE}`;
    const STROKE_DASHARRAY_MOBILE = `${RING_CIRCUMFERENCE_MOBILE} ${RING_CIRCUMFERENCE_MOBILE}`;

    function isMobile() {
        return window.innerWidth <= CONFIG.MOBILE_BREAKPOINT;
    }

    function setRingDash(ring, offset, transition) {
        if (!ring) return;
        const offsetStr = String(offset);
        ring.style.setProperty("stroke-dashoffset", offsetStr);
        ring.setAttribute("stroke-dashoffset", offsetStr);
        if (transition) {
            ring.style.setProperty("transition", transition);
            ring.style.setProperty("-webkit-transition", transition);
        }
    }

    function setRingDasharray(ring, dasharray) {
        if (!ring) return;
        ring.style.setProperty("stroke-dasharray", dasharray);
        ring.setAttribute("stroke-dasharray", dasharray);
    }

    // State management
    const state = {
        currentIndex: 0,
        autoInterval: null,
        isAutoRotating: false,
        isInView: false,
        shouldAutoRotate: false,
        pausedState: null
    };

    // DOM elements
    const container = document.querySelector(SELECTORS.container);
    if (!container) return;

    const tabs = findValidTabs();
    if (!tabs.length) return;

    const panes = Array.from(container.querySelectorAll(SELECTORS.tabPane));

    const tabDurationsMs = panes.map((pane, i) => {
        const el = pane?.querySelector(SELECTORS.lottie);
        const sec = el?.getAttribute("data-duration");
        const ms = sec != null ? parseFloat(sec) * 1000 : null;
        return (ms > 0 ? ms : null) ?? CONFIG.ROTATION_INTERVAL;
    });

    function getRotationInterval(index) {
        return tabDurationsMs[index] ?? CONFIG.ROTATION_INTERVAL;
    }

    // Helper functions
    function findValidTabs() {
        const selectors = [
            `${SELECTORS.container} ${SELECTORS.tabMenu} ${SELECTORS.tabLink}`,
            `${SELECTORS.container} [data-w-tab]${SELECTORS.tabLink}`,
            `${SELECTORS.container} ${SELECTORS.tabLink}`
        ];

        for (const selector of selectors) {
            const elements = Array.from(document.querySelectorAll(selector));
            const validTabs = elements.filter(tab => tab.offsetParent && tab.hasAttribute("data-w-tab"));
            if (validTabs.length) return validTabs;
        }
        return [];
    }

    function getRingFill(element) {
        return element?.querySelector(SELECTORS.ringFill);
    }

    function getWrapAndActiveForIndex(index) {
        // Each tab pane can have its own wrap (indicators per panel)
        const panel = panes[index];
        if (panel) {
            const wrap = panel.querySelector(SELECTORS.indicatorWrap);
            if (wrap) {
                const allIndicators = Array.from(wrap.querySelectorAll(SELECTORS.indicator));
                const active = allIndicators[index] ?? allIndicators[0];
                return { wrap, active, allIndicators };
            }
        }
        // Standard: single shared wrap, active = indicator at index
        const wrap = container.querySelector(SELECTORS.indicatorWrap);
        if (!wrap) return { wrap: null, active: null, allIndicators: [] };
        const allIndicators = Array.from(wrap.querySelectorAll(SELECTORS.indicator));
        const active = allIndicators[index] ?? null;
        return { wrap, active, allIndicators };
    }

    function getRemainingTime(element, circumference, durationMs) {
        const circ = circumference ?? (isMobile() ? RING_CIRCUMFERENCE_MOBILE : RING_CIRCUMFERENCE);
        const ring = getRingFill(element);
        const dur = durationMs ?? getRotationInterval(state.currentIndex);
        if (!ring) return dur;
        const computed = window.getComputedStyle(ring);
        const offset = parseFloat(ring.style.strokeDashoffset) || parseFloat(ring.getAttribute("stroke-dashoffset")) || parseFloat(computed.strokeDashoffset);
        if (isNaN(offset)) return dur;
        const progress = (circ - offset) / circ;
        const remainingTime = (1 - progress) * dur;
        return Math.max(remainingTime, 100);
    }

    function getMobileRingFill(tab) {
        const numEl = tab?.querySelector(SELECTORS.mobileTabNumber);
        return numEl?.querySelector(SELECTORS.mobileRingFill);
    }

    function isInitiallyInView() {
        const rect = container.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
    }

    // Progress ring management (stroke-dashoffset animates border fill in sync with rotation)
    const Progress = {
        setTransition(ring, dashOffset, transition = CONFIG.INACTIVE_TRANSITION) {
            setRingDash(ring, dashOffset, transition);
        },

        reset() {
            if (isMobile()) {
                tabs.forEach(tab => {
                    const ring = getMobileRingFill(tab);
                    if (ring) setRingDash(ring, RING_CIRCUMFERENCE_MOBILE, "none");
                });
            } else {
                panes.forEach((panel, i) => {
                    const { allIndicators } = getWrapAndActiveForIndex(i);
                    allIndicators.forEach(ind => {
                        const ring = getRingFill(ind);
                        if (ring) setRingDash(ring, RING_CIRCUMFERENCE, "none");
                    });
                });
            }
            container.offsetHeight; // Force reflow
        },

        update(activeIndex, forceUpdate = false) {
            if (!state.isInView && !forceUpdate) return;

            if (isMobile()) {
                this.reset();
                const activeRing = getMobileRingFill(tabs[activeIndex]);
                if (!activeRing) return;
                requestAnimationFrame(() => {
                    tabs.forEach((tab, i) => {
                        const ring = getMobileRingFill(tab);
                        const isActive = i === activeIndex;
                        const transition = isActive
                            ? `stroke-dashoffset ${getRotationInterval(activeIndex)}ms linear`
                            : CONFIG.INACTIVE_TRANSITION;
                        this.setTransition(
                            ring,
                            isActive ? 0 : RING_CIRCUMFERENCE_MOBILE,
                            transition
                        );
                    });
                });
            } else {
                const { allIndicators, active } = getWrapAndActiveForIndex(activeIndex);
                if (!active) return;
                this.reset();
                requestAnimationFrame(() => {
                    allIndicators.forEach(ind => {
                        const ring = getRingFill(ind);
                        const isActive = ind === active;
                        const transition = isActive
                            ? `stroke-dashoffset ${getRotationInterval(activeIndex)}ms linear`
                            : CONFIG.INACTIVE_TRANSITION;
                        this.setTransition(
                            ring,
                            isActive ? 0 : RING_CIRCUMFERENCE,
                            transition
                        );
                    });
                });
            }
        },

        pause() {
            const getOffset = (ring) => {
                const c = window.getComputedStyle(ring).strokeDashoffset;
                const a = ring.getAttribute("stroke-dashoffset");
                return parseFloat(c) || parseFloat(a) || 0;
            };
            if (isMobile()) {
                tabs.forEach(tab => {
                    const ring = getMobileRingFill(tab);
                    if (ring) setRingDash(ring, getOffset(ring), "none");
                });
            } else {
                const { allIndicators } = getWrapAndActiveForIndex(state.currentIndex);
                allIndicators.forEach(ind => {
                    const ring = getRingFill(ind);
                    if (ring) setRingDash(ring, getOffset(ring), "none");
                });
            }
            state.pausedState = {
                pausedAt: Date.now(),
                activeIndex: state.currentIndex
            };
        },

        resume() {
            if (state.pausedState) {
                this._resumeFromPaused();
            } else {
                this._startFresh();
            }
            state.pausedState = null;
        },

        _resumeFromPaused() {
            if (isMobile()) {
                const activeTab = tabs[state.currentIndex];
                const activeRing = getMobileRingFill(activeTab);
                if (!activeRing) {
                    this._startFresh();
                    return;
                }
                requestAnimationFrame(() => {
                    const remainingTime = getRemainingTime(activeTab, RING_CIRCUMFERENCE_MOBILE, getRotationInterval(state.currentIndex));
                    setRingDash(activeRing, 0, `stroke-dashoffset ${remainingTime}ms linear`);
                    tabs.forEach((tab, i) => {
                        if (i !== state.currentIndex) {
                            const ring = getMobileRingFill(tab);
                            if (ring) setRingDash(ring, RING_CIRCUMFERENCE_MOBILE, CONFIG.INACTIVE_TRANSITION);
                        }
                    });
                    if (state.shouldAutoRotate) Rotation.scheduleNext(remainingTime);
                });
            } else {
                const { allIndicators, active } = getWrapAndActiveForIndex(state.currentIndex);
                const activeRing = getRingFill(active);
                if (!activeRing) {
                    this._startFresh();
                    return;
                }
                requestAnimationFrame(() => {
                    const remainingTime = getRemainingTime(active, null, getRotationInterval(state.currentIndex));
                    setRingDash(activeRing, 0, `stroke-dashoffset ${remainingTime}ms linear`);
                    allIndicators.forEach(ind => {
                        if (ind !== active) {
                            const ring = getRingFill(ind);
                            if (ring) setRingDash(ring, RING_CIRCUMFERENCE, CONFIG.INACTIVE_TRANSITION);
                        }
                    });
                    if (state.shouldAutoRotate) Rotation.scheduleNext(remainingTime);
                });
            }
        },

        _startFresh() {
            this.update(state.currentIndex, true);
            if (state.shouldAutoRotate) Rotation.start();
        },

        initMobileRings() {
            tabs.forEach(tab => {
                const ring = getMobileRingFill(tab);
                if (ring) {
                    setRingDasharray(ring, STROKE_DASHARRAY_MOBILE);
                    setRingDash(ring, RING_CIRCUMFERENCE_MOBILE, "none");
                }
            });
        },

        initDesktopRings() {
            panes.forEach((panel, i) => {
                const { allIndicators } = getWrapAndActiveForIndex(i);
                allIndicators.forEach(ind => {
                    const ring = getRingFill(ind);
                    if (ring) setRingDasharray(ring, STROKE_DASHARRAY);
                });
            });
            const sharedWrap = container.querySelector(SELECTORS.indicatorWrap);
            if (sharedWrap) {
                sharedWrap.querySelectorAll(SELECTORS.indicator).forEach(ind => {
                    const ring = getRingFill(ind);
                    if (ring) setRingDasharray(ring, STROKE_DASHARRAY);
                });
            }
        }
    };

    // Rotation management (per-tab duration via setTimeout)
    const Rotation = {
        start() {
            this.stop();
            state.shouldAutoRotate = true;
            if (state.isInView) {
                this.scheduleNext(getRotationInterval(state.currentIndex));
            }
        },

        stop() {
            if (state.autoInterval != null) clearTimeout(state.autoInterval);
            state.autoInterval = null;
            state.shouldAutoRotate = false;
            state.pausedState = null;
        },

        pause() {
            if (state.autoInterval != null) clearTimeout(state.autoInterval);
            state.autoInterval = null;
        },

        next() {
            if (!state.isInView) return;

            state.isAutoRotating = true;
            state.currentIndex = (state.currentIndex + 1) % tabs.length;

            Progress.update(state.currentIndex, true);
            tabs[state.currentIndex].click();

            setTimeout(() => {
                state.isAutoRotating = false;
            }, CONFIG.ANIMATION_DELAY);
        },

        scheduleNext(delay) {
            if (state.autoInterval != null) clearTimeout(state.autoInterval);
            state.autoInterval = setTimeout(() => {
                state.autoInterval = null;
                if (state.isInView && state.shouldAutoRotate) {
                    this.next();
                    this.scheduleNext(getRotationInterval(state.currentIndex));
                }
            }, delay);
        }
    };

    // Viewport management
    const Viewport = {
        createObserver() {
            const observer = new IntersectionObserver(
                this.handleIntersection.bind(this),
                {
                    root: null,
                    rootMargin: "0px",
                    threshold: CONFIG.VIEWPORT_THRESHOLD
                }
            );

            observer.observe(container);
            return observer;
        },

        handleIntersection(entries) {
            entries.forEach(entry => {
                if (entry.target === container) {
                    const wasInView = state.isInView;
                    state.isInView = entry.isIntersecting;

                    if (state.isInView && !wasInView) {
                        requestAnimationFrame(() => {
                            requestAnimationFrame(() => {
                                Progress.resume();
                            });
                        });
                    } else if (!state.isInView && wasInView) {
                        console.log("Tabs left view - pausing");
                        Progress.pause();
                        Rotation.pause();
                    }
                }
            });
        }
    };

    function forEachIndicatorWithIndex(fn) {
        const handled = new Set();
        panes.forEach((panel) => {
            const wrap = panel?.querySelector(SELECTORS.indicatorWrap);
            if (!wrap || handled.has(wrap)) return;
            handled.add(wrap);
            wrap.querySelectorAll(SELECTORS.indicator).forEach((ind, index) => fn(ind, index));
        });
        const sharedWrap = container.querySelector(SELECTORS.indicatorWrap);
        if (sharedWrap && !handled.has(sharedWrap)) {
            sharedWrap.querySelectorAll(SELECTORS.indicator).forEach((ind, index) => fn(ind, index));
        }
    }

    // Event management
    const Events = {
        setupTabClicks() {
            tabs.forEach((tab, index) => {
                tab.addEventListener("click", (e) => {
                    if (e.isTrusted && !state.isAutoRotating) {
                        Rotation.stop();
                        state.currentIndex = index;
                        Progress.update(state.currentIndex, true);
                        setTimeout(() => Rotation.start(), CONFIG.RESTART_DELAY);
                    }
                });
            });
        },

        setupIndicatorClicks() {
            forEachIndicatorWithIndex((ind, index) => {
                ind.style.cursor = "pointer";
                ind.addEventListener("click", () => {
                    Rotation.stop();
                    state.currentIndex = index;
                    Progress.update(state.currentIndex, true);
                    tabs[index]?.click();
                    setTimeout(() => Rotation.start(), CONFIG.RESTART_DELAY);
                });
            });
        }
    };

    // Initialization
    function initialize() {
        Events.setupTabClicks();
        if (!isMobile()) {
            Events.setupIndicatorClicks();
            Progress.initDesktopRings();
        } else {
            Progress.initMobileRings();
        }
        Viewport.createObserver();

        setTimeout(() => {
            if (isInitiallyInView()) {
                state.isInView = true;
            }
            state.shouldAutoRotate = true;
            if (state.isInView) {
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        Progress.update(0, true);
                        Rotation.scheduleNext(getRotationInterval(0));
                    });
                });
            }
        }, CONFIG.INIT_DELAY);
    }

    // Start the application
    initialize();
})();
