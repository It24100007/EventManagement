const API_BASE_URL = 'http://localhost:8080/api';
let currentUser = null;
let currentEventPrice = 0;
let currentBookingTotal = 0;
let cachedBookingsWithPayments = [];

// Check Authentication
function checkAuth() {
    const userData = localStorage.getItem('userData');
    if (!userData) {
        window.location.href = 'index.html';
        return null;
    }

    const user = JSON.parse(userData);
    if (user.userType !== 'CUSTOMER') {
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
    try {
        currentUser = checkAuth();
        if (!currentUser) return;

        console.log('Initializing dashboard for user:', currentUser);

        document.getElementById('userName').textContent = currentUser.name;
        document.getElementById('userEmail').textContent = currentUser.email;
        document.getElementById('userAvatar').textContent = currentUser.name.charAt(0).toUpperCase();

        console.log('Loading dashboard data...');

        await Promise.all([
            loadEvents().catch(err => {
                console.error('Failed to load events:', err);
                document.getElementById('eventsGrid').innerHTML = '<div class="empty-state"><p>Failed to load events. Please check if backend is running.</p></div>';
            }),
            loadBookings().catch(err => {
                console.error('Failed to load bookings:', err);
                document.getElementById('bookingsBody').innerHTML = '<tr><td colspan="8" class="empty-state"><p>Failed to load bookings. Please check if backend is running.</p></td></tr>';
            }),
            loadRSVPs().catch(err => {
                console.error('Failed to load RSVPs:', err);
                document.getElementById('rsvpBody').innerHTML = '<tr><td colspan="5" class="empty-state"><p>Failed to load RSVPs. Please check if backend is running.</p></td></tr>';
            })
        ]);

        console.log('Dashboard loaded successfully!');
    } catch (error) {
        console.error('Dashboard initialization error:', error);
        alert('Error loading dashboard: ' + error.message + '\n\nPlease check if the backend server is running on port 8080.');
    }
}

// Load Available Events
async function loadEvents() {
    try {
        const response = await fetch(`${API_BASE_URL}/events/available`);
        const events = await response.json();

        const eventsGrid = document.getElementById('eventsGrid');

        if (events.length === 0) {
            eventsGrid.innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <h3>No Events Available</h3>
                    <p>Check back later for upcoming events</p>
                </div>
            `;
            return;
        }

        eventsGrid.innerHTML = events.map(event => `
            <div class="event-card">
                <div class="event-image">
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                </div>
                <div class="event-content">
                    <div class="event-header">
                        <h3>${event.name}</h3>
                        <p class="event-date">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12 6 12 12 16 14"/>
                            </svg>
                            ${formatDateTime(event.eventDate)}
                        </p>
                        <p class="event-location">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                <circle cx="12" cy="10" r="3"/>
                            </svg>
                            ${event.location}
                        </p>
                    </div>
                    <p style="color: var(--gray); font-size: 14px; margin-bottom: 12px;">${event.description || 'No description available'}</p>
                    <div class="event-footer">
                        <div>
                            <div class="event-price">$${event.pricePerSeat}</div>
                            <div style="font-size: 12px; color: var(--gray);">per seat</div>
                        </div>
                        <span class="event-seats">${event.availableSeats} seats left</span>
                    </div>
                    <div style="display: flex; gap: 8px; margin-top: 16px;">
                        <button class="btn btn-primary" style="flex: 1;" onclick="openBookingModal(${event.id}, '${event.name.replace(/'/g, "\\'")}', ${event.pricePerSeat}, ${event.availableSeats})">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                            </svg>
                            Book
                        </button>
                        <button class="btn btn-secondary" onclick="openRsvpModal(${event.id}, '${event.name.replace(/'/g, "\\'")}')">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                <polyline points="22 4 12 14.01 9 11.01"/>
                            </svg>
                            RSVP
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading events:', error);
        document.getElementById('eventsGrid').innerHTML = `
            <div class="empty-state">
                <p>Error loading events. Please refresh the page.</p>
            </div>
        `;
    }
}

// Load Bookings
async function loadBookings() {
    try {
        const response = await fetch(`${API_BASE_URL}/bookings/customer/${currentUser.id}`);
        const bookings = await response.json();

        document.getElementById('totalBookings').textContent = bookings.length;
        document.getElementById('confirmedBookings').textContent =
            bookings.filter(b => b.bookingStatus === 'CONFIRMED').length;

        const bookingsBody = document.getElementById('bookingsBody');

        if (bookings.length === 0) {
            bookingsBody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-state">
                        <p>No bookings yet</p>
                    </td>
                </tr>
            `;
            return;
        }

        // Fetch payment status for each booking
        const bookingsWithPayments = await Promise.all(
            bookings.map(async (booking) => {
                try {
                    const paymentResponse = await fetch(`${API_BASE_URL}/payments`);
                    const allPayments = await paymentResponse.json();
                    const payment = allPayments.find(p => p.booking.id === booking.id);
                    return { ...booking, payment };
                } catch {
                    return { ...booking, payment: null };
                }
            })
        );

        // Cache the data for cancel modal
        cachedBookingsWithPayments = bookingsWithPayments;

        bookingsBody.innerHTML = bookingsWithPayments.map(booking => {
            const payment = booking.payment;
            const paymentStatus = payment ? payment.paymentStatus : 'N/A';
            const refundDate = payment && payment.refundDate ? formatDateTime(payment.refundDate) : null;

            return `
            <tr>
                <td><strong>#${booking.id}</strong></td>
                <td>${booking.event.name}</td>
                <td>${booking.seatsBooked}</td>
                <td>
                    <strong>${booking.totalAmount}</strong>
                    ${paymentStatus === 'REFUNDED' && refundDate ? `
                        <br><span style="color: var(--success); font-size: 12px;">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle;">
                                <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            Refunded on ${refundDate}
                        </span>
                    ` : ''}
                </td>
                <td><span class="status-badge status-${booking.bookingStatus.toLowerCase()}">${booking.bookingStatus}</span></td>
                <td>
                    <span class="status-badge status-${paymentStatus.toLowerCase().replace('_', '-')}">${paymentStatus.replace('_', ' ')}</span>
                </td>
                <td>${formatDateTime(booking.bookingDate)}</td>
                <td>
                    <div class="action-buttons">
                        ${booking.bookingStatus === 'PENDING' || booking.bookingStatus === 'CONFIRMED' ? `
                            <button class="btn btn-primary btn-sm" onclick="openAddSeatsModal(${booking.id}, '${booking.event.name.replace(/'/g, "\\'")}', ${booking.event.pricePerSeat}, ${booking.event.availableSeats}, ${booking.seatsBooked})" title="Add more seats">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="12" y1="5" x2="12" y2="19"/>
                                    <line x1="5" y1="12" x2="19" y2="12"/>
                                </svg>
                                Add Seats
                            </button>
                        ` : ''}
                        ${booking.bookingStatus === 'PENDING' ? `
                            <button class="btn btn-danger btn-sm" onclick="openCancelModalById(${booking.id})">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                                Cancel
                            </button>
                        ` : ''}
                        ${booking.bookingStatus === 'CONFIRMED' || booking.bookingStatus === 'PENDING' ? '' : '-'}
                    </div>
                </td>
            </tr>
        `}).join('');
    } catch (error) {
        console.error('Error loading bookings:', error);
    }
}

// Load RSVPs
async function loadRSVPs() {
    try {
        const response = await fetch(`${API_BASE_URL}/rsvp/customer/${currentUser.id}`);
        const rsvps = await response.json();

        document.getElementById('totalRsvps').textContent = rsvps.length;

        const rsvpBody = document.getElementById('rsvpBody');

        if (rsvps.length === 0) {
            rsvpBody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state">
                        <p>No RSVPs yet</p>
                    </td>
                </tr>
            `;
            return;
        }

        rsvpBody.innerHTML = rsvps.map(rsvp => `
            <tr>
                <td><strong>${rsvp.event.name}</strong></td>
                <td>${rsvp.event.location}</td>
                <td>${formatDateTime(rsvp.event.eventDate)}</td>
                <td><span class="status-badge ${rsvp.response === 'YES' ? 'status-confirmed' : rsvp.response === 'NO' ? 'status-canceled' : 'status-pending'}">${rsvp.response}</span></td>
                <td>${formatDateTime(rsvp.rsvpDate)}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading RSVPs:', error);
    }
}

// Open Booking Modal
function openBookingModal(eventId, eventName, pricePerSeat, availableSeats) {
    currentEventPrice = pricePerSeat;

    document.getElementById('eventId').value = eventId;
    document.getElementById('eventName').value = eventName;
    document.getElementById('pricePerSeat').value = `${pricePerSeat}`;
    document.getElementById('availableSeats').value = availableSeats;
    document.getElementById('seats').value = '';
    document.getElementById('seats').max = availableSeats;
    document.getElementById('paymentMethod').value = '';
    document.getElementById('bookingError').style.display = 'none';
    document.getElementById('totalAmountSection').style.display = 'none';
    document.getElementById('displayPrice').textContent = pricePerSeat;
    document.getElementById('bookingModal').classList.add('active');
}

// Calculate Total Amount
function calculateTotal() {
    const seats = parseInt(document.getElementById('seats').value) || 0;
    const totalAmountSection = document.getElementById('totalAmountSection');

    if (seats > 0) {
        const total = seats * currentEventPrice;
        document.getElementById('totalAmount').textContent = total.toFixed(2);
        document.getElementById('selectedSeats').textContent = seats;
        totalAmountSection.style.display = 'block';
    } else {
        totalAmountSection.style.display = 'none';
    }
}

function closeBookingModal() {
    document.getElementById('bookingModal').classList.remove('active');
}

// Open RSVP Modal
function openRsvpModal(eventId, eventName) {
    document.getElementById('rsvpEventId').value = eventId;
    document.getElementById('rsvpEventName').value = eventName;
    document.getElementById('rsvpResponse').value = '';
    document.getElementById('rsvpError').style.display = 'none';
    document.getElementById('rsvpModal').classList.add('active');
}

function closeRsvpModal() {
    document.getElementById('rsvpModal').classList.remove('active');
}

// Open Add Seats Modal
function openAddSeatsModal(bookingId, eventName, pricePerSeat, availableSeats, currentSeats) {
    currentEventPrice = pricePerSeat;
    currentBookingTotal = currentSeats * pricePerSeat;

    document.getElementById('updateBookingId').value = bookingId;
    document.getElementById('updateEventName').value = eventName;
    document.getElementById('currentSeats').value = currentSeats + ' seats';
    document.getElementById('updatePricePerSeat').value = `${pricePerSeat}`;
    document.getElementById('updateAvailableSeats').value = availableSeats + ' seats';
    document.getElementById('additionalSeats').value = '';
    document.getElementById('additionalSeats').max = availableSeats;
    document.getElementById('addSeatsError').style.display = 'none';
    document.getElementById('updateTotalSection').style.display = 'none';
    document.getElementById('addSeatsModal').classList.add('active');
}

function closeAddSeatsModal() {
    document.getElementById('addSeatsModal').classList.remove('active');
}

// Calculate Update Total
function calculateUpdateTotal() {
    const additionalSeats = parseInt(document.getElementById('additionalSeats').value) || 0;
    const updateTotalSection = document.getElementById('updateTotalSection');

    if (additionalSeats > 0) {
        const additionalCost = additionalSeats * currentEventPrice;
        const newTotal = currentBookingTotal + additionalCost;

        document.getElementById('additionalAmount').textContent = additionalCost.toFixed(2);
        document.getElementById('addingSeats').textContent = additionalSeats;
        document.getElementById('newTotalAmount').textContent = newTotal.toFixed(2);
        updateTotalSection.style.display = 'block';
    } else {
        updateTotalSection.style.display = 'none';
    }
}

// Open Cancel Modal by Booking ID
function openCancelModalById(bookingId) {
    // Find the booking from cached data
    const booking = cachedBookingsWithPayments.find(b => b.id === bookingId);

    if (!booking) {
        alert('Booking not found');
        return;
    }

    const paymentStatus = booking.payment ? booking.payment.paymentStatus : 'PENDING';

    openCancelModal(
        booking.id,
        booking.event.name,
        booking.totalAmount,
        paymentStatus
    );
}

// Open Cancel Modal with Refund Info
function openCancelModal(bookingId, eventName, amount, paymentStatus) {
    document.getElementById('cancelBookingId').value = bookingId;
    document.getElementById('cancelEventName').value = eventName;
    document.getElementById('cancelAmount').value = `${amount}`;

    const refundInfo = document.getElementById('refundInfo');
    const noRefundInfo = document.getElementById('noRefundInfo');

    if (paymentStatus === 'COMPLETED') {
        refundInfo.style.display = 'block';
        noRefundInfo.style.display = 'none';
        document.getElementById('refundAmount').textContent = parseFloat(amount).toFixed(2);
    } else {
        refundInfo.style.display = 'none';
        noRefundInfo.style.display = 'block';
    }

    document.getElementById('cancelModal').classList.add('active');
}

function closeCancelModal() {
    document.getElementById('cancelModal').classList.remove('active');
}

async function confirmCancelBooking() {
    const bookingId = parseInt(document.getElementById('cancelBookingId').value);
    const cancelBtn = document.querySelector('#cancelModal .btn-danger');
    const keepBtn = document.querySelector('#cancelModal .btn-secondary');

    // Disable buttons
    cancelBtn.disabled = true;
    keepBtn.disabled = true;
    cancelBtn.innerHTML = '<span>Processing Cancellation...</span>';

    try {
        console.log('Canceling booking:', bookingId);

        const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
            method: 'DELETE'
        });

        console.log('Cancel response status:', response.status);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Cancellation failed');
        }

        const result = await response.json();
        console.log('Cancel result:', result);

        closeCancelModal();

        // Show detailed refund notification
        if (result.refundStatus === 'REFUNDED') {
            showRefundSuccessNotification();
        } else {
            showSuccessToast('Booking canceled successfully');
        }

        // Reload data
        await Promise.all([
            loadBookings(),
            loadEvents()
        ]);

    } catch (error) {
        console.error('Cancel error:', error);
        alert('Error canceling booking: ' + error.message);

        // Re-enable buttons
        cancelBtn.disabled = false;
        keepBtn.disabled = false;
        cancelBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Yes, Cancel Booking';
    }
}

// Show Refund Success Notification with Progress
function showRefundSuccessNotification() {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        color: #1f2937;
        padding: 40px;
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        z-index: 3000;
        max-width: 500px;
        width: 90%;
        animation: scaleIn 0.3s ease;
    `;

    // Get refund amount from modal
    const refundAmount = document.getElementById('refundAmount').textContent;

    notification.innerHTML = `
        <div style="text-align: center;">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #10b981 0%, #059f69 100%); border-radius: 50%; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; animation: bounceIn 0.5s ease;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"/>
                </svg>
            </div>
            
            <h2 style="font-size: 28px; font-weight: 800; color: #1f2937; margin-bottom: 16px;">
                Booking Canceled Successfully!
            </h2>
            
            <div style="background: linear-gradient(135deg, #10b98115 0%, #059f6915 100%); padding: 24px; border-radius: 12px; margin: 24px 0;">
                <p style="color: #059f69; font-weight: 700; font-size: 16px; margin-bottom: 12px;">
                    💰 REFUND PROCESSED
                </p>
                <p style="font-size: 42px; font-weight: 800; color: #10b981; line-height: 1; margin-bottom: 8px;">
                    ${refundAmount}
                </p>
                <p style="color: #6b7280; font-size: 14px;">
                    Full refund amount
                </p>
            </div>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                    <div style="width: 32px; height: 32px; background: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <span style="color: white; font-weight: 700;">1</span>
                    </div>
                    <div style="text-align: left; flex: 1;">
                        <p style="font-weight: 600; color: #1f2937; font-size: 14px; margin-bottom: 2px;">Booking Canceled</p>
                        <p style="color: #10b981; font-size: 12px;">✓ Completed</p>
                    </div>
                </div>
                
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                    <div style="width: 32px; height: 32px; background: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <span style="color: white; font-weight: 700;">2</span>
                    </div>
                    <div style="text-align: left; flex: 1;">
                        <p style="font-weight: 600; color: #1f2937; font-size: 14px; margin-bottom: 2px;">Seats Released</p>
                        <p style="color: #10b981; font-size: 12px;">✓ Completed</p>
                    </div>
                </div>
                
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 32px; height: 32px; background: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <span style="color: white; font-weight: 700;">3</span>
                    </div>
                    <div style="text-align: left; flex: 1;">
                        <p style="font-weight: 600; color: #1f2937; font-size: 14px; margin-bottom: 2px;">Refund Initiated</p>
                        <p style="color: #10b981; font-size: 12px;">✓ Completed</p>
                    </div>
                </div>
            </div>
            
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin-bottom: 24px; text-align: left;">
                <p style="color: #92400e; font-size: 14px; line-height: 1.6;">
                    <strong>⏱️ Timeline:</strong><br>
                    The refund amount will be credited to your original payment method within <strong>5-7 business days</strong>.
                </p>
            </div>
            
            <button onclick="this.parentElement.parentElement.remove(); document.getElementById('modalOverlay').remove();" style="width: 100%; padding: 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 700; cursor: pointer;">
                Got It, Thanks!
            </button>
        </div>
    `;

    // Add overlay
    const overlay = document.createElement('div');
    overlay.id = 'modalOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        z-index: 2999;
        backdrop-filter: blur(4px);
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(notification);

    // Auto-remove after 15 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'scaleOut 0.3s ease';
            setTimeout(() => {
                notification.remove();
                overlay.remove();
            }, 300);
        }
    }, 15000);
}

// Handle Booking Form Submit
document.getElementById('bookingForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const eventId = parseInt(document.getElementById('eventId').value);
    const seats = parseInt(document.getElementById('seats').value);
    const paymentMethod = document.getElementById('paymentMethod').value;
    const errorElement = document.getElementById('bookingError');

    errorElement.style.display = 'none';

    const submitBtn = this.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Processing...</span>';

    try {
        const response = await fetch(`${API_BASE_URL}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                customerId: currentUser.id,
                eventId: eventId,
                seats: seats,
                paymentMethod: paymentMethod
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Booking failed');
        }

        const result = await response.json();

        closeBookingModal();
        showSuccessToast('Booking created successfully! Awaiting payment approval.');

        await loadBookings();
        await loadEvents();

    } catch (error) {
        errorElement.textContent = error.message;
        errorElement.style.display = 'block';
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Confirm Booking';
    }
});

// Handle RSVP Form Submit
document.getElementById('rsvpForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const eventId = parseInt(document.getElementById('rsvpEventId').value);
    const response = document.getElementById('rsvpResponse').value;
    const errorElement = document.getElementById('rsvpError');

    errorElement.style.display = 'none';

    const submitBtn = this.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Submitting...</span>';

    try {
        const apiResponse = await fetch(`${API_BASE_URL}/rsvp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                customerId: currentUser.id,
                eventId: eventId,
                response: response
            })
        });

        if (!apiResponse.ok) {
            const error = await apiResponse.json();
            throw new Error(error.message || 'RSVP submission failed');
        }

        const result = await apiResponse.json();

        closeRsvpModal();
        showSuccessToast(result.message);

        await loadRSVPs();

    } catch (error) {
        errorElement.textContent = error.message;
        errorElement.style.display = 'block';
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Submit RSVP';
    }
});

// Handle Add Seats Form Submit
document.getElementById('addSeatsForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const bookingId = parseInt(document.getElementById('updateBookingId').value);
    const additionalSeats = parseInt(document.getElementById('additionalSeats').value);
    const errorElement = document.getElementById('addSeatsError');

    errorElement.style.display = 'none';

    const submitBtn = this.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Processing...</span>';

    try {
        const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                additionalSeats: additionalSeats
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to add seats');
        }

        const result = await response.json();

        closeAddSeatsModal();
        showSuccessToast(result.message);

        await loadBookings();
        await loadEvents();

    } catch (error) {
        errorElement.textContent = error.message;
        errorElement.style.display = 'block';
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Seats to Booking';
    }
});

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
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Close modals on outside click
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
}

// Add CSS animation for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    
    @keyframes scaleIn {
        from {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0;
        }
        to {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
        }
    }
    
    @keyframes scaleOut {
        from {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
        }
        to {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0;
        }
    }
    
    @keyframes bounceIn {
        0% {
            transform: scale(0);
        }
        50% {
            transform: scale(1.1);
        }
        100% {
            transform: scale(1);
        }
    }
`;
document.head.appendChild(style);

// Initialize on page load
document.addEventListener('DOMContentLoaded', initDashboard);