// USE CASE GSAP - Optimized for mobile performance
function initUseCaseAnimations() {
  if (window.innerWidth >= 479) return;

  const useCaseTriggers = document.querySelectorAll(".use-case-trigger");
  const useCaseCards = document.querySelectorAll(".use-case_card-snap");
  const useCaseCount = Math.min(useCaseTriggers.length, useCaseCards.length);

  if (useCaseCount === 0) return;

  // Configuration
  const useCaseMinScale = 0.3;
  const useCaseMaxScale = 1;
  const useCaseYStep = 24;
  const scrollTriggerStart = "top 328px";
  const scrollTriggerEnd = "bottom 328px";

  // Calculate values once
  const useCaseScaleStep =
    (useCaseMaxScale - useCaseMinScale) / Math.max(useCaseCount - 1, 1);
  const useCaseMinY = -(useCaseCount - 1) * useCaseYStep;

  // Pre-calculate transform values to avoid repeated calculations
  const transformConfigs = [];
  for (let i = 0; i < useCaseCount; i++) {
    transformConfigs[i] = {
      scale: useCaseMinScale + useCaseScaleStep * i,
      y: useCaseMinY + useCaseYStep * i,
      isLastItem: i === useCaseCount - 1,
    };
  }

  // Apply animations with performance optimizations
  useCaseTriggers.forEach((useCaseTrigger, i) => {
    const card = useCaseCards[i];
    const config = transformConfigs[i];

    if (!card) return; // Safety check

    // Force hardware acceleration and optimize rendering
    gsap.set(card, {
      force3D: true,
      transformOrigin: "center center",
      willChange: "transform",
    });

    // Main transform animation with performance optimizations
    gsap.to(card, {
      scale: config.scale,
      y: config.y,
      ease: "none",
      scrollTrigger: {
        trigger: useCaseTrigger,
        start: scrollTriggerStart,
        end: scrollTriggerEnd,
        scrub: 1, // Add slight smoothing to reduce jank
        markers: false,
        invalidateOnRefresh: true,
        // Performance optimizations
        refreshPriority: -1,
        fastScrollEnd: true,
      },
    });

    // Optimize opacity animation for non-last items
    if (!config.isLastItem) {
      // Cache children elements to avoid repeated DOM queries
      const childElements = Array.from(card.children);

      if (childElements.length > 0) {
        // Set initial properties for better performance
        gsap.set(childElements, {
          force3D: true,
          willChange: "opacity",
        });

        gsap.to(childElements, {
          opacity: 0.6,
          ease: "none",
          scrollTrigger: {
            trigger: useCaseTrigger,
            start: scrollTriggerStart,
            end: scrollTriggerEnd,
            scrub: 1,
            markers: false,
            invalidateOnRefresh: true,
            refreshPriority: -1,
            fastScrollEnd: true,
          },
        });
      }
    }
  });
}

// Cleanup function to properly dispose of animations
function cleanupUseCaseAnimations() {
  // Kill all use-case related ScrollTriggers
  ScrollTrigger.getAll()
    .filter((st) => st.trigger?.classList.contains("use-case-trigger"))
    .forEach((st) => st.kill());

  // Reset transforms and styles
  const useCaseCards = document.querySelectorAll(".use-case_card-snap");
  useCaseCards.forEach((card) => {
    gsap.set(card, {
      clearProps: "all",
    });

    // Reset children opacity
    Array.from(card.children).forEach((child) => {
      gsap.set(child, {
        clearProps: "opacity",
      });
    });
  });
}

// Optimized resize handler with better debouncing
let useCaseResizeTimer;
let previousWidth = window.innerWidth;
let isInitialized = false;

function handleResize() {
  clearTimeout(useCaseResizeTimer);

  useCaseResizeTimer = setTimeout(() => {
    const currentWidth = window.innerWidth;
    const shouldBeActive = currentWidth < 479;
    const wasActive = previousWidth < 479;

    // Only reinitialize if crossing the breakpoint
    if (shouldBeActive !== wasActive) {
      if (isInitialized) {
        cleanupUseCaseAnimations();
        isInitialized = false;
      }

      if (shouldBeActive) {
        initUseCaseAnimations();
        isInitialized = true;
      }

      previousWidth = currentWidth;
    }
  }, 150); // Reduced debounce time for better responsiveness
}

// Passive event listener for better performance
window.addEventListener("resize", handleResize, { passive: true });

// Initialize on load with proper error handling
document.addEventListener("DOMContentLoaded", () => {
  try {
    if (window.innerWidth < 479) {
      initUseCaseAnimations();
      isInitialized = true;
    }
  } catch (error) {
    console.warn("Failed to initialize use case animations:", error);
  }
});

// Cleanup on page unload to prevent memory leaks
window.addEventListener("beforeunload", () => {
  if (isInitialized) {
    cleanupUseCaseAnimations();
  }
});