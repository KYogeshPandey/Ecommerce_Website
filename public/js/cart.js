const API_URL = 'http://localhost:5000';

document.addEventListener('DOMContentLoaded', () => {
    loadCart();
});

// 1. Load Cart Items
async function loadCart() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        // Cache-busting ke liye timestamp add kiya
        const res = await fetch(`${API_URL}/cart?t=${new Date().getTime()}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            const cart = await res.json();
            renderCart(cart.products || []);
            if(window.updateCartCount) window.updateCartCount();
        } else {
            showEmptyCart();
        }
    } catch (error) {
        console.error('Error loading cart:', error);
    }
}

// 2. Render Cart Items HTML
function renderCart(products) {
    const cartContainer = document.getElementById('cart-items');
    if(!cartContainer) return;
    
    cartContainer.innerHTML = '';
    let total = 0;

    if(products.length === 0) {
        showEmptyCart();
        return;
    }

    products.forEach(item => {
        if(!item.product) return;

        const qty = Number(item.quantity); // Force Number
        const price = Number(item.price);
        const itemTotal = price * qty;
        total += itemTotal;

        cartContainer.innerHTML += `
            <div class="glass-card p-3 mb-3 d-flex flex-wrap align-items-center">
                <img src="${item.product.image || 'https://via.placeholder.com/80'}" 
                     alt="${item.product.title}" 
                     class="cart-img rounded me-3 mb-2 mb-md-0" 
                     style="width: 80px; height: 80px; object-fit: cover;">
                
                <div class="flex-grow-1 mb-2 mb-md-0" style="min-width: 150px;">
                    <h5 class="text-white mb-1 fs-6 fs-md-5">${item.product.title}</h5>
                    <h6 class="text-accent mb-0">₹${price}</h6>
                </div>

                <!-- Quantity Controls -->
                <div class="d-flex align-items-center gap-2 mx-md-4 mb-2 mb-md-0 bg-white bg-opacity-10 rounded-pill px-2 py-1">
                    
                    <!-- MINUS BUTTON (Reduces Quantity) -->
                    <button class="btn btn-sm btn-link text-white p-0" 
                            style="width: 24px; height: 24px;"
                            onclick="decreaseQty('${item.product._id}', ${qty})">
                        <i class="bi bi-dash-lg"></i>
                    </button>
                    
                    <span class="fw-bold text-white text-center" style="min-width: 24px;">${qty}</span>
                    
                    <!-- PLUS BUTTON (Increases Quantity) -->
                    <button class="btn btn-sm btn-link text-white p-0" 
                            style="width: 24px; height: 24px;"
                            onclick="increaseQty('${item.product._id}', ${qty})">
                        <i class="bi bi-plus-lg"></i>
                    </button>
                </div>

                <div class="text-end me-4 mb-2 mb-md-0" style="min-width: 80px;">
                    <h6 class="text-white fw-bold mb-0">₹${itemTotal}</h6>
                </div>

                <button class="btn btn-icon-glass text-danger hover-scale ms-auto ms-md-0" 
                        onclick="removeFromCart('${item.product._id}')">
                    <i class="bi bi-trash3-fill"></i>
                </button>
            </div>
        `;
    });

    updateSummary(total);
}

// 3. Explicit Increase Function
function increaseQty(productId, currentQty) {
    const newQty = Number(currentQty) + 1;
    console.log(`Increasing: ${currentQty} + 1 = ${newQty}`);
    updateCartRequest(productId, newQty);
}

// 4. Explicit Decrease Function
function decreaseQty(productId, currentQty) {
    const newQty = Number(currentQty) - 1;
    console.log(`Decreasing: ${currentQty} - 1 = ${newQty}`);
    
    if (newQty < 1) {
        alert("Quantity cannot be less than 1. Use delete button to remove.");
        return;
    }
    updateCartRequest(productId, newQty);
}

// 5. Common Request Function
async function updateCartRequest(productId, newQty) {
    const token = localStorage.getItem('token');
    
    try {
        const res = await fetch(`${API_URL}/cart/update`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ productId, quantity: newQty })
        });

        if (res.ok) {
            loadCart(); 
        } else {
            const err = await res.json();
            alert("Update failed: " + (err.message || "Unknown Error"));
        }
    } catch (error) {
        console.error('Error updating cart:', error);
    }
}

// 6. Remove Function
async function removeFromCart(productId) {
    if(!confirm('Remove item?')) return;
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_URL}/cart/remove/${productId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) loadCart();
    } catch (error) {
        console.error(error);
    }
}

function showEmptyCart() {
    const container = document.getElementById('cart-items');
    if(container) {
        container.innerHTML = `
            <div class="text-center text-white-50 py-5">
                <h4>Your cart is empty</h4>
                <a href="shop.html" class="btn btn-outline-accent mt-3">Start Shopping</a>
            </div>
        `;
    }
    updateSummary(0);
}

function updateSummary(total) {
    const sub = document.getElementById('cart-subtotal');
    const grand = document.getElementById('cart-total');
    if(sub) sub.innerText = `₹${total}`;
    if(grand) grand.innerText = `₹${total}`;
}

// Checkout Handler
document.getElementById('checkoutBtn')?.addEventListener('click', async () => {
    const token = localStorage.getItem('token');
    if(!token) return;
    if(confirm("Place Order (COD)?")) {
        try {
            const res = await fetch(`${API_URL}/orders`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    shippingAddress: { address: "123 St", city: "City", postalCode: "111", country: "IN" },
                    paymentMethod: "COD"
                })
            });
            if (res.ok) {
                alert("Order Placed!");
                window.location.href = 'user/dashboard.html';
            } else {
                alert("Failed");
            }
        } catch (e) { console.error(e); }
    }
});
