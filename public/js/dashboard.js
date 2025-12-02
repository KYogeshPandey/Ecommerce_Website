const API_URL = 'http://localhost:5000'; 

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
            loadDashboardData() 
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
function loadUserProfile() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
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

// --- 2. Load Dashboard Stats & Orders ---
async function loadDashboardData() {
    try {
        const token = localStorage.getItem('token');
        
        // Fetch Orders
        const ordersRes = await fetch(`${API_URL}/orders/myorders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const orders = await ordersRes.json();

        // Fetch Cart (for count)
        const cartRes = await fetch(`${API_URL}/cart`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const cartData = await cartRes.json();

        // --- Update Stats Cards ---
        if (orders.length >= 0) {
            const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
            
            // Update HTML Elements
            document.getElementById('statTotalOrders').textContent = orders.length;
            document.getElementById('statTotalSpent').textContent = `₹${totalSpent.toLocaleString('en-IN')}`;
            document.getElementById('statCartItems').textContent = cartData.products ? cartData.products.length : 0;
        }

        // --- Render Recent Orders Table ---
        renderOrdersTable(orders);

    } catch (error) {
        console.error('Data load error:', error);
    }
}

function renderOrdersTable(orders) {
    const tableBody = document.getElementById('ordersTableBody');
    if (!tableBody) return;

    if (orders.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-white-50 py-3">No orders found. <a href="../shop.html" class="text-accent">Start Shopping</a></td></tr>`;
        return;
    }

    tableBody.innerHTML = orders.map(order => {
        const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric'
        });

        return `
            <tr>
                <td class="text-white font-monospace">#${order._id.slice(-6).toUpperCase()}</td>
                <td class="text-white-50">${date}</td>
                <td>${getStatusBadge(order.status)}</td>
                <td class="text-white fw-bold">₹${order.totalAmount.toLocaleString('en-IN')}</td>
                <td>
                    <button class="btn btn-sm btn-icon-glass text-primary" onclick="viewOrder('${order._id}')">
                        <i class="bi bi-eye"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Helper: Status Badge Logic
function getStatusBadge(status) {
    const styles = {
        'Processing': 'bg-warning text-warning',
        'Shipped': 'bg-info text-info',
        'Delivered': 'bg-success text-success',
        'Cancelled': 'bg-danger text-danger'
    };
    const style = styles[status] || 'bg-secondary text-white';
    
    return `<span class="badge ${style} bg-opacity-10 border border-opacity-25 rounded-pill px-3">${status}</span>`;
}

// --- 3. Event Listeners (Logout) ---
function setupEventListeners() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm("Are you sure you want to logout?")) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '../login.html';
            }
        });
    }
}

// Helper for View Button (Updated to redirect)
window.viewOrder = function(orderId) {
    window.location.href = `order-details.html?id=${orderId}`;
};
