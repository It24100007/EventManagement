// API Base URL - Update this to match your backend
const API_BASE_URL = 'http://localhost:8080/api/users';

// Regex Validations
const VALIDATIONS = {
    name: {
        regex: /^[A-Za-z]{2,50}$/,
        message: 'Name must be 2-50 letters only, no spaces or special characters'
    },
    email: {
        regex: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        message: 'Please enter a valid email address'
    },
    password: {
        regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
        message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
    }
};

// DOM Elements
const loadingSpinner = document.getElementById('loadingSpinner');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const successMessage = document.getElementById('successMessage');
const successText = document.getElementById('successText');
const usersTableContainer = document.getElementById('usersTableContainer');
const usersTableBody = document.getElementById('usersTableBody');
const noUsersMessage = document.getElementById('noUsersMessage');
const adminNameText = document.getElementById('adminNameText');

// Stats Elements
const totalUsers = document.getElementById('totalUsers');
const adminCount = document.getElementById('adminCount');
const staffCount = document.getElementById('staffCount');
const userCount = document.getElementById('userCount');

// Filter Elements
const searchInput = document.getElementById('searchInput');
const roleFilter = document.getElementById('roleFilter');

// Modals
const createModal = document.getElementById('createModal');
const editModal = document.getElementById('editModal');
const deleteModal = document.getElementById('deleteModal');

// Buttons
const logoutBtn = document.getElementById('logoutBtn');
const createUserBtn = document.getElementById('createUserBtn');
const closeCreateModal = document.getElementById('closeCreateModal');
const closeEditModal = document.getElementById('closeEditModal');
const cancelCreateBtn = document.getElementById('cancelCreateBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const toggleCreatePassword = document.getElementById('toggleCreatePassword');
const toggleEditPassword = document.getElementById('toggleEditPassword');

// Forms
const createForm = document.getElementById('createForm');
const editForm = document.getElementById('editForm');

// Data
let allUsers = [];
let filteredUsers = [];
let userToDelete = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAdminAuthentication();
    loadAllUsers();
    setupEventListeners();
});

// Check if admin is authenticated
function checkAdminAuthentication() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        alert('Please login first. Add userId to localStorage for testing.');
        return false;
    }
    
    // Load admin name
    fetch(`${API_BASE_URL}/${userId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.user) {
                adminNameText.textContent = data.user.firstName + ' ' + data.user.lastName;
            }
        })
        .catch(error => console.error('Error loading admin data:', error));
    
    return true;
}

// Setup Event Listeners
function setupEventListeners() {
    logoutBtn.addEventListener('click', handleLogout);
    createUserBtn.addEventListener('click', openCreateModal);
    closeCreateModal.addEventListener('click', closeCreateModalHandler);
    closeEditModal.addEventListener('click', closeEditModalHandler);
    cancelCreateBtn.addEventListener('click', closeCreateModalHandler);
    cancelEditBtn.addEventListener('click', closeEditModalHandler);
    cancelDeleteBtn.addEventListener('click', closeDeleteModalHandler);
    confirmDeleteBtn.addEventListener('click', handleDeleteConfirm);
    
    createForm.addEventListener('submit', handleCreateUser);
    editForm.addEventListener('submit', handleUpdateUser);
    
    searchInput.addEventListener('input', filterUsers);
    roleFilter.addEventListener('change', filterUsers);
    
    toggleCreatePassword.addEventListener('click', () => togglePasswordVisibility('createPassword', toggleCreatePassword));
    toggleEditPassword.addEventListener('click', () => togglePasswordVisibility('editPassword', toggleEditPassword));
    
    // Real-time validation
    setupRealtimeValidation('create');
    setupRealtimeValidation('edit');
}

// Toggle password visibility
function togglePasswordVisibility(inputId, button) {
    const input = document.getElementById(inputId);
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Setup real-time validation
function setupRealtimeValidation(formType) {
    const firstName = document.getElementById(`${formType}FirstName`);
    const lastName = document.getElementById(`${formType}LastName`);
    const email = document.getElementById(`${formType}Email`);
    const password = document.getElementById(`${formType}Password`);
    
    firstName.addEventListener('blur', () => validateField(formType, 'FirstName', firstName.value, VALIDATIONS.name));
    lastName.addEventListener('blur', () => validateField(formType, 'LastName', lastName.value, VALIDATIONS.name));
    email.addEventListener('blur', () => validateField(formType, 'Email', email.value, VALIDATIONS.email));
    
    if (formType === 'create') {
        password.addEventListener('blur', () => validateField(formType, 'Password', password.value, VALIDATIONS.password));
    } else {
        password.addEventListener('blur', () => {
            if (password.value.trim()) {
                validateField(formType, 'Password', password.value, VALIDATIONS.password);
            } else {
                hideFieldError(formType, 'Password');
            }
        });
    }
}

// Validate single field
function validateField(formType, fieldName, value, validation) {
    const errorElement = document.getElementById(`${formType}${fieldName}Error`);
    const inputElement = document.getElementById(`${formType}${fieldName}`);
    
    if (!validation.regex.test(value)) {
        showFieldError(formType, fieldName, validation.message);
        inputElement.classList.add('border-red-500');
        inputElement.classList.remove('border-gray-300');
        return false;
    } else {
        hideFieldError(formType, fieldName);
        inputElement.classList.remove('border-red-500');
        inputElement.classList.add('border-gray-300');
        return true;
    }
}

// Show field error
function showFieldError(formType, fieldName, message) {
    const errorElement = document.getElementById(`${formType}${fieldName}Error`);
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
}

// Hide field error
function hideFieldError(formType, fieldName) {
    const errorElement = document.getElementById(`${formType}${fieldName}Error`);
    errorElement.classList.add('hidden');
}

// Validate all form fields
function validateForm(formType) {
    const firstName = document.getElementById(`${formType}FirstName`).value.trim();
    const lastName = document.getElementById(`${formType}LastName`).value.trim();
    const email = document.getElementById(`${formType}Email`).value.trim();
    const password = document.getElementById(`${formType}Password`).value.trim();
    const gender = document.getElementById(`${formType}Gender`).value;
    const role = document.getElementById(`${formType}Role`).value;
    
    let isValid = true;
    
    // Validate first name
    if (!validateField(formType, 'FirstName', firstName, VALIDATIONS.name)) {
        isValid = false;
    }
    
    // Validate last name
    if (!validateField(formType, 'LastName', lastName, VALIDATIONS.name)) {
        isValid = false;
    }
    
    // Validate email
    if (!validateField(formType, 'Email', email, VALIDATIONS.email)) {
        isValid = false;
    }
    
    // Validate password
    if (formType === 'create' || (formType === 'edit' && password)) {
        if (!validateField(formType, 'Password', password, VALIDATIONS.password)) {
            isValid = false;
        }
    }
    
    // Validate gender
    if (!gender) {
        showFieldError(formType, 'Gender', 'Please select a gender');
        isValid = false;
    } else {
        hideFieldError(formType, 'Gender');
    }
    
    // Validate role
    if (!role) {
        showFieldError(formType, 'Role', 'Please select a role');
        isValid = false;
    } else {
        hideFieldError(formType, 'Role');
    }
    
    return isValid;
}

// Load all users
async function loadAllUsers() {
    try {
        showLoading(true);
        hideError();
        
        const response = await fetch(`${API_BASE_URL}`);
        const data = await response.json();
        
        if (data.success && data.users) {
            allUsers = data.users;
            filteredUsers = [...allUsers];
            displayUsers(filteredUsers);
            updateStats(allUsers);
        } else {
            showError('Failed to load users');
        }
    } catch (error) {
        console.error('Error loading users:', error);
        showError('Failed to connect to the server');
    } finally {
        showLoading(false);
    }
}

// Display users in table
function displayUsers(users) {
    usersTableBody.innerHTML = '';
    
    if (users.length === 0) {
        usersTableContainer.classList.add('hidden');
        noUsersMessage.classList.remove('hidden');
        return;
    }
    
    usersTableContainer.classList.remove('hidden');
    noUsersMessage.classList.add('hidden');
    
    users.forEach(user => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 transition duration-200';
        
        const roleColors = {
            'admin': 'bg-red-100 text-red-800',
            'staff': 'bg-green-100 text-green-800',
            'user': 'bg-blue-100 text-blue-800',
            'guest': 'bg-gray-100 text-gray-800'
        };
        
        const roleColor = roleColors[user.role.toLowerCase()] || 'bg-gray-100 text-gray-800';
        
        row.innerHTML = `
            <td class="px-6 py-4">
                <div class="flex items-center space-x-3">
                    <div class="bg-black text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                        ${user.firstName.charAt(0)}${user.lastName.charAt(0)}
                    </div>
                    <div>
                        <p class="font-semibold text-gray-800">${user.firstName} ${user.lastName}</p>
                        <p class="text-sm text-gray-500">ID: ${user.id}</p>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4">
                <p class="text-gray-700">${user.email}</p>
            </td>
            <td class="px-6 py-4">
                <p class="text-gray-700">${user.gender}</p>
            </td>
            <td class="px-6 py-4">
                <span class="px-3 py-1 rounded-full text-sm font-semibold ${roleColor}">
                    ${user.role}
                </span>
            </td>
            <td class="px-6 py-4">
                <p class="text-gray-700 text-sm">${formatDate(user.createdAt)}</p>
            </td>
            <td class="px-6 py-4">
                <div class="flex justify-center space-x-2">
                    <button onclick="openEditModalForUser(${user.id})" 
                        class="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition duration-300 flex items-center space-x-1">
                        <i class="fas fa-edit"></i>
                        <span>Edit</span>
                    </button>
                    <button onclick="openDeleteModalForUser(${user.id}, '${user.firstName} ${user.lastName}')" 
                        class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-300 flex items-center space-x-1">
                        <i class="fas fa-trash"></i>
                        <span>Delete</span>
                    </button>
                </div>
            </td>
        `;
        
        usersTableBody.appendChild(row);
    });
}

// Update statistics
function updateStats(users) {
    totalUsers.textContent = users.length;
    
    const roleStats = {
        admin: 0,
        staff: 0,
        user: 0,
        guest: 0
    };
    
    users.forEach(user => {
        const role = user.role.toLowerCase();
        if (roleStats.hasOwnProperty(role)) {
            roleStats[role]++;
        }
    });
    
    adminCount.textContent = roleStats.admin;
    staffCount.textContent = roleStats.staff;
    userCount.textContent = roleStats.user + roleStats.guest;
}

// Filter users
function filterUsers() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const selectedRole = roleFilter.value.toLowerCase();
    
    filteredUsers = allUsers.filter(user => {
        const matchesSearch = 
            user.firstName.toLowerCase().includes(searchTerm) ||
            user.lastName.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm);
        
        const matchesRole = !selectedRole || user.role.toLowerCase() === selectedRole;
        
        return matchesSearch && matchesRole;
    });
    
    displayUsers(filteredUsers);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Open create modal
function openCreateModal() {
    createForm.reset();
    hideAllFieldErrors('create');
    createModal.classList.remove('hidden');
}

// Close create modal
function closeCreateModalHandler() {
    createModal.classList.add('hidden');
    createForm.reset();
    hideAllFieldErrors('create');
}

// Open edit modal
window.openEditModalForUser = function(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    
    document.getElementById('editUserId').value = user.id;
    document.getElementById('editFirstName').value = user.firstName;
    document.getElementById('editLastName').value = user.lastName;
    document.getElementById('editEmail').value = user.email;
    document.getElementById('editGender').value = user.gender;
    document.getElementById('editRole').value = user.role.toLowerCase();
    document.getElementById('editPassword').value = '';
    
    hideAllFieldErrors('edit');
    editModal.classList.remove('hidden');
}

// Close edit modal
function closeEditModalHandler() {
    editModal.classList.add('hidden');
    editForm.reset();
    hideAllFieldErrors('edit');
}

// Open delete modal
window.openDeleteModalForUser = function(userId, userName) {
    userToDelete = userId;
    document.getElementById('deleteUserName').textContent = userName;
    deleteModal.classList.remove('hidden');
}

// Close delete modal
function closeDeleteModalHandler() {
    deleteModal.classList.add('hidden');
    userToDelete = null;
}

// Hide all field errors
function hideAllFieldErrors(formType) {
    ['FirstName', 'LastName', 'Email', 'Password', 'Gender', 'Role'].forEach(field => {
        hideFieldError(formType, field);
        const input = document.getElementById(`${formType}${field}`);
        if (input) {
            input.classList.remove('border-red-500');
            input.classList.add('border-gray-300');
        }
    });
}

// Handle create user
async function handleCreateUser(e) {
    e.preventDefault();
    
    if (!validateForm('create')) {
        showError('Please fix all validation errors before submitting');
        return;
    }
    
    const userData = {
        firstName: document.getElementById('createFirstName').value.trim(),
        lastName: document.getElementById('createLastName').value.trim(),
        email: document.getElementById('createEmail').value.trim(),
        password: document.getElementById('createPassword').value.trim(),
        gender: document.getElementById('createGender').value,
        role: document.getElementById('createRole').value
    };
    
    try {
        showLoading(true);
        hideError();
        
        const response = await fetch(`${API_BASE_URL}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSuccess('User created successfully!');
            closeCreateModalHandler();
            await loadAllUsers();
        } else {
            showError(data.error || 'Failed to create user');
        }
    } catch (error) {
        console.error('Error creating user:', error);
        showError('Failed to connect to the server');
    } finally {
        showLoading(false);
    }
}

// Handle update user
async function handleUpdateUser(e) {
    e.preventDefault();
    
    if (!validateForm('edit')) {
        showError('Please fix all validation errors before submitting');
        return;
    }
    
    const userId = document.getElementById('editUserId').value;
    const password = document.getElementById('editPassword').value.trim();
    
    const userData = {
        firstName: document.getElementById('editFirstName').value.trim(),
        lastName: document.getElementById('editLastName').value.trim(),
        email: document.getElementById('editEmail').value.trim(),
        gender: document.getElementById('editGender').value,
        role: document.getElementById('editRole').value
    };
    
    // Only include password if it's been changed
    if (password) {
        userData.password = password;
    }
    
    try {
        showLoading(true);
        hideError();
        
        const response = await fetch(`${API_BASE_URL}/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSuccess('User updated successfully!');
            closeEditModalHandler();
            await loadAllUsers();
        } else {
            showError(data.error || 'Failed to update user');
        }
    } catch (error) {
        console.error('Error updating user:', error);
        showError('Failed to connect to the server');
    } finally {
        showLoading(false);
    }
}

// Handle delete confirm
async function handleDeleteConfirm() {
    if (!userToDelete) return;
    
    try {
        showLoading(true);
        hideError();
        
        const response = await fetch(`${API_BASE_URL}/${userToDelete}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSuccess('User deleted successfully!');
            closeDeleteModalHandler();
            await loadAllUsers();
        } else {
            showError(data.error || 'Failed to delete user');
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
    if (confirm('Are you sure you want to logout?')) {
        localStorage.clear();
        window.location.href = '/login.html';
    }
}

// Show loading
function showLoading(show) {
    if (show) {
        loadingSpinner.classList.remove('hidden');
    } else {
        loadingSpinner.classList.add('hidden');
    }
}

// Show error
function showError(message) {
    errorText.textContent = message;
    errorMessage.classList.remove('hidden');
    setTimeout(() => {
        hideError();
    }, 5000);
}

// Hide error
function hideError() {
    errorMessage.classList.add('hidden');
}

// Show success
function showSuccess(message) {
    successText.textContent = message;
    successMessage.classList.remove('hidden');
    setTimeout(() => {
        successMessage.classList.add('hidden');
    }, 3000);
}