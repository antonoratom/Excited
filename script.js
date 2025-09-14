//working part

const init = () => {
  console.log("init function called");

  const ACTIVE_TAB = "w--current";
  let activeIndex = 0;
  let timeout;
  let tween;

  // Select the node that will be observed for mutations
  const tabsComponent = document.querySelector('[tabs="wrap"]');
  if (!tabsComponent) return;

  const tabsMenu = tabsComponent.querySelector('[tabs="menu"]');
  if (!tabsMenu) return;

  const tabsContent = tabsComponent.querySelector('[tabs="content"]');
  if (!tabsContent) return;

  const videos = tabsContent.querySelectorAll("video");
  const loaders = tabsMenu.querySelectorAll('[tabs="line"]');

  // Fix for Safari scrolling to tab on focus
  if (navigator.userAgent.includes("Safari")) {
    let tabLinks = tabsMenu.childNodes;
    tabLinks.forEach(
      (tabLink) =>
        (tabLink.focus = function () {
          const x = window.scrollX,
            y = window.scrollY;

          const f = () => {
            setTimeout(() => window.scrollTo(x, y), 1);
            tabLink.removeEventListener("focus", f);
          };

          tabLink.addEventListener("focus", f);
          HTMLElement.prototype.focus.apply(this, arguments);
        })
    );
  }

  const animateLoader = (duration) => {
    console.log("animateLoader function called with duration:", duration);

    const screenWidth = window.innerWidth;
    if (screenWidth < 480) {
      tween = gsap.fromTo(
        loaders[activeIndex],
        { width: "0%" },
        { width: "100%", duration: duration, ease: "none" }
      );
    } else {
      tween = gsap.fromTo(
        loaders[activeIndex],
        { height: "0%" },
        { height: "100%", duration: duration, ease: "none" }
      );
    }
  };

  const autoPlayTabs = () => {
    if (stopExecution) {
      console.log("autoPlayTabs stopped due to stopExecution being true");
      return;
    }

    console.log("autoPlayTabs function called");
    clearTimeout(timeout);

    const activeVideo = videos[activeIndex];
    const duration = activeVideo ? activeVideo.duration : 6;

    if (activeVideo) {
      activeVideo.currentTime = 0;
      console.log({ duration: activeVideo.duration });
    }

    if (tween) {
      tween.progress(0);
      tween.kill();
    }

    if (loaders.length > 0) {
      animateLoader(duration);
    }

    timeout = setTimeout(() => {
      if (stopExecution) {
        console.log("Timeout stopped due to stopExecution being true");
        return;
      }

      let nextIndex;
      if (activeIndex >= tabsMenu.childElementCount - 1) {
        nextIndex = 0;
      } else {
        nextIndex = activeIndex + 1;
      }

      const nextTab = tabsMenu.childNodes[nextIndex];
      nextTab.click();
    }, duration * 1000);
  };

  autoPlayTabs();

  // Options for the observer (which mutations to observe)
  const config = {
    attributes: true,
    subtree: true,
    attributeFilter: ["class"],
  };

  // Callback function to execute when mutations are observed
  const mutationCallback = (mutationList, mutationObserver) => {
    if (stopExecution) {
      console.log(
        "MutationObserver callback stopped due to stopExecution being true"
      );
      mutationObserver.disconnect();
      return;
    }

    console.log("MutationObserver callback called");
    for (const mutation of mutationList) {
      if (mutation.type === "attributes") {
        const target = mutation.target;
        if (target.classList.contains(ACTIVE_TAB)) {
          activeIndex = parseInt(target.id.slice(-1), 10);
          console.log({ activeIndex });

          // Auto play tabs
          autoPlayTabs();
        }
      }
    }
  };

  // Create an observer instance linked to the callback function
  const mutationObserver = new MutationObserver(mutationCallback);

  // Start observing the target node for configured mutations
  mutationObserver.observe(tabsComponent, config);
};

// Function to observe when the element with attribute [tab-rotation-wrap] is in view
let stopExecution = false;
let intersectionObserver = null;

console.log(stopExecution);

const observeTabRotationWrap = () => {
  console.log("observeTabRotationWrap function called");

  if (stopExecution) {
    console.log("stopExecution is true, stopping observer");
    if (intersectionObserver) intersectionObserver.disconnect(); // Disconnect the observer if stopExecution is true
    return; // Stop execution if stopExecution is true
  }

  const tabRotationWrap = document.querySelector("[tabs='wrap']");
  if (!tabRotationWrap) return;

  intersectionObserver = new IntersectionObserver((entries) => {
    console.log("IntersectionObserver callback called");

    entries.forEach((entry) => {
      if (stopExecution) {
        console.log("stopExecution is true, disconnecting observer");
        intersectionObserver.disconnect(); // Disconnect the observer if stopExecution is true
        return;
      }

      if (entry.isIntersecting) {
        console.log("Element is intersecting, calling init");
        init(); // Call init when the element is in view
        intersectionObserver.disconnect(); // Stop observing after init is called
      }
    });
  });

  intersectionObserver.observe(tabRotationWrap);
};

// Call observeTabRotationWrap to start observing
observeTabRotationWrap();

/* OLD CODE 

// Add background color to header on scroll more than 100px
const headerWrap = document.querySelector(".main-wrap.header-wrap");

function checkScrollPosition() {
  if (window.scrollY < 64) {
    headerWrap.style.backgroundColor = "initial";
  } else {
    headerWrap.style.backgroundColor = "#000";
  }
}
checkScrollPosition();
window.addEventListener("scroll", checkScrollPosition);

// auto change year in footer
document.querySelector(".footer_dynamic_year").textContent =
  new Date().getFullYear();

$(".contact-us_content").on("click", function () {
  $(this).find(".btn.white-bg")[0].dispatchEvent(new MouseEvent("click"));
});

document.addEventListener("click", (event) => {
  if (event.target.classList) {
    //console.log('Clicked class: ' + event.target.classList);
  } else {
    //console.log('Clicked element does not have any class.');
  }
});


// MODAL
// [client-feedback='{dynamic value}'] — collection item in modal
// [default-reset='cli'] — reset all collection items in modal on page load
// [client-feedback='wrap'] — main wrap in collection item in modal
// [client-feedback='video'] — container of main wrap in collection item in modal
// [client-feedback='close'] — close icon
// [client-feedback='cli'].active #fb-video — active modal item 

// VISIBLE COLLECTION
// [client-feedback='trigger'] — video trigger that will open modal
// [feedback-order='{dynamic value}'] — collection item of visible feedbacks

$(document).ready(function () {
  $("[client-feedback='wrap']").removeClass("active");
  $("[client-feedback='video']").removeClass("active");
  $("[default-reset='cli']").removeClass("active");
  let prtflIndex;
});

$("[client-feedback='trigger']").on("click", function () {
  prtflIndex = $(this).closest("[feedback-order]").attr("feedback-order");
  $("[client-feedback='" + prtflIndex + "']").addClass("active");

  setTimeout(function () {
    $("[client-feedback='wrap']").addClass("active");
    $("[client-feedback='video']").addClass("active");
    //console.log("Index clicked: " + prtflIndex);

    // Play video when element with ID #fb-video is a child of the selected [client-feedback='cli']
    $("[client-feedback='" + prtflIndex + "'] #fb-video")[0].play();
  }, 10); // 10 milliseconds = 0.01 seconds
});

$("[client-feedback='close']").on("click", function () {
  $("[client-feedback='wrap']").removeClass("active");
  $("[client-feedback='video']").removeClass("active");
  // Autopause video when [client-feedback='close'] is clicked
  $("[client-feedback='" + prtflIndex + "'].active")
    .find("#fb-video")[0]
    .pause();

  setTimeout(function () {
    $("[client-feedback='" + prtflIndex + "']").removeClass("active");
  }, 400);
});

//Burger menu adding classes on click
if ($(window).width() < 991) {
  $(".btn.blur-bg.burger").click(function () {
    let clickCount = $(this).data("clickCount") || 0;
    clickCount++;
    $(this).data("clickCount", clickCount);

    if (clickCount % 2 === 0) {
      setTimeout(() => {
        $(".header_links-wrap").toggleClass("open-burger");
        $(".main-wrap.header-wrap").toggleClass("burger-menu-bg");
      }, 350);
    } else {
      $(".header_links-wrap").toggleClass("open-burger");
      $(".main-wrap.header-wrap").toggleClass("burger-menu-bg");
    }
  });

  $("[burgernav='wrap']").each(function (index) {
    let burgerItem = $(this).find("[burgernav='item']");

    let burgerTl = gsap.timeline({ paused: true });
    burgerTl.fromTo(
      burgerItem,
      { yPercent: -100, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 0.3, stagger: { amount: 0.6 } }
    );

    let clickCount = 0;

    $("#burgerIcon").click(function () {
      clickCount++;
      if (clickCount % 2 === 1) {
        burgerTl.timeScale(1).play();
      } else {
        burgerTl.timeScale(2).reverse();
      }
    });
  });
}


  //sectios paralax on scroll, only for web
  if (window.innerHeight < 920 && window.innerWidth > 991) {
    $("[darksection='wrap']").each(function () {
      let scrollTlD = gsap.timeline({
        scrollTrigger: {
          trigger: $(this),
          start: "top bottom",
          end: "bottom bottom",
          //markers: true,
          scrub: true,
        },
      });
      scrollTlD.from($(this).find("[darksection='scrub']"), {
        y: -200,
        opacity: 0.2,
      });
    });

    $("[lightsection='wrap']").each(function () {
      let scrollTlW = gsap.timeline({
        scrollTrigger: {
          trigger: $(this),
          start: "top bottom",
          end: "bottom bottom",
          //markers: true,
          scrub: true,
        },
      });
      scrollTlW.to($(this).prev("[darksection='wrap']"), { y: 100 });
    });
  }

  // Stagger sections appear on scroll
  $("[staggerload='wrap']").each(function () {
    let staggerGlobal = gsap.timeline({
      scrollTrigger: {
        trigger: $(this),
        start: "80px 90%",
        end: "bottom bottom",
        //markers: true,
        toggleActions: "play none none none",
      },
    });
    staggerGlobal.from($(this).find("[staggerload='element']"), {
      y: 12,
      opacity: 0,
      duration: 0.6,
      stagger: { each: 0.1 },
    });
    staggerGlobal.from($(this).find("[staggerload='group']").children(), {
      y: 12,
      opacity: 0,
      duration: 0.6,
      stagger: { each: 0.1 },
    }, 0.2);

  });

  //Stagger images
  $("[staggerimage='wrap']").each(function () {
    let scrollTlCardImg = gsap.timeline({
      scrollTrigger: {
        trigger: $(this),
        start: "top 75%",
        end: "bottom 75%",
        //markers: true,
        toggleActions: "play none none none",
      },
    });
    scrollTlCardImg.from($(this).find("[staggerimage='el']"), {
      height: 0,
      duration: 0.8,
      stagger: { each: 0.15 },
    });
  });


//LINKS HOVER EFFECT
$(document).ready(function () {
  setTimeout(function () {
    $("[hoverstagger='link']").each(function (index) {
      let text1 = $(this).find("[hoverstagger='text']").eq(0);
      let text2 = $(this).find("[hoverstagger='text']").eq(1);
      let collapse1 = $(this).find("[hoverstagger='collapse']").eq(0);
      let collapse2 = $(this).find("[hoverstagger='collapse']").eq(1);
      let arrowL1 = $(this).find("[hoverstagger='arrowL']").eq(0);
      let arrowL2 = $(this).find("[hoverstagger='arrowL']").eq(1);
      let arrowR1 = $(this).find("[hoverstagger='arrowR']").eq(0);
      let arrowR2 = $(this).find("[hoverstagger='arrowR']").eq(1);
      let tl = gsap.timeline({ paused: true });
      tl.to(text1, { yPercent: -120, duration: 0.2, stagger: { amount: 0.2 } });
      tl.from(
        text2,
        { yPercent: 100, duration: 0.2, stagger: { amount: 0.2 } },
        0
      );
      tl.to(
        collapse1,
        { yPercent: -120, duration: 0.2, stagger: { amount: 0.2 } },
        0
      );
      tl.from(
        collapse2,
        { yPercent: 100, duration: 0.2, stagger: { amount: 0.2 } },
        0
      );
      tl.to(
        arrowR1,
        { xPercent: 100, duration: 0.2, stagger: { amount: 0.2 } },
        0
      );
      tl.from(
        arrowR2,
        { xPercent: -100, duration: 0.2, stagger: { amount: 0.2 } },
        0
      );
      tl.to(
        arrowL1,
        { xPercent: -100, duration: 0.2, stagger: { amount: 0.2 } },
        0
      );
      tl.from(
        arrowL2,
        { xPercent: 100, duration: 0.2, stagger: { amount: 0.2 } },
        0
      );
      $(this).on("click", function () {
        if (!window.matchMedia("(hover: hover)").matches) {
          if (tl.progress() === 0) {
            tl.play();
          } else {
            tl.reverse();
          }
        }
      });
      $(this).on("mouseenter", function () {
        if (window.matchMedia("(hover: hover)").matches) {
          tl.play();
        }
      });
      $(this).on("mouseleave", function () {
        if (window.matchMedia("(hover: hover)").matches) {
          tl.reverse();
        }
      });
    });
  }, 500); // 500 millisecond
});
 */
