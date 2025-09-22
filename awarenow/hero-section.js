document.addEventListener("DOMContentLoaded", function () {
  // Check if this is the first user session
  const hasSeenHeroAnimation = localStorage.getItem('hasSeenHeroAnimation');
  
  if (hasSeenHeroAnimation) {
    // User has already seen the animation, enable scroll and exit
    if (typeof lenis !== 'undefined') {
      lenis.start();
    }
    return;
  }

  // Mark that user has now seen the animation
  localStorage.setItem('hasSeenHeroAnimation', 'true');

  // Check screen size - don't run if smaller than 991px
  if (window.innerWidth < 991) {
    return;
  }

  // Disable scroll at the beginning (assuming lenis is available globally)
  if (typeof lenis !== 'undefined') {
    lenis.stop();
  }

  document
    .querySelectorAll('a[custom-attribute="hero-stag"]')
    .forEach((link) => link.setAttribute("hero-stag", ""));
  
  const heroWrapEl = document.querySelector(".home-hero-tag_bl");
  const aiTagEl = document.querySelector(".ai-tag");
  const heroImgWrapEl = document.querySelector(".home-hero-img_wrap");
  const heroTextStrokeEls = document.querySelectorAll("[hero-text-stroke]");
  const heroIllustrationsWrapEl = document.querySelector(
    ".hero-illustrations_wrap"
  );
  const heroContentItems = document.querySelectorAll("[hero-stag]");
  const findCityHero = document.querySelector(".home-hero-find-city_holder");

  const currentIllustrationsWidth = heroIllustrationsWrapEl.offsetWidth;

  const gsapDurationS = "0.4";
  const gsapDurationL = "1.4";
  const gsapEase = "power2.out";

  // Set initial states
  gsap.set(heroWrapEl, {
    width: 0,
    height: 0,
    borderRadius: 0,
  });

  gsap.set(aiTagEl, {
    opacity: 0,
  });

  gsap.set(heroTextStrokeEls, {
    color: "#ffffff",
    webkitTextStrokeWidth: "1",
  });

  gsap.set(heroImgWrapEl, {
    filter: "blur(30px)",
    xPercent: 50,
  });

  gsap.set(heroContentItems, {
    opacity: 0,
    y: 12,
  });

  gsap.set(findCityHero, {
    height: 0,
  });

  // Create timeline with onComplete to enable scroll
  const tl = gsap.timeline({
    delay: 0.4,
    onComplete: function() {
      // Re-enable scroll after animation completes
      if (typeof lenis !== 'undefined') {
        lenis.start();
      }
    }
  });

  // Text stroke animation: before first animation
  heroTextStrokeEls.forEach((element) => {
    tl.to(
      element,
      {
        color: "#0F183A",
        webkitTextStrokeWidth: 0,
        duration: gsapDurationS,
        ease: gsapEase,
      },
      1
    );
  });

  // Hero illustrations width animation: at the same time as text stroke
  tl.to(
    heroIllustrationsWrapEl,
    {
      width: currentIllustrationsWidth + 200,
      opacity: 0,
      duration: gsapDurationS,
      ease: gsapEase,
    },
    1
  );

  // First animation: width, height, border-radius
  tl.to(
    heroWrapEl,
    {
      width: "var(--_spacing---spacing-utility-rem--7-5rem)",
      height: "var(--_spacing---spacing-utility-rem--4rem)",
      borderRadius: "var(--_spacing---spacing-utility-rem--0-75rem)",
      duration: 0.6,
      ease: gsapEase,
      onComplete: function () {
        const computedStyle = window.getComputedStyle(heroWrapEl);
        gsap.set(heroWrapEl, {
          width: computedStyle.width,
          height: computedStyle.height,
          borderRadius: computedStyle.borderRadius,
        });
      },
    },
    1
  )

    .to(
      aiTagEl,
      {
        opacity: 1,
        duration: 0.3,
        ease: gsapEase,
      },
      "<0.1"
    )

    // Second animation: 1.4s after first animation completes
    .to(
      heroWrapEl,
      {
        width: "100%",
        height: "100%",
        borderRadius: "var(--_spacing---spacing-utility-rem--1rem)",
        duration: gsapDurationL,
        ease: gsapEase,
      },
      "+=1.4"
    )
    .to(
      heroImgWrapEl,
      {
        xPercent: 0,
        duration: gsapDurationL,
        ease: gsapEase,
      },
      "<"
    )

    .to(
      heroImgWrapEl,
      {
        filter: "blur(0px)",
        duration: 0.6,
        ease: gsapEase,
      },
      "<"
    )

    .to(
      aiTagEl,
      {
        opacity: 0,
        duration: 0.5,
        ease: gsapEase,
      },
      "<"
    )

    // Text stroke width animation - all elements at the same time
    .to(
      heroTextStrokeEls,
      {
        width: "520px",
        duration: gsapDurationL,
        ease: gsapEase,
      },
      "<" // Starts at the same time as second animation
    )
    // Hero content items staggered animation: 0.5s after second animation starts
    .to(
      heroContentItems,
      {
        y: 0,
        opacity: 1,
        duration: 1.6,
        ease: gsapEase,
        stagger: 0.1,
      },
      "<0.5"
    )
    .to(
      findCityHero,
      {
        height: "var(--_spacing---spacing-utility-rem--7-5rem)",
        duration: 0.8,
        ease: gsapEase,
      },
      "-=1.4"
    )

    // Text stroke opacity animation - all elements at the same time
    .to(
      heroTextStrokeEls,
      {
        opacity: 0,
        duration: 0.5,
        ease: gsapEase,
      },
      3 // Starts 0.4s after the width animation
    );
});
