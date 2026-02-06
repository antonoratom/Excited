gsap.registerPlugin(ScrollTrigger, MotionPathPlugin, DrawSVGPlugin);

// Set initial state - paths fully drawn
gsap.set("[first-path], [second-path], [third-path]", { drawSVG: "0% 100%" });
gsap.set("[hero-grad]", { opacity: 0 });

gsap.timeline({
  scrollTrigger: {
    trigger: "[cards-scrub-trigger]",
    start: "-1px top",
    end: "40% top", // Extended from 30% to give more scroll distance
    scrub: true,
    // markers: true // set to true for debugging
  }
})
// Motion path animations
.to("[first-card]", {
  motionPath: {
    path: "[first-path]",
    align: "[first-path]",
    alignOrigin: [0.5, 1]
  },
  scale: 0.15,
  opacity: .2,
  rotation: -50
}, 0)
.to("[first-dot]", {
  motionPath: {
    path: "[first-path]",
    align: "[first-path]",
    alignOrigin: [0.5, 0.5]
  }
}, 0)
.to("[first-path]", {
  drawSVG: "100% 100%"
}, 0)
.to("[second-card]", {
  motionPath: {
    path: "[second-path]",
    align: "[second-path]",
    alignOrigin: [0.5, 1]
  },
  scale: 0.15,
  opacity: .2,
  rotation: 2
}, 0)
.to("[second-dot]", {
  motionPath: {
    path: "[second-path]",
    align: "[second-path]",
    alignOrigin: [0.5, 0.5]
  }
}, 0)
.to("[second-path]", {
  drawSVG: "100% 100%"
}, 0)
.to("[third-card]", {
  motionPath: {
    path: "[third-path]",
    align: "[third-path]",
    alignOrigin: [0.5, 1]
  },
  scale: 0.15,
  opacity: .2,
  rotation: 50
}, 0)
.to("[third-dot]", {
  motionPath: {
    path: "[third-path]",
    align: "[third-path]",
    alignOrigin: [0.5, 0.5]
  }
}, 0)
.to("[third-path]", {
  drawSVG: "100% 100%"
}, 0)
.to("[hero-grad]", {
//   scale: 1,
  opacity: 1
}, 0)
