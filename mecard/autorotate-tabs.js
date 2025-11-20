(function () {
  // Constants
  const CONFIG = {
    ROTATION_INTERVAL: 7000,
    ACTIVE_TRANSITION: "width 6s linear",
    INACTIVE_TRANSITION: "width 0.2s ease",
    VIEWPORT_THRESHOLD: 0.1,
    INIT_DELAY: 200,
    RESTART_DELAY: 1000,
    ANIMATION_DELAY: 100
  };

  const SELECTORS = {
    container: ".transparency-tabs_wrap",
    tabMenu: ".w-tab-menu",
    tabLink: ".w-tab-link",
    timeline: ".tabs-tl_item"
  };

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

  function getRemainingTime(currentWidth) {
    const match = currentWidth.match(/(\d+(?:\.\d+)?)/);
    if (!match) return CONFIG.ROTATION_INTERVAL;
    
    const widthPercent = parseFloat(match[0]);
    const remainingPercent = 100 - widthPercent;
    const remainingTime = (remainingPercent / 100) * CONFIG.ROTATION_INTERVAL;
    
    return Math.max(remainingTime, 100);
  }

  function isInitiallyInView() {
    const rect = container.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
  }

  // Timeline management
  const Timeline = {
    setTransition(element, width, transition = CONFIG.INACTIVE_TRANSITION) {
      if (!element) return;
      element.style.transition = transition;
      element.style.width = width;
    },

    reset() {
      tabs.forEach(tab => {
        const timeline = tab.querySelector(SELECTORS.timeline);
        if (timeline) {
          timeline.style.transition = "none";
          timeline.style.width = "0%";
        }
      });
      container.offsetWidth; // Force reflow
    },

    update(activeIndex, forceUpdate = false) {
      if (!state.isInView && !forceUpdate) return;
      
      this.reset();
      
      requestAnimationFrame(() => {
        tabs.forEach((tab, i) => {
          const timeline = tab.querySelector(SELECTORS.timeline);
          const isActive = i === activeIndex;
          this.setTransition(
            timeline,
            isActive ? "100%" : "0%",
            isActive ? CONFIG.ACTIVE_TRANSITION : CONFIG.INACTIVE_TRANSITION
          );
        });
      });
    },

    pause() {
      tabs.forEach(tab => {
        const timeline = tab.querySelector(SELECTORS.timeline);
        if (timeline) {
          const computedWidth = window.getComputedStyle(timeline).width;
          timeline.style.transition = "none";
          timeline.style.width = computedWidth;
        }
      });

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
      const activeTimeline = tabs[state.currentIndex]?.querySelector(SELECTORS.timeline);
      if (!activeTimeline) return;

      requestAnimationFrame(() => {
        const currentWidth = activeTimeline.style.width;
        const remainingTime = getRemainingTime(currentWidth);
        
        // Resume active timeline
        activeTimeline.style.transition = `width ${remainingTime}ms linear`;
        activeTimeline.style.width = "100%";
        
        // Reset inactive timelines
        tabs.forEach((tab, i) => {
          if (i !== state.currentIndex) {
            const timeline = tab.querySelector(SELECTORS.timeline);
            if (timeline) {
              timeline.style.transition = CONFIG.INACTIVE_TRANSITION;
              timeline.style.width = "0%";
            }
          }
        });

        // Schedule next rotation
        if (state.shouldAutoRotate) {
          Rotation.scheduleNext(remainingTime);
        }
      });
    },

    _startFresh() {
      console.log("First time in view - starting fresh");
      this.update(state.currentIndex, true);
      if (state.shouldAutoRotate) {
        Rotation.start();
      }
    }
  };

  // Rotation management
  const Rotation = {
    start() {
      this.stop();
      state.shouldAutoRotate = true;
      
      if (state.isInView) {
        state.autoInterval = setInterval(() => this.next(), CONFIG.ROTATION_INTERVAL);
      }
    },

    stop() {
      clearInterval(state.autoInterval);
      state.autoInterval = null;
      state.shouldAutoRotate = false;
      state.pausedState = null;
    },

    pause() {
      clearInterval(state.autoInterval);
      state.autoInterval = null;
    },

    next() {
      if (!state.isInView) return;
      
      state.isAutoRotating = true;
      state.currentIndex = (state.currentIndex + 1) % tabs.length;

      Timeline.update(state.currentIndex, true);
      tabs[state.currentIndex].click();

      setTimeout(() => {
        state.isAutoRotating = false;
      }, CONFIG.ANIMATION_DELAY);
    },

    scheduleNext(delay) {
      clearInterval(state.autoInterval);
      setTimeout(() => {
        if (state.isInView && state.shouldAutoRotate) {
          this.next();
          state.autoInterval = setInterval(() => this.next(), CONFIG.ROTATION_INTERVAL);
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
          rootMargin: '0px',
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
            console.log("Tabs came into view");
            Timeline.resume();
          } else if (!state.isInView && wasInView) {
            console.log("Tabs left view - pausing");
            Timeline.pause();
            Rotation.pause();
          }
        }
      });
    }
  };

  // Event management
  const Events = {
    setupTabClicks() {
      tabs.forEach((tab, index) => {
        tab.addEventListener("click", (e) => {
          if (e.isTrusted && !state.isAutoRotating) {
            Rotation.stop();
            state.currentIndex = index;
            Timeline.update(state.currentIndex, true);
            setTimeout(() => Rotation.start(), CONFIG.RESTART_DELAY);
          }
        });
      });
    }
  };

  // Initialization
  function initialize() {
    Events.setupTabClicks();
    Viewport.createObserver();

    setTimeout(() => {
      // Check initial viewport state
      if (isInitiallyInView()) {
        state.isInView = true;
        console.log("Initially in view - starting immediately");
      }

      state.shouldAutoRotate = true;
      
      if (state.isInView) {
        Timeline.update(0, true);
        state.autoInterval = setInterval(() => Rotation.next(), CONFIG.ROTATION_INTERVAL);
      }
    }, CONFIG.INIT_DELAY);
  }

  // Start the application
  initialize();
})();
