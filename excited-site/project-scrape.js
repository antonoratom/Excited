// Project Scrape Script
// Scrapes case-name from blog pages, finds matching project on works page,
// extracts project data, and updates blog page with that data

(function() {
  'use strict';

  const STORAGE_KEY_CASE_NAME = 'scrapedCaseName';
  const STORAGE_KEY_PROJECT_DATA = 'scrapedProjectData';
  const currentPath = window.location.pathname;
  const isBlogPage = currentPath.includes('/blog/');
  const isWorksPage = currentPath.includes('/works') || currentPath === '/works' || currentPath.endsWith('/works/');
  const ATTRIBUTES = ['company-name', 'project-name', 'project-cover', 'project-video', 'project-card'];

  // Helper: Find matching element by case name
  function findMatchingElement(doc, caseName) {
    const triggerElements = doc.querySelectorAll('[project-scrape="trigger"]');
    if (triggerElements.length === 0) return null;

    for (const element of triggerElements) {
      if (element.textContent.trim().toLowerCase() === caseName.toLowerCase()) {
        return element;
      }
    }
    return null;
  }

  // Helper: Find parent card container
  function findCardContainer(element, doc) {
    if (element.closest) {
      const container = element.closest('[project-card="trigger"]');
      if (container) return container;
    }

    let parent = element.parentElement;
    const body = doc ? doc.body : document.body;
    const documentElement = doc ? doc.documentElement : document.documentElement;

    while (parent && parent !== body && parent !== documentElement) {
      if (parent.hasAttribute && parent.hasAttribute('project-card') && 
          parent.getAttribute('project-card') === 'trigger') {
        return parent;
      }
      const projectCard = parent.querySelector && parent.querySelector('[project-card="trigger"]');
      if (projectCard) return projectCard;
      parent = parent.parentElement;
    }

    return element;
  }

  // Extract project data from card container
  function extractProjectDataFromElement(cardContainer, matchingElement = null) {
    const data = {};

    ATTRIBUTES.forEach(attr => {
      let triggerEl = null;

      if (attr === 'company-name' && matchingElement) {
        triggerEl = matchingElement;
      } else {
        triggerEl = cardContainer.querySelector(`[${attr}="trigger"]`);
        if (!triggerEl && cardContainer.hasAttribute && 
            cardContainer.hasAttribute(attr) && 
            cardContainer.getAttribute(attr) === 'trigger') {
          triggerEl = cardContainer;
        }
      }

      if (triggerEl) {
        let content = null;

        if (triggerEl.tagName === 'IMG') {
          content = triggerEl.src || triggerEl.getAttribute('src');
        } else if (triggerEl.tagName === 'SOURCE') {
          content = triggerEl.src || triggerEl.getAttribute('src');
        } else if (triggerEl.tagName === 'VIDEO') {
          const source = triggerEl.querySelector('source[project-video="trigger"]') || 
                        triggerEl.querySelector('source');
          content = source ? (source.src || source.getAttribute('src')) : 
                   (triggerEl.src || triggerEl.getAttribute('src'));
        } else if (triggerEl.tagName === 'A') {
          content = triggerEl.href || triggerEl.getAttribute('href');
        } else {
          content = triggerEl.textContent || triggerEl.innerHTML;
        }

        if (content) data[attr] = content;
      }
    });

    return Object.keys(data).length > 0 ? data : null;
  }

  // Check if target elements exist (early exit for performance)
  function hasTargetElements() {
    for (const attr of ATTRIBUTES) {
      if (document.querySelector(`[${attr}="target"]`)) return true;
    }
    return false;
  }

  // Update blog page with project data
  function updateBlogPageWithProjectData(freshProjectData = null) {
    let projectData = freshProjectData;

    if (!projectData) {
      const storedData = sessionStorage.getItem(STORAGE_KEY_PROJECT_DATA);
      if (!storedData) return;
      try {
        const parsed = JSON.parse(storedData);
        // Handle both old format (direct data) and new format ({ caseName, data })
        projectData = parsed.data || parsed;
      } catch (e) {
        return;
      }
    }

    ATTRIBUTES.forEach(attr => {
      const targetElements = document.querySelectorAll(`[${attr}="target"]`);
      const data = projectData[attr];
      if (!data || targetElements.length === 0) return;

      targetElements.forEach(targetEl => {
        if (attr === 'project-video') {
          let videoElement = null;

          if (targetEl.tagName === 'VIDEO') {
            videoElement = targetEl;
            const source = targetEl.querySelector('source');
            if (source) {
              source.src = data;
              source.setAttribute('src', data);
            } else {
              targetEl.src = data;
              targetEl.setAttribute('src', data);
            }
          } else if (targetEl.tagName === 'SOURCE') {
            targetEl.src = data;
            targetEl.setAttribute('src', data);
            videoElement = targetEl.closest('video');
          } else {
            targetEl.setAttribute('src', data);
            if (targetEl.src !== undefined) targetEl.src = data;
            videoElement = targetEl.closest('video') || targetEl.querySelector('video');
          }

          if (videoElement) {
            setTimeout(() => videoElement.load(), 10);
          }
        } else if (targetEl.tagName === 'IMG') {
          targetEl.src = data;
          targetEl.setAttribute('src', data);
        } else if (targetEl.tagName === 'A' || attr === 'project-card') {
          targetEl.href = data;
          targetEl.setAttribute('href', data);
        } else {
          targetEl.innerHTML = data;
        }
      });
    });
  }

  // Process works page (either fetched or live)
  function processWorksPage(doc, caseName) {
    const foundElement = findMatchingElement(doc, caseName);
    if (!foundElement) return null;

    const cardContainer = findCardContainer(foundElement, doc);
    const projectData = extractProjectDataFromElement(cardContainer, foundElement);

    if (projectData) {
      // Store project data with case name for verification
      sessionStorage.setItem(STORAGE_KEY_PROJECT_DATA, JSON.stringify({ caseName, data: projectData }));
      return projectData;
    }
    return null;
  }

  // Fetch and scrape works page (deferred for performance)
  async function fetchAndScrapeWorksPage(caseName) {
    try {
      const response = await fetch('/works', { cache: 'default' });
      if (!response.ok) return;

      const html = await response.text();
      const parser = new DOMParser();
      const worksDoc = parser.parseFromString(html, 'text/html');

      const projectData = processWorksPage(worksDoc, caseName);
      if (projectData) {
        updateBlogPageWithProjectData(projectData);
      }
    } catch (error) {
      // Silent fail
    }
  }

  // Defer non-critical work until browser is idle
  function deferWork(callback) {
    if (window.requestIdleCallback) {
      requestIdleCallback(callback, { timeout: 2000 });
    } else {
      setTimeout(callback, 0);
    }
  }

  // Handle blog page
  function handleBlogPage() {
    const caseNameElement = document.querySelector('[case-name]');
    if (!caseNameElement) return;

    const caseNameValue = caseNameElement.getAttribute('case-name');
    if (!caseNameValue || !caseNameValue.trim()) return;

    const trimmedCaseName = caseNameValue.trim();
    const storedCaseName = sessionStorage.getItem(STORAGE_KEY_CASE_NAME);
    
    // Check if case-name changed - if so, clear stored data and rescrape
    const caseNameChanged = storedCaseName !== trimmedCaseName;
    
    if (caseNameChanged) {
      // Clear old project data when case-name changes
      sessionStorage.removeItem(STORAGE_KEY_PROJECT_DATA);
      sessionStorage.setItem(STORAGE_KEY_CASE_NAME, trimmedCaseName);
    }

    // Check for stored data that matches current case-name
    const storedData = sessionStorage.getItem(STORAGE_KEY_PROJECT_DATA);
    if (storedData && !caseNameChanged) {
      try {
        const parsed = JSON.parse(storedData);
        // Verify the stored data belongs to current case-name
        if (parsed.caseName === trimmedCaseName && parsed.data) {
          updateBlogPageWithProjectData(parsed.data);
          return;
        }
      } catch (e) {
        // If parsing fails, treat as no data
      }
    }

    // Only fetch if target elements exist
    if (!hasTargetElements()) return;

    // Fetch fresh data (either first time or case-name changed)
    if (document.readyState === 'complete') {
      deferWork(() => fetchAndScrapeWorksPage(trimmedCaseName));
    } else {
      window.addEventListener('load', () => {
        deferWork(() => fetchAndScrapeWorksPage(trimmedCaseName));
      }, { once: true });
    }
  }

  // Handle works page
  function handleWorksPage() {
    const storedCaseName = sessionStorage.getItem(STORAGE_KEY_CASE_NAME);
    if (!storedCaseName) return;

    const projectData = processWorksPage(document, storedCaseName);
    if (projectData) {
      sessionStorage.setItem(STORAGE_KEY_PROJECT_DATA, JSON.stringify(projectData));
    }
  }

  // Initialize (lightweight, defers heavy work)
  function init() {
    if (!isBlogPage && !isWorksPage) return;

    const run = isBlogPage ? handleBlogPage : handleWorksPage;
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', run, { once: true });
    } else {
      run();
    }
  }

  // Start immediately (script is already async/defer)
  init();
})();
