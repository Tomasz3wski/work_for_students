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
            requirementRepository.saveAll(Arrays.asList(req1, req2, req3));


            // Lista wymagań dla pierwszej oferty
            List<Requirement> requirementsOffer1 = Arrays.asList(req1, req2);

            // Lista wymagań dla drugiej oferty
            List<Requirement> requirementsOffer2 = Arrays.asList(req2, req3);

            // --- OFERTA 1 ---
            Offer offer1 = new Offer(
                    "6000 - 8000 PLN",
                    "Poszukujemy młodego developera do zespołu...",
                    "Prywatna opieka medyczna, karta Multisport",
                    OfferType.B2B,
                    true,
                    requirementsOffer1, // Używamy listy
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
                    requirementsOffer2, // Używamy drugiej listy
                    Arrays.asList("umiejetnosc ciecia"),
                    "Gliwice",
                    "Intern Fullstack Developer"
            );


            offerRepository.saveAll(Arrays.asList(offer1, offer2));
        };
    }
}