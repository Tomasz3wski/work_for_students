package com.work_for_students.user;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.mindrot.jbcrypt.BCrypt;

@Configuration
public class UserConfig {

    @Bean(name = "userCommandLineRunner")
    CommandLineRunner userCommandLineRunner(UserRepository repository) {

        return args -> {
            User user1 = new User(BCrypt.hashpw("pass1", BCrypt.gensalt()), UserRole.ADMIN, "bartek@szef.com", "Bartek B");
            User user2 = new User(BCrypt.hashpw("pass2", BCrypt.gensalt()), UserRole.EMPLOYER, "zlodziej@reply.pl", "wiadomo kto");
            User user3 = new User(BCrypt.hashpw("pass3", BCrypt.gensalt()), UserRole.STUDENT, "adas@student.polsl", "zbigniew kucharski");

            repository.save(user1);
            repository.save(user2);
            repository.save(user3);
        };
    }
}
