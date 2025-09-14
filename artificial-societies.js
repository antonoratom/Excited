console.log("test");

// Simple mobile-only use case animations
function initUseCaseAnimations() {
  if (window.innerWidth >= 479) return;

  const useCaseTriggers = document.querySelectorAll(".use-case-trigger");
  const useCaseCards = document.querySelectorAll(".use-case_card-snap");
  const useCaseCount = Math.min(useCaseTriggers.length, useCaseCards.length);

  // Basic configuration
  const minScale = 0.3;
  const maxScale = 1;
  const yStep = 24;
  
  useCaseTriggers.forEach((trigger, i) => {
    const card = useCaseCards[i];
    
    // Calculate scale and position
    const scale = minScale + ((maxScale - minScale) / (useCaseCount - 1)) * i;
    const y = -(useCaseCount - 1) * yStep + yStep * i;
    
    // Simple transform animation
    gsap.to(card, {
      scale: scale,
      y: y,
      ease: "none",
      scrollTrigger: {
        trigger: trigger,
        start: "top 328px",
        end: "bottom 328px",
        scrub: true,
        markers: false
      }
    });
    
    // Only apply opacity to non-last items
    if (i < useCaseCount - 1) {
      gsap.to(card.children, {
        opacity: 0.6,
        ease: "none",
        scrollTrigger: {
          trigger: trigger,
          start: "top 328px",
          end: "bottom 328px",
          scrub: true
        }
      });
    }
  });
}

// Initialize on load
document.addEventListener("DOMContentLoaded", () => {
  if (window.innerWidth < 479) {
    initUseCaseAnimations();
  }
});


// Get all swipers with the class
const swiperElements = document.querySelectorAll(".pricing-mob-swiper.swiper");

// Function to initialize Swiper
function initializeSwiper() {
  swiperElements.forEach((swiperElement) => {
    const pricingSwiper = new Swiper(swiperElement, {
      grabCursor: true,
      loop: false,
      slidesPerView: 1.15,
      spaceBetween: 8,
      // Navigation arrows
      // navigation: {
      //   nextEl: "[swiper-next]",
      //   prevEl: "[swiper-prev]",
      // },
    });
  });
}

// Check window width and initialize Swiper if less than 991px
if (window.innerWidth < 991) {
  initializeSwiper();
}

// Optional: Re-initialize Swiper on window resize
window.addEventListener("resize", () => {
  if (window.innerWidth < 991) {
    initializeSwiper();
  }
  if (window.innerWidth > 991) {
    runSnapping();
  }
});

//FEATURES GSAP START
// Define your triggers and targets in order
const triggers = [
  "[features-trigger='first']",
  "[features-trigger='second']",
  "[features-trigger='third']",
  "[features-trigger='fourth']",
];

const targets = [
  "[features-target='first']",
  "[features-target='second']",
  "[features-target='third']",
  "[features-target='fourth']",
];

const scales = [0.85, 0.9, 0.95, 1];
const ys = [-64, -48, -24, 0];

triggers.forEach((trigger, i) => {
  gsap.to(targets[i], {
    scale: scales[i],
    y: ys[i],
    ease: "none",
    scrollTrigger: {
      trigger: trigger,
      start: "top 20%",
      end: "bottom 20%",
      scrub: true,
      //markers: true,
    },
  });

  // Animate opacity of each child of the target
  gsap.to(`${targets[i]} > *`, {
    opacity: 0.2,
    duration: 0.3,
    ease: "none",
    scrollTrigger: {
      trigger: trigger,
      start: "top 20%",
      end: "bottom 20%",
      scrub: true,
      markers: false, // Markers only needed once
    },
  });
});
//FEATURES GSAP END

if (window.innerWidth > 991) {
  // First, load the Lottie library
  const script = document.createElement("script");
  script.src =
    "https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.12.2/lottie.min.js";
  document.head.appendChild(script);
  script.onload = function () {
    // Animation configurations
    const animations = [
      {
        container: document.getElementById("lottie-blue"),
        path: "https://cdn.prod.website-files.com/686a45da3b2db2c31950e0a5/686eb24fdbbd35b6fc9221cd_981666f7f7237753dd1ba3ac82755fab_Blue%20Pillar.json",
        name: "blue-animation",
      },
      {
        container: document.getElementById("lottie-green"),
        path: "https://cdn.prod.website-files.com/686a45da3b2db2c31950e0a5/686eb24f58915d6424674cdf_ded0a9aaa6bdbe5fd5305e629d6d8758_Green%20Pillar%20Lottie%20Animation.json",
        name: "green-animation",
      },
      {
        container: document.getElementById("lottie-orange"),
        path: "https://cdn.prod.website-files.com/686a45da3b2db2c31950e0a5/686eb24faf2f55d55aa63143_b2bf68b6bccc7fbe270905b74cb14298_Orange%20Pillar.json",
        name: "orange-animation",
      },
      {
        container: document.getElementById("lottie-purple"),
        path: "https://cdn.prod.website-files.com/686a45da3b2db2c31950e0a5/686eb24f109820f7ec80c467_37966e63091d648f21ea3b1d4a48f849_Purple%20Pillar.json",
        name: "purple-animation",
      },
    ];
    // Load each animation
    animations.forEach((config) => {
      const anim = lottie.loadAnimation({
        container: config.container,
        renderer: "svg",
        loop: false, // Animation won't loop
        autoplay: false,
        path: config.path,
        name: config.name,
      });
      // Stop animation initially
      anim.stop();

      // Track if animation is playing
      let isPlaying = false;

      // Add hover in event
      config.container.addEventListener("mouseenter", () => {
        // Only start animation if it's not currently playing
        if (!isPlaying) {
          isPlaying = true;
          anim.goToAndStop(0, true); // Go to frame 0
          anim.play();
        }
      });

      // Listen for animation complete
      anim.addEventListener("complete", () => {
        isPlaying = false;
        anim.stop();
      });

      // No mouseleave event needed
    });
  };
}

const words = [
  "Social Media",
  "Blog Posts",
  "Product Features",
  "Websites",
  "Video Scripts",
  "Thumbnails",
];
let wordIndex = 0;
const pauseDuration = 1400; // Visible time (ms)
const slideDuration = 250; // Animation duration (ms)

// Add CSS for responsive line break
const style = document.createElement("style");
style.textContent = `
    @media (max-width: 990px) {
        .h1-hero {
            white-space: normal;
            text-align: left;
        }
    }
`;
document.head.appendChild(style);

initializeSlider();

function initializeSlider() {
  const originalTextEl = document.getElementById("slider-text");
  const parentContainer = originalTextEl.parentElement;

  // Remove any existing second element
  const existingSecond = parentContainer.querySelector(
    ".slider-second-element"
  );
  if (existingSecond) {
    existingSecond.remove();
  }

  // Create the second text element dynamically
  const secondTextEl = document.createElement("span");
  secondTextEl.className = "dynamic-hero-h slider-second-element"; // Added class for identification
  secondTextEl.style.position = "absolute";
  secondTextEl.style.opacity = "0";
  secondTextEl.style.transform = "translateY(100%)";

  // Make the parent container relative positioned to contain absolute elements
  parentContainer.style.position = "relative";

  // Insert the second element right after the original
  parentContainer.insertBefore(secondTextEl, originalTextEl.nextSibling);

  let currentElement = originalTextEl;
  let nextElement = secondTextEl;

  function setWord(element, word) {
    element.innerText = word;
  }

  function slideIn(element, callback) {
    element.style.transition = "none";
    element.style.opacity = 0;
    element.style.transform = "translateY(100%)";

    // Force reflow
    void element.offsetWidth;

    element.style.transition = `opacity ${slideDuration}ms ease, transform ${slideDuration}ms ease`;
    element.style.opacity = 1;
    element.style.transform = "translateY(0%)";
    if (callback) setTimeout(callback, slideDuration);
  }

  function slideOut(element, callback) {
    element.style.transition = `opacity ${slideDuration}ms ease, transform ${slideDuration}ms ease`;
    element.style.opacity = 0;
    element.style.transform = "translateY(-100%)";
    if (callback) setTimeout(callback, slideDuration);
  }

  function cycleWords() {
    // After pause, start the next word animation
    setTimeout(() => {
      // Get the next word
      const nextWordIndex = (wordIndex + 1) % words.length;
      const nextWord = words[nextWordIndex];
      setWord(nextElement, nextWord);

      // Start both animations simultaneously
      slideOut(currentElement);
      slideIn(nextElement);

      // Swap elements and update index
      [currentElement, nextElement] = [nextElement, currentElement];
      wordIndex = nextWordIndex;

      // Continue cycle
      setTimeout(cycleWords, slideDuration);
    }, pauseDuration);
  }

  // Initialize the first word
  setWord(currentElement, words[wordIndex]);
  slideIn(currentElement);

  // Start the cycle
  setTimeout(cycleWords, slideDuration + pauseDuration);
}

//SWIPER CONTROLLER
const swiperContainer = document.querySelector(".testiminials-wrap.swiper");
const testimonialSwiper = new Swiper(swiperContainer, {
  grabCursor: true,
  loop: false,
  breakpoints: {
    200: { slidesPerView: 1.1 },
    480: { slidesPerView: 1.6 },
    768: { slidesPerView: 2.1 },
    991: { slidesPerView: 2.4 },
  },
  // Navigation arrows
  navigation: {
    nextEl: "[swiper-next]",
    prevEl: "[swiper-prev]",
  },
});

//VIDEO CONTROLLERS
const videos = document.querySelectorAll(".features_bl video");

videos.forEach((video) => {
  video.setAttribute("muted", "true");
  video.setAttribute("playsinline", "true");

  ScrollTrigger.create({
    trigger: video,
    start: "top 65%",
    end: "bottom 55%",
    toggleActions: "play pause play pause",
    // markers: true,
    onToggle: (self) => {
      if (self.isActive) {
        video.play().catch((e) => console.log("Play failed:", e));
      } else {
        video.pause();
      }
    },
  });
});

// SIMPLIFIED: Tab video control with visibility check
function setupTabVideos() {
  const tabVideos = document.querySelectorAll(
    ".how-it-works_tab-link video, .how-it-works_tab-pane video"
  );

  tabVideos.forEach((video) => {
    video.setAttribute("muted", "true");
    video.setAttribute("playsinline", "true");

    let scrollTrigger;

    // Function to check all conditions
    function checkVideoState() {
      const tabLink = video.closest(".how-it-works_tab-link");
      const tabPane = video.closest(".how-it-works_tab-pane");

      const isTabActive =
        (tabLink && tabLink.classList.contains("w--current")) ||
        (tabPane && tabPane.classList.contains("w--tab-active"));

      const rect = video.getBoundingClientRect();
      const isInView = rect.top < window.innerHeight && rect.bottom > 0;

      if (isTabActive && isInView) {
        if (video.paused) {
          video.currentTime = 0;
          video.play().catch((e) => console.log("Tab video play failed:", e));
        }
      } else {
        if (!video.paused) {
          video.pause();
        }
        if (!isTabActive) {
          video.currentTime = 0;
        }
      }
    }

    // Create ScrollTrigger to monitor visibility
    scrollTrigger = ScrollTrigger.create({
      trigger: video,
      start: "top bottom",
      end: "bottom top",
      onUpdate: checkVideoState,
      onToggle: checkVideoState,
    });

    // Also check on tab changes
    video.checkState = checkVideoState;
  });

  // Watch for tab changes
  const observer = new MutationObserver(() => {
    tabVideos.forEach((video) => {
      if (video.checkState) video.checkState();
    });
  });

  const tabContainer =
    document.querySelector(".how-it-works_tabs") || document.body;
  observer.observe(tabContainer, {
    attributes: true,
    attributeFilter: ["class"],
    subtree: true,
  });

  // Initial check
  tabVideos.forEach((video) => {
    if (video.checkState) video.checkState();
  });
}

setupTabVideos();

document.addEventListener("DOMContentLoaded", () => {
  const heroTl = gsap.timeline();
  const heroScrubTl = gsap.timeline({
    scrollTrigger: {
      trigger: "[hero-section]",
      start: "top top",
      end: "bottom top",
      scrub: true,
    },
  });

  heroScrubTl
    .to("[hero-notification-first]", { y: "-5rem", duration: 0.7 })
    .to("[hero-notification-second]", { y: "-3rem", duration: 0.7 }, 0)
    .to("[hero-hand-bl]", { y: "3rem", duration: 0.7 }, 0);

  heroTl
    .from("[hero-first-trigger]", { y: 16, opacity: 0, duration: 0.9 })
    .from("[hero-second-trigger]", { y: 16, opacity: 0, duration: 0.9 }, 0.14)
    .from(
      "[hero-first-stagger] > *",
      { y: 16, opacity: 0, duration: 0.9, stagger: 0.14 },
      0.6
    )

    .from("[hero-third-trigger]", { opacity: 0, duration: 1.4 }, 0.2);

  document.querySelectorAll(".section").forEach((section) => {
    const sectionsTl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 80%",
        end: "bottom 80%",
        // markers: true,
      },
    });

    sectionsTl
      .from(section.querySelector("[first-trigger]"), {
        y: 16,
        opacity: 0,
        duration: 0.6,
      })
      .from(
        section.querySelectorAll("[first-stagger] > *"),
        { y: 16, opacity: 0, duration: 0.7, stagger: 0.1, delay: 0.1 },
        "-=.6"
      )
      .from(
        section.querySelectorAll("[second-stagger] > *"),
        { y: 16, opacity: 0, duration: 0.7, stagger: 0.1, delay: 0.1 },
        0.8
      )

      .from(
        section.querySelector("[second-trigger]"),
        { y: 16, opacity: 0, duration: 0.4 },
        0.1
      )

      .from(
        section.querySelector("[third-trigger]"),
        { y: 16, opacity: 0, duration: 0.4 },
        0.2
      );
  });

  let scrollTimeout;
  window.addEventListener("scroll", () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    }, 1600);
  });
});

let poWrap = gsap.timeline({
  defaults: { duration: 1 },
  scrollTrigger: {
    trigger: "[po-wrap]",
    start: "top 90%",
    end: "bottom 90%",
    //markers: true,
  },
});

poWrap.from(
  "[po-stagger] > *",
  {
    x: "-8%",
    scale: 0.97,
    opacity: 0,
    duration: 1.2,
    ease: "power4.out",
    stagger: 0.1,
    delay: 0.1,
  },
  0.3
);

// Check if screen is smaller than 991px and add event listener
function handleHeaderLinksClick() {
  // Remove any existing listeners to avoid duplicates
  document.querySelectorAll(".header-links_item").forEach((item) => {
    item.removeEventListener("click", clickHandler);
  });

  // Only add listeners if screen is smaller than 991px
  if (window.innerWidth < 991) {
    document.querySelectorAll(".header-links_item").forEach((item) => {
      item.addEventListener("click", clickHandler);
    });
  }
}

// Click handler function
function clickHandler() {
  const burgerMenu = document.querySelector(".burger-menu");
  if (burgerMenu) {
    burgerMenu.click();
  }
}

// Run on page load
handleHeaderLinksClick();

// Re-run on window resize to add/remove listeners based on screen size
window.addEventListener("resize", handleHeaderLinksClick);

// Create the animation function
function createTableAnimation() {
  const tableItems = document.querySelectorAll(".table-chart_table > *");
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: "#accuracy",
      start: "top 60%",
      end: "bottom 60%",
      // markers: true,
      once: true, // Animation runs only once
      onEnter: () => console.log("Animation started"), // Optional: for debugging
    },
  });

  // Loop through each child item with stagger
  tableItems.forEach((item, index) => {
    const percent = item.querySelector(".table-chart_percent");
    const bar = item.querySelector(".table-chart_bar");
    const nameWrap = item.querySelector(".table-chart_name-wrap");

    // Get the initial values
    const initialPercent = parseFloat(percent.textContent) || 0;
    const initialBarWidth = bar.offsetWidth || gsap.getProperty(bar, "width");

    // Store initial values and set starting states
    gsap.set(bar, { width: 0 });
    gsap.set(nameWrap, { opacity: 0, x: -16 });
    percent.textContent = "0";

    // Create animations for this row with stagger delay
    const rowDelay = index * 0.2;

    // 1. Counter animation (1.2s)
    tl.to(
      percent,
      {
        textContent: initialPercent,
        duration: 2.2,
        ease: "power2.out",
        snap: { textContent: 1 },
        onUpdate: function () {
          percent.textContent = Math.round(this.targets()[0].textContent);
        },
      },
      rowDelay
    );

    // 2. Bar width animation (1.2s, same time as counter)
    tl.to(
      bar,
      {
        width: initialBarWidth,
        duration: 2.2,
        ease: "power2.out",
      },
      rowDelay
    );

    // 3. Name opacity and position animation (0.6s with 0.2s delay)
    tl.to(
      nameWrap,
      {
        opacity: 1,
        x: 0,
        duration: 0.6,
        ease: "power2.out",
      },
      rowDelay + 0.4
    );
  });
}

// Call the function when DOM is ready
createTableAnimation();
