// Reusable Navigation Background Controller
function createNavBackground(config) {
  const { wrapSelector, bgSelector, buttonSelector, currentClass = 'w--current', setupDOM = false } = config;
  
  // Find all wrapper elements that match the selector
  const wrappers = document.querySelectorAll(wrapSelector);
  
  wrappers.forEach((navWrap, index) => {
    // Create unique selectors for this specific instance
    const uniqueId = `nav-bg-${Date.now()}-${index}`;
    navWrap.setAttribute('data-nav-id', uniqueId);
    
    const instanceConfig = {
      wrapSelector: `[data-nav-id="${uniqueId}"]`,
      bgSelector,
      buttonSelector,
      currentClass,
      setupDOM
    };
    
    // Setup DOM for this instance if needed
    if (setupDOM) {
      setupDOMForInstance(navWrap, bgSelector);
    }
    
    // Initialize controller for this specific instance
    initializeInstance(instanceConfig, navWrap);
  });
}

// Setup DOM for a specific instance
function setupDOMForInstance(wrapElement, bgSelector) {
  // Check if background element already exists in this instance
  if (wrapElement.querySelector(bgSelector)) return;
  
  // Create background element
  const bgElement = document.createElement('div');
  bgElement.className = bgSelector.replace('.', ''); // Remove the dot from class name
  
  // Add background element to this wrapper
  wrapElement.appendChild(bgElement);
}

// Initialize controller for a specific instance
function initializeInstance(config, navWrapElement) {
  const { wrapSelector, bgSelector, buttonSelector, currentClass } = config;
  
  // DOM elements for this specific instance
  const navWrap = navWrapElement;
  const navBg = navWrap.querySelector(bgSelector);
  const navButtons = navWrap.querySelectorAll(buttonSelector);
  
  if (!navWrap || !navBg || !navButtons.length) return;
  
  // Ensure wrapper has relative positioning
  if (window.getComputedStyle(navWrap).position === 'static') {
    navWrap.style.position = 'relative';
  }
  
  // State for this instance
  let isHoveringNav = false;
  let lastHoveredButton = null;
  
  // Dynamically find current button within this instance
  const getCurrentButton = () => navWrap.querySelector(`${buttonSelector}.${currentClass}`);
  
  // Position background behind target element within wrapper bounds
  function positionBackground(target, instant = false) {
    const rect = target.getBoundingClientRect();
    const wrapRect = navWrap.getBoundingClientRect();
    
    // Calculate position relative to the wrapper
    let left = rect.left - wrapRect.left;
    let top = rect.top - wrapRect.top;
    let width = rect.width;
    let height = rect.height;
    
    // Ensure background stays within wrapper bounds
    const wrapWidth = navWrap.offsetWidth;
    const wrapHeight = navWrap.offsetHeight;
    
    // Constrain position and size to wrapper
    left = Math.max(0, Math.min(left, wrapWidth - width));
    top = Math.max(0, Math.min(top, wrapHeight - height));
    width = Math.min(width, wrapWidth - left);
    height = Math.min(height, wrapHeight - top);
    
    if (instant) {
      navBg.style.transition = 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      navBg.style.width = `${width}px`;
      navBg.style.height = `${height}px`;
      navBg.style.transform = `translate(${left}px, ${top}px)`;
      navBg.offsetHeight; // Force reflow
      setTimeout(() => navBg.style.transition = '', 10);
    } else {
      Object.assign(navBg.style, {
        width: `${width}px`,
        height: `${height}px`,
        transform: `translate(${left}px, ${top}px)`
      });
    }
    
    navBg.style.opacity = '1';
  }
  
  // Hide background
  const hideBackground = () => navBg.style.opacity = '0';
  
  // Check if should use instant positioning
  const shouldBeInstant = () => {
    const currentButton = getCurrentButton();
    const currentOpacity = window.getComputedStyle(navBg).opacity;
    return !currentButton && (currentOpacity === '0' || !lastHoveredButton);
  };
  
  // Event handlers for this instance
  const handleNavEnter = () => isHoveringNav = true;
  
  const handleNavLeave = () => {
    isHoveringNav = false;
    lastHoveredButton = null;
    
    // Always check for current button dynamically
    const currentButton = getCurrentButton();
    currentButton ? positionBackground(currentButton) : hideBackground();
  };
  
  const handleButtonHover = function() {
    positionBackground(this, shouldBeInstant());
    lastHoveredButton = this;
  };
  
  const handleResize = () => {
    if (!isHoveringNav) return;
    
    // Prioritize current button over last hovered
    const currentButton = getCurrentButton();
    const target = currentButton || lastHoveredButton;
    if (target) positionBackground(target);
  };
  
  // Initialize this instance
  const init = () => {
    // Set initial state with dynamic current button check
    const currentButton = getCurrentButton();
    currentButton ? positionBackground(currentButton) : hideBackground();
    
    // Add event listeners for this instance
    navWrap.addEventListener('mouseenter', handleNavEnter);
    navWrap.addEventListener('mouseleave', handleNavLeave);
    navButtons.forEach(btn => btn.addEventListener('mouseenter', handleButtonHover));
    
    // Throttled resize handler (shared across instances but each handles its own state)
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(handleResize, 250);
    });
  };
  
  // Watch for current changes in this instance
  const watchForCurrentChanges = () => {
    const observer = new MutationObserver(() => {
      // If not hovering, update position to new current button
      if (!isHoveringNav) {
        const currentButton = getCurrentButton();
        currentButton ? positionBackground(currentButton) : hideBackground();
      }
    });
    
    // Watch for class changes on all nav buttons in this instance
    navButtons.forEach(button => {
      observer.observe(button, {
        attributes: true,
        attributeFilter: ['class']
      });
    });
  };
  
  init();
  watchForCurrentChanges();
}

// Configuration objects
const navConfig = {
  wrapSelector: '.nav-links_wrap',
  bgSelector: '.nav-links-bg',
  buttonSelector: '.btn[custom-attribute="nav-links"]',
  currentClass: 'w--current'
};

const featuresConfig = {
  wrapSelector: '[custom-tabs="menu"]',
  bgSelector: '.nav-links-bg',
  buttonSelector: '[custom-tabs="link"]',
  currentClass: 'w--current',
  setupDOM: true
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  createNavBackground(navConfig);
  createNavBackground(featuresConfig);
  
  // Add more configurations as needed:
  // createNavBackground(anotherConfig);
});


// Set initial values - be more specific
gsap.set("[step-target='second'] *", { opacity: 0.4 });
gsap.set("[step-target='second'] [steps-child]", { opacity: 1 }); // Override for steps-child
gsap.set("[step-target='third'] *", { opacity: 0.4 });

ScrollTrigger.create({
  trigger: "[step-trigger='first']",
  start: "top 40%",
  end: "top 40%",
//   markers: true,
  fastScrollEnd: true,
  refreshPriority: 1,
  toggleActions: "play none reverse none",
  animation: gsap
    .timeline()
    .to("[step-target='first']", { marginBottom: "-90px", duration: 0.5 })
    .to("[step-target='first'] [steps-child]", { opacity: 0, duration: 0.5 }, 0)
    .to(
      "[step-target='first'] .steps-tl_number-wrap",
      { backgroundColor: "#F6F7F8", duration: 0.5 },
      0
    )
    .to("[step-target='second'] *", { opacity: 1, duration: 0.5 }, 0),
});

ScrollTrigger.create({
  trigger: "[step-trigger='second']",
  start: "top 40%",
  end: "top 40%",
//   markers: true,
  fastScrollEnd: true,
  refreshPriority: 1,
  toggleActions: "play none reverse none",
  animation: gsap
    .timeline()
    .to("[step-target='second']", { marginBottom: "-90px", duration: 0.5 })
    .to("[step-target='second'] [steps-child]", { opacity: 0, duration: 0.5 }, 0) // Goes from 1 to 0, reverses to 1
    .to(
      "[step-target='second'] .steps-tl_number-wrap",
      { backgroundColor: "#F6F7F8", duration: 0.5 },
      0
    )
    .to("[step-target='third'] *", { opacity: 1, duration: 0.5 }, 0),
});

//AUTO ROTATE TAB
const initializeTabRotator = () => {
  document.querySelectorAll('[ms-code-rotate-tabs]').forEach(container => {
    const interval = parseInt(container.getAttribute('ms-code-rotate-tabs'), 10);
    const intervalInSeconds = interval / 1000; // Convert to seconds for GSAP
    const tabLinks = container.querySelectorAll('.w-tab-link');
    const wTabs = container.closest('.w-tabs');
    const tabPanes = wTabs.querySelector('.w-tab-content').querySelectorAll('.w-tab-pane');
    const section = container.closest('.section'); // Find parent section
    
    let currentIndex = [...tabLinks].findIndex(link => link.classList.contains('w--current'));
    let rotationTimer;
    let borderAnimation;
    let isInView = false;
    let isPaused = false;

    // Animation config
    const FADE_DURATION = 0.3; // in seconds for GSAP

    const animateTabBorder = (tabLinks, index) => {
      tabLinks.forEach((link, i) => {
        const border = link.querySelector('.for-citizens_tab-border');
        if (border) {
          gsap.killTweensOf(border);
          gsap.set(border, { width: '0%' }); // Reset width for all
          if (i === index) {
            // Animate width from 0 to 100% for the current tab
            borderAnimation = gsap.fromTo(border,
              { width: '0%' },
              {
                width: '100%',
                duration: intervalInSeconds,
                ease: 'none',
              }
            );
          }
        }
      });
    };

    const pauseAnimations = () => {
      isPaused = true;
      clearInterval(rotationTimer);
      if (borderAnimation) {
        borderAnimation.pause();
      }
    };

    const resumeAnimations = () => {
      if (isPaused) {
        isPaused = false;
        startRotation();
      }
    };

    const switchToTab = (index) => {
      const prevIndex = currentIndex;

      // Fade out current tab
      gsap.to(tabPanes[prevIndex], {
        opacity: 0,
        duration: FADE_DURATION,
        onComplete: () => {
          // Update classes and attributes
          tabLinks[prevIndex].classList.remove('w--current');
          tabLinks[prevIndex].setAttribute('aria-selected', 'false');
          tabLinks[prevIndex].setAttribute('tabindex', '-1');
          tabPanes[prevIndex].classList.remove('w--tab-active');

          // Update current index
          currentIndex = index;

          // Activate new tab
          tabLinks[currentIndex].classList.add('w--current');
          tabLinks[currentIndex].setAttribute('aria-selected', 'true');
          tabLinks[currentIndex].setAttribute('tabindex', '0');
          tabPanes[currentIndex].classList.add('w--tab-active');

          // Animate border for the currently active tab (only if in view)
          if (isInView) {
            animateTabBorder(tabLinks, currentIndex);
          }

          // Fade in new tab
          gsap.to(tabPanes[currentIndex], {
            opacity: 1,
            duration: FADE_DURATION
          });

          // Update data-current attribute
          wTabs?.setAttribute('data-current', tabLinks[currentIndex].getAttribute('data-w-tab'));
        }
      });
    };

    const rotateToNextTab = () => {
      if (!isPaused) {
        const nextIndex = (currentIndex + 1) % tabLinks.length;
        switchToTab(nextIndex);
      }
    };

    const startRotation = () => {
      if (!isPaused && isInView) {
        clearInterval(rotationTimer);
        animateTabBorder(tabLinks, currentIndex); // Start border animation
        rotationTimer = setInterval(rotateToNextTab, interval);
      }
    };

    // Intersection Observer for section visibility
    if (section) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            isInView = entry.isIntersecting;
            
            if (isInView) {
              resumeAnimations();
            } else {
              pauseAnimations();
            }
          });
        },
        {
          threshold: 0.1, // Trigger when 10% of section is visible
          rootMargin: '0px'
        }
      );

      observer.observe(section);
    }

    // Add click handlers
    tabLinks.forEach((link, index) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        if (index !== currentIndex) {
          switchToTab(index);
        }
        if (isInView) {
          startRotation(); // Restart rotation only if in view
        }
      });
    });

    // Initialize only if section is in view
    const checkInitialVisibility = () => {
      if (section) {
        const rect = section.getBoundingClientRect();
        isInView = rect.top < window.innerHeight && rect.bottom > 0;
        
        if (isInView) {
          startRotation();
        }
      } else {
        // If no section found, start normally
        isInView = true;
        startRotation();
      }
    };

    checkInitialVisibility();
  });
};

// Run on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeTabRotator);
} else {
  initializeTabRotator();
}