package com.example.secrud.repositories;

import com.example.secrud.models.UserModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserModel, Long> {
    
    /**
     * Find user by email address
     * @param email the email to search for
     * @return Optional containing the user if found
     */
    Optional<UserModel> findByEmail(String email);
    
    /**
     * Check if user exists by email
     * @param email the email to check
     * @return true if user exists, false otherwise
     */
    boolean existsByEmail(String email);
    
    /**
     * Find users by role
     * @param role the role to search for
     * @return list of users with the specified role
     */
    List<UserModel> findByRole(String role);
    
    /**
     * Find users by gender
     * @param gender the gender to search for
     * @return list of users with the specified gender
     */
    List<UserModel> findByGender(String gender);
    
    /**
     * Find users by first name containing (case insensitive)
     * @param firstName the first name to search for
     * @return list of users whose first name contains the search term
     */
    List<UserModel> findByFirstNameContainingIgnoreCase(String firstName);
    
    /**
     * Find users by last name containing (case insensitive)
     * @param lastName the last name to search for
     * @return list of users whose last name contains the search term
     */
    List<UserModel> findByLastNameContainingIgnoreCase(String lastName);
    
    /**
     * Find users by full name containing (case insensitive)
     * @param name the name to search for
     * @return list of users whose first or last name contains the search term
     */
    @Query("SELECT u FROM UserModel u WHERE " +
           "LOWER(CONCAT(u.firstName, ' ', u.lastName)) LIKE LOWER(CONCAT('%', :name, '%')) OR " +
           "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :name, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<UserModel> findByFullNameContaining(@Param("name") String name);
    
    /**
     * Find users by role and gender
     * @param role the role to search for
     * @param gender the gender to search for
     * @return list of users matching both criteria
     */
    List<UserModel> findByRoleAndGender(String role, String gender);
    
    /**
     * Count users by role
     * @param role the role to count
     * @return number of users with the specified role
     */
    long countByRole(String role);
    
    /**
     * Count users by gender
     * @param gender the gender to count
     * @return number of users with the specified gender
     */
    long countByGender(String gender);
    
    /**
     * Find all users ordered by creation date (newest first)
     * @return list of users ordered by creation date descending
     */
    @Query("SELECT u FROM UserModel u ORDER BY u.createdAt DESC")
    List<UserModel> findAllOrderByCreatedAtDesc();
    
    /**
     * Find all users ordered by full name
     * @return list of users ordered by first name then last name
     */
    @Query("SELECT u FROM UserModel u ORDER BY u.firstName ASC, u.lastName ASC")
    List<UserModel> findAllOrderByFullName();
}