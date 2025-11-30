const API_URL = 'http://localhost:5000';

// State management
let allProducts = [];
let filteredProducts = [];
let currentCategory = 'all';
let currentSearchTerm = '';
let currentSort = 'default';

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadProducts();
    setupEventListeners();
    parseURLParams();
});

// Check authentication and update navbar
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const authSection = document.getElementById('auth-section');

    if (token && user) {
        authSection.innerHTML = `
            <div class="dropdown">
                <a class="nav-link dropdown-toggle d-flex align-items-center text-white" href="#" id="userDropdown"
                    role="button" data-bs-toggle="dropdown">
                    <div class="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2"
                        style="width: 35px; height: 35px;">
                        <i class="bi bi-person-fill"></i>
                    </div>
                    <span>${user.name || 'User'}</span>
                </a>
                <ul class="dropdown-menu dropdown-menu-end bg-dark border-secondary">
                    <li><a class="dropdown-item text-white-50" href="${user.role === 'seller' ? '/admin/dashboard.html' : '/user/dashboard.html'}">Dashboard</a></li>
                    <li><hr class="dropdown-divider bg-secondary"></li>
                    <li><a class="dropdown-item text-danger" href="#" id="logout-btn">Logout</a></li>
                </ul>
            </div>
        `;

        // Logout handler
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.clear();
                window.location.href = '/login.html';
            });
        }

        // Load cart count
        loadCartCount();
    }
}

// Load cart count
async function loadCartCount() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const res = await fetch(`${API_URL}/user/cart`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            const cart = await res.json();
            const itemCount = cart.products ? cart.products.length : 0;
            document.getElementById('cart-count').textContent = itemCount;
        }
    } catch (error) {
        console.error('Error loading cart count:', error);
    }
}

// Parse URL parameters
function parseURLParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');

    if (category && category !== 'all') {
        currentCategory = category;
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.category === category) {
                btn.classList.add('active');
            }
        });
    }
}

// Load all products
async function loadProducts() {
    const container = document.getElementById('products-container');

    try {
        const res = await fetch(`${API_URL}/products`);
        const products = await res.json();

        allProducts = products;
        filteredProducts = products;

        // Apply initial category filter from URL
        if (currentCategory !== 'all') {
            applyFilters();
        } else {
            displayProducts(products);
        }
    } catch (error) {
        console.error('Error loading products:', error);
        container.innerHTML = `
            <div class="col-12 empty-state">
                <i class="bi bi-exclamation-triangle"></i>
                <h4 class="text-white-50">Error loading products</h4>
                <p class="text-white-50">Please try again later</p>
            </div>
        `;
    }
}

// Display products
function displayProducts(products) {
    const container = document.getElementById('products-container');

    if (products.length === 0) {
        container.innerHTML = `
            <div class="col-12 empty-state">
                <i class="bi bi-inbox"></i>
                <h4 class="text-white-50">No products found</h4>
                <p class="text-white-50">Try adjusting your filters or search term</p>
            </div>
        `;
        return;
    }

    container.innerHTML = products.map(product => `
        <div class="col-lg-3 col-md-4 col-sm-6">
            <div class="product-card">
                <img src="${product.image || 'https://via.placeholder.com/300x250?text=No+Image'}" 
                     alt="${product.title}" 
                     class="product-image"
                     onerror="this.src='https://via.placeholder.com/300x250?text=No+Image'">
                <div class="product-body">
                    ${product.category ? `<span class="product-category">${product.category}</span>` : ''}
                    <h5 class="product-title">${product.title}</h5>
                    <p class="product-description">${product.description || 'No description available'}</p>
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <span class="product-price">₹${product.price}</span>
                        ${product.stock > 0 ?
            `<span class="badge bg-success">In Stock</span>` :
            `<span class="badge bg-danger">Out of Stock</span>`
        }
                    </div>
                    <button class="btn-add-cart" 
                            onclick="addToCart('${product._id}')"
                            ${product.stock <= 0 ? 'disabled' : ''}>
                        <i class="bi bi-cart-plus me-2"></i>Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Apply filters
function applyFilters() {
    let products = [...allProducts];

    // Category filter
    if (currentCategory !== 'all') {
        products = products.filter(p => p.category === currentCategory);
    }

    // Search filter
    if (currentSearchTerm) {
        const searchLower = currentSearchTerm.toLowerCase();
        products = products.filter(p =>
            p.title.toLowerCase().includes(searchLower) ||
            (p.description && p.description.toLowerCase().includes(searchLower)) ||
            (p.category && p.category.toLowerCase().includes(searchLower))
        );
    }

    // Sort
    switch (currentSort) {
        case 'price-asc':
            products.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            products.sort((a, b) => b.price - a.price);
            break;
        case 'name-asc':
            products.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'name-desc':
            products.sort((a, b) => b.title.localeCompare(a.title));
            break;
    }

    filteredProducts = products;
    displayProducts(products);
}

// Add to cart
async function addToCart(productId) {
    const token = localStorage.getItem('token');

    if (!token) {
        alert('Please login to add products to cart');
        window.location.href = '/login.html';
        return;
    }

    try {
        const res = await fetch(`${API_URL}/cart/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ productId, quantity: 1 })
        });

        if (res.ok) {
            // Success feedback
            const btn = event.target.closest('.btn-add-cart');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="bi bi-check-circle me-2"></i>Added!';
            btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';

            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.background = '';
            }, 2000);

            // Update cart count
            loadCartCount();
        } else {
            const data = await res.json();
            alert('Error: ' + (data.message || 'Failed to add to cart'));
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        alert('Error adding to cart. Please try again.');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Category filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update category and apply filters
            currentCategory = btn.dataset.category;
            applyFilters();
        });
    });

    // Search input
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', (e) => {
        currentSearchTerm = e.target.value;
        applyFilters();
    });

    // Sort select
    const sortSelect = document.getElementById('sort-select');
    sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        applyFilters();
    });
}
