const API_BASE_URL = 'http://localhost:8080/api';
let currentManager = null;

// Check Authentication
function checkAuth() {
    const userData = localStorage.getItem('userData');
    if (!userData) {
        window.location.href = 'index.html';
        return null;
    }

    const user = JSON.parse(userData);
    if (user.userType !== 'FINANCE_MANAGER') {
        window.location.href = 'index.html';
        return null;
    }

    return user;
}

// Logout
function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}

// Initialize Dashboard
async function initDashboard() {
    currentManager = checkAuth();
    if (!currentManager) return;

    document.getElementById('managerName').textContent = currentManager.name;
    document.getElementById('managerEmail').textContent = currentManager.email;
    document.getElementById('managerAvatar').textContent = currentManager.name.charAt(0).toUpperCase();

    await Promise.all([
        loadStatistics(),
        loadPendingPayments(),
        loadPaymentHistory()
    ]);

    setDefaultDateRange();
}

// Set Default Date Range (Last 30 days)
function setDefaultDateRange() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

    document.getElementById('endDate').value = formatDateTimeLocal(now);
    document.getElementById('startDate').value = formatDateTimeLocal(thirtyDaysAgo);
}

function formatDateTimeLocal(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Load Statistics
async function loadStatistics() {
    try {
        const [paymentStats, bookingStats] = await Promise.all([
            fetch(`${API_BASE_URL}/payments/statistics`).then(r => r.json()),
            fetch(`${API_BASE_URL}/bookings/statistics`).then(r => r.json())
        ]);

        document.getElementById('pendingPayments').textContent = paymentStats.pendingPayments || 0;
        document.getElementById('completedPayments').textContent = paymentStats.completedPayments || 0;
        document.getElementById('totalRevenue').textContent = `$${(paymentStats.totalRevenue || 0).toFixed(2)}`;
        document.getElementById('totalBookings').textContent = bookingStats.totalBookings || 0;

    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

// Load Pending Payments
async function loadPendingPayments() {
    try {
        const response = await fetch(`${API_BASE_URL}/payments/pending`);
        const payments = await response.json();

        const tbody = document.getElementById('pendingPaymentsBody');

        if (payments.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 48px; height: 48px; margin: 0 auto 12px; opacity: 0.3;">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        <h3>No Pending Payments</h3>
                        <p>All payments have been processed</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = payments.map(payment => `
            <tr>
                <td><strong>#${payment.id}</strong></td>
                <td>${payment.booking.customer.name}</td>
                <td>${payment.booking.event.name}</td>
                <td><strong>$${payment.amount}</strong></td>
                <td><span class="status-badge status-${payment.paymentMethod.toLowerCase().replace('_', '-')}">${payment.paymentMethod.replace('_', ' ')}</span></td>
                <td>${formatDateTime(payment.paymentDate)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-success btn-sm" onclick="approvePayment(${payment.id})">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            Approve
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="rejectPayment(${payment.id})">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                            Reject
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

    } catch (error) {
        console.error('Error loading pending payments:', error);
    }
}

// Load Payment History
async function loadPaymentHistory() {
    try {
        const response = await fetch(`${API_BASE_URL}/payments`);
        const payments = await response.json();

        const completedPayments = payments.filter(p => p.paymentStatus !== 'PENDING');

        const tbody = document.getElementById('paymentHistoryBody');

        if (completedPayments.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <p>No payment history available</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = completedPayments.map(payment => `
            <tr>
                <td><strong>#${payment.id}</strong></td>
                <td>${payment.booking.customer.name}</td>
                <td>${payment.booking.event.name}</td>
                <td><strong>$${payment.amount}</strong></td>
                <td><span class="status-badge status-${payment.paymentStatus.toLowerCase().replace('_', '-')}">${payment.paymentStatus.replace('_', ' ')}</span></td>
                <td>${payment.approvedBy ? payment.approvedBy.name : '-'}</td>
                <td>${payment.approvedDate ? formatDateTime(payment.approvedDate) : formatDateTime(payment.paymentDate)}</td>
            </tr>
        `).join('');

    } catch (error) {
        console.error('Error loading payment history:', error);
    }
}

// Approve Payment
async function approvePayment(paymentId) {
    if (!confirm('Are you sure you want to approve this payment?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/payments/${paymentId}/approve`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                managerId: currentManager.id
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Approval failed');
        }

        const result = await response.json();
        showSuccessToast(result.message);

        await Promise.all([
            loadStatistics(),
            loadPendingPayments(),
            loadPaymentHistory()
        ]);

    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// Reject Payment
async function rejectPayment(paymentId) {
    if (!confirm('Are you sure you want to reject this payment? The booking will be cancelled.')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/payments/${paymentId}/reject`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                managerId: currentManager.id
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Rejection failed');
        }

        const result = await response.json();
        showSuccessToast(result.message);

        await Promise.all([
            loadStatistics(),
            loadPendingPayments(),
            loadPaymentHistory()
        ]);

    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// Generate Report
async function generateReport() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    if (!startDate || !endDate) {
        alert('Please select both start and end dates');
        return;
    }

    try {
        const [bookingsResponse, paymentsResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/bookings/report?startDate=${startDate}&endDate=${endDate}`),
            fetch(`${API_BASE_URL}/payments/report?startDate=${startDate}&endDate=${endDate}`)
        ]);

        const bookings = await bookingsResponse.json();
        const payments = await paymentsResponse.json();

        const completedPayments = payments.filter(p => p.paymentStatus === 'COMPLETED');
        const totalRevenue = completedPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

        document.getElementById('reportBookings').textContent = bookings.length;
        document.getElementById('reportRevenue').textContent = `$${totalRevenue.toFixed(2)}`;
        document.getElementById('reportResults').style.display = 'block';

        showSuccessToast('Report generated successfully');

    } catch (error) {
        alert('Error generating report: ' + error.message);
    }
}

// Show Success Toast
function showSuccessToast(message) {
    const toast = document.createElement('div');
    toast.className = 'success-toast';
    toast.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
        </svg>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 4000);
}

// Format DateTime
function formatDateTime(dateTimeString) {
    if (!dateTimeString) return '-';
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initDashboard);