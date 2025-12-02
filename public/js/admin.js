const API_URL = 'http://localhost:5000';

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    if (!checkAdminAuth()) return;

    const path = window.location.pathname;

    // Dashboard Page Logic
    if (path.includes('dashboard.html')) {
        loadDashboardStats();
    } 
    
    // Products Page Logic
    else if (path.includes('products.html')) {
        loadProducts();
    }

    // Handle Add/Edit Product Form Submission (Used in Modal)
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', handleProductSubmit);
    }
});

// 🛡️ 1. Admin/Seller Authentication Check
function checkAdminAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token || !user._id) {
        window.location.href = '../login.html';
        return false;
    }

    if (user.role !== 'seller' && user.role !== 'admin') {
        alert('⛔ Access Denied! Sellers/Admins only.');
        window.location.href = '../user/dashboard.html';
        return false;
    }

    // Set Admin Name in Sidebar if element exists
    const adminNameEl = document.getElementById('adminName');
    if (adminNameEl) adminNameEl.innerText = user.name;

    return true;
}

// 📊 2. Load Dashboard Stats (Overview)
async function loadDashboardStats() {
    const token = localStorage.getItem('token');

    try {
        // Fetch Products & Orders in Parallel
        const [resProducts, resOrders] = await Promise.all([
            fetch(`${API_URL}/products`),
            fetch(`${API_URL}/orders/admin`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        // Update Product Count
        if (resProducts.ok) {
            const products = await resProducts.json();
            const countEl = document.getElementById('productCount');
            if (countEl) countEl.innerText = products.length;
        }

        // Update Orders Table & Count
        if (resOrders.ok) {
            const orders = await resOrders.json();
            const recentTable = document.getElementById('recentOrdersTable');
            
            if (recentTable) {
                if (orders.length === 0) {
                    recentTable.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-white-50">No orders yet.</td></tr>';
                } else {
                    // Show last 5 orders
                    recentTable.innerHTML = orders.slice(0, 5).map(order => `
                        <tr>
                            <td class="text-white">#${order._id.slice(-6).toUpperCase()}</td>
                            <td class="text-white-50">${order.userId ? order.userId.name : 'Guest'}</td>
                            <td><span class="badge bg-success bg-opacity-25 text-success">${order.status || 'Processing'}</span></td>
                            <td class="text-white fw-bold">₹${order.totalAmount}</td>
                            <td><button class="btn btn-sm btn-icon-glass text-primary"><i class="bi bi-eye"></i></button></td>
                        </tr>
                    `).join('');
                }
            }
        }
    } catch (error) {
        console.error('Dashboard Load Error:', error);
    }
}

// 🛍️ 3. Load Products (Manage Products Page)
async function loadProducts() {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;

    try {
        const res = await fetch(`${API_URL}/products`);
        const products = await res.json();

        if (products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center py-5 text-white-50">No products in inventory.</td></tr>';
            return;
        }

        tbody.innerHTML = products.map(p => `
            <tr>
                <td><img src="${p.image}" width="40" height="40" class="rounded object-fit-cover"></td>
                <td class="text-white fw-medium">${p.title}</td>
                <td class="text-white-50">${p.category}</td>
                <td class="text-accent fw-bold">₹${p.price}</td>
                <td><span class="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25">${p.stock} Stock</span></td>
                <td>
                    <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-icon-glass text-warning" onclick="openEditModal('${p._id}')">
                            <i class="bi bi-pencil-fill"></i>
                        </button>
                        <button class="btn btn-sm btn-icon-glass text-danger" onclick="deleteProduct('${p._id}')">
                            <i class="bi bi-trash-fill"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

    } catch (error) {
        console.error('Load Products Error:', error);
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Failed to load data.</td></tr>';
    }
}

// ➕ 4. Handle Add/Edit Product Submit
async function handleProductSubmit(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const id = document.getElementById('productId').value; // Hidden ID field
    
    const productData = {
        title: document.getElementById('pName').value,
        price: document.getElementById('pPrice').value,
        stock: document.getElementById('pStock').value,
        category: document.getElementById('pCategory').value,
        image: document.getElementById('pImage').value,
        description: document.getElementById('pDesc').value,
    };

    const method = id ? 'PUT' : 'POST';
    const endpoint = id ? `/products/${id}` : '/products';

    try {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(productData)
        });

        if (res.ok) {
            alert(id ? 'Product Updated!' : 'Product Added!');
            // Close Modal Manually
            const modalEl = document.getElementById('addProductModal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            modal.hide();
            
            // Refresh List
            loadProducts();
            // Reset Form
            document.getElementById('productForm').reset();
            document.getElementById('productId').value = '';
            document.getElementById('modalTitle').innerText = 'Add Product';
        } else {
            alert('Operation Failed');
        }
    } catch (error) {
        console.error(error);
        alert('Server Error');
    }
}

// ✏️ 5. Pre-fill Modal for Editing
window.openEditModal = async function(id) {
    try {
        const res = await fetch(`${API_URL}/products/${id}`);
        const p = await res.json();

        // Populate Fields
        document.getElementById('productId').value = p._id;
        document.getElementById('pName').value = p.title;
        document.getElementById('pPrice').value = p.price;
        document.getElementById('pStock').value = p.stock;
        document.getElementById('pCategory').value = p.category;
        document.getElementById('pImage').value = p.image;
        document.getElementById('pDesc').value = p.description;

        // Change Modal Title
        document.getElementById('modalTitle').innerText = 'Edit Product';

        // Show Modal
        const modal = new bootstrap.Modal(document.getElementById('addProductModal'));
        modal.show();

    } catch (error) {
        console.error(error);
    }
};

// Update Initialization Section:
document.addEventListener('DOMContentLoaded', () => {
    if (!checkAdminAuth()) return;
    const path = window.location.pathname;

    if (path.includes('dashboard.html')) loadDashboardStats();
    else if (path.includes('products.html')) loadProducts();
    else if (path.includes('orders.html')) loadOrders(); // NEW LINE

    const productForm = document.getElementById('productForm');
    if (productForm) productForm.addEventListener('submit', handleProductSubmit);
});

// ... (loadDashboardStats, loadProducts, handleProductSubmit Logic same as before) ...

// 🆕 NEW: Load Orders Logic
async function loadOrders() {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;
    const token = localStorage.getItem('token');

    try {
        const res = await fetch(`${API_URL}/orders/admin`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const orders = await res.json();

        if (orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center py-5 text-white-50">No orders found.</td></tr>';
            return;
        }

        tbody.innerHTML = orders.map(o => `
            <tr>
                <td class="text-white font-monospace">#${o._id.slice(-6).toUpperCase()}</td>
                <td class="text-white">${o.userId ? o.userId.name : 'Guest'} <br> <small class="text-white-50">${o.shippingAddress?.phone || ''}</small></td>
                <td class="text-white-50">${new Date(o.createdAt).toLocaleDateString()}</td>
                <td class="text-accent fw-bold">₹${o.totalAmount}</td>
                <td>${getStatusBadge(o.status)}</td>
                <td>
                    <button class="btn btn-sm btn-icon-glass text-primary" onclick="openStatusModal('${o._id}', '${o.status}')">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                </td>
            </tr>
        `).join('');

    } catch (error) {
        console.error('Load Orders Error:', error);
    }
}

// Helper for Badges
function getStatusBadge(status) {
    const colors = {
        'Processing': 'warning',
        'Shipped': 'info',
        'Delivered': 'success',
        'Cancelled': 'danger'
    };
    const color = colors[status] || 'secondary';
    return `<span class="badge bg-${color} bg-opacity-25 text-${color} border border-${color} border-opacity-25">${status}</span>`;
}

// 🆕 NEW: Status Update Modal Logic
window.openStatusModal = function(id, currentStatus) {
    document.getElementById('statusOrderId').value = id;
    document.getElementById('orderStatusSelect').value = currentStatus;
    new bootstrap.Modal(document.getElementById('updateStatusModal')).show();
};

window.saveOrderStatus = async function() {
    const id = document.getElementById('statusOrderId').value;
    const status = document.getElementById('orderStatusSelect').value;
    const token = localStorage.getItem('token');

    try {
        const res = await fetch(`${API_URL}/orders/${id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        });

        if (res.ok) {
            alert('Order Status Updated!');
            bootstrap.Modal.getInstance(document.getElementById('updateStatusModal')).hide();
            loadOrders(); // Refresh Table
        } else {
            alert('Update Failed');
        }
    } catch (error) {
        console.error(error);
    }
};

// 🗑️ 6. Delete Product
window.deleteProduct = async function(id) {
    if (!confirm('Delete this product permanently?')) return;
    const token = localStorage.getItem('token');

    try {
        const res = await fetch(`${API_URL}/products/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            loadProducts();
        } else {
            alert('Delete Failed');
        }
    } catch (error) {
        console.error(error);
    }
};

// 🚪 7. Logout Logic
window.logout = function() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '../login.html';
};
