document.addEventListener('DOMContentLoaded', function() {
    const followButtons = document.querySelectorAll('[custom-attribute="for-follow"]');
    
    followButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('data-target');
            let searchInput;
            
            if (targetId) {
                // Find input with matching data-search-id
                searchInput = document.querySelector(`[search-for-town][data-search-id="${targetId}"]`);
            } else {
                // Fallback: find closest search-for-town input
                searchInput = this.closest('div').querySelector('[search-for-town]') ||
                             document.querySelector('[search-for-town]');
            }
            
            const searchTerm = searchInput?.value.trim() || '';
            
            if (searchTerm) {
                window.location.href = `/coverage?search=${encodeURIComponent(searchTerm)}`;
            } else {
                window.location.href = '/coverage';
            }
        });
    });
});
