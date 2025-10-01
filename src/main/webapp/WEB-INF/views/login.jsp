<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - SeCrud</title>
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- FontAwesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <style>
        /* Custom Styles */
        .form-card {
            background: white;
            border: 1px solid #e5e7eb;
        }
        
        .form-input {
            background: white;
            border: 2px solid #e5e7eb;
            color: #1f2937;
        }
        
        .form-input::placeholder {
            color: #9ca3af;
        }
        
        .input-focus:focus {
            border-color: #374151;
            box-shadow: 0 0 0 3px rgba(55, 65, 81, 0.1);
        }
        
        .input-icon {
            color: #6b7280;
        }
        
        .btn-primary {
            background: #000000;
            color: white;
            transition: all 0.3s ease;
        }
        
        .btn-primary:hover {
            background: #374151;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .link-primary {
            color: #374151;
        }
        
        .error-text {
            color: #dc2626 !important;
        }
        
        .error-message {
            color: #dc2626;
        }
        
        .loading-spinner {
            width: 20px;
            height: 20px;
            border: 2px solid transparent;
            border-top: 2px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .slide-up {
            animation: slideUp 0.6s ease-out;
        }
        
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .fade-in {
            animation: fadeIn 0.5s ease-in;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
    </style>
</head>
<body class="bg-white min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-md">
        <!-- Login Form Container -->
        <div class="form-card rounded-2xl p-8 shadow-2xl slide-up">
            <!-- Header -->
            <div class="text-center mb-8">
                <div class="mb-4">
                    <i class="fas fa-sign-in-alt text-4xl text-gray-800"></i>
                </div>
                <h1 class="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                <p class="text-gray-600">Sign in to your account</p>
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
            
            <!-- Login Form -->
            <form id="loginForm" class="space-y-6">
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
                
                <!-- Remember Me & Forgot Password -->
                <div class="flex items-center justify-between">
                    <label class="flex items-center">
                        <input type="checkbox" id="rememberMe" class="rounded border-gray-300 text-black focus:ring-black">
                        <span class="ml-2 text-sm text-gray-600">Remember me</span>
                    </label>
                    <a href="#" class="text-sm link-primary hover:text-black transition-colors duration-200">
                        Forgot password?
                    </a>
                </div>
                
                <!-- Submit Button -->
                <button type="submit" 
                        id="submitBtn"
                        class="btn-primary w-full font-semibold py-3 px-4 rounded-lg flex items-center justify-center space-x-2">
                    <span id="submitText">Sign In</span>
                    <div id="loadingSpinner" class="loading-spinner hidden"></div>
                </button>
            </form>
            
            <!-- Register Link -->
            <div class="mt-8 text-center">
                <p class="text-gray-600">
                    Don't have an account? 
                    <a href="/register" class="link-primary font-semibold hover:text-black transition-colors duration-200">
                        Create one here
                    </a>
                </p>
            </div>
        </div>
    </div>
    
    <!-- JavaScript -->
    <script src="/js/login.js"></script>
</body>
</html>