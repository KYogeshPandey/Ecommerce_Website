const API_URL = 'http://localhost:5000/api'; // Backend URL adjust karein

document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
});

async function initializeDashboard() {
    // 1. Auth Check
    if (!checkAuth()) return;

    // 2. Parallel Data Fetching for Speed
    try {
        await Promise.all([
            loadUserProfile(),
            loadDashboardStats(),
            loadRecentOrders()
        ]);
    } catch (error) {
        console.error("Dashboard loading error:", error);
    }

    // 3. Setup Event Listeners
    setupEventListeners();
}

// --- Authentication Check ---
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '../login.html';
        return false;
    }
    return true;
}

// --- 1. Load User Profile (Navbar & Sidebar) ---
async function loadUserProfile() {
    try {
        const token = localStorage.getItem('token');
        // Pehle LocalStorage se dikha do (Fast UI)
        const cachedUser = JSON.parse(localStorage.getItem('user') || '{}');
        updateProfileUI(cachedUser);

        // Phir Network se fresh data lao
        const res = await fetch(`${API_URL}/user/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            const user = await res.json();
            localStorage.setItem('user', JSON.stringify(user));
            updateProfileUI(user);
        }
    } catch (error) {
        console.error('Profile load error:', error);
    }
}

function updateProfileUI(user) {
    if (!user.name) return;
    
    // Navbar Name
    const navUser = document.getElementById('userName');
    if (navUser) navUser.textContent = user.name;

    // Sidebar Profile
    const sideUser = document.getElementById('sidebarUserName');
    const sideEmail = document.getElementById('sidebarUserEmail');
    
    if (sideUser) sideUser.textContent = user.name;
    if (sideEmail) sideEmail.textContent = user.email;
}

// --- 2. Load Dashboard Stats (Cards) ---
async function loadDashboardStats() {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/user/dashboard-stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            const stats = await res.json();
            
            // HTML elements update
            document.querySelector('.bi-box-seam').closest('.glass-card').querySelector('h3').textContent = stats.totalOrders || 0;
            document.querySelector('.bi-cart-check').closest('.glass-card').querySelector('h3').textContent = stats.cartCount || 0;
            document.querySelector('.bi-wallet2').closest('.glass-card').querySelector('h3').textContent = `₹${stats.totalSpent.toLocaleString('en-IN')}`;
        }
    } catch (error) {
        console.error('Stats error:', error);
    }
}

// --- 3. Load Recent Orders (Table) ---
async function loadRecentOrders() {
    const tableBody = document.querySelector('tbody'); // Table Body select
    if (!tableBody) return;

    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/user/orders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            const orders = await res.json();
            
            if (orders.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-white-50 py-3">No orders found</td></tr>`;
                return;
            }

            tableBody.innerHTML = orders.map(order => {
                // Date formatting
                const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric'
                });

                // Status Badge Logic
                let badgeClass = 'bg-secondary';
                if (order.status === 'Delivered') badgeClass = 'bg-success';
                if (order.status === 'Processing') badgeClass = 'bg-warning text-dark';
                if (order.status === 'Cancelled') badgeClass = 'bg-danger';

                return `
                    <tr>
                        <td class="text-white">#${order._id.slice(-6).toUpperCase()}</td>
                        <td class="text-white-50">${date}</td>
                        <td><span class="badge ${badgeClass}">${order.status}</span></td>
                        <td class="text-white">₹${order.totalAmount.toLocaleString('en-IN')}</td>
                        <td>
                            <button class="btn btn-sm btn-outline-light" onclick="viewOrder('${order._id}')">View</button>
                        </td>
                    </tr>
                `;
            }).join('');
        }
    } catch (error) {
        console.error('Orders error:', error);
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Error loading orders</td></tr>`;
    }
}

// --- 4. Event Listeners (Logout) ---
function setupEventListeners() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm("Are you sure you want to logout?")) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '../index.html';
            }
        });
    }
}

// Helper for View Button
function viewOrder(orderId) {
    alert('View Order functionality coming soon! Order ID: ' + orderId);
    // Future: window.location.href = `/user/order-details.html?id=${orderId}`;
}
