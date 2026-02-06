
(function() {
  function updateReadingTimes() {
    // Find all content blocks using multiple selectors
    const contentBlocks = document.querySelectorAll('.open-blog-rt.w-richtext, [fs-toc-element="contents"]');
    
    contentBlocks.forEach(contentEl => {
      // Calculate reading time
      const text = contentEl.innerText || contentEl.textContent;
      if (!text || text.trim().length === 0) return;
      
      const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;
      const minutes = Math.ceil(wordCount / 200);
      
      // Find ttr-element using multiple strategies
      let ttrElement = null;
      
      // Strategy 1: Look in blog-card container
      const blogCard = contentEl.closest('.blog-card');
      if (blogCard) {
        ttrElement = blogCard.querySelector('[ttr-element]');
      }
      
      // Strategy 2: Look in open-blog-hero container
      if (!ttrElement) {
        const blogHero = contentEl.closest('.open-blog-hero');
        if (blogHero) {
          ttrElement = blogHero.querySelector('[ttr-element]');
        }
      }
      
      // Strategy 3: Search in any parent up to 10 levels
      if (!ttrElement) {
        let parent = contentEl.parentElement;
        let depth = 0;
        
        while (parent && !ttrElement && depth < 10) {
          ttrElement = parent.querySelector('[ttr-element]');
          parent = parent.parentElement;
          depth++;
        }
      }
      
      // Update with format: "X min"
      if (ttrElement) {
        ttrElement.textContent = `${minutes} min`;
        console.log(`Updated: ${minutes} min for`, contentEl);
      } else {
        console.warn('No ttr-element found for', contentEl);
      }
    });
  }
  
  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateReadingTimes);
  } else {
    updateReadingTimes();
  }
  
  // Webflow compatibility
  if (window.Webflow) {
    window.Webflow.push(function() {
      updateReadingTimes();
    });
  }
  
  // Multiple fallback timings to catch all scenarios
  setTimeout(updateReadingTimes, 100);
  setTimeout(updateReadingTimes, 500);
  setTimeout(updateReadingTimes, 1000);
})();
