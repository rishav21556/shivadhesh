// Read the API base URL from a meta tag or global variable set by your backend
const API_BASE_URL = window.API_BASE_URL || document.querySelector('meta[name="api-base-url"]')?.content;

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

// Async function to populate categories dropdown
async function populateCategoriesDropdown() {
    const category_list = await fetchCategories();
    
    // Get the dropdown container - need to target the specific element, not the collection
    let categoryDropdown = document.querySelector("#categories-dropdown");
    
    console.log(`categoryDropdown: ${categoryDropdown}`);
    
    // Check if the dropdown element exists
    if (categoryDropdown) {
        // Clear existing content if needed
        categoryDropdown.innerHTML = '';
        
        for (let i = 0; i < category_list.length; i++) {
            // Create the anchor element directly (no need for li in the current structure)
            let link = document.createElement("a");
            link.className = "block px-4 py-2 text-white hover:bg-white/20 hover:text-purple-300 transition-colors";
            link.href = `${API_BASE_URL}/users/home/` + encodeURIComponent(category_list[i]);
            link.innerHTML = `<i class="fas fa-tag mr-2"></i>${category_list[i]}`;
            
            // Append directly to the dropdown container
            categoryDropdown.appendChild(link);
        }
    } else {
        console.error("Categories dropdown element not found!");
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

// Function to setup search functionality
function setupSearchFunctionality() {
    let autocomplete_block = document.getElementsByClassName("autocomplete");
    autocomplete_block = autocomplete_block[0];
    
    const search_bar = document.getElementById('search');
    
    if (!search_bar || !autocomplete_block) {
        console.error("Search bar or autocomplete block not found!");
        return;
    }
    
    search_bar.addEventListener('input', async function() {
        const cont = document.getElementsByClassName('search-container');
        console.log(cont);
        
        // Remove existing search container
        if (cont.length > 0) {
            autocomplete_block.removeChild(cont[0]);
        }
        
        // Only proceed if search bar has value
        if (search_bar.value.trim()) {
            const response = await handleAutocomplete(search_bar.value);
            
            if (response && response.product_name && response.product_id) {
                let product = response.product_name;
                let id = response.product_id;
                
                const container = document.createElement('DIV');
                container.className = 'search-container';
                container.style.position = 'absolute';
                container.style.width = autocomplete_block.offsetWidth + 'px';
                autocomplete_block.appendChild(container);
                
                for (let j = 0; j < product.length; j++) {
                    const carry = document.createElement('a');
                    carry.className = 'search-carry dropdown-item';
                    carry.href = "http://127.0.0.1:8000/users/home/product/" + id[j];
                    carry.innerHTML = product[j];
                    container.appendChild(carry);
                }
            }
        }
    });
}

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