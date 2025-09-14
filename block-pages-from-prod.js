// START OF HIDING PAGES FROM PROD 
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
}
// END OF HIDING PAGES FROM PROD 