package com.work_for_students.auth;



import com.work_for_students.auth.dto.RegisterRequest;
import com.work_for_students.user.User;
import com.work_for_students.user.UserRepository;
import com.work_for_students.user.UserRole;
import com.work_for_students.user.UserService;
import org.mindrot.jbcrypt.BCrypt; // Importujemy bibliotekę, której używasz
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final UserService userService;

    @Autowired
    public AuthService(UserRepository userRepository, UserService userService) {
        this.userRepository = userRepository;
        this.userService = userService;
    }

    // --- REJESTRACJA ---
    public ResponseEntity<String> registerUser(RegisterRequest request) {

        // Haszowanie hasła
        String salt = BCrypt.gensalt();
        String hashedPassword = BCrypt.hashpw(request.getPassword(), salt);

        // Tworzenie nowej encji
        User newUser = new User();
        newUser.setEmail(request.getEmail());
        newUser.setPassword(hashedPassword); // Zapisujemy zahaszowane hasło
        newUser.setFullName(request.getFullName());
        newUser.setRole(UserRole.STUDENT); //TODO front nie wysyla roli w body, zmienic na request.getRole pozniej

        return userService.addNewUser(newUser);
    }

    // --- LOGOWANIE ---
    public ResponseEntity<String> login(String email, String rawPassword) {
        Optional<User> userOptional = userRepository.findByEmail(email);

        // 1. Sprawdzenie istnienia użytkownika
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Błędny email lub hasło.");
        }

        User user = userOptional.get();

        // 2. Weryfikacja hasła za pomocą BCrypt
        boolean passwordMatches = BCrypt.checkpw(rawPassword, user.getPassword());

        if (!passwordMatches) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Błędny email lub hasło.");
        }

        // 3. Zwracamy token
        return ResponseEntity.ok("token-dla-" + user.getEmail());
    }
}