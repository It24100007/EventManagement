<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Panel - User Management</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        body {
            background-color: white;
        }
        .modal-backdrop {
            backdrop-filter: blur(4px);
        }
    </style>
</head>
<body class="min-h-screen">
    <!-- Navigation Bar -->
    <nav class="bg-white shadow-md border-b-2 border-gray-200">
        <div class="container mx-auto px-4 py-4">
            <div class="flex justify-between items-center">
                <div class="flex items-center space-x-3">
                    <i class="fas fa-users-cog text-3xl text-gray-700"></i>
                    <h1 class="text-2xl font-bold text-gray-800">Admin Panel - User Management</h1>
                </div>
                <div class="flex items-center space-x-4">
                    <span id="adminName" class="text-gray-700 font-semibold flex items-center">
                        <i class="fas fa-user-shield mr-2"></i>
                        <span id="adminNameText">Admin</span>
                    </span>
                    <button id="logoutBtn" class="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition duration-300 flex items-center space-x-2">
                        <i class="fas fa-sign-out-alt"></i>
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </div>
    </nav>

    <!-- Main Content -->
    <div class="container mx-auto px-4 py-8">
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="bg-white rounded-lg shadow-lg border-2 border-gray-200 p-6">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-500 text-sm font-semibold">Total Users</p>
                        <p id="totalUsers" class="text-3xl font-bold text-gray-800">0</p>
                    </div>
                    <i class="fas fa-users text-4xl text-blue-500"></i>
                </div>
            </div>
            <div class="bg-white rounded-lg shadow-lg border-2 border-gray-200 p-6">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-500 text-sm font-semibold">Admins</p>
                        <p id="adminCount" class="text-3xl font-bold text-gray-800">0</p>
                    </div>
                    <i class="fas fa-user-shield text-4xl text-red-500"></i>
                </div>
            </div>
            <div class="bg-white rounded-lg shadow-lg border-2 border-gray-200 p-6">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-500 text-sm font-semibold">Staff</p>
                        <p id="staffCount" class="text-3xl font-bold text-gray-800">0</p>
                    </div>
                    <i class="fas fa-user-tie text-4xl text-green-500"></i>
                </div>
            </div>
            <div class="bg-white rounded-lg shadow-lg border-2 border-gray-200 p-6">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-500 text-sm font-semibold">Regular Users</p>
                        <p id="userCount" class="text-3xl font-bold text-gray-800">0</p>
                    </div>
                    <i class="fas fa-user text-4xl text-purple-500"></i>
                </div>
            </div>
        </div>

        <!-- Action Bar -->
        <div class="bg-white rounded-lg shadow-lg border-2 border-gray-200 p-6 mb-6">
            <div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div class="flex items-center space-x-4 w-full md:w-auto">
                    <div class="relative flex-1 md:w-96">
                        <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                        <input type="text" id="searchInput" placeholder="Search by name or email..." 
                            class="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black">
                    </div>
                    <select id="roleFilter" class="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black">
                        <option value="">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="staff">Staff</option>
                        <option value="user">User</option>
                        <option value="guest">Guest</option>
                    </select>
                </div>
                <button id="createUserBtn" class="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition duration-300 flex items-center space-x-2">
                    <i class="fas fa-plus-circle"></i>
                    <span>Create New User</span>
                </button>
            </div>
        </div>

        <!-- Loading Spinner -->
        <div id="loadingSpinner" class="flex justify-center items-center py-20">
            <i class="fas fa-spinner fa-spin text-5xl text-gray-700"></i>
        </div>

        <!-- Error Message -->
        <div id="errorMessage" class="hidden bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <div class="flex items-center">
                <i class="fas fa-exclamation-circle mr-3"></i>
                <span id="errorText"></span>
            </div>
        </div>

        <!-- Success Message -->
        <div id="successMessage" class="hidden bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6" role="alert">
            <div class="flex items-center">
                <i class="fas fa-check-circle mr-3"></i>
                <span id="successText"></span>
            </div>
        </div>

        <!-- Users Table -->
        <div id="usersTableContainer" class="hidden bg-white rounded-lg shadow-lg border-2 border-gray-200 overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-100 border-b-2 border-gray-200">
                        <tr>
                            <th class="px-6 py-4 text-left text-sm font-bold text-gray-700">
                                <i class="fas fa-user mr-2"></i>User
                            </th>
                            <th class="px-6 py-4 text-left text-sm font-bold text-gray-700">
                                <i class="fas fa-envelope mr-2"></i>Email
                            </th>
                            <th class="px-6 py-4 text-left text-sm font-bold text-gray-700">
                                <i class="fas fa-venus-mars mr-2"></i>Gender
                            </th>
                            <th class="px-6 py-4 text-left text-sm font-bold text-gray-700">
                                <i class="fas fa-user-tag mr-2"></i>Role
                            </th>
                            <th class="px-6 py-4 text-left text-sm font-bold text-gray-700">
                                <i class="fas fa-calendar mr-2"></i>Created
                            </th>
                            <th class="px-6 py-4 text-center text-sm font-bold text-gray-700">
                                <i class="fas fa-cog mr-2"></i>Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody id="usersTableBody" class="divide-y divide-gray-200">
                        <!-- Users will be populated here -->
                    </tbody>
                </table>
            </div>
        </div>

        <!-- No Users Message -->
        <div id="noUsersMessage" class="hidden text-center py-20">
            <i class="fas fa-users-slash text-6xl text-gray-300 mb-4"></i>
            <p class="text-gray-500 text-xl">No users found</p>
        </div>
    </div>

    <!-- Create User Modal -->
    <div id="createModal" class="hidden fixed inset-0 bg-black bg-opacity-50 modal-backdrop flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div class="sticky top-0 bg-white border-b-2 border-gray-200 px-8 py-6">
                <div class="flex justify-between items-center">
                    <h3 class="text-2xl font-bold text-gray-800 flex items-center">
                        <i class="fas fa-user-plus mr-3"></i>
                        Create New User
                    </h3>
                    <button id="closeCreateModal" class="text-gray-500 hover:text-gray-700 text-2xl">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <form id="createForm" class="p-8">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-gray-700 font-semibold mb-2">
                            <i class="fas fa-user mr-2"></i>First Name <span class="text-red-500">*</span>
                        </label>
                        <input type="text" id="createFirstName" required 
                            class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black"
                            placeholder="Enter first name">
                        <p class="text-red-500 text-sm mt-1 hidden" id="createFirstNameError"></p>
                    </div>
                    <div>
                        <label class="block text-gray-700 font-semibold mb-2">
                            <i class="fas fa-user mr-2"></i>Last Name <span class="text-red-500">*</span>
                        </label>
                        <input type="text" id="createLastName" required 
                            class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black"
                            placeholder="Enter last name">
                        <p class="text-red-500 text-sm mt-1 hidden" id="createLastNameError"></p>
                    </div>
                </div>
                <div class="mt-6">
                    <label class="block text-gray-700 font-semibold mb-2">
                        <i class="fas fa-envelope mr-2"></i>Email Address <span class="text-red-500">*</span>
                    </label>
                    <input type="email" id="createEmail" required 
                        class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black"
                        placeholder="user@example.com">
                    <p class="text-red-500 text-sm mt-1 hidden" id="createEmailError"></p>
                </div>
                <div class="mt-6">
                    <label class="block text-gray-700 font-semibold mb-2">
                        <i class="fas fa-lock mr-2"></i>Password <span class="text-red-500">*</span>
                    </label>
                    <div class="relative">
                        <input type="password" id="createPassword" required 
                            class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black pr-12"
                            placeholder="Minimum 8 characters">
                        <button type="button" id="toggleCreatePassword" class="absolute right-3 top-3 text-gray-500 hover:text-gray-700">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                    <p class="text-gray-500 text-xs mt-1">Must be at least 8 characters with uppercase, lowercase, number, and special character</p>
                    <p class="text-red-500 text-sm mt-1 hidden" id="createPasswordError"></p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                        <label class="block text-gray-700 font-semibold mb-2">
                            <i class="fas fa-venus-mars mr-2"></i>Gender <span class="text-red-500">*</span>
                        </label>
                        <select id="createGender" required 
                            class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black">
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                        <p class="text-red-500 text-sm mt-1 hidden" id="createGenderError"></p>
                    </div>
                    <div>
                        <label class="block text-gray-700 font-semibold mb-2">
                            <i class="fas fa-user-tag mr-2"></i>Role <span class="text-red-500">*</span>
                        </label>
                        <select id="createRole" required 
                            class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black">
                            <option value="">Select Role</option>
                            <option value="admin">Admin</option>
                            <option value="staff">Staff</option>
                            <option value="user">User</option>
                            <option value="guest">Guest</option>
                        </select>
                        <p class="text-red-500 text-sm mt-1 hidden" id="createRoleError"></p>
                    </div>
                </div>
                <div class="flex justify-end space-x-3 mt-8 pt-6 border-t-2 border-gray-200">
                    <button type="button" id="cancelCreateBtn" 
                        class="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition duration-300">
                        <i class="fas fa-times mr-2"></i>Cancel
                    </button>
                    <button type="submit" 
                        class="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition duration-300 flex items-center space-x-2">
                        <i class="fas fa-user-plus"></i>
                        <span>Create User</span>
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Edit User Modal -->
    <div id="editModal" class="hidden fixed inset-0 bg-black bg-opacity-50 modal-backdrop flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div class="sticky top-0 bg-white border-b-2 border-gray-200 px-8 py-6">
                <div class="flex justify-between items-center">
                    <h3 class="text-2xl font-bold text-gray-800 flex items-center">
                        <i class="fas fa-user-edit mr-3"></i>
                        Edit User
                    </h3>
                    <button id="closeEditModal" class="text-gray-500 hover:text-gray-700 text-2xl">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <form id="editForm" class="p-8">
                <input type="hidden" id="editUserId">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-gray-700 font-semibold mb-2">
                            <i class="fas fa-user mr-2"></i>First Name <span class="text-red-500">*</span>
                        </label>
                        <input type="text" id="editFirstName" required 
                            class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black"
                            placeholder="Enter first name">
                        <p class="text-red-500 text-sm mt-1 hidden" id="editFirstNameError"></p>
                    </div>
                    <div>
                        <label class="block text-gray-700 font-semibold mb-2">
                            <i class="fas fa-user mr-2"></i>Last Name <span class="text-red-500">*</span>
                        </label>
                        <input type="text" id="editLastName" required 
                            class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black"
                            placeholder="Enter last name">
                        <p class="text-red-500 text-sm mt-1 hidden" id="editLastNameError"></p>
                    </div>
                </div>
                <div class="mt-6">
                    <label class="block text-gray-700 font-semibold mb-2">
                        <i class="fas fa-envelope mr-2"></i>Email Address <span class="text-red-500">*</span>
                    </label>
                    <input type="email" id="editEmail" required 
                        class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black"
                        placeholder="user@example.com">
                    <p class="text-red-500 text-sm mt-1 hidden" id="editEmailError"></p>
                </div>
                <div class="mt-6">
                    <label class="block text-gray-700 font-semibold mb-2">
                        <i class="fas fa-lock mr-2"></i>New Password (leave blank to keep current)
                    </label>
                    <div class="relative">
                        <input type="password" id="editPassword" 
                            class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black pr-12"
                            placeholder="Enter new password">
                        <button type="button" id="toggleEditPassword" class="absolute right-3 top-3 text-gray-500 hover:text-gray-700">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                    <p class="text-gray-500 text-xs mt-1">Must be at least 8 characters with uppercase, lowercase, number, and special character</p>
                    <p class="text-red-500 text-sm mt-1 hidden" id="editPasswordError"></p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                        <label class="block text-gray-700 font-semibold mb-2">
                            <i class="fas fa-venus-mars mr-2"></i>Gender <span class="text-red-500">*</span>
                        </label>
                        <select id="editGender" required 
                            class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black">
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                        <p class="text-red-500 text-sm mt-1 hidden" id="editGenderError"></p>
                    </div>
                    <div>
                        <label class="block text-gray-700 font-semibold mb-2">
                            <i class="fas fa-user-tag mr-2"></i>Role <span class="text-red-500">*</span>
                        </label>
                        <select id="editRole" required 
                            class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black">
                            <option value="">Select Role</option>
                            <option value="admin">Admin</option>
                            <option value="staff">Staff</option>
                            <option value="user">User</option>
                            <option value="guest">Guest</option>
                        </select>
                        <p class="text-red-500 text-sm mt-1 hidden" id="editRoleError"></p>
                    </div>
                </div>
                <div class="flex justify-end space-x-3 mt-8 pt-6 border-t-2 border-gray-200">
                    <button type="button" id="cancelEditBtn" 
                        class="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition duration-300">
                        <i class="fas fa-times mr-2"></i>Cancel
                    </button>
                    <button type="submit" 
                        class="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition duration-300 flex items-center space-x-2">
                        <i class="fas fa-save"></i>
                        <span>Update User</span>
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div id="deleteModal" class="hidden fixed inset-0 bg-black bg-opacity-50 modal-backdrop flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-2xl w-full max-w-md">
            <div class="p-8">
                <div class="text-center mb-6">
                    <i class="fas fa-exclamation-triangle text-6xl text-red-600 mb-4"></i>
                    <h3 class="text-2xl font-bold text-gray-800 mb-2">Delete User</h3>
                    <p class="text-gray-600">Are you sure you want to delete <strong id="deleteUserName"></strong>?</p>
                    <p class="text-red-600 text-sm mt-2">This action cannot be undone.</p>
                </div>
                <div class="flex justify-center space-x-3">
                    <button id="cancelDeleteBtn" 
                        class="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition duration-300">
                        <i class="fas fa-times mr-2"></i>Cancel
                    </button>
                    <button id="confirmDeleteBtn" 
                        class="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition duration-300 flex items-center space-x-2">
                        <i class="fas fa-trash"></i>
                        <span>Delete User</span>
                    </button>
                </div>
            </div>
        </div>
    </div>

    <script src="/js/user_list.js"></script>
</body>
</html>