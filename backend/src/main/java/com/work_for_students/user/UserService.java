package com.work_for_students.user;

import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.function.EntityResponse;

import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
public class UserService {

    private final UserRepository userRepository;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
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
        return true;//TODO: sprawdzanie czy mail jest studencki w przypadku studenta
    }

    private boolean isValidEmail(String email) {
        String regex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$";
        return Pattern.matches(regex, email);
    }

    public ResponseEntity<?> updateUser(User user) {

        Optional<User> optionalUser = userRepository.findById(user.getId());
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Błąd: Nie znaleziono użytkownika o ID: " + user.getId());
        }
        User newUser = optionalUser.get();
        if(user.getRole() == UserRole.STUDENT) {
            newUser.setName(user.getName());
            newUser.setSurname(user.getSurname());
            newUser.setCvLink(user.getCvLink());

        }else if(user.getRole() == UserRole.EMPLOYER) {
            newUser.setCompany(user.getCompany());
            newUser.setNip(user.getNip());
        }
        userRepository.save(newUser);
        return ResponseEntity.ok("Updated");
    }
}
