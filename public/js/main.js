const API_URL = 'http://localhost:5000';

// Check if user is logged in
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (token && user) {
        updateNav(user);
    } else {
        updateNav(null);
    }
}

// Update Navigation Bar
function updateNav(user) {
    const authLinks = document.getElementById('auth-links');
    if (user) {
        let links = `
            <li class="nav-item">
                <a class="nav-link" href="/cart.html">Cart <span id="cart-count" class="badge bg-secondary">0</span></a>
            </li>
            <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    ${user.name}
                </a>
                <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                    <li><a class="dropdown-item" href="#" onclick="logout()">Logout</a></li>
                </ul>
            </li>
        `;

        if (user.role === 'admin') {
            links += `
                <li class="nav-item">
                    <a class="nav-link" href="/admin/dashboard.html">Admin Dashboard</a>
                </li>
            `;
        }
        authLinks.innerHTML = links;
        updateCartCount();
    } else {
        authLinks.innerHTML = `
            <li class="nav-item">
                <a class="nav-link" href="/login.html">Login</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="/register.html">Register</a>
            </li>
        `;
    }
}

// Logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
}

// Update Cart Count
async function updateCartCount() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const res = await fetch(`${API_URL}/cart`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const cart = await res.json();
        if (cart && cart.products) {
            const count = cart.products.reduce((acc, item) => acc + item.quantity, 0);
            const badge = document.getElementById('cart-count');
            if (badge) badge.innerText = count;
        }
    } catch (error) {
        console.error('Error fetching cart count:', error);
    }
}

// Initial check
document.addEventListener('DOMContentLoaded', checkAuth);
