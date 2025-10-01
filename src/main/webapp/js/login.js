/**
 * User Login Management System
 * Handles form validation, API integration, localStorage, and navigation
 */
class UserLogin {
    constructor() {
        this.form = document.getElementById('loginForm');
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.rememberMeInput = document.getElementById('rememberMe');
        this.submitBtn = document.getElementById('submitBtn');
        this.submitText = document.getElementById('submitText');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.togglePasswordBtn = document.getElementById('togglePassword');
        
        // Message elements
        this.successMessage = document.getElementById('successMessage');
        this.successText = document.getElementById('successText');
        this.errorMessage = document.getElementById('errorMessage');
        this.errorText = document.getElementById('errorText');
        
        // Validation patterns
        this.emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        
        // Debounce timer
        this.validationTimer = null;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.loadRememberedCredentials();
    }
    
    bindEvents() {
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Real-time validation
        this.emailInput.addEventListener('input', () => this.debounceValidation('email'));
        this.passwordInput.addEventListener('input', () => this.debounceValidation('password'));
        
        // Password visibility toggle
        this.togglePasswordBtn.addEventListener('click', () => this.togglePasswordVisibility());
        
        // Focus effects
        this.emailInput.addEventListener('focus', () => this.addFocusEffect(this.emailInput));
        this.passwordInput.addEventListener('focus', () => this.addFocusEffect(this.passwordInput));
        
        this.emailInput.addEventListener('blur', () => this.removeFocusEffect(this.emailInput));
        this.passwordInput.addEventListener('blur', () => this.removeFocusEffect(this.passwordInput));
        
        // Enter key handling
        this.emailInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.passwordInput.focus();
            }
        });
        
        this.passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSubmit(e);
            }
        });
    }
    
    debounceValidation(field) {
        clearTimeout(this.validationTimer);
        this.validationTimer = setTimeout(() => {
            this.validateField(field);
        }, 300);
    }
    
    validateField(field) {
        switch (field) {
            case 'email':
                return this.validateEmail();
            case 'password':
                return this.validatePassword();
            default:
                return false;
        }
    }
    
    validateEmail() {
        const email = this.emailInput.value.trim();
        const errorElement = this.emailInput.parentElement.querySelector('.error-message');
        const errorSpan = errorElement.querySelector('span');
        
        if (!email) {
            this.showFieldError(errorElement, errorSpan, 'Email is required');
            return false;
        }
        
        if (!this.emailPattern.test(email)) {
            this.showFieldError(errorElement, errorSpan, 'Please enter a valid email address');
            return false;
        }
        
        this.hideFieldError(errorElement);
        return true;
    }
    
    validatePassword() {
        const password = this.passwordInput.value;
        const errorElement = this.passwordInput.parentElement.querySelector('.error-message');
        const errorSpan = errorElement.querySelector('span');
        
        if (!password) {
            this.showFieldError(errorElement, errorSpan, 'Password is required');
            return false;
        }
        
        if (password.length < 6) {
            this.showFieldError(errorElement, errorSpan, 'Password must be at least 6 characters');
            return false;
        }
        
        this.hideFieldError(errorElement);
        return true;
    }
    
    showFieldError(errorElement, errorSpan, message) {
        errorSpan.textContent = message;
        errorElement.classList.remove('hidden');
        errorElement.classList.add('fade-in');
    }
    
    hideFieldError(errorElement) {
        errorElement.classList.add('hidden');
        errorElement.classList.remove('fade-in');
    }
    
    validateForm() {
        const isEmailValid = this.validateEmail();
        const isPasswordValid = this.validatePassword();
        
        return isEmailValid && isPasswordValid;
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        // Hide any existing messages
        this.hideMessages();
        
        // Validate form
        if (!this.validateForm()) {
            this.showError('Please fix the errors above');
            return;
        }
        
        // Show loading state
        this.setLoadingState(true);
        
        try {
            const formData = {
                email: this.emailInput.value.trim().toLowerCase(),
                password: this.passwordInput.value
            };
            
            const response = await this.authenticateUser(formData);
            
            if (response.success) {
                await this.handleLoginSuccess(response.user);
            } else {
                this.handleLoginError(response.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.handleLoginError('Network error. Please check your connection and try again.');
        } finally {
            this.setLoadingState(false);
        }
    }
    
    async authenticateUser(credentials) {
        try {
            const response = await fetch('/api/users/authenticate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                return {
                    success: true,
                    user: data
                };
            } else {
                return {
                    success: false,
                    message: data.message || 'Authentication failed'
                };
            }
        } catch (error) {
            throw new Error('Network error during authentication');
        }
    }
    
    async handleLoginSuccess(user) {
        // Store user data in localStorage
        this.storeUserData(user.user);
        
        // Handle remember me functionality
        if (this.rememberMeInput.checked) {
            this.storeRememberMeData();
        } else {
            this.clearRememberMeData();
        }
        
        // Show success message
        this.showSuccess('Login successful! Redirecting to your profile...');
        
        // Add success animation
        this.form.classList.add('fade-in');
        
        // Redirect to profile after a short delay
        setTimeout(() => {
            window.location.href = '/profile';
        }, 1500);
    }
    
    handleLoginError(message) {
        this.showError(message);
        
        // Clear password field for security
        this.passwordInput.value = '';
        
        // Focus on email field
        this.emailInput.focus();
        
        // Add shake animation to form
        this.form.classList.add('animate-pulse');
        setTimeout(() => {
            this.form.classList.remove('animate-pulse');
        }, 500);
    }
    
        storeUserData(user) {
        try {
            // Store essential user data (excluding sensitive information)
            const userData = {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                gender: user.gender,
                loginTime: new Date().toISOString()
            };
            localStorage.setItem("userId",user.id);
            localStorage.setItem('userData', JSON.stringify(userData));
            localStorage.setItem('isLoggedIn', 'true');
            
            console.log('User data stored successfully');
        } catch (error) {
            console.error('Error storing user data:', error);
        }
    }
    
    storeRememberMeData() {
        try {
            const rememberData = {
                email: this.emailInput.value.trim(),
                rememberMe: true
            };
            localStorage.setItem('rememberMe', JSON.stringify(rememberData));
        } catch (error) {
            console.error('Error storing remember me data:', error);
        }
    }
    
    clearRememberMeData() {
        try {
            localStorage.removeItem('rememberMe');
        } catch (error) {
            console.error('Error clearing remember me data:', error);
        }
    }
    
    loadRememberedCredentials() {
        try {
            const rememberData = localStorage.getItem('rememberMe');
            if (rememberData) {
                const data = JSON.parse(rememberData);
                if (data.rememberMe && data.email) {
                    this.emailInput.value = data.email;
                    this.rememberMeInput.checked = true;
                }
            }
        } catch (error) {
            console.error('Error loading remembered credentials:', error);
        }
    }
    
    togglePasswordVisibility() {
        const type = this.passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        this.passwordInput.setAttribute('type', type);
        
        const icon = this.togglePasswordBtn.querySelector('i');
        if (type === 'text') {
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }
    
    addFocusEffect(input) {
        input.parentElement.classList.add('ring-2', 'ring-gray-300');
    }
    
    removeFocusEffect(input) {
        input.parentElement.classList.remove('ring-2', 'ring-gray-300');
    }
    
    setLoadingState(isLoading) {
        if (isLoading) {
            this.submitBtn.disabled = true;
            this.submitText.textContent = 'Signing In...';
            this.loadingSpinner.classList.remove('hidden');
            this.submitBtn.classList.add('opacity-75');
        } else {
            this.submitBtn.disabled = false;
            this.submitText.textContent = 'Sign In';
            this.loadingSpinner.classList.add('hidden');
            this.submitBtn.classList.remove('opacity-75');
        }
    }
    
    showSuccess(message) {
        this.hideMessages();
        this.successText.textContent = message;
        this.successMessage.classList.remove('hidden');
        this.successMessage.classList.add('fade-in');
    }
    
    showError(message) {
        this.hideMessages();
        this.errorText.textContent = message;
        this.errorMessage.classList.remove('hidden');
        this.errorMessage.classList.add('fade-in');
    }
    
    hideMessages() {
        this.successMessage.classList.add('hidden');
        this.errorMessage.classList.add('hidden');
        this.successMessage.classList.remove('fade-in');
        this.errorMessage.classList.remove('fade-in');
    }
    
    // Utility method to check if user is logged in
    static isUserLoggedIn() {
        try {
            return localStorage.getItem('isLoggedIn') === 'true';
        } catch (error) {
            return false;
        }
    }
    
    // Utility method to get user data
    static getUserData() {
        try {
            const userData = localStorage.getItem('userData');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            return null;
        }
    }
    
    // Utility method to logout user
    static logout() {
        try {
            localStorage.removeItem('userData');
            localStorage.removeItem('isLoggedIn');
            window.location.href = '/login';
        } catch (error) {
            console.error('Error during logout:', error);
        }
    }
}

// Initialize login system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {

    
    // Initialize login form
    new UserLogin();
});

// Export for use in other modules
window.UserLogin = UserLogin;