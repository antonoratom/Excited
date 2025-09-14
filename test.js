


/*
$("[staggerload='wrap']").each(function () {
  let staggerGlobal = gsap.timeline({
    scrollTrigger: {
      trigger: $(this),
      start: "5% 90%",
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

//gsap.to("[heroload='wrap']", { opacity: 1, duration: 1.2 });

if (window.innerHeight < 920) {
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

$(".services_projects_wrap").each(function () {
  let scrollTlCardImg = gsap.timeline({
    scrollTrigger: {
      trigger: $(this),
      start: "top 75%",
      end: "bottom 75%",
      //markers: true,
      toggleActions: "play none none reverse",
    },
  });
  scrollTlCardImg.from($(this).find(".services_img"), {
    height: 0,
    duration: 0.8,
    stagger: { each: 0.15 },
  });
});


//REJECTED OPTION FOR SPLIT TYPE ON HERO SECTION
let heroMainTextLoad = new SplitType("[heroload='main-text']", {
    types: "words, chars",
    tagName: "span"
});
let heroSubTextLoad = new SplitType("[heroload='sub-text']", {
    types: "words, chars",
    tagName: "span"
});

$("[heroload='wrap']").each(function(index){
    gsap.from($(this).find("[heroload='main-text'] .word"), {yPercent: 100, opacity: 0, duration: 0.2, stagger: {amount: 1}});
    gsap.from($(this).find("[heroload='sub-text'] .char"), {yPercent: 100, opacity: 0, duration: 0.1, stagger: {amount: 0.2}}, 0.6);
    gsap.from($(this).find("[heroload='additional']"), {yPercent: 5, opacity: 0, duration: 0.3, stagger: {amount: 0.5}}, 0.5);
    
    // Fade in the content gradually
    gsap.to($(this), { opacity: 1, duration: 0 });
});*/

/* document.addEventListener('click', (event) => {
  if (event.target.classList) {
    console.log('Clicked class: ' + event.target.classList);
  } else {
    console.log('Clicked element does not have any class.');
  }
});



//MODAL
[client-feedback='{dynamic value}'] — collection item in modal
[default-reset='cli'] — reset all collection items in modal on page load
[client-feedback='wrap'] — main wrap in collection item in modal
[client-feedback='video'] — container of main wrap in collection item in modal
[client-feedback='close'] — close icon
[client-feedback='cli'].active #fb-video — active modal item 

//VISIBLE COLLECTION
[client-feedback='trigger'] — video trigger that will open modal
[feedback-order='{dynamic value}'] — collection item of visible feedbacks


$(document).ready(function() {
    $("[client-feedback='wrap']").removeClass('active');
    $("[client-feedback='video']").removeClass('active');
    $("[default-reset='cli']").removeClass('active');
    let prtflIndex;
    
});

$("[client-feedback='trigger']").on('click', function() {
    prtflIndex = $(this).closest("[feedback-order]").attr("feedback-order");
    $("[client-feedback='" + prtflIndex + "']").addClass('active');
    
    setTimeout(function() {
        $("[client-feedback='wrap']").addClass('active');
        $("[client-feedback='video']").addClass('active');
        console.log("Index clicked: " + prtflIndex);
        
        // Play video when element with ID #fb-video is a child of the selected [client-feedback='cli']
        $("[client-feedback='" + prtflIndex + "'] #fb-video")[0].play();
    }, 10); // 10 milliseconds = 0.01 seconds
});

$("[client-feedback='close']").on('click', function() {
    $("[client-feedback='wrap']").removeClass('active');
    $("[client-feedback='video']").removeClass('active'); 
    // Autopause video when [client-feedback='close'] is clicked
    $("[client-feedback='" + prtflIndex + "'].active").find('#fb-video')[0].pause(); 
    
    setTimeout(function() {
        $("[client-feedback='" + prtflIndex + "']").removeClass('active');
    }, 400);
});






if ($(window).width() < 991) {
    $('.btn.blur-bg.burger').click(function() {
        let clickCount = $(this).data('clickCount') || 0;
        clickCount++;
        $(this).data('clickCount', clickCount);
        
        if (clickCount % 2 === 0) {
            setTimeout(() => {
                $('.header_links-wrap').toggleClass('open-burger');
                $('.main-wrap.header-wrap').toggleClass('burger-menu-bg');
            }, 350);
        } else {
            $('.header_links-wrap').toggleClass('open-burger');
            $('.main-wrap.header-wrap').toggleClass('burger-menu-bg');
        }
    });

    $("[burgernav='wrap']").each(function (index) {
        let burgerItem = $(this).find("[burgernav='item']");
        
        let burgerTl = gsap.timeline({paused: true});
        burgerTl.fromTo(burgerItem, {yPercent: -100, opacity: 0}, {yPercent: 0, opacity: 1, duration: 0.3, stagger: {amount: 0.6}});
        
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





$("[hoverstagger='link']").each(function (index) {
    let text1 = $(this).find("[hoverstagger='text']").eq(0);
    let text2 = $(this).find("[hoverstagger='text']").eq(1);
    let arrowL1 = $(this).find("[hoverstagger='arrowL']").eq(0);
    let arrowL2 = $(this).find("[hoverstagger='arrowL']").eq(1);
    let arrowR1 = $(this).find("[hoverstagger='arrowR']").eq(0);
    let arrowR2 = $(this).find("[hoverstagger='arrowR']").eq(1);

    let tl = gsap.timeline({paused: true});
    tl.to(text1, {yPercent: -120, duration: 0.2, stagger: {amount: 0.2}});
    tl.from(text2, {yPercent: 100, duration: 0.2, stagger: {amount: 0.2}}, 0);
    tl.to(arrowR1, {xPercent: 100, duration: 0.2, stagger: {amount: 0.2}}, 0);
    tl.from(arrowR2, {xPercent: -100, duration: 0.2, stagger: {amount: 0.2}}, 0);
    tl.to(arrowL1, {xPercent: -100, duration: 0.2, stagger: {amount: 0.2}}, 0);
    tl.from(arrowL2, {xPercent: 100, duration: 0.2, stagger: {amount: 0.2}}, 0);

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
*/