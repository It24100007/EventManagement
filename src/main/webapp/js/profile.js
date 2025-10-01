// API Base URL - Update this to match your backend
const API_BASE_URL = 'http://localhost:8080/api/users';

// DOM Elements
const loadingSpinner = document.getElementById('loadingSpinner');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const successMessage = document.getElementById('successMessage');
const successText = document.getElementById('successText');
const userProfile = document.getElementById('userProfile');
const editModal = document.getElementById('editModal');
const deleteModal = document.getElementById('deleteModal');

// User Data Elements
const userName = document.getElementById('userName');
const userEmail = document.getElementById('userEmail');
const userGender = document.getElementById('userGender');
const userRole = document.getElementById('userRole');
const userCreatedAt = document.getElementById('userCreatedAt');
const userUpdatedAt = document.getElementById('userUpdatedAt');

// Edit Form Elements
const editForm = document.getElementById('editForm');
const editFirstName = document.getElementById('editFirstName');
const editLastName = document.getElementById('editLastName');
const editEmail = document.getElementById('editEmail');
const editGender = document.getElementById('editGender');
const editRole = document.getElementById('editRole');
const editPassword = document.getElementById('editPassword');

// Buttons
const logoutBtn = document.getElementById('logoutBtn');
const editBtn = document.getElementById('editBtn');
const deleteBtn = document.getElementById('deleteBtn');
const closeEditModal = document.getElementById('closeEditModal');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

// Current user data
let currentUser = null;

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', () => {
    checkAuthentication();
    loadUserData();
    setupEventListeners();
});

// Check if user is authenticated
function checkAuthentication() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        window.location.href = '/login';
    }
}

// Setup event listeners
function setupEventListeners() {
    logoutBtn.addEventListener('click', handleLogout);
    editBtn.addEventListener('click', openEditModal);
    deleteBtn.addEventListener('click', openDeleteModal);
    closeEditModal.addEventListener('click', closeEditModalHandler);
    cancelEditBtn.addEventListener('click', closeEditModalHandler);
    cancelDeleteBtn.addEventListener('click', closeDeleteModalHandler);
    confirmDeleteBtn.addEventListener('click', handleDelete);
    editForm.addEventListener('submit', handleUpdate);
}

// Load user data from API
async function loadUserData() {
    const userId = localStorage.getItem('userId');
    if(!userId){
        window.location.href= "/login"
        return;
    }
    try {
        showLoading(true);
        hideError();
        
        const response = await fetch(`${API_BASE_URL}/${userId}`);
        const data = await response.json();
        
        if (data.success && data.user) {
            currentUser = data.user;
            displayUserData(data.user);
        } else {
            showError('Failed to load user data');
            setTimeout(() => {
                handleLogout();
            }, 2000);
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        showError('Failed to connect to the server');
        setTimeout(() => {
            handleLogout();
        }, 2000);
    } finally {
        showLoading(false);
    }
}

// Display user data in the UI
function displayUserData(user) {
    userName.textContent = `${user.firstName} ${user.lastName}`;
    userEmail.textContent = user.email;
    userGender.textContent = user.gender;
    userRole.textContent = user.role;
    userCreatedAt.textContent = formatDate(user.createdAt);
    userUpdatedAt.textContent = formatDate(user.updatedAt);
    
    userProfile.classList.remove('hidden');
}

// Format date to readable format
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Open edit modal
function openEditModal() {
    editFirstName.value = currentUser.firstName;
    editLastName.value = currentUser.lastName;
    editEmail.value = currentUser.email;
    editGender.value = currentUser.gender;
    editRole.value = currentUser.role;
    editPassword.value = '';
    
    editModal.classList.remove('hidden');
}

// Close edit modal
function closeEditModalHandler() {
    editModal.classList.add('hidden');
    editForm.reset();
}

// Open delete modal
function openDeleteModal() {
    deleteModal.classList.remove('hidden');
}

// Close delete modal
function closeDeleteModalHandler() {
    deleteModal.classList.add('hidden');
}

// Handle user update
async function handleUpdate(e) {
    e.preventDefault();
    
    const userId = localStorage.getItem('userId');
    const updatedData = {
        firstName: editFirstName.value.trim(),
        lastName: editLastName.value.trim(),
        email: editEmail.value.trim(),
        gender: editGender.value,
        role: editRole.value
    };
    
    // Only include password if it's been changed
    if (editPassword.value.trim()) {
        updatedData.password = editPassword.value.trim();
    }
    
    try {
        showLoading(true);
        hideError();
        
        const response = await fetch(`${API_BASE_URL}/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        });
        
        const data = await response.json();
        
        if (data.success && data.user) {
            currentUser = data.user;
            displayUserData(data.user);
            closeEditModalHandler();
            showSuccess('Profile updated successfully!');
        } else {
            showError(data.error || 'Failed to update profile');
        }
    } catch (error) {
        console.error('Error updating user:', error);
        showError('Failed to connect to the server');
    } finally {
        showLoading(false);
    }
}

// Handle user delete
async function handleDelete() {
    const userId = localStorage.getItem('userId');
    
    try {
        showLoading(true);
        hideError();
        
        const response = await fetch(`${API_BASE_URL}/${userId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSuccess('Account deleted successfully. Redirecting...');
            setTimeout(() => {
                localStorage.clear();
                window.location.href = '/login';
            }, 1500);
        } else {
            showError(data.error || 'Failed to delete account');
            closeDeleteModalHandler();
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        showError('Failed to connect to the server');
        closeDeleteModalHandler();
    } finally {
        showLoading(false);
    }
}

// Handle logout
function handleLogout() {
    localStorage.clear();
    window.location.href = '/login';
}

// Show loading spinner
function showLoading(show) {
    if (show) {
        loadingSpinner.classList.remove('hidden');
        userProfile.classList.add('hidden');
    } else {
        loadingSpinner.classList.add('hidden');
    }
}

// Show error message
function showError(message) {
    errorText.textContent = message;
    errorMessage.classList.remove('hidden');
    setTimeout(() => {
        hideError();
    }, 5000);
}

// Hide error message
function hideError() {
    errorMessage.classList.add('hidden');
}

// Show success message
function showSuccess(message) {
    successText.textContent = message;
    successMessage.classList.remove('hidden');
    setTimeout(() => {
        successMessage.classList.add('hidden');
    }, 3000);
}