package com.work_for_students.user;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Configuration
public class UserConfig {

    @Bean(name = "userCommandLineRunner")
    CommandLineRunner userCommandLineRunner(UserRepository repository, BCryptPasswordEncoder passwordEncoder) {

        return args -> {
            User user1 = new User(passwordEncoder.encode("pass1"), UserRole.ADMIN, "bartek@szef.com", "Bartek B");
            User user2 = new User(passwordEncoder.encode("pass2"), UserRole.EMPLOYER, "zlodziej@reply.pl", "wiadomo kto");
            User user3 = new User(passwordEncoder.encode("pass3"), UserRole.STUDENT, "adas@student.polsl", "zbigniew kucharski");

            repository.save(user1);
            repository.save(user2);
            repository.save(user3);
        };
    }
}
