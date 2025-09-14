document.addEventListener("DOMContentLoaded", function () {
    const heroTl = gsap.timeline();

    heroTl.from("[hero-first-trigger]", {
      y: 16,
      opacity: 0,
      duration: 1.2,
    });

    heroTl.from("[hero-second-trigger]", {
      y: 16,
      opacity: 0,
      duration: 1.2,
    }, 0.2);

    heroTl.from("[hero-first-stagger] > *", {
      y: 16,
      opacity: 0,
      duration: 1.2,
      stagger: 0.2,
    }, 0.9);

    heroTl.from("[hero-third-trigger]", {
      opacity: 0,
      duration: 1.8,
    }, 0.2);

    const sections = document.querySelectorAll(".section");

    sections.forEach((section) => {
      const sectionsTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 84%",
          end: "bottom 84%",
          // markers: true,
        },
      });

      sectionsTl.from(section.querySelector("[first-trigger]"), {
        y: 16,
        opacity: 0,
        duration: 1.2,
      });

      sectionsTl.from(section.querySelectorAll("[first-stagger] > *"), {
        y: 16,
        opacity: 0,
        duration: 1.8,
        stagger: 0.2,
        delay: 0.2,
      }, "-=1.1");

      sectionsTl.from(section.querySelector("[second-trigger]"), {
        y: 16,
        opacity: 0,
        duration: 0.8,
      }, 0.2);
    });

    let lastScrollY = window.scrollY;
    window.addEventListener('scroll', () => {
      if (Math.abs(window.scrollY - lastScrollY) > 200) {
        ScrollTrigger.refresh();
        lastScrollY = window.scrollY;
      }
    });
  });
