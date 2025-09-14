let scrollCounter = 1;
let macyInstance;
let numItems = 0;

window.addEventListener('scroll', function() {
    const scrollPosition = window.scrollY;
    const scrollIncrement = scrollCounter * window.innerHeight;

    if (scrollPosition >= scrollIncrement) {
        console.log('You scrolled ' + scrollIncrement + ' from the top');

        // Recalculate Macy grid container height
        const masonryContainer = document.getElementById('masonry');
        if (masonryContainer) {
            const contentHeight = masonryContainer.offsetHeight; // Get the height of the content
            masonryContainer.style.height = contentHeight + 'px'; // Set the height of the container to match the content height
            console.log('Macy grid height recalculated to ' + contentHeight + 'px');
        }

        // Update the scroll counter for the next 100vh increment
        scrollCounter++;
    }
});

// Initialize Macy grid
if (window.matchMedia("(min-width: 700px)").matches) {
    document.addEventListener("DOMContentLoaded", () => {
        initializeMacyGrid();
        updateMacyGrid();
        const observer = new MutationObserver(updateMacyGrid);
        observer.observe(document.querySelector("#masonry"), { childList: true });
        setTimeout(function() {
            initializeMacyGrid();
            updateMacyGrid();
        }, 5000);
    });
}

function initializeMacyGrid() {
    if (macyInstance) {
        macyInstance.on();
        macyInstance.reInit();
    } else {
        macyInstance = Macy({
            container: "#masonry",
            margin: 16,
            columns: 4,
            breakAt: {
                991: 3,
                767: 2,
                479: 1,
            },
        });
    }
}

function updateMacyGrid() {
    const currentNumItems = document.querySelectorAll("#masonry > div").length;
    if (currentNumItems !== numItems) {
        numItems = currentNumItems;
        if (macyInstance) {
            macyInstance.remove();
            macyInstance = null;
        }
        initializeMacyGrid();
        setTimeout(initializeMacyGrid, 500);
    }
}

//Rest of the code
$(".add-wrap").on("click", function () {
  $(this).toggleClass("active");
});

window.addEventListener("DOMContentLoaded", (event) => {
  $(".filters-btn").on("click", function () {
    $(".items-wrap").css("z-index", "2");
    console.log("z-index", "2");
  });
  $(".apply-filters-cta").on("click", function () {
    $(".items-wrap").css("z-index", "1");
    console.log("z-index", "1");
  });

  $(".radio-main-cat-label, .clear-simulation, .radio-label").on(
    "click",
    function () {
      $(".items-cli").addClass("is-loading");

      setTimeout(function () {
        $(".items-cli").removeClass("is-loading");
      }, 750);
    }
  );
  $(".clear-simulation").each(function () {
    $(this).on("click", function () {
      setTimeout(function () {
        $(".clear-all").click();
      }, 350);
    });
  });

  $(".radio-main-cat-label").each(function () {
    $(this).on("click", function () {
      setTimeout(function () {
        $(".radio-input.hide.all").click();
      }, 350);
    });
  });

  // Split text into spans
  let typeSplit = new SplitType("[text-split]", {
    types: "words, chars",
    tagName: "span",
  });

  // LINE WITH TEXT UNDER THE HEADER
  $(".header-wrap").each(function (index) {
    let tl = gsap.timeline({ paused: true });
    tl.to($(this).find("[words-slide-up] .word"), {
      opacity: 0,
      yPercent: -100,
      duration: 0.5,
      ease: "back.out(2)",
      stagger: { amount: 0.2 },
    });
    ScrollTrigger.create({
      trigger: $(this),
      start: "5% top",
      onEnter: () => tl.play(),
      onLeaveBack: () => tl.reverse(),
    });
  });

  // LINE WITH TEXT ON THE RIGHT
  $(".subscribe-p-bl").each(function (index) {
    let tl = gsap.timeline({ paused: true });
    tl.from($(this).find("[words-slide-up] .word"), {
      opacity: 0,
      yPercent: -100,
      duration: 0.5,
      ease: "back.out(2)",
      stagger: { amount: 0.2 },
    });
    ScrollTrigger.create({
      trigger: $(this),
      start: "10% top",
      onEnter: () => tl.play(),
      onLeaveBack: () => tl.reverse(),
    });
  });

  // BEEN motion
  if (window.innerWidth > 991) {
    // Code to execute for screens higher than 991px
    $(".header-wrap").each(function () {
      let scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: $(this),
          start: "5% top",
          end: "25% bottom",
          // play pause resume reset restart complete reverse none
          onEnter: () => scrollTl.play(),
          onLeaveBack: () => scrollTl.reverse(),
        },
      });
      scrollTl.to($(this).find(".been-bl"), {
        scale: 0.7,
        ease: "power4.Out",
        duration: 0.4,
        x: "-36vw",
      });
    });
  } else {
    // Code to execute for screens 991px or lower
    $(".header-wrap").each(function () {
      let scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: $(this),
          start: "5% top",
          end: "25% bottom",
          // play pause resume reset restart complete reverse none
          onEnter: () => scrollTl.play(),
          onLeaveBack: () => scrollTl.reverse(),
        },
      });
      let xPos =
        window.innerWidth / 2 -
        $(this).find(".been-bl").width() / 2 -
        1 * window.innerWidth * 0.01;
      scrollTl.to($(this).find(".been-bl"), {
        ease: "power4.Out",
        duration: 0.4,
        x: -xPos,
      });
    });
  }

  // DESIGN motion
  $(".header-wrap").each(function (index) {
    let tl = gsap.timeline({ paused: true });
    tl.to($(this).find("[letters-slide-down] .char"), {
      yPercent: -120,
      opacity: 0,
      duration: 0.3,
      ease: "power1.out",
      stagger: { amount: 0.2, from: "end" },
    });
    createScrollTrigger($(this), tl);
  });

  // MOTION Template
  function createScrollTrigger(triggerElement, tl) {
    // Reset tl when scroll out of view past bottom of screen
    ScrollTrigger.create({
      trigger: triggerElement,
      start: "5% top",
      onEnter: () => tl.play(),
      onLeaveBack: () => tl.reverse(),
    });
  }
  // CALENDAR motion
  $(".header-wrap").each(function (index) {
    let tl = gsap.timeline({ paused: true });
    tl.to($(this).find("[letters-slide-down-second] .char"), {
      yPercent: -120,
      opacity: 0,
      duration: 0.3,
      delay: 0.2,
      ease: "power1.out",
      stagger: { amount: 0.2 },
    });
    createScrollTrigger($(this), tl);
  });

  // Avoid flash of unstyled content
  gsap.set("[text-split]", { opacity: 1 });
});