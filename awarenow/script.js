// SIMULATE FORM SUBMIT BUTTON
document.querySelector('[custom-attribute="submit-trigger"]').addEventListener('click', function() {
const nextInput = this.nextElementSibling;

 if (nextInput && nextInput.getAttribute('form-button') === 'submit-target') {
    nextInput.click();
}
 });

// API PART WITH AUTO-SEARCH FROM URL PARAMETER
document.addEventListener('DOMContentLoaded', function() {
const cityInput = document.getElementById('cityInput');
const resultsDiv = document.getElementById('results');
const notFoundMessage = document.getElementById('notFoundMessage');
const resultsTemplate = resultsDiv.cloneNode(true);
const resultsContainer = resultsDiv.parentNode;
let searchTimeout;

 // Hide everything initially
resultsDiv.style.display = 'none';
notFoundMessage.style.display = 'none';

// Check for search parameter in URL and auto-trigger search
function checkUrlParameter() {
    const urlParams = new URLSearchParams(window.location.search);
    const searchTerm = urlParams.get('search');
    
    if (searchTerm && cityInput) {
        // Set the input value
        cityInput.value = searchTerm;
        
        // Trigger search after a short delay to ensure DOM is ready
        setTimeout(() => {
            searchCity();
        }, 100);
    }
}

function resetResults() {
    const allClonedResults = resultsContainer.querySelectorAll('.results-container:not(#results):not(#notFoundMessage)');
    allClonedResults.forEach(item => item.remove());
    
    resultsDiv.style.display = 'none';
    notFoundMessage.style.display = 'none';
}

async function searchCity() {
    const cityName = cityInput.value.trim();
    
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
            showNotFound();
            return;
        }

        if (data) {
            if (Array.isArray(data) && data.length > 0) {
                const hasValidData = data.some(city => 
                    city.municipality_name && city.municipality_name !== 'N/A'
                );
                
                if (hasValidData) {
                    displayResults(data);
                } else {
                    showNotFound();
                }
            } else if (data.results && Array.isArray(data.results) && data.results.length > 0) {
                displayResults(data.results);
            } else if (data.data && Array.isArray(data.data) && data.data.length > 0) {
                displayResults(data.data);
            } else if (typeof data === 'object' && Object.keys(data).length > 0 && data.municipality_name) {
                displayResults([data]);
            } else {
                showNotFound();
            }
        } else {
            showNotFound();
        }

    } catch (error) {
        showNotFound();
    }
}

function displayResults(data) {
    const allClonedResults = resultsContainer.querySelectorAll('.results-container:not(#results):not(#notFoundMessage)');
    allClonedResults.forEach(item => item.remove());
    
    resultsDiv.style.display = 'flex';
    notFoundMessage.style.display = 'none';
    
    data.forEach((city, index) => {
        let targetElement;
        
        if (index === 0) {
            targetElement = resultsDiv;
        } else {
            targetElement = resultsTemplate.cloneNode(true);
            targetElement.removeAttribute('id');
            targetElement.classList.add('cloned-result');
            resultsContainer.appendChild(targetElement);
            targetElement.style.display = 'flex';
        }
        
        const textElement = targetElement.querySelector('.city-search-result');
        if (textElement) {
            const country = city.country || city.county || '';
            const municipality = city.municipality_name || '';
            const state = city.state || '';
            
            textElement.textContent = `${country}, ${municipality}, ${state}`;
        }
    });
}

function showNotFound() {
    resetResults();
    notFoundMessage.style.display = 'flex';
}

cityInput.addEventListener('input', function() {
    clearTimeout(searchTimeout);
    resetResults();
    
    if (cityInput.value.trim()) {
        searchTimeout = setTimeout(searchCity, 500);
    }
});

// Initialize: check for URL parameter and auto-search
checkUrlParameter();
 });
