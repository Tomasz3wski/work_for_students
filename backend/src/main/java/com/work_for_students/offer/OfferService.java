package com.work_for_students.offer;

import com.work_for_students.offer.dto.OfferRequest;
import com.work_for_students.user.User;
import com.work_for_students.user.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class OfferService {
    private final OfferRepository offerRepository;
    private final UserRepository userRepository;

    @Autowired
    public OfferService(OfferRepository offerRepository, UserRepository userRepository) {
        this.offerRepository = offerRepository;
        this.userRepository = userRepository;
    }

    public List<Offer> getAll() {
        return offerRepository.findAll();
    }

    @Transactional
    public ResponseEntity<?> getById(Long id) {
        Optional<Offer> offerOptional = offerRepository.findOfferById(id);
        if(offerOptional.isEmpty()){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Ofera o podanym id nie istnieje");
        }

        return ResponseEntity.ok(offerOptional.get());
    }

    ResponseEntity<?> saveNewOffer(OfferRequest request, String userEmail) {
        Optional<User> userOptional = userRepository.findByEmail(userEmail);

        if (userOptional.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Błąd: Nie odnaleziono pracodawcy przypisanego do tego tokenu.");
        }
        User user = userOptional.get();

        Offer offer = new Offer();
        offer.setTitle(request.getTitle());
        offer.setLocation(request.getLocation());
        offer.setSalary(request.getSalary());
        offer.setDescription(request.getDescription());
        offer.setBenefits(request.getBenefits());
        offer.setContractType(request.getContractType());
        offer.setRemoteWork(request.getRemoteWork());
        offer.setGlobalRequirements(request.getGlobalRequirements());
        offer.setCustomRequirements(request.getCustomRequirements());
        offer.setCompany(user.getCompany());
        offer.setEmployer(user);

        offerRepository.save(offer);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body("Oferta firmy została pomyślnie utworzona.");
    }

    public List<Offer> getEmployerOffers(String email) {
        User employer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Pracodawca nie znaleziony"));
        return offerRepository.findAllByEmployer(employer);
    }
}
