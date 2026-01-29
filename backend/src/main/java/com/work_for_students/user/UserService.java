package com.work_for_students.user;

import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.function.EntityResponse;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final String UPLOAD_DIR;

    @Autowired
    public UserService(UserRepository userRepository, @Value("${file.upload-dir}") String UPLOAD_DIR) {
        this.userRepository = userRepository;
        this.UPLOAD_DIR = UPLOAD_DIR;
    }

    public List<User> getAll() {
        return userRepository.findAll();
    }

    public ResponseEntity<String> addNewUser(User user) {
        if(userRepository.existsByEmail(user.getEmail())){
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Istnieje użytkownik z podanym mailem");
        }
        if(!isValidEmail(user.getEmail())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("niepoprawny format emaila");
        }
        if(user.getRole()==UserRole.STUDENT && !checkIfStudent(user.getEmail())){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("w celu założenia konta studenckiego proszę o podanie emaila uczelnianego");
        }
        userRepository.save(user);
        return ResponseEntity.ok("Dodano");
    }


    private boolean checkIfStudent(String email) {
        if (email == null || !email.contains("@")) {
            return false;
        }

        // Mini "baza" akceptowalnych końcówek
        List<String> studentDomains = Arrays.asList(
                "@student.uw.edu.pl",
                "@student.pwr.edu.pl",
                "@student.uj.edu.pl",
                "@edu.pl",
                "@student.agh.edu.pl",
                "@student.polsl.pl"
        );

        for (String domain : studentDomains) {
            if (email.toLowerCase().endsWith(domain)) {
                return true;
            }
        }

        return false;
    }

    private boolean isValidEmail(String email) {
        String regex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$";
        return Pattern.matches(regex, email);
    }

    public ResponseEntity<?> updateUser(User user, MultipartFile file) {
        Optional<User> optionalUser = userRepository.findById(user.getId());

        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Błąd: Nie znaleziono użytkownika o ID: " + user.getId());
        }
        User newUser = optionalUser.get();
        if(user.getRole() == UserRole.STUDENT) {
            newUser.setName(user.getName());
            newUser.setSurname(user.getSurname());
            if (user.getAvailability() != null) {
                newUser.setAvailability(user.getAvailability());
            }        }else if(user.getRole() == UserRole.EMPLOYER) {
            newUser.setCompany(user.getCompany());
            newUser.setNip(user.getNip());
        }

        if (file != null && !file.isEmpty()) {
            try {
                File directory = new File(UPLOAD_DIR);
                if (!directory.exists()) {
                    directory.mkdirs();
                }
                if (newUser.getCvPath() != null && !newUser.getCvPath().isEmpty()) {
                    try {
                        Path oldPath = Paths.get(newUser.getCvPath());
                        Files.deleteIfExists(oldPath);
                    } catch (IOException e) {
                        System.err.println("Nie udało się usunąć starego CV: " + e.getMessage());
                        // Nie przerywamy procesu, tylko logujemy błąd
                    }
                }

                // Unikalna nazwa pliku: ID_Nazwa
                String fileName = newUser.getId() + "_" + file.getOriginalFilename();
                Path path = Paths.get(UPLOAD_DIR + fileName);
                Files.write(path, file.getBytes());

                // Zapisujemy ścieżkę w bazie
                newUser.setCvPath(path.toString());

            } catch (IOException e) {
                e.printStackTrace();
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Błąd zapisu pliku: " + e.getMessage());
            }
        }
        userRepository.save(newUser);
        return ResponseEntity.ok("Updated");
    }


    public ResponseEntity<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
