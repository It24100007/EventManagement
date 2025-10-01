/**
 * User Registration JavaScript
 * Handles form validation, API integration, and UI interactions
 */

class UserRegistration {
    constructor() {
        this.form = document.getElementById('registerForm');
        this.submitBtn = document.getElementById('submitBtn');
        this.submitText = document.getElementById('submitText');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.successMessage = document.getElementById('successMessage');
        this.successText = document.getElementById('successText');
        this.errorMessage = document.getElementById('errorMessage');
        this.errorText = document.getElementById('errorText');
        
        // Form fields
        this.fields = {
            firstName: document.getElementById('firstName'),
            lastName: document.getElementById('lastName'),
            email: document.getElementById('email'),
            password: document.getElementById('password'),
            confirmPassword: document.getElementById('confirmPassword'),
            gender: document.getElementById('gender'),
            role: document.getElementById('role')
        };
        
        // Validation patterns
        this.patterns = {
            name: /^[a-zA-Z\s]{2,50}$/,
            email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
        };
        
        // Validation messages
        this.messages = {
            firstName: {
                required: 'First name is required',
                invalid: 'First name must be 2-50 characters and contain only letters'
            },
            lastName: {
                required: 'Last name is required',
                invalid: 'Last name must be 2-50 characters and contain only letters'
            },
            email: {
                required: 'Email address is required',
                invalid: 'Please enter a valid email address'
            },
            password: {
                required: 'Password is required',
                invalid: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
            },
            confirmPassword: {
                required: 'Please confirm your password',
                mismatch: 'Passwords do not match'
            },
            gender: {
                required: 'Please select your gender'
            }
        };
        
        this.init();
    }
    
    /**
     * Initialize the registration form
     */
    init() {
        this.bindEvents();
        this.setupPasswordToggle();
        this.setupRealTimeValidation();
    }
    
    /**
     * Bind event listeners
     */
    bindEvents() {
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Real-time validation
        Object.keys(this.fields).forEach(fieldName => {
            if (this.fields[fieldName] && fieldName !== 'role') {
                this.fields[fieldName].addEventListener('blur', () => this.validateField(fieldName));
                this.fields[fieldName].addEventListener('input', () => this.clearFieldError(fieldName));
            }
        });
        
        // Special handling for confirm password
        this.fields.confirmPassword.addEventListener('input', () => this.validatePasswordMatch());
    }
    
    /**
     * Setup password visibility toggle
     */
    setupPasswordToggle() {
        const toggleBtn = document.getElementById('togglePassword');
        const passwordField = this.fields.password;
        
        if (toggleBtn && passwordField) {
            toggleBtn.addEventListener('click', () => {
                const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordField.setAttribute('type', type);
                
                const icon = toggleBtn.querySelector('i');
                icon.classList.toggle('fa-eye');
                icon.classList.toggle('fa-eye-slash');
            });
        }
    }
    
    /**
     * Setup real-time validation feedback
     */
    setupRealTimeValidation() {
        // Email availability check (debounced)
        let emailTimeout;
        this.fields.email.addEventListener('input', () => {
            clearTimeout(emailTimeout);
            emailTimeout = setTimeout(() => {
                if (this.validateField('email')) {
                    this.checkEmailAvailability(this.fields.email.value);
                }
            }, 500);
        });
    }
    
    /**
     * Handle form submission
     */
    async handleSubmit(e) {
        e.preventDefault();
        
        // Validate all fields
        if (!this.validateAllFields()) {
            this.showError('Please correct the errors above');
            return;
        }
        
        // Show loading state
        this.setLoadingState(true);
        
        try {
            // Prepare form data
            const formData = this.getFormData();
            
            // Submit registration
            const response = await this.submitRegistration(formData);
            
            if (response.success) {
                this.showSuccess('Account created successfully! Redirecting to login...');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                throw new Error(response.error || 'Registration failed');
            }
            
        } catch (error) {
            console.error('Registration error:', error);
            this.showError(error.message || 'An error occurred during registration');
        } finally {
            this.setLoadingState(false);
        }
    }
    
    /**
     * Validate all form fields
     */
    validateAllFields() {
        let isValid = true;
        
        // Validate each field
        Object.keys(this.fields).forEach(fieldName => {
            if (fieldName !== 'role') {
                if (!this.validateField(fieldName)) {
                    isValid = false;
                }
            }
        });
        
        // Additional password match validation
        if (!this.validatePasswordMatch()) {
            isValid = false;
        }
        
        return isValid;
    }
    
    /**
     * Validate individual field
     */
    validateField(fieldName) {
        const field = this.fields[fieldName];
        const value = field.value.trim();
        
        // Clear previous errors
        this.clearFieldError(fieldName);
        
        // Required field check
        if (!value) {
            this.showFieldError(fieldName, this.messages[fieldName].required);
            return false;
        }
        
        // Pattern validation
        switch (fieldName) {
            case 'firstName':
            case 'lastName':
                if (!this.patterns.name.test(value)) {
                    this.showFieldError(fieldName, this.messages[fieldName].invalid);
                    return false;
                }
                break;
                
            case 'email':
                if (!this.patterns.email.test(value)) {
                    this.showFieldError(fieldName, this.messages[fieldName].invalid);
                    return false;
                }
                break;
                
            case 'password':
                if (!this.patterns.password.test(value)) {
                    this.showFieldError(fieldName, this.messages[fieldName].invalid);
                    return false;
                }
                break;
                
            case 'confirmPassword':
                if (value !== this.fields.password.value) {
                    this.showFieldError(fieldName, this.messages[fieldName].mismatch);
                    return false;
                }
                break;
                
            case 'gender':
                if (!value) {
                    this.showFieldError(fieldName, this.messages[fieldName].required);
                    return false;
                }
                break;
        }
        
        return true;
    }
    
    /**
     * Validate password match
     */
    validatePasswordMatch() {
        const password = this.fields.password.value;
        const confirmPassword = this.fields.confirmPassword.value;
        
        if (confirmPassword && password !== confirmPassword) {
            this.showFieldError('confirmPassword', this.messages.confirmPassword.mismatch);
            return false;
        }
        
        this.clearFieldError('confirmPassword');
        return true;
    }
    
    /**
     * Check email availability
     */
    async checkEmailAvailability(email) {
        try {
            const response = await fetch(`/api/users/check-email/${encodeURIComponent(email)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (data.success && data.exists) {
                this.showFieldError('email', 'This email address is already registered');
                return false;
            }
            
            return true;
            
        } catch (error) {
            console.error('Email check error:', error);
            // Don't show error for email check failure
            return true;
        }
    }
    
    /**
     * Get form data
     */
    getFormData() {
        return {
            firstName: this.capitalizeFirstLetter(this.fields.firstName.value.trim()),
            lastName: this.capitalizeFirstLetter(this.fields.lastName.value.trim()),
            email: this.fields.email.value.trim().toLowerCase(),
            password: this.fields.password.value,
            gender: this.fields.gender.value.toLowerCase(),
            role: this.fields.role.value
        };
    }
    
    /**
     * Submit registration to API
     */
    async submitRegistration(formData) {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    }
    
    /**
     * Show field-specific error
     */
    showFieldError(fieldName, message) {
        const field = this.fields[fieldName];
        const errorDiv = field.parentElement.querySelector('.error-message');
        
        if (errorDiv) {
            errorDiv.querySelector('span').textContent = message;
            errorDiv.classList.remove('hidden');
            field.classList.add('border-red-500', 'error-shake');
            
            // Remove shake animation after it completes
            setTimeout(() => {
                field.classList.remove('error-shake');
            }, 500);
        }
    }
    
    /**
     * Clear field-specific error
     */
    clearFieldError(fieldName) {
        const field = this.fields[fieldName];
        const errorDiv = field.parentElement.querySelector('.error-message');
        
        if (errorDiv) {
            errorDiv.classList.add('hidden');
            field.classList.remove('border-red-500');
        }
    }
    
    /**
     * Show success message
     */
    showSuccess(message) {
        this.hideError();
        this.successText.textContent = message;
        this.successMessage.classList.remove('hidden');
        this.successMessage.classList.add('success-bounce');
        
        // Remove animation class after it completes
        setTimeout(() => {
            this.successMessage.classList.remove('success-bounce');
        }, 600);
    }
    
    /**
     * Show error message
     */
    showError(message) {
        this.hideSuccess();
        this.errorText.textContent = message;
        this.errorMessage.classList.remove('hidden');
        this.errorMessage.classList.add('error-shake');
        
        // Remove animation class after it completes
        setTimeout(() => {
            this.errorMessage.classList.remove('error-shake');
        }, 500);
    }
    
    /**
     * Hide success message
     */
    hideSuccess() {
        this.successMessage.classList.add('hidden');
    }
    
    /**
     * Hide error message
     */
    hideError() {
        this.errorMessage.classList.add('hidden');
    }
    
    /**
     * Set loading state
     */
    setLoadingState(loading) {
        if (loading) {
            this.submitBtn.disabled = true;
            this.submitText.textContent = 'Creating Account...';
            this.loadingSpinner.classList.remove('hidden');
            this.submitBtn.classList.add('opacity-75', 'cursor-not-allowed');
        } else {
            this.submitBtn.disabled = false;
            this.submitText.textContent = 'Create Account';
            this.loadingSpinner.classList.add('hidden');
            this.submitBtn.classList.remove('opacity-75', 'cursor-not-allowed');
        }
    }
    
    /**
     * Capitalize first letter of a string
     */
    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    }
}

// Initialize registration form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new UserRegistration();
});

// Additional utility functions for enhanced UX
document.addEventListener('DOMContentLoaded', () => {
    // Add focus effects to form fields
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('scale-105');
        });
        
        input.addEventListener('blur', () => {
            input.parentElement.classList.remove('scale-105');
        });
    });
    
    // Add ripple effect to submit button
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Add CSS for ripple effect
const style = document.createElement('style');
style.textContent = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);