// ============================================
// GSAP + Swiper Typewriter Animation
// ============================================

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
  
    // Register GSAP plugin
    gsap.registerPlugin(TextPlugin);
  
    // ============================================
    // ✅ CENTRALIZED CONFIGURATION
    // ============================================
    const CONFIG = {
      typingSpeed: 0.03,
      backspaceSpeed: 0.3,
      cursorBlinkDelay: 0.5,
      slideTransitionPause: 0.05,
      slideDuration: 5000 // ✅ SINGLE SOURCE OF TRUTH (in milliseconds)
    };
  
    // Slide attribute keys
    const SLIDE_KEYS = ['first-slide', 'second-slide', 'third-slide', 'fourth-slide'];
  
    // DOM elements cache
    let textElement;
    let logoItems;
    let currentTimeline = null;
    let progressTimeline = null;
  
    // ============================================
    // Initialize Swiper
    // ============================================
    const swiper = new Swiper('.connectors-swiper', {
      slidesPerView: 1,
      speed: 500,
      loop: true,
      autoplay: {
        delay: CONFIG.slideDuration, // ✅ Uses CONFIG.slideDuration
        disableOnInteraction: false
      },
      pagination: {
        el: '[swiper-pagination]',
        clickable: true
      },
      navigation: {
        nextEl: '[next-slide]',
        prevEl: '[prev-slide]'
      },
      on: {
        init: function() {
          // Cache DOM elements
          textElement = document.querySelector('.connextors-textarea_wrap .h5');
          logoItems = document.querySelectorAll('.connectors-logo_bl');
          
          // Play first scenario immediately
          playScenario(0);
          
          // Start progress animation
          animatePaginationProgress();
        },
        slideChangeTransitionStart: function() {
          const newIndex = this.realIndex;
          
          // Kill current animation
          if (currentTimeline) {
            currentTimeline.kill();
          }
          
          // Kill and restart progress animation
          if (progressTimeline) {
            progressTimeline.kill();
          }
          
          // Create master timeline: leave → pause → enter
          const masterTL = gsap.timeline();
          
          masterTL
            .add(leaveAnimation())
            .add(enterAnimation(newIndex), `+=${CONFIG.slideTransitionPause}`);
          
          currentTimeline = masterTL;
          
          // Restart progress animation
          animatePaginationProgress();
        }
      }
    });
  
    // ============================================
    // Animate Pagination Progress
    // ============================================
    function animatePaginationProgress() {
      // Kill existing animation
      if (progressTimeline) {
        progressTimeline.kill();
      }
      
      // Get active bullet
      const activeBullet = document.querySelector('.swiper-pagination-bullet-active');
      
      if (!activeBullet) return;
      
      // Reset all bullets to 0%
      const allBullets = document.querySelectorAll('.swiper-pagination-bullet');
      allBullets.forEach(bullet => {
        bullet.style.setProperty('--progress-width', '0%');
      });
      
      // Set initial value
      activeBullet.style.setProperty('--progress-width', '0%');
      
      // Create a temporary object to animate
      const progressObj = { value: 0 };
      
      // Animate the progress value from 0 to 100
      progressTimeline = gsap.to(progressObj, {
        value: 100,
        duration: CONFIG.slideDuration / 1000, // ✅ Uses CONFIG.slideDuration (convert to seconds)
        ease: 'none', // Linear progress
        onUpdate: function() {
          // Update CSS variable as percentage
          activeBullet.style.setProperty('--progress-width', progressObj.value + '%');
        },
        onComplete: function() {
          // Ensure it ends at exactly 100%
          activeBullet.style.setProperty('--progress-width', '100%');
        }
      });
    }
  
    // ============================================
    // Enter Animation
    // ============================================
    function enterAnimation(slideIndex) {
      const tl = gsap.timeline();
      const slideKey = SLIDE_KEYS[slideIndex];
      
      // Get text from attribute
      const textToType = textElement.getAttribute(`for-${slideKey}`);
      
      if (!textToType) {
        console.warn(`No text found for: for-${slideKey}`);
        return tl;
      }
      
      // Get logos to activate for this slide
      const logosToActivate = Array.from(logoItems).filter(logo => 
        logo.hasAttribute(`for-${slideKey}`)
      );
      
      // Calculate typing duration
      const typingDuration = textToType.length * CONFIG.typingSpeed;
      
      // Clear existing text and add cursor
      textElement.textContent = '';
      const cursor = document.createElement('span');
      cursor.className = 'typing-cursor';
      cursor.textContent = '|';
      textElement.appendChild(cursor);
      
      // Add classes IMMEDIATELY, OUTSIDE the timeline
      logosToActivate.forEach(logo => {
        logo.classList.add('is-active');
      });
      
      // Type text character by character
      tl.to(textElement, {
        duration: typingDuration,
        text: {
          value: textToType,
          delimiter: ''
        },
        ease: 'none',
        onUpdate: function() {
          textElement.appendChild(cursor);
        }
      }, 0);
      
      // Remove cursor after typing completes
      tl.add(() => {
        if (cursor.parentNode) {
          cursor.remove();
        }
      }, `+=${CONFIG.cursorBlinkDelay}`);
      
      return tl;
    }
  
    // ============================================
    // Leave Animation
    // ============================================
    function leaveAnimation() {
      const tl = gsap.timeline();
      const currentText = textElement.textContent.replace('|', '');
      
      // Remove classes IMMEDIATELY, OUTSIDE the timeline
      logoItems.forEach(logo => {
        logo.classList.remove('is-active');
      });
      
      // Fast backspace effect
      if (currentText.length > 0) {
        tl.to(textElement, {
          duration: CONFIG.backspaceSpeed,
          text: {
            value: '',
            delimiter: ''
          },
          ease: 'power2.in'
        }, 0);
      }
      
      return tl;
    }
  
    // ============================================
    // Play scenario
    // ============================================
    function playScenario(slideIndex) {
      if (currentTimeline) {
        currentTimeline.kill();
      }
      currentTimeline = enterAnimation(slideIndex);
    }
  
}); // End DOMContentLoaded
