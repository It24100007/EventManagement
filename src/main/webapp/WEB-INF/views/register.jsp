<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Create Account - SeCrud</title>
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- FontAwesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- Custom CSS -->
    <style>
        /* Clean white background */
        body {
            background-color: #ffffff;
        }
        
        /* Card styling */
        .form-card {
            background: #ffffff;
            border: 2px solid #e5e7eb;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        
        /* Input focus effects */
        .input-focus:focus {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            border-color: #374151;
        }
        
        /* Button styling */
        .btn-primary {
            background-color: #000000;
            color: #ffffff;
            border: 2px solid #000000;
            transition: all 0.3s ease;
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
        }
        
        .btn-primary:disabled {
            background-color: #6b7280;
            border-color: #6b7280;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }
        
        /* Loading spinner */
        .loading-spinner {
            width: 20px;
            height: 20px;
            border: 2px solid transparent;
            border-top: 2px solid currentColor;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        /* Success animation */
        .success-bounce {
            animation: successBounce 0.6s ease-out;
        }
        
        @keyframes successBounce {
            0% { transform: scale(0.3); opacity: 0; }
            50% { transform: scale(1.05); }
            70% { transform: scale(0.9); }
            100% { transform: scale(1); opacity: 1; }
        }
        
        /* Error shake animation */
        .error-shake {
            animation: errorShake 0.5s ease-in-out;
        }
        
        @keyframes errorShake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        /* Custom select styling */
        select {
            background: #ffffff;
            border: 2px solid #d1d5db;
            color: #374151;
            padding: 12px 16px 12px 40px;
            border-radius: 8px;
            width: 100%;
            appearance: none;
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23374151' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
            background-position: right 12px center;
            background-repeat: no-repeat;
            background-size: 16px;
        }
        
        select:focus {
            outline: none;
            border-color: #374151;
            box-shadow: 0 0 0 3px rgba(55, 65, 81, 0.1);
        }
        
        select option {
            background: #ffffff;
            color: #374151;
        }
        
        /* Input styling */
        .form-input {
            background: #ffffff;
            border: 2px solid #d1d5db;
            color: #374151;
            transition: all 0.3s ease;
        }
        
        .form-input:focus {
            border-color: #374151;
            box-shadow: 0 0 0 3px rgba(55, 65, 81, 0.1);
        }
        
        .form-input::placeholder {
            color: #9ca3af;
        }
        
        /* Icon styling */
        .input-icon {
            color: #6b7280;
        }
        
        /* Error styling */
        .error-border {
            border-color: #ef4444 !important;
        }
        
        .error-text {
            color: #dc2626 !important;
        }
        
        .error-message {
            color: #dc2626;
        }
        
        /* Link styling */
        .link-primary {
            color: #374151;
            text-decoration: underline;
        }
        
        .link-primary:hover {
            color: #000000;
        }
    </style>
</head>
<body class="bg-white min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-md">
        <!-- Registration Form Container -->
        <div class="form-card rounded-2xl p-8 shadow-2xl">
            <!-- Header -->
            <div class="text-center mb-8">
                <div class="mb-4">
                    <i class="fas fa-user-plus text-4xl text-gray-800"></i>
                </div>
                <h1 class="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
                <p class="text-gray-600">Join us today and get started</p>
            </div>
            
            <!-- Success Message -->
            <div id="successMessage" class="hidden mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div class="flex items-center">
                    <i class="fas fa-check-circle text-green-500 mr-3"></i>
                    <span id="successText" class="text-green-800 font-medium"></span>
                </div>
            </div>
            
            <!-- Error Message -->
            <div id="errorMessage" class="hidden mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div class="flex items-center">
                    <i class="fas fa-exclamation-triangle text-red-500 mr-3"></i>
                    <span id="errorText" class="error-text font-medium"></span>
                </div>
            </div>
            
            <!-- Registration Form -->
            <form id="registerForm" class="space-y-6">
                <!-- Hidden Role Field -->
                <input type="hidden" id="role" name="role" value="user">
                
                <!-- First Name -->
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i class="fas fa-user input-icon"></i>
                    </div>
                    <input type="text" 
                           id="firstName" 
                           name="firstName" 
                           class="form-input input-focus w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none transition-all duration-300"
                           placeholder="First Name"
                           required>
                    <div class="error-message hidden mt-1 error-text text-sm">
                        <i class="fas fa-exclamation-triangle mr-1"></i>
                        <span></span>
                    </div>
                </div>
                
                <!-- Last Name -->
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i class="fas fa-user input-icon"></i>
                    </div>
                    <input type="text" 
                           id="lastName" 
                           name="lastName" 
                           class="form-input input-focus w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none transition-all duration-300"
                           placeholder="Last Name"
                           required>
                    <div class="error-message hidden mt-1 error-text text-sm">
                        <i class="fas fa-exclamation-triangle mr-1"></i>
                        <span></span>
                    </div>
                </div>
                
                <!-- Email -->
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i class="fas fa-envelope input-icon"></i>
                    </div>
                    <input type="email" 
                           id="email" 
                           name="email" 
                           class="form-input input-focus w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none transition-all duration-300"
                           placeholder="Email Address"
                           required>
                    <div class="error-message hidden mt-1 error-text text-sm">
                        <i class="fas fa-exclamation-triangle mr-1"></i>
                        <span></span>
                    </div>
                </div>
                
                <!-- Password -->
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i class="fas fa-lock input-icon"></i>
                    </div>
                    <input type="password" 
                           id="password" 
                           name="password" 
                           class="form-input input-focus w-full pl-10 pr-12 py-3 rounded-lg focus:outline-none transition-all duration-300"
                           placeholder="Password"
                           required>
                    <button type="button" 
                            id="togglePassword" 
                            class="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <i class="fas fa-eye input-icon hover:text-gray-800 transition-colors duration-200"></i>
                    </button>
                    <div class="error-message hidden mt-1 error-text text-sm">
                        <i class="fas fa-exclamation-triangle mr-1"></i>
                        <span></span>
                    </div>
                </div>
                
                <!-- Confirm Password -->
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i class="fas fa-lock input-icon"></i>
                    </div>
                    <input type="password" 
                           id="confirmPassword" 
                           name="confirmPassword" 
                           class="form-input input-focus w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none transition-all duration-300"
                           placeholder="Confirm Password"
                           required>
                    <div class="error-message hidden mt-1 error-text text-sm">
                        <i class="fas fa-exclamation-triangle mr-1"></i>
                        <span></span>
                    </div>
                </div>
                
                <!-- Gender -->
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i class="fas fa-venus-mars input-icon"></i>
                    </div>
                    <select id="gender" 
                            name="gender" 
                            required>
                        <option value="" disabled selected>Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                    <div class="error-message hidden mt-1 error-text text-sm">
                        <i class="fas fa-exclamation-triangle mr-1"></i>
                        <span></span>
                    </div>
                </div>
                
                <!-- Submit Button -->
                <button type="submit" 
                        id="submitBtn"
                        class="btn-primary w-full font-semibold py-3 px-4 rounded-lg flex items-center justify-center space-x-2">
                    <span id="submitText">Create Account</span>
                    <div id="loadingSpinner" class="loading-spinner hidden"></div>
                </button>
            </form>
            
            <!-- Login Link -->
            <div class="mt-8 text-center">
                <p class="text-gray-600">
                    Already have an account? 
                    <a href="/login" class="link-primary font-semibold hover:text-black transition-colors duration-200">
                        Sign in here
                    </a>
                </p>
            </div>
        </div>
    </div>
    
    <!-- JavaScript -->
    <script src="/js/register.js"></script>
</body>
</html>