const API_URL = 'http://localhost:5000';

// 🛡️ 1. Admin Check (Har page par chalega)
function checkAdminAuth() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

    if (!token || !user || user.role !== 'seller') {
        alert('⛔ Access Denied! Sellers only.');
        window.location.href = '/login.html';
    } else {
        // Set Admin Name
        const adminNameEl = document.getElementById('admin-name');
        if (adminNameEl) adminNameEl.innerText = user.name;
    }
}

// 📊 2. Dashboard Logic (Sirf Dashboard par chalega)
async function loadDashboardStats() {
    const token = localStorage.getItem('token');
    try {
        const resProd = await fetch(`${API_URL}/products`);
        const products = await resProd.json();
        const prodCountEl = document.getElementById('total-products');
        if (prodCountEl) prodCountEl.innerText = products.length || 0;

        const resOrd = await fetch(`${API_URL}/orders/admin`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const orders = await resOrd.json();
        const ordCountEl = document.getElementById('total-orders');
        if (ordCountEl) ordCountEl.innerText = orders.length || 0;

    } catch (error) {
        console.error('Dashboard Error:', error);
    }
}

// 🛍️ 3. Load Products Table Logic (Fixed Layout & Edit Button)
async function loadAdminProducts() {
    const tbody = document.getElementById('admin-products-table');
    if (!tbody) return;

    try {
        const res = await fetch(`${API_URL}/products`);
        const products = await res.json();

        tbody.innerHTML = '';
        if (products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No products found.</td></tr>';
            return;
        }

        products.forEach(product => {
            tbody.innerHTML += `
                <tr class="align-middle">
                    <td><img src="${product.image}" width="50" style="border-radius: 5px;"></td>
                    <td>${product.title}</td>
                    <td>₹${product.price.toLocaleString('en-IN')}</td>
                    <td>${product.stock}</td>
                    <td>
                        <div class="d-flex gap-2">
                            <a href="edit_product.html?id=${product._id}" class="btn btn-sm btn-warning">Edit</a>
                            <button class="btn btn-sm btn-danger" onclick="deleteProduct('${product._id}')">Delete</button>
                        </div>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error(error);
    }
}

// 📦 4. Load Orders Table Logic
async function loadAdminOrders() {
    const tbody = document.getElementById('admin-orders-list');
    if (!tbody) return;

    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_URL}/orders/admin`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const orders = await res.json();

        tbody.innerHTML = '';
        if (orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No orders found.</td></tr>';
            return;
        }

        orders.forEach(order => {
            tbody.innerHTML += `
                <tr class="align-middle">
                    <td>${order._id}</td>
                    <td>${order.userId ? order.userId.name : 'Unknown'}</td>
                    <td>₹${order.totalAmount.toLocaleString('en-IN')}</td>
                    <td><span class="badge bg-success">Completed</span></td>
                    <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
            `;
        });
    } catch (error) {
        console.error(error);
    }
}

// ➕ 5. Add Product Logic
async function handleAddProduct(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const productData = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        price: document.getElementById('price').value,
        category: document.getElementById('category').value,
        image: document.getElementById('image').value,
        stock: 10
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
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error(error);
        alert('Something went wrong');
    }
}

// 🗑️ Delete Product (Global Function)
window.deleteProduct = async function (id) {
    if (!confirm('Are you sure?')) return;
    const token = localStorage.getItem('token');

    try {
        const res = await fetch(`${API_URL}/products/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            loadAdminProducts();
        } else {
            alert('Failed to delete');
        }
    } catch (error) {
        console.error(error);
    }
};

// 🚀 INITIALIZATION 
document.addEventListener('DOMContentLoaded', () => {
    checkAdminAuth();

    if (document.getElementById('total-products')) loadDashboardStats();
    if (document.getElementById('admin-products-table')) loadAdminProducts();
    if (document.getElementById('admin-orders-list')) loadAdminOrders();

    const addForm = document.getElementById('add-product-form');
    if (addForm) addForm.addEventListener('submit', handleAddProduct);
});
