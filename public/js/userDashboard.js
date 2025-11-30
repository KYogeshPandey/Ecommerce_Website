const API_URL = 'http://localhost:5000';

// Check authentication and load user data
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadUserProfile();
    loadDashboardStats();
    loadProducts();
    loadOrders();
    setupEventListeners();
});

// Check if user is authenticated
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token || !user) {
        alert('Please login to access the dashboard');
        window.location.href = '/login.html';
        return;
    }

    // If user is a seller, redirect to admin dashboard
    if (user.role === 'seller') {
        window.location.href = '/admin/dashboard.html';
        return;
    }
}

// Load user profile
async function loadUserProfile() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Set user name in navbar and welcome message
    const userNameEl = document.getElementById('user-name');
    const welcomeNameEl = document.getElementById('welcome-name');

    if (userNameEl) userNameEl.textContent = user.name || 'User';
    if (welcomeNameEl) welcomeNameEl.textContent = user.name || 'User';

    // Fetch fresh profile data from backend
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/user/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (res.ok) {
            const profile = await res.json();
            // Update localStorage with fresh data
            localStorage.setItem('user', JSON.stringify(profile));
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

// Load dashboard statistics
async function loadDashboardStats() {
    const token = localStorage.getItem('token');

    try {
        // Load orders count
        const ordersRes = await fetch(`${API_URL}/user/orders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (ordersRes.ok) {
            const orders = await ordersRes.json();
            document.getElementById('total-orders').textContent = orders.length;

            // Calculate total spent
            const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
            document.getElementById('total-spent').textContent = totalSpent.toFixed(2);
        }

        // Load cart count
        const cartRes = await fetch(`${API_URL}/user/cart`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (cartRes.ok) {
            const cart = await cartRes.json();
            const itemCount = cart.products ? cart.products.length : 0;
            document.getElementById('cart-items').textContent = itemCount;
            document.getElementById('cart-count').textContent = itemCount;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load products
async function loadProducts() {
    const container = document.getElementById('products-container');

    try {
        const res = await fetch(`${API_URL}/products`);
        const products = await res.json();

        if (products.length === 0) {
            container.innerHTML = '<div class="col-12 text-center"><p class="text-white-50">No products available</p></div>';
            return;
        }

        // Show only first 3 products on dashboard
        const displayProducts = products.slice(0, 3);

        container.innerHTML = displayProducts.map(product => `
            <div class="col-md-4">
                <div class="product-card">
                    <img src="${product.image}" alt="${product.title}" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
                    <div class="product-card-body">
                        <h5 class="fw-bold mb-2">${product.title}</h5>
                        <p class="text-white-50 small mb-3">${product.description.substring(0, 80)}...</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <h4 class="text-gradient mb-0">₹${product.price}</h4>
                            <button class="btn btn-primary btn-sm" onclick="addToCart('${product._id}')">
                                <i class="bi bi-cart-plus me-1"></i>Add
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading products:', error);
        container.innerHTML = '<div class="col-12 text-center"><p class="text-danger">Error loading products</p></div>';
    }
}

// Load orders
async function loadOrders() {
    const tbody = document.getElementById('orders-table-body');
    const token = localStorage.getItem('token');

    try {
        const res = await fetch(`${API_URL}/user/orders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            const orders = await res.json();

            if (orders.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center">No orders yet</td></tr>';
                return;
            }

            // Show only recent 5 orders
            const recentOrders = orders.slice(0, 5);

            tbody.innerHTML = recentOrders.map(order => {
                const date = new Date(order.createdAt).toLocaleDateString();
                const itemCount = order.products ? order.products.length : 0;
                const statusClass = order.status === 'Delivered' ? 'bg-success' :
                    order.status === 'Pending' ? 'bg-warning' : 'bg-info';

                return `
                    <tr>
                        <td>#${order._id.substring(0, 8)}</td>
                        <td>${date}</td>
                        <td>${itemCount} items</td>
                        <td>₹${order.totalAmount || 0}</td>
                        <td><span class="badge ${statusClass}">${order.status || 'Processing'}</span></td>
                    </tr>
                `;
            }).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">Error loading orders</td></tr>';
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error loading orders</td></tr>';
    }
}

// Add to cart function
async function addToCart(productId) {
    const token = localStorage.getItem('token');

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
            alert('✅ Product added to cart!');
            loadDashboardStats(); // Refresh cart count
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
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.href = '/login.html';
        });
    }
}
