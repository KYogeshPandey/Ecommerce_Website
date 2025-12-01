const API_URL = 'http://localhost:5000';

// --- Main Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Pehle Auth Check karo
    if (!checkAdminAuth()) return;

    // 2. Page ke hisab se data load karo
    if (document.getElementById('total-products')) {
        loadDashboardStats();
    }

    if (document.getElementById('admin-products-table')) {
        loadAdminProducts();
    }

    if (document.getElementById('admin-orders-list')) {
        loadAdminOrders();
    }

    const addForm = document.getElementById('add-product-form');
    if (addForm) {
        addForm.addEventListener('submit', handleAddProduct);
    }
});

// 🛡️ 1. Admin/Seller Authentication Check
function checkAdminAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Agar token nahi hai ya user role 'buyer' hai -> Bhagao
    if (!token || !user._id) {
        alert('Please login first.');
        window.location.href = '/login.html';
        return false;
    }

    // "Seller" aur "Admin" dono ko allow karo
    if (user.role !== 'seller' && user.role !== 'admin') {
        alert('⛔ Access Denied! This area is for Sellers only.');
        window.location.href = '/user/dashboard.html'; // Buyer dashboard pe bhejo
        return false;
    }

    // Set Admin Name on Dashboard
    const adminNameEl = document.getElementById('admin-name');
    if (adminNameEl) adminNameEl.innerText = user.name || 'Seller';

    return true;
}

// 📊 2. Dashboard Stats (Only runs on Dashboard Page)
async function loadDashboardStats() {
    const token = localStorage.getItem('token');
    
    try {
        // Parallel Fetching for Speed
        const [resProd, resOrd] = await Promise.all([
            fetch(`${API_URL}/products`),
            fetch(`${API_URL}/orders/admin`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
        ]);

        if (resProd.ok) {
            const products = await resProd.json();
            const prodCountEl = document.getElementById('total-products');
            if (prodCountEl) prodCountEl.innerText = products.length || 0;
        }

        if (resOrd.ok) {
            const orders = await resOrd.json();
            const ordCountEl = document.getElementById('total-orders');
            if (ordCountEl) ordCountEl.innerText = orders.length || 0;
        }

    } catch (error) {
        console.error('Dashboard Stats Error:', error);
    }
}

// 🛍️ 3. Load Products Table (Manage Products Page)
async function loadAdminProducts() {
    const tbody = document.getElementById('admin-products-table');
    if (!tbody) return;

    try {
        const res = await fetch(`${API_URL}/products`);
        const products = await res.json();

        if (products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No products found.</td></tr>';
            return;
        }

        tbody.innerHTML = products.map(product => `
            <tr class="align-middle">
                <td><img src="${product.image}" width="50" style="border-radius: 5px;" 
                    onerror="this.src='https://via.placeholder.com/50'"></td>
                <td>${product.title}</td>
                <td>₹${product.price.toLocaleString('en-IN')}</td>
                <td>${product.stock || 10}</td>
                <td>
                    <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-danger" onclick="deleteProduct('${product._id}')">Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Load Products Error:', error);
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error loading products</td></tr>';
    }
}

// 📦 4. Load Orders Table (Manage Orders Page)
async function loadAdminOrders() {
    const tbody = document.getElementById('admin-orders-list');
    if (!tbody) return;

    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_URL}/orders/admin`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const orders = await res.json();

        if (orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No orders found.</td></tr>';
            return;
        }

        tbody.innerHTML = orders.map(order => `
            <tr class="align-middle">
                <td>#${order._id.substring(0, 8).toUpperCase()}</td>
                <td>${order.userId ? order.userId.name : 'Guest'}</td>
                <td>₹${(order.totalAmount || 0).toLocaleString('en-IN')}</td>
                <td><span class="badge bg-success">${order.status || 'Completed'}</span></td>
                <td>${new Date(order.createdAt).toLocaleDateString()}</td>
            </tr>
        `).join('');

    } catch (error) {
        console.error('Load Orders Error:', error);
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error loading orders</td></tr>';
    }
}

// ➕ 5. Add Product Logic
async function handleAddProduct(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerText;
    submitBtn.innerText = 'Adding...';
    submitBtn.disabled = true;

    const productData = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        price: document.getElementById('price').value,
        category: document.getElementById('category').value,
        image: document.getElementById('image').value,
        stock: document.getElementById('stock') ? document.getElementById('stock').value : 10
    };

    try {
        const res = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(productData)
        });

        if (res.ok) {
            alert('✅ Product Added Successfully!');
            window.location.href = '/admin/products.html';
        } else {
            const data = await res.json();
            alert('Error: ' + (data.message || 'Failed to add product'));
        }
    } catch (error) {
        console.error('Add Product Error:', error);
        alert('Something went wrong');
    } finally {
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
    }
}

// 🗑️ Delete Product (Global Function)
window.deleteProduct = async function (id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    const token = localStorage.getItem('token');

    try {
        const res = await fetch(`${API_URL}/products/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            // Agar hum products page par hain to list refresh karo
            if (document.getElementById('admin-products-table')) {
                loadAdminProducts();
            } else {
                // Agar dashboard par hain to reload karo ya stats update karo
                window.location.reload();
            }
        } else {
            alert('Failed to delete product');
        }
    } catch (error) {
        console.error('Delete Error:', error);
        alert('Server Error');
    }
};
