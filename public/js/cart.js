const CART_API = 'http://localhost:5000/cart';

// Add to Cart Function (Home Page se call hoga)
async function addToCart(productId) {
    const token = localStorage.getItem('token');

    if (!token) {
        alert('Please login to add items to cart!');
        window.location.href = '/login.html';
        return;
    }

    try {
        const res = await fetch(`${CART_API}/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ productId, quantity: 1 })
        });

        if (res.ok) {
            alert('Item added to cart! 🛒');
            updateCartCount(); // Navbar count update karega
        } else {
            alert('Failed to add item.');
        }
    } catch (error) {
        console.error(error);
    }
}

// Load Cart Items (Cart Page par call hoga)
async function loadCart() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    try {
        const res = await fetch(CART_API, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const cart = await res.json();
        renderCart(cart);
    } catch (error) {
        console.error(error);
    }
}

// Render Cart HTML
function renderCart(cart) {
    const cartTable = document.getElementById('cart-table-body');
    const cartTotal = document.getElementById('cart-total');
    
    if (!cartTable) return; // Agar hum cart page par nahi hain toh ruk jao

    cartTable.innerHTML = '';
    let total = 0;

    if (!cart || cart.products.length === 0) {
        cartTable.innerHTML = '<tr><td colspan="5" class="text-center">Your cart is empty 😢</td></tr>';
        cartTotal.innerText = 'Total: ₹0';
        return;
    }

    cart.products.forEach(item => {
        const product = item.productId;
        // Handle case where product might be deleted from DB
        if(!product) return; 

        const itemTotal = product.price * item.quantity;
        total += itemTotal;

        cartTable.innerHTML += `
            <tr>
                <td>
                    <img src="${product.image}" alt="${product.title}" style="width: 50px; height: 50px; object-fit: cover;">
                </td>
                <td>${product.title}</td>
                <td>₹${product.price.toLocaleString('en-IN')}</td>
                <td>${item.quantity}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="removeFromCart('${product._id}')">Remove</button>
                </td>
            </tr>
        `;
    });

    cartTotal.innerText = `Total: ₹${total.toLocaleString('en-IN')}`;
}

// Remove Item
async function removeFromCart(productId) {
    const token = localStorage.getItem('token');
    if(!confirm('Are you sure?')) return;

    try {
        const res = await fetch(`${CART_API}/${productId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            loadCart(); // Refresh list
            updateCartCount();
        }
    } catch (error) {
        console.error(error);
    }
}

// Run loadCart only if on cart page
if (window.location.pathname.includes('cart.html')) {
    document.addEventListener('DOMContentLoaded', loadCart);
}
