package com.work_for_students.auth.dto;

import com.work_for_students.user.UserRole;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {
    private String email;
    private String password;
    private UserRole userRole;

    // Pola dla Studenta
    private String name;
    private String surname;

    // Pola dla Pracodawcy
    private String companyName;
    private String nip;
}
