package com.work_for_students.config;

import com.work_for_students.offer.Offer;
import com.work_for_students.offer.OfferRepository;
import com.work_for_students.offer.OfferType; // Pamiętaj o imporcie OfferType
import com.work_for_students.requirements.Requirement;
import com.work_for_students.requirements.RequirementRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.List;

@Configuration
public class InitialDataConfig {

    @Bean
    CommandLineRunner initialDataLoader(
            RequirementRepository requirementRepository,
            OfferRepository offerRepository) {

        return args -> {

            Requirement req1 = new Requirement("Java");
            Requirement req2 = new Requirement("React");
            Requirement req3 = new Requirement("Postgres");
            Requirement req4 = new Requirement("Linux");
            Requirement req5 = new Requirement("Windows");
            Requirement req6 = new Requirement("Git");
            Requirement req7 = new Requirement("Responsibility");
            Requirement req8 = new Requirement("SQL");
            Requirement req9 = new Requirement("C/C++");
            requirementRepository.saveAll(Arrays.asList(req1, req2, req3, req4, req5, req6, req7, req8, req9));

            List<Requirement> requirementsOffer1 = Arrays.asList(req1, req2, req7);

            List<Requirement> requirementsOffer2 = Arrays.asList(req2, req3);
            List<Requirement> requirementsOffer3 = Arrays.asList(req9, req7, req4);
            List<Requirement> requirementsOffer4 = Arrays.asList(req6, req8);


            // --- OFERTA 1 ---
            Offer offer1 = new Offer(
                    "6000 - 8000 PLN",
                    "Poszukujemy młodego developera do zespołu...",
                    "Prywatna opieka medyczna, karta Multisport",
                    OfferType.B2B,
                    true,
                    requirementsOffer1,
                    Arrays.asList("Umiejętność picia kawy", "Chęć nauki"),
                    "Kraków",
                    "Junior Java/React Dev"
            );

            // --- OFERTA 2 ---
            Offer offer2 = new Offer(
                    "5000 - 7000 PLN",
                    "Testtesttest",
                    "Owocowe czwartki",
                    OfferType.Freelance,
                    false,
                    requirementsOffer2,
                    Arrays.asList("umiejetnosc cięcia"),
                    "Gliwice",
                    "Intern Fullstack Developer"
            );

            // --- OFERTA 3 ---
            Offer offer3 = new Offer(
                    "6000 - 9500 PLN",
                    "jakis dlugi opis stanowiska",
                    "Owocowe czwartki",
                    OfferType.Freelance,
                    false,
                    requirementsOffer3,
                    Arrays.asList("pomyslowosc"),
                    "Katowice",
                    "Embedded Engineer Intern"
            );

            // --- OFERTA 4 ---
            Offer offer4 = new Offer(
                    "12000 - 16000 PLN",
                    "jakis dlugi opis stanowiska",
                    "Owocowe czwartki",
                    OfferType.Contract_of_Employement,
                    true,
                    requirementsOffer4,
                    Arrays.asList("wytrwalosc"),
                    "Katowice",
                    "Senior Data Engineer"
            );


            offerRepository.saveAll(Arrays.asList(offer1, offer2, offer3, offer4));
        };
    }
}