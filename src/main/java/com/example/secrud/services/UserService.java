package com.example.secrud.services;

import com.example.secrud.models.UserModel;
import com.example.secrud.repositories.UserRepository;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.logging.Level;
import java.util.logging.Logger;

@Service
@Transactional
public class UserService {
    
    private static final Logger logger = Logger.getLogger(UserService.class.getName());
    private static final int BCRYPT_ROUNDS = 12;
    
    private final UserRepository userRepository;
    
    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    /**
     * Create a new user with encrypted password
     * @param user the user to create
     * @return the created user
     * @throws RuntimeException if user creation fails
     */
    public UserModel createUser(UserModel user) {
        try {
            // Validate required fields
            validateUserData(user);
            
            // Check if email already exists
            if (userRepository.existsByEmail(user.getEmail())) {
                throw new IllegalArgumentException("User with email " + user.getEmail() + " already exists");
            }
            
            // Hash the password before saving
            String hashedPassword = hashPassword(user.getPassword());
            user.setPassword(hashedPassword);
            
            // Normalize email to lowercase
            user.setEmail(user.getEmail().toLowerCase().trim());
            
            // Trim and capitalize names
            user.setFirstName(capitalizeFirstLetter(user.getFirstName().trim()));
            user.setLastName(capitalizeFirstLetter(user.getLastName().trim()));
            
            UserModel savedUser = userRepository.save(user);
            logger.info("User created successfully with ID: " + savedUser.getId());
            return savedUser;
            
        } catch (DataIntegrityViolationException e) {
            logger.log(Level.SEVERE, "Data integrity violation while creating user", e);
            throw new RuntimeException("Failed to create user due to data constraint violation: " + e.getMessage());
        } catch (DataAccessException e) {
            logger.log(Level.SEVERE, "Database error while creating user", e);
            throw new RuntimeException("Database error occurred while creating user: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.log(Level.WARNING, "Invalid user data: " + e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Unexpected error while creating user", e);
            throw new RuntimeException("Unexpected error occurred while creating user: " + e.getMessage());
        }
    }
    
    /**
     * Get user by ID
     * @param id the user ID
     * @return the user if found
     * @throws RuntimeException if user not found or database error occurs
     */
    @Transactional(readOnly = true)
    public UserModel getUserById(Long id) {
        try {
            if (id == null || id <= 0) {
                throw new IllegalArgumentException("Invalid user ID: " + id);
            }
            
            Optional<UserModel> user = userRepository.findById(id);
            if (user.isEmpty()) {
                throw new RuntimeException("User not found with ID: " + id);
            }
            
            return user.get();
            
        } catch (DataAccessException e) {
            logger.log(Level.SEVERE, "Database error while fetching user by ID: " + id, e);
            throw new RuntimeException("Database error occurred while fetching user: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.log(Level.WARNING, "Invalid user ID: " + id);
            throw e;
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Unexpected error while fetching user by ID: " + id, e);
            throw new RuntimeException("Unexpected error occurred while fetching user: " + e.getMessage());
        }
    }
    
    /**
     * Get user by email
     * @param email the user email
     * @return the user if found
     * @throws RuntimeException if user not found or database error occurs
     */
    @Transactional(readOnly = true)
    public UserModel getUserByEmail(String email) {
        try {
            if (email == null || email.trim().isEmpty()) {
                throw new IllegalArgumentException("Email cannot be null or empty");
            }
            
            Optional<UserModel> user = userRepository.findByEmail(email.toLowerCase().trim());
            if (user.isEmpty()) {
                throw new RuntimeException("User not found with email: " + email);
            }
            
            return user.get();
            
        } catch (DataAccessException e) {
            logger.log(Level.SEVERE, "Database error while fetching user by email: " + email, e);
            throw new RuntimeException("Database error occurred while fetching user: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.log(Level.WARNING, "Invalid email: " + email);
            throw e;
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Unexpected error while fetching user by email: " + email, e);
            throw new RuntimeException("Unexpected error occurred while fetching user: " + e.getMessage());
        }
    }
    
    /**
     * Get all users
     * @return list of all users
     * @throws RuntimeException if database error occurs
     */
    @Transactional(readOnly = true)
    public List<UserModel> getAllUsers() {
        try {
            return userRepository.findAllOrderByCreatedAtDesc();
        } catch (DataAccessException e) {
            logger.log(Level.SEVERE, "Database error while fetching all users", e);
            throw new RuntimeException("Database error occurred while fetching users: " + e.getMessage());
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Unexpected error while fetching all users", e);
            throw new RuntimeException("Unexpected error occurred while fetching users: " + e.getMessage());
        }
    }
    
    /**
     * Get users by role
     * @param role the role to search for
     * @return list of users with the specified role
     * @throws RuntimeException if database error occurs
     */
    @Transactional(readOnly = true)
    public List<UserModel> getUsersByRole(String role) {
        try {
            if (role == null || role.trim().isEmpty()) {
                throw new IllegalArgumentException("Role cannot be null or empty");
            }
            
            return userRepository.findByRole(role.trim());
            
        } catch (DataAccessException e) {
            logger.log(Level.SEVERE, "Database error while fetching users by role: " + role, e);
            throw new RuntimeException("Database error occurred while fetching users by role: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.log(Level.WARNING, "Invalid role: " + role);
            throw e;
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Unexpected error while fetching users by role: " + role, e);
            throw new RuntimeException("Unexpected error occurred while fetching users by role: " + e.getMessage());
        }
    }
    
    /**
     * Update user information
     * @param id the user ID to update
     * @param updatedUser the updated user data
     * @return the updated user
     * @throws RuntimeException if user not found or update fails
     */
    public UserModel updateUser(Long id, UserModel updatedUser) {
        try {
            if (id == null || id <= 0) {
                throw new IllegalArgumentException("Invalid user ID: " + id);
            }
            
            UserModel existingUser = getUserById(id);
            
            // Update fields if provided
            if (updatedUser.getFirstName() != null && !updatedUser.getFirstName().trim().isEmpty()) {
                existingUser.setFirstName(capitalizeFirstLetter(updatedUser.getFirstName().trim()));
            }
            
            if (updatedUser.getLastName() != null && !updatedUser.getLastName().trim().isEmpty()) {
                existingUser.setLastName(capitalizeFirstLetter(updatedUser.getLastName().trim()));
            }
            
            if (updatedUser.getEmail() != null && !updatedUser.getEmail().trim().isEmpty()) {
                String newEmail = updatedUser.getEmail().toLowerCase().trim();
                if (!existingUser.getEmail().equals(newEmail) && userRepository.existsByEmail(newEmail)) {
                    throw new IllegalArgumentException("Email " + newEmail + " is already in use");
                }
                existingUser.setEmail(newEmail);
            }
            
            if (updatedUser.getGender() != null && !updatedUser.getGender().trim().isEmpty()) {
                existingUser.setGender(updatedUser.getGender().trim());
            }
            
            if (updatedUser.getRole() != null && !updatedUser.getRole().trim().isEmpty()) {
                existingUser.setRole(updatedUser.getRole().trim());
            }
            
            // Hash new password if provided
            if (updatedUser.getPassword() != null && !updatedUser.getPassword().trim().isEmpty()) {
                String hashedPassword = hashPassword(updatedUser.getPassword());
                existingUser.setPassword(hashedPassword);
            }
            
            UserModel savedUser = userRepository.save(existingUser);
            logger.info("User updated successfully with ID: " + savedUser.getId());
            return savedUser;
            
        } catch (DataIntegrityViolationException e) {
            logger.log(Level.SEVERE, "Data integrity violation while updating user with ID: " + id, e);
            throw new RuntimeException("Failed to update user due to data constraint violation: " + e.getMessage());
        } catch (DataAccessException e) {
            logger.log(Level.SEVERE, "Database error while updating user with ID: " + id, e);
            throw new RuntimeException("Database error occurred while updating user: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.log(Level.WARNING, "Invalid data while updating user with ID: " + id + " - " + e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Unexpected error while updating user with ID: " + id, e);
            throw new RuntimeException("Unexpected error occurred while updating user: " + e.getMessage());
        }
    }
    
    /**
     * Delete user by ID
     * @param id the user ID to delete
     * @throws RuntimeException if user not found or deletion fails
     */
    public void deleteUser(Long id) {
        try {
            if (id == null || id <= 0) {
                throw new IllegalArgumentException("Invalid user ID: " + id);
            }
            
            if (!userRepository.existsById(id)) {
                throw new RuntimeException("User not found with ID: " + id);
            }
            
            userRepository.deleteById(id);
            logger.info("User deleted successfully with ID: " + id);
            
        } catch (DataAccessException e) {
            logger.log(Level.SEVERE, "Database error while deleting user with ID: " + id, e);
            throw new RuntimeException("Database error occurred while deleting user: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.log(Level.WARNING, "Invalid user ID for deletion: " + id);
            throw e;
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Unexpected error while deleting user with ID: " + id, e);
            throw new RuntimeException("Unexpected error occurred while deleting user: " + e.getMessage());
        }
    }
    
    /**
     * Authenticate user with email and password
     * @param email the user email
     * @param password the plain text password
     * @return the authenticated user
     * @throws RuntimeException if authentication fails
     */
    @Transactional(readOnly = true)
    public UserModel authenticateUser(String email, String password) {
        try {
            if (email == null || email.trim().isEmpty()) {
                throw new IllegalArgumentException("Email cannot be null or empty");
            }
            
            if (password == null || password.trim().isEmpty()) {
                throw new IllegalArgumentException("Password cannot be null or empty");
            }
            
            Optional<UserModel> userOpt = userRepository.findByEmail(email.toLowerCase().trim());
            if (userOpt.isEmpty()) {
                throw new RuntimeException("Invalid email or password");
            }
            
            UserModel user = userOpt.get();
            if (!BCrypt.checkpw(password, user.getPassword())) {
                throw new RuntimeException("Invalid email or password");
            }
            
            logger.info("User authenticated successfully: " + email);
            return user;
            
        } catch (DataAccessException e) {
            logger.log(Level.SEVERE, "Database error during authentication for email: " + email, e);
            throw new RuntimeException("Database error occurred during authentication: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.log(Level.WARNING, "Invalid authentication data: " + e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Unexpected error during authentication for email: " + email, e);
            throw new RuntimeException("Unexpected error occurred during authentication: " + e.getMessage());
        }
    }
    
    /**
     * Search users by name
     * @param name the name to search for
     * @return list of users matching the search criteria
     * @throws RuntimeException if database error occurs
     */
    @Transactional(readOnly = true)
    public List<UserModel> searchUsersByName(String name) {
        try {
            if (name == null || name.trim().isEmpty()) {
                return getAllUsers();
            }
            
            return userRepository.findByFullNameContaining(name.trim());
            
        } catch (DataAccessException e) {
            logger.log(Level.SEVERE, "Database error while searching users by name: " + name, e);
            throw new RuntimeException("Database error occurred while searching users: " + e.getMessage());
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Unexpected error while searching users by name: " + name, e);
            throw new RuntimeException("Unexpected error occurred while searching users: " + e.getMessage());
        }
    }
    
    /**
     * Check if email exists
     * @param email the email to check
     * @return true if email exists, false otherwise
     * @throws RuntimeException if database error occurs
     */
    @Transactional(readOnly = true)
    public boolean emailExists(String email) {
        try {
            if (email == null || email.trim().isEmpty()) {
                return false;
            }
            
            return userRepository.existsByEmail(email.toLowerCase().trim());
            
        } catch (DataAccessException e) {
            logger.log(Level.SEVERE, "Database error while checking email existence: " + email, e);
            throw new RuntimeException("Database error occurred while checking email: " + e.getMessage());
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Unexpected error while checking email existence: " + email, e);
            throw new RuntimeException("Unexpected error occurred while checking email: " + e.getMessage());
        }
    }
    
    // Private helper methods
    
    private void validateUserData(UserModel user) {
        if (user == null) {
            throw new IllegalArgumentException("User data cannot be null");
        }
        
        if (user.getFirstName() == null || user.getFirstName().trim().isEmpty()) {
            throw new IllegalArgumentException("First name is required");
        }
        
        if (user.getLastName() == null || user.getLastName().trim().isEmpty()) {
            throw new IllegalArgumentException("Last name is required");
        }
        
        if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }
        
        if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
            throw new IllegalArgumentException("Password is required");
        }
        
        if (user.getGender() == null || user.getGender().trim().isEmpty()) {
            throw new IllegalArgumentException("Gender is required");
        }
        
        if (user.getRole() == null || user.getRole().trim().isEmpty()) {
            throw new IllegalArgumentException("Role is required");
        }
        
        // Validate email format
        if (!isValidEmail(user.getEmail())) {
            throw new IllegalArgumentException("Invalid email format");
        }
        
        // Validate password strength
        if (user.getPassword().length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters long");
        }
    }
    
    private String hashPassword(String plainPassword) {
        try {
            return BCrypt.hashpw(plainPassword, BCrypt.gensalt(BCRYPT_ROUNDS));
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Error hashing password", e);
            throw new RuntimeException("Failed to hash password: " + e.getMessage());
        }
    }
    
    private boolean isValidEmail(String email) {
        return email != null && email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    }
    
    private String capitalizeFirstLetter(String str) {
        if (str == null || str.isEmpty()) {
            return str;
        }
        return str.substring(0, 1).toUpperCase() + str.substring(1).toLowerCase();
    }
}