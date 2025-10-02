// API PART WITH BUTTON-TRIGGERED SEARCH
document.addEventListener('DOMContentLoaded', function() {
    const cityInput = document.getElementById('cityInput');
    const resultsDiv = document.getElementById('results');
    const notFoundMessage = document.getElementById('notFoundMessage');
    const resultsTemplate = resultsDiv.cloneNode(true);
    const resultsContainer = resultsDiv.parentNode;
    const searchButton = document.querySelector('[custom-attribute="for-search"]');
    const showMoreElement = document.querySelector('[show-more-results]');
    const showAllButton = document.querySelector('[custom-attribute="show-all-results"]');
    const searchForm = cityInput ? cityInput.closest('form') : null;
    
    let allResultsData = [];
    let currentSearchTerm = '';

    // Elements are hidden by CSS, no need to hide them here
    
    // Prevent default form submission
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (searchButton) {
                searchButton.click();
            }
        });
    }

    // Check for search parameter in URL and auto-trigger search
    function checkUrlParameter() {
        const urlParams = new URLSearchParams(window.location.search);
        const searchTerm = urlParams.get('search');
        
        if (searchTerm && cityInput) {
            cityInput.value = searchTerm;
            setTimeout(() => {
                if (searchButton) {
                    searchButton.click();
                }
            }, 100);
        }
    }

    function resetResults() {
        const allClonedResults = resultsContainer.querySelectorAll('.results-container:not(#results):not(#notFoundMessage)');
        allClonedResults.forEach(item => item.remove());
        
        resultsDiv.classList.remove('is-visible');
        notFoundMessage.classList.remove('is-visible');
        if (showMoreElement) {
            showMoreElement.classList.remove('is-visible');
        }
    }

    async function searchCity() {
        const cityName = cityInput.value.trim();
        currentSearchTerm = cityName;
        
        if (!cityName) {
            resetResults();
            return;
        }

        // Hide all results while searching
        resetResults();

        try {
            const response = await fetch(`https://be.awarenow.ai/api/municipalities/quick_search/?q=${encodeURIComponent(cityName)}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                }
            });

            const responseText = await response.text();
            let data;
            
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error('JSON parse error:', parseError);
                showNotFound();
                return;
            }

            if (data) {
                let resultsArray = null;
                
                if (Array.isArray(data) && data.length > 0) {
                    const hasValidData = data.some(city => 
                        city.municipality_name && city.municipality_name !== 'N/A'
                    );
                    
                    if (hasValidData) {
                        resultsArray = data;
                    }
                } else if (data.results && Array.isArray(data.results) && data.results.length > 0) {
                    resultsArray = data.results;
                } else if (data.data && Array.isArray(data.data) && data.data.length > 0) {
                    resultsArray = data.data;
                } else if (typeof data === 'object' && Object.keys(data).length > 0 && data.municipality_name) {
                    resultsArray = [data];
                }
                
                if (resultsArray) {
                    allResultsData = resultsArray;
                    displayResults(resultsArray);
                } else {
                    showNotFound();
                }
            } else {
                showNotFound();
            }

        } catch (error) {
            console.error('Search error:', error);
            showNotFound();
        }
    }

    function displayResults(data) {
        // Clean up previous results
        const allClonedResults = resultsContainer.querySelectorAll('.results-container:not(#results):not(#notFoundMessage)');
        allClonedResults.forEach(item => item.remove());
        
        // Remove visible classes
        resultsDiv.classList.remove('is-visible');
        notFoundMessage.classList.remove('is-visible');
        
        // Track total results BEFORE limiting
        const totalResults = data.length;
        console.log(`Total results found: ${totalResults}`);
        
        // Limit to 3 results for display
        const limitedData = data.slice(0, 3);
        console.log(`Displaying ${limitedData.length} results`);
        
        // Display the limited results
        limitedData.forEach((city, index) => {
            let targetElement;
            
            if (index === 0) {
                targetElement = resultsDiv;
                targetElement.classList.add('is-visible');
            } else {
                targetElement = resultsTemplate.cloneNode(true);
                targetElement.removeAttribute('id');
                targetElement.classList.add('cloned-result');
                resultsContainer.appendChild(targetElement);
                // Add is-visible class after appending
                targetElement.classList.add('is-visible');
            }
            
            const textElement = targetElement.querySelector('.city-search-result');
            if (textElement) {
                const country = city.country || city.county || '';
                const municipality = city.municipality_name || '';
                const state = city.state || '';
                
                textElement.textContent = `${country}, ${municipality}, ${state}`;
            }
        });
        
        // Handle "Show More" button
        if (showMoreElement) {
            if (totalResults > 3) {
                console.log(`Showing "Show More" button for ${totalResults} results`);
                
                showMoreElement.classList.add('is-visible');
                
                const btnElement = showMoreElement.querySelector('.btn-p');
                if (btnElement) {
                    btnElement.textContent = `Explore all ${totalResults} results`;
                    console.log(`Button text updated: ${btnElement.textContent}`);
                } else {
                    console.warn('.btn-p element not found inside [show-more-results]');
                }
            } else {
                console.log(`Hiding "Show More" button (only ${totalResults} results)`);
                showMoreElement.classList.remove('is-visible');
            }
        } else {
            console.warn('[show-more-results] element not found in DOM');
        }
    }

    function showNotFound() {
        resetResults();
        notFoundMessage.classList.add('is-visible');
    }

    // Button click event for search
    if (searchButton) {
        searchButton.addEventListener('click', function() {
            searchCity();
        });
    }

    // Simulate button click on Enter key press
    if (cityInput) {
        cityInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (searchButton) {
                    searchButton.click();
                }
            }
        });
    }

    // Show all results button click
    if (showAllButton) {
        showAllButton.addEventListener('click', function() {
            if (currentSearchTerm) {
                location.href = `/coverage?search=${encodeURIComponent(currentSearchTerm)}`;
            }
        });
    }

    // Initialize: check for URL parameter and auto-search
    checkUrlParameter();
});
