package com.work_for_students.user;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;


@Entity
@Table(name = "users")
@Getter
@Setter
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "user_seq")
    @SequenceGenerator(name = "user_seq", sequenceName = "user_seq", allocationSize = 1)
    private Long id;
    private String password;
    private String fullName;
    private UserRole role;
    private String email;

    public User() {
    }

    public User(String password, UserRole role, String email, String fullName) {
        this.password = password;
        this.role = role;
        this.email = email;
        this.fullName = fullName;
    }
}
