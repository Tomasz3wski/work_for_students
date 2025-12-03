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
    private String login;
    private String password;
    private UserRole role;
    private String email;

    public User() {
    }

    public User(String login, String password, UserRole role, String email) {
        this.login = login;
        this.password = password;
        this.role = role;
        this.email = email;
    }
}
