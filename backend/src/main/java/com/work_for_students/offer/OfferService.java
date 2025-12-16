package com.work_for_students.offer;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class OfferService {
    private final OfferRepository offerRepository;

    @Autowired
    public OfferService(OfferRepository offerRepository) {
        this.offerRepository = offerRepository;
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
}
