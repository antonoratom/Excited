

document.addEventListener("DOMContentLoaded", () => {
    const initSwipers = () => {
      // Bento Cards & Security Cards (mobile only)
      if (window.innerWidth < 991) {
        document
          .querySelectorAll(".ad-format-cont-swiper.swiper")
          .forEach((swiperEl) => {
            new Swiper(swiperEl, {
              grabCursor: true,
              loop: false,
              centeredSlides: false,
              initialSlide: 0,
              autoplay: {
                delay: 2000,
                disableOnInteraction: false,
              },
              navigation: {
                nextEl: swiperEl.parentNode.querySelector("[swiper-next]"),
                prevEl: swiperEl.parentNode.querySelector("[swiper-prev]"),
              },
              pagination: {
                el: swiperEl.parentNode.querySelector(".swiper-pagination"),
                clickable: true,
                dynamicBullets: false,
              },
              breakpoints: {
                200: { slidesPerView: 1 },
              },
            });
          });
      }
    };
  
    initSwipers();
  });
  

(function () {
    /*
     * Expected HTML — each .w-tab-link contains an SVG with the pill outline.
     * The .features-ring-fill rect is the animated stroke; the JS sets
     * pathLength="1" at runtime so no HTML change is needed.
     *
     * <a data-w-tab="Tab 1" class="ad-formats-tab-link w-inline-block w-tab-link">
     *   <div class="ad-formats-tab-link-bl">
     *     <!-- icon svg, label div, etc. — order doesn't matter -->
     *     <svg class="ad-format-tab-svg features-tab-number_ring"
     *          width="100%" viewBox="0 0 170 44" fill="none" aria-hidden="true">
     *       <rect class="features-ring-bg" x="1.5" y="1.5" width="167" height="41" rx="20.5"
     *         fill="none" stroke="#DDD" stroke-width="1"/>
     *       <rect class="features-ring-fill" x="1.5" y="1.5" width="167" height="41" rx="20.5"
     *         fill="none" stroke="#501FE8" stroke-width="1"/>
     *     </svg>
     *   </div>
     * </a>
     *
     * The loader fills the NEXT tab's outline over 5 s.
     * When the fill completes that tab becomes active, and the loader
     * starts on the one after it (wraps from last → first).
     */


    // Constants
    const CONFIG = {
        ROTATION_INTERVAL: 14000,
        INACTIVE_TRANSITION: "stroke-dashoffset 0.2s ease",
        VIEWPORT_THRESHOLD: 0.1,
        INIT_DELAY: 200,
        RESTART_DELAY: 1000,
        ANIMATION_DELAY: 100
    };

    const SELECTORS = {
        container: ".ad-formats-tab",
        tabMenu: ".w-tab-menu",
        tabLink: ".w-tab-link",
        ringFill: ".features-ring-fill"
    };

    // pathLength="1" is set on every ring at init, so
    //   dasharray "1 1", dashoffset 1 = hidden, 0 = fully drawn
    const PATH_LEN = 1;

    function setRingDash(ring, offset, transition) {
        if (!ring) return;
        const v = String(offset);
        ring.style.setProperty("stroke-dashoffset", v);
        ring.setAttribute("stroke-dashoffset", v);
        if (transition) {
            ring.style.setProperty("transition", transition);
            ring.style.setProperty("-webkit-transition", transition);
        }
    }

    // State
    const state = {
        currentIndex: 0,
        autoInterval: null,
        isAutoRotating: false,
        isInView: false,
        shouldAutoRotate: false,
        pausedState: null
    };

    // DOM
    const container = document.querySelector(SELECTORS.container);
    if (!container) return;

    const tabs = findValidTabs();
    if (!tabs.length) return;

    function findValidTabs() {
        const selectors = [
            `${SELECTORS.container} ${SELECTORS.tabMenu} ${SELECTORS.tabLink}`,
            `${SELECTORS.container} [data-w-tab]${SELECTORS.tabLink}`,
            `${SELECTORS.container} ${SELECTORS.tabLink}`
        ];
        for (const sel of selectors) {
            const els = Array.from(document.querySelectorAll(sel));
            const valid = els.filter(t => t.offsetParent && t.hasAttribute("data-w-tab"));
            if (valid.length) return valid;
        }
        return [];
    }

    function getRing(tab) {
        return tab?.querySelector(SELECTORS.ringFill);
    }

    function nextIndex(cur) {
        return (cur + 1) % tabs.length;
    }

    function isInitiallyInView() {
        const r = container.getBoundingClientRect();
        return r.top < window.innerHeight && r.bottom > 0;
    }

    function getRemainingTime(tab) {
        const ring = getRing(tab);
        if (!ring) return CONFIG.ROTATION_INTERVAL;
        const offset =
            parseFloat(window.getComputedStyle(ring).strokeDashoffset) ||
            parseFloat(ring.getAttribute("stroke-dashoffset")) ||
            0;
        if (isNaN(offset)) return CONFIG.ROTATION_INTERVAL;
        const progress = (PATH_LEN - offset) / PATH_LEN;
        return Math.max((1 - progress) * CONFIG.ROTATION_INTERVAL, 100);
    }

    // ── Progress ────────────────────────────────────────────────
    const Progress = {
        // Prepare every ring: set pathLength, dasharray, hide stroke
        init() {
            tabs.forEach(tab => {
                const ring = getRing(tab);
                if (!ring) return;
                ring.setAttribute("pathLength", String(PATH_LEN));
                ring.style.setProperty("stroke-dasharray", `${PATH_LEN} ${PATH_LEN}`);
                ring.setAttribute("stroke-dasharray", `${PATH_LEN} ${PATH_LEN}`);
                setRingDash(ring, PATH_LEN, "none");
            });
        },

        // Instantly hide every ring (no transition)
        reset() {
            tabs.forEach(tab => {
                const ring = getRing(tab);
                if (ring) setRingDash(ring, PATH_LEN, "none");
            });
            container.offsetHeight; // force reflow so transition restarts cleanly
        },

        // Animate the NEXT tab's ring from hidden → full over ROTATION_INTERVAL
        update(activeIndex, forceUpdate = false) {
            if (!state.isInView && !forceUpdate) return;
            const nextIdx = nextIndex(activeIndex);
            this.reset();
            requestAnimationFrame(() => {
                tabs.forEach((tab, i) => {
                    const ring = getRing(tab);
                    if (!ring) return;
                    const isNext = i === nextIdx;
                    const tr = isNext
                        ? `stroke-dashoffset ${CONFIG.ROTATION_INTERVAL}ms linear`
                        : CONFIG.INACTIVE_TRANSITION;
                    setRingDash(ring, isNext ? 0 : PATH_LEN, tr);
                });
            });
        },

        // Freeze every ring at its current computed offset
        pause() {
            tabs.forEach(tab => {
                const ring = getRing(tab);
                if (!ring) return;
                const cur =
                    parseFloat(window.getComputedStyle(ring).strokeDashoffset) ||
                    parseFloat(ring.getAttribute("stroke-dashoffset")) ||
                    0;
                setRingDash(ring, cur, "none");
            });
            state.pausedState = { pausedAt: Date.now(), activeIndex: state.currentIndex };
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
            const nextIdx = nextIndex(state.currentIndex);
            const nextTab = tabs[nextIdx];
            const nextRing = getRing(nextTab);
            if (!nextRing) { this._startFresh(); return; }

            requestAnimationFrame(() => {
                const remaining = getRemainingTime(nextTab);
                setRingDash(nextRing, 0, `stroke-dashoffset ${remaining}ms linear`);
                tabs.forEach((tab, i) => {
                    if (i !== nextIdx) {
                        const ring = getRing(tab);
                        if (ring) setRingDash(ring, PATH_LEN, CONFIG.INACTIVE_TRANSITION);
                    }
                });
                if (state.shouldAutoRotate) Rotation.scheduleNext(remaining);
            });
        },

        _startFresh() {
            this.update(state.currentIndex, true);
            if (state.shouldAutoRotate) Rotation.start();
        }
    };

    // ── Rotation ────────────────────────────────────────────────
    const Rotation = {
        start() {
            this.stop();
            state.shouldAutoRotate = true;
            if (state.isInView) this.scheduleNext(CONFIG.ROTATION_INTERVAL);
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
            setTimeout(() => { state.isAutoRotating = false; }, CONFIG.ANIMATION_DELAY);
        },

        scheduleNext(delay) {
            if (state.autoInterval != null) clearTimeout(state.autoInterval);
            state.autoInterval = setTimeout(() => {
                state.autoInterval = null;
                if (state.isInView && state.shouldAutoRotate) {
                    this.next();
                    this.scheduleNext(CONFIG.ROTATION_INTERVAL);
                }
            }, delay);
        }
    };

    // ── Viewport ────────────────────────────────────────────────
    const Viewport = {
        createObserver() {
            const obs = new IntersectionObserver(
                this.handleIntersection.bind(this),
                { root: null, rootMargin: "0px", threshold: CONFIG.VIEWPORT_THRESHOLD }
            );
            obs.observe(container);
            return obs;
        },

        handleIntersection(entries) {
            entries.forEach(entry => {
                if (entry.target !== container) return;
                const wasInView = state.isInView;
                state.isInView = entry.isIntersecting;

                if (state.isInView && !wasInView) {
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => Progress.resume());
                    });
                } else if (!state.isInView && wasInView) {
                    Progress.pause();
                    Rotation.pause();
                }
            });
        }
    };

    // ── Events ──────────────────────────────────────────────────
    function setupTabClicks() {
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
    }

    function setupHoverPause() {
        container.addEventListener("mouseenter", () => {
            if (state.shouldAutoRotate && state.isInView) {
                Progress.pause();
                Rotation.pause();
            }
        });
        container.addEventListener("mouseleave", () => {
            if (state.shouldAutoRotate && state.isInView) {
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => Progress.resume());
                });
            }
        });
    }

    // ── Init ────────────────────────────────────────────────────
    function initialize() {
        setupTabClicks();
        setupHoverPause();
        Progress.init();
        Viewport.createObserver();

        setTimeout(() => {
            if (isInitiallyInView()) state.isInView = true;
            state.shouldAutoRotate = true;
            if (state.isInView) {
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        Progress.update(0, true);
                        Rotation.scheduleNext(CONFIG.ROTATION_INTERVAL);
                    });
                });
            }
        }, CONFIG.INIT_DELAY);
    }

    initialize();
})();