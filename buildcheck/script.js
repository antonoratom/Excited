// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Set initial states for all bg-stage elements
  gsap.set(
    "[bg-stage='one'], [bg-stage='two'], [bg-stage='three'], [bg-stage='four'], [bg-stage='five']",
    {
      scale: 0.8,
      opacity: 0,
    }
  );

  // Set initial states for hero images
  gsap.set(".hero-image-fg", {
    scale: 0.9,
    opacity: 0,
  });

  gsap.set(".hero-h_wrap", {
    x: 24,
    opacity: 0,
  });

  // Create timeline for sequenced animations
  const tl = gsap.timeline();

  // Animate each stage with progressive delays
  tl.to("[bg-stage='one']", {
    scale: 1,
    opacity: 1,
    duration: 0.9,
    ease: "power2.out",
  })
    .to(
      "[bg-stage='two']",
      {
        scale: 1,
        opacity: 1,
        duration: 0.9,
        ease: "power2.out",
      },
      0.2
    )
    .to(
      "[bg-stage='three']",
      {
        scale: 1,
        opacity: 1,
        duration: 0.9,
        ease: "power2.out",
      },
      0.4
    )
    .to(
      "[bg-stage='four']",
      {
        scale: 1,
        opacity: 1,
        duration: 0.9,
        ease: "power2.out",
      },
      0.6
    )
    .to(
      "[bg-stage='five']",
      {
        scale: 1,
        opacity: 1,
        duration: 0.9,
        ease: "power2.out",
      },
      0.8
    )

    .to(
      ".hero-image-fg",
      {
        scale: 1,
        opacity: 1,
        duration: 0.9,
        ease: "power2.out",
        stagger: 0.3,
      },
      0.6
    )

    .to(
      ".hero-h_wrap",
      {
        x: 0,
        opacity: 1,
        duration: 1.2,
        ease: "power2.out",
      },
      0.6
    );
});

(function () {
  // Constants
  const CONFIG = {
    ROTATION_INTERVAL: 7000,
    ACTIVE_TRANSITION: "height 7s linear",
    INACTIVE_TRANSITION: "height 0.2s ease",
    VIEWPORT_THRESHOLD: 0.1,
    INIT_DELAY: 200,
    RESTART_DELAY: 1000,
    ANIMATION_DELAY: 100
  };

  const SELECTORS = {
    container: ".customers-tabs",
    tabMenu: ".w-tab-menu",
    tabLink: ".w-tab-link",
    timeline: ".tab-tl_item",
    feedback: ".tabs-feedback-clw",
    activePane: ".customers-tab-pane.w--tab-active .tabs-feedback-clw",
    tabPane: ".customers-tab-pane"
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

  function getRemainingTime(currentHeight) {
    const match = currentHeight.match(/(\d+(?:\.\d+)?)/);
    if (!match) return CONFIG.ROTATION_INTERVAL;
    
    const heightPercent = parseFloat(match[0]);
    const remainingPercent = 100 - heightPercent;
    const remainingTime = (remainingPercent / 100) * CONFIG.ROTATION_INTERVAL;
    
    return Math.max(remainingTime, 100);
  }

  function isInitiallyInView() {
    const rect = container.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
  }

  // Timeline management
  const Timeline = {
    setTransition(element, height, transition = CONFIG.INACTIVE_TRANSITION) {
      if (!element) return;
      element.style.transition = transition;
      element.style.height = height;
    },

    reset() {
      tabs.forEach(tab => {
        const timeline = tab.querySelector(SELECTORS.timeline);
        if (timeline) {
          timeline.style.transition = "none";
          timeline.style.height = "0%";
        }
      });
      container.offsetHeight; // Force reflow
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
          const computedHeight = window.getComputedStyle(timeline).height;
          timeline.style.transition = "none";
          timeline.style.height = computedHeight;
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
        const currentHeight = activeTimeline.style.height;
        const remainingTime = getRemainingTime(currentHeight);
        
        // Resume active timeline
        activeTimeline.style.transition = `height ${remainingTime}ms linear`;
        activeTimeline.style.height = "100%";
        
        // Reset inactive timelines
        tabs.forEach((tab, i) => {
          if (i !== state.currentIndex) {
            const timeline = tab.querySelector(SELECTORS.timeline);
            if (timeline) {
              timeline.style.transition = CONFIG.INACTIVE_TRANSITION;
              timeline.style.height = "0%";
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

  // Animation management
  const Animation = {
    initFeedback() {
      const allFeedback = document.querySelectorAll(SELECTORS.feedback);
      gsap.set(allFeedback, { y: 18, opacity: 0 });
    },

    updateContent() {
      const allFeedback = document.querySelectorAll(SELECTORS.feedback);
      gsap.to(allFeedback, {
        y: 8,
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
      });

      setTimeout(() => {
        const activeFeedback = document.querySelectorAll(SELECTORS.activePane);
        if (activeFeedback.length) {
          gsap.to(activeFeedback, {
            y: 0,
            opacity: 1,
            duration: 0.4,
            ease: "power2.out",
            stagger: 0.1,
          });
        }
      }, 150);
    },

    setInitialActive() {
      const activeFeedback = document.querySelectorAll(SELECTORS.activePane);
      if (activeFeedback.length) {
        gsap.set(activeFeedback, { y: 0, opacity: 1 });
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
    },

    setupMutationObserver() {
      const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          if (mutation.type === "attributes" && 
              mutation.attributeName === "class" &&
              mutation.target.classList.contains("customers-tab-pane")) {
            Animation.updateContent();
          }
        });
      });

      document.querySelectorAll(SELECTORS.tabPane).forEach(pane => {
        observer.observe(pane, { 
          attributes: true, 
          attributeFilter: ["class"] 
        });
      });
    }
  };

  // Initialization
  function initialize() {
    Animation.initFeedback();
    Events.setupMutationObserver();
    Events.setupTabClicks();
    Viewport.createObserver();

    setTimeout(() => {
      // Check initial viewport state
      if (isInitiallyInView()) {
        state.isInView = true;
        console.log("Initially in view - starting immediately");
      }

      Animation.setInitialActive();
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

// Mobile functionality (simplified but unchanged)
(() => {
  const MOBILE_BREAKPOINT = 991;
  const isMobile = () => window.innerWidth < MOBILE_BREAKPOINT;

  if (!isMobile()) return;

  const container = document.querySelector(".customers-tabs");
  if (!container) return;

  const tabLinks = Array.from(
    container.querySelector(".w-tab-menu")?.querySelectorAll(".w-tab-link") || []
  );
  const tabPanes = Array.from(document.querySelectorAll(".customers-tab-pane"));

  if (!tabLinks.length || !tabPanes.length) return;

  function transferFeedbackElements() {
    tabPanes.forEach((pane, index) => {
      const transferElement = pane.querySelector(".tabs-feedback_transfer");
      const targetContainer = tabLinks[index]?.querySelector(".tabs-feedback");

      if (transferElement && targetContainer) {
        targetContainer.appendChild(transferElement);
        console.log(`Transferred feedback from pane ${index} to tab link ${index}`);
      }
    });
  }

  function initialize() {
    transferFeedbackElements();
    window.addEventListener("resize", () => {
      if (isMobile()) transferFeedbackElements();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }
})();


if (window.innerWidth > 991) {
  gsap.defaults({ ease: "power2.out", duration: 0.8 });

  gsap.utils.toArray(".feature-bl").forEach((trigger) => {
    gsap.fromTo(
      trigger.querySelectorAll(".tabs-features-feedback-clw"),
      { x: -120, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        stagger: 0.1,
        scrollTrigger: {
          trigger,
          // markers: true,
          start: "20% 80%",
          end: "bottom 80%",
          toggleActions: "play none none reverse",
        },
      }
    );
  });
}

if (window.innerWidth < 990) {
  gsap.defaults({ ease: "power2.out", duration: 0.8 });

  gsap.utils.toArray(".feature-bl").forEach((trigger) => {
    gsap.fromTo(
      trigger.querySelectorAll(".tabs-features-feedback-clw"),
      { y: -80, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        stagger: 0.1,
        scrollTrigger: {
          trigger,
          //markers: true,
          start: "60% 80%",
          end: "bottom 80%",
          toggleActions: "play none none reverse",
        },
      }
    );
  });
}
