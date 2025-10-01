const API_BASE_URL = 'http://localhost:8080/api';
let currentUserType = 'customer';

function switchRole(role) {
    currentUserType = role;

    const buttons = document.querySelectorAll('.role-btn');
    buttons.forEach(btn => {
        if (btn.dataset.role === role) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    document.getElementById('loginForm').reset();
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.style.display = 'none';
}

function showError(message) {
    const errorElement = document.getElementById('errorMessage');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

function hideError() {
    const errorElement = document.getElementById('errorMessage');
    errorElement.style.display = 'none';
}

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    hideError();

    const submitBtn = this.querySelector('.submit-btn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Signing in...</span>';

    try {
        const endpoint = currentUserType === 'customer'
            ? `${API_BASE_URL}/auth/customer/login`
            : `${API_BASE_URL}/auth/manager/login`;

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed. Please check your credentials.');
        }

        const data = await response.json();

        localStorage.setItem('userData', JSON.stringify(data));
        localStorage.setItem('userType', data.userType);

        if (data.userType === 'CUSTOMER') {
            window.location.href = 'customer-dashboard.html';
        } else {
            window.location.href = 'manager-dashboard.html';
        }

    } catch (error) {
        showError(error.message);
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Sign In</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const userData = localStorage.getItem('userData');
    if (userData) {
        const user = JSON.parse(userData);
        if (user.userType === 'CUSTOMER') {
            window.location.href = 'customer-dashboard.html';
        } else {
            window.location.href = 'manager-dashboard.html';
        }
    }
});