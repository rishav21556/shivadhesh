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

// Function to highlight matching text
function highlightMatch(text, searchValue) {
    if (!searchValue.trim()) return text;
    
    const regex = new RegExp(`(${searchValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<span class="bg-purple-500/30 text-purple-300 px-1 rounded">$1</span>');
}

// Enhanced function to show autocomplete results
function showAutocompleteResults(autocomplete_block, response, searchValue, isMobile = false) {
    // Clear existing results first
    clearAutocomplete(autocomplete_block);
    
    if (response && response.product_name && response.product_id && response.product_name.length > 0) {
        let product = response.product_name;
        let id = response.product_id;
        
        const container = document.createElement('DIV');
        container.className = 'search-container bg-gray-800/95 backdrop-blur-lg border border-white/20 rounded-lg mt-1 shadow-2xl max-h-80 overflow-y-auto z-50';
        container.style.position = 'absolute';
        container.style.width = autocomplete_block.offsetWidth + 'px';
        
        // Add search header
        const header = document.createElement('div');
        header.className = 'px-4 py-2 text-sm text-gray-400 border-b border-white/10';
        header.textContent = `Found ${product.length} result(s) for "${searchValue}"`;
        container.appendChild(header);
        
        for (let j = 0; j < product.length; j++) {
            const carry = document.createElement('a');
            carry.className = 'search-carry flex items-center px-4 py-3 text-white hover:bg-white/10 transition-colors border-b border-white/5 last:border-b-0';
            carry.href = `${API_BASE_URL}/users/home/product/` + id[j];
            
            // Add search icon and highlight matching text
            const highlightedName = highlightMatch(product[j], searchValue);
            carry.innerHTML = `
                <i class="fas fa-search text-gray-400 mr-3"></i>
                <span class="flex-1">${highlightedName}</span>
                <i class="fas fa-arrow-right text-gray-400 text-sm"></i>
            `;
            
            // Add click event to close dropdown
            carry.addEventListener('click', () => {
                clearAutocomplete(autocomplete_block);
            });
            
            container.appendChild(carry);
        }
        
        autocomplete_block.appendChild(container);
    } else if (searchValue.trim()) {
        // Show "no results" message
        const container = document.createElement('DIV');
        container.className = 'search-container bg-gray-800/95 backdrop-blur-lg border border-white/20 rounded-lg mt-1 shadow-2xl z-50';
        container.style.position = 'absolute';
        container.style.width = autocomplete_block.offsetWidth + 'px';
        container.innerHTML = `
            <div class="px-4 py-6 text-center text-gray-400">
                <i class="fas fa-search text-2xl mb-2"></i>
                <div>No products found for "${searchValue}"</div>
            </div>
        `;
        autocomplete_block.appendChild(container);
    }
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

// Function to update selection highlighting
function updateSelection(items, selectedIndex) {
    items.forEach((item, index) => {
        if (index === selectedIndex) {
            item.classList.add('bg-white/20');
            item.scrollIntoView({ block: 'nearest' });
        } else {
            item.classList.remove('bg-white/20');
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