package com.work_for_students.user;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;


@Entity
@Table(name = "users")
@Getter
@Setter
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "user_seq")
    @SequenceGenerator(name = "user_seq", sequenceName = "user_seq", allocationSize = 1)
    private Long id;
    private String password;
    private String name;
    private String surname;
    private UserRole role;
    private String email;
    private String company;
    @Column(length = 10)
    private String nip;
    private String cvPath;
    @Column(length = 2000)
    private String availability;

    public User() {
    }

    public User(String password,  String email, UserRole role) {
        this.password = password;
        this.email = email;
        this.role = role;
    }

    public static User createStudent(String email, String password, String name, String surname) {
        User user = new User(password, email, UserRole.STUDENT);
        user.setName(name);
        user.setSurname(surname);
        return user;
    }

    public static User createEmployer(String email, String password, String companyName, String nip) {
        User user = new User(password, email, UserRole.EMPLOYER);
        user.setCompany(companyName);
        user.setNip(nip);
        return user;
    }
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of();
    }

    @Override
    public String getUsername() {
        return this.email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return UserDetails.super.isAccountNonExpired();
    }

    @Override
    public boolean isAccountNonLocked() {
        return UserDetails.super.isAccountNonLocked();
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return UserDetails.super.isCredentialsNonExpired();
    }

    @Override
    public boolean isEnabled() {
        return UserDetails.super.isEnabled();
    }
}
