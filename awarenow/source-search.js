document.addEventListener('DOMContentLoaded', function() {
    const COVERAGE_PAGE_URL = '/coverage';
    
    // Find all forms that contain our elements and disable them
    document.querySelectorAll('form').forEach(form => {
        if (form.querySelector('[search-for-town]') || form.querySelector('[custom-attribute="for-follow"]')) {
            console.log('Disabling form:', form);
            
            // Remove form submission entirely
            form.onsubmit = function() { return false; };
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                return false;
            }, true);
            
            // Disable all submit buttons in this form
            form.querySelectorAll('input[type="submit"], button[type="submit"]').forEach(btn => {
                btn.type = 'button'; // Change type to prevent submission
                console.log('Changed submit button type to button:', btn);
            });
        }
    });
    
    function performRedirect(input) {
        const searchTerm = (input?.value || '').trim();
        console.log('Redirecting with term:', searchTerm);
        
        if (searchTerm) {
            window.location.href = `${COVERAGE_PAGE_URL}?search=${encodeURIComponent(searchTerm)}`;
        } else {
            window.location.href = COVERAGE_PAGE_URL;
        }
    }
    
    // Simple Enter key handler
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            const target = e.target;
            if (target && target.hasAttribute('search-for-town')) {
                console.log('Enter on search input - triggering redirect');
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                
                // Find and trigger follow button
                const followButton = target.closest('form, div, section')?.querySelector('[custom-attribute="for-follow"]') ||
                                   document.querySelector('[custom-attribute="for-follow"]');
                
                if (followButton) {
                    console.log('Clicking follow button');
                    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
                    followButton.dispatchEvent(clickEvent);
                } else {
                    console.log('No follow button found, direct redirect');
                    performRedirect(target);
                }
            }
        }
    }, true);
    
    // Setup follow buttons
    document.querySelectorAll('[custom-attribute="for-follow"]').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const input = this.closest('form, div, section')?.querySelector('[search-for-town]') ||
                         document.querySelector('[search-for-town]');
            
            console.log('Follow button clicked, redirecting with input:', input);
            performRedirect(input);
        });
    });
});
