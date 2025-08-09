// Read the API base URL from a meta tag or global variable set by your backend
const API_BASE_URL = window.API_BASE_URL || document.querySelector('meta[name="api-base-url"]')?.content;

// Debounce function to limit API calls
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Async function to fetch categories
async function fetchCategories() {
    try {
        console.log(`API Base URL: ${API_BASE_URL}`);
        const response = await fetch(`${API_BASE_URL}/users/getCategories`);
        const data = await response.json();
        return data.categories || [];
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
}

// Async function to populate categories dropdown (Enhanced for mobile support)
async function populateCategoriesDropdown() {
    const category_list = await fetchCategories();
    
    // Get both desktop and mobile category dropdowns
    let categoryDropdown = document.querySelector("#categories-dropdown");
    let mobileCategoryDropdown = document.querySelector("#mobile-categories-dropdown");
    
    console.log(`categoryDropdown: ${categoryDropdown}`);
    console.log(`mobileCategoryDropdown: ${mobileCategoryDropdown}`);
    
    // Helper function to populate a dropdown
    function populateDropdown(dropdown, isMobile = false) {
        if (dropdown) {
            // Clear existing content if needed
            dropdown.innerHTML = '';
            
            for (let i = 0; i < category_list.length; i++) {
                // Create the anchor element directly (no need for li in the current structure)
                let link = document.createElement("a");
                
                if (isMobile) {
                    // Mobile styling - simpler and fits mobile design
                    link.className = "block px-4 py-2 text-white hover:text-purple-400 transition-colors";
                } else {
                    // Desktop styling - matches your existing design
                    link.className = "block px-4 py-2 text-white hover:bg-white/20 hover:text-purple-300 transition-colors";
                }
                
                link.href = `${API_BASE_URL}/users/home/` + encodeURIComponent(category_list[i]);
                link.innerHTML = `<i class="fas fa-tag mr-2"></i>${category_list[i]}`;
                
                // Append directly to the dropdown container
                dropdown.appendChild(link);
            }
        }
    }
    
    // Populate both dropdowns
    populateDropdown(categoryDropdown, false); // Desktop
    populateDropdown(mobileCategoryDropdown, true); // Mobile
    
    if (!categoryDropdown && !mobileCategoryDropdown) {
        console.error("Categories dropdown elements not found!");
    }
}

// Async function to handle autocomplete
async function handleAutocomplete(searchValue) {
    try {
        console.log(`search value: ${searchValue}`);
        const response = await fetch(`${API_BASE_URL}/users/autocomplete/${searchValue}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching autocomplete data:', error);
        return null;
    }
}

// Function to clear autocomplete results
function clearAutocomplete(autocomplete_block) {
    const cont = autocomplete_block.getElementsByClassName('search-container');
    if (cont.length > 0) {
        autocomplete_block.removeChild(cont[0]);
    }
}

// Function to highlight matching text with enhanced styling
function highlightMatch(text, searchValue) {
    if (!searchValue.trim()) return text;

    const regex = new RegExp(`(${searchValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<span style="background: rgba(139, 92, 246, 0.3); color: rgba(196, 181, 253, 1); padding: 2px 6px; border-radius: 4px; font-weight: 600;">$1</span>');
}

// Enhanced function to show autocomplete results with better substring matching
function showAutocompleteResults(autocomplete_block, response, searchValue, isMobile = false) {
    // Clear existing results first
    clearAutocomplete(autocomplete_block);
    
    if (response && response.product_name && response.product_id && response.product_name.length > 0) {
        let product = response.product_name;
        let id = response.product_id;
        
        // Client-side filtering for better substring matching (in case backend doesn't do it)
        const searchWords = searchValue.toLowerCase().trim().split(/\s+/);
        const filteredResults = [];
        
        for (let i = 0; i < product.length; i++) {
            const productName = product[i].toLowerCase();
            const matchesAll = searchWords.every(word => productName.includes(word));
            
            if (matchesAll) {
                filteredResults.push({
                    name: product[i],
                    id: id[i],
                    // Calculate relevance score for better sorting
                    relevance: calculateRelevanceScore(product[i], searchValue)
                });
            }
        }
        
        // Sort by relevance (exact matches first, then partial matches)
        filteredResults.sort((a, b) => b.relevance - a.relevance);
        
        if (filteredResults.length > 0) {
            const container = document.createElement('DIV');
            container.className = 'search-container';
            
            // Enhanced styling for better visibility and readability
            container.style.cssText = `
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: rgba(30, 30, 47, 0.98);
                backdrop-filter: blur(20px);
                border: 2px solid rgba(139, 92, 246, 0.3);
                border-radius: 12px;
                margin-top: 4px;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1);
                max-height: 320px;
                overflow-y: auto;
                z-index: 1000;
                width: ${autocomplete_block.offsetWidth}px;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            `;
            
            // Add search header with improved styling
            const header = document.createElement('div');
            header.style.cssText = `
                padding: 12px 16px 8px;
                font-size: 13px;
                font-weight: 500;
                color: rgba(156, 163, 175, 1);
                border-bottom: 1px solid rgba(139, 92, 246, 0.2);
                background: rgba(139, 92, 246, 0.05);
                letter-spacing: 0.025em;
            `;
            header.textContent = `Found ${filteredResults.length} result${filteredResults.length !== 1 ? 's' : ''} for "${searchValue}"`;
            container.appendChild(header);
            
            // Create results container
            const resultsContainer = document.createElement('div');
            resultsContainer.style.cssText = `
                max-height: 260px;
                overflow-y: auto;
            `;
            
            // Show top 8 results to avoid overwhelming the user
            const displayResults = filteredResults.slice(0, 8);
            
            for (let j = 0; j < displayResults.length; j++) {
                const result = displayResults[j];
                const carry = document.createElement('a');
                carry.className = 'search-carry';
                carry.href = `${API_BASE_URL}/users/home/product/` + result.id;
                
                // Enhanced styling for each search result item
                carry.style.cssText = `
                    display: flex;
                    align-items: center;
                    padding: 14px 16px;
                    text-decoration: none;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: pointer;
                    font-size: 15px;
                    font-weight: 500;
                    line-height: 1.4;
                `;
                
                // Add hover effects
                carry.addEventListener('mouseenter', function() {
                    this.style.background = 'rgba(139, 92, 246, 0.15)';
                    this.style.borderLeftColor = 'rgba(139, 92, 246, 1)';
                    this.style.borderLeftWidth = '3px';
                    this.style.paddingLeft = '14px';
                });
                
                carry.addEventListener('mouseleave', function() {
                    this.style.background = 'transparent';
                    this.style.borderLeft = 'none';
                    this.style.paddingLeft = '16px';
                });
                
                // Add search icon and highlight matching text
                const highlightedName = highlightMatch(result.name, searchValue);
                
                const icon = document.createElement('i');
                icon.className = 'fas fa-search';
                icon.style.cssText = `
                    color: rgba(139, 92, 246, 0.6);
                    margin-right: 12px;
                    font-size: 14px;
                    width: 16px;
                    text-align: center;
                `;
                
                const textSpan = document.createElement('span');
                textSpan.style.cssText = `
                    flex: 1;
                    color: rgba(255, 255, 255, 0.9);
                    font-weight: 500;
                `;
                textSpan.innerHTML = highlightedName;
                
                const arrowIcon = document.createElement('i');
                arrowIcon.className = 'fas fa-arrow-right';
                arrowIcon.style.cssText = `
                    color: rgba(156, 163, 175, 0.6);
                    font-size: 12px;
                    margin-left: 8px;
                    transition: transform 0.2s ease;
                `;
                
                carry.appendChild(icon);
                carry.appendChild(textSpan);
                carry.appendChild(arrowIcon);
                
                // Add click event to close dropdown
                carry.addEventListener('click', () => {
                    clearAutocomplete(autocomplete_block);
                });
                
                // Arrow animation on hover
                carry.addEventListener('mouseenter', function() {
                    arrowIcon.style.transform = 'translateX(4px)';
                    arrowIcon.style.color = 'rgba(139, 92, 246, 0.8)';
                });
                
                carry.addEventListener('mouseleave', function() {
                    arrowIcon.style.transform = 'translateX(0)';
                    arrowIcon.style.color = 'rgba(156, 163, 175, 0.6)';
                });
                
                resultsContainer.appendChild(carry);
            }
            
            // Add "show more" indicator if there are more results
            if (filteredResults.length > 8) {
                const showMore = document.createElement('div');
                showMore.style.cssText = `
                    padding: 8px 16px;
                    text-align: center;
                    color: rgba(139, 92, 246, 0.8);
                    font-size: 13px;
                    font-weight: 500;
                    border-top: 1px solid rgba(139, 92, 246, 0.2);
                    background: rgba(139, 92, 246, 0.05);
                `;
                showMore.textContent = `+${filteredResults.length - 8} more results`;
                resultsContainer.appendChild(showMore);
            }
            
            container.appendChild(resultsContainer);
            autocomplete_block.appendChild(container);
        } else {
            // Show "no results" with improved suggestions
            showNoResultsMessage(autocomplete_block, searchValue);
        }
        
    } else if (searchValue.trim()) {
        showNoResultsMessage(autocomplete_block, searchValue);
    }
}

// Helper function to calculate relevance score for better result sorting
function calculateRelevanceScore(productName, searchValue) {
    const product = productName.toLowerCase();
    const search = searchValue.toLowerCase().trim();
    
    let score = 0;
    
    // Exact match gets highest score
    if (product === search) {
        score += 1000;
    }
    
    // Starts with search term gets high score
    if (product.startsWith(search)) {
        score += 500;
    }
    
    // Contains all search words gets medium score
    const searchWords = search.split(/\s+/);
    const matchedWords = searchWords.filter(word => product.includes(word));
    score += (matchedWords.length / searchWords.length) * 100;
    
    // Earlier position in text gets bonus points
    const firstMatchIndex = product.indexOf(search);
    if (firstMatchIndex !== -1) {
        score += (100 - firstMatchIndex);
    }
    
    // Shorter names with matches get slight bonus (more specific)
    score += (100 - Math.min(product.length, 100));
    
    return score;
}

// Helper function to show no results message
function showNoResultsMessage(autocomplete_block, searchValue) {
    const container = document.createElement('DIV');
    container.className = 'search-container';
    container.style.cssText = `
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: rgba(30, 30, 47, 0.98);
        backdrop-filter: blur(20px);
        border: 2px solid rgba(239, 68, 68, 0.3);
        border-radius: 12px;
        margin-top: 4px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        width: ${autocomplete_block.offsetWidth}px;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    `;
    
    const noResultsDiv = document.createElement('div');
    noResultsDiv.style.cssText = `
        padding: 32px 24px;
        text-align: center;
    `;
    
    const noResultsIcon = document.createElement('i');
    noResultsIcon.className = 'fas fa-search';
    noResultsIcon.style.cssText = `
        font-size: 28px;
        color: rgba(239, 68, 68, 0.6);
        margin-bottom: 12px;
        display: block;
    `;
    
    const noResultsText = document.createElement('div');
    noResultsText.style.cssText = `
        color: rgba(255, 255, 255, 0.8);
        font-size: 16px;
        font-weight: 500;
        margin-bottom: 4px;
    `;
    noResultsText.textContent = 'No products found';
    
    const suggestionText = document.createElement('div');
    suggestionText.style.cssText = `
        color: rgba(156, 163, 175, 0.8);
        font-size: 14px;
        line-height: 1.4;
    `;
    
    // Generate better search suggestions
    const suggestions = generateSearchSuggestions(searchValue);
    suggestionText.innerHTML = `Try: ${suggestions}`;
    
    noResultsDiv.appendChild(noResultsIcon);
    noResultsDiv.appendChild(noResultsText);
    noResultsDiv.appendChild(suggestionText);
    container.appendChild(noResultsDiv);
    
    autocomplete_block.appendChild(container);
}

// Helper function to generate search suggestions
function generateSearchSuggestions(searchValue) {
    const commonSuggestions = ['shirt', 'pants', 'shoes', 'jacket', 'dress', 'jeans', 'top', 'accessories'];
    const searchWords = searchValue.toLowerCase().trim().split(/\s+/);
    
    // Find similar suggestions
    const suggestions = commonSuggestions.filter(suggestion => {
        return searchWords.some(word => 
            suggestion.includes(word) || 
            word.includes(suggestion) ||
            levenshteinDistance(word, suggestion) <= 2
        );
    }).slice(0, 3);
    
    if (suggestions.length === 0) {
        return '<span style="color: rgba(139, 92, 246, 0.8);">different keywords</span> or <span style="color: rgba(139, 92, 246, 0.8);">browse categories</span>';
    }
    
    return suggestions.map(s => `<span style="color: rgba(139, 92, 246, 0.8); font-weight: 500;">${s}</span>`).join(', ');
}

// Helper function to calculate string similarity
function levenshteinDistance(str1, str2) {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    return matrix[str2.length][str1.length];
}

// Enhanced function to setup search functionality for both desktop and mobile
function setupSearchFunctionality() {
    // Desktop search setup
    let autocomplete_block = document.getElementsByClassName("autocomplete");
    autocomplete_block = autocomplete_block[0];
    
    const search_bar = document.getElementById('search');
    
    if (search_bar && autocomplete_block) {
        setupSearchForElement(search_bar, autocomplete_block, false);
    } else {
        console.error("Desktop search bar or autocomplete block not found!");
    }
    
    // Mobile search setup
    const mobileSearchBar = document.getElementById('mobile-search');
    let mobileAutocompleteBlock = null;
    
    // Find mobile autocomplete block (inside mobile menu)
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
        mobileAutocompleteBlock = mobileMenu.querySelector('.autocomplete');
    }
    
    if (mobileSearchBar && mobileAutocompleteBlock) {
        setupSearchForElement(mobileSearchBar, mobileAutocompleteBlock, true);
        console.log("Mobile search setup completed");
    } else {
        console.log("Mobile search elements not found - this is normal if mobile search is not implemented yet");
    }
}

// Helper function to setup search for a specific element
function setupSearchForElement(searchBar, autocomplete_block, isMobile) {
    let currentSearchValue = '';
    let selectedIndex = -1;
    
    // Debounced search function
    const debouncedSearch = debounce(async (searchValue) => {
        if (searchValue.trim() && searchValue === currentSearchValue) {
            const response = await handleAutocomplete(searchValue);
            showAutocompleteResults(autocomplete_block, response, searchValue, isMobile);
        }
    }, 300);
    
    // Input event listener with debouncing
    searchBar.addEventListener('input', function() {
        currentSearchValue = this.value;
        selectedIndex = -1;
        
        if (currentSearchValue.trim()) {
            debouncedSearch(currentSearchValue);
        } else {
            clearAutocomplete(autocomplete_block);
        }
    });
    
    // Keyboard navigation
    searchBar.addEventListener('keydown', function(e) {
        const container = autocomplete_block.querySelector('.search-container');
        const items = container ? container.querySelectorAll('.search-carry') : [];
        
        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
                updateSelection(items, selectedIndex);
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                selectedIndex = Math.max(selectedIndex - 1, -1);
                updateSelection(items, selectedIndex);
                break;
                
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && items[selectedIndex]) {
                    items[selectedIndex].click();
                }
                break;
                
            case 'Escape':
                clearAutocomplete(autocomplete_block);
                searchBar.blur();
                break;
        }
    });
    
    // Focus event to show results if there's a value
    searchBar.addEventListener('focus', function() {
        if (this.value.trim()) {
            debouncedSearch(this.value);
        }
    });
}

// Function to update selection highlighting with enhanced styling
function updateSelection(items, selectedIndex) {
    items.forEach((item, index) => {
        if (index === selectedIndex) {
            // Enhanced selected state styling
            item.style.background = 'rgba(139, 92, 246, 0.25)';
            item.style.borderLeft = '4px solid rgba(139, 92, 246, 1)';
            item.style.paddingLeft = '12px';
            item.style.transform = 'translateX(2px)';
            item.scrollIntoView({ block: 'nearest' });
            
            // Highlight the arrow icon
            const arrow = item.querySelector('.fa-arrow-right');
            if (arrow) {
                arrow.style.color = 'rgba(139, 92, 246, 1)';
                arrow.style.transform = 'translateX(6px)';
            }
        } else {
            // Reset to normal state
            item.style.background = 'transparent';
            item.style.borderLeft = 'none';
            item.style.paddingLeft = '16px';
            item.style.transform = 'translateX(0)';
            
            // Reset arrow icon
            const arrow = item.querySelector('.fa-arrow-right');
            if (arrow) {
                arrow.style.color = 'rgba(156, 163, 175, 0.6)';
                arrow.style.transform = 'translateX(0)';
            }
        }
    });
}

// Click outside to close autocomplete
document.addEventListener('click', function(e) {
    const autocompleteBlocks = document.querySelectorAll('.autocomplete');
    autocompleteBlocks.forEach(block => {
        if (block && !block.contains(e.target)) {
            clearAutocomplete(block);
        }
    });
});

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    await populateCategoriesDropdown();
    setupSearchFunctionality();
});

// Alternative: If you need to call these functions manually or from other scripts
window.initializeComponents = async function() {
    await populateCategoriesDropdown();
    setupSearchFunctionality();
};