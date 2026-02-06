(function() {
    function init() {
        // Inject CSS styles
        const style = document.createElement('style');
        style.textContent = `
            .link-highlighter-toggle {
                position: fixed;
                bottom: 20px;
                right: 20px;
                padding: 10px 20px;
                background-color: #4CAF50;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
                z-index: 10023145322400;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                font-family: Arial, sans-serif;
            }

            .link-highlighter-toggle:hover {
                background-color: #45a049;
            }

            .link-highlighter-toggle.active {
                background-color: #f44336;
            }

            .missing-link-highlight {
                outline: 2px solid red !important;
                outline-offset: 2px;
                position: relative !important;
                display: inline-block !important;
            }

            .missing-link-label {
                position: absolute;
                top: 100%;
                left: 0;
                color: red;
                font-size: 10px;
                font-weight: bold;
                white-space: nowrap;
                margin-top: 2px;
                pointer-events: none;
            }
        `;
        document.head.appendChild(style);

        // Create toggle button
        const toggleButton = document.createElement('button');
        toggleButton.className = 'link-highlighter-toggle';
        toggleButton.id = 'linkHighlighterToggle';
        toggleButton.textContent = 'Toggle Missing Links: OFF';
        document.body.appendChild(toggleButton);

        let isActive = false;
        
        // Function to find all links with missing or # href
        function getMissingLinks() {
            const allLinks = document.querySelectorAll('a');
            const missingLinks = [];
            
            allLinks.forEach(link => {
                const href = link.getAttribute('href');
                // Check if href is null, empty string, or just "#"
                if (!href || href === '' || href === '#') {
                    missingLinks.push(link);
                }
            });
            
            return missingLinks;
        }
        
        // Function to highlight missing links
        function highlightLinks() {
            const missingLinks = getMissingLinks();
            
            missingLinks.forEach(link => {
                // Add red stroke
                link.classList.add('missing-link-highlight');
                
                // Add "missing link" text if not already added
                if (!link.querySelector('.missing-link-label')) {
                    const label = document.createElement('span');
                    label.className = 'missing-link-label';
                    label.textContent = 'missing link';
                    link.appendChild(label);
                }
            });
        }
        
        // Function to remove highlighting
        function removeHighlighting() {
            const highlightedLinks = document.querySelectorAll('.missing-link-highlight');
            
            highlightedLinks.forEach(link => {
                // Remove highlight class
                link.classList.remove('missing-link-highlight');
                
                // Remove label
                const label = link.querySelector('.missing-link-label');
                if (label) {
                    label.remove();
                }
            });
        }
        
        // Toggle function
        function toggle() {
            isActive = !isActive;
            
            if (isActive) {
                highlightLinks();
                toggleButton.textContent = 'Toggle Missing Links: ON';
                toggleButton.classList.add('active');
            } else {
                removeHighlighting();
                toggleButton.textContent = 'Toggle Missing Links: OFF';
                toggleButton.classList.remove('active');
            }
        }
        
        // Add click event to toggle button
        toggleButton.addEventListener('click', toggle);
        
        // Optional: Re-check for new links periodically (useful for dynamic content)
        setInterval(() => {
            if (isActive) {
                highlightLinks();
            }
        }, 1000);
    }

    // Check if DOM is already loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // DOM is already ready
        init();
    }
})();
