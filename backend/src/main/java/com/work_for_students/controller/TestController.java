package com.work_for_students.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

//testowa funkcja zwracająca eloelo na endpoincie /test
@RestController
public class TestController {

    @GetMapping("/test")
    public String test() {
        return "eloelo";
    }
}
