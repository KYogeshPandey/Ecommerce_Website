const API_URL = 'http://localhost:5000';

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    updateCartCount();
});

// 1. Check Authentication & Update Navbar
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Target containers in both simplified (shop) and full (index) navbars
    const authContainer = document.querySelector('.auth-buttons-container') || document.querySelector('.d-flex.gap-3.align-items-center');

    if (!authContainer) return;

    if (token && user.name) {
        // Decide Links based on Role
        let dashboardLink = '';
        
        if (user.role === 'admin') {
            // Admin gets both Admin Panel & User View
            dashboardLink = `
                <li><a class="dropdown-item text-white-50" href="/admin/dashboard.html"><i class="bi bi-speedometer2 me-2"></i> Admin Panel</a></li>
                <li><a class="dropdown-item text-white-50" href="/user/dashboard.html"><i class="bi bi-person me-2"></i> My Account</a></li>
            `;
        } else {
            // Normal User gets only My Account
            dashboardLink = `
                <li><a class="dropdown-item text-white-50" href="/user/dashboard.html"><i class="bi bi-grid me-2"></i> My Dashboard</a></li>
                <li><a class="dropdown-item text-white-50" href="/user/dashboard.html"><i class="bi bi-bag-check me-2"></i> My Orders</a></li>
            `;
        }

        // User Logged In View
        authContainer.innerHTML = `
            <div class="dropdown">
                <button class="btn btn-link text-white text-decoration-none dropdown-toggle fw-semibold d-flex align-items-center gap-2" type="button" data-bs-toggle="dropdown">
                    <div class="avatar-circle-xs bg-accent text-dark d-flex align-items-center justify-content-center rounded-circle" style="width: 30px; height: 30px; font-size: 14px;">
                        ${user.name.charAt(0).toUpperCase()}
                    </div>
                    <span class="d-none d-md-inline">Hi, ${user.name.split(' ')[0]}</span>
                </button>
                <ul class="dropdown-menu dropdown-menu-end glass-dropdown shadow border-secondary mt-2">
                    ${dashboardLink}
                    <li><hr class="dropdown-divider bg-secondary opacity-25"></li>
                    <li><a class="dropdown-item text-danger" href="#" id="logoutBtn"><i class="bi bi-box-arrow-right me-2"></i> Logout</a></li>
                </ul>
            </div>
            <a href="cart.html" class="position-relative btn btn-glass rounded-circle p-0 d-flex align-items-center justify-content-center ms-2" style="width: 40px; height: 40px;">
                <i class="bi bi-bag text-white fs-5"></i>
                <span id="cart-badge" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-accent border border-dark" style="font-size: 0.6rem; display: none;">
                    0
                </span>
            </a>
        `;

        // Bind Logout Event
        document.getElementById('logoutBtn').addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login.html'; // Corrected Path with slash
        });

    } else {
        // Guest View
        authContainer.innerHTML = `
            <a href="login.html" class="btn btn-glass btn-sm px-4 rounded-pill">Login</a>
            <a href="register.html" class="btn btn-primary-gradient rounded-pill px-4 py-2 small-btn d-none d-md-block">Sign Up</a>
        `;
    }
}

// 2. Global Cart Count Updater
async function updateCartCount() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const res = await fetch(`${API_URL}/cart`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
            const cart = await res.json();
            // Calculate total items securely
            let count = 0;
            if (cart && cart.products) {
                count = cart.products.reduce((acc, item) => acc + (item.quantity || 0), 0);
            }

            // Update all badge instances
            const badges = document.querySelectorAll('#cart-badge, .badge.bg-accent');
            badges.forEach(badge => {
                badge.textContent = count;
                badge.style.display = count > 0 ? 'inline-block' : 'none';
            });
        }
    } catch (error) {
        console.error('Error fetching cart count:', error);
    }
}

// Export function for use in other scripts (like shop.html)
window.updateCartCount = updateCartCount;
