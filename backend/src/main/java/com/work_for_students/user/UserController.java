package com.work_for_students.user;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/get")
    public List<User> getUsers(){
        return userService.getAll();
    }

    @PostMapping("/register")
    public ResponseEntity<String> addUser(@RequestBody User user) {
        return userService.addNewUser(user);
    }
}
