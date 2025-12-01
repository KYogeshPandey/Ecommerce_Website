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
        // User Logged In View
        authContainer.innerHTML = `
            <div class="dropdown">
                <button class="btn btn-link text-white text-decoration-none dropdown-toggle fw-semibold" type="button" data-bs-toggle="dropdown">
                    Hi, ${user.name}
                </button>
                <ul class="dropdown-menu dropdown-menu-end bg-dark border-secondary shadow">
                    ${user.role === 'admin' ? '<li><a class="dropdown-item text-white-50" href="/admin/dashboard.html">Admin Dashboard</a></li>' : ''}
                    <li><a class="dropdown-item text-white-50" href="user/dashboard.html">Dashboard</a></li>
                    <li><hr class="dropdown-divider bg-secondary"></li>
                    <li><a class="dropdown-item text-white-50" href="#" id="logoutBtn">Logout</a></li>
                </ul>
            </div>
            <a href="cart.html" class="position-relative btn btn-glass rounded-circle p-0 d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                <i class="bi bi-bag text-white fs-5"></i>
                <span id="cart-badge" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-accent" style="font-size: 0.6rem; display: none;">
                    0
                </span>
            </a>
        `;

        // Bind Logout Event
        document.getElementById('logoutBtn').addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
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
