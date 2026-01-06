// Check immediately if value exists
console.log('SessionStorage on load:', sessionStorage.getItem('pendingFilter'));

// Check if Finsweet exists
console.log('Finsweet script loaded:', typeof window.fsAttributes);

// Try both methods
window.fsAttributes = window.fsAttributes || [];
window.fsAttributes.push([
  'cmsfilter',
  (filterInstances) => {
    console.log('Finsweet initialized!', filterInstances);
    
    const filterValue = sessionStorage.getItem('pendingFilter');
    console.log('Retrieved filter value:', filterValue);
    
    if (filterValue) {
      sessionStorage.removeItem('pendingFilter');
      
      setTimeout(() => {
        const target = document.querySelector(`[filter-target="${filterValue}"]`);
        console.log('Found target element:', target);
        
        if (target) {
          console.log('Clicking target...');
          target.click();
          console.log('Target clicked!');
        } else {
          console.error('Target element not found! Looking for:', `[filter-target="${filterValue}"]`);
          // Show all available targets
          const allTargets = document.querySelectorAll('[filter-target]');
          console.log('Available targets:', allTargets);
          allTargets.forEach(t => console.log('- ', t.getAttribute('filter-target')));
        }
      }, 10);
    } else {
      console.log('No pending filter found');
    }
  },
]);

// Backup: If Finsweet callback doesn't work, try window.onload
window.addEventListener('load', function() {
  setTimeout(() => {
    const filterValue = sessionStorage.getItem('pendingFilter');
    if (filterValue) {
      console.log('Backup method: trying to click target');
      const target = document.querySelector(`[filter-target="${filterValue}"]`);
      if (target) {
        target.click();
        sessionStorage.removeItem('pendingFilter');
      }
    }
  }, 10);
});
