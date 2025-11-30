// public/js/login.js

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Lamp & Switch Logic ---
    const switchBtn = document.getElementById('lightSwitch');
    const body = document.body;

    // Auto-on effect
    setTimeout(() => {
        if (switchBtn && !switchBtn.checked) {
            switchBtn.checked = true;
            body.classList.add('lights-on');
        }
    }, 500);

    if (switchBtn) {
        switchBtn.addEventListener('change', function () {
            if (this.checked) {
                body.classList.add('lights-on');
            } else {
                body.classList.remove('lights-on');
            }
        });
    }

    // --- 2. Login Form Logic ---
    const loginForm = document.getElementById('loginForm'); // ID matches HTML

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const btn = loginForm.querySelector('button[type="submit"]');
            const originalText = btn.innerText;

            // Loading State
            btn.innerText = 'Logging in...';
            btn.disabled = true;

            try {
                const res = await fetch('http://localhost:5000/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await res.json();

                if (res.ok) {
                    localStorage.setItem('token', data.token);
                    // Backend returns user data directly (not nested)
                    localStorage.setItem('user', JSON.stringify(data));

                    btn.innerText = 'Success!';
                    btn.classList.remove('btn-primary-gradient');
                    btn.classList.add('btn-success'); // Bootstrap success color

                    setTimeout(() => {
                        // Role-based redirection
                        if (data.role === 'seller') {
                            window.location.href = '/admin/dashboard.html';
                        } else if (data.role === 'buyer') {
                            window.location.href = '/user/dashboard.html';
                        } else {
                            // Fallback for any other role
                            window.location.href = 'index.html';
                        }
                    }, 1000);
                } else {
                    alert(data.message || 'Login Failed');
                    btn.innerText = originalText;
                    btn.disabled = false;
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Something went wrong. Is the server running?');
                btn.innerText = originalText;
                btn.disabled = false;
            }
        });
    } else {
        console.error("Error: Login Form with ID 'loginForm' not found.");
    }
});
