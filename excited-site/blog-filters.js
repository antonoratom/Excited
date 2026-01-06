document.addEventListener('DOMContentLoaded', function() {
  const triggers = document.querySelectorAll('[filter-trigger]');
  
  console.log('Found triggers:', triggers.length);
  
  triggers.forEach(trigger => {
    trigger.addEventListener('click', function() {
      const filterValue = this.getAttribute('filter-trigger');
      console.log('Trigger clicked, storing value:', filterValue);
      
      sessionStorage.setItem('pendingFilter', filterValue);
      
      // Verify it was stored
      console.log('Stored in sessionStorage:', sessionStorage.getItem('pendingFilter'));
    });
  });
});
