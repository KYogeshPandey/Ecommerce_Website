// public/js/login.js

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Lamp & Switch Logic ---
    const switchBtn = document.getElementById('lightSwitch');
    const body = document.body;

    // ⚡ DEFAULT STATE: Lights OFF
    // Page load hone par switch OFF rahega aur 'lights-on' class nahi hogi.
    if (switchBtn) {
        switchBtn.checked = false; // Switch visually OFF
        body.classList.remove('lights-on'); // Lights OFF
    }

    // Toggle Logic
    if (switchBtn) {
        switchBtn.addEventListener('change', function () {
            // Switch change hone par lights toggle hongi
            body.classList.toggle('lights-on', this.checked);
        });
    }

    // --- 2. Login Form Logic (Same as before) ---
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const btn = loginForm.querySelector('button[type="submit"]');
            const originalText = btn.innerText;

            btn.innerText = 'Logging in...';
            btn.disabled = true;

            try {
                const res = await fetch('http://localhost:5000/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await res.json();

                if (res.ok) {
                    localStorage.setItem('token', data.token);
                    // User data ko localStorage mein save
                    const user = { _id: data._id, name: data.name, email: data.email, role: data.role };
                    localStorage.setItem('user', JSON.stringify(user));

                    btn.innerText = 'Success!';
                    btn.classList.replace('btn-primary-gradient', 'btn-success');

                    setTimeout(() => {
                        // Backend se redirect URL
                        if (data.redirectUrl) {
                            window.location.href = data.redirectUrl;
                        } else {
                            window.location.href = '/index.html';
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
