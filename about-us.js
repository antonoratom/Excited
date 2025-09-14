// Wait for DOM to load
document.addEventListener("DOMContentLoaded", function () {
  const swiper = new Swiper(".we-speak_wrap.swiper", {
    effect: "fade",
    fadeEffect: {
      crossFade: true,
    },

    // Enable scrollbar
    scrollbar: {
      el: ".swiper-scrollbar",
      draggable: true,
      hide: false,
    },

    navigation: {
      nextEl: '[we-speak-arrow="right"]',
      prevEl: '[we-speak-arrow="left"]',
    },
  });
});

document.addEventListener("DOMContentLoaded", function () {
  // Get all elements with the class '.we-speak_wrap.swiper'
  var elements = document.querySelectorAll(".we-speak_wrap.swiper");

  // Loop through each element
  elements.forEach(function (element) {
    // Get the distance from the left side of the element to the left side of the page
    var distanceFromLeft = element.getBoundingClientRect().left;

    // Set the left margin of the parent element
    element.style.marginLeft = -distanceFromLeft + "px";

    // Get all child elements with class '.we-speak_p'
    var childElements = element.querySelectorAll(".we-speak_p");

    // Loop through each child element and set its padding
    childElements.forEach(function (child) {
      child.style.marginLeft = distanceFromLeft + "px";
    });
  });
});

// Immediate redirect check (no wrapper needed). Add more pages with comma like this — '/services', '/contact', ...
const restrictedPages = ['/about-us'];
const supportedLanguages = ['ua', 'ar'];
const isProduction = window.location.hostname === 'www.excited.agency';

if (isProduction) {
  // Handle immediate redirects
  const path = window.location.pathname;
  const langMatch = path.match(new RegExp(`^/(${supportedLanguages.join('|')})/`));
  const langPrefix = langMatch ? langMatch[0] : '';
  const basePath = langPrefix ? path.replace(langPrefix, '/') : path;
  
  if (restrictedPages.includes(basePath)) {
    window.location.replace(langPrefix || '/');
  }
  
  // Inject CSS immediately (only on production)
  const cssRules = [];
  restrictedPages.forEach(page => {
    // Base page
    cssRules.push(`a[href="${page}"], a[href="${page}/"]`);
    // Language versions
    supportedLanguages.forEach(lang => {
      cssRules.push(`a[href="/${lang}${page}"], a[href="/${lang}${page}/"]`);
    });
  });
  
  // Create and inject style
  const style = document.createElement('style');
  style.textContent = `${cssRules.join(', ')} { display: none !important; }`;
  document.head.appendChild(style);
  
  // Additional cleanup for parent containers after DOM loads
  document.addEventListener('DOMContentLoaded', function() {
    // Hide parent containers that might still be visible
    document.querySelectorAll('a[style*="display: none"]').forEach(link => {
      const parent = link.closest('.nav-item, .w-nav-link, .w-dropdown, .menu-item');
      if (parent && !parent.querySelector('a:not([style*="display: none"])')) {
        parent.style.display = 'none';
      }
    });
  });
}
