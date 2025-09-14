
console.log("test-tex");

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const snapFooter = document.querySelector("[snap-footer]");

if (snapFooter && window.lenis) {
  // Centralized settings
  const settings = {
    defaultLerp: 0.1, // Default Lenis lerp value
    minLerp: 0.01, // Minimum lerp for slowest scroll
    slowdownAggression: 300, // Smaller = faster slowdown increase
    maxSlowdown: 2000, // Max slowdown factor (reduced for lerp approach)
    snapDelay: 150, // ms after scroll stop to trigger snap
  };

  // State management
  const state = {
    isInFooter: false,
    isSnapping: false,
    distanceScrolled: 0,
    currentLerp: settings.defaultLerp,
    footerStartY: 0,
    footerEndY: 0,
    scrollTimeout: null,
    scrollDirection: 0,
    lastScrollY: 0,
  };

  const updateFooterPositions = () => {
    const rect = snapFooter.getBoundingClientRect();
    state.footerStartY = window.scrollY + rect.top;
    state.footerEndY = state.footerStartY + snapFooter.offsetHeight;
  };

  const resetScrollState = () => {
    state.distanceScrolled = 0;
    state.currentLerp = settings.defaultLerp;
    updateLenisLerp(settings.defaultLerp);
  };

  // Properly update Lenis lerp by recreating options
  const updateLenisLerp = (newLerp) => {
    // Store current options
    const currentOptions = { ...window.lenis.options };

    // Update with new lerp
    window.lenis.options = {
      ...currentOptions,
      lerp: newLerp,
    };

    // Force Lenis to recognize the change
    window.lenis.setScroll(window.lenis.scroll);
  };

  const calculateSlowdown = () => {
    if (!state.isInFooter || state.scrollDirection <= 0) {
      return settings.defaultLerp;
    }

    // Progressive slowdown calculation
    const slowdownFactor =
      1 + state.distanceScrolled / settings.slowdownAggression;
    const clampedFactor = Math.min(slowdownFactor, settings.maxSlowdown);

    // Convert slowdown factor to lerp value (inverse relationship)
    const newLerp = settings.defaultLerp / clampedFactor;
    return Math.max(newLerp, settings.minLerp);
  };

  const snapToFooterStartBottom = () => {
    if (!state.isInFooter || state.isSnapping) return;

    state.isSnapping = true;
    const targetScroll = state.footerStartY - window.innerHeight;

    // Temporarily increase lerp for snapping
    updateLenisLerp(0.1);

    window.lenis.scrollTo(targetScroll, {
      duration: 0.6,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      force: true,
      onComplete: () => {
        state.isSnapping = false;
        resetScrollState();
      },
    });
  };

  updateFooterPositions();
  window.addEventListener("resize", updateFooterPositions);

  // ScrollTrigger to manage active zone
  ScrollTrigger.create({
    trigger: snapFooter,
    start: "top bottom",
    end: "120% bottom",
    markers: true,
    onEnter: () => {
      state.isInFooter = true;
      state.distanceScrolled = 0;
    },
    onLeave: () => {
      state.isInFooter = false;
      resetScrollState();
    },
    onEnterBack: () => {
      state.isInFooter = true;
      state.distanceScrolled = 0;
    },
    onLeaveBack: () => {
      state.isInFooter = false;
      resetScrollState();
    },
  });

  // Track scroll direction and distance
  let rafId;
  const updateScroll = () => {
    const currentScroll = window.lenis.scroll;
    state.scrollDirection =
      currentScroll > state.lastScrollY
        ? 1
        : currentScroll < state.lastScrollY
        ? -1
        : 0;

    if (state.isInFooter && !state.isSnapping) {
      if (state.scrollDirection > 0) {
        // Accumulate distance when scrolling down
        state.distanceScrolled += Math.abs(currentScroll - state.lastScrollY);

        // Calculate and apply new lerp
        const newLerp = calculateSlowdown();
        if (Math.abs(newLerp - state.currentLerp) > 0.001) {
          state.currentLerp = newLerp;
          updateLenisLerp(newLerp);
        }

        // Reset snap timeout
        clearTimeout(state.scrollTimeout);
        state.scrollTimeout = setTimeout(
          snapToFooterStartBottom,
          settings.snapDelay
        );
      } else if (state.scrollDirection < 0) {
        // Reset to normal speed when scrolling up
        if (state.currentLerp !== settings.defaultLerp) {
          state.currentLerp = settings.defaultLerp;
          updateLenisLerp(settings.defaultLerp);
        }
        state.distanceScrolled = Math.max(
          0,
          state.distanceScrolled - Math.abs(currentScroll - state.lastScrollY)
        );
      }
    }

    state.lastScrollY = currentScroll;
    rafId = requestAnimationFrame(updateScroll);
  };

  // Start the update loop
  updateScroll();

  // Clean up on destroy
  window.addEventListener("beforeunload", () => {
    cancelAnimationFrame(rafId);
  });

  // Alternative approach: Modify wheel multiplier instead of lerp
  /*
  window.lenis.on('wheel', (e) => {
    if (state.isInFooter && !state.isSnapping && e.direction > 0) {
      const slowdownFactor = 1 + (state.distanceScrolled / settings.slowdownAggression);
      const clampedFactor = Math.min(slowdownFactor, settings.maxSlowdown);
      
      // Reduce wheel multiplier
      window.lenis.options.wheelMultiplier = 1 / clampedFactor;
    } else {
      window.lenis.options.wheelMultiplier = 1;
    }
  });
  */
}

// Scale animation remains the same
const scaleTarget = document.querySelector(".footer-bg_wrap");

// Alternative: Virtual Scroll Approach
if (snapFooter && window.lenis) {
  const settings = {
    slowdownAggression: 3,
    maxSlowdown: 50,
    snapDelay: 150,
  };

  const state = {
    isInFooter: false,
    isSnapping: false,
    distanceScrolled: 0,
    slowdownFactor: 1,
  };

  // Override Lenis virtual scroll
  const originalVirtualScroll = window.lenis.virtualScroll.onScroll;

  window.lenis.virtualScroll.onScroll = function (e) {
    if (state.isInFooter && !state.isSnapping && e.deltaY > 0) {
      // Calculate slowdown
      state.distanceScrolled += Math.abs(e.deltaY);
      state.slowdownFactor =
        1 + state.distanceScrolled / settings.slowdownAggression;
      state.slowdownFactor = Math.min(
        state.slowdownFactor,
        settings.maxSlowdown
      );

      // Apply slowdown to delta
      e.deltaY = e.deltaY / state.slowdownFactor;
      e.velocity = e.velocity / state.slowdownFactor;
    }

    // Call original handler with modified event
    originalVirtualScroll.call(this, e);
  };

  // Sync ScrollTrigger with Lenis
  if (window.lenis) {
    window.lenis.on("scroll", ScrollTrigger.update);

    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value) {
        return arguments.length
          ? window.lenis.scrollTo(value, { immediate: true })
          : window.lenis.scroll;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
    });
  }
}



// SNAP SCROLL
//   gsap.registerPlugin(ScrollTrigger);

// const sections = document.querySelectorAll('.section:not([skip-snap])');
// const offset = -140; // px

// // Calculate the snap points (section top minus offset)
// const snapPoints = Array.from(sections).map(section => section.offsetTop - offset);
// const scrollMax = document.documentElement.scrollHeight - window.innerHeight;

// sections.forEach(section => {
//   ScrollTrigger.create({
//     trigger: section,
//       start: "-40px 0%",
//       end: "100px 0%",
//     snap: {
//       // Snap to the closest section top minus offset, as a progress value
//       snapTo: (rawProgress, self) => {
//         const scroll = self.scroll();
//         // Find the closest snap point
//         let closest = snapPoints.reduce((prev, curr) =>
//           Math.abs(curr - scroll) < Math.abs(prev - scroll) ? curr : prev
//         );
//         // Convert px position to progress (0-1)
//         return closest / scrollMax;
//       },
//       duration: { min: 0.2, max: 1.8 },
//       ease: "power1.inOut"
//     },
//     markers: true
//   });
// });