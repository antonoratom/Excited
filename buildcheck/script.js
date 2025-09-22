    // Wait for the DOM to be fully loaded
    document.addEventListener('DOMContentLoaded', function() {

    // Set initial states for all bg-stage elements
    gsap.set("[bg-stage='one'], [bg-stage='two'], [bg-stage='three'], [bg-stage='four'], [bg-stage='five']", {
    scale: 0.8,
    opacity: 0
    });

    // Set initial states for hero images
    gsap.set(".hero-image-fg", {
    scale: 0.9,
    opacity: 0
    });

    gsap.set(".hero-h_wrap", {
    x: 24,
    opacity: 0
    });

    // Create timeline for sequenced animations
    const tl = gsap.timeline();

    // Animate each stage with progressive delays
    tl.to("[bg-stage='one']", {
    scale: 1,
    opacity: 1,
    duration: 0.9,
    ease: "power2.out"
    })
    .to("[bg-stage='two']", {
    scale: 1,
    opacity: 1,
    duration: 0.9,
    ease: "power2.out"
    }, 0.2)
    .to("[bg-stage='three']", {
    scale: 1,
    opacity: 1,
    duration: 0.9,
    ease: "power2.out"
    }, 0.4)
    .to("[bg-stage='four']", {
    scale: 1,
    opacity: 1,
    duration: 0.9,
    ease: "power2.out"
    }, 0.6)
    .to("[bg-stage='five']", {
    scale: 1,
    opacity: 1,
    duration: 0.9,
    ease: "power2.out"
    }, 0.8)

    .to(".hero-image-fg", {
    scale: 1,
    opacity: 1,
    duration: 0.9,
    ease: "power2.out",
    stagger: 0.3
    }, .6)

    .to(".hero-h_wrap", {
    x: 0,
    opacity: 1,
    duration: 1.2,
    ease: "power2.out",
    }, .6);
    });


    (function() {
    const ROTATION_INTERVAL = 7000;
    const ACTIVE_TRANSITION = 'height 7s linear';
    const INACTIVE_TRANSITION = 'height 0.2s ease';

    const container = document.querySelector('.customers-tabs');
    if (!container) return;

    const tabs = Array.from(
    container.querySelector('.w-tab-menu')?.querySelectorAll('.w-tab-link') ||
    container.querySelectorAll('[data-w-tab].w-tab-link') ||
    container.querySelectorAll('.w-tab-link')
    ).filter(tab => tab.offsetParent && tab.hasAttribute('data-w-tab'));

    if (!tabs.length) return;

    let currentIndex = 0;
    let autoInterval = null;
    let isAutoRotating = false;

    // Timeline management
    const setTimeline = (element, height, transition = INACTIVE_TRANSITION) => {
    if (!element) return;
    element.style.transition = transition;
    element.style.height = height;
    };

    const resetTimelines = () => {
    tabs.forEach(tab => {
    const timeline = tab.querySelector('.tab-tl_item');
    if (timeline) {
    timeline.style.transition = 'none';
    timeline.style.height = '0%';
    }
    });
    container.offsetHeight;
    };

    const updateTimelines = (activeIndex) => {
    resetTimelines();

    requestAnimationFrame(() => {
    tabs.forEach((tab, i) => {
    const timeline = tab.querySelector('.tab-tl_item');
    setTimeline(
        timeline,
        i === activeIndex ? '100%' : '0%',
        i === activeIndex ? ACTIVE_TRANSITION : INACTIVE_TRANSITION
    );
    });
    });
    };

    // GSAP animations triggered by DOM changes
    const animateTabContent = () => {
    // Animate out all feedback elements
    const allFeedback = document.querySelectorAll('.tabs-feedback-clw');
    gsap.to(allFeedback, {
    y: 8,
    opacity: 0,
    duration: 0.3,
    ease: "power2.in"
    });

    // Animate in active feedback elements
    setTimeout(() => {
    const activePanes = document.querySelectorAll('.customers-tab-pane.w--tab-active .tabs-feedback-clw');
    if (activePanes.length) {
    gsap.to(activePanes, {
        y: 0,
        opacity: 1,
        duration: 0.4,
        ease: "power2.out",
        stagger: 0.1
    });
    }
    }, 150);
    };

    // Watch for changes to tab panes
    const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
    const target = mutation.target;
    if (target.classList.contains('customers-tab-pane')) {
        // Tab pane class changed, animate content
        animateTabContent();
    }
    }
    });
    });

    // Observe all tab panes for class changes
    const startObserver = () => {
    const tabPanes = document.querySelectorAll('.customers-tab-pane');
    tabPanes.forEach(pane => {
    observer.observe(pane, { attributes: true, attributeFilter: ['class'] });
    });
    };

    // Auto-rotation
    const nextTab = () => {
    isAutoRotating = true;
    currentIndex = (currentIndex + 1) % tabs.length;

    // Update timeline immediately
    updateTimelines(currentIndex);

    // Click the tab
    tabs[currentIndex].click();

    setTimeout(() => {
    isAutoRotating = false;
    }, 100);
    };

    const startRotation = () => {
    clearInterval(autoInterval);
    autoInterval = setInterval(nextTab, ROTATION_INTERVAL);
    };

    const stopRotation = () => {
    clearInterval(autoInterval);
    autoInterval = null;
    };

    // Manual click handling - minimal interference
    tabs.forEach((tab, index) => {
    tab.addEventListener('click', (e) => {
    if (e.isTrusted && !isAutoRotating) {
    stopRotation();
    currentIndex = index;
    updateTimelines(currentIndex);

    // Restart rotation after manual click
    setTimeout(startRotation, 1000);
    }
    });
    });

    // Initialize
    const initialize = () => {
    // Set initial state for all feedback elements
    const allFeedback = document.querySelectorAll('.tabs-feedback-clw');
    gsap.set(allFeedback, { y: 18, opacity: 0 });

    // Start observing
    startObserver();

    // Set initial active state
    setTimeout(() => {
    const activeFeedback = document.querySelectorAll('.customers-tab-pane.w--tab-active .tabs-feedback-clw');
    if (activeFeedback.length) {
    gsap.set(activeFeedback, { y: 0, opacity: 1 });
    }
    updateTimelines(0);
    startRotation();
    }, 200);
    };

    initialize();
    })();


    (() => {
    const MOBILE_BREAKPOINT = 991;

    const isMobile = () => window.innerWidth < MOBILE_BREAKPOINT;

    if (!isMobile()) return;

    const container = document.querySelector('.customers-tabs');
    if (!container) return;

    // Get tab elements
    const tabLinks = Array.from(
    container.querySelector('.w-tab-menu')?.querySelectorAll('.w-tab-link') || []
    );

    const tabPanes = Array.from(
    document.querySelectorAll('.customers-tab-pane')
    );

    if (!tabLinks.length || !tabPanes.length) return;

    // Transfer function
    const transferFeedbackElements = () => {
    tabPanes.forEach((pane, index) => {
    const transferElement = pane.querySelector('.tabs-feedback_transfer');
    const targetContainer = tabLinks[index]?.querySelector('.tabs-feedback');

    if (transferElement && targetContainer) {
    targetContainer.appendChild(transferElement);
    console.log(`Transferred feedback from pane ${index} to tab link ${index}`);
    }
    });
    };

    // Handle resize events
    const handleResize = () => {
    if (isMobile()) {
    transferFeedbackElements();
    }
    };

    // Initialize
    const init = () => {
    transferFeedbackElements();
    window.addEventListener('resize', handleResize);
    };

    // Run when DOM is ready
    if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
    } else {
    init();
    }
    })();

    if (window.innerWidth > 991) {
    gsap.defaults({ ease: "power2.out", duration: 0.8 });

    gsap.utils.toArray(".feature-bl").forEach(trigger => {
    gsap.fromTo(trigger.querySelectorAll(".tabs-features-feedback-clw"),
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
    toggleActions: "play none none reverse" 
    }
    }
    );
    });
    }