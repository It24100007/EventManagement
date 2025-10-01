package com.example.secrud.controllers;

import com.example.secrud.models.UserModel;
import com.example.secrud.services.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {
    
    private static final Logger logger = Logger.getLogger(UserController.class.getName());
    
    private final UserService userService;
    
    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }
    
    /**
     * Create a new user
     * @param user the user data
     * @return ResponseEntity with created user or error message
     */
    @PostMapping
    public ResponseEntity<?> createUser(@Valid @RequestBody UserModel user) {
        try {
            UserModel createdUser = userService.createUser(user);
            // Remove password from response for security
            createdUser.setPassword(null);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "User created successfully");
            response.put("user", createdUser);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (IllegalArgumentException e) {
            logger.log(Level.WARNING, "Invalid user data: " + e.getMessage());
            return error("Invalid user data: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (RuntimeException e) {
            logger.log(Level.SEVERE, "Error creating user: " + e.getMessage());
            return error("Failed to create user: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Unexpected error creating user", e);
            return error("An unexpected error occurred while creating user", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Get user by ID
     * @param id the user ID
     * @return ResponseEntity with user data or error message
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            UserModel user = userService.getUserById(id);
            // Remove password from response for security
            user.setPassword(null);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("user", user);
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            logger.log(Level.WARNING, "Invalid user ID: " + e.getMessage());
            return error("Invalid user ID: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (RuntimeException e) {
            logger.log(Level.WARNING, "User not found: " + e.getMessage());
            return error("User not found: " + e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Unexpected error fetching user by ID: " + id, e);
            return error("An unexpected error occurred while fetching user", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Get user by email
     * @param email the user email
     * @return ResponseEntity with user data or error message
     */
    @GetMapping("/email/{email}")
    public ResponseEntity<?> getUserByEmail(@PathVariable String email) {
        try {
            UserModel user = userService.getUserByEmail(email);
            // Remove password from response for security
            user.setPassword(null);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("user", user);
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            logger.log(Level.WARNING, "Invalid email: " + e.getMessage());
            return error("Invalid email: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (RuntimeException e) {
            logger.log(Level.WARNING, "User not found: " + e.getMessage());
            return error("User not found: " + e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Unexpected error fetching user by email: " + email, e);
            return error("An unexpected error occurred while fetching user", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Get all users
     * @return ResponseEntity with list of users or error message
     */
    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        try {
            List<UserModel> users = userService.getAllUsers();
            // Remove passwords from response for security
            users.forEach(user -> user.setPassword(null));
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("users", users);
            response.put("count", users.size());
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            logger.log(Level.SEVERE, "Error fetching all users: " + e.getMessage());
            return error("Failed to fetch users: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Unexpected error fetching all users", e);
            return error("An unexpected error occurred while fetching users", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Get users by role
     * @param role the role to search for
     * @return ResponseEntity with list of users or error message
     */
    @GetMapping("/role/{role}")
    public ResponseEntity<?> getUsersByRole(@PathVariable String role) {
        try {
            List<UserModel> users = userService.getUsersByRole(role);
            // Remove passwords from response for security
            users.forEach(user -> user.setPassword(null));
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("users", users);
            response.put("count", users.size());
            response.put("role", role);
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            logger.log(Level.WARNING, "Invalid role: " + e.getMessage());
            return error("Invalid role: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (RuntimeException e) {
            logger.log(Level.SEVERE, "Error fetching users by role: " + e.getMessage());
            return error("Failed to fetch users by role: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Unexpected error fetching users by role: " + role, e);
            return error("An unexpected error occurred while fetching users", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Search users by name
     * @param name the name to search for
     * @return ResponseEntity with list of users or error message
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchUsers(@RequestParam(required = false) String name) {
        try {
            List<UserModel> users = userService.searchUsersByName(name);
            // Remove passwords from response for security
            users.forEach(user -> user.setPassword(null));
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("users", users);
            response.put("count", users.size());
            response.put("searchTerm", name);
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            logger.log(Level.SEVERE, "Error searching users: " + e.getMessage());
            return error("Failed to search users: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Unexpected error searching users with name: " + name, e);
            return error("An unexpected error occurred while searching users", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Update user by ID
     * @param id the user ID
     * @param updatedUser the updated user data
     * @return ResponseEntity with updated user or error message
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody UserModel updatedUser) {
        try {
            UserModel user = userService.updateUser(id, updatedUser);
            // Remove password from response for security
            user.setPassword(null);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "User updated successfully");
            response.put("user", user);
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            logger.log(Level.WARNING, "Invalid update data: " + e.getMessage());
            return error("Invalid update data: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                logger.log(Level.WARNING, "User not found for update: " + e.getMessage());
                return error("User not found: " + e.getMessage(), HttpStatus.NOT_FOUND);
            } else {
                logger.log(Level.SEVERE, "Error updating user: " + e.getMessage());
                return error("Failed to update user: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
            }
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Unexpected error updating user with ID: " + id, e);
            return error("An unexpected error occurred while updating user", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Delete user by ID
     * @param id the user ID
     * @return ResponseEntity with success message or error message
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "User deleted successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            logger.log(Level.WARNING, "Invalid user ID for deletion: " + e.getMessage());
            return error("Invalid user ID: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                logger.log(Level.WARNING, "User not found for deletion: " + e.getMessage());
                return error("User not found: " + e.getMessage(), HttpStatus.NOT_FOUND);
            } else {
                logger.log(Level.SEVERE, "Error deleting user: " + e.getMessage());
                return error("Failed to delete user: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
            }
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Unexpected error deleting user with ID: " + id, e);
            return error("An unexpected error occurred while deleting user", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Authenticate user
     * @param loginRequest the login request containing email and password
     * @return ResponseEntity with authenticated user or error message
     */
    @PostMapping("/authenticate")
    public ResponseEntity<?> authenticateUser(@RequestBody Map<String, String> loginRequest) {
        try {
            String email = loginRequest.get("email");
            String password = loginRequest.get("password");
            
            if (email == null || password == null) {
                return error("Email and password are required", HttpStatus.BAD_REQUEST);
            }
            
            UserModel user = userService.authenticateUser(email, password);
            // Remove password from response for security
            user.setPassword(null);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Authentication successful");
            response.put("user", user);
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            logger.log(Level.WARNING, "Invalid authentication data: " + e.getMessage());
            return error("Invalid authentication data: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (RuntimeException e) {
            logger.log(Level.WARNING, "Authentication failed: " + e.getMessage());
            return error("Authentication failed", HttpStatus.UNAUTHORIZED);
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Unexpected error during authentication", e);
            return error("An unexpected error occurred during authentication", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Check if email exists
     * @param email the email to check
     * @return ResponseEntity with existence status or error message
     */
    @GetMapping("/check-email/{email}")
    public ResponseEntity<?> checkEmailExists(@PathVariable String email) {
        try {
            boolean exists = userService.emailExists(email);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("exists", exists);
            response.put("email", email);
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            logger.log(Level.SEVERE, "Error checking email existence: " + e.getMessage());
            return error("Failed to check email existence: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Unexpected error checking email existence: " + email, e);
            return error("An unexpected error occurred while checking email", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Get user statistics
     * @return ResponseEntity with user statistics or error message
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getUserStats() {
        try {
            List<UserModel> allUsers = userService.getAllUsers();
            
            Map<String, Long> roleStats = new HashMap<>();
            Map<String, Long> genderStats = new HashMap<>();
            
            for (UserModel user : allUsers) {
                roleStats.put(user.getRole(), roleStats.getOrDefault(user.getRole(), 0L) + 1);
                genderStats.put(user.getGender(), genderStats.getOrDefault(user.getGender(), 0L) + 1);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("totalUsers", allUsers.size());
            response.put("roleStats", roleStats);
            response.put("genderStats", genderStats);
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            logger.log(Level.SEVERE, "Error fetching user statistics: " + e.getMessage());
            return error("Failed to fetch user statistics: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Unexpected error fetching user statistics", e);
            return error("An unexpected error occurred while fetching statistics", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Helper method to create error response
     * @param message the error message
     * @param status the HTTP status
     * @return ResponseEntity with error details
     */
    private ResponseEntity<Map<String, Object>> error(String message, HttpStatus status) {
        Map<String, Object> body = new HashMap<>();
        body.put("success", false);
        body.put("error", message);
        body.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.status(status).body(body);
    }
}